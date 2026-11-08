/**
 * MakeCode-facing Item Component blocks.
 *
 * This intentionally reuses the existing mcfunction_item_id_text_shadow from
 * src/fields/value_input.ts. Do NOT redefine that blockId here.
 * Full Registry reporters can replace these direct-input shadows.
 */
//% color="#C98900" weight=88 icon="\uf06b" block="ITEM"
//% groups='["Item Components"]'
namespace MCFunctionItemComponents {

    // Hidden direct BlockValue shadow used only by component inputs.
    //% blockId=mcfunction_component_block_id_shadow
    //% block="$blockId"
    //% blockHidden=true
    //% blockId.defl="minecraft:stone"
    export function blockIdShadow(blockId: string): MCFunctionFields.BlockValue {
        return MCFunctionFields.block(blockId);
    }

    //% group="Item Components"
    //% weight=90
    //% blockId=mcfunction_item_components
    //% block="no item components"
    export function components(): MCFunctionFields.ItemComponentsValue {
        return MCFunctionFields.itemComponents();
    }

    //% group="Item Components"
    //% weight=89
    //% blockId=mcfunction_item_component_can_destroy
    //% block="can destroy block $blockValue add then $components"
    //% blockValue.shadow="mcfunction_component_block_id_shadow"
    //% components.shadow="mcfunction_item_components"
    export function addCanDestroy(
        blockValue: MCFunctionFields.BlockValue,
        components: MCFunctionFields.ItemComponentsValue
    ): MCFunctionFields.ItemComponentsValue {
        return MCFunctionFields.addCanDestroy(components, blockValue);
    }

    //% group="Item Components"
    //% weight=88
    //% blockId=mcfunction_item_component_can_place_on
    //% block="can place on block $blockValue add then $components"
    //% blockValue.shadow="mcfunction_component_block_id_shadow"
    //% components.shadow="mcfunction_item_components"
    export function addCanPlaceOn(
        blockValue: MCFunctionFields.BlockValue,
        components: MCFunctionFields.ItemComponentsValue
    ): MCFunctionFields.ItemComponentsValue {
        return MCFunctionFields.addCanPlaceOn(components, blockValue);
    }

    //% group="Item Components"
    //% weight=87
    //% blockId=mcfunction_item_component_lock_inventory
    //% block="lock in inventory then $components"
    //% components.shadow="mcfunction_item_components"
    export function lockInInventory(
        components: MCFunctionFields.ItemComponentsValue
    ): MCFunctionFields.ItemComponentsValue {
        return MCFunctionFields.lockInInventory(components);
    }

    //% group="Item Components"
    //% weight=86
    //% blockId=mcfunction_item_component_lock_slot
    //% block="lock in slot then $components"
    //% components.shadow="mcfunction_item_components"
    export function lockInSlot(
        components: MCFunctionFields.ItemComponentsValue
    ): MCFunctionFields.ItemComponentsValue {
        return MCFunctionFields.lockInSlot(components);
    }

    //% group="Item Components"
    //% weight=85
    //% blockId=mcfunction_item_component_keep_on_death
    //% block="keep on death then $components"
    //% components.shadow="mcfunction_item_components"
    export function keepOnDeath(
        components: MCFunctionFields.ItemComponentsValue
    ): MCFunctionFields.ItemComponentsValue {
        return MCFunctionFields.keepOnDeath(components);
    }
}
