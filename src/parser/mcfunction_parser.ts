/**
 * Conservative, lossless mcfunction line parser.
 *
 * AST nodes represent executable commands. Comments/blank lines are file layout,
 * not commands; their exact text and each line terminator are retained.
 * Unsupported, version-specific and ambiguous syntax remains RawCommand.
 * Do not use this module to execute commands or to access user files.
 */
namespace MCFunctionParser {
    export enum LineKind {
        Blank = 0,
        Comment = 1,
        Command = 2
    }

    export interface ParsedLine {
        kind: LineKind;
        command?: MCFunctionAST.CommandNode;
        trivia?: string;
        ending: string;
    }

    export interface ParsedFile {
        bom: string;
        lines: ParsedLine[];
    }

    function isBlank(text: string): boolean {
        for (let i = 0; i < text.length; i++) {
            if (text.charAt(i) != " " && text.charAt(i) != "\t") return false;
        }
        return true;
    }

    function isComment(text: string): boolean {
        let i = 0;
        while (i < text.length && (text.charAt(i) == " " || text.charAt(i) == "\t")) i++;
        return i < text.length && text.charAt(i) == "#";
    }

    /** Conservative path token: unknown or ambiguous input stays Raw. */
    function isFunctionId(id: string): boolean {
        if (id.length == 0 || id.charAt(0) == "/" || id.charAt(id.length - 1) == "/") return false;
        if (id.indexOf("..") >= 0 || id.indexOf("//") >= 0) return false;
        let colonCount = 0;
        for (let i = 0; i < id.length; i++) {
            let code = id.charCodeAt(i);
            let allowed = (code >= 97 && code <= 122) || (code >= 48 && code <= 57) ||
                code == 95 || code == 46 || code == 45 || code == 47 || code == 58;
            if (!allowed) return false;
            if (code == 58) colonCount++;
        }
        return colonCount <= 1;
    }

    /** Only recognize grammar that can be serialized without guessing. */
    export function parseLine(text: string, ending: string = ""): ParsedLine {
        if (isBlank(text)) {
            return { kind: LineKind.Blank, trivia: text, ending: ending };
        }
        if (isComment(text)) {
            return { kind: LineKind.Comment, trivia: text, ending: ending };
        }
        // Message spacing matters: capture every character after the first space.
        if (text.substr(0, 4) == "say " && text.length > 4) {
            return {
                kind: LineKind.Command,
                command: MCFunctionAST.createSayCommand(text.substr(4)),
                ending: ending
            };
        }
        // Noncanonical function IDs (including uppercase or spaces) stay raw.
        let functionId = text.substr(0, 9) == "function " ? text.substr(9) : "";
        if (isFunctionId(functionId)) {
            return {
                kind: LineKind.Command,
                command: MCFunctionAST.createMcFunctionCommand(functionId),
                ending: ending
            };
        }
        return {
            kind: LineKind.Command,
            command: MCFunctionAST.createRawCommand(text),
            ending: ending
        };
    }

    /** Preserve BOM, mixed CRLF/LF/CR, inline # and the final newline exactly. */
    export function parseFile(source: string): ParsedFile {
        let bom = "";
        let text = source;
        if (text.length > 0 && text.charCodeAt(0) == 0xfeff) {
            bom = text.charAt(0);
            text = text.substr(1);
        }
        let lines: ParsedLine[] = [];
        let start = 0;
        while (start < text.length) {
            let end = start;
            while (end < text.length && text.charAt(end) != "\r" && text.charAt(end) != "\n") {
                end++;
            }
            let ending = "";
            if (end < text.length) {
                ending = text.charAt(end);
                if (ending == "\r" && end + 1 < text.length && text.charAt(end + 1) == "\n") {
                    ending = "\r\n";
                }
            }
            lines.push(parseLine(text.substr(start, end - start), ending));
            start = end + ending.length;
        }
        return { bom: bom, lines: lines };
    }

    /**
     * Export AST through the project's canonical compiler, never a duplicate
     * command string assembler. Raw and non-command lines keep their exact text.
     */
    export function serializeFile(file: ParsedFile): string {
        let result = file.bom;
        for (let i = 0; i < file.lines.length; i++) {
            let line = file.lines[i];
            if (line.kind == LineKind.Command) {
                if (!line.command) throw "Missing command AST at line " + (i + 1);
                let compiled = MCFunctionCompiler.compileCommand(line.command);
                if (!compiled) throw "Compiler rejected command AST at line " + (i + 1);
                result += compiled;
            } else {
                result += line.trivia == undefined ? "" : line.trivia;
            }
            result += line.ending;
        }
        return result;
    }
}
