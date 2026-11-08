/**
 * Minecraft Item Command Components AST
 *
 * give, replaceitem 등에서 공통으로 사용한다.
 */

namespace MCFunctionAST {

    export enum ItemLockMode {
        None = 0,
        LockInInventory = 1,
        LockInSlot = 2
    }

    export interface ItemCommandComponents {
        canDestroy: string[];
        canPlaceOn: string[];

        itemLock: ItemLockMode;
        keepOnDeath: boolean;
    }

    export function createItemCommandComponents(
    ): ItemCommandComponents {

        return {
            canDestroy: [],
            canPlaceOn: [],

            itemLock: ItemLockMode.None,
            keepOnDeath: false
        };
    }

    export function addCanDestroyBlock(
        components: ItemCommandComponents,
        blockId: string
    ): void {
        components.canDestroy.push(blockId);
    }

    export function addCanPlaceOnBlock(
        components: ItemCommandComponents,
        blockId: string
    ): void {
        components.canPlaceOn.push(blockId);
    }

    export function setItemLock(
        components: ItemCommandComponents,
        mode: ItemLockMode
    ): void {
        components.itemLock = mode;
    }

    export function setKeepOnDeath(
        components: ItemCommandComponents,
        value: boolean
    ): void {
        components.keepOnDeath = value;
    }

    export function hasItemCommandComponents(
        components: ItemCommandComponents
    ): boolean {

        return (
            components.canDestroy.length > 0 ||
            components.canPlaceOn.length > 0 ||
            components.itemLock != ItemLockMode.None ||
            components.keepOnDeath
        );
    }
}