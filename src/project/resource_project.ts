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
    // C-shaped OPEN/CLOSE sections are UI containers, not a new command format.
    // 0=none, 1=on_open_commands, 2=on_close_commands
    let activeSceneSection = 0;
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
        if (!activeScene || activeButton || activeSceneSection != 0) {
            record("DIALOGUE_BUTTON_CONTEXT: Button belongs inside a Dialogue scene.");
            return;
        }
        let button: MCFunctionResource.DialogueButton = {name: name, commands: []};
        activeScene.buttons.push(button);
        activeButton = button;
        handler();
        activeButton = undefined;
    }
    /**
     * Construct one UI choice without side effects; Scene uses the same DialogueButton AST.
     * Commands are parsed once using the existing conservative command parser.
     */
    export function createButtonChoice(name: MCFunctionResource.TextValue,
        lines: string[]): MCFunctionResource.DialogueButton {
        return {name: name, commands: createSceneCommandList(lines)};
    }

    /**
     * Alternate Scene authoring mode: value inputs exposed by MakeCode's built-in
     * expandable arguments (+/-) yield one ordered button per visible choice.
     * Nested-C-block Scene remains available, with no change to its semantics.
     */
    export function addSceneChoices(tag: string, npcName: MCFunctionResource.TextValue,
        body: MCFunctionResource.TextValue,
        choices: MCFunctionResource.DialogueButton[]): void {
        if (!activeDialogue || activeScene || activeButton || activeLanguage) {
            record("DIALOGUE_SCENE_CONTEXT: Scene choices belong immediately inside a Dialogue file.");
            return;
        }
        activeDialogue.scenes.push(buildScene(tag, npcName, body, [], [], choices));
    }

    /**
     * Structured Scene slots build the same AST as the legacy C-shaped editor.
     * Raw/unknown commands remain MCFunctionAST.Raw nodes for later round-trip.
     */
    export function createSceneCommandList(lines: string[]): MCFunctionAST.CommandNode[] {
        let result: MCFunctionAST.CommandNode[] = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i] != undefined && lines[i].length > 0) result.push(command(lines[i]));
        }
        return result;
    }

    /**
     * Common AST assembly for both Scene Choices and typed Scene authoring.
     * A missing choice is intentionally omitted, never serialized as an empty button.
     * Legacy C-shaped Scene continues to populate the same AST using callbacks.
     */
    function buildScene(tag: string, npcName: MCFunctionResource.TextValue,
        body: MCFunctionResource.TextValue, openCommands: MCFunctionAST.CommandNode[],
        closeCommands: MCFunctionAST.CommandNode[],
        choices: MCFunctionResource.DialogueButton[]): MCFunctionResource.DialogueScene {
        let scene = MCFunctionResource.scene(tag, npcName, body);
        for (let i = 0; i < openCommands.length; i++) scene.onOpenCommands.push(openCommands[i]);
        for (let i = 0; i < closeCommands.length; i++) scene.onCloseCommands.push(closeCommands[i]);
        for (let i = 0; i < choices.length; i++) {
            if (choices[i] != undefined) scene.buttons.push(choices[i]);
        }
        return scene;
    }

    /** Fixed typed UI slots: OPEN, CLOSE, then 0-6 ordered BUTTON values. */
    export function addTypedScene(tag: string, npcName: MCFunctionResource.TextValue,
        body: MCFunctionResource.TextValue,
        openCommands: MCFunctionAST.CommandNode[],
        closeCommands: MCFunctionAST.CommandNode[],
        choices: MCFunctionResource.DialogueButton[]): void {
        if (!activeDialogue || activeScene || activeButton || activeLanguage ||
            activeSceneSection != 0) {
            record("DIALOGUE_TYPED_SCENE_CONTEXT: Structured Scene belongs directly inside Dialogue JSON file.");
            return;
        }
        if (choices.length > 6) {
            record("DIALOGUE_TYPED_SCENE_BUTTON_LIMIT: Structured Scene has at most six buttons.");
            return;
        }
        activeDialogue.scenes.push(buildScene(tag, npcName, body,
            openCommands, closeCommands, choices));
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
    /** Begin an OPEN/CLOSE C-shaped container inside an existing Scene. */
    export function sceneSection(section: number, handler: () => void): void {
        if (!activeScene || activeButton || activeSceneSection != 0 ||
            (section != 1 && section != 2)) {
            record("DIALOGUE_SCENE_SECTION_CONTEXT: OPEN/CLOSE belongs inside Scene, not Button or another section.");
            return;
        }
        activeSceneSection = section;
        handler();
        activeSceneSection = 0;
    }
    /** Command line routed to the current Scene OPEN/CLOSE section. */
    export function sectionCommand(line: string): void {
        if (!activeScene || activeButton || activeSceneSection == 0) {
            record("DIALOGUE_SECTION_COMMAND_CONTEXT: Use inside OPEN or CLOSE.");
            return;
        }
        if (activeSceneSection == 1) activeScene.onOpenCommands.push(command(line));
        else activeScene.onCloseCommands.push(command(line));
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
    /**
     * Shared AST-only entry point for RUN reporters used in Dialogue resources.
     * These do not execute a command. The existing Resource Codec compiles AST
     * to JSON strings when the output plan is explicitly requested.
     */
    export function runCommandNodes(action: MCFunctionAST.CommandNode): MCFunctionAST.CommandNode[] {
        if (!action) {
            record("DIALOGUE_RUN_MISSING: A RUN command is required.");
            return [];
        }
        // A cyclic/empty nested Execute must never reach ResourceCodec.compileCommand.
        // Avoid extra string assembly and keep the AST untouched.
        let visited: MCFunctionAST.CommandNode[] = [];
        let current = action;
        while (current && current.kind == MCFunctionAST.CommandKind.Execute) {
            for (let i = 0; i < visited.length; i++) {
                if (visited[i] == current) {
                    record("DIALOGUE_RUN_CYCLE: Cyclic nested execute is invalid.");
                    return [];
                }
            }
            visited.push(current);
            current = (<MCFunctionAST.ExecuteCommand>current).run;
            if (!current) {
                record("DIALOGUE_RUN_NESTED_MISSING: Nested execute requires RUN.");
                return [];
            }
        }
        return [action];
    }
    export function buttonRunChoice(name: MCFunctionResource.TextValue,
        action: MCFunctionAST.CommandNode): MCFunctionResource.DialogueButton {
        return {name: name, commands: runCommandNodes(action)};
    }
    /**
     * Reuse Dialogue definition context for AST RUN commands.
     * target: 1=OPEN, 2=CLOSE, 3=BUTTON, 4=OPEN/CLOSE section.
     */
    export function addRunCommand(target: number, action: MCFunctionAST.CommandNode): void {
        if (target == 3) {
            if (!activeButton) {
                record("DIALOGUE_BUTTON_COMMAND_CONTEXT: Use RUN inside a button.");
                return;
            }
            let commands = runCommandNodes(action);
            for (let i = 0; i < commands.length; i++) activeButton.commands.push(commands[i]);
        } else if (target == 4) {
            if (!activeScene || activeButton || activeSceneSection == 0) {
                record("DIALOGUE_SECTION_COMMAND_CONTEXT: Use RUN inside OPEN/CLOSE.");
                return;
            }
            let commands = runCommandNodes(action);
            for (let i = 0; i < commands.length; i++) {
                if (activeSceneSection == 1) activeScene.onOpenCommands.push(commands[i]);
                else activeScene.onCloseCommands.push(commands[i]);
            }
        } else if (target == 1 || target == 2) {
            if (!activeScene || activeButton || activeSceneSection != 0) {
                record("DIALOGUE_SCENE_RUN_CONTEXT: Use RUN directly inside a Scene.");
                return;
            }
            let commands = runCommandNodes(action);
            for (let i = 0; i < commands.length; i++) {
                if (target == 1) activeScene.onOpenCommands.push(commands[i]);
                else activeScene.onCloseCommands.push(commands[i]);
            }
        } else {
            record("DIALOGUE_RUN_TARGET_INVALID: Unknown resource command target.");
        }
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
