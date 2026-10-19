/** A8 MakeCode public blocks: spawnpoint and setworldspawn. */
namespace Command {
    /** A typed target reporter keeps selector and named-player ASTs distinct. */
    export class SpawnPointTargetValue {
        target: MCFunctionAST.PlayerTarget;
        constructor(target: MCFunctionAST.PlayerTarget) {
            this.target = target;
        }
    }

    //% blockId=mcfunction_spawnpoint_target_selector
    //% blockHidden=true
    //% group="SPAWNPOINT" weight=99
    //% block="selector $selector"
    //% selector.shadow="mcfunction_selector_self"
    //% inlineInputMode=external
    export function spawnpointTargetSelector(selector: MCFunctionFields.SelectorValue): SpawnPointTargetValue {
        return new SpawnPointTargetValue(MCFunctionAST.createSelectorPlayerTarget(
            selector ? selector.selector : undefined));
    }

    //% blockId=mcfunction_spawnpoint_target_named
    //% blockHidden=true
    //% group="SPAWNPOINT" weight=98
    //% block="named player $playerName"
    //% playerName.shadow="text" playerName.defl="Steve"
    export function spawnpointTargetNamed(playerName: string): SpawnPointTargetValue {
        return new SpawnPointTargetValue(MCFunctionAST.createNamedPlayerTarget(playerName));
    }

    /** Previous compact A8 block remains for existing saved workspaces. */
    //% blockId=command_spawnpoint_compact
    //% blockHidden=true
    //% group="SPAWNPOINT" weight=100
    //% block="SPAWNPOINT || target $target position $position"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_spawnpoint_target_selector"
    //% position.shadow="mcfunction_position_absolute"
    export function spawnpointCompact(target?: SpawnPointTargetValue,
        position?: MCFunctionPositionFields.PositionValue): void {
        let mode = position ? MCFunctionAST.SpawnPointMode.TargetAt :
            target ? MCFunctionAST.SpawnPointMode.TargetCurrent : MCFunctionAST.SpawnPointMode.Default;
        // Position without target is intentionally invalid; the shared Validator
        // reports PLAYER_TARGET_MISSING instead of silently dropping coordinates.
        executeAudioCommand(MCFunctionBlocks.createSpawnPointCommand(mode,
            target ? target.target : undefined, position ? position.position : undefined));
    }

    /** New compact block uses the common TARGET reporters in SELECTOR. */
    //% blockId=command_spawnpoint_shared
    //% group="SPAWNPOINT" weight=110
    //% block="SPAWNPOINT || target $target position $position"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% position.shadow="mcfunction_position_absolute"
    export function spawnpointShared(target?: MCFunctionFields.TargetValue,
        position?: MCFunctionPositionFields.PositionValue): void {
        let mode = position ? MCFunctionAST.SpawnPointMode.TargetAt :
            target ? MCFunctionAST.SpawnPointMode.TargetCurrent : MCFunctionAST.SpawnPointMode.Default;
        executeAudioCommand(MCFunctionBlocks.createSpawnPointCommand(mode,
            target ? target.target : undefined, position ? position.position : undefined));
    }

    /** One expandable world-spawn block covers omitted and explicit positions. */
    //% blockId=command_setworldspawn_compact
    //% group="SETWORLDSPAWN" weight=100
    //% block="SETWORLDSPAWN || position $position"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% position.shadow="mcfunction_position_absolute"
    export function setWorldSpawnCompact(position?: MCFunctionPositionFields.PositionValue): void {
        executeAudioCommand(MCFunctionBlocks.createSetWorldSpawnCommand(
            position ? MCFunctionAST.SetWorldSpawnMode.At : MCFunctionAST.SetWorldSpawnMode.Current,
            position ? position.position : undefined));
    }

    // Legacy entry points remain callable for JS and saved MakeCode blocks.
    // Hiding them removes duplicate toolbox choices without changing block IDs.
    /** Use the executor's current location as their personal spawn point. */
    //% blockId=command_spawnpoint_default
    //% blockHidden=true
    //% group="SPAWNPOINT" weight=100
    //% block="SPAWNPOINT self at current position"
    export function spawnpointDefault(): void {
        executeAudioCommand(MCFunctionBlocks.createSpawnPointCommand(MCFunctionAST.SpawnPointMode.Default));
    }

    /** Use a selected player's current location. */
    //% blockId=command_spawnpoint_selector
    //% blockHidden=true
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
    //% blockHidden=true
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
    //% blockHidden=true
    //% group="SPAWNPOINT" weight=97
    //% block="SPAWNPOINT named player $playerName at current position"
    //% playerName.shadow="text" playerName.defl="Steve"
    export function spawnpointNamed(playerName: string): void {
        executeAudioCommand(MCFunctionBlocks.createSpawnPointCommand(
            MCFunctionAST.SpawnPointMode.TargetCurrent,
            MCFunctionAST.createNamedPlayerTarget(playerName)));
    }

    //% blockId=command_spawnpoint_named_at
    //% blockHidden=true
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
    //% blockHidden=true
    //% group="SETWORLDSPAWN" weight=100
    //% block="SETWORLDSPAWN current position"
    export function setWorldSpawnDefault(): void {
        executeAudioCommand(MCFunctionBlocks.createSetWorldSpawnCommand(MCFunctionAST.SetWorldSpawnMode.Current));
    }

    //% blockId=command_setworldspawn_at
    //% blockHidden=true
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
