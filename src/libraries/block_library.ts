/** Searchable Block ID values. Full Registry reporters are generated separately. */
//% color="#58708A" weight=87 icon="\uf1b2" block="BLOCK ID"
//% groups='["Direct Input", "Registry"]'
namespace MCFunctionBlockLibrary {
    //% group="Direct Input"
    //% weight=100
    //% blockId=mcfunction_block_custom_id
    //% block="block custom id $blockId"
    //% blockId.shadow="text"
    //% blockId.defl="minecraft:stone"
    export function custom(blockId: string): MCFunctionFields.BlockValue {
        return MCFunctionFields.block(blockId);
    }
}
