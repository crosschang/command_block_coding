/** Bedrock/Education CAMERASHAKE AST. Never infer absent positional arguments. */
namespace MCFunctionAST {
    export enum CameraShakeAction {
        Add = 0,
        Stop = 1
    }

    export enum CameraShakeType {
        Positional = 0,
        Rotational = 1
    }

    export interface CameraShakeCommand extends CommandNode {
        kind: CommandKind;
        action: CameraShakeAction;
        /** Required for add; optional for stop. */
        target?: Selector;
        /** Add-only optional args. Distinguish zero from omission. */
        intensity?: number;
        seconds?: number;
        shakeType?: CameraShakeType;
    }

    export function createCameraShakeAddCommand(
        target: Selector,
        intensity?: number,
        seconds?: number,
        shakeType?: CameraShakeType
    ): CameraShakeCommand {
        return {
            kind: CommandKind.CameraShake,
            action: CameraShakeAction.Add,
            target: target,
            intensity: intensity,
            seconds: seconds,
            shakeType: shakeType
        };
    }

    export function createCameraShakeStopCommand(target?: Selector): CameraShakeCommand {
        return {
            kind: CommandKind.CameraShake,
            action: CameraShakeAction.Stop,
            target: target
        };
    }
}
