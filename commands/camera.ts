/** CAMERA basic presets and clear: canonical Bedrock/Education AST. */
namespace MCFunctionAST {
    export enum CameraAction {
        Set = 0,
        Clear = 1,
        Fade = 2
    }

    export enum CameraEaseType {
        Linear = 0, InSine = 1, OutSine = 2, InOutSine = 3,
        InQuad = 4, OutQuad = 5, InOutQuad = 6,
        InCubic = 7, OutCubic = 8, InOutCubic = 9,
        InQuart = 10, OutQuart = 11, InOutQuart = 12,
        InQuint = 13, OutQuint = 14, InOutQuint = 15,
        InExpo = 16, OutExpo = 17, InOutExpo = 18,
        InCirc = 19, OutCirc = 20, InOutCirc = 21,
        InBack = 22, OutBack = 23, InOutBack = 24,
        InElastic = 25, OutElastic = 26, InOutElastic = 27,
        InBounce = 28, OutBounce = 29, InOutBounce = 30, Spring = 31
    }
    export interface CameraEase { seconds: number; type: CameraEaseType; }
    export interface CameraFadeTime { fadeIn: number; hold: number; fadeOut: number; }
    export interface CameraFadeColor { red: number; green: number; blue: number; }

    export interface CameraCommand extends CommandNode {
        kind: CommandKind;
        action: CameraAction;
        target: Selector;
        /** Preset ID is preserved exactly, including custom namespace IDs. Required only for Set. */
        presetId?: string;
        /** Optional advanced camera position; uses the shared Position AST. */
        position?: Position;
        /** Shared rotation (yaw/pitch); camera syntax emits pitch (xRot) then yaw (yRot). */
        rotation?: Rotation;
        /** Facing is mutually exclusive with rotation. Shared Facing AST. */
        facing?: Facing;
        ease?: CameraEase;
        useDefault?: boolean;
        fadeTime?: CameraFadeTime;
        fadeColor?: CameraFadeColor;
    }

    export function createCameraSetCommand(target: Selector, presetId: string): CameraCommand {
        return { kind: CommandKind.Camera, action: CameraAction.Set, target: target, presetId: presetId };
    }

    export function createCameraSetAdvancedCommand(
        target: Selector, presetId: string, position?: Position, rotation?: Rotation
    ): CameraCommand {
        return {
            kind: CommandKind.Camera, action: CameraAction.Set,
            target: target, presetId: presetId, position: position, rotation: rotation
        };
    }

    export function createCameraClearCommand(target: Selector): CameraCommand {
        return { kind: CommandKind.Camera, action: CameraAction.Clear, target: target };
    }
    export function createCameraSetOptionsCommand(target: Selector, presetId: string,
        position?: Position, rotation?: Rotation, facing?: Facing,
        ease?: CameraEase, useDefault?: boolean): CameraCommand {
        return { kind: CommandKind.Camera, action: CameraAction.Set, target: target,
            presetId: presetId, position: position, rotation: rotation,
            facing: facing, ease: ease, useDefault: useDefault };
    }
    export function createCameraFadeCommand(target: Selector,
        fadeTime?: CameraFadeTime, fadeColor?: CameraFadeColor): CameraCommand {
        return { kind: CommandKind.Camera, action: CameraAction.Fade, target: target,
            fadeTime: fadeTime, fadeColor: fadeColor };
    }

}
