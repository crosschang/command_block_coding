/** Searchable Item ID values. Full Registry reporters are generated separately. */
//% color="#C98900" weight=88 icon="\uf06b" block="ITEM ID"
//% groups='["Direct Input", "Registry"]'
namespace MCFunctionItemLibrary {
    //% group="Direct Input"
    //% weight=100
    //% blockId=mcfunction_item_custom_id
    //% block="item custom id $itemId"
    //% itemId.shadow="text"
    //% itemId.defl="minecraft:stone"
    export function custom(itemId: string): string {
        return itemId;
    }
}
