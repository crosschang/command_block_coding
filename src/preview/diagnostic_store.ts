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
        return name == chatCommandName() || name == allDiagnosticsChatCommandName() || name == "cbi_page";
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
        // Extra pages use one numeric-argument handler, not many chat handlers.
        player.onChat("cbi_page", function (page: number) {
            showPage(page);
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
     * Central UI-string entry point for future localization.
     * Diagnostic codes and Validator messages remain untouched source data.
     * Changing the display language should not change the AST or diagnostics.
     */
    function uiText(key: string): string {
        if (key == "notExecuted") return "Diagnostic only; not executed.";
        if (key == "allowed") return "execution allowed.";
        if (key == "blocked") return "execution blocked.";
        if (key == "noProblems") return "no problems found.";
        if (key == "useAll") return "for project diagnostics.";
        if (key == "allHint") return "All: ?. One: functionName? (no space).";
        if (key == "diagTitle") return "DIAG";
        if (key == "pageTitle") return "page";
        if (key == "nextPage") return "Next: cbi_page ";
        if (key == "detailsHint") return "Details: functionName?";
        if (key == "invalidPage") return "Invalid page. Choose 1..";
        return key;
    }

    /**
     * Minecraft Education may interpret selectors and [] in player.say() as
     * command syntax. Use a short tellraw ONLY for such text; ordinary lines
     * use player.say(), avoiding the stalled long-tellraw path observed in game.
     */
    function needsLiteralOutput(line: string): boolean {
        for (let i = 0; i < line.length; i++) {
            let ch = line.charAt(i);
            if (ch == "@" || ch == "[" || ch == "]" ||
                ch == "{" || ch == "}" || ch == "\"" ||
                ch == "\\") return true;
        }
        return false;
    }

    /**
     * Bound EVERY individual message, including a single exceptionally long
     * Validator issue. 100 is a conservative probe size, not a measured API
     * maximum. Avoid unsupported PXT string helpers such as lastIndexOf().
     */
    function emitDiagnosticLine(line: string): void {
        if (line.length == 0) return;
        const maxChars = 100;
        let literal = needsLiteralOutput(line);
        let start = 0;
        while (start < line.length) {
            let end = start + maxChars;
            if (end > line.length) end = line.length;

            // Prefer a word boundary without deleting a single input character.
            if (end < line.length) {
                let boundary = -1;
                let lower = start + 60;
                for (let j = end; j > lower; j--) {
                    if (line.charAt(j - 1) == " ") {
                        boundary = j;
                        break;
                    }
                }
                if (boundary > start) end = boundary;
            }

            let part = "";
            for (let i = start; i < end; i++) {
                part = part + line.charAt(i);
            }
            if (literal) {
                // Existing RawText serializer preserves @, [], quotes, etc.
                // A bounded payload avoids one large, blocking tellraw command.
                MCFunctionPreview.previewSay(part);
            } else {
                // No brackets/selectors go through the SAY parser.
                player.say("DIAG " + part);
            }
            start = end;
        }
    }

    /**
     * One display adapter for ?, functionName?, and legacy diagnostic routes.
     * This is Preview-only text: it must never enter the .mcfunction Compiler.
     */
    function showLines(lines: string[]): void {
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let begin = 0;
            for (let j = 0; j < line.length; j++) {
                let ch = line.charAt(j);
                if (ch == "\n" || ch == "\r") {
                    let part = "";
                    for (let k = begin; k < j; k++) part = part + line.charAt(k);
                    emitDiagnosticLine(part);
                    begin = j + 1;
                }
            }
            let last = "";
            for (let k = begin; k < line.length; k++) last = last + line.charAt(k);
            emitDiagnosticLine(last);
        }
    }

    /**
     * Show only one FunctionFile's actual stored issues when the user types its
     * invalid function name. This never invokes the function's command plan.
     */
    export function showFunction(functionName: string): void {
        let errors = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Error);
        let warnings = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Warning);
        let info = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Info);

        let lines: string[] = [];
        lines.push(
            "mcfunction " + functionName + ": " + uiText("blocked") + " " +
            errors + " error(s), " + warnings + " warning(s), " + info + " info."
        );

        let found = false;
        for (let i = 0; i < records.length; i++) {
            let current = records[i];
            if (current.functionName != functionName) continue;
            found = true;
            lines.push(
                levelText(current.level) + " " + current.code +
                " " + sourceText(current.source) + ": " + current.message
            );
        }
        if (!found) {
            lines.push(
                "No stored diagnostic details for " + functionName +
                ". Use " + allDiagnosticsChatCommandName() + " " + uiText("useAll")
            );
        }
        showLines(lines);
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

        let lines: string[] = [];
        lines.push(
            "mcfunction " + functionName + ": " + warnings +
            " warning(s), " + info + " info; " + uiText("allowed")
        );

        for (let i = 0; i < records.length; i++) {
            let current = records[i];
            if (current.functionName != functionName) continue;
            if (current.level != MCFunctionValidator.ValidationLevel.Warning &&
                current.level != MCFunctionValidator.ValidationLevel.Info) continue;

            lines.push(
                levelText(current.level) + " " + current.code +
                " " + sourceText(current.source) + ": " + current.message
            );
        }
        showLines(lines);
    }

    /**
     * Fast read-only diagnostic detail viewer. Typical one-issue queries become
     * one compact output instead of a separate heading and issue line.
     * Longer/multiple issues retain all their text through bounded output.
     * Do not execute the FunctionFile command plan from this viewer.
     */
    export function showFunctionDetailsOnly(functionName: string): void {
        let errors = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Error);
        let warnings = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Warning);
        let info = countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Info);

        let header = uiText("diagTitle") + " " + functionName + " E" + errors + " W" + warnings + " I" + info + ".";
        if (errors + warnings + info == 0) {
            emitCompactLine(header + " " + uiText("noProblems") + " " + uiText("notExecuted"));
            return;
        }

        let lines: string[] = [];
        for (let i = 0; i < records.length; i++) {
            let current = records[i];
            if (current.functionName != functionName) continue;
            lines.push(
                levelText(current.level) + " " + current.code + " " +
                sourceText(current.source) + ": " + current.message
            );
        }
        // A single ordinary issue will normally fit one safe output call.
        emitCompactIssues(header + " " + uiText("notExecuted"), lines);
    }

    /** Prefer one short SAY call; preserve literal []/@/JSON via existing tellraw. */
    function emitCompactLine(line: string): void {
        const maxCompactChars = 145; // Conservative probe threshold, not a protocol limit.
        if (line.length <= maxCompactChars) {
            if (needsLiteralOutput(line)) MCFunctionPreview.previewSay(line);
            else player.say(line);
        } else {
            // Preserve ALL characters rather than truncating long translated text.
            emitDiagnosticLine(line);
        }
    }

    /** Combine adjacent issues only while they safely fit one bounded message. */
    function emitCompactIssues(header: string, issues: string[]): void {
        const maxCompactChars = 145;
        let pending = header;
        for (let i = 0; i < issues.length; i++) {
            let addition = " | " + issues[i];
            if (pending.length + addition.length <= maxCompactChars) {
                pending = pending + addition;
            } else {
                emitCompactLine(pending);
                pending = issues[i];
            }
        }
        if (pending.length > 0) emitCompactLine(pending);
    }

    /** Highest severity per function for a concise project index. */
    function functionSeverity(functionName: string): string {
        if (countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Error) > 0) return "E";
        if (countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Warning) > 0) return "W";
        if (countFunctionLevel(functionName, MCFunctionValidator.ValidationLevel.Info) > 0) return "I";
        return "";
    }

    /** Total functions having one or more stored diagnostic records. */
    function affectedFunctionCount(): number {
        let count = 0;
        for (let i = 0; i < knownFunctionNames.length; i++) {
            if (functionIssueCount(knownFunctionNames[i]) > 0) count++;
        }
        return count;
    }

    /** A small named index page, not the full Validator messages. */
    export function showPage(page: number): void {
        const pageSize = 3;
        let errors = countLevel(MCFunctionValidator.ValidationLevel.Error);
        let warnings = countLevel(MCFunctionValidator.ValidationLevel.Warning);
        let info = countLevel(MCFunctionValidator.ValidationLevel.Info);
        let affected = affectedFunctionCount();
        let pages = Math.floor((affected + pageSize - 1) / pageSize);
        if (pages < 1) pages = 1;
        if (page < 1 || page > pages || page != Math.floor(page)) {
            emitCompactLine(uiText("diagTitle") + " " + uiText("invalidPage") + pages + " via cbi_page N.");
            return;
        }

        let summary = uiText("diagTitle") + " E" + errors + " W" + warnings + " I" + info;
        if (affected == 0) {
            emitCompactLine(summary + ". " + uiText("noProblems"));
            return;
        }

        let out = summary + " " + uiText("pageTitle") + " " + page + "/" + pages + ": ";
        let visited = 0;
        let included = 0;
        let start = (page - 1) * pageSize;
        for (let f = 0; f < knownFunctionNames.length; f++) {
            let functionName = knownFunctionNames[f];
            if (functionIssueCount(functionName) == 0) continue;
            if (visited >= start && included < pageSize) {
                if (included > 0) out = out + "; ";
                out = out + functionName + " " + functionSeverity(functionName);
                included++;
            }
            visited++;
            if (included == pageSize) break;
        }
        if (page < pages) out = out + ". " + uiText("nextPage") + (page + 1);
        else out = out + ". " + uiText("detailsHint");
        emitCompactLine(out);
    }

    /** Final summary only, called once by Preview.ready() after definitions. */
    export function showReadyGuide(): void {
        let errors = countLevel(MCFunctionValidator.ValidationLevel.Error);
        let warnings = countLevel(MCFunctionValidator.ValidationLevel.Warning);
        let info = countLevel(MCFunctionValidator.ValidationLevel.Info);
        if (errors + warnings + info == 0) return;
        showLines([
            "Diagnostics: " + errors + " error(s), " + warnings +
            " warning(s), " + info + " info. " + uiText("allHint")
        ]);
    }

    /** Short project summary. ? and cbi_diag are exact aliases of page 1. */
    export function showAll(): void {
        showPage(1);
    }

}
