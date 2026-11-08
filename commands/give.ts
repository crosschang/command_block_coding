/**
 * give command AST
 */

namespace MCFunctionAST {

    export interface GiveCommand extends CommandNode {
        kind: CommandKind;
        target: Selector;
        item: ItemStack;
    }

    export function createGiveCommand(
        target: Selector,
        item: ItemStack
    ): GiveCommand {
        return {
            kind: CommandKind.Give,
            target: target,
            item: item
        };
    }
}