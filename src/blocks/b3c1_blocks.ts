/** B3/C1 public MakeCode blocks. Canonical meaning is in the AST, not UI text. */
namespace Command {
    export enum DamageCauseChoice {
        None = 0, Piston = 1, Lava = 2, Campfire = 3, Fire = 4,
        Anvil = 5, Magma = 6, SoulCampfire = 7, Wither = 8,
        FallingBlock = 9, Fireworks = 10, Thorns = 11, Contact = 12,
        SonicBoom = 13, Override = 14, EntityAttack = 15,
        Projectile = 16, Suffocation = 17, MaceSmash = 18, Fall = 19,
        Starve = 20, RamAttack = 21, FireTick = 22, Stalactite = 23,
        Drowning = 24, BlockExplosion = 25, EntityExplosion = 26,
        Void = 27, SelfDestruct = 28, Magic = 29, Charging = 30,
        Stalagmite = 31, FlyIntoWall = 32, Lightning = 33,
        Freezing = 34, Temperature = 35
    }
    export class DamageCauseValue {
        id: string;
        constructor(id: string) { this.id = id; }
    }
    //% blockId=mcfunction_damage_cause_choice
    //% group="DAMAGE" weight=97
    //% block="damage cause $choice"
    export function damageCauseChoice(choice: DamageCauseChoice): DamageCauseValue {
        let values = ["none", "piston", "lava", "campfire", "fire", "anvil", "magma",
            "soul_campfire", "wither", "falling_block", "fireworks", "thorns",
            "contact", "sonic_boom", "override", "entity_attack",
            "projectile", "suffocation", "mace_smash", "fall", "starve",
            "ram_attack", "fire_tick", "stalactite", "drowning",
            "block_explosion", "entity_explosion", "void", "self_destruct",
            "magic", "charging", "stalagmite", "fly_into_wall",
            "lightning", "freezing", "temperature"];
        return new DamageCauseValue(values[<number>choice] || "");
    }
    //% blockId=mcfunction_damage_cause_custom
    //% group="DAMAGE" weight=96
    //% block="damage cause ID $id"
    //% id.shadow="text" id.defl="entity_attack"
    export function damageCauseCustom(id: string): DamageCauseValue {
        return new DamageCauseValue(id);
    }
    //% blockId=command_damage_apply
    //% group="DAMAGE" weight=110
    //% block="DAMAGE target $target amount $amount || cause $cause"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% amount.defl=1
    //% cause.shadow="mcfunction_damage_cause_choice"
    export function damageApply(target: MCFunctionFields.TargetValue,
        amount: number, cause?: DamageCauseValue): void {
        executeAudioCommand(MCFunctionBlocks.createDamageCommand(
            target ? target.target : undefined, amount, cause ? cause.id : undefined));
    }
    //% blockId=command_damage_from_entity
    //% group="DAMAGE" weight=105
    //% block="DAMAGE target $target amount $amount cause $cause from entity $damager"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% damager.shadow="mcfunction_target_selector"
    //% cause.shadow="mcfunction_damage_cause_choice"
    //% amount.defl=1
    export function damageFromEntity(target: MCFunctionFields.TargetValue,
        amount: number, cause: DamageCauseValue,
        damager: MCFunctionFields.TargetValue): void {
        executeAudioCommand(MCFunctionBlocks.createDamageCommand(
            target ? target.target : undefined, amount,
            cause ? cause.id : undefined, damager ? damager.target : undefined,
            MCFunctionAST.DamageAction.FromEntity));
    }

    /** Existing generated EVENT category supplies custom or owner-scoped IDs. */
    //% blockId=command_event_entity
    //% group="EVENT" weight=110
    //% block="EVENT entity $target trigger $eventId || owner type hint $ownerEntityId"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% eventId.shadow="mcfunction_entity_event_custom_id"
    //% ownerEntityId.shadow="text" ownerEntityId.defl="minecraft:cow"
    export function eventEntity(target: MCFunctionFields.TargetValue,
        eventId: string, ownerEntityId?: string): void {
        executeAudioCommand(MCFunctionBlocks.createEventCommand(
            target ? target.target : undefined, eventId, ownerEntityId));
    }

    export enum ControlSchemeChoice {
        //% block="camera relative"
        CameraRelative = 0,
        //% block="camera relative strafe"
        CameraRelativeStrafe = 1,
        //% block="player relative"
        PlayerRelative = 2,
        //% block="player relative strafe"
        PlayerRelativeStrafe = 3,
        //% block="locked player relative strafe"
        LockedPlayerRelativeStrafe = 4
    }
    //% blockId=command_controlscheme_set
    //% group="CONTROLSCHEME" weight=110
    //% block="CONTROLSCHEME player $target set $scheme"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    export function controlSchemeSet(target: MCFunctionFields.TargetValue,
        scheme: ControlSchemeChoice): void {
        executeAudioCommand(MCFunctionBlocks.createControlSchemeCommand(
            target ? target.target : undefined, MCFunctionAST.ControlSchemeAction.Set,
            <MCFunctionAST.ControlSchemeType><number>scheme));
    }
    //% blockId=command_controlscheme_clear
    //% group="CONTROLSCHEME" weight=109
    //% block="CONTROLSCHEME player $target clear"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    export function controlSchemeClear(target: MCFunctionFields.TargetValue): void {
        executeAudioCommand(MCFunctionBlocks.createControlSchemeCommand(
            target ? target.target : undefined, MCFunctionAST.ControlSchemeAction.Clear));
    }

    export enum AimAssistModeChoice {
        //% block="distance"
        Distance = 0,
        //% block="angle"
        Angle = 1
    }
    export class AimAssistOptionsValue {
        xAngle: number;
        yAngle: number;
        maxDistance: number;
        mode: MCFunctionAST.AimAssistTargetMode;
        presetId?: string;
        constructor(xAngle: number, yAngle: number, maxDistance: number,
            mode: MCFunctionAST.AimAssistTargetMode, presetId?: string) {
            this.xAngle = xAngle;
            this.yAngle = yAngle;
            this.maxDistance = maxDistance;
            this.mode = mode;
            this.presetId = presetId;
        }
    }
    //% blockId=mcfunction_aimassist_options
    //% group="AIMASSIST" weight=99
    //% block="aim options X $xAngle Y $yAngle distance $distance mode $mode || preset $presetId"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% xAngle.defl=45 yAngle.defl=45 distance.defl=8
    //% presetId.shadow="text" presetId.defl=""
    export function aimAssistOptions(xAngle: number, yAngle: number,
        distance: number, mode: AimAssistModeChoice,
        presetId?: string): AimAssistOptionsValue {
        return new AimAssistOptionsValue(xAngle, yAngle, distance,
            <MCFunctionAST.AimAssistTargetMode><number>mode, presetId);
    }
    //% blockId=command_aimassist_set
    //% group="AIMASSIST" weight=110
    //% block="AIMASSIST player $target set || $options"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% options.shadow="mcfunction_aimassist_options"
    export function aimAssistSet(target: MCFunctionFields.TargetValue,
        options?: AimAssistOptionsValue): void {
        executeAudioCommand(MCFunctionBlocks.createAimAssistCommand(
            target ? target.target : undefined, MCFunctionAST.AimAssistAction.Set,
            options ? options.xAngle : undefined,
            options ? options.yAngle : undefined,
            options ? options.maxDistance : undefined,
            options ? options.mode : undefined,
            options ? options.presetId : undefined));
    }
    /** A bare preset ID is a documented optional /aimassist set argument. */
    //% blockId=command_aimassist_set_preset
    //% group="AIMASSIST" weight=108
    //% block="AIMASSIST player $target set preset ID $presetId"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% presetId.shadow="text" presetId.defl="example:my_preset"
    export function aimAssistSetPreset(target: MCFunctionFields.TargetValue,
        presetId: string): void {
        executeAudioCommand(MCFunctionBlocks.createAimAssistCommand(
            target ? target.target : undefined, MCFunctionAST.AimAssistAction.Set,
            undefined, undefined, undefined, undefined, presetId));
    }
    //% blockId=command_aimassist_clear
    //% group="AIMASSIST" weight=109
    //% block="AIMASSIST player $target clear"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    export function aimAssistClear(target: MCFunctionFields.TargetValue): void {
        executeAudioCommand(MCFunctionBlocks.createAimAssistCommand(
            target ? target.target : undefined, MCFunctionAST.AimAssistAction.Clear));
    }
}
