/** CAMERA basic presets and clear: canonical Bedrock/Education AST. */
namespace MCFunctionAST {
    export enum CameraAction {
        Set = 0,
        Clear = 1
    }

    export interface CameraCommand extends CommandNode {
        kind: CommandKind;
        action: CameraAction;
        target: Selector;
        /** Preset ID is preserved exactly, including custom namespace IDs. Required only for Set. */
        presetId?: string;
    }

    export function createCameraSetCommand(target: Selector, presetId: string): CameraCommand {
        return { kind: CommandKind.Camera, action: CameraAction.Set, target: target, presetId: presetId };
    }

    export function createCameraClearCommand(target: Selector): CameraCommand {
        return { kind: CommandKind.Camera, action: CameraAction.Clear, target: target };
    }
}
