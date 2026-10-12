/**
 * Preview Query Adapter.
 *
 * player.execute() returns command success/failure but does not expose textual
 * output for some valid Bedrock/Education commands. This adapter provides
 * Preview-only feedback without changing the AST or Compiler grammar.
 *
 * First implementation: TAG list.
 * - TAG add/remove remain normal DIRECT commands.
 * - The Preview observes their tag names as the session's known tag vocabulary.
 * - TAG list snapshots the original selector with opaque _cbi_ internal tags,
 *   then asks Minecraft itself which marked entities currently have each known
 *   user tag.
 * - This preserves @p/@r/count selector selection because the original target is
 *   marked once before per-tag checks.
 * - Output is SESSION_KNOWN: tags not referenced through this extension in the
 *   current Preview session may be absent from the displayed list.
 */
namespace MCFunctionPreview {
    let previewQueryBusy = false;

    /**
     * Observe successfully validated structured commands after runtime execution.
     * This records authored tag vocabulary; it does not replace Minecraft state.
     */
    export function observeCommand(
        command: MCFunctionAST.CommandNode,
        success: boolean
    ): void {
        // Only successful world changes are recorded, never mere attempts.
        if (command.kind == MCFunctionAST.CommandKind.Gamerule) {
            if (!success) return;
            let rule = <MCFunctionAST.GameRuleCommand>command;
            let value = "";
            if (rule.action == MCFunctionAST.GameRuleAction.SetBoolean) {
                value = rule.booleanValue ? "true" : "false";
            } else if (rule.action == MCFunctionAST.GameRuleAction.SetInteger) {
                value = "" + rule.integerValue;
            } else if (rule.action == MCFunctionAST.GameRuleAction.SetEnum) {
                value = rule.enumValue;
            }
            if (value.length > 0) rememberSuccessfulGameRuleSet(rule.ruleId, value);
            return;
        }

        if (command.kind != MCFunctionAST.CommandKind.Tag) return;

        let tagCommand = <MCFunctionAST.TagCommand>command;
        if (
            tagCommand.action == MCFunctionAST.TagActionKind.Add ||
            tagCommand.action == MCFunctionAST.TagActionKind.Remove
        ) {
            // Remember the authored token even when the current selector matched
            // nobody. It is still part of this custom-block program's tag vocabulary.
            rememberTagName(tagCommand.name);
        }
    }

    /** Try to handle an OUTPUT_HIDDEN query before normal player.execute(). */
    export function tryHandleQuery(
        command: MCFunctionAST.CommandNode
    ): QueryResult {
        if (command.kind == MCFunctionAST.CommandKind.Gamerule) {
            return handleGameRulePreview(<MCFunctionAST.GameRuleCommand>command);
        }
        if (command.kind != MCFunctionAST.CommandKind.Tag) {
            return unhandledQuery();
        }

        let tagCommand = <MCFunctionAST.TagCommand>command;
        if (tagCommand.action != MCFunctionAST.TagActionKind.List) {
            return unhandledQuery();
        }

        return executeTagListQuery(tagCommand);
    }

    /**
     * The MakeCode API returns only a boolean from player.execute(); it cannot
     * read current gamerule values or capture /gamerule text output. Never fake
     * a live value, and never use a Java-edition-only execute store workaround.
     * Bedrock/Education canonical AST and export remain unchanged.
     */
    function handleGameRulePreview(command: MCFunctionAST.GameRuleCommand): QueryResult {
        if (command.action == MCFunctionAST.GameRuleAction.Query) {
            let last = getLastSetGameRuleValue(command.ruleId);
            if (last.length > 0) {
                previewSay("GAMERULE " + command.ruleId + " last set by this Preview: " + last +
                    " (SESSION_KNOWN, NOT live). Current value: type /gamerule " + command.ruleId + " in game chat.");
                return handledQuery(QueryConfidence.SessionKnown, "last successful Preview set, not live state");
            }
            previewSay("GAMERULE " + command.ruleId +
                " live value cannot be read by player.execute(). Type /gamerule " +
                command.ruleId + " in game chat.");
            return handledQuery(QueryConfidence.Unavailable, "live gamerule value unavailable");
        }
        if (command.action == MCFunctionAST.GameRuleAction.List) {
            let names = MCFunctionGameruleRegistry.knownRuleIds();
            previewSay("GAMERULE Registry: " + names.length +
                " Bedrock-defined names (NOT current world values). For live values, type /gamerule in game chat.");
            // A type-labelled catalog; split to avoid oversized chat lines.
            printGameRuleCatalog(names, 1, "Boolean");
            printGameRuleCatalog(names, 2, "Integer");
            printGameRuleCatalog(names, 3, "Enum");
            let changed = getPreviewSetGameRuleIds();
            if (changed.length > 0) {
                previewSay("GAMERULE session-known: last successful sets below (NOT live world state).");
                for (let i = 0; i < changed.length; i++) {
                    previewSay(changed[i] + " = " + getLastSetGameRuleValue(changed[i]) + " (last Preview set)");
                }
            }
            return handledQuery(QueryConfidence.Partial, "Registry names and optional session-known sets, not live values");
        }
        if (command.action == MCFunctionAST.GameRuleAction.SetEnum &&
            command.ruleId == "playerwaypoints") {
            // Minecraft Education 26.32 chat succeeds; player.execute rejects this
            // rule name. Preserve the command, but do not claim a successful set.
            previewSay("GAMERULE playerwaypoints: Education 26.32 player.execute() rejected this syntax. " +
                "Use direct game chat: /gamerule playerwaypoints " + command.enumValue +
                ". Canonical command is unchanged.");
            return handledQuery(QueryConfidence.Unavailable, "playerwaypoints Preview compatibility limitation");
        }
        return unhandledQuery();
    }

    function printGameRuleCatalog(ids: string[], valueKind: number, typeLabel: string): void {
        let line = "";
        for (let i = 0; i < ids.length; i++) {
            if (MCFunctionGameruleRegistry.valueKindOf(ids[i]) != valueKind) continue;
            let candidate = line.length == 0 ? ids[i] : line + ", " + ids[i];
            if (candidate.length > 112) {
                previewSay("GAMERULE " + typeLabel + ": " + line);
                line = ids[i];
            } else {
                line = candidate;
            }
        }
        if (line.length > 0) previewSay("GAMERULE " + typeLabel + ": " + line);
    }

    function executeTagListQuery(
        command: MCFunctionAST.TagCommand
    ): QueryResult {
        if (previewQueryBusy) {
            previewSay("TAG list query is already running.");
            return handledQuery(
                QueryConfidence.Unavailable,
                "TAG list re-entry blocked"
            );
        }

        previewQueryBusy = true;

        let scopeToken = createInternalTagScopeToken();
        let viewerTag = createInternalTagName("qv", scopeToken);
        let targetTag = createInternalTagName("qt", scopeToken);

        // Defensive cleanup is scoped to these opaque names only. Unlike the old
        // fixed marker names, another Preview invocation uses a different token.
        cleanupInternalTag(viewerTag);
        cleanupInternalTag(targetTag);

        let viewerMarked = player.execute("tag @s add " + viewerTag);
        if (!viewerMarked) {
            cleanupTagQueryMarkers(viewerTag, targetTag);
            previewQueryBusy = false;
            previewSay("TAG list output unavailable: Preview viewer could not be marked.");
            return handledQuery(
                QueryConfidence.Unavailable,
                "Preview viewer unavailable"
            );
        }

        let targetText = MCFunctionCompiler.compileSelector(command.target);
        let targetMarked = player.execute(
            "tag " + targetText + " add " + targetTag
        );

        if (!targetMarked) {
            cleanupTagQueryMarkers(viewerTag, targetTag);
            previewQueryBusy = false;
            previewSay("TAG list: no matching target was found.");
            return handledQuery(
                QueryConfidence.Exact,
                "No matching TAG list target"
            );
        }

        let knownTags = getKnownTagNames();

        // First show each exact entity/player selected by the original selector.
        // The rawtext selector component resolves @s in the nested execute context.
        previewTellFromExecutors(
            "@a[tag=" + targetTag + "]",
            viewerTag,
            "{\"rawtext\":[{\"text\":\"[Preview] \"},{\"selector\":\"@s\"},{\"text\":\" tracked tags:\"}]}"
        );
        previewTellFromExecutors(
            "@e[type=!minecraft:player,tag=" + targetTag + "]",
            viewerTag,
            "{\"rawtext\":[{\"text\":\"[Preview] \"},{\"selector\":\"@s\"},{\"text\":\" tracked tags:\"}]}"
        );

        if (knownTags.length == 0) {
            previewSay("No tag names have been tracked by custom TAG blocks in this Preview session.");
        } else {
            for (let i = 0; i < knownTags.length; i++) {
                let tagName = knownTags[i];
                if (isInternalPreviewTag(tagName)) continue;

                let escapedTag = previewEscapeJsonText(tagName);

                // Query real Minecraft selector state for the already-snapshotted
                // targets. This avoids inventing per-entity tag state in JavaScript.
                previewTellFromExecutors(
                    "@a[tag=" + targetTag + ",tag=" + tagName + "]",
                    viewerTag,
                    "{\"rawtext\":[{\"text\":\"[Preview] \"},{\"selector\":\"@s\"},{\"text\":\" : " + escapedTag + "\"}]}"
                );
                previewTellFromExecutors(
                    "@e[type=!minecraft:player,tag=" + targetTag + ",tag=" + tagName + "]",
                    viewerTag,
                    "{\"rawtext\":[{\"text\":\"[Preview] \"},{\"selector\":\"@s\"},{\"text\":\" : " + escapedTag + "\"}]}"
                );
            }
        }

        previewSay("TAG list uses tags tracked by this custom-block Preview session.");

        cleanupTagQueryMarkers(viewerTag, targetTag);
        previewQueryBusy = false;

        return handledQuery(
            QueryConfidence.SessionKnown,
            "TAG list rendered from session-known tag vocabulary"
        );
    }

    function cleanupTagQueryMarkers(
        viewerTag: string,
        targetTag: string
    ): void {
        cleanupInternalTag(targetTag);
        cleanupInternalTag(viewerTag);
    }
}
