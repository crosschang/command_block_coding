/**
 * Minecraft Item AST
 *
 * give, clear, replaceitem 등에서 공통으로 사용한다.
 *
 * amount / data / components preserve whether the optional GIVE tail was
 * actually present. The compiler inserts Bedrock positional defaults only
 * when a later optional argument requires an earlier slot.
 */

namespace MCFunctionAST {

    export interface ItemStack {
        id: string;
        amount?: number;
        data?: number;
        components?: ItemCommandComponents;
    }

    export function createItemStack(
        id: string,
        amount?: number,
        data?: number
    ): ItemStack {
        return {
            id: id,
            amount: amount,
            data: data
        };
    }

    export function createItemStackWithComponents(
        id: string,
        amount: number,
        data: number,
        components: ItemCommandComponents
    ): ItemStack {
        return {
            id: id,
            amount: amount,
            data: data,
            components: components
        };
    }
}
