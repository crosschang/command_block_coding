/** Resource authoring blocks. They only populate Resource AST; never change the game. */
//% color=#AE83CE weight=86 icon="\uf1c9" block="RAW TEXT"
//% groups='["Text", "Translate", "Dynamic", "Combine"]'
namespace ResourceText {
    export class Value {
        text: MCFunctionResource.TextValue;
        constructor(text: MCFunctionResource.TextValue) { this.text = text; }
    }
    //% blockId=mcresource_text_plain
    //% group="Text" weight=100
    //% block="plain text $value"
    //% value.shadow="text" value.defl="Hello!"
    export function plain(value: string): Value {
        return new Value(MCFunctionResource.plain(value));
    }
    //% blockId=mcresource_text_raw
    //% group="Text" weight=99
    //% block="RawText text $value"
    //% value.shadow="text" value.defl="Welcome!"
    export function text(value: string): Value {
        return new Value(MCFunctionResource.raw({
            kind: MCFunctionResource.TextPartKind.Text, value: value}));
    }
    //% blockId=mcresource_text_translate
    //% group="Translate" weight=100
    //% block="translate key $key"
    //% key.shadow="text" key.defl="dialogue.welcome"
    export function translate(key: string): Value {
        return new Value(MCFunctionResource.raw({
            kind: MCFunctionResource.TextPartKind.Translate, value: key}));
    }
    //% blockId=mcresource_text_translate_with
    //% group="Translate" weight=99
    //% block="translate $key with $arg1 || second $arg2"
    //% expandableArgumentMode="enabled"
    //% key.shadow="text" key.defl="dialogue.greeting"
    //% arg1.shadow="text" arg1.defl="Steve"
    //% arg2.shadow="text"
    export function translateWith(key: string, arg1: string, arg2?: string): Value {
        let args: string[] = [arg1];
        if (arg2 != undefined) args.push(arg2);
        return new Value(MCFunctionResource.raw({
            kind: MCFunctionResource.TextPartKind.Translate, value: key, withValues: args}));
    }
    //% blockId=mcresource_text_selector
    //% group="Dynamic" weight=100
    //% block="RawText selector $selector"
    //% selector.shadow="text" selector.defl="@p"
    export function selector(selector: string): Value {
        return new Value(MCFunctionResource.raw({
            kind: MCFunctionResource.TextPartKind.Selector, value: selector}));
    }
    //% blockId=mcresource_text_score
    //% group="Dynamic" weight=99
    //% block="RawText score name $name objective $objective"
    //% name.shadow="text" name.defl="@p"
    //% objective.shadow="text" objective.defl="points"
    export function score(name: string, objective: string): Value {
        return new Value(MCFunctionResource.raw({
            kind: MCFunctionResource.TextPartKind.Score, value: name, objective: objective}));
    }
    //% blockId=mcresource_text_join
    //% group="Combine" weight=100
    //% block="RawText join $first then $second"
    //% first.shadow="mcresource_text_raw"
    //% second.shadow="mcresource_text_translate"
    export function join(first: Value, second: Value): Value {
        return new Value(MCFunctionResource.join(
            first ? first.text : undefined, second ? second.text : undefined));
    }
    /** Serialize the value only; external resource packs still require packaging. */
    export function json(value: Value): string {
        return MCFunctionResourceCodec.text(value ? value.text : undefined);
    }
}

//% color=#47966B weight=84 icon="\uf1ab" block="LANG FILE"
//% groups='["LANG FILE", "Entries"]'
namespace LanguageFile {
    //% blockId=mcresource_lang_file_define
    //% group="LANG FILE" weight=100
    //% block="LANG file $locale"
    //% locale.shadow="text" locale.defl="en_US"
    //% blockAllowMultiple=1
    //% topblock=true
    export function define(locale: string, handler: () => void): void {
        MCFunctionResourceProject.defineLanguage(locale,handler);
    }
    //% blockId=mcresource_lang_entry
    //% group="Entries" weight=95
    //% block="translation key $key value $value || translator comment $comment"
    //% expandableArgumentMode="enabled"
    //% key.shadow="text" key.defl="dialogue.welcome"
    //% value.shadow="text" value.defl="Hello!"
    //% comment.shadow="text"
    export function entry(key: string, value: string, comment?: string): void {
        MCFunctionResourceProject.addEntry(key,value,comment);
    }
    export function output(locale: string): string {
        return MCFunctionResourceProject.outputText("texts/" + locale + ".lang");
    }
    export function languagesJson(): string {
        return MCFunctionResourceProject.outputText("texts/languages.json");
    }
}

//% color=#C17A38 weight=83 icon="\uf086" block="DIALOGUE FILE"
//% groups='["DIALOGUE FILE", "Scene", "Button", "Commands"]'
namespace DialogueFile {
    //% blockId=mcresource_dialogue_file_define
    //% group="DIALOGUE FILE" weight=100
    //% block="Dialogue JSON file $fileId format $formatVersion"
    //% fileId.shadow="text" fileId.defl="npc/intro"
    //% formatVersion.shadow="text" formatVersion.defl="1.20.80"
    //% blockAllowMultiple=1
    //% topblock=true
    export function define(fileId: string, formatVersion: string, handler: () => void): void {
        MCFunctionResourceProject.defineDialogue(fileId,formatVersion,handler);
    }
    //% blockId=mcresource_dialogue_scene_define
    //% group="Scene" weight=99
    //% block="scene $sceneTag NPC name $npcName text $message"
    //% sceneTag.shadow="text" sceneTag.defl="intro"
    //% npcName.shadow="mcresource_text_plain"
    //% message.shadow="mcresource_text_translate"
    //% handlerStatement=1
    //% inlineInputMode=external
    export function scene(sceneTag: string, npcName: ResourceText.Value,
        message: ResourceText.Value, handler: () => void): void {
        MCFunctionResourceProject.addScene(sceneTag,
            npcName ? npcName.text : undefined,
            message ? message.text : undefined,handler);
    }
    //% blockId=mcresource_dialogue_button
    //% group="Button" weight=98
    //% block="button name $name"
    //% name.shadow="mcresource_text_plain"
    //% handlerStatement=1
    //% inlineInputMode=external
    export function button(name: ResourceText.Value, handler: () => void): void {
        MCFunctionResourceProject.addButton(name ? name.text : undefined,handler);
    }
    //% blockId=mcresource_dialogue_on_open_command
    //% group="Commands" weight=97
    //% block="on open command $line"
    //% line.shadow="text" line.defl="say dialogue opened"
    export function onOpen(line: string): void {
        MCFunctionResourceProject.onOpen(line);
    }
    //% blockId=mcresource_dialogue_on_close_command
    //% group="Commands" weight=96
    //% block="on close command $line"
    //% line.shadow="text" line.defl="say dialogue closed"
    export function onClose(line: string): void {
        MCFunctionResourceProject.onClose(line);
    }
    //% blockId=mcresource_dialogue_button_command
    //% group="Commands" weight=95
    //% block="button command $line"
    //% line.shadow="text" line.defl="give @initiator minecraft:gold_ingot"
    export function buttonCommand(line: string): void {
        MCFunctionResourceProject.buttonCommand(line);
    }
    export function output(fileId: string): string {
        return MCFunctionResourceProject.outputText("dialogue/" + fileId + ".json");
    }
}
/** Export plan is pure data. File creation/packaging is a separate Converter step. */
//% color=#607D8B weight=82 icon="\uf1c5" block="RESOURCE OUTPUT"
//% groups='["Inspect", "Diagnostics"]'
namespace ResourceFiles {
    /** Compiler-ready records for the future pack exporter; no files written yet. */
    export function outputs(): MCFunctionResource.ResourceOutput[] {
        return MCFunctionResourceProject.outputPlan();
    }
    //% group="Inspect" weight=99
    //% blockId=mcresource_file_paths
    //% block="generated resource paths"
    export function paths(): string {
        let files = outputs();
        let result = "";
        for (let i = 0; i < files.length; i++) {
            if (i > 0) result += "\n";
            result += files[i].path;
        }
        return result;
    }
    //% group="Inspect" weight=98
    //% blockId=mcresource_file_content
    //% block="generated resource text $path"
    //% path.shadow="text" path.defl="dialogue/npc/intro.json"
    export function text(path: string): string {
        return MCFunctionResourceProject.outputText(path);
    }
    //% group="Diagnostics" weight=97
    //% blockId=mcresource_file_diagnostics
    //% block="resource validation report"
    export function diagnostics(): string {
        return MCFunctionResourceProject.diagnosticText();
    }
}
