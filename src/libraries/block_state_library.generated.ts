/**
 * AUTO-GENERATED FILE. DO NOT EDIT BY HAND.
 *
 * Source: registry/source/bedrock/block_states.json
 * Generator: tools/generate_registry.ps1
 *
 * Adds typed reporters for vanilla Block States not already covered by the
 * stable hand-authored reporter API in block_state_library.ts.
 */

namespace MCFunctionBlockStateLibrary {

    //% group="ACTIVATION"
    //% weight=90
    //% blockId=mcfunction_block_state_registry_active
    //% block="active $value"
    export function stateActive(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("active", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateAgeValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
    }

    //% group="LEVEL / GROWTH"
    //% weight=89
    //% blockId=mcfunction_block_state_registry_age
    //% block="age $value"
    export function stateAge(value: StateAgeValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("age", value));
    }

    //% group="LEVEL / GROWTH"
    //% weight=88
    //% blockId=mcfunction_block_state_registry_age_bit
    //% block="age_bit $value"
    export function stateAgeBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("age_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=87
    //% blockId=mcfunction_block_state_registry_attached_bit
    //% block="attached_bit $value"
    export function stateAttachedBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("attached_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateAttachmentValue {
        //% block="standing"
        Standing = 0,
        //% block="hanging"
        Hanging = 1,
        //% block="side"
        Side = 2,
        //% block="multiple"
        Multiple = 3,
    }

    function textAttachment(value: StateAttachmentValue): string {
        if (value == StateAttachmentValue.Standing) return "standing";
        if (value == StateAttachmentValue.Hanging) return "hanging";
        if (value == StateAttachmentValue.Side) return "side";
        if (value == StateAttachmentValue.Multiple) return "multiple";
        return "standing";
    }

    //% group="ORIENTATION"
    //% weight=86
    //% blockId=mcfunction_block_state_registry_attachment
    //% block="attachment $value"
    export function stateAttachment(value: StateAttachmentValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("attachment", textAttachment(value)));
    }

    export enum StateBambooLeafSizeValue {
        //% block="no_leaves"
        NoLeaves = 0,
        //% block="small_leaves"
        SmallLeaves = 1,
        //% block="large_leaves"
        LargeLeaves = 2,
    }

    function textBambooLeafSize(value: StateBambooLeafSizeValue): string {
        if (value == StateBambooLeafSizeValue.NoLeaves) return "no_leaves";
        if (value == StateBambooLeafSizeValue.SmallLeaves) return "small_leaves";
        if (value == StateBambooLeafSizeValue.LargeLeaves) return "large_leaves";
        return "no_leaves";
    }

    //% group="OTHER"
    //% weight=85
    //% blockId=mcfunction_block_state_registry_bamboo_leaf_size
    //% block="bamboo_leaf_size $value"
    export function stateBambooLeafSize(value: StateBambooLeafSizeValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("bamboo_leaf_size", textBambooLeafSize(value)));
    }

    export enum StateBambooStalkThicknessValue {
        //% block="thin"
        Thin = 0,
        //% block="thick"
        Thick = 1,
    }

    function textBambooStalkThickness(value: StateBambooStalkThicknessValue): string {
        if (value == StateBambooStalkThicknessValue.Thin) return "thin";
        if (value == StateBambooStalkThicknessValue.Thick) return "thick";
        return "thin";
    }

    //% group="VARIANT / APPEARANCE"
    //% weight=84
    //% blockId=mcfunction_block_state_registry_bamboo_stalk_thickness
    //% block="bamboo_stalk_thickness $value"
    export function stateBambooStalkThickness(value: StateBambooStalkThicknessValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("bamboo_stalk_thickness", textBambooStalkThickness(value)));
    }

    //% group="OTHER"
    //% weight=83
    //% blockId=mcfunction_block_state_registry_big_dripleaf_head
    //% block="big_dripleaf_head $value"
    export function stateBigDripleafHead(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("big_dripleaf_head", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateBigDripleafTiltValue {
        //% block="none"
        None = 0,
        //% block="unstable"
        Unstable = 1,
        //% block="partial_tilt"
        PartialTilt = 2,
        //% block="full_tilt"
        FullTilt = 3,
    }

    function textBigDripleafTilt(value: StateBigDripleafTiltValue): string {
        if (value == StateBigDripleafTiltValue.None) return "none";
        if (value == StateBigDripleafTiltValue.Unstable) return "unstable";
        if (value == StateBigDripleafTiltValue.PartialTilt) return "partial_tilt";
        if (value == StateBigDripleafTiltValue.FullTilt) return "full_tilt";
        return "none";
    }

    //% group="OTHER"
    //% weight=82
    //% blockId=mcfunction_block_state_registry_big_dripleaf_tilt
    //% block="big_dripleaf_tilt $value"
    export function stateBigDripleafTilt(value: StateBigDripleafTiltValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("big_dripleaf_tilt", textBigDripleafTilt(value)));
    }

    export enum StateBiteCounterValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
    }

    //% group="LEVEL / GROWTH"
    //% weight=81
    //% blockId=mcfunction_block_state_registry_bite_counter
    //% block="bite_counter $value"
    export function stateBiteCounter(value: StateBiteCounterValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("bite_counter", value));
    }

    //% group="OTHER"
    //% weight=80
    //% blockId=mcfunction_block_state_registry_bloom
    //% block="bloom $value"
    export function stateBloom(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("bloom", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateBooksStoredValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
        //% block="16"
        V16 = 16,
        //% block="17"
        V17 = 17,
        //% block="18"
        V18 = 18,
        //% block="19"
        V19 = 19,
        //% block="20"
        V20 = 20,
        //% block="21"
        V21 = 21,
        //% block="22"
        V22 = 22,
        //% block="23"
        V23 = 23,
        //% block="24"
        V24 = 24,
        //% block="25"
        V25 = 25,
        //% block="26"
        V26 = 26,
        //% block="27"
        V27 = 27,
        //% block="28"
        V28 = 28,
        //% block="29"
        V29 = 29,
        //% block="30"
        V30 = 30,
        //% block="31"
        V31 = 31,
        //% block="32"
        V32 = 32,
        //% block="33"
        V33 = 33,
        //% block="34"
        V34 = 34,
        //% block="35"
        V35 = 35,
        //% block="36"
        V36 = 36,
        //% block="37"
        V37 = 37,
        //% block="38"
        V38 = 38,
        //% block="39"
        V39 = 39,
        //% block="40"
        V40 = 40,
        //% block="41"
        V41 = 41,
        //% block="42"
        V42 = 42,
        //% block="43"
        V43 = 43,
        //% block="44"
        V44 = 44,
        //% block="45"
        V45 = 45,
        //% block="46"
        V46 = 46,
        //% block="47"
        V47 = 47,
        //% block="48"
        V48 = 48,
        //% block="49"
        V49 = 49,
        //% block="50"
        V50 = 50,
        //% block="51"
        V51 = 51,
        //% block="52"
        V52 = 52,
        //% block="53"
        V53 = 53,
        //% block="54"
        V54 = 54,
        //% block="55"
        V55 = 55,
        //% block="56"
        V56 = 56,
        //% block="57"
        V57 = 57,
        //% block="58"
        V58 = 58,
        //% block="59"
        V59 = 59,
        //% block="60"
        V60 = 60,
        //% block="61"
        V61 = 61,
        //% block="62"
        V62 = 62,
        //% block="63"
        V63 = 63,
    }

    //% group="LEVEL / GROWTH"
    //% weight=79
    //% blockId=mcfunction_block_state_registry_books_stored
    //% block="books_stored $value"
    export function stateBooksStored(value: StateBooksStoredValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("books_stored", value));
    }

    //% group="OTHER"
    //% weight=78
    //% blockId=mcfunction_block_state_registry_brewing_stand_slot_a_bit
    //% block="brewing_stand_slot_a_bit $value"
    export function stateBrewingStandSlotABit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("brewing_stand_slot_a_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=77
    //% blockId=mcfunction_block_state_registry_brewing_stand_slot_b_bit
    //% block="brewing_stand_slot_b_bit $value"
    export function stateBrewingStandSlotBBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("brewing_stand_slot_b_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=76
    //% blockId=mcfunction_block_state_registry_brewing_stand_slot_c_bit
    //% block="brewing_stand_slot_c_bit $value"
    export function stateBrewingStandSlotCBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("brewing_stand_slot_c_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateBrushedProgressValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
    }

    //% group="LEVEL / GROWTH"
    //% weight=75
    //% blockId=mcfunction_block_state_registry_brushed_progress
    //% block="brushed_progress $value"
    export function stateBrushedProgress(value: StateBrushedProgressValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("brushed_progress", value));
    }

    //% group="OTHER"
    //% weight=74
    //% blockId=mcfunction_block_state_registry_can_summon
    //% block="can_summon $value"
    export function stateCanSummon(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("can_summon", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateCandlesValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
    }

    //% group="LEVEL / GROWTH"
    //% weight=73
    //% blockId=mcfunction_block_state_registry_candles
    //% block="candles $value"
    export function stateCandles(value: StateCandlesValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("candles", value));
    }

    export enum StateCauldronLiquidValue {
        //% block="water"
        Water = 0,
        //% block="lava"
        Lava = 1,
        //% block="powder_snow"
        PowderSnow = 2,
    }

    function textCauldronLiquid(value: StateCauldronLiquidValue): string {
        if (value == StateCauldronLiquidValue.Water) return "water";
        if (value == StateCauldronLiquidValue.Lava) return "lava";
        if (value == StateCauldronLiquidValue.PowderSnow) return "powder_snow";
        return "water";
    }

    //% group="OTHER"
    //% weight=72
    //% blockId=mcfunction_block_state_registry_cauldron_liquid
    //% block="cauldron_liquid $value"
    export function stateCauldronLiquid(value: StateCauldronLiquidValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("cauldron_liquid", textCauldronLiquid(value)));
    }

    export enum StateClusterCountValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
    }

    //% group="LEVEL / GROWTH"
    //% weight=71
    //% blockId=mcfunction_block_state_registry_cluster_count
    //% block="cluster_count $value"
    export function stateClusterCount(value: StateClusterCountValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("cluster_count", value));
    }

    export enum StateComposterFillLevelValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
    }

    //% group="STRUCTURE"
    //% weight=70
    //% blockId=mcfunction_block_state_registry_composter_fill_level
    //% block="composter_fill_level $value"
    export function stateComposterFillLevel(value: StateComposterFillLevelValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("composter_fill_level", value));
    }

    //% group="OTHER"
    //% weight=69
    //% blockId=mcfunction_block_state_registry_conditional_bit
    //% block="conditional_bit $value"
    export function stateConditionalBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("conditional_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateCoralDirectionValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
    }

    //% group="ORIENTATION"
    //% weight=68
    //% blockId=mcfunction_block_state_registry_coral_direction
    //% block="coral_direction $value"
    export function stateCoralDirection(value: StateCoralDirectionValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("coral_direction", value));
    }

    export enum StateCoralFanDirectionValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
    }

    //% group="ORIENTATION"
    //% weight=67
    //% blockId=mcfunction_block_state_registry_coral_fan_direction
    //% block="coral_fan_direction $value"
    export function stateCoralFanDirection(value: StateCoralFanDirectionValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("coral_fan_direction", value));
    }

    //% group="OTHER"
    //% weight=66
    //% blockId=mcfunction_block_state_registry_covered_bit
    //% block="covered_bit $value"
    export function stateCoveredBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("covered_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateCrackedStateValue {
        //% block="no_cracks"
        NoCracks = 0,
        //% block="cracked"
        Cracked = 1,
        //% block="max_cracked"
        MaxCracked = 2,
    }

    function textCrackedState(value: StateCrackedStateValue): string {
        if (value == StateCrackedStateValue.NoCracks) return "no_cracks";
        if (value == StateCrackedStateValue.Cracked) return "cracked";
        if (value == StateCrackedStateValue.MaxCracked) return "max_cracked";
        return "no_cracks";
    }

    //% group="OTHER"
    //% weight=65
    //% blockId=mcfunction_block_state_registry_cracked_state
    //% block="cracked_state $value"
    export function stateCrackedState(value: StateCrackedStateValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("cracked_state", textCrackedState(value)));
    }

    //% group="ACTIVATION"
    //% weight=64
    //% blockId=mcfunction_block_state_registry_crafting
    //% block="crafting $value"
    export function stateCrafting(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("crafting", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateCreakingHeartStateValue {
        //% block="uprooted"
        Uprooted = 0,
        //% block="dormant"
        Dormant = 1,
        //% block="awake"
        Awake = 2,
    }

    function textCreakingHeartState(value: StateCreakingHeartStateValue): string {
        if (value == StateCreakingHeartStateValue.Uprooted) return "uprooted";
        if (value == StateCreakingHeartStateValue.Dormant) return "dormant";
        if (value == StateCreakingHeartStateValue.Awake) return "awake";
        return "uprooted";
    }

    //% group="OTHER"
    //% weight=63
    //% blockId=mcfunction_block_state_registry_creaking_heart_state
    //% block="creaking_heart_state $value"
    export function stateCreakingHeartState(value: StateCreakingHeartStateValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("creaking_heart_state", textCreakingHeartState(value)));
    }

    //% group="OTHER"
    //% weight=62
    //% blockId=mcfunction_block_state_registry_dead_bit
    //% block="dead_bit $value"
    export function stateDeadBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("dead_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateDeprecatedValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
    }

    //% group="SPECIAL / EDUCATION"
    //% weight=61
    //% blockId=mcfunction_block_state_registry_deprecated
    //% block="deprecated $value"
    export function stateDeprecated(value: StateDeprecatedValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("deprecated", value));
    }

    //% group="OTHER"
    //% weight=60
    //% blockId=mcfunction_block_state_registry_disarmed_bit
    //% block="disarmed_bit $value"
    export function stateDisarmedBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("disarmed_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=59
    //% blockId=mcfunction_block_state_registry_drag_down
    //% block="drag_down $value"
    export function stateDragDown(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("drag_down", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateDripstoneThicknessValue {
        //% block="tip"
        Tip = 0,
        //% block="frustum"
        Frustum = 1,
        //% block="middle"
        Middle = 2,
        //% block="base"
        Base = 3,
        //% block="merge"
        Merge = 4,
    }

    function textDripstoneThickness(value: StateDripstoneThicknessValue): string {
        if (value == StateDripstoneThicknessValue.Tip) return "tip";
        if (value == StateDripstoneThicknessValue.Frustum) return "frustum";
        if (value == StateDripstoneThicknessValue.Middle) return "middle";
        if (value == StateDripstoneThicknessValue.Base) return "base";
        if (value == StateDripstoneThicknessValue.Merge) return "merge";
        return "tip";
    }

    //% group="VARIANT / APPEARANCE"
    //% weight=58
    //% blockId=mcfunction_block_state_registry_dripstone_thickness
    //% block="dripstone_thickness $value"
    export function stateDripstoneThickness(value: StateDripstoneThicknessValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("dripstone_thickness", textDripstoneThickness(value)));
    }

    //% group="OTHER"
    //% weight=57
    //% blockId=mcfunction_block_state_registry_end_portal_eye_bit
    //% block="end_portal_eye_bit $value"
    export function stateEndPortalEyeBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("end_portal_eye_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=56
    //% blockId=mcfunction_block_state_registry_explode_bit
    //% block="explode_bit $value"
    export function stateExplodeBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("explode_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=55
    //% blockId=mcfunction_block_state_registry_extinguished
    //% block="extinguished $value"
    export function stateExtinguished(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("extinguished", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateFillLevelValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
    }

    //% group="LEVEL / GROWTH"
    //% weight=54
    //% blockId=mcfunction_block_state_registry_fill_level
    //% block="fill_level $value"
    export function stateFillLevel(value: StateFillLevelValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("fill_level", value));
    }

    export enum StateGroundSignDirectionValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
    }

    //% group="ORIENTATION"
    //% weight=53
    //% blockId=mcfunction_block_state_registry_ground_sign_direction
    //% block="ground_sign_direction $value"
    export function stateGroundSignDirection(value: StateGroundSignDirectionValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("ground_sign_direction", value));
    }

    export enum StateGrowingPlantAgeValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
        //% block="16"
        V16 = 16,
        //% block="17"
        V17 = 17,
        //% block="18"
        V18 = 18,
        //% block="19"
        V19 = 19,
        //% block="20"
        V20 = 20,
        //% block="21"
        V21 = 21,
        //% block="22"
        V22 = 22,
        //% block="23"
        V23 = 23,
        //% block="24"
        V24 = 24,
        //% block="25"
        V25 = 25,
    }

    //% group="LEVEL / GROWTH"
    //% weight=52
    //% blockId=mcfunction_block_state_registry_growing_plant_age
    //% block="growing_plant_age $value"
    export function stateGrowingPlantAge(value: StateGrowingPlantAgeValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("growing_plant_age", value));
    }

    export enum StateGrowthValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
    }

    //% group="LEVEL / GROWTH"
    //% weight=51
    //% blockId=mcfunction_block_state_registry_growth
    //% block="growth $value"
    export function stateGrowth(value: StateGrowthValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("growth", value));
    }

    //% group="ORIENTATION"
    //% weight=90
    //% blockId=mcfunction_block_state_registry_hanging
    //% block="hanging $value"
    export function stateHanging(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("hanging", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=89
    //% blockId=mcfunction_block_state_registry_head_piece_bit
    //% block="head_piece_bit $value"
    export function stateHeadPieceBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("head_piece_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateHeightValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
    }

    //% group="OTHER"
    //% weight=88
    //% blockId=mcfunction_block_state_registry_height
    //% block="height $value"
    export function stateHeight(value: StateHeightValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("height", value));
    }

    export enum StateHoneyLevelValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
    }

    //% group="LEVEL / GROWTH"
    //% weight=87
    //% blockId=mcfunction_block_state_registry_honey_level
    //% block="honey_level $value"
    export function stateHoneyLevel(value: StateHoneyLevelValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("honey_level", value));
    }

    export enum StateHugeMushroomBitsValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
    }

    //% group="OTHER"
    //% weight=86
    //% blockId=mcfunction_block_state_registry_huge_mushroom_bits
    //% block="huge_mushroom_bits $value"
    export function stateHugeMushroomBits(value: StateHugeMushroomBitsValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("huge_mushroom_bits", value));
    }

    //% group="OTHER"
    //% weight=85
    //% blockId=mcfunction_block_state_registry_infiniburn_bit
    //% block="infiniburn_bit $value"
    export function stateInfiniburnBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("infiniburn_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=84
    //% blockId=mcfunction_block_state_registry_item_frame_map_bit
    //% block="item_frame_map_bit $value"
    export function stateItemFrameMapBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("item_frame_map_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=83
    //% blockId=mcfunction_block_state_registry_item_frame_photo_bit
    //% block="item_frame_photo_bit $value"
    export function stateItemFramePhotoBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("item_frame_photo_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateKelpAgeValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
        //% block="16"
        V16 = 16,
        //% block="17"
        V17 = 17,
        //% block="18"
        V18 = 18,
        //% block="19"
        V19 = 19,
        //% block="20"
        V20 = 20,
        //% block="21"
        V21 = 21,
        //% block="22"
        V22 = 22,
        //% block="23"
        V23 = 23,
        //% block="24"
        V24 = 24,
        //% block="25"
        V25 = 25,
    }

    //% group="LEVEL / GROWTH"
    //% weight=82
    //% blockId=mcfunction_block_state_registry_kelp_age
    //% block="kelp_age $value"
    export function stateKelpAge(value: StateKelpAgeValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("kelp_age", value));
    }

    export enum StateLiquidDepthValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
    }

    //% group="OTHER"
    //% weight=81
    //% blockId=mcfunction_block_state_registry_liquid_depth
    //% block="liquid_depth $value"
    export function stateLiquidDepth(value: StateLiquidDepthValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("liquid_depth", value));
    }

    //% group="ACTIVATION"
    //% weight=80
    //% blockId=mcfunction_block_state_registry_lit
    //% block="lit $value"
    export function stateLit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("lit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateMinecraftBlockFaceValue {
        //% block="down"
        Down = 0,
        //% block="up"
        Up = 1,
        //% block="north"
        North = 2,
        //% block="south"
        South = 3,
        //% block="west"
        West = 4,
        //% block="east"
        East = 5,
    }

    function textMinecraftBlockFace(value: StateMinecraftBlockFaceValue): string {
        if (value == StateMinecraftBlockFaceValue.Down) return "down";
        if (value == StateMinecraftBlockFaceValue.Up) return "up";
        if (value == StateMinecraftBlockFaceValue.North) return "north";
        if (value == StateMinecraftBlockFaceValue.South) return "south";
        if (value == StateMinecraftBlockFaceValue.West) return "west";
        if (value == StateMinecraftBlockFaceValue.East) return "east";
        return "down";
    }

    //% group="ORIENTATION"
    //% weight=79
    //% blockId=mcfunction_block_state_registry_minecraft_block_face
    //% block="minecraft:block_face $value"
    export function stateMinecraftBlockFace(value: StateMinecraftBlockFaceValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("minecraft:block_face", textMinecraftBlockFace(value)));
    }

    //% group="STRUCTURE"
    //% weight=78
    //% blockId=mcfunction_block_state_registry_minecraft_connection_east
    //% block="minecraft:connection_east $value"
    export function stateMinecraftConnectionEast(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("minecraft:connection_east", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="STRUCTURE"
    //% weight=77
    //% blockId=mcfunction_block_state_registry_minecraft_connection_north
    //% block="minecraft:connection_north $value"
    export function stateMinecraftConnectionNorth(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("minecraft:connection_north", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="STRUCTURE"
    //% weight=76
    //% blockId=mcfunction_block_state_registry_minecraft_connection_south
    //% block="minecraft:connection_south $value"
    export function stateMinecraftConnectionSouth(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("minecraft:connection_south", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="STRUCTURE"
    //% weight=75
    //% blockId=mcfunction_block_state_registry_minecraft_connection_west
    //% block="minecraft:connection_west $value"
    export function stateMinecraftConnectionWest(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("minecraft:connection_west", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateMinecraftCornerValue {
        //% block="none"
        None = 0,
        //% block="inner_left"
        InnerLeft = 1,
        //% block="inner_right"
        InnerRight = 2,
        //% block="outer_left"
        OuterLeft = 3,
        //% block="outer_right"
        OuterRight = 4,
    }

    function textMinecraftCorner(value: StateMinecraftCornerValue): string {
        if (value == StateMinecraftCornerValue.None) return "none";
        if (value == StateMinecraftCornerValue.InnerLeft) return "inner_left";
        if (value == StateMinecraftCornerValue.InnerRight) return "inner_right";
        if (value == StateMinecraftCornerValue.OuterLeft) return "outer_left";
        if (value == StateMinecraftCornerValue.OuterRight) return "outer_right";
        return "none";
    }

    //% group="OTHER"
    //% weight=74
    //% blockId=mcfunction_block_state_registry_minecraft_corner
    //% block="minecraft:corner $value"
    export function stateMinecraftCorner(value: StateMinecraftCornerValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("minecraft:corner", textMinecraftCorner(value)));
    }

    export enum StateMoisturizedAmountValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
    }

    //% group="LEVEL / GROWTH"
    //% weight=73
    //% blockId=mcfunction_block_state_registry_moisturized_amount
    //% block="moisturized_amount $value"
    export function stateMoisturizedAmount(value: StateMoisturizedAmountValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("moisturized_amount", value));
    }

    export enum StateMultiFaceDirectionBitsValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
        //% block="16"
        V16 = 16,
        //% block="17"
        V17 = 17,
        //% block="18"
        V18 = 18,
        //% block="19"
        V19 = 19,
        //% block="20"
        V20 = 20,
        //% block="21"
        V21 = 21,
        //% block="22"
        V22 = 22,
        //% block="23"
        V23 = 23,
        //% block="24"
        V24 = 24,
        //% block="25"
        V25 = 25,
        //% block="26"
        V26 = 26,
        //% block="27"
        V27 = 27,
        //% block="28"
        V28 = 28,
        //% block="29"
        V29 = 29,
        //% block="30"
        V30 = 30,
        //% block="31"
        V31 = 31,
        //% block="32"
        V32 = 32,
        //% block="33"
        V33 = 33,
        //% block="34"
        V34 = 34,
        //% block="35"
        V35 = 35,
        //% block="36"
        V36 = 36,
        //% block="37"
        V37 = 37,
        //% block="38"
        V38 = 38,
        //% block="39"
        V39 = 39,
        //% block="40"
        V40 = 40,
        //% block="41"
        V41 = 41,
        //% block="42"
        V42 = 42,
        //% block="43"
        V43 = 43,
        //% block="44"
        V44 = 44,
        //% block="45"
        V45 = 45,
        //% block="46"
        V46 = 46,
        //% block="47"
        V47 = 47,
        //% block="48"
        V48 = 48,
        //% block="49"
        V49 = 49,
        //% block="50"
        V50 = 50,
        //% block="51"
        V51 = 51,
        //% block="52"
        V52 = 52,
        //% block="53"
        V53 = 53,
        //% block="54"
        V54 = 54,
        //% block="55"
        V55 = 55,
        //% block="56"
        V56 = 56,
        //% block="57"
        V57 = 57,
        //% block="58"
        V58 = 58,
        //% block="59"
        V59 = 59,
        //% block="60"
        V60 = 60,
        //% block="61"
        V61 = 61,
        //% block="62"
        V62 = 62,
        //% block="63"
        V63 = 63,
    }

    //% group="ORIENTATION"
    //% weight=72
    //% blockId=mcfunction_block_state_registry_multi_face_direction_bits
    //% block="multi_face_direction_bits $value"
    export function stateMultiFaceDirectionBits(value: StateMultiFaceDirectionBitsValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("multi_face_direction_bits", value));
    }

    //% group="OTHER"
    //% weight=71
    //% blockId=mcfunction_block_state_registry_natural
    //% block="natural $value"
    export function stateNatural(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("natural", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=70
    //% blockId=mcfunction_block_state_registry_occupied_bit
    //% block="occupied_bit $value"
    export function stateOccupiedBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("occupied_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=69
    //% blockId=mcfunction_block_state_registry_ominous
    //% block="ominous $value"
    export function stateOminous(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("ominous", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateOrientationValue {
        //% block="down_east"
        DownEast = 0,
        //% block="down_north"
        DownNorth = 1,
        //% block="down_south"
        DownSouth = 2,
        //% block="down_west"
        DownWest = 3,
        //% block="up_east"
        UpEast = 4,
        //% block="up_north"
        UpNorth = 5,
        //% block="up_south"
        UpSouth = 6,
        //% block="up_west"
        UpWest = 7,
        //% block="west_up"
        WestUp = 8,
        //% block="east_up"
        EastUp = 9,
        //% block="north_up"
        NorthUp = 10,
        //% block="south_up"
        SouthUp = 11,
    }

    function textOrientation(value: StateOrientationValue): string {
        if (value == StateOrientationValue.DownEast) return "down_east";
        if (value == StateOrientationValue.DownNorth) return "down_north";
        if (value == StateOrientationValue.DownSouth) return "down_south";
        if (value == StateOrientationValue.DownWest) return "down_west";
        if (value == StateOrientationValue.UpEast) return "up_east";
        if (value == StateOrientationValue.UpNorth) return "up_north";
        if (value == StateOrientationValue.UpSouth) return "up_south";
        if (value == StateOrientationValue.UpWest) return "up_west";
        if (value == StateOrientationValue.WestUp) return "west_up";
        if (value == StateOrientationValue.EastUp) return "east_up";
        if (value == StateOrientationValue.NorthUp) return "north_up";
        if (value == StateOrientationValue.SouthUp) return "south_up";
        return "down_east";
    }

    //% group="OTHER"
    //% weight=68
    //% blockId=mcfunction_block_state_registry_orientation
    //% block="orientation $value"
    export function stateOrientation(value: StateOrientationValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("orientation", textOrientation(value)));
    }

    //% group="ACTIVATION"
    //% weight=67
    //% blockId=mcfunction_block_state_registry_output_lit_bit
    //% block="output_lit_bit $value"
    export function stateOutputLitBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("output_lit_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=66
    //% blockId=mcfunction_block_state_registry_output_subtract_bit
    //% block="output_subtract_bit $value"
    export function stateOutputSubtractBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("output_subtract_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StatePaleMossCarpetSideEastValue {
        //% block="none"
        None = 0,
        //% block="short"
        Short = 1,
        //% block="tall"
        Tall = 2,
    }

    function textPaleMossCarpetSideEast(value: StatePaleMossCarpetSideEastValue): string {
        if (value == StatePaleMossCarpetSideEastValue.None) return "none";
        if (value == StatePaleMossCarpetSideEastValue.Short) return "short";
        if (value == StatePaleMossCarpetSideEastValue.Tall) return "tall";
        return "none";
    }

    //% group="OTHER"
    //% weight=65
    //% blockId=mcfunction_block_state_registry_pale_moss_carpet_side_east
    //% block="pale_moss_carpet_side_east $value"
    export function statePaleMossCarpetSideEast(value: StatePaleMossCarpetSideEastValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("pale_moss_carpet_side_east", textPaleMossCarpetSideEast(value)));
    }

    export enum StatePaleMossCarpetSideNorthValue {
        //% block="none"
        None = 0,
        //% block="short"
        Short = 1,
        //% block="tall"
        Tall = 2,
    }

    function textPaleMossCarpetSideNorth(value: StatePaleMossCarpetSideNorthValue): string {
        if (value == StatePaleMossCarpetSideNorthValue.None) return "none";
        if (value == StatePaleMossCarpetSideNorthValue.Short) return "short";
        if (value == StatePaleMossCarpetSideNorthValue.Tall) return "tall";
        return "none";
    }

    //% group="OTHER"
    //% weight=64
    //% blockId=mcfunction_block_state_registry_pale_moss_carpet_side_north
    //% block="pale_moss_carpet_side_north $value"
    export function statePaleMossCarpetSideNorth(value: StatePaleMossCarpetSideNorthValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("pale_moss_carpet_side_north", textPaleMossCarpetSideNorth(value)));
    }

    export enum StatePaleMossCarpetSideSouthValue {
        //% block="none"
        None = 0,
        //% block="short"
        Short = 1,
        //% block="tall"
        Tall = 2,
    }

    function textPaleMossCarpetSideSouth(value: StatePaleMossCarpetSideSouthValue): string {
        if (value == StatePaleMossCarpetSideSouthValue.None) return "none";
        if (value == StatePaleMossCarpetSideSouthValue.Short) return "short";
        if (value == StatePaleMossCarpetSideSouthValue.Tall) return "tall";
        return "none";
    }

    //% group="OTHER"
    //% weight=63
    //% blockId=mcfunction_block_state_registry_pale_moss_carpet_side_south
    //% block="pale_moss_carpet_side_south $value"
    export function statePaleMossCarpetSideSouth(value: StatePaleMossCarpetSideSouthValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("pale_moss_carpet_side_south", textPaleMossCarpetSideSouth(value)));
    }

    export enum StatePaleMossCarpetSideWestValue {
        //% block="none"
        None = 0,
        //% block="short"
        Short = 1,
        //% block="tall"
        Tall = 2,
    }

    function textPaleMossCarpetSideWest(value: StatePaleMossCarpetSideWestValue): string {
        if (value == StatePaleMossCarpetSideWestValue.None) return "none";
        if (value == StatePaleMossCarpetSideWestValue.Short) return "short";
        if (value == StatePaleMossCarpetSideWestValue.Tall) return "tall";
        return "none";
    }

    //% group="OTHER"
    //% weight=62
    //% blockId=mcfunction_block_state_registry_pale_moss_carpet_side_west
    //% block="pale_moss_carpet_side_west $value"
    export function statePaleMossCarpetSideWest(value: StatePaleMossCarpetSideWestValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("pale_moss_carpet_side_west", textPaleMossCarpetSideWest(value)));
    }

    //% group="OTHER"
    //% weight=61
    //% blockId=mcfunction_block_state_registry_persistent_bit
    //% block="persistent_bit $value"
    export function statePersistentBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("persistent_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StatePortalAxisValue {
        //% block="unknown"
        Unknown = 0,
        //% block="x"
        X = 1,
        //% block="z"
        Z = 2,
    }

    function textPortalAxis(value: StatePortalAxisValue): string {
        if (value == StatePortalAxisValue.Unknown) return "unknown";
        if (value == StatePortalAxisValue.X) return "x";
        if (value == StatePortalAxisValue.Z) return "z";
        return "unknown";
    }

    //% group="ORIENTATION"
    //% weight=60
    //% blockId=mcfunction_block_state_registry_portal_axis
    //% block="portal_axis $value"
    export function statePortalAxis(value: StatePortalAxisValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("portal_axis", textPortalAxis(value)));
    }

    export enum StatePotentSulfurStateValue {
        //% block="dry"
        Dry = 0,
        //% block="wet"
        Wet = 1,
        //% block="dormant"
        Dormant = 2,
        //% block="erupting"
        Erupting = 3,
        //% block="continuous"
        Continuous = 4,
    }

    function textPotentSulfurState(value: StatePotentSulfurStateValue): string {
        if (value == StatePotentSulfurStateValue.Dry) return "dry";
        if (value == StatePotentSulfurStateValue.Wet) return "wet";
        if (value == StatePotentSulfurStateValue.Dormant) return "dormant";
        if (value == StatePotentSulfurStateValue.Erupting) return "erupting";
        if (value == StatePotentSulfurStateValue.Continuous) return "continuous";
        return "dry";
    }

    //% group="OTHER"
    //% weight=59
    //% blockId=mcfunction_block_state_registry_potent_sulfur_state
    //% block="potent_sulfur_state $value"
    export function statePotentSulfurState(value: StatePotentSulfurStateValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("potent_sulfur_state", textPotentSulfurState(value)));
    }

    export enum StatePoweredShelfTypeValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
    }

    //% group="ACTIVATION"
    //% weight=58
    //% blockId=mcfunction_block_state_registry_powered_shelf_type
    //% block="powered_shelf_type $value"
    export function statePoweredShelfType(value: StatePoweredShelfTypeValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("powered_shelf_type", value));
    }

    export enum StatePropaguleStageValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
    }

    //% group="LEVEL / GROWTH"
    //% weight=57
    //% blockId=mcfunction_block_state_registry_propagule_stage
    //% block="propagule_stage $value"
    export function statePropaguleStage(value: StatePropaguleStageValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("propagule_stage", value));
    }

    //% group="OTHER"
    //% weight=56
    //% blockId=mcfunction_block_state_registry_rail_data_bit
    //% block="rail_data_bit $value"
    export function stateRailDataBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("rail_data_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateRailDirectionValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
    }

    //% group="ORIENTATION"
    //% weight=55
    //% blockId=mcfunction_block_state_registry_rail_direction
    //% block="rail_direction $value"
    export function stateRailDirection(value: StateRailDirectionValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("rail_direction", value));
    }

    export enum StateRedstoneSignalValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
    }

    //% group="ACTIVATION"
    //% weight=54
    //% blockId=mcfunction_block_state_registry_redstone_signal
    //% block="redstone_signal $value"
    export function stateRedstoneSignal(value: StateRedstoneSignalValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("redstone_signal", value));
    }

    export enum StateRehydrationLevelValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
    }

    //% group="LEVEL / GROWTH"
    //% weight=53
    //% blockId=mcfunction_block_state_registry_rehydration_level
    //% block="rehydration_level $value"
    export function stateRehydrationLevel(value: StateRehydrationLevelValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("rehydration_level", value));
    }

    export enum StateRepeaterDelayValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
    }

    //% group="OTHER"
    //% weight=52
    //% blockId=mcfunction_block_state_registry_repeater_delay
    //% block="repeater_delay $value"
    export function stateRepeaterDelay(value: StateRepeaterDelayValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("repeater_delay", value));
    }

    export enum StateRespawnAnchorChargeValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
    }

    //% group="OTHER"
    //% weight=51
    //% blockId=mcfunction_block_state_registry_respawn_anchor_charge
    //% block="respawn_anchor_charge $value"
    export function stateRespawnAnchorCharge(value: StateRespawnAnchorChargeValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("respawn_anchor_charge", value));
    }

    export enum StateRotationValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
    }

    //% group="ORIENTATION"
    //% weight=90
    //% blockId=mcfunction_block_state_registry_rotation
    //% block="rotation $value"
    export function stateRotation(value: StateRotationValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("rotation", value));
    }

    export enum StateSculkSensorPhaseValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
    }

    //% group="OTHER"
    //% weight=89
    //% blockId=mcfunction_block_state_registry_sculk_sensor_phase
    //% block="sculk_sensor_phase $value"
    export function stateSculkSensorPhase(value: StateSculkSensorPhaseValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("sculk_sensor_phase", value));
    }

    export enum StateSeaGrassTypeValue {
        //% block="default"
        DefaultValue = 0,
        //% block="double_top"
        DoubleTop = 1,
        //% block="double_bot"
        DoubleBot = 2,
    }

    function textSeaGrassType(value: StateSeaGrassTypeValue): string {
        if (value == StateSeaGrassTypeValue.DefaultValue) return "default";
        if (value == StateSeaGrassTypeValue.DoubleTop) return "double_top";
        if (value == StateSeaGrassTypeValue.DoubleBot) return "double_bot";
        return "default";
    }

    //% group="VARIANT / APPEARANCE"
    //% weight=88
    //% blockId=mcfunction_block_state_registry_sea_grass_type
    //% block="sea_grass_type $value"
    export function stateSeaGrassType(value: StateSeaGrassTypeValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("sea_grass_type", textSeaGrassType(value)));
    }

    export enum StateStabilityValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
    }

    //% group="ACTIVATION"
    //% weight=87
    //% blockId=mcfunction_block_state_registry_stability
    //% block="stability $value"
    export function stateStability(value: StateStabilityValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("stability", value));
    }

    //% group="ACTIVATION"
    //% weight=86
    //% blockId=mcfunction_block_state_registry_stability_check
    //% block="stability_check $value"
    export function stateStabilityCheck(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("stability_check", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateStructureBlockTypeValue {
        //% block="data"
        Data = 0,
        //% block="save"
        Save = 1,
        //% block="load"
        Load = 2,
        //% block="corner"
        Corner = 3,
        //% block="invalid"
        Invalid = 4,
        //% block="export"
        ExportValue = 5,
    }

    function textStructureBlockType(value: StateStructureBlockTypeValue): string {
        if (value == StateStructureBlockTypeValue.Data) return "data";
        if (value == StateStructureBlockTypeValue.Save) return "save";
        if (value == StateStructureBlockTypeValue.Load) return "load";
        if (value == StateStructureBlockTypeValue.Corner) return "corner";
        if (value == StateStructureBlockTypeValue.Invalid) return "invalid";
        if (value == StateStructureBlockTypeValue.ExportValue) return "export";
        return "data";
    }

    //% group="VARIANT / APPEARANCE"
    //% weight=85
    //% blockId=mcfunction_block_state_registry_structure_block_type
    //% block="structure_block_type $value"
    export function stateStructureBlockType(value: StateStructureBlockTypeValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("structure_block_type", textStructureBlockType(value)));
    }

    //% group="OTHER"
    //% weight=84
    //% blockId=mcfunction_block_state_registry_suspended_bit
    //% block="suspended_bit $value"
    export function stateSuspendedBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("suspended_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=83
    //% blockId=mcfunction_block_state_registry_tip
    //% block="tip $value"
    export function stateTip(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("tip", MCFunctionFields.booleanLiteralValue(value)));
    }

    //% group="OTHER"
    //% weight=82
    //% blockId=mcfunction_block_state_registry_toggle_bit
    //% block="toggle_bit $value"
    export function stateToggleBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("toggle_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateTorchFacingDirectionValue {
        //% block="unknown"
        Unknown = 0,
        //% block="west"
        West = 1,
        //% block="east"
        East = 2,
        //% block="north"
        North = 3,
        //% block="south"
        South = 4,
        //% block="top"
        Top = 5,
    }

    function textTorchFacingDirection(value: StateTorchFacingDirectionValue): string {
        if (value == StateTorchFacingDirectionValue.Unknown) return "unknown";
        if (value == StateTorchFacingDirectionValue.West) return "west";
        if (value == StateTorchFacingDirectionValue.East) return "east";
        if (value == StateTorchFacingDirectionValue.North) return "north";
        if (value == StateTorchFacingDirectionValue.South) return "south";
        if (value == StateTorchFacingDirectionValue.Top) return "top";
        return "unknown";
    }

    //% group="ORIENTATION"
    //% weight=81
    //% blockId=mcfunction_block_state_registry_torch_facing_direction
    //% block="torch_facing_direction $value"
    export function stateTorchFacingDirection(value: StateTorchFacingDirectionValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("torch_facing_direction", textTorchFacingDirection(value)));
    }

    export enum StateTrialSpawnerStateValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
    }

    //% group="OTHER"
    //% weight=80
    //% blockId=mcfunction_block_state_registry_trial_spawner_state
    //% block="trial_spawner_state $value"
    export function stateTrialSpawnerState(value: StateTrialSpawnerStateValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("trial_spawner_state", value));
    }

    export enum StateTurtleEggCountValue {
        //% block="one_egg"
        OneEgg = 0,
        //% block="two_egg"
        TwoEgg = 1,
        //% block="three_egg"
        ThreeEgg = 2,
        //% block="four_egg"
        FourEgg = 3,
    }

    function textTurtleEggCount(value: StateTurtleEggCountValue): string {
        if (value == StateTurtleEggCountValue.OneEgg) return "one_egg";
        if (value == StateTurtleEggCountValue.TwoEgg) return "two_egg";
        if (value == StateTurtleEggCountValue.ThreeEgg) return "three_egg";
        if (value == StateTurtleEggCountValue.FourEgg) return "four_egg";
        return "one_egg";
    }

    //% group="LEVEL / GROWTH"
    //% weight=79
    //% blockId=mcfunction_block_state_registry_turtle_egg_count
    //% block="turtle_egg_count $value"
    export function stateTurtleEggCount(value: StateTurtleEggCountValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("turtle_egg_count", textTurtleEggCount(value)));
    }

    export enum StateTwistingVinesAgeValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
        //% block="16"
        V16 = 16,
        //% block="17"
        V17 = 17,
        //% block="18"
        V18 = 18,
        //% block="19"
        V19 = 19,
        //% block="20"
        V20 = 20,
        //% block="21"
        V21 = 21,
        //% block="22"
        V22 = 22,
        //% block="23"
        V23 = 23,
        //% block="24"
        V24 = 24,
        //% block="25"
        V25 = 25,
    }

    //% group="LEVEL / GROWTH"
    //% weight=78
    //% blockId=mcfunction_block_state_registry_twisting_vines_age
    //% block="twisting_vines_age $value"
    export function stateTwistingVinesAge(value: StateTwistingVinesAgeValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("twisting_vines_age", value));
    }

    //% group="OTHER"
    //% weight=77
    //% blockId=mcfunction_block_state_registry_update_bit
    //% block="update_bit $value"
    export function stateUpdateBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("update_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateVaultStateValue {
        //% block="inactive"
        Inactive = 0,
        //% block="active"
        Active = 1,
        //% block="unlocking"
        Unlocking = 2,
        //% block="ejecting"
        Ejecting = 3,
    }

    function textVaultState(value: StateVaultStateValue): string {
        if (value == StateVaultStateValue.Inactive) return "inactive";
        if (value == StateVaultStateValue.Active) return "active";
        if (value == StateVaultStateValue.Unlocking) return "unlocking";
        if (value == StateVaultStateValue.Ejecting) return "ejecting";
        return "inactive";
    }

    //% group="OTHER"
    //% weight=76
    //% blockId=mcfunction_block_state_registry_vault_state
    //% block="vault_state $value"
    export function stateVaultState(value: StateVaultStateValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("vault_state", textVaultState(value)));
    }

    export enum StateVineDirectionBitsValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
    }

    //% group="ORIENTATION"
    //% weight=75
    //% blockId=mcfunction_block_state_registry_vine_direction_bits
    //% block="vine_direction_bits $value"
    export function stateVineDirectionBits(value: StateVineDirectionBitsValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("vine_direction_bits", value));
    }

    export enum StateWallConnectionTypeEastValue {
        //% block="none"
        None = 0,
        //% block="short"
        Short = 1,
        //% block="tall"
        Tall = 2,
    }

    function textWallConnectionTypeEast(value: StateWallConnectionTypeEastValue): string {
        if (value == StateWallConnectionTypeEastValue.None) return "none";
        if (value == StateWallConnectionTypeEastValue.Short) return "short";
        if (value == StateWallConnectionTypeEastValue.Tall) return "tall";
        return "none";
    }

    //% group="STRUCTURE"
    //% weight=74
    //% blockId=mcfunction_block_state_registry_wall_connection_type_east
    //% block="wall_connection_type_east $value"
    export function stateWallConnectionTypeEast(value: StateWallConnectionTypeEastValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("wall_connection_type_east", textWallConnectionTypeEast(value)));
    }

    export enum StateWallConnectionTypeNorthValue {
        //% block="none"
        None = 0,
        //% block="short"
        Short = 1,
        //% block="tall"
        Tall = 2,
    }

    function textWallConnectionTypeNorth(value: StateWallConnectionTypeNorthValue): string {
        if (value == StateWallConnectionTypeNorthValue.None) return "none";
        if (value == StateWallConnectionTypeNorthValue.Short) return "short";
        if (value == StateWallConnectionTypeNorthValue.Tall) return "tall";
        return "none";
    }

    //% group="STRUCTURE"
    //% weight=73
    //% blockId=mcfunction_block_state_registry_wall_connection_type_north
    //% block="wall_connection_type_north $value"
    export function stateWallConnectionTypeNorth(value: StateWallConnectionTypeNorthValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("wall_connection_type_north", textWallConnectionTypeNorth(value)));
    }

    export enum StateWallConnectionTypeSouthValue {
        //% block="none"
        None = 0,
        //% block="short"
        Short = 1,
        //% block="tall"
        Tall = 2,
    }

    function textWallConnectionTypeSouth(value: StateWallConnectionTypeSouthValue): string {
        if (value == StateWallConnectionTypeSouthValue.None) return "none";
        if (value == StateWallConnectionTypeSouthValue.Short) return "short";
        if (value == StateWallConnectionTypeSouthValue.Tall) return "tall";
        return "none";
    }

    //% group="STRUCTURE"
    //% weight=72
    //% blockId=mcfunction_block_state_registry_wall_connection_type_south
    //% block="wall_connection_type_south $value"
    export function stateWallConnectionTypeSouth(value: StateWallConnectionTypeSouthValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("wall_connection_type_south", textWallConnectionTypeSouth(value)));
    }

    export enum StateWallConnectionTypeWestValue {
        //% block="none"
        None = 0,
        //% block="short"
        Short = 1,
        //% block="tall"
        Tall = 2,
    }

    function textWallConnectionTypeWest(value: StateWallConnectionTypeWestValue): string {
        if (value == StateWallConnectionTypeWestValue.None) return "none";
        if (value == StateWallConnectionTypeWestValue.Short) return "short";
        if (value == StateWallConnectionTypeWestValue.Tall) return "tall";
        return "none";
    }

    //% group="STRUCTURE"
    //% weight=71
    //% blockId=mcfunction_block_state_registry_wall_connection_type_west
    //% block="wall_connection_type_west $value"
    export function stateWallConnectionTypeWest(value: StateWallConnectionTypeWestValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState("wall_connection_type_west", textWallConnectionTypeWest(value)));
    }

    //% group="STRUCTURE"
    //% weight=70
    //% blockId=mcfunction_block_state_registry_wall_post_bit
    //% block="wall_post_bit $value"
    export function stateWallPostBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createBooleanBlockState("wall_post_bit", MCFunctionFields.booleanLiteralValue(value)));
    }

    export enum StateWeepingVinesAgeValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
        //% block="4"
        V4 = 4,
        //% block="5"
        V5 = 5,
        //% block="6"
        V6 = 6,
        //% block="7"
        V7 = 7,
        //% block="8"
        V8 = 8,
        //% block="9"
        V9 = 9,
        //% block="10"
        V10 = 10,
        //% block="11"
        V11 = 11,
        //% block="12"
        V12 = 12,
        //% block="13"
        V13 = 13,
        //% block="14"
        V14 = 14,
        //% block="15"
        V15 = 15,
        //% block="16"
        V16 = 16,
        //% block="17"
        V17 = 17,
        //% block="18"
        V18 = 18,
        //% block="19"
        V19 = 19,
        //% block="20"
        V20 = 20,
        //% block="21"
        V21 = 21,
        //% block="22"
        V22 = 22,
        //% block="23"
        V23 = 23,
        //% block="24"
        V24 = 24,
        //% block="25"
        V25 = 25,
    }

    //% group="LEVEL / GROWTH"
    //% weight=69
    //% blockId=mcfunction_block_state_registry_weeping_vines_age
    //% block="weeping_vines_age $value"
    export function stateWeepingVinesAge(value: StateWeepingVinesAgeValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("weeping_vines_age", value));
    }

    export enum StateWeirdoDirectionValue {
        //% block="0"
        V0 = 0,
        //% block="1"
        V1 = 1,
        //% block="2"
        V2 = 2,
        //% block="3"
        V3 = 3,
    }

    //% group="ORIENTATION"
    //% weight=68
    //% blockId=mcfunction_block_state_registry_weirdo_direction
    //% block="weirdo_direction $value"
    export function stateWeirdoDirection(value: StateWeirdoDirectionValue): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState("weirdo_direction", value));
    }

}

