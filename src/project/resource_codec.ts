/** Pure AST -> resource text compiler. No file IO or in-game command execution. */
namespace MCFunctionResourceCodec {
    /** Manual JSON quoting avoids unavailable JavaScript built-ins in MakeCode. */
    export function quote(value: string): string {
        let s = value == undefined ? "" : value;
        let out = "\"";
        for (let i = 0; i < s.length; i++) {
            let c = s.charAt(i);
            if (c == "\"") out += "\\\"";
            else if (c == "\\") out += "\\\\";
            else if (c == "\n") out += "\\n";
            else if (c == "\r") out += "\\r";
            else if (c == "\t") out += "\\t";
            else if (c == "\b") out += "\\b";
            else if (c == "\f") out += "\\f";
            else if (s.charCodeAt(i) < 32) {
                let hex = "0123456789abcdef";
                let code = s.charCodeAt(i);
                out += "\\u00" + hex.charAt(Math.floor(code / 16)) + hex.charAt(code % 16);
            } else out += c;
        }
        return out + "\"";
    }
    function part(p: MCFunctionResource.TextPart): string {
        if (p.kind == MCFunctionResource.TextPartKind.Text)
            return "{\"text\":" + quote(p.value) + "}";
        if (p.kind == MCFunctionResource.TextPartKind.Selector)
            return "{\"selector\":" + quote(p.value) + "}";
        if (p.kind == MCFunctionResource.TextPartKind.Score)
            return "{\"score\":{\"name\":" + quote(p.value) +
                ",\"objective\":" + quote(p.objective) + "}}";
        let s = "{\"translate\":" + quote(p.value);
        if (p.withValues && p.withValues.length > 0) {
            s += ",\"with\":[";
            for (let i = 0; i < p.withValues.length; i++) {
                if (i > 0) s += ",";
                s += quote(p.withValues[i]);
            }
            s += "]";
        }
        return s + "}";
    }
    export function text(value: MCFunctionResource.TextValue): string {
        if (value == undefined) return "\"\"";
        if (value.parts == undefined) return quote(value.plain);
        let s = "{\"rawtext\":[";
        for (let i = 0; i < value.parts.length; i++) {
            if (i > 0) s += ",";
            s += part(value.parts[i]);
        }
        return s + "]}";
    }
    /** Locale lines use key=value TAB ###optionalTranslatorComment, UTF-8 sans BOM. */
    export function lang(doc: MCFunctionResource.LanguageDocument): string {
        let s = "";
        for (let i = 0; i < doc.entries.length; i++) {
            let e = doc.entries[i];
            s += e.key + "=" + e.value + "\t###";
            if (e.comment != undefined && e.comment.length > 0) s += e.comment;
            s += "\n";
        }
        return s;
    }
    export function languagesJson(docs: MCFunctionResource.LanguageDocument[]): string {
        let s = "[";
        for (let i = 0; i < docs.length; i++) {
            if (i > 0) s += ",";
            s += quote(docs[i].locale);
        }
        return s + "]\n";
    }
    /** NPC dialogue JSON commands use a leading slash, unlike .mcfunction. */
    function commandList(items: MCFunctionAST.CommandNode[]): string {
        let s = "[";
        for (let i = 0; i < items.length; i++) {
            if (i > 0) s += ",";
            let value = MCFunctionCompiler.compileCommand(items[i]);
            if (value.length > 0 && value.charAt(0) != "/") value = "/" + value;
            s += quote(value);
        }
        return s + "]";
    }
    export function dialogue(doc: MCFunctionResource.DialogueDocument): string {
        let s = "{\"format_version\":" + quote(doc.formatVersion) +
            ",\"minecraft:npc_dialogue\":{\"scenes\":[";
        for (let i = 0; i < doc.scenes.length; i++) {
            if (i > 0) s += ",";
            let scene = doc.scenes[i];
            s += "{\"scene_tag\":" + quote(scene.sceneTag);
            if (scene.npcName != undefined) s += ",\"npc_name\":" + text(scene.npcName);
            if (scene.text != undefined) s += ",\"text\":" + text(scene.text);
            if (scene.onOpenCommands.length > 0)
                s += ",\"on_open_commands\":" + commandList(scene.onOpenCommands);
            if (scene.onCloseCommands.length > 0)
                s += ",\"on_close_commands\":" + commandList(scene.onCloseCommands);
            if (scene.buttons.length > 0) {
                s += ",\"buttons\":[";
                for (let j = 0; j < scene.buttons.length; j++) {
                    if (j > 0) s += ",";
                    let b = scene.buttons[j];
                    s += "{\"name\":" + text(b.name) +
                        ",\"commands\":" + commandList(b.commands) + "}";
                }
                s += "]";
            }
            s += "}";
        }
        return s + "]}}\n";
    }
}
