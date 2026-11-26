/** Dialogue categories separated by block shape, not by Scene/Button/Event.
 * C-shaped: file / scene / button / OPEN / CLOSE (callback/handler blocks).
 * One-block: value reporters, fixed-slot alternatives and single statements.
 * All APIs delegate to preserved DialogueFile implementations; AST is unchanged.
 */

//% color=#B97132 weight=85 icon="\uf086" block="DIALOGUE C자형"
//% groups='["파일","장면","버튼","이벤트"]'
namespace DialogueC {
    //% group="파일"
    //% blockId=mcresource_shape_c_file
    //% block="Dialogue JSON file $fileId format $formatVersion"
    //% fileId.shadow="text" fileId.defl="npc/intro"
    //% formatVersion.shadow="text" formatVersion.defl="1.20.80"
    //% blockAllowMultiple=1
    //% topblock=true
    export function file(fileId: string, formatVersion: string, handler: () => void): void {
        DialogueFile.define(fileId,formatVersion,handler);
    }

    //% group="장면"
    //% blockId=mcresource_shape_c_scene
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

    //% group="버튼"
    //% blockId=mcresource_shape_c_button
    //% block="BUTTON (C자형) name $name"
    //% name.shadow="mcresource_text_plain"
    //% handlerStatement=1
    //% inlineInputMode=external
    export function button(name: ResourceText.Value, handler: () => void): void {
        DialogueFile.button(name,handler);
    }

    //% group="이벤트"
    //% blockId=mcresource_shape_c_open_section
    //% block="OPEN (C자형) — when NPC dialogue opens"
    //% handlerStatement=1
    export function openSection(handler: () => void): void {
        DialogueFile.openSection(handler);
    }

    //% group="이벤트"
    //% blockId=mcresource_shape_c_close_section
    //% block="CLOSE (C자형) — when NPC dialogue closes"
    //% handlerStatement=1
    export function closeSection(handler: () => void): void {
        DialogueFile.closeSection(handler);
    }
        }

//% color=#6484A5 weight=84 icon="\uf0c9" block="DIALOGUE 원블록"
//% groups='["장면","버튼","이벤트","명령"]'
        namespace DialogueOne {
    //% group="장면"
    //% blockId=mcresource_shape_one_scene_choices
    //% block="scene choices $sceneTag NPC name $npcName text $message | button 1 $choice1 || button 2 $choice2 | button 3 $choice3 | button 4 $choice4 | button 5 $choice5 | button 6 $choice6"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% sceneTag.shadow="text" sceneTag.defl="intro"
    //% npcName.shadow="mcresource_text_plain"
    //% message.shadow="mcresource_text_translate"
    //% choice1.shadow="mcresource_shape_one_button_choice"
    //% choice2.shadow="mcresource_shape_one_button_choice"
    //% choice3.shadow="mcresource_shape_one_button_choice"
    //% choice4.shadow="mcresource_shape_one_button_choice"
    //% choice5.shadow="mcresource_shape_one_button_choice"
    //% choice6.shadow="mcresource_shape_one_button_choice"
    export function choices(sceneTag: string, npcName: ResourceText.Value,
        message: ResourceText.Value, choice1: DialogueFile.ChoiceValue,
        choice2?: DialogueFile.ChoiceValue, choice3?: DialogueFile.ChoiceValue, choice4?: DialogueFile.ChoiceValue,
        choice5?: DialogueFile.ChoiceValue, choice6?: DialogueFile.ChoiceValue): void {
        DialogueFile.sceneChoices(sceneTag,npcName,message,choice1,choice2,choice3,choice4,choice5,choice6);
    }

    //% group="장면"
    //% blockId=mcresource_shape_one_scene_typed
    //% block="SCENE $sceneTag NPC $npcName text $message | OPEN $open | CLOSE $close | BUTTON 1 $button1 || BUTTON 2 $button2 | BUTTON 3 $button3 | BUTTON 4 $button4 | BUTTON 5 $button5 | BUTTON 6 $button6"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% sceneTag.shadow="text" sceneTag.defl="intro"
    //% npcName.shadow="mcresource_text_plain"
    //% message.shadow="mcresource_text_translate"
    //% open.shadow="mcresource_shape_one_open_none"
    //% close.shadow="mcresource_shape_one_close_none"
    //% button1.shadow="mcresource_shape_one_button_none"
    //% button2.shadow="mcresource_shape_one_button_none"
    //% button3.shadow="mcresource_shape_one_button_none"
    //% button4.shadow="mcresource_shape_one_button_none"
    //% button5.shadow="mcresource_shape_one_button_none"
    //% button6.shadow="mcresource_shape_one_button_none"
    export function typed(sceneTag: string, npcName: ResourceText.Value,
        message: ResourceText.Value, open: DialogueFile.OpenSlotValue, close: DialogueFile.CloseSlotValue,
        button1: DialogueFile.ChoiceValue, button2?: DialogueFile.ChoiceValue, button3?: DialogueFile.ChoiceValue,
        button4?: DialogueFile.ChoiceValue, button5?: DialogueFile.ChoiceValue, button6?: DialogueFile.ChoiceValue): void {
        DialogueFile.typedScene(sceneTag,npcName,message,open,close,button1,button2,button3,button4,button5,button6);
    }

    //% group="버튼"
    //% blockId=mcresource_shape_one_button_choice
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

    //% group="버튼"
    //% blockId=mcresource_shape_one_button_none
    //% block="BUTTON 없음"
    export function none(): DialogueFile.ChoiceValue {
        return DialogueFile.buttonNone();
    }

    //% group="이벤트"
    //% blockId=mcresource_shape_one_open_slot
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

    //% group="이벤트"
    //% blockId=mcresource_shape_one_close_slot
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

    //% group="이벤트"
    //% blockId=mcresource_shape_one_open_none
    //% block="OPEN 없음"
    export function openNone(): DialogueFile.OpenSlotValue {
        return DialogueFile.openNone();
    }

    //% group="이벤트"
    //% blockId=mcresource_shape_one_close_none
    //% block="CLOSE 없음"
    export function closeNone(): DialogueFile.CloseSlotValue {
        return DialogueFile.closeNone();
    }

    //% group="명령"
    //% blockId=mcresource_shape_one_button_command
    //% block="button command $line"
    //% line.shadow="text" line.defl="give @initiator minecraft:gold_ingot"
    export function command(line: string): void {
        DialogueFile.buttonCommand(line);
    }

    //% group="명령"
    //% blockId=mcresource_shape_one_section_command
    //% block="scene OPEN / CLOSE command $line"
    //% line.shadow="text" line.defl="say hello"
    export function sectionCommand(line: string): void {
        DialogueFile.sectionCommand(line);
    }

    //% group="명령"
    //% blockId=mcresource_shape_one_on_open
    //% block="on open command $line"
    //% line.shadow="text" line.defl="say dialogue opened"
    export function onOpen(line: string): void {
        DialogueFile.onOpen(line);
    }

    //% group="명령"
    //% blockId=mcresource_shape_one_on_close
    //% block="on close command $line"
    //% line.shadow="text" line.defl="say dialogue closed"
    export function onClose(line: string): void {
        DialogueFile.onClose(line);
    }
        }
