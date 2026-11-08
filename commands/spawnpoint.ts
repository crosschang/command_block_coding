/** Bedrock/Education player spawn and world spawn commands. */
namespace MCFunctionAST {
    export enum SpawnPointMode {
        Default = 0,
        TargetCurrent = 1,
        TargetAt = 2
    }

    export enum SetWorldSpawnMode {
        Current = 0,
        At = 1
    }

    export enum ClearSpawnPointMode {
        Default = 0,
        Target = 1
    }

    export interface SpawnPointCommand extends CommandNode {
        mode: SpawnPointMode;
        /** Omitted player means the executor. */
        target?: PlayerTarget;
        position?: Position;
    }

    export interface SetWorldSpawnCommand extends CommandNode {
        mode: SetWorldSpawnMode;
        position?: Position;
    }

    export interface ClearSpawnPointCommand extends CommandNode {
        mode: ClearSpawnPointMode;
        target?: PlayerTarget;
    }

    export function createSpawnPointCommand(mode: SpawnPointMode, target?: PlayerTarget,
        position?: Position): SpawnPointCommand {
        return { kind: CommandKind.SpawnPoint, mode: mode, target: target, position: position };
    }

    export function createSetWorldSpawnCommand(mode: SetWorldSpawnMode,
        position?: Position): SetWorldSpawnCommand {
        return { kind: CommandKind.SetWorldSpawn, mode: mode, position: position };
    }

    export function createClearSpawnPointCommand(mode: ClearSpawnPointMode,
        target?: PlayerTarget): ClearSpawnPointCommand {
        return { kind: CommandKind.ClearSpawnPoint, mode: mode, target: target };
    }
}
