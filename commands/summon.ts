/**
 * summon command AST.
 *
 * Canonical project model uses two forms:
 * - Simple: entity + optional name tag + optional spawn position
 * - Advanced: entity + spawn position + required Orientation reporter + optional spawn event + optional name tag
 *
 * Orientation reuses the shared Rotation / Facing AST types.
 */
namespace MCFunctionAST {
    export enum SummonForm {
        Simple = 0,
        Advanced = 1
    }

    export enum SummonOrientationKind {
        None = 0,
        Rotation = 1,
        Facing = 2
    }

    export interface SummonOrientation {
        kind: SummonOrientationKind;
        rotation?: Rotation;
        facing?: Facing;
    }

    export interface SummonCommand extends CommandNode {
        kind: CommandKind;
        form: SummonForm;
        entityId: string;
        nameTag?: string;
        spawnPosition?: Position;
        orientation?: SummonOrientation;
        spawnEvent?: string;
    }

    export function createSummonNoOrientation(): SummonOrientation {
        return {
            kind: SummonOrientationKind.None
        };
    }

    export function createSummonRotationOrientation(
        rotation: Rotation
    ): SummonOrientation {
        return {
            kind: SummonOrientationKind.Rotation,
            rotation: rotation
        };
    }

    export function createSummonFacingOrientation(
        facing: Facing
    ): SummonOrientation {
        return {
            kind: SummonOrientationKind.Facing,
            facing: facing
        };
    }

    export function createSummonSimpleCommand(
        entityId: string,
        nameTag?: string,
        spawnPosition?: Position
    ): SummonCommand {
        return {
            kind: CommandKind.Summon,
            form: SummonForm.Simple,
            entityId: entityId,
            nameTag: nameTag,
            spawnPosition: spawnPosition
        };
    }

    export function createSummonAdvancedCommand(
        entityId: string,
        spawnPosition: Position,
        orientation: SummonOrientation,
        spawnEvent?: string,
        nameTag?: string
    ): SummonCommand {
        return {
            kind: CommandKind.Summon,
            form: SummonForm.Advanced,
            entityId: entityId,
            spawnPosition: spawnPosition,
            orientation: orientation,
            spawnEvent: spawnEvent,
            nameTag: nameTag
        };
    }
}
