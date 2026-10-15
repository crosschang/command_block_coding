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

    // Preview-only catalog command, separate from canonical /gamerule LIST.
    // PXT chat-command number arguments are supported by Minecraft MakeCode.
    // The viewer never reads or claims to read live Gamerule values.
    const GAMERULE_CATALOG_PAGE_SIZE = 6;
    let gameRuleCatalogChatRegistered = false;

    export function gameRuleCatalogChatCommandName(): string {
        return "cbi_rules";
    }

    export function isReservedGameRuleCatalogChatCommand(name: string): boolean {
        return name == gameRuleCatalogChatCommandName();
    }

    /** Register once per program run; no canonical Minecraft command is added. */
    export function ensureGameRuleCatalogChatRegistered(): void {
        if (gameRuleCatalogChatRegistered) return;
        gameRuleCatalogChatRegistered = true;
        player.onChat(gameRuleCatalogChatCommandName(), function (page: number) {
            showGameRuleCatalogPage(page);
        });
    }

    /**
     * Display a page of Registry IDs/types. NOT the live /gamerule result.
     * One tellraw per page prevents flooding delayed Minecraft chat output.
     */
    export function showGameRuleCatalogPage(requestedPage: number): void {
        let ids = MCFunctionGameruleRegistry.knownRuleIds();
        let totalPages = Math.ceil(ids.length / GAMERULE_CATALOG_PAGE_SIZE);
        if (totalPages < 1) {
            previewSay("GAMERULE Registry has no known rules. Live world values: type /gamerule in game chat.");
            return;
        }
        let page = requestedPage;
        // MakeCode onChat supplies 0 if the optional numeric argument is omitted.
        if (page == 0) page = 1;
        if (page < 1 || page > totalPages || page % 1 != 0) {
            previewSay("GAMERULE Registry page must be 1-" + totalPages +
                ". Usage: cbi_rules 1. Live world values: /gamerule.");
            return;
        }

        let output = "GAMERULE Registry " + page + "/" + totalPages +
            " (names/types ONLY, NOT live values)";
        let start = (page - 1) * GAMERULE_CATALOG_PAGE_SIZE;
        let end = start + GAMERULE_CATALOG_PAGE_SIZE;
        if (end > ids.length) end = ids.length;
        for (let i = start; i < end; i++) {
            let type = "Unknown";
            let kind = MCFunctionGameruleRegistry.valueKindOf(ids[i]);
            if (kind == 1) type = "Boolean";
            else if (kind == 2) type = "Integer";
            else if (kind == 3) type = "Enum";
            output += "\n" + ids[i] + " [" + type + "]";
        }
        if (page < totalPages) {
            output += "\nNext: cbi_rules " + (page + 1);
        } else {
            output += "\nLast page.";
        }
        output += " Live: /gamerule or /gamerule <rule>";
        previewSay(output);
    }

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
        if (command.kind == MCFunctionAST.CommandKind.Time) {
            let time = <MCFunctionAST.TimeCommand>command;
            if (time.action == MCFunctionAST.TimeAction.Query) return handleTimeQueryPreview(time);
        }
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
     * Preview-only LIVE number read, not a cached/session estimate.
     * Education 26.32 user comparison confirmed these three MakeCode values.
     * Keep canonical `time query ...` unchanged for .mcfunction export.
     */
    function handleTimeQueryPreview(command: MCFunctionAST.TimeCommand): QueryResult {
        let value = 0;
        let label = "";
        let suffix = " ticks";
        if (command.queryKind == MCFunctionAST.TimeQueryKind.DayTime) {
            value = gameplay.timeQuery(TimeQuery.DayTime);
            label = "daytime";
        } else if (command.queryKind == MCFunctionAST.TimeQueryKind.GameTime) {
            value = gameplay.timeQuery(TimeQuery.GameTime);
            label = "gametime";
        } else if (command.queryKind == MCFunctionAST.TimeQueryKind.Day) {
            value = gameplay.timeQuery(TimeQuery.Day);
            label = "day";
            suffix = "";
        } else {
            // Definition Validation blocks this route. Never display an invented value.
            return unhandledQuery();
        }
        previewSay("TIME QUERY " + label + ": " + value + suffix);
        return handledQuery(QueryConfidence.Exact, "live MakeCode game time query");
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
            // Canonical "gamerule" returns live world settings in game chat.
            // player.execute() cannot expose that text; never substitute Registry
            // metadata or cached session values as if they were live state.
            previewSay("GAMERULE LIST live world values are OUTPUT_HIDDEN in MakeCode Preview. " +
                "Type /gamerule in game chat. Registry reference (NOT live values): cbi_rules 1.");
            showGameRuleCatalogPage(1);
            return handledQuery(QueryConfidence.Partial,
                "canonical live Gamerule output hidden; paged Registry reference shown separately");
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
