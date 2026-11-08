/**
 * Common Bedrock block-state reporters.
 *
 * This is an authoring library, not a whitelist. The generic/custom block-state
 * inputs in MCFunctionBlockStateFields remain available for custom namespaces
 * and states that are not yet represented here.
 *
 * Exact state IDs are preserved. Vanilla blocks can use both unnamespaced states
 * such as `facing_direction` and namespaced states such as
 * `minecraft:facing_direction`; namespace presence alone does not mean Add-on-only.
 */
//% color="#58708A" weight=85 icon="\uf1b2" block="BLOCK STATE LIBRARY"
//% groups='["ORIENTATION", "ACTIVATION", "STRUCTURE", "LEVEL / GROWTH", "VARIANT / APPEARANCE", "SPECIAL / EDUCATION", "OTHER", "CUSTOM"]'
namespace MCFunctionBlockStateLibrary {
    export enum PillarAxis {
        //% block="x"
        X = 0,
        //% block="y"
        Y = 1,
        //% block="z"
        Z = 2
    }

    export enum CardinalDirection {
        //% block="north"
        North = 0,
        //% block="south"
        South = 1,
        //% block="east"
        East = 2,
        //% block="west"
        West = 3
    }

    export enum FacingDirectionText {
        //% block="north"
        North = 0,
        //% block="south"
        South = 1,
        //% block="east"
        East = 2,
        //% block="west"
        West = 3,
        //% block="up"
        Up = 4,
        //% block="down"
        Down = 5
    }

    /** Vanilla numeric facing_direction values used by many built-in blocks. */
    export enum FacingDirectionIndex {
        //% block="0 down"
        Down = 0,
        //% block="1 up"
        Up = 1,
        //% block="2 north"
        North = 2,
        //% block="3 south"
        South = 3,
        //% block="4 west"
        West = 4,
        //% block="5 east"
        East = 5
    }

    /** Legacy 4-way numeric direction. Keep the actual numeric value visible. */
    export enum DirectionIndex {
        //% block="0"
        D0 = 0,
        //% block="1"
        D1 = 1,
        //% block="2"
        D2 = 2,
        //% block="3"
        D3 = 3
    }

    export enum LeverDirection {
        //% block="down east-west"
        DownEastWest = 0,
        //% block="east"
        East = 1,
        //% block="west"
        West = 2,
        //% block="south"
        South = 3,
        //% block="north"
        North = 4,
        //% block="up north-south"
        UpNorthSouth = 5,
        //% block="up east-west"
        UpEastWest = 6,
        //% block="down north-south"
        DownNorthSouth = 7
    }

    export enum VerticalHalf {
        //% block="bottom"
        Bottom = 0,
        //% block="top"
        Top = 1
    }

    function axisText(value: PillarAxis): string {
        if (value == PillarAxis.X) return "x";
        if (value == PillarAxis.Z) return "z";
        return "y";
    }

    function cardinalText(value: CardinalDirection): string {
        if (value == CardinalDirection.North) return "north";
        if (value == CardinalDirection.East) return "east";
        if (value == CardinalDirection.West) return "west";
        return "south";
    }

    function facingText(value: FacingDirectionText): string {
        if (value == FacingDirectionText.North) return "north";
        if (value == FacingDirectionText.East) return "east";
        if (value == FacingDirectionText.West) return "west";
        if (value == FacingDirectionText.Up) return "up";
        if (value == FacingDirectionText.Down) return "down";
        return "south";
    }

    function leverText(value: LeverDirection): string {
        if (value == LeverDirection.East) return "east";
        if (value == LeverDirection.West) return "west";
        if (value == LeverDirection.South) return "south";
        if (value == LeverDirection.North) return "north";
        if (value == LeverDirection.UpNorthSouth) return "up_north_south";
        if (value == LeverDirection.UpEastWest) return "up_east_west";
        if (value == LeverDirection.DownNorthSouth) return "down_north_south";
        return "down_east_west";
    }

    //% group="ORIENTATION" weight=100
    //% blockId=mcfunction_block_state_library_pillar_axis
    //% block="pillar axis $axis"
    export function pillarAxis(axis: PillarAxis): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createStringBlockState("pillar_axis", axisText(axis))
        );
    }

    //% group="ORIENTATION" weight=99
    //% blockId=mcfunction_block_state_library_cardinal_direction
    //% block="cardinal direction $direction"
    export function cardinalDirection(direction: CardinalDirection): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createStringBlockState("minecraft:cardinal_direction", cardinalText(direction))
        );
    }

    //% group="ORIENTATION" weight=98
    //% blockId=mcfunction_block_state_library_minecraft_facing_direction
    //% block="minecraft facing direction $direction"
    export function minecraftFacingDirection(direction: FacingDirectionText): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createStringBlockState("minecraft:facing_direction", facingText(direction))
        );
    }

    //% group="ORIENTATION" weight=97
    //% blockId=mcfunction_block_state_library_facing_direction
    //% block="facing direction $direction"
    export function facingDirection(direction: FacingDirectionIndex): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createNumberBlockState("facing_direction", direction)
        );
    }

    //% group="ORIENTATION" weight=96
    //% blockId=mcfunction_block_state_library_direction
    //% block="direction $direction"
    export function direction(direction: DirectionIndex): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createNumberBlockState("direction", direction)
        );
    }

    //% group="ORIENTATION" weight=95
    //% blockId=mcfunction_block_state_library_lever_direction
    //% block="lever direction $direction"
    export function leverDirection(direction: LeverDirection): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createStringBlockState("lever_direction", leverText(direction))
        );
    }

    //% group="ACTIVATION" weight=100
    //% blockId=mcfunction_block_state_library_open_bit
    //% block="open bit $value"
    export function openBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createBooleanBlockState("open_bit", MCFunctionFields.booleanLiteralValue(value))
        );
    }

    //% group="ACTIVATION" weight=99
    //% blockId=mcfunction_block_state_library_button_pressed_bit
    //% block="button pressed bit $value"
    export function buttonPressedBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createBooleanBlockState("button_pressed_bit", MCFunctionFields.booleanLiteralValue(value))
        );
    }

    //% group="ACTIVATION" weight=98
    //% blockId=mcfunction_block_state_library_powered_bit
    //% block="powered bit $value"
    export function poweredBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createBooleanBlockState("powered_bit", MCFunctionFields.booleanLiteralValue(value))
        );
    }

    //% group="ACTIVATION" weight=97
    //% blockId=mcfunction_block_state_library_triggered_bit
    //% block="triggered bit $value"
    export function triggeredBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createBooleanBlockState("triggered_bit", MCFunctionFields.booleanLiteralValue(value))
        );
    }

    //% group="STRUCTURE" weight=100
    //% blockId=mcfunction_block_state_library_upside_down_bit
    //% block="upside down bit $value"
    export function upsideDownBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createBooleanBlockState("upside_down_bit", MCFunctionFields.booleanLiteralValue(value))
        );
    }

    //% group="STRUCTURE" weight=99
    //% blockId=mcfunction_block_state_library_door_hinge_bit
    //% block="door hinge bit $value"
    export function doorHingeBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createBooleanBlockState("door_hinge_bit", MCFunctionFields.booleanLiteralValue(value))
        );
    }

    //% group="STRUCTURE" weight=98
    //% blockId=mcfunction_block_state_library_upper_block_bit
    //% block="upper block bit $value"
    export function upperBlockBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createBooleanBlockState("upper_block_bit", MCFunctionFields.booleanLiteralValue(value))
        );
    }

    //% group="STRUCTURE" weight=97
    //% blockId=mcfunction_block_state_library_in_wall_bit
    //% block="in wall bit $value"
    export function inWallBit(value: MCFunctionFields.BooleanLiteral): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createBooleanBlockState("in_wall_bit", MCFunctionFields.booleanLiteralValue(value))
        );
    }

    //% group="STRUCTURE" weight=96
    //% blockId=mcfunction_block_state_library_vertical_half
    //% block="vertical half $value"
    export function verticalHalf(value: VerticalHalf): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createStringBlockState(
                "minecraft:vertical_half",
                value == VerticalHalf.Top ? "top" : "bottom"
            )
        );
    }

    //% group="CUSTOM" weight=100
    //% blockId=mcfunction_block_state_library_custom_text
    //% block="custom state $key text $value"
    //% key.shadow="text"
    //% key.defl="my_namespace:state"
    //% value.shadow="text"
    export function customText(key: string, value: string): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createStringBlockState(key, value));
    }

    //% group="CUSTOM" weight=99
    //% blockId=mcfunction_block_state_library_custom_number
    //% block="custom state $key number $value"
    //% key.shadow="text"
    //% key.defl="my_namespace:state"
    export function customNumber(key: string, value: number): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(MCFunctionAST.createNumberBlockState(key, value));
    }

    //% group="CUSTOM" weight=98
    //% blockId=mcfunction_block_state_library_custom_boolean
    //% block="custom state $key boolean $value"
    //% key.shadow="text"
    //% key.defl="my_namespace:state"
    export function customBoolean(
        key: string,
        value: MCFunctionFields.BooleanLiteral
    ): MCFunctionBlockStateFields.BlockStateEntryValue {
        return MCFunctionBlockStateFields.entry(
            MCFunctionAST.createBooleanBlockState(key, MCFunctionFields.booleanLiteralValue(value))
        );
    }
}
