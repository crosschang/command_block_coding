/**
 * Minecraft Position AST.
 *
 * Supports absolute, relative (~), and local (^) coordinates.
 */
namespace MCFunctionAST {
    export enum CoordinateMode {
        Absolute = 0,
        Relative = 1,
        Local = 2
    }

    export interface Coordinate {
        mode: CoordinateMode;
        value: number;
    }

    export interface Position {
        x: Coordinate;
        y: Coordinate;
        z: Coordinate;
    }

    export function createCoordinate(
        mode: CoordinateMode,
        value: number
    ): Coordinate {
        return {
            mode: mode,
            value: value
        };
    }

    export function createAbsolutePosition(
        x: number,
        y: number,
        z: number
    ): Position {
        return {
            x: createCoordinate(CoordinateMode.Absolute, x),
            y: createCoordinate(CoordinateMode.Absolute, y),
            z: createCoordinate(CoordinateMode.Absolute, z)
        };
    }

    export function createRelativePosition(
        x: number,
        y: number,
        z: number
    ): Position {
        return {
            x: createCoordinate(CoordinateMode.Relative, x),
            y: createCoordinate(CoordinateMode.Relative, y),
            z: createCoordinate(CoordinateMode.Relative, z)
        };
    }

    export function createLocalPosition(
        x: number,
        y: number,
        z: number
    ): Position {
        return {
            x: createCoordinate(CoordinateMode.Local, x),
            y: createCoordinate(CoordinateMode.Local, y),
            z: createCoordinate(CoordinateMode.Local, z)
        };
    }

    export function createPosition(
        x: Coordinate,
        y: Coordinate,
        z: Coordinate
    ): Position {
        return {
            x: x,
            y: y,
            z: z
        };
    }
}
