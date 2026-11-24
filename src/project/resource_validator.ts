/** Resource AST validation; ERROR blocks export, WARNING retains authored meaning. */
namespace MCFunctionResourceValidator {
    function issue(out: MCFunctionValidator.ValidationIssue[],
        level: MCFunctionValidator.ValidationLevel, code: string, detail: string): void {
        out.push({level: level, code: code, message: detail});
    }
    function hasControl(s: string): boolean {
        if (s == undefined) return true;
        for (let i = 0; i < s.length; i++) {
            let ch = s.charCodeAt(i);
            if (ch < 32 || ch == 127) return true;
        }
        return false;
    }
    function token(s: string, path: boolean): boolean {
        if (!s || s.length == 0 || s.indexOf("..") >= 0 ||
            s.charAt(0) == "/" || s.charAt(s.length - 1) == "/") return false;
        for (let i = 0; i < s.length; i++) {
            let c = s.charAt(i);
            let valid = (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") ||
                (c >= "0" && c <= "9") || c == "_" || c == "-" || c == "." ||
                (path && c == "/") || (!path && c == ":");
            if (!valid) return false;
        }
        return true;
    }
    function localeValid(s: string): boolean {
        if (!s || s.length != 5 || s.charAt(2) != "_") return false;
        for (let i = 0; i < 5; i++) {
            if (i == 2) continue;
            let c = s.charAt(i);
            if (i < 2 && !(c >= "a" && c <= "z")) return false;
            if (i > 2 && !(c >= "A" && c <= "Z")) return false;
        }
        return true;
    }
    function hasKey(doc: MCFunctionResource.LanguageDocument, key: string): boolean {
        for (let i = 0; i < doc.entries.length; i++)
            if (doc.entries[i].key == key) return true;
        return false;
    }
    export function validateLanguage(doc: MCFunctionResource.LanguageDocument):
        MCFunctionValidator.ValidationIssue[] {
        let out: MCFunctionValidator.ValidationIssue[] = [];
        if (!localeValid(doc.locale))
            issue(out,MCFunctionValidator.ValidationLevel.Error,"LANG_LOCALE_INVALID",
                "Expected locale like en_US or ko_KR.");
        for (let i = 0; i < doc.entries.length; i++) {
            let e = doc.entries[i];
            if (!token(e.key,false))
                issue(out,MCFunctionValidator.ValidationLevel.Error,"LANG_KEY_INVALID",
                    "Language key must be nonempty, with no invalid path or separator characters.");
            if (e.value == undefined || hasControl(e.value))
                issue(out,MCFunctionValidator.ValidationLevel.Error,"LANG_VALUE_CONTROL",
                    "Language value cannot contain literal control characters; use escaped newlines.");
            if (e.comment != undefined && hasControl(e.comment))
                issue(out,MCFunctionValidator.ValidationLevel.Error,"LANG_COMMENT_CONTROL",
                    "Translator comment must fit on one line.");
            for (let j = 0; j < i; j++) {
                if (doc.entries[j].key == e.key)
                    issue(out,MCFunctionValidator.ValidationLevel.Error,"LANG_KEY_DUPLICATE",
                        "Repeated translation key " + e.key + " in " + doc.locale + ".");
            }
        }
        return out;
    }
    function checkText(value: MCFunctionResource.TextValue,
        context: string, languages: MCFunctionResource.LanguageDocument[],
        out: MCFunctionValidator.ValidationIssue[]): void {
        if (!value) return;
        if (value.parts == undefined) {
            if (value.plain == undefined)
                issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_TEXT_MISSING",
                    "Text node has no plain text or RawText parts.");
            return;
        }
        if (value.parts.length == 0)
            issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_RAWTEXT_EMPTY",
                "RawText requires at least one component.");
        for (let i = 0; i < value.parts.length; i++) {
            let p = value.parts[i];
            if (p.value == undefined || p.value.length == 0)
                issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_RAWTEXT_PART_EMPTY",
                    "RawText component value is missing.");
            if (p.kind == MCFunctionResource.TextPartKind.Score) {
                if (!p.objective || p.objective.length == 0)
                    issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_SCORE_OBJECTIVE",
                        "Score component needs a scoreboard objective.");
                issue(out,MCFunctionValidator.ValidationLevel.Warning,"DIALOGUE_DYNAMIC_SCORE_RENDER",
                    "Education NPC Dialogue dynamic scoreboard display has past failure reports; verify in-game.");
            } else if (p.kind == MCFunctionResource.TextPartKind.Selector) {
                issue(out,MCFunctionValidator.ValidationLevel.Warning,"DIALOGUE_DYNAMIC_SELECTOR_RENDER",
                    "Education NPC Dialogue selector/name display is unverified; do not confuse with selector conditions.");
            } else if (p.kind == MCFunctionResource.TextPartKind.Translate) {
                if (p.value && languages.length > 0) {
                    for (let j = 0; j < languages.length; j++) {
                        if (!hasKey(languages[j],p.value))
                            issue(out,MCFunctionValidator.ValidationLevel.Warning,"DIALOGUE_LANG_KEY_MISSING",
                                p.value + " not declared in " + languages[j].locale + ".");
                    }
                }
            } else if (p.kind != MCFunctionResource.TextPartKind.Text) {
                issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_RAWTEXT_KIND_INVALID",
                    "Unknown RawText component kind.");
            }
        }
    }
    function checkCommands(commands: MCFunctionAST.CommandNode[],
        out: MCFunctionValidator.ValidationIssue[]): void {
        for (let i = 0; i < commands.length; i++) {
            let cmd = MCFunctionCompiler.compileCommand(commands[i]);
            if (cmd == undefined || cmd.length == 0 || cmd.indexOf("\n") >= 0 ||
                cmd.indexOf("\r") >= 0)
                issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_COMMAND_INVALID",
                    "NPC button/open/close command must be one nonempty command.");
            else {
                if (cmd.indexOf("@initiator[") >= 0)
                    issue(out,MCFunctionValidator.ValidationLevel.Warning,
                        "DIALOGUE_INITIATOR_FILTER_CONTEXT",
                        "@initiator[] has unverified NPC selector-filter compatibility.");
                if (cmd.indexOf("execute ") == 0 && cmd.indexOf("@initiator") >= 0)
                    issue(out,MCFunctionValidator.ValidationLevel.Warning,
                        "DIALOGUE_EXECUTE_INITIATOR_NESTED",
                        "Nested execute with @initiator has past Education failure reports.");
            }
        }
    }
    export function validateDialogue(doc: MCFunctionResource.DialogueDocument,
        languages: MCFunctionResource.LanguageDocument[]):
        MCFunctionValidator.ValidationIssue[] {
        let out: MCFunctionValidator.ValidationIssue[] = [];
        if (!token(doc.fileId,true))
            issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_FILE_ID_INVALID",
                "Dialogue file ID must be a safe relative path without traversal.");
        if (!doc.formatVersion || doc.formatVersion.length == 0)
            issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_FORMAT_MISSING",
                "Dialogue format_version is required.");
        if (!doc.scenes || doc.scenes.length == 0)
            issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_SCENES_EMPTY",
                "Dialogue file needs at least one scene.");
        for (let i = 0; i < doc.scenes.length; i++) {
            let s = doc.scenes[i];
            if (!token(s.sceneTag,false))
                issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_SCENE_TAG_INVALID",
                    "Scene tag is required and must be one safe token.");
            for (let j = 0; j < i; j++) {
                if (doc.scenes[j].sceneTag == s.sceneTag)
                    issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_SCENE_TAG_DUPLICATE",
                        "Duplicate scene_tag " + s.sceneTag + ".");
            }
            checkText(s.npcName,"npc_name",languages,out);
            checkText(s.text,"text",languages,out);
            checkCommands(s.onOpenCommands,out);
            checkCommands(s.onCloseCommands,out);
            for (let j = 0; j < s.buttons.length; j++) {
                checkText(s.buttons[j].name,"button",languages,out);
                if (s.buttons[j].name == undefined)
                    issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_BUTTON_NAME_MISSING",
                        "Button needs a name.");
                if (s.buttons[j].commands.length == 0)
                    issue(out,MCFunctionValidator.ValidationLevel.Warning,"DIALOGUE_BUTTON_NO_COMMANDS",
                        "Button has no command and only closes the dialogue.");
                checkCommands(s.buttons[j].commands,out);
            }
        }
        issue(out,MCFunctionValidator.ValidationLevel.Info,"DIALOGUE_EDUCATION_VERSION",
            "Bedrock schema version does not certify Minecraft Education runtime compatibility.");
        return out;
    }
    export function validateProject(languages: MCFunctionResource.LanguageDocument[],
        dialogues: MCFunctionResource.DialogueDocument[]): MCFunctionValidator.ValidationIssue[] {
        let out: MCFunctionValidator.ValidationIssue[] = [];
        if (languages.length > 0) {
            let foundEnglish = false;
            for (let i = 0; i < languages.length; i++) {
                if (languages[i].locale == "en_US") foundEnglish = true;
                let issues = validateLanguage(languages[i]);
                for (let j = 0; j < issues.length; j++) out.push(issues[j]);
                for (let j = 0; j < i; j++) {
                    if (languages[j].locale == languages[i].locale)
                        issue(out,MCFunctionValidator.ValidationLevel.Error,"LANG_LOCALE_DUPLICATE",
                            "Duplicate language file " + languages[i].locale + ".");
                }
            }
            if (!foundEnglish)
                issue(out,MCFunctionValidator.ValidationLevel.Error,"LANG_EN_US_REQUIRED",
                    "Resource packs must include en_US.lang.");
        }
        for (let i = 0; i < dialogues.length; i++) {
            let issues = validateDialogue(dialogues[i],languages);
            for (let j = 0; j < issues.length; j++) out.push(issues[j]);
            for (let j = 0; j < i; j++) {
                if (dialogues[j].fileId == dialogues[i].fileId)
                    issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_FILE_DUPLICATE",
                        "Duplicate dialogue file " + dialogues[i].fileId + ".");
                for (let a = 0; a < dialogues[i].scenes.length; a++) {
                    for (let b = 0; b < dialogues[j].scenes.length; b++) {
                        if (dialogues[i].scenes[a].sceneTag == dialogues[j].scenes[b].sceneTag)
                            issue(out,MCFunctionValidator.ValidationLevel.Error,"DIALOGUE_SCENE_TAG_PROJECT_DUPLICATE",
                                "Duplicate project scene_tag " + dialogues[i].scenes[a].sceneTag + ".");
                    }
                }
            }
        }
        return out;
    }
}
