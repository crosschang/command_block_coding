/** Dedicated MakeCode namespaces for Dialogue blocks.
 * Legacy DialogueFile.* APIs and block IDs are retained as hidden compatibility shims.
 * Resource AST, parser, validator and codec remain shared.
 */

//% color=#C17A38 weight=83 icon="\uf086" block="DIALOGUE SCENE"
//% groups='["C-shaped","Alternatives"]'
namespace DialogueScene {
    //% group="C-shaped" weight=140
    //% blockId=mcresource_ns_dialogue_scene_define
    //% blockHidden=true
    //% block="SCENE (C자형) $sceneTag NPC name $npcName text $message"
    //% sceneTag.shadow="text" sceneTag.defl="intro"
    //% npcName.shadow="mcresource_text_plain"
    //% message.shadow="mcresource_text_translate"
    //% handlerStatement=1
    //% inlineInputMode=external
    export function scene(sceneTag: string, npcName: ResourceText.Value,
        message: ResourceText.Value, handler: () => void): void {
        DialogueFile.scene(sceneTag,npcName,message,handler);
    }

    //% group="Alternatives" weight=92
    //% blockId=mcresource_ns_dialogue_scene_choices
    //% blockHidden=true
    //% block="scene choices $sceneTag NPC name $npcName text $message | button 1 $choice1 || button 2 $choice2 | button 3 $choice3 | button 4 $choice4 | button 5 $choice5 | button 6 $choice6"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% sceneTag.shadow="text" sceneTag.defl="intro"
    //% npcName.shadow="mcresource_text_plain"
    //% message.shadow="mcresource_text_translate"
    //% choice1.shadow="mcresource_ns_dialogue_button_choice"
    //% choice2.shadow="mcresource_ns_dialogue_button_choice"
    //% choice3.shadow="mcresource_ns_dialogue_button_choice"
    //% choice4.shadow="mcresource_ns_dialogue_button_choice"
    //% choice5.shadow="mcresource_ns_dialogue_button_choice"
    //% choice6.shadow="mcresource_ns_dialogue_button_choice"
    export function choices(sceneTag: string, npcName: ResourceText.Value,
        message: ResourceText.Value, choice1: DialogueFile.ChoiceValue,
        choice2?: DialogueFile.ChoiceValue, choice3?: DialogueFile.ChoiceValue, choice4?: DialogueFile.ChoiceValue,
        choice5?: DialogueFile.ChoiceValue, choice6?: DialogueFile.ChoiceValue): void {
        DialogueFile.sceneChoices(sceneTag,npcName,message,choice1,choice2,choice3,choice4,choice5,choice6);
    }

    //% group="Alternatives" weight=91
    //% blockId=mcresource_ns_dialogue_typed_scene
    //% blockHidden=true
    //% block="SCENE $sceneTag NPC $npcName text $message | OPEN $open | CLOSE $close | BUTTON 1 $button1 || BUTTON 2 $button2 | BUTTON 3 $button3 | BUTTON 4 $button4 | BUTTON 5 $button5 | BUTTON 6 $button6"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% sceneTag.shadow="text" sceneTag.defl="intro"
    //% npcName.shadow="mcresource_text_plain"
    //% message.shadow="mcresource_text_translate"
    //% open.shadow="mcresource_ns_dialogue_typed_open_none"
    //% close.shadow="mcresource_ns_dialogue_typed_close_none"
    //% button1.shadow="mcresource_ns_dialogue_typed_button_none"
    //% button2.shadow="mcresource_ns_dialogue_typed_button_none"
    //% button3.shadow="mcresource_ns_dialogue_typed_button_none"
    //% button4.shadow="mcresource_ns_dialogue_typed_button_none"
    //% button5.shadow="mcresource_ns_dialogue_typed_button_none"
    //% button6.shadow="mcresource_ns_dialogue_typed_button_none"
    export function typed(sceneTag: string, npcName: ResourceText.Value,
        message: ResourceText.Value, open: DialogueFile.OpenSlotValue, close: DialogueFile.CloseSlotValue,
        button1: DialogueFile.ChoiceValue, button2?: DialogueFile.ChoiceValue, button3?: DialogueFile.ChoiceValue,
        button4?: DialogueFile.ChoiceValue, button5?: DialogueFile.ChoiceValue, button6?: DialogueFile.ChoiceValue): void {
        DialogueFile.typedScene(sceneTag,npcName,message,open,close,button1,button2,button3,button4,button5,button6);
    }
}

//% color=#C17A38 weight=82 icon="\uf086" block="DIALOGUE BUTTON"
//% groups='["C-shaped","Commands","Alternatives"]'
namespace DialogueButton {
    //% group="C-shaped" weight=140
    //% blockId=mcresource_ns_dialogue_button
    //% blockHidden=true
    //% block="BUTTON (C자형) name $name"
    //% name.shadow="mcresource_text_plain"
    //% handlerStatement=1
    //% inlineInputMode=external
    export function button(name: ResourceText.Value, handler: () => void): void {
        DialogueFile.button(name,handler);
    }

    //% group="Alternatives" weight=92
    //% blockId=mcresource_ns_dialogue_button_choice
    //% blockHidden=true
    //% block="button choice name $name run $command || next command $command2 | next command $command3"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% name.shadow="mcresource_text_plain"
    //% command.shadow="text" command.defl="give @initiator minecraft:gold_ingot"
    //% command2.shadow="text"
    //% command3.shadow="text"
    export function choice(name: ResourceText.Value, command: string,
        command2?: string, command3?: string): DialogueFile.ChoiceValue {
        return DialogueFile.buttonChoice(name,command,command2,command3);
    }

    //% group="Alternatives" weight=91
    //% blockId=mcresource_ns_dialogue_typed_button_none
    //% blockHidden=true
    //% block="BUTTON 없음"
    export function none(): DialogueFile.ChoiceValue {
        return DialogueFile.buttonNone();
    }

    //% group="Commands" weight=130
    //% blockId=mcresource_ns_dialogue_button_command
    //% blockHidden=true
    //% block="button command $line"
    //% line.shadow="text" line.defl="give @initiator minecraft:gold_ingot"
    export function command(line: string): void {
        DialogueFile.buttonCommand(line);
    }
}

//% color=#C17A38 weight=81 icon="\uf086" block="DIALOGUE EVENT"
//% groups='["C-shaped","Commands","Alternatives"]'
namespace DialogueEvent {
    //% group="C-shaped" weight=140
    //% blockId=mcresource_ns_dialogue_scene_open_section
    //% blockHidden=true
    //% block="OPEN (C자형) — when NPC dialogue opens"
    //% handlerStatement=1
    export function openSection(handler: () => void): void {
        DialogueFile.openSection(handler);
    }

    //% group="C-shaped" weight=139
    //% blockId=mcresource_ns_dialogue_scene_close_section
    //% blockHidden=true
    //% block="CLOSE (C자형) — when NPC dialogue closes"
    //% handlerStatement=1
    export function closeSection(handler: () => void): void {
        DialogueFile.closeSection(handler);
    }

    //% group="Commands" weight=130
    //% blockId=mcresource_ns_dialogue_scene_section_command
    //% blockHidden=true
    //% block="scene OPEN / CLOSE command $line"
    //% line.shadow="text" line.defl="say hello"
    export function sectionCommand(line: string): void {
        DialogueFile.sectionCommand(line);
    }

    //% group="Alternatives" weight=94
    //% blockId=mcresource_ns_dialogue_typed_open_slot
    //% blockHidden=true
    //% block="OPEN || command 1 $line1 | command 2 $line2 | command 3 $line3 | command 4 $line4"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% line1.shadow="text" line1.defl="say scene opened"
    //% line2.shadow="text"
    //% line3.shadow="text"
    //% line4.shadow="text"
    export function open(line1?: string, line2?: string, line3?: string,
        line4?: string): DialogueFile.OpenSlotValue {
        return DialogueFile.openSlot(line1,line2,line3,line4);
    }

    //% group="Alternatives" weight=93
    //% blockId=mcresource_ns_dialogue_typed_close_slot
    //% blockHidden=true
    //% block="CLOSE || command 1 $line1 | command 2 $line2 | command 3 $line3 | command 4 $line4"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% line1.shadow="text" line1.defl="say scene closed"
    //% line2.shadow="text"
    //% line3.shadow="text"
    //% line4.shadow="text"
    export function close(line1?: string, line2?: string, line3?: string,
        line4?: string): DialogueFile.CloseSlotValue {
        return DialogueFile.closeSlot(line1,line2,line3,line4);
    }

    //% group="Alternatives" weight=92
    //% blockId=mcresource_ns_dialogue_typed_open_none
    //% blockHidden=true
    //% block="OPEN 없음"
    export function openNone(): DialogueFile.OpenSlotValue {
        return DialogueFile.openNone();
    }

    //% group="Alternatives" weight=91
    //% blockId=mcresource_ns_dialogue_typed_close_none
    //% blockHidden=true
    //% block="CLOSE 없음"
    export function closeNone(): DialogueFile.CloseSlotValue {
        return DialogueFile.closeNone();
    }

    //% group="Commands" weight=110
    //% blockId=mcresource_ns_dialogue_on_open_command
    //% blockHidden=true
    //% block="on open command $line"
    //% line.shadow="text" line.defl="say dialogue opened"
    export function onOpen(line: string): void {
        DialogueFile.onOpen(line);
    }

    //% group="Commands" weight=109
    //% blockId=mcresource_ns_dialogue_on_close_command
    //% blockHidden=true
    //% block="on close command $line"
    //% line.shadow="text" line.defl="say dialogue closed"
    export function onClose(line: string): void {
        DialogueFile.onClose(line);
    }
}
