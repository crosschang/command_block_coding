/** In-memory project Resource AST registry for MakeCode definitions.
 * It does not write files, install packs or invoke game commands.
 */
namespace MCFunctionResourceProject {
    let languages: MCFunctionResource.LanguageDocument[] = [];
    let dialogues: MCFunctionResource.DialogueDocument[] = [];
    let activeLanguage: MCFunctionResource.LanguageDocument = undefined;
    let activeDialogue: MCFunctionResource.DialogueDocument = undefined;
    let activeScene: MCFunctionResource.DialogueScene = undefined;
    let activeButton: MCFunctionResource.DialogueButton = undefined;
    let structureErrors: string[] = [];

    function record(message: string): void {
        structureErrors.push(message);
    }
    function canDefine(label: string): boolean {
        if (!FunctionFile.allowBridgeConfiguration()) return false;
        if (activeLanguage || activeDialogue) {
            record(label + " definitions cannot be nested in another resource definition.");
            return false;
        }
        return true;
    }
    export function defineLanguage(locale: string, handler: () => void): void {
        if (!canDefine("LANG")) return;
        let doc = MCFunctionResource.language(locale);
        languages.push(doc);
        activeLanguage = doc;
        handler();
        activeLanguage = undefined;
    }
    export function addEntry(key: string, value: string, comment?: string): void {
        if (!activeLanguage) {
            record("LANG_ENTRY_OUTSIDE_FILE: Use this block inside a LANG file.");
            return;
        }
        activeLanguage.entries.push({key: key, value: value, comment: comment});
    }
    export function defineDialogue(fileId: string, formatVersion: string,
        handler: () => void): void {
        if (!canDefine("Dialogue")) return;
        let doc = MCFunctionResource.dialogue(fileId, formatVersion);
        dialogues.push(doc);
        activeDialogue = doc;
        handler();
        activeDialogue = undefined;
    }
    export function addScene(tag: string, npcName: MCFunctionResource.TextValue,
        body: MCFunctionResource.TextValue, handler: () => void): void {
        if (!activeDialogue || activeScene) {
            record("DIALOGUE_SCENE_CONTEXT: Scene belongs immediately inside a Dialogue file.");
            return;
        }
        let scene = MCFunctionResource.scene(tag,npcName,body);
        activeDialogue.scenes.push(scene);
        activeScene = scene;
        handler();
        activeScene = undefined;
    }
    export function addButton(name: MCFunctionResource.TextValue, handler: () => void): void {
        if (!activeScene || activeButton) {
            record("DIALOGUE_BUTTON_CONTEXT: Button belongs inside a Dialogue scene.");
            return;
        }
        let button: MCFunctionResource.DialogueButton = {name: name, commands: []};
        activeScene.buttons.push(button);
        activeButton = button;
        handler();
        activeButton = undefined;
    }
    /** Parse known command syntax via the existing parser, preserve unknown as Raw. */
    function command(text: string): MCFunctionAST.CommandNode {
        if (text == undefined) return MCFunctionAST.createRawCommand("");
        let source = text;
        if (source.length > 0 && source.charAt(0) == "/") source = source.substr(1);
        let line = MCFunctionParser.parseLine(source);
        if (line.kind == MCFunctionParser.LineKind.Command && line.command) return line.command;
        return MCFunctionAST.createRawCommand(source);
    }
    export function onOpen(line: string): void {
        if (!activeScene || activeButton) {
            record("DIALOGUE_ON_OPEN_CONTEXT: On-open command belongs inside a scene.");
            return;
        }
        activeScene.onOpenCommands.push(command(line));
    }
    export function onClose(line: string): void {
        if (!activeScene || activeButton) {
            record("DIALOGUE_ON_CLOSE_CONTEXT: On-close command belongs inside a scene.");
            return;
        }
        activeScene.onCloseCommands.push(command(line));
    }
    export function buttonCommand(line: string): void {
        if (!activeButton) {
            record("DIALOGUE_BUTTON_COMMAND_CONTEXT: Use inside a button.");
            return;
        }
        activeButton.commands.push(command(line));
    }
    /** Project state is kept as AST, not serialized text. */
    export function languageDocuments(): MCFunctionResource.LanguageDocument[] {
        return languages;
    }
    export function dialogueDocuments(): MCFunctionResource.DialogueDocument[] {
        return dialogues;
    }
    export function validate(): MCFunctionValidator.ValidationIssue[] {
        let issues = MCFunctionResourceValidator.validateProject(languages,dialogues);
        for (let i = 0; i < structureErrors.length; i++) {
            issues.push({level: MCFunctionValidator.ValidationLevel.Error,
                code: "RESOURCE_DEFINITION_CONTEXT", message: structureErrors[i]});
        }
        return issues;
    }
    export function diagnosticText(): string {
        let issues = validate();
        let out = "";
        for (let i = 0; i < issues.length; i++) {
            if (i > 0) out += "\n";
            let level = issues[i].level == MCFunctionValidator.ValidationLevel.Error ?
                "ERROR" : issues[i].level == MCFunctionValidator.ValidationLevel.Warning ?
                "WARNING" : "INFO";
            out += level + " [" + issues[i].code + "] " + issues[i].message;
        }
        return out;
    }
    /** Resource export plan only; no OS, behavior pack or Script API I/O. */
    export function outputPlan(): MCFunctionResource.ResourceOutput[] {
        let out: MCFunctionResource.ResourceOutput[] = [];
        let issues = validate();
        if (MCFunctionValidator.hasError(issues)) return out;
        if (languages.length > 0) {
            out.push({path: "texts/languages.json", pack: MCFunctionResource.PackKind.Resource,
                content: MCFunctionResourceCodec.languagesJson(languages)});
            for (let i = 0; i < languages.length; i++) {
                out.push({path: "texts/" + languages[i].locale + ".lang",
                    pack: MCFunctionResource.PackKind.Resource,
                    content: MCFunctionResourceCodec.lang(languages[i])});
            }
        }
        for (let i = 0; i < dialogues.length; i++) {
            out.push({path: "dialogue/" + dialogues[i].fileId + ".json",
                pack: MCFunctionResource.PackKind.Behavior,
                content: MCFunctionResourceCodec.dialogue(dialogues[i])});
        }
        return out;
    }
    export function outputText(path: string): string {
        let files = outputPlan();
        for (let i = 0; i < files.length; i++) {
            if (files[i].path == path) return files[i].content;
        }
        return "";
    }
}
