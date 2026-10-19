/** A8 MakeCode public blocks: spawnpoint and setworldspawn. */
namespace Command {
    /** Use the executor's current location as their personal spawn point. */
    //% blockId=command_spawnpoint_default
    //% group="SPAWNPOINT" weight=100
    //% block="SPAWNPOINT self at current position"
    export function spawnpointDefault(): void {
        executeAudioCommand(MCFunctionBlocks.createSpawnPointCommand(MCFunctionAST.SpawnPointMode.Default));
    }

    /** Use a selected player's current location. */
    //% blockId=command_spawnpoint_selector
    //% group="SPAWNPOINT" weight=99
    //% block="SPAWNPOINT target $target at current position"
    //% target.shadow="mcfunction_selector_self"
    //% inlineInputMode=external
    export function spawnpointSelector(target: MCFunctionFields.SelectorValue): void {
        executeAudioCommand(MCFunctionBlocks.createSpawnPointCommand(
            MCFunctionAST.SpawnPointMode.TargetCurrent,
            MCFunctionAST.createSelectorPlayerTarget(target ? target.selector : undefined)));
    }

    /** Specify a player selector and all three coordinates. */
    //% blockId=command_spawnpoint_selector_at
    //% group="SPAWNPOINT" weight=98
    //% block="SPAWNPOINT target $target position $position"
    //% target.shadow="mcfunction_selector_self"
    //% position.shadow="mcfunction_position_absolute"
    //% inlineInputMode=external
    export function spawnpointSelectorAt(target: MCFunctionFields.SelectorValue,
        position: MCFunctionPositionFields.PositionValue): void {
        executeAudioCommand(MCFunctionBlocks.createSpawnPointCommand(
            MCFunctionAST.SpawnPointMode.TargetAt,
            MCFunctionAST.createSelectorPlayerTarget(target ? target.selector : undefined),
            position ? position.position : undefined));
    }

    /** Direct player names remain editable instead of being a fixed registry. */
    //% blockId=command_spawnpoint_named
    //% group="SPAWNPOINT" weight=97
    //% block="SPAWNPOINT named player $playerName at current position"
    //% playerName.shadow="text" playerName.defl="Steve"
    export function spawnpointNamed(playerName: string): void {
        executeAudioCommand(MCFunctionBlocks.createSpawnPointCommand(
            MCFunctionAST.SpawnPointMode.TargetCurrent,
            MCFunctionAST.createNamedPlayerTarget(playerName)));
    }

    //% blockId=command_spawnpoint_named_at
    //% group="SPAWNPOINT" weight=96
    //% block="SPAWNPOINT named player $playerName position $position"
    //% playerName.shadow="text" playerName.defl="Steve"
    //% position.shadow="mcfunction_position_absolute"
    //% inlineInputMode=external
    export function spawnpointNamedAt(playerName: string,
        position: MCFunctionPositionFields.PositionValue): void {
        executeAudioCommand(MCFunctionBlocks.createSpawnPointCommand(
            MCFunctionAST.SpawnPointMode.TargetAt,
            MCFunctionAST.createNamedPlayerTarget(playerName),
            position ? position.position : undefined));
    }

    /** The world's default spawn is separate from each player's spawn. */
    //% blockId=command_setworldspawn_default
    //% group="SETWORLDSPAWN" weight=100
    //% block="SETWORLDSPAWN current position"
    export function setWorldSpawnDefault(): void {
        executeAudioCommand(MCFunctionBlocks.createSetWorldSpawnCommand(MCFunctionAST.SetWorldSpawnMode.Current));
    }

    //% blockId=command_setworldspawn_at
    //% group="SETWORLDSPAWN" weight=99
    //% block="SETWORLDSPAWN position $position"
    //% position.shadow="mcfunction_position_absolute"
    //% inlineInputMode=external
    export function setWorldSpawnAt(position: MCFunctionPositionFields.PositionValue): void {
        executeAudioCommand(MCFunctionBlocks.createSetWorldSpawnCommand(
            MCFunctionAST.SetWorldSpawnMode.At,
            position ? position.position : undefined));
    }
}
