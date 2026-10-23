/**
 * Preview Query Adapter.
 *
 * player.execute() returns an API boolean (not proof of a persisted world
 * effect) and does not expose textual output for some valid Bedrock/Education
 * commands. This adapter provides Preview-only feedback without changing the
 * AST or Compiler grammar.
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
    let spawnPointPreviewNoticeShown = false;

    /**
     * Definition-time diagnostics about the MakeCode Preview bridge only.
     * Keep these separate from canonical command validation: valid Bedrock
     * grammar must remain valid for a future real .mcfunction export.
     */
    export function previewCompatibilityIssues(
        command: MCFunctionAST.CommandNode
    ): MCFunctionValidator.ValidationIssue[] {
        let issues: MCFunctionValidator.ValidationIssue[] = [];
        if (command.kind == MCFunctionAST.CommandKind.SpawnPoint) {
            issues.push({
                level: MCFunctionValidator.ValidationLevel.Info,
                code: "SPAWNPOINT_PREVIEW_LIMITATION",
                message: "Education 26.32 MakeCode Preview returned true for SPAWNPOINT but respawn stayed at world spawn. Canonical command is unchanged; real .mcfunction is not yet tested."
            });
        } else if (command.kind == MCFunctionAST.CommandKind.Tag) {
            let tag = <MCFunctionAST.TagCommand>command;
            if (tag.action == MCFunctionAST.TagActionKind.List) {
                issues.push({
                    level: MCFunctionValidator.ValidationLevel.Info,
                    code: "TAG_LIST_SESSION_KNOWN",
                    message: "Preview checks live tag membership only for tag names seen through this extension in the current session; other names may be missing."
                });
            }
        } else if (command.kind == MCFunctionAST.CommandKind.Scoreboard) {
            let score = <MCFunctionAST.ScoreboardCommand>command;
            if (score.action == MCFunctionAST.ScoreboardAction.ObjectiveList) {
                issues.push({
                    level: MCFunctionValidator.ValidationLevel.Info,
                    code: "SCOREBOARD_OBJECTIVES_LIST_SESSION_KNOWN",
                    message: "Preview knows only objectives added through this extension this run; use direct /scoreboard objectives list for the complete live list."
                });
            } else if (score.action == MCFunctionAST.ScoreboardAction.PlayerList) {
                issues.push({
                    level: MCFunctionValidator.ValidationLevel.Info,
                    code: "SCOREBOARD_PLAYERS_LIST_PARTIAL",
                    message: "Preview lists known holders/objectives and attempts live rawtext.score rendering; it cannot enumerate every world score."
                });
            } else if (score.action == MCFunctionAST.ScoreboardAction.PlayerTest) {
                issues.push({
                    level: MCFunctionValidator.ValidationLevel.Info,
                    code: "SCOREBOARD_TEST_PREVIEW_OUTPUT",
                    message: "Education MakeCode player.execute cannot use the newer execute-if-score form. Preview shows a live rawtext score (when available) and labeled last-set session guidance; direct /scoreboard players test remains authoritative."
                });
            }
        } else if (command.kind == MCFunctionAST.CommandKind.Gamerule) {
            let rule = <MCFunctionAST.GameRuleCommand>command;
            if (rule.action == MCFunctionAST.GameRuleAction.Query) {
                issues.push({
                    level: MCFunctionValidator.ValidationLevel.Info,
                    code: "GAMERULE_QUERY_OUTPUT_HIDDEN",
                    message: "Preview cannot read the live gamerule value. SESSION_KNOWN is only the last value reported successful by this Preview session."
                });
            } else if (rule.action == MCFunctionAST.GameRuleAction.List) {
                issues.push({
                    level: MCFunctionValidator.ValidationLevel.Info,
                    code: "GAMERULE_LIST_REGISTRY_ONLY",
                    message: "Preview shows a partial Registry of names/types, NOT live world gamerule values. Check /gamerule in game chat."
                });
            } else if (rule.action == MCFunctionAST.GameRuleAction.SetEnum &&
                rule.ruleId == "playerwaypoints") {
                issues.push({
                    level: MCFunctionValidator.ValidationLevel.Warning,
                    code: "GAMERULE_PLAYERWAYPOINTS_PREVIEW_UNSUPPORTED",
                    message: "Education 26.32 MakeCode Preview rejected playerwaypoints. Use direct game chat; canonical command remains unchanged."
                });
            }
        }
        return issues;
    }

    /** Warning once per MakeCode run; a true command result is not state proof. */
    export function noticeSpawnPointPreviewOnce(success: boolean): void {
        if (spawnPointPreviewNoticeShown) return;
        spawnPointPreviewNoticeShown = true;
        previewSay("WARNING [SPAWNPOINT_PREVIEW_LIMITATION] MakeCode returned " +
            success + " for SPAWNPOINT. Education Preview did not reliably change " +
            "the player's respawn point. Do not treat this as a gameplay PASS; " +
            "direct game chat worked, real .mcfunction remains unverified.");
    }

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
     * Observe structured commands for Preview session hints only.
     * player.execute() returning true is an API report, not proof of persisted
     * world state (as the SPAWNPOINT Education test demonstrated).
     */
    export function observeCommand(
        command: MCFunctionAST.CommandNode,
        success: boolean
    ): void {
        // Only API-reported successes are remembered, never false results.
        // Neither a true result nor the stored value proves current world state.
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

        if (command.kind == MCFunctionAST.CommandKind.Scoreboard) {
            if (success) observeScoreboardCommand(<MCFunctionAST.ScoreboardCommand>command);
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
        if (command.kind == MCFunctionAST.CommandKind.Scoreboard) {
            return handleScoreboardPreview(<MCFunctionAST.ScoreboardCommand>command);
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
                previewSay("INFO [SESSION_KNOWN] GAMERULE " + command.ruleId +
                    " last API-reported successful set: " + last +
                    ". NOT a live/verified world value. Check /gamerule " + command.ruleId + " in game chat.");
                return handledQuery(QueryConfidence.SessionKnown, "last Preview API-reported successful set, not live state");
            }
            previewSay("INFO [UNAVAILABLE] GAMERULE " + command.ruleId +
                " live value cannot be read by MakeCode Preview. Type /gamerule " +
                command.ruleId + " in game chat.");
            return handledQuery(QueryConfidence.Unavailable, "live gamerule value unavailable");
        }
        if (command.action == MCFunctionAST.GameRuleAction.List) {
            // Canonical "gamerule" returns live world settings in game chat.
            // player.execute() cannot expose that text; never substitute Registry
            // metadata or cached session values as if they were live state.
            previewSay("INFO [PARTIAL] GAMERULE LIST live world values are OUTPUT_HIDDEN in MakeCode Preview. " +
                "Type /gamerule in game chat. Registry reference (NOT live values): cbi_rules 1.");
            showGameRuleCatalogPage(1);
            return handledQuery(QueryConfidence.Partial,
                "canonical live Gamerule output hidden; paged Registry reference shown separately");
        }
        if (command.action == MCFunctionAST.GameRuleAction.SetEnum &&
            command.ruleId == "playerwaypoints") {
            // Minecraft Education 26.32 chat succeeds; player.execute rejects this
            // rule name. Preserve the command, but do not claim a successful set.
            previewSay("WARNING [GAMERULE_PLAYERWAYPOINTS_PREVIEW_UNSUPPORTED] " +
                "Education 26.32 player.execute() rejected playerwaypoints. " +
                "Use direct game chat: /gamerule playerwaypoints " + command.enumValue +
                ". Canonical command is unchanged.");
            return handledQuery(QueryConfidence.Unavailable, "playerwaypoints Preview compatibility limitation");
        }
        return unhandledQuery();
    }

    /** C2 Preview tracker: stores only vocabulary, never fabricated score values. */
    function observeScoreboardCommand(command: MCFunctionAST.ScoreboardCommand): void {
        let a = command.action;
        if (a == MCFunctionAST.ScoreboardAction.ObjectiveAdd) {
            rememberScoreboardObjective(command.objective, command.displayName || "");
            return;
        }
        if (a == MCFunctionAST.ScoreboardAction.ObjectiveRemove) {
            forgetScoreboardObjective(command.objective);
            forgetScoreboardLastSetForObjective(command.objective);
            return;
        }
        if (a == MCFunctionAST.ScoreboardAction.PlayerReset) {
            let resetName = scoreboardPreviewSingleHolderName(command.target);
            if (resetName.length > 0) forgetScoreboardHolder(resetName, command.objective || "");
            // An unset objective means reset ALL objectives for this target.
            // A broad selector cannot safely be reduced to one holder.
            if (resetName.length > 0 && command.objective && command.objective.length > 0) {
                forgetScoreboardLastSet(resetName, command.objective);
            } else {
                clearScoreboardLastSetValues();
            }
            return;
        }
        if (a == MCFunctionAST.ScoreboardAction.PlayerSet) {
            let setName = scoreboardPreviewSingleHolderName(command.target);
            // Only a direct integer SET for one known target gets a session hint.
            // API success is NOT proof of a current, authoritative world score.
            if (setName.length > 0 && command.objective && command.objective.length > 0 &&
                command.count != undefined && command.count % 1 == 0) {
                rememberScoreboardLastSet(setName, command.objective, command.count);
            } else {
                clearScoreboardLastSetValues();
            }
            rememberScoreboardTarget(command.target, command.objective);
            return;
        }
        if (a == MCFunctionAST.ScoreboardAction.PlayerAdd ||
            a == MCFunctionAST.ScoreboardAction.PlayerRemove ||
            a == MCFunctionAST.ScoreboardAction.PlayerRandom ||
            a == MCFunctionAST.ScoreboardAction.PlayerOperation) {
            // Arithmetic, random and multi-target mutations can change values
            // without yielding a result. Invalidate all numeric hints rather
            // than making a stale or fabricated MATCH claim.
            clearScoreboardLastSetValues();
            rememberScoreboardTarget(command.target, command.objective);
            if (a == MCFunctionAST.ScoreboardAction.PlayerOperation) {
                rememberScoreboardTarget(command.source, command.sourceObjective);
            }
        }
    }

    /** Named/fake player or plain @s only; do not turn broad selectors into one player. */
    function scoreboardPreviewSingleHolderName(target: MCFunctionAST.PlayerTarget): string {
        if (!target) return "";
        if (target.kind == MCFunctionAST.PlayerTargetKind.Name) return target.name || "";
        if (target.kind == MCFunctionAST.PlayerTargetKind.Selector && target.selector &&
            target.selector.base == MCFunctionAST.SelectorBase.Self &&
            target.selector.filters.length == 0 &&
            target.selector.scores.length == 0 &&
            target.selector.hasItems.length == 0) return "@s";
        return "";
    }

    function rememberScoreboardTarget(target: MCFunctionAST.PlayerTarget, objective: string): void {
        let name = scoreboardPreviewSingleHolderName(target);
        if (name.length > 0 && objective && objective.length > 0) {
            rememberScoreboardHolder(name, objective);
        }
    }

    function handleScoreboardPreview(command: MCFunctionAST.ScoreboardCommand): QueryResult {
        if (command.action == MCFunctionAST.ScoreboardAction.ObjectiveList) {
            let ids = getScoreboardKnownObjectiveIds();
            let labels = getScoreboardKnownObjectiveLabels();
            if (ids.length == 0) {
                previewSay("INFO [SESSION_KNOWN] SCOREBOARD objectives: none observed by this Preview session. " +
                    "NOT the live world list. Use /scoreboard objectives list in game chat.");
            } else {
                let summary = "INFO [SESSION_KNOWN] SCOREBOARD objectives added in Preview " +
                    "(NOT the complete/live world list):";
                let shown = ids.length;
                if (shown > 6) shown = 6;
                for (let i = 0; i < shown; i++) {
                    summary += "\n" + ids[i];
                    if (labels[i].length > 0) summary += " (" + labels[i] + ")";
                }
                if (ids.length > shown) summary += "\n... additional session entries omitted";
                summary += "\nLive: /scoreboard objectives list";
                previewSay(summary);
            }
            return handledQuery(QueryConfidence.SessionKnown, "Preview-known objective IDs only");
        }
        if (command.action == MCFunctionAST.ScoreboardAction.PlayerList) {
            return handleScoreboardPlayersListPreview(command);
        }
        if (command.action == MCFunctionAST.ScoreboardAction.PlayerTest) {
            return handleScoreboardPlayersTestPreview(command);
        }
        return unhandledQuery();
    }

    /**
     * Use Bedrock rawtext.score to ASK THE GAME to render actual scores.
     * This never calculates/cache-estimates a number in JavaScript. For Edition
     * compatibility, visible rendering still requires a real in-game test.
     */
    function scoreboardPreviewShowLiveScore(name: string, objective: string): boolean {
        let encodedName = previewEscapeJsonText(name);
        let encodedObjective = previewEscapeJsonText(objective);
        let label = previewEscapeJsonText("[Preview] [LIVE_RAWTEXT] " + name + " / " + objective + " = ");
        let json = "{\"rawtext\":[{\"text\":\"" + label + "\"}," +
            "{\"score\":{\"name\":\"" + encodedName + "\",\"objective\":\"" +
            encodedObjective + "\"}}]}";
        return player.execute("tellraw @s " + json);
    }

    /** Covers session-known holders; never claims a complete scoreboard enumeration. */
    function handleScoreboardPlayersListPreview(command: MCFunctionAST.ScoreboardCommand): QueryResult {
        let requested = "";
        if (command.target) {
            requested = scoreboardPreviewSingleHolderName(command.target);
            if (requested.length == 0) {
                previewSay("INFO [UNAVAILABLE] SCOREBOARD players list for a broad/filtered selector " +
                    "cannot be enumerated reliably by Preview. Use the direct /scoreboard players list command.");
                return handledQuery(QueryConfidence.Unavailable, "non-single target preview unavailable");
            }
        }
        let names = getScoreboardKnownHolderNames();
        let objectives = getScoreboardKnownHolderObjectives();
        let shown = 0;
        for (let i = 0; i < names.length; i++) {
            if (requested.length > 0 && requested != names[i]) continue;
            if (shown == 0) {
                previewSay("INFO [PARTIAL] SCOREBOARD players list: session-tracked holders/objectives only. " +
                    "Following values are rendered by the GAME via rawtext.score (not cached numbers). " +
                    "Blank values may mean missing score/unsupported Education rendering.");
            }
            if (shown >= 6) {
                previewSay("INFO [PARTIAL] More session entries omitted; direct /scoreboard players list for full world data.");
                break;
            }
            if (!scoreboardPreviewShowLiveScore(names[i], objectives[i])) {
                previewSay("INFO [UNAVAILABLE] rawtext.score was not accepted by Preview for " +
                    names[i] + " / " + objectives[i] + ". Live: /scoreboard players list");
            }
            shown++;
        }
        if (shown == 0) {
            previewSay("INFO [SESSION_KNOWN] No matching holder/objective pair observed by this Preview. " +
                "This does NOT mean the live world has none. Use /scoreboard players list in game chat.");
        }
        return handledQuery(QueryConfidence.Partial, "session known score holders; native rawtext.score attempted");
    }

    /**
     * Education MakeCode player.execute() in the tested runtime rejects the
     * current Bedrock `execute if/unless score` grammar. Never send it here.
     *
     * Native /scoreboard players test is valid when typed in GAME chat, but
     * player.execute() cannot expose its conditional result text. Instead:
     * - ask the game to render the LIVE numeric value via rawtext.score;
     * - optionally show an explicitly NON-LIVE last-set session comparison;
     * - direct game chat remains authoritative for MATCH/NOT MATCH.
     */
    function handleScoreboardPlayersTestPreview(command: MCFunctionAST.ScoreboardCommand): QueryResult {
        let name = scoreboardPreviewSingleHolderName(command.target);
        if (name.length == 0) {
            previewSay("INFO [UNAVAILABLE] SCOREBOARD players test targets multiple/filtered entities. " +
                "No single live number or match can be inferred. Use direct game chat: /" +
                MCFunctionCompiler.compileCommand(command));
            return handledQuery(QueryConfidence.Unavailable, "multi-target score test not readable by Preview");
        }
        let minimum = command.minimum || "*";
        let maximum = command.maximum || "*";
        let range = minimum + " to " + maximum;
        previewSay("INFO [OUTPUT_HIDDEN] SCOREBOARD TEST " + name + " / " + command.objective +
            " range " + range + ". Education MakeCode cannot return the test result text; " +
            "no modern execute conditional will be attempted.");
        if (!scoreboardPreviewShowLiveScore(name, command.objective)) {
            previewSay("INFO [UNAVAILABLE] LIVE_RAWTEXT score was not accepted by Preview. " +
                "Use direct /scoreboard players test in game chat.");
        }
        let last = getScoreboardLastSet(name, command.objective);
        if (last.hasValue) {
            let matchesMinimum = minimum == "*" || last.value >= parseInt(minimum, 10);
            let matchesMaximum = maximum == "*" || last.value <= parseInt(maximum, 10);
            let result = matchesMinimum && matchesMaximum ? "MATCH" : "NOT MATCH";
            previewSay("INFO [SESSION_KNOWN] " + result + " for last API-reported SET " +
                last.value + " (NOT a live test result). " +
                "Other commands, packs or players may have changed it.");
        } else {
            previewSay("INFO [UNAVAILABLE] No unmodified last-set numeric hint for this holder/objective. " +
                "LIVE_RAWTEXT above is for viewing only, not programmatic comparison.");
        }
        previewSay("INFO [DIRECT] Definitive test: /" + MCFunctionCompiler.compileCommand(command));
        return handledQuery(QueryConfidence.Partial,
            "live rawtext display plus clearly labeled last-set session hint; no modern execute");
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

        previewSay("INFO [SESSION_KNOWN] TAG list checked live membership for tag names tracked " +
            "in this Preview session only. Other tag names may be omitted.");

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
