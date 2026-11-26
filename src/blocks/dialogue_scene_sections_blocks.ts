/** Statement-style OPEN/CLOSE subcontainers visually organize one Scene.
 * MakeCode extensions cannot reproduce a builtin if/else multi-mouth mutator.
 * These blocks therefore stack inside the preserved C-shaped Scene handler.
 */
namespace DialogueFile {
    //% group="Scene" weight=98
    //% blockId=mcresource_dialogue_scene_open_section
    //% blockHidden=true
    //% block="OPEN — when NPC dialogue opens"
    //% handlerStatement=1
    export function openSection(handler: () => void): void {
        MCFunctionResourceProject.sceneSection(1, handler);
    }

    //% group="Scene" weight=97
    //% blockId=mcresource_dialogue_scene_close_section
    //% blockHidden=true
    //% block="CLOSE — when NPC dialogue closes"
    //% handlerStatement=1
    export function closeSection(handler: () => void): void {
        MCFunctionResourceProject.sceneSection(2, handler);
    }

    //% group="Commands" weight=99
    //% blockId=mcresource_dialogue_scene_section_command
    //% blockHidden=true
    //% block="scene OPEN / CLOSE command $line"
    //% line.shadow="text" line.defl="say hello"
    export function sectionCommand(line: string): void {
        MCFunctionResourceProject.sectionCommand(line);
    }
}
