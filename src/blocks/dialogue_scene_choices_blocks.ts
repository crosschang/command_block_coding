/** Additive Scene UI: MakeCode's supported expandable arguments provide + / - choices.
 * This is not Blockly's unlimited if/else mutator. Existing C-shaped Scene blocks
 * remain the advanced form with unlimited command statement inputs.
 */
namespace DialogueFile {
    /** The editable output of one button choice, independent from the game runtime. */
    export class ChoiceValue {
        button: MCFunctionResource.DialogueButton;
        constructor(button: MCFunctionResource.DialogueButton) {
            this.button = button;
        }
    }

    //% group="Button" weight=110
    //% blockId=mcresource_dialogue_button_choice
    //% blockHidden=true
    //% block="button choice name $name run $command || next command $command2 | next command $command3"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% name.shadow="mcresource_text_plain"
    //% command.shadow="text" command.defl="give @initiator minecraft:gold_ingot"
    //% command2.shadow="text"
    //% command3.shadow="text"
    export function buttonChoice(name: ResourceText.Value, command: string,
        command2?: string, command3?: string): ChoiceValue {
        let commands: string[] = [command];
        if (command2 != undefined && command2.length > 0) commands.push(command2);
        if (command3 != undefined && command3.length > 0) commands.push(command3);
        return new ChoiceValue(MCFunctionResourceProject.createButtonChoice(
            name ? name.text : undefined, commands));
    }

    /**
     * Up to six authoring choices (Minecraft Education NPC UI guidance).
     * The + / - controls show optional choice inputs one at a time.
     * Buttons are stored in their original order in the Scene AST.
     */
    //% group="Scene" weight=110
    //% blockId=mcresource_dialogue_scene_choices
    //% blockHidden=true
    //% block="scene choices $sceneTag NPC name $npcName text $message | button 1 $choice1 || button 2 $choice2 | button 3 $choice3 | button 4 $choice4 | button 5 $choice5 | button 6 $choice6"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=external
    //% sceneTag.shadow="text" sceneTag.defl="intro"
    //% npcName.shadow="mcresource_text_plain"
    //% message.shadow="mcresource_text_translate"
    //% choice1.shadow="mcresource_dialogue_button_choice"
    //% choice2.shadow="mcresource_dialogue_button_choice"
    //% choice3.shadow="mcresource_dialogue_button_choice"
    //% choice4.shadow="mcresource_dialogue_button_choice"
    //% choice5.shadow="mcresource_dialogue_button_choice"
    //% choice6.shadow="mcresource_dialogue_button_choice"
    export function sceneChoices(sceneTag: string, npcName: ResourceText.Value,
        message: ResourceText.Value, choice1: ChoiceValue,
        choice2?: ChoiceValue, choice3?: ChoiceValue, choice4?: ChoiceValue,
        choice5?: ChoiceValue, choice6?: ChoiceValue): void {
        let choices: MCFunctionResource.DialogueButton[] = [];
        if (choice1) choices.push(choice1.button);
        if (choice2) choices.push(choice2.button);
        if (choice3) choices.push(choice3.button);
        if (choice4) choices.push(choice4.button);
        if (choice5) choices.push(choice5.button);
        if (choice6) choices.push(choice6.button);
        MCFunctionResourceProject.addSceneChoices(sceneTag,
            npcName ? npcName.text : undefined,
            message ? message.text : undefined, choices);
    }
}
