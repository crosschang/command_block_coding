/**
 * MakeCode Item Components value blocks
 *
 * give, replaceitem 등에서 공통 사용.
 */

namespace MCFunctionFields {

    export class ItemComponentsValue {

        components:
            MCFunctionAST.ItemCommandComponents;

        constructor(
            components:
                MCFunctionAST.ItemCommandComponents
        ) {
            this.components = components;
        }
    }

    export function itemComponents(
    ): ItemComponentsValue {

        return new ItemComponentsValue(
            MCFunctionAST.createItemCommandComponents()
        );
    }

    export function addCanDestroy(
        components: ItemComponentsValue,
        blockValue: BlockValue
    ): ItemComponentsValue {

        MCFunctionAST.addCanDestroyBlock(
            components.components,
            blockValue.blockId
        );

        return components;
    }

    export function addCanPlaceOn(
        components: ItemComponentsValue,
        blockValue: BlockValue
    ): ItemComponentsValue {

        MCFunctionAST.addCanPlaceOnBlock(
            components.components,
            blockValue.blockId
        );

        return components;
    }

    export function lockInInventory(
        components: ItemComponentsValue
    ): ItemComponentsValue {

        MCFunctionAST.setItemLock(
            components.components,
            MCFunctionAST.ItemLockMode.LockInInventory
        );

        return components;
    }

    export function lockInSlot(
        components: ItemComponentsValue
    ): ItemComponentsValue {

        MCFunctionAST.setItemLock(
            components.components,
            MCFunctionAST.ItemLockMode.LockInSlot
        );

        return components;
    }

    export function keepOnDeath(
        components: ItemComponentsValue
    ): ItemComponentsValue {

        MCFunctionAST.setKeepOnDeath(
            components.components,
            true
        );

        return components;
    }
}
