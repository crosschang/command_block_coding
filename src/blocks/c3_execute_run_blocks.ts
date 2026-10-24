/** C3 EXECUTE RUN command reporters.
 * A separate MakeCode category with groups; each returns the canonical AST wrapper
 * accepted by Command.execute(...). Legacy Command.executeRunX() still works.
 * Do not serialize .mcfunction strings here.
 */
//% color="#7651A8" weight=95 icon="\uf04b" block="EXECUTE RUN"
//% groups='["SCOREBOARD","RIDE","DIALOGUE","SETBLOCK","FILL","GAMERULE","TAG","KILL","SUMMON","TELEPORT","GIVE","SAY","FUNCTION","RAW COMMAND"]'
namespace MCFunctionExecuteRun {
    //% group="SAY" weight=110
    //% blockId=mcfunction_execute_run_group_say
    //% block="run SAY $message"
    //% message.shadow="text" message.defl="C3 condition matched"
    export function say(message: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createSayCommand(message));
    }
    //% group="SCOREBOARD" weight=100
    //% blockId=mcfunction_execute_run_group_scoreboard
    //% block="run SCOREBOARD $action"
    export function scoreboard(action: Command.ScoreboardActionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(action ? MCFunctionBlocks.createScoreboardCommand(action.command) : undefined);
    }
    //% group="RAW COMMAND" weight=90
    //% blockId=mcfunction_execute_run_group_raw
    //% block="run RAW COMMAND $line"
    //% line.shadow="text" line.defl="say Hello"
    export function raw(line: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createRawCommand(line));
    }
    //% group="FUNCTION" weight=106
    //% blockId=mcfunction_execute_run_group_mcfunction
    //% block="run FUNCTION $functionId"
    //% functionId.shadow="text" functionId.defl="test/example"
    export function mcfunction(functionId: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createMcFunctionCommand(functionId));
    }
    //% group="KILL" weight=106
    //% blockId=mcfunction_execute_run_group_kill
    //% block="run KILL $target"
    //% target.shadow="mcfunction_selector_self"
    export function kill(target: MCFunctionFields.SelectorValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createKillCommand(target ? target.selector : undefined));
    }
    //% group="SETBLOCK" weight=110
    //% blockId=mcfunction_execute_run_group_setblock
    //% block="run SETBLOCK position $position block $block states $states"
    //% position.shadow="mcfunction_position_absolute"
    //% block.shadow="mcfunction_block_custom_id"
    //% states.shadow="mcfunction_block_states_none"
    //% inlineInputMode=external
    export function setblock(position: MCFunctionPositionFields.PositionValue,
        block: MCFunctionFields.BlockValue,
        states: MCFunctionBlockStateFields.BlockStatesValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createSetBlockCommand(
            position ? position.position : undefined, block ? block.blockId : "",
            states ? states.states : undefined));
    }
    //% group="SUMMON" weight=110
    //% blockId=mcfunction_execute_run_group_summon
    //% block="run SUMMON entity $entity at $position"
    //% entity.shadow="mcfunction_entity_select"
    //% position.shadow="mcfunction_position_absolute"
    //% inlineInputMode=external
    export function summon(entity: MCFunctionFields.EntityValue,
        position: MCFunctionPositionFields.PositionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createSummonSimpleCommand(
            entity ? entity.entityId : "", undefined, position ? position.position : undefined));
    }
    //% group="TAG" weight=107
    //% blockId=mcfunction_execute_run_group_tag
    //% block="run TAG target $target add $tag"
    //% target.shadow="mcfunction_selector_self"
    //% tag.shadow="text" tag.defl="c3_test"
    //% inlineInputMode=external
    export function tag(target: MCFunctionFields.SelectorValue,
        tag: string): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createTagCommand(target ? target.selector : undefined,
            MCFunctionAST.TagActionKind.Add, tag));
    }
    //% group="TELEPORT" weight=110
    //% blockId=mcfunction_execute_run_group_teleport
    //% block="run TP target $target destination $position"
    //% target.shadow="mcfunction_target_selector"
    //% position.shadow="mcfunction_position_absolute"
    //% inlineInputMode=external
    export function teleport(target: MCFunctionFields.TargetValue,
        position: MCFunctionPositionFields.PositionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createTeleportReferenceCommand(
            target ? target.target : undefined,
            MCFunctionAST.createTeleportPositionDestination(position ? position.position : undefined)));
    }
    //% group="GIVE" weight=107
    //% blockId=mcfunction_execute_run_group_give
    //% block="run GIVE $target item $item count $amount"
    //% target.shadow="mcfunction_selector_self"
    //% item.shadow="mcfunction_item_custom_id"
    //% amount.defl=1
    //% inlineInputMode=external
    export function give(target: MCFunctionFields.SelectorValue,
        item: string, amount: number): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createGiveCommand(
            target ? target.selector : undefined,
            MCFunctionAST.createItemStack(item, amount)));
    }
    //% group="FILL" weight=107
    //% blockId=mcfunction_execute_run_group_fill
    //% block="run FILL from $from to $to block $block states $states"
    //% from.shadow="mcfunction_position_absolute"
    //% to.shadow="mcfunction_position_absolute"
    //% block.shadow="mcfunction_block_custom_id"
    //% states.shadow="mcfunction_block_states_none"
    //% inlineInputMode=external
    export function fill(from: MCFunctionPositionFields.PositionValue,
        to: MCFunctionPositionFields.PositionValue, block: MCFunctionFields.BlockValue,
        states: MCFunctionBlockStateFields.BlockStatesValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionAST.createFillCommand(
            from ? from.position : undefined, to ? to.position : undefined,
            block ? block.blockId : "", states ? states.states : undefined));
    }
    //% group="GAMERULE" weight=103
    //% blockId=mcfunction_execute_run_group_gamerule
    //% block="run GAMERULE $action"
    export function gamerule(action: Command.GameRuleOperationValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(action ? action.command : undefined);
    }
    //% group="RIDE" weight=103
    //% blockId=mcfunction_execute_run_group_ride
    //% block="run RIDE target $target action $action"
    //% target.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_ride_action_stop"
    //% inlineInputMode=external
    export function ride(target: MCFunctionFields.TargetValue,
        action: Command.RideActionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createRideCommand(
            action ? action.action : undefined, target ? target.target : undefined,
            action ? action.mount : undefined, action ? action.entityType : undefined,
            action ? action.teleportRule : undefined, action ? action.fillType : undefined,
            action ? action.rideRule : undefined, action ? action.spawnEvent : undefined,
            action ? action.nameTag : undefined));
    }
    //% group="DIALOGUE" weight=100
    //% blockId=mcfunction_execute_run_group_dialogue
    //% block="run DIALOGUE NPC $npc action $action"
    //% npc.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_dialogue_action_open"
    //% inlineInputMode=external
    export function dialogue(npc: MCFunctionFields.TargetValue,
        action: Command.DialogueActionValue): Command.ExecuteRunValue {
        return new Command.ExecuteRunValue(MCFunctionBlocks.createDialogueCommand(
            action ? action.action : undefined, npc ? npc.target : undefined,
            action ? action.player : undefined, action ? action.sceneName : undefined));
    }
}
