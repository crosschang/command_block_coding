/** AST RUN reporters shared by EXECUTE and Dialogue One-block editor.
 * All reporter inputs are Command.ExecuteRunValue, including nested EXECUTE
 * returned by ExecuteOne.command(). No game command runs during authoring.
 */
namespace DialogueOne {
    //% group="버튼" weight=120
    //% blockId=mcresource_shape_one_button_execute_run
    //% block="button name $name RUN $action"
    //% name.shadow="mcresource_text_plain"
    //% action.shadow="mcfunction_execute_run_group_say"
    //% inlineInputMode=external
    export function buttonRun(name: ResourceText.Value,
        action: Command.ExecuteRunValue): DialogueFile.ChoiceValue {
        return new DialogueFile.ChoiceValue(MCFunctionResourceProject.buttonRunChoice(
            name ? name.text : undefined, action ? action.command : undefined));
    }
    //% group="이벤트" weight=119
    //% blockId=mcresource_shape_one_open_execute_run
    //% block="OPEN RUN $action"
    //% action.shadow="mcfunction_execute_run_group_say"
    export function openRun(action: Command.ExecuteRunValue): DialogueFile.OpenSlotValue {
        return new DialogueFile.OpenSlotValue(MCFunctionResourceProject.runCommandNodes(
            action ? action.command : undefined));
    }
    //% group="이벤트" weight=118
    //% blockId=mcresource_shape_one_close_execute_run
    //% block="CLOSE RUN $action"
    //% action.shadow="mcfunction_execute_run_group_say"
    export function closeRun(action: Command.ExecuteRunValue): DialogueFile.CloseSlotValue {
        return new DialogueFile.CloseSlotValue(MCFunctionResourceProject.runCommandNodes(
            action ? action.command : undefined));
    }
    //% group="명령" weight=113
    //% blockId=mcresource_shape_one_button_command_run
    //% block="button command RUN $action"
    //% action.shadow="mcfunction_execute_run_group_say"
    export function buttonCommandRun(action: Command.ExecuteRunValue): void {
        MCFunctionResourceProject.addRunCommand(3, action ? action.command : undefined);
    }
    //% group="명령" weight=112
    //% blockId=mcresource_shape_one_section_command_run
    //% block="OPEN / CLOSE command RUN $action"
    //% action.shadow="mcfunction_execute_run_group_say"
    export function sectionCommandRun(action: Command.ExecuteRunValue): void {
        MCFunctionResourceProject.addRunCommand(4, action ? action.command : undefined);
    }
    //% group="명령" weight=111
    //% blockId=mcresource_shape_one_on_open_run
    //% block="on open RUN $action"
    //% action.shadow="mcfunction_execute_run_group_say"
    export function onOpenRun(action: Command.ExecuteRunValue): void {
        MCFunctionResourceProject.addRunCommand(1, action ? action.command : undefined);
    }
    //% group="명령" weight=110
    //% blockId=mcresource_shape_one_on_close_run
    //% block="on close RUN $action"
    //% action.shadow="mcfunction_execute_run_group_say"
    export function onCloseRun(action: Command.ExecuteRunValue): void {
        MCFunctionResourceProject.addRunCommand(2, action ? action.command : undefined);
    }
}
