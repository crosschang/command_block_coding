/**
 * Minecraft Rotation AST.
 *
 * Supports absolute values and relative (~) values.
 * Local (^) rotation is not valid here.
 */
namespace MCFunctionAST {
    export enum RotationMode {
        Absolute = 0,
        Relative = 1
    }

    export interface RotationValue {
        mode: RotationMode;
        value: number;
    }

    export interface Rotation {
        yaw: RotationValue;
        pitch: RotationValue;
    }

    export function createRotationValue(
        mode: RotationMode,
        value: number
    ): RotationValue {
        return {
            mode: mode,
            value: value
        };
    }

    export function createAbsoluteRotation(
        yaw: number,
        pitch: number
    ): Rotation {
        return {
            yaw: createRotationValue(RotationMode.Absolute, yaw),
            pitch: createRotationValue(RotationMode.Absolute, pitch)
        };
    }

    export function createRelativeRotation(
        yaw: number,
        pitch: number
    ): Rotation {
        return {
            yaw: createRotationValue(RotationMode.Relative, yaw),
            pitch: createRotationValue(RotationMode.Relative, pitch)
        };
    }

    export function createRotation(
        yaw: RotationValue,
        pitch: RotationValue
    ): Rotation {
        return {
            yaw: yaw,
            pitch: pitch
        };
    }
}
