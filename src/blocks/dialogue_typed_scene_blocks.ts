/** Fixed-slot Dialogue Scene: Blockly typed value inputs limit which blocks can attach.
 * OPEN only accepts OpenSlotValue; CLOSE only accepts CloseSlotValue; BUTTON only
 * accepts ChoiceValue. Unlike the legacy callback HANDLER's untyped statement space.
 * Resource AST remains the sole source of truth for command semantics.
 */
namespace DialogueFile {
    export class OpenSlotValue {
        // Distinct brand ensures an OPEN cannot be used as a CLOSE in TypeScript.
        openSlotKind: boolean;
        commands: MCFunctionAST.CommandNode[];
        constructor(commands: MCFunctionAST.CommandNode[]) {
            this.openSlotKind = true;
            this.commands = commands;
        }
    }
    export class CloseSlotValue {
        // A different brand ensures the CLOSE input rejects OPEN values.
        closeSlotKind: boolean;
        commands: MCFunctionAST.CommandNode[];
        constructor(commands: MCFunctionAST.CommandNode[]) {
            this.closeSlotKind = true;
            this.commands = commands;
        }
    }

    function sceneLines(line1?: string, line2?: string, line3?: string,
        line4?: string): string[] {
        let lines: string[] = [];
        if (line1 != undefined && line1.length > 0) lines.push(line1);
        if (line2 != undefined && line2.length > 0) lines.push(line2);
        if (line3 != undefined && line3.length > 0) lines.push(line3);
        if (line4 != undefined && line4.length > 0) lines.push(line4);
        return lines;
    }

    //% group="Structured Scene" weight=118
    //% blockId=mcresource_dialogue_typed_open_slot
    //% blockHidden=true
    //% block="OPEN || command 1 $line1 | command 2 $line2 | command 3 $line3 | command 4 $line4"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% line1.shadow="text" line1.defl="say scene opened"
    //% line2.shadow="text"
    //% line3.shadow="text"
    //% line4.shadow="text"
    export function openSlot(line1?: string, line2?: string, line3?: string,
        line4?: string): OpenSlotValue {
        return new OpenSlotValue(MCFunctionResourceProject.createSceneCommandList(
            sceneLines(line1, line2, line3, line4)));
    }

    //% group="Structured Scene" weight=117
    //% blockId=mcresource_dialogue_typed_close_slot
    //% blockHidden=true
    //% block="CLOSE || command 1 $line1 | command 2 $line2 | command 3 $line3 | command 4 $line4"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% line1.shadow="text" line1.defl="say scene closed"
    //% line2.shadow="text"
    //% line3.shadow="text"
    //% line4.shadow="text"
    export function closeSlot(line1?: string, line2?: string, line3?: string,
        line4?: string): CloseSlotValue {
        return new CloseSlotValue(MCFunctionResourceProject.createSceneCommandList(
            sceneLines(line1, line2, line3, line4)));
    }

    /**
     * Explicit empty placeholders are typed values, not commands. They cannot
     * become text or other slot types and never add an empty JSON command.
     */
    //% group="Structured Scene" weight=116
    //% blockId=mcresource_dialogue_typed_open_none
    //% blockHidden=true
    //% block="OPEN 없음"
    export function openNone(): OpenSlotValue {
        return new OpenSlotValue([]);
    }

    //% group="Structured Scene" weight=115
    //% blockId=mcresource_dialogue_typed_close_none
    //% blockHidden=true
    //% block="CLOSE 없음"
    export function closeNone(): CloseSlotValue {
        return new CloseSlotValue([]);
    }

    //% group="Structured Scene" weight=114
    //% blockId=mcresource_dialogue_typed_button_none
    //% blockHidden=true
    //% block="BUTTON 없음"
    export function buttonNone(): ChoiceValue {
        return new ChoiceValue(undefined);
    }

    /** Fixed order; expandable buttons 2-6 are all typed ChoiceValue inputs. */
    //% group="Structured Scene" weight=120
    //% blockId=mcresource_dialogue_typed_scene
    //% blockHidden=true
    //% block="SCENE $sceneTag NPC $npcName text $message | OPEN $open | CLOSE $close | BUTTON 1 $button1 || BUTTON 2 $button2 | BUTTON 3 $button3 | BUTTON 4 $button4 | BUTTON 5 $button5 | BUTTON 6 $button6"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% sceneTag.shadow="text" sceneTag.defl="intro"
    //% npcName.shadow="mcresource_text_plain"
    //% message.shadow="mcresource_text_translate"
    //% open.shadow="mcresource_dialogue_typed_open_none"
    //% close.shadow="mcresource_dialogue_typed_close_none"
    //% button1.shadow="mcresource_dialogue_typed_button_none"
    //% button2.shadow="mcresource_dialogue_typed_button_none"
    //% button3.shadow="mcresource_dialogue_typed_button_none"
    //% button4.shadow="mcresource_dialogue_typed_button_none"
    //% button5.shadow="mcresource_dialogue_typed_button_none"
    //% button6.shadow="mcresource_dialogue_typed_button_none"
    export function typedScene(sceneTag: string, npcName: ResourceText.Value,
        message: ResourceText.Value, open: OpenSlotValue, close: CloseSlotValue,
        button1: ChoiceValue, button2?: ChoiceValue, button3?: ChoiceValue,
        button4?: ChoiceValue, button5?: ChoiceValue, button6?: ChoiceValue): void {
        let buttons: MCFunctionResource.DialogueButton[] = [];
        if (button1 && button1.button) buttons.push(button1.button);
        if (button2 && button2.button) buttons.push(button2.button);
        if (button3 && button3.button) buttons.push(button3.button);
        if (button4 && button4.button) buttons.push(button4.button);
        if (button5 && button5.button) buttons.push(button5.button);
        if (button6 && button6.button) buttons.push(button6.button);
        MCFunctionResourceProject.addTypedScene(sceneTag,
            npcName ? npcName.text : undefined, message ? message.text : undefined,
            open ? open.commands : [], close ? close.commands : [], buttons);
    }
}
