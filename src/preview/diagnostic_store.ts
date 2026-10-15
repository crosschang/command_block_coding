/**
 * Preview-only diagnostic store.
 *
 * Purpose:
 * - keep detailed validation diagnostics out of the normal chat flow
 * - preserve one current diagnostic set per FunctionFile
 * - keep cbi_diag for the whole-project viewer; invalid function names show
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

    /** Human-facing internal tool command. Intentionally readable. */
    export function chatCommandName(): string {
        return "cbi_diag";
    }

    export function isReservedChatCommand(name: string): boolean {
        return name == chatCommandName();
    }

    /**
     * Register the diagnostic viewer exactly once for this MakeCode program run.
     * FunctionFile.define() may call this many times safely.
     */
    export function ensureChatRegistered(): void {
        if (chatRegistered) return;
        chatRegistered = true;

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
                ". Use " + chatCommandName() + " for project diagnostics."
            );
        }
    }

    /** Detailed viewer, shown only when the user types cbi_diag. */
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

        MCFunctionPreview.previewSay(
            "Diagnostics: " + knownFunctionNames.length + " files, errors " +
            errorCount + " warnings " + warningCount + " info " + infoCount + "."
        );

        for (let f = 0; f < knownFunctionNames.length; f++) {
            let functionName = knownFunctionNames[f];
            if (functionIssueCount(functionName) == 0) continue;

            MCFunctionPreview.previewSay("mcfunction " + functionName + ":");

            for (let i = 0; i < records.length; i++) {
                let current = records[i];
                if (current.functionName != functionName) continue;

                MCFunctionPreview.previewSay(
                    levelText(current.level) + " " + current.code +
                    " " + sourceText(current.source) + ": " + current.message
                );
            }
        }
    }
}
