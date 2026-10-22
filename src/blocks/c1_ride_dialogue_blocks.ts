/** C1 MakeCode UI -> typed command adapter -> AST -> validation/compiler. */
namespace Command {
    export enum RideTeleportChoice {
        //% block="teleport rider"
        Rider = 0,
        //% block="teleport ride"
        Ride = 1
    }
    export enum RideFillChoice {
        //% block="until full"
        UntilFull = 0,
        //% block="if group fits"
        IfGroupFits = 1
    }
    export enum RideSummonRuleChoice {
        //% block="no ride change"
        NoRideChange = 0,
        //% block="reassign rides"
        ReassignRides = 1,
        //% block="skip riders"
        SkipRiders = 2
    }
    export class RideStartOptionsValue {
        teleportRule: MCFunctionAST.RideTeleportRule;
        fillType?: MCFunctionAST.RideFillType;
        constructor(rule: MCFunctionAST.RideTeleportRule,
            fill?: MCFunctionAST.RideFillType) { this.teleportRule = rule; this.fillType = fill; }
    }
    //% blockId=mcfunction_ride_start_options
    //% group="RIDE" weight=97
    //% block="ride teleport $teleport || fill $fill"
    //% expandableArgumentMode="enabled"
    export function rideStartOptions(teleport: RideTeleportChoice,
        fill?: RideFillChoice): RideStartOptionsValue {
        return new RideStartOptionsValue(<MCFunctionAST.RideTeleportRule><number>teleport,
            fill == undefined ? undefined : <MCFunctionAST.RideFillType><number>fill);
    }
    export class RideSummonOptionsValue {
        rule?: MCFunctionAST.RideSummonRule;
        eventId?: string;
        nameTag?: string;
        constructor(rule?: MCFunctionAST.RideSummonRule, eventId?: string,
            nameTag?: string) { this.rule = rule; this.eventId = eventId; this.nameTag = nameTag; }
    }
    //% blockId=mcfunction_ride_summon_ride_options
    //% group="RIDE" weight=96
    //% block="summon ride rule $rule || spawn event $eventId name $nameTag"
    //% expandableArgumentMode="enabled"
    //% eventId.shadow="text" eventId.defl=""
    //% nameTag.shadow="text" nameTag.defl=""
    export function rideSummonRideOptions(rule: RideSummonRuleChoice,
        eventId?: string, nameTag?: string): RideSummonOptionsValue {
        return new RideSummonOptionsValue(<MCFunctionAST.RideSummonRule><number>rule,
            eventId && eventId.length > 0 ? eventId : undefined,
            nameTag && nameTag.length > 0 ? nameTag : undefined);
    }
    //% blockId=mcfunction_ride_summon_rider_options
    //% group="RIDE" weight=95
    //% block="summon rider spawn event $eventId || name $nameTag"
    //% expandableArgumentMode="enabled"
    //% eventId.shadow="text" eventId.defl=""
    //% nameTag.shadow="text" nameTag.defl=""
    export function rideSummonRiderOptions(eventId: string,
        nameTag?: string): RideSummonOptionsValue {
        return new RideSummonOptionsValue(undefined,
            eventId && eventId.length > 0 ? eventId : undefined,
            nameTag && nameTag.length > 0 ? nameTag : undefined);
    }

    //% blockId=command_ride_start
    //% blockHidden=true
    //% group="RIDE" weight=115
    //% block="RIDE rider $rider start on $ride || options $options"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% rider.shadow="mcfunction_target_selector"
    //% ride.shadow="mcfunction_target_selector"
    //% options.shadow="mcfunction_ride_start_options"
    export function rideStart(rider: MCFunctionFields.TargetValue,
        ride: MCFunctionFields.TargetValue,
        options?: RideStartOptionsValue): void {
        executeAudioCommand(MCFunctionBlocks.createRideCommand(
            MCFunctionAST.RideAction.StartRiding,
            rider ? rider.target : undefined, ride ? ride.target : undefined,
            undefined, options ? options.teleportRule : undefined,
            options ? options.fillType : undefined));
    }
    //% blockId=command_ride_stop
    //% blockHidden=true
    //% group="RIDE" weight=114
    //% block="RIDE rider $rider stop riding"
    //% rider.shadow="mcfunction_target_selector"
    export function rideStop(rider: MCFunctionFields.TargetValue): void {
        executeAudioCommand(MCFunctionBlocks.createRideCommand(
            MCFunctionAST.RideAction.StopRiding, rider ? rider.target : undefined));
    }
    //% blockId=command_ride_evict
    //% blockHidden=true
    //% group="RIDE" weight=113
    //% block="RIDE mount $ride evict riders"
    //% ride.shadow="mcfunction_target_selector"
    export function rideEvict(ride: MCFunctionFields.TargetValue): void {
        executeAudioCommand(MCFunctionBlocks.createRideCommand(
            MCFunctionAST.RideAction.EvictRiders, ride ? ride.target : undefined));
    }
    //% blockId=command_ride_summon_rider
    //% blockHidden=true
    //% group="RIDE" weight=112
    //% block="RIDE mount $ride summon rider type $entityId || options $options"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% ride.shadow="mcfunction_target_selector"
    //% entityId.shadow="text" entityId.defl="minecraft:zombie"
    //% options.shadow="mcfunction_ride_summon_rider_options"
    export function rideSummonRider(ride: MCFunctionFields.TargetValue,
        entityId: string, options?: RideSummonOptionsValue): void {
        executeAudioCommand(MCFunctionBlocks.createRideCommand(
            MCFunctionAST.RideAction.SummonRider, ride ? ride.target : undefined,
            undefined, entityId, undefined, undefined,
            undefined, options ? options.eventId : undefined,
            options ? options.nameTag : undefined));
    }
    //% blockId=command_ride_summon_ride
    //% blockHidden=true
    //% group="RIDE" weight=111
    //% block="RIDE rider $rider summon mount type $entityId || options $options"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% rider.shadow="mcfunction_target_selector"
    //% entityId.shadow="text" entityId.defl="minecraft:chicken"
    //% options.shadow="mcfunction_ride_summon_ride_options"
    export function rideSummonRide(rider: MCFunctionFields.TargetValue,
        entityId: string, options?: RideSummonOptionsValue): void {
        executeAudioCommand(MCFunctionBlocks.createRideCommand(
            MCFunctionAST.RideAction.SummonRide, rider ? rider.target : undefined,
            undefined, entityId, undefined, undefined,
            options ? options.rule : undefined,
            options ? options.eventId : undefined,
            options ? options.nameTag : undefined));
    }

    //% blockId=command_dialogue_open
    //% blockHidden=true
    //% group="DIALOGUE" weight=115
    //% block="DIALOGUE open NPC $npc to player $player || scene $sceneName"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% npc.shadow="mcfunction_target_selector"
    //% player.shadow="mcfunction_target_selector"
    //% sceneName.shadow="text" sceneName.defl=""
    export function dialogueOpen(npc: MCFunctionFields.TargetValue,
        player: MCFunctionFields.TargetValue, sceneName?: string): void {
        executeAudioCommand(MCFunctionBlocks.createDialogueCommand(
            MCFunctionAST.DialogueAction.Open, npc ? npc.target : undefined,
            player ? player.target : undefined,
            sceneName && sceneName.length > 0 ? sceneName : undefined));
    }
    //% blockId=command_dialogue_change
    //% blockHidden=true
    //% group="DIALOGUE" weight=114
    //% block="DIALOGUE change NPC $npc scene $sceneName || player $player"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% npc.shadow="mcfunction_target_selector"
    //% sceneName.shadow="text" sceneName.defl="example_scene"
    //% player.shadow="mcfunction_target_selector"
    export function dialogueChange(npc: MCFunctionFields.TargetValue,
        sceneName: string, player?: MCFunctionFields.TargetValue): void {
        executeAudioCommand(MCFunctionBlocks.createDialogueCommand(
            MCFunctionAST.DialogueAction.Change, npc ? npc.target : undefined,
            player ? player.target : undefined, sceneName));
    }

    /** C1 canonical UI: one RIDE statement, five typed action reporters. */
    export class RideActionValue {
        action: MCFunctionAST.RideAction;
        mount?: MCFunctionAST.PlayerTarget;
        entityType?: string;
        teleportRule?: MCFunctionAST.RideTeleportRule;
        fillType?: MCFunctionAST.RideFillType;
        rideRule?: MCFunctionAST.RideSummonRule;
        spawnEvent?: string;
        nameTag?: string;
        constructor(action: MCFunctionAST.RideAction,
            mount?: MCFunctionAST.PlayerTarget, entityType?: string,
            teleportRule?: MCFunctionAST.RideTeleportRule,
            fillType?: MCFunctionAST.RideFillType,
            rideRule?: MCFunctionAST.RideSummonRule,
            spawnEvent?: string, nameTag?: string) {
            this.action = action; this.mount = mount; this.entityType = entityType;
            this.teleportRule = teleportRule; this.fillType = fillType;
            this.rideRule = rideRule; this.spawnEvent = spawnEvent;
            this.nameTag = nameTag;
        }
    }
    //% blockId=mcfunction_ride_action_start
    //% group="RIDE" weight=108
    //% block="start riding mount $mount || options $options"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% mount.shadow="mcfunction_target_selector"
    //% options.shadow="mcfunction_ride_start_options"
    export function rideActionStart(mount: MCFunctionFields.TargetValue,
        options?: RideStartOptionsValue): RideActionValue {
        return new RideActionValue(MCFunctionAST.RideAction.StartRiding,
            mount ? mount.target : undefined, undefined,
            options ? options.teleportRule : undefined,
            options ? options.fillType : undefined);
    }
    //% blockId=mcfunction_ride_action_stop
    //% group="RIDE" weight=107
    //% block="stop riding"
    export function rideActionStop(): RideActionValue {
        return new RideActionValue(MCFunctionAST.RideAction.StopRiding);
    }
    //% blockId=mcfunction_ride_action_evict
    //% group="RIDE" weight=106
    //% block="evict riders"
    export function rideActionEvict(): RideActionValue {
        return new RideActionValue(MCFunctionAST.RideAction.EvictRiders);
    }
    //% blockId=mcfunction_ride_action_summon_rider
    //% group="RIDE" weight=105
    //% block="summon rider entity $entity || options $options"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% entity.shadow="mcfunction_entity_custom_id"
    //% options.shadow="mcfunction_ride_summon_rider_options"
    export function rideActionSummonRider(entity: MCFunctionFields.EntityValue,
        options?: RideSummonOptionsValue): RideActionValue {
        return new RideActionValue(MCFunctionAST.RideAction.SummonRider,
            undefined, entity ? entity.entityId : undefined,
            undefined, undefined, undefined,
            options ? options.eventId : undefined,
            options ? options.nameTag : undefined);
    }
    //% blockId=mcfunction_ride_action_summon_ride
    //% group="RIDE" weight=104
    //% block="summon mount entity $entity || options $options"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% entity.shadow="mcfunction_entity_custom_id"
    //% options.shadow="mcfunction_ride_summon_ride_options"
    export function rideActionSummonRide(entity: MCFunctionFields.EntityValue,
        options?: RideSummonOptionsValue): RideActionValue {
        return new RideActionValue(MCFunctionAST.RideAction.SummonRide,
            undefined, entity ? entity.entityId : undefined,
            undefined, undefined, options ? options.rule : undefined,
            options ? options.eventId : undefined,
            options ? options.nameTag : undefined);
    }
    //% blockId=command_ride_unified
    //% group="RIDE" weight=125
    //% block="RIDE target $target action $action"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_ride_action_stop"
    export function ride(target: MCFunctionFields.TargetValue,
        action: RideActionValue): void {
        executeAudioCommand(MCFunctionBlocks.createRideCommand(
            action ? action.action : undefined,
            target ? target.target : undefined,
            action ? action.mount : undefined,
            action ? action.entityType : undefined,
            action ? action.teleportRule : undefined,
            action ? action.fillType : undefined,
            action ? action.rideRule : undefined,
            action ? action.spawnEvent : undefined,
            action ? action.nameTag : undefined));
    }

    /** C1 DIALOGUE: one statement, independent open/change action reporters. */
    export class DialogueActionValue {
        action: MCFunctionAST.DialogueAction;
        player?: MCFunctionAST.PlayerTarget;
        sceneName?: string;
        constructor(action: MCFunctionAST.DialogueAction,
            player?: MCFunctionAST.PlayerTarget, sceneName?: string) {
            this.action = action; this.player = player; this.sceneName = sceneName;
        }
    }
    //% blockId=mcfunction_dialogue_action_open
    //% group="DIALOGUE" weight=108
    //% block="open to player $player || scene $sceneName"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% player.shadow="mcfunction_target_selector"
    //% sceneName.shadow="text" sceneName.defl=""
    export function dialogueActionOpen(player: MCFunctionFields.TargetValue,
        sceneName?: string): DialogueActionValue {
        return new DialogueActionValue(MCFunctionAST.DialogueAction.Open,
            player ? player.target : undefined,
            sceneName && sceneName.length > 0 ? sceneName : undefined);
    }
    //% blockId=mcfunction_dialogue_action_change
    //% group="DIALOGUE" weight=107
    //% block="change scene $sceneName || player $player"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% sceneName.shadow="text" sceneName.defl="example_scene"
    //% player.shadow="mcfunction_target_selector"
    export function dialogueActionChange(sceneName: string,
        player?: MCFunctionFields.TargetValue): DialogueActionValue {
        return new DialogueActionValue(MCFunctionAST.DialogueAction.Change,
            player ? player.target : undefined, sceneName);
    }
    //% blockId=command_dialogue_unified
    //% group="DIALOGUE" weight=125
    //% block="DIALOGUE NPC $npc action $action"
    //% inlineInputMode=external
    //% npc.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_dialogue_action_open"
    export function dialogue(npc: MCFunctionFields.TargetValue,
        action: DialogueActionValue): void {
        executeAudioCommand(MCFunctionBlocks.createDialogueCommand(
            action ? action.action : undefined,
            npc ? npc.target : undefined,
            action ? action.player : undefined,
            action ? action.sceneName : undefined));
    }
}
