/**
 * Shared Preview output helpers.
 *
 * Keep all extra chat/tellraw output inside Preview. Compiler output remains the
 * actual Minecraft command authored by the user.
 */
namespace MCFunctionPreview {
    /**
     * Show one Preview-only informational line to the current MakeCode player.
     *
     * Do not route Preview UI text through player.say(). Minecraft Education can
     * parse punctuation in that path as command syntax in some runtime cases.
     * tellraw/rawtext keeps UI punctuation such as [Preview] inside a JSON text
     * component instead of the command grammar.
     */
    export function previewSay(message: string): void {
        let text = previewEscapeJsonText("[Preview] " + message);
        player.execute(
            "tellraw @s {\"rawtext\":[{\"text\":\"" + text + "\"}]}"
        );
    }

    /**
     * Execute a legacy execute -> tellraw line as each selected entity while
     * sending the rendered message only to the current query's marked viewer.
     *
     * rawtext may use {"selector":"@s"}; in that nested execution context @s is
     * the selected entity, so players and non-player entities can both be named.
     */
    export function previewTellFromExecutors(
        executorSelector: string,
        viewerTag: string,
        rawtextJson: string
    ): boolean {
        if (!executorSelector || executorSelector.length == 0) return false;
        if (!viewerTag || viewerTag.length == 0) return false;
        if (!rawtextJson || rawtextJson.length == 0) return false;

        return player.execute(
            "execute " + executorSelector +
            " ~ ~ ~ tellraw @a[tag=" + viewerTag + "] " + rawtextJson
        );
    }

    /**
     * Escape text for a JSON rawtext text component.
     *
     * PERF (Education): avoid testing five escape conditions for every ordinary
     * character. Use MakeCode-supported indexOf() to skip safe substrings, and
     * escape only actual special characters. This preserves the exact output
     * of the previous character-by-character serializer.
     *
     * Do not use String.replace()/lastIndexOf() here; compatibility with PXT
     * is intentionally limited to indexOf(), substr(), and charAt().
     */
    export function previewEscapeJsonText(value: string): string {
        // Most Preview notices are plain ASCII without JSON escape characters.
        // The fast path also preserves non-ASCII text (e.g. future translations).
        if (value.indexOf("\\", 0) < 0 &&
            value.indexOf("\"", 0) < 0 &&
            value.indexOf("\n", 0) < 0 &&
            value.indexOf("\r", 0) < 0 &&
            value.indexOf("\t", 0) < 0) {
            return value;
        }

        let result = "";
        let start = 0;
        while (start < value.length) {
            // Find the first character which requires a JSON escape.
            let next = value.length;
            let pos = value.indexOf("\\", start);
            if (pos >= 0 && pos < next) next = pos;
            pos = value.indexOf("\"", start);
            if (pos >= 0 && pos < next) next = pos;
            pos = value.indexOf("\n", start);
            if (pos >= 0 && pos < next) next = pos;
            pos = value.indexOf("\r", start);
            if (pos >= 0 && pos < next) next = pos;
            pos = value.indexOf("\t", start);
            if (pos >= 0 && pos < next) next = pos;

            if (next > start) {
                result += value.substr(start, next - start);
            }
            if (next == value.length) break;

            let ch = value.charAt(next);
            if (ch == "\\") result += "\\\\";
            else if (ch == "\"") result += "\\\"";
            else if (ch == "\n") result += "\\n";
            else if (ch == "\r") result += "\\r";
            else result += "\\t";
            start = next + 1;
        }
        return result;
    }
}
