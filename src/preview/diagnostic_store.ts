/**
 * Preview-only diagnostic store.
 *
 * Purpose:
 * - keep detailed validation diagnostics out of the normal chat flow
 * - preserve one current diagnostic set per FunctionFile
 * - provide ? for whole-project diagnostics (cbi_diag remains an alias); bad names show
 *   their own errors through diagnostic-only chat handlers
 *
 * This is derived Preview/editor state. It is NOT Minecraft Command AST data and
 * must never be emitted into .mcfunction output.
 */
namespace MCFunctionDiagnostics {
    export enum DiagnosticSource {
        Definition = 0,
        Project = 1,
        Preview = 2,
        Runtime = 3
    }

    export interface DiagnosticRecord {
        functionName: string;
        level: MCFunctionValidator.ValidationLevel;
        code: string;
        message: string;
        source: DiagnosticSource;
    }

    let records: DiagnosticRecord[] = [];
    let knownFunctionNames: string[] = [];
    let chatRegistered = false;

    /** Legacy alias preserved for existing tests and projects. */
    export function chatCommandName(): string {
        return "cbi_diag";
    }

    /** Short user-facing command for the whole-project diagnostic viewer. */
    export function allDiagnosticsChatCommandName(): string {
        return "?";
    }

    export function isReservedChatCommand(name: string): boolean {
        return name == chatCommandName() || name == allDiagnosticsChatCommandName();
    }

    /**
     * Register the diagnostic viewer exactly once for this MakeCode program run.
     * FunctionFile.define() may call this many times safely.
     */
    export function ensureChatRegistered(): void {
        if (chatRegistered) return;
        chatRegistered = true;

        // Register the new short command, but retain the old name as an alias.
        // Both invoke the same read-only project diagnostic viewer.
        player.onChat(allDiagnosticsChatCommandName(), function () {
            showAll();
        });
        player.onChat(chatCommandName(), function () {
            showAll();
        });
    }

    function rememberFunction(name: string): void {
        for (let i = 0; i < knownFunctionNames.length; i++) {
            if (knownFunctionNames[i] == name) return;
        }
        knownFunctionNames.push(name);
    }

    /** Replace only this function's Definition diagnostics. */
    export function replaceDefinitionIssues(
        functionName: string,
        issues: MCFunctionValidator.ValidationIssue[]
    ): void {
        rememberFunction(functionName);

        let kept: DiagnosticRecord[] = [];
        for (let i = 0; i < records.length; i++) {
            let current = records[i];
            if (
                current.functionName == functionName &&
                current.source == DiagnosticSource.Definition
            ) {
                continue;
            }
            kept.push(current);
        }
        records = kept;

        for (let i = 0; i < issues.length; i++) {
            records.push({
                functionName: functionName,
                level: issues[i].level,
                code: issues[i].code,
                message: issues[i].message,
                source: DiagnosticSource.Definition
            });
        }
    }

    /** Future Preview/Runtime adapters may append non-definition diagnostics here. */
    export function add(
        functionName: string,
        level: MCFunctionValidator.ValidationLevel,
        code: string,
        message: string,
        source: DiagnosticSource
    ): void {
        rememberFunction(functionName);

        for (let i = 0; i < records.length; i++) {
            let current = records[i];
            if (
                current.functionName == functionName &&
                current.level == level &&
                current.code == code &&
                current.message == message &&
                current.source == source
            ) {
                return;
            }
        }

        records.push({
            functionName: functionName,
            level: level,
            code: code,
            message: message,
            source: source
        });
    }

    export function countLevel(level: MCFunctionValidator.ValidationLevel): number {
        let count = 0;
        for (let i = 0; i < records.length; i++) {
            if (records[i].level == level) count++;
        }
        return count;
    }

    export function countFunctionLevel(
        functionName: string,
        level: MCFunctionValidator.ValidationLevel
    ): number {
        let count = 0;
        for (let i = 0; i < records.length; i++) {
            if (
                records[i].functionName == functionName &&
                records[i].level == level
            ) count++;
        }
        return count;
    }

    export function functionIssueCount(functionName: string): number {
        let count = 0;
        for (let i = 0; i < records.length; i++) {
            if (records[i].functionName == functionName) count++;
        }
        return count;
    }

    function levelText(level: MCFunctionValidator.ValidationLevel): string {
        if (level == MCFunctionValidator.ValidationLevel.Error) return "ERROR";
        if (level == MCFunctionValidator.ValidationLevel.Warning) return "WARNING";
        return "INFO";
    }

    function sourceText(source: DiagnosticSource): string {
        if (source == DiagnosticSource.Project) return "PROJECT";
        if (source == DiagnosticSource.Preview) return "PREVIEW";
        if (source == DiagnosticSource.Runtime) return "RUNTIME";
        return "DEFINITION";
    }

    /**
     * Show only one FunctionFile's actual stored issues when the user types its
     * invalid function name. This never invokes the function's command plan.
     */
    export function showFunction(functionName: string): void {
        let errors = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Error);
        let warnings = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Warning);
        let info = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Info);

        MCFunctionPreview.previewSay(
            "mcfunction " + functionName + ": execution blocked; " +
            errors + " error(s), " + warnings + " warning(s), " + info + " info."
        );

        let found = false;
        for (let i = 0; i < records.length; i++) {
            let current = records[i];
            if (current.functionName != functionName) continue;
            found = true;
            MCFunctionPreview.previewSay(
                levelText(current.level) + " " + current.code +
                " " + sourceText(current.source) + ": " + current.message
            );
        }
        if (!found) {
            MCFunctionPreview.previewSay(
                "No stored diagnostic details for " + functionName +
                ". Use " + allDiagnosticsChatCommandName() + " for project diagnostics."
            );
        }
    }

    /**
     * Show WARNING / INFO details for a valid FunctionFile on explicit chat
     * invocation only. Its caller must still run the prepared handler afterward.
     *
     * Do not use this from FunctionFile.runPreview(): nested function and
     * tick.json calls must not generate repeated user-facing diagnostics.
     */
    export function showRunnableIssues(functionName: string): void {
        let warnings = countFunctionLevel(
            functionName, MCFunctionValidator.ValidationLevel.Warning
        );
        let info = countFunctionLevel(
            functionName, MCFunctionValidator.ValidationLevel.Info
        );
        if (warnings == 0 && info == 0) return;

        MCFunctionPreview.previewSay(
            "mcfunction " + functionName + ": " + warnings +
            " warning(s), " + info + " info; execution allowed."
        );

        for (let i = 0; i < records.length; i++) {
            let current = records[i];
            if (current.functionName != functionName) continue;
            if (current.level != MCFunctionValidator.ValidationLevel.Warning &&
                current.level != MCFunctionValidator.ValidationLevel.Info) continue;

            MCFunctionPreview.previewSay(
                levelText(current.level) + " " + current.code +
                " " + sourceText(current.source) + ": " + current.message
            );
        }
    }

    /**
     * Batch diagnostic lines into the fewest practical tellraw calls.
     * One functionName? request typically becomes exactly one message.
     * Longer whole-project reports are split at line boundaries to avoid
     * oversized commands and to preserve readable output order.
     */
    function showLines(lines: string[]): void {
        let content = "";
        const maxLength = 700;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (content.length > 0 && content.length + 1 + line.length > maxLength) {
                MCFunctionPreview.previewSay(content);
                content = "";
            }
            if (content.length > 0) content = content + "\n";
            content = content + line;
        }
        if (content.length > 0) MCFunctionPreview.previewSay(content);
    }

    /**
     * Explicit "functionName?" read-only diagnostic viewer.
     * Works for valid/invalid/no-issue functions and NEVER runs commands.
     */
    export function showFunctionDetailsOnly(functionName: string): void {
        let errors = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Error);
        let warnings = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Warning);
        let info = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Info);

        if (errors + warnings + info == 0) {
            MCFunctionPreview.previewSay(
                "mcfunction " + functionName + ": OK. Diagnostic only; not executed."
            );
            return;
        }

        let lines: string[] = [];
        lines.push(
            "mcfunction " + functionName + ": " + errors + " error(s), " +
            warnings + " warning(s), " + info + " info. Diagnostic only; not executed."
        );
        for (let i = 0; i < records.length; i++) {
            let current = records[i];
            if (current.functionName != functionName) continue;
            lines.push(
                levelText(current.level) + " " + current.code +
                " " + sourceText(current.source) + ": " + current.message
            );
        }
        showLines(lines);
    }

    /** Final summary only, called once by Preview.ready() after definitions. */
    export function showReadyGuide(): void {
        let errors = countLevel(MCFunctionValidator.ValidationLevel.Error);
        let warnings = countLevel(MCFunctionValidator.ValidationLevel.Warning);
        let info = countLevel(MCFunctionValidator.ValidationLevel.Info);
        if (errors + warnings + info == 0) return;
        MCFunctionPreview.previewSay(
            "Diagnostics: " + errors + " error(s), " + warnings +
            " warning(s), " + info + " info. All: ?. One: functionName? (no space)."
        );
    }

    /** Detailed project viewer: ? (and backward-compatible cbi_diag). */
    export function showAll(): void {
        let errorCount = countLevel(MCFunctionValidator.ValidationLevel.Error);
        let warningCount = countLevel(MCFunctionValidator.ValidationLevel.Warning);
        let infoCount = countLevel(MCFunctionValidator.ValidationLevel.Info);

        if (records.length == 0) {
            MCFunctionPreview.previewSay(
                "Diagnostics: " + knownFunctionNames.length +
                " mcfunction files, no problems found."
            );
            return;
        }

        let lines: string[] = [];
        lines.push(
            "Diagnostics: " + knownFunctionNames.length + " files, errors " +
            errorCount + " warnings " + warningCount + " info " + infoCount + "."
        );
        for (let f = 0; f < knownFunctionNames.length; f++) {
            let functionName = knownFunctionNames[f];
            if (functionIssueCount(functionName) == 0) continue;
            lines.push("mcfunction " + functionName + ":");
            for (let i = 0; i < records.length; i++) {
                let current = records[i];
                if (current.functionName != functionName) continue;
                lines.push(
                    levelText(current.level) + " " + current.code +
                    " " + sourceText(current.source) + ": " + current.message
                );
            }
        }
        showLines(lines);
    }

}
