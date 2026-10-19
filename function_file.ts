/**
 * Represents .mcfunction files and function metadata in Blocks/JavaScript.
 *
 * Canonical project meaning:
 *   FunctionFile.define("main", ...) -> functions/main.mcfunction
 *   FunctionFile.tickJson(...)       -> functions/tick.json
 *   FunctionFile.tickValue("main")   -> one tick.json values[] entry
 *
 * Structural policy:
 *   - define() and tickJson() are top-level project containers.
 *   - define() cannot be nested inside define() or tickJson().
 *   - tickJson() cannot be nested inside define() or tickJson().
 *   - tickValue() belongs only inside tickJson().
 *   - Minecraft command blocks are rejected while tickJson() is collecting values.
 *
 * Minecraft Education runtime preview:
 *   - define() first captures the function body without changing the world.
 *   - Definition Validation runs before any chat command is registered.
 *   - Valid FunctionFiles receive runnable chat commands.
 *   - Invalid FunctionFiles receive diagnostic-only chat handlers; no command executes.
 *   - The validated action plan is replayed later when chat/function/tick invokes it.
 *   - Runtime world state (selectors, scores, tags, blocks, etc.) is still evaluated
 *     when the validated plan actually executes.
 *
 * NOTE: Standard PXT callback statement inputs do not expose a custom Blockly
 * connection type through normal GitHub Extension annotations. The canonical
 * API and runtime guards below therefore enforce the project structure, while
 * the future Converter/Project Validator must also validate parsed JavaScript.
 */
//% color=#9966FF weight=95 icon="\uf15b"
//% groups='["FUNCTION FILE", "TICK.JSON"]'
namespace FunctionFile {
    let functionNames: string[] = [];
    let functionHandlers: (() => void)[] = [];
    let functionValid: boolean[] = [];
    let registeredChatFunctionNames: string[] = [];
    let registeredChatDiagnosticNames: string[] = [];

    // Project-level representation of functions/tick.json.
    // Keep declaration order because Minecraft executes the listed functions in order.
    let tickFile: MCFunctionProject.TickFile = MCFunctionProject.createTickFile();
    let tickPreviewStarted = false;
    let collectingTickValues = false;

    // Preview-only structural context. This does not change exported command meaning.
    let functionExecutionDepth = 0;
    let reportedStructureErrorCodes: string[] = [];
    let reportedInvalidFunctionNames: string[] = [];

    // Definition Validation capture state.
    // Command.* calls append validated replay actions here instead of touching the world.
    let collectingDefinitionActions = false;
    let definitionActions: (() => void)[] = [];
    let definitionIssues: MCFunctionValidator.ValidationIssue[] = [];
    let definitionStructureError = false;
    // True only if an actual GAMERULE LIST command was captured by a valid function.
    // A standalone reporter or a QUERY/SET must not activate the Registry chat viewer.
    let definitionHasGameruleList = false;

    /**
     * Define one mcfunction file.
     * The callback body becomes the command list for that file in Converter Edition.
     *
     * Runtime Preview performs Definition Validation immediately. Invalid functions
     * are kept in the internal registry so function/tick references cannot fall back
     * accidentally. An error-only chat handler displays their diagnostics instead
     * of executing any captured action.
     */
    //% blockId=function_file_define
    //% group="FUNCTION FILE" weight=100
    //% block="mcfunction file %name"
    //% name.shadow="text"
    //% name.defl="main"
    //% blockAllowMultiple=1
    //% topblock=true
    export function define(name: string, handler: () => void): void {
        // Human-facing diagnostics viewer. Multiple define() calls are safe because
        // the runtime registers this chat command only once per program run.
        MCFunctionDiagnostics.ensureChatRegistered();

        if (MCFunctionDiagnostics.isReservedChatCommand(name) ||
            MCFunctionPreview.isReservedGameRuleCatalogChatCommand(name)) {
            let reservedIssues: MCFunctionValidator.ValidationIssue[] = [{
                level: MCFunctionValidator.ValidationLevel.Error,
                code: "FUNCTION_NAME_RESERVED",
                message: MCFunctionDiagnostics.isReservedChatCommand(name)
                    ? "mcfunction name " + name + " is reserved for the project diagnostic viewer."
                    : "mcfunction name cbi_rules is reserved for the Gamerule Registry viewer."
            }];

            register(name, createPreparedHandler([]), false);
            MCFunctionDiagnostics.replaceDefinitionIssues(name, reservedIssues);
            reportDefinitionComplete(name, reservedIssues, false);
            return;
        }

        if (collectingTickValues) {
            reportStructureError(
                "FUNCTION_FILE_IN_TICK_JSON",
                "mcfunction file cannot be defined inside tick.json. Use function entries only."
            );
            return;
        }

        if (functionExecutionDepth > 0) {
            reportStructureError(
                "FUNCTION_FILE_NESTED",
                "mcfunction file cannot be defined inside another mcfunction file. Define it at the workspace top level."
            );
            return;
        }

        prepareDefinition(name, handler);
    }

    /**
     * Runtime-preview resolver.
     * Returns true whenever the function ID belongs to this MakeCode project.
     * Invalid definitions also return true so Preview never falls through to an
     * unrelated Behavior Pack function with the same ID.
     */
    export function runPreview(name: string): boolean {
        for (let i = 0; i < functionNames.length; i++) {
            if (functionNames[i] == name) {
                if (!functionValid[i]) {
                    reportInvalidFunctionRun(name);
                    return true;
                }

                invokePreparedHandler(functionHandlers[i]);
                return true;
            }
        }

        return false;
    }

    /**
     * Define the project-level functions/tick.json file.
     *
     * Canonical body rule: ONLY FunctionFile.tickValue("path/to/function") entries.
     * Their order becomes the future tick.json "values" array order.
     *
     * This is project/function metadata, not a Minecraft command AST node.
     */
    //% blockId=function_file_tick_json
    //% group="TICK.JSON" weight=100
    //% block="tick.json"
    //% topblock=true
    export function tickJson(handler: () => void): void {
        if (collectingTickValues) {
            reportStructureError(
                "TICK_JSON_NESTED",
                "tick.json cannot be nested inside tick.json."
            );
            return;
        }

        if (functionExecutionDepth > 0) {
            reportStructureError(
                "TICK_JSON_IN_FUNCTION_FILE",
                "tick.json cannot be defined inside an mcfunction file. Define it at the workspace top level."
            );
            return;
        }

        // There is only one functions/tick.json per Behavior Pack. The block editor
        // treats this as a top-level container. If JavaScript contains another
        // declaration, the future Project Validator/Converter must report it.
        // Preview keeps the latest declaration active to remain deterministic.
        tickFile = MCFunctionProject.createTickFile();
        collectingTickValues = true;
        handler();
        collectingTickValues = false;

        startTickPreview();
    }

    /**
     * Add one function path to the current tick.json "values" array.
     * This is the ONLY canonical statement allowed inside FunctionFile.tickJson().
     */
    //% blockId=function_file_tick_value
    //% group="TICK.JSON" weight=90
    //% block="function %name"
    //% name.shadow="text"
    //% name.defl="tick/main"
    //% blockAllowMultiple=1
    //% topblock=false
    export function tickValue(name: string): void {
        if (!collectingTickValues) {
            reportStructureError(
                "TICK_VALUE_OUTSIDE_TICK_JSON",
                "tick.json function entry can only be used inside tick.json."
            );
            return;
        }

        // Preserve declaration order. Do not de-duplicate here: tick.json is an
        // ordered JSON array, and repeating the same function ID is meaningful data
        // that should survive a round-trip exactly as authored.
        MCFunctionProject.addTickValue(tickFile, name);
    }

    /**
     * Guard used by Command.* runtime preview.
     * Commands are valid in mcfunction files, but not in tick.json metadata.
     */
    export function allowCommandExecution(): boolean {
        if (!collectingTickValues) {
            return true;
        }

        reportStructureError(
            "COMMAND_IN_TICK_JSON",
            "tick.json accepts only FunctionFile.tickValue() entries. Minecraft commands are not allowed here."
        );
        return false;
    }

    /**
     * Hidden Definition Validation hook used by Command.* and specialized Preview adapters.
     *
     * During FunctionFile.define() the command is validated and its replay action is
     * captured, but the action is NOT executed. Returning true means the caller must
     * stop because Definition Validation consumed the command.
     */
    export function capturePreviewAction(
        issues: MCFunctionValidator.ValidationIssue[],
        action: () => void,
        command?: MCFunctionAST.CommandNode
    ): boolean {
        if (!collectingDefinitionActions) {
            return false;
        }

        for (let i = 0; i < issues.length; i++) {
            addDefinitionIssueUnique(issues[i]);
        }

        if (!MCFunctionValidator.hasError(issues)) {
            definitionActions.push(action);
            // Metadata follows the captured command AST, not the presence of a
            // detached reporter or source-code text. No Minecraft state is read.
            if (command && command.kind == MCFunctionAST.CommandKind.Gamerule &&
                (<MCFunctionAST.GameRuleCommand>command).action == MCFunctionAST.GameRuleAction.List) {
                definitionHasGameruleList = true;
            }
        }

        return true;
    }

    /** Preview/debug helper for future project-level validation and tests. */
    export function isCollectingTickValues(): boolean {
        return collectingTickValues;
    }

    function addDefinitionIssueUnique(
        issue: MCFunctionValidator.ValidationIssue
    ): void {
        for (let i = 0; i < definitionIssues.length; i++) {
            let current = definitionIssues[i];
            if (
                current.level == issue.level &&
                current.code == issue.code &&
                current.message == issue.message
            ) {
                return;
            }
        }

        definitionIssues.push(issue);
    }

    function prepareDefinition(name: string, handler: () => void): void {
        // Save/restore capture state defensively. Nested FunctionFile.define() is
        // rejected above, but this keeps the internal gate deterministic if the
        // implementation is reused later by another project-level validation pass.
        let previousCollecting = collectingDefinitionActions;
        let previousActions = definitionActions;
        let previousIssues = definitionIssues;
        let previousStructureError = definitionStructureError;
        let previousHasGameruleList = definitionHasGameruleList;

        collectingDefinitionActions = true;
        definitionActions = [];
        definitionIssues = [];
        definitionStructureError = false;
        definitionHasGameruleList = false;

        functionExecutionDepth++;
        handler();
        functionExecutionDepth--;

        let actions = definitionActions;
        let issues = definitionIssues;
        let structureError = definitionStructureError;
        let hasGameruleList = definitionHasGameruleList;

        collectingDefinitionActions = previousCollecting;
        definitionActions = previousActions;
        definitionIssues = previousIssues;
        definitionStructureError = previousStructureError;
        definitionHasGameruleList = previousHasGameruleList;

        let valid = !structureError && !MCFunctionValidator.hasError(issues);
        let preparedHandler = createPreparedHandler(actions);
        register(name, preparedHandler, valid);

        MCFunctionDiagnostics.replaceDefinitionIssues(name, issues);
        reportDefinitionComplete(name, issues, structureError);

        // A valid definition can expose the optional Gamerule Registry viewer.
        // An invalid one must never make cbi_rules available by accident.
        if (valid && hasGameruleList) {
            MCFunctionPreview.ensureGameRuleCatalogChatRegistered();
        }

        // One dispatcher per non-reserved function name. On validation failure,
        // typing that same name shows diagnostics, NOT the prepared actions.
        // This registration is Preview-only and does not change .mcfunction AST.
        ensureFunctionChatRegistered(name);
    }

    function createPreparedHandler(actions: (() => void)[]): () => void {
        return function () {
            for (let i = 0; i < actions.length; i++) {
                actions[i]();
            }
        };
    }

    function countDefinitionIssues(
        issues: MCFunctionValidator.ValidationIssue[],
        level: MCFunctionValidator.ValidationLevel
    ): number {
        let count = 0;
        for (let i = 0; i < issues.length; i++) {
            if (issues[i].level == level) count++;
        }
        return count;
    }

    function reportDefinitionComplete(
        name: string,
        issues: MCFunctionValidator.ValidationIssue[],
        structureError: boolean
    ): void {
        let errorCount = countDefinitionIssues(
            issues,
            MCFunctionValidator.ValidationLevel.Error
        );
        let warningCount = countDefinitionIssues(
            issues,
            MCFunctionValidator.ValidationLevel.Warning
        );
        let infoCount = countDefinitionIssues(
            issues,
            MCFunctionValidator.ValidationLevel.Info
        );

        // Structural errors captured inside a FunctionFile are also inserted into
        // definitionIssues by reportStructureError(), so do not double-count them.
        let valid = !structureError && errorCount == 0;

        if (errorCount == 0 && warningCount == 0 && infoCount == 0) {
            MCFunctionPreview.previewSay(name + ": OK.");
            return;
        }

        let summary = name + ":";
        if (errorCount > 0) {
            summary = summary + " " + errorCount +
                (errorCount == 1 ? " error" : " errors");
        }
        if (warningCount > 0) {
            summary = summary + " " + warningCount +
                (warningCount == 1 ? " warning" : " warnings");
        }
        if (infoCount > 0) {
            summary = summary + " " + infoCount + " info";
        }
        summary = summary + ".";

        // Keep each definition line short. The once-only Preview.ready() guide
        // explains ? and name? after all definitions are registered.
        if (!valid) {
            summary = summary + " Execution blocked.";
        } else {
            summary = summary + " Execution allowed.";
        }
        MCFunctionPreview.previewSay(summary);
    }

    function startTickPreview(): void {
        if (tickPreviewStarted) {
            return;
        }

        tickPreviewStarted = true;

        loops.forever(function () {
            // Approximate Minecraft's 20 TPS gameplay tick for editor preview.
            // The exported Behavior Pack tick.json remains the runtime authority.
            loops.pause(50);

            for (let i = 0; i < tickFile.values.length; i++) {
                let functionId = tickFile.values[i];

                // Prefer MakeCode-defined FunctionFile plans. If the function only
                // exists in an active Behavior Pack, reuse the normal function command
                // path so fallback still uses AST -> Validator -> Compiler.
                if (!runPreview(functionId)) {
                    Command.mcFunction(functionId);
                }
            }
        });
    }

    function invokePreparedHandler(handler: () => void): void {
        functionExecutionDepth++;
        handler();
        functionExecutionDepth--;
    }

    /**
     * Register one direct chat dispatcher per function name. Normal execution
     * does not echo stored diagnostics; invalid functions show only a blocked
     * hint. Detailed inspection uses functionName? without executing commands.
     * Internal runPreview() retains the one-time error throttle for loops.
     */
    function ensureFunctionChatRegistered(name: string): void {
        if (!name || name.length == 0) return;
        // These names belong to existing internal viewers. Never shadow them.
        if (MCFunctionDiagnostics.isReservedChatCommand(name) ||
            MCFunctionPreview.isReservedGameRuleCatalogChatCommand(name)) return;

        for (let i = 0; i < registeredChatFunctionNames.length; i++) {
            if (registeredChatFunctionNames[i] == name) return;
        }
        registeredChatFunctionNames.push(name);
        player.onChat(name, function () {
            for (let i = 0; i < functionNames.length; i++) {
                if (functionNames[i] != name) continue;
                if (!functionValid[i]) {
                    // Running an invalid function remains forbidden. Keep chat
                    // output minimal; detailed causes belong to the explicit
                    // read-only diagnostic command (functionName?).
                    MCFunctionDiagnostics.showBlockedExecutionHint(name);
                    return;
                }
                // Normal execution must be quiet about stored WARNING/INFO.
                // Only functionName? and ? show diagnostics.
                // This avoids delayed tellraw lines interleaving with the
                // actual function output, without changing Validator policy.
                runPreview(name);
                return;
            }
        });

        // PXT treats whitespace-separated chat tokens as arguments. Register the
        // exact command "name?" as a separate 0-argument handler instead of
        // requiring "name ?". Never invoke the stored command plan here.
        // Minecraft function IDs should not contain spaces or a question mark.
        if (name.indexOf("?") >= 0 || name.indexOf(" ") >= 0) return;
        let queryName = name + "?";
        for (let i = 0; i < registeredChatDiagnosticNames.length; i++) {
            if (registeredChatDiagnosticNames[i] == queryName) return;
        }
        registeredChatDiagnosticNames.push(queryName);
        player.onChat(queryName, function () {
            MCFunctionDiagnostics.showFunctionDetailsOnly(name);
        });
    }

    function register(name: string, handler: () => void, valid: boolean): void {
        // If Blocks <-> JavaScript is refreshed, replace an existing definition
        // rather than keeping duplicate entries in our own preview registry.
        for (let i = 0; i < functionNames.length; i++) {
            if (functionNames[i] == name) {
                functionHandlers[i] = handler;
                functionValid[i] = valid;
                return;
            }
        }

        functionNames.push(name);
        functionHandlers.push(handler);
        functionValid.push(valid);
    }

    function reportInvalidFunctionRun(name: string): void {
        for (let i = 0; i < reportedInvalidFunctionNames.length; i++) {
            if (reportedInvalidFunctionNames[i] == name) {
                return;
            }
        }

        reportedInvalidFunctionNames.push(name);
        MCFunctionPreview.previewSay(
            "ERROR: mcfunction " + name + " is unavailable because definition validation failed."
        );
    }

    function reportStructureError(code: string, message: string): void {
        // Structural errors reached while preparing a FunctionFile invalidate the
        // definition even when the visible message for that code was already shown.
        if (collectingDefinitionActions) {
            definitionStructureError = true;
            addDefinitionIssueUnique({
                level: MCFunctionValidator.ValidationLevel.Error,
                code: code,
                message: message
            });
            return;
        }

        // Avoid flooding chat when invalid project structure is reached from a
        // tick function. One message per structural error code is enough for Preview.
        for (let i = 0; i < reportedStructureErrorCodes.length; i++) {
            if (reportedStructureErrorCodes[i] == code) {
                return;
            }
        }

        reportedStructureErrorCodes.push(code);
        MCFunctionPreview.previewSay("PROJECT ERROR [" + code + "]: " + message);
    }
}

/**
 * Minecraft Education runtime preview helper.
 *
 * Place this as the first statement of a FunctionFile while testing in-game.
 * It is PREVIEW metadata and must be ignored by the future .mcfunction Converter.
 */
//% color="#00A67E" weight=96 icon="\uf144" block="PREVIEW"
namespace Preview {
    let diagnosticGuideShown = false;

    //% blockId=mcfunction_preview_ready
    //% block="▶ PREVIEW READY"
    //% weight=100
    export function ready(): void {
        Command.say("MCFunction Preview Ready")
        // Show the guidance once, after top-level FunctionFile.define calls.
        // This is Preview metadata; it is never part of .mcfunction output.
        if (!diagnosticGuideShown) {
            diagnosticGuideShown = true;
            MCFunctionDiagnostics.showReadyGuide();
        }
    }
}
