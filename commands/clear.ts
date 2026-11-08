/**
 * clear command AST.
 *
 * Bedrock form:
 * - clear [player] [itemName] [data] [maxCount]
 *
 * Optional arguments are positional. The compiler inserts Bedrock defaults
 * only when a later argument is present and an earlier optional slot is
 * omitted by the UI.
 */
namespace MCFunctionAST {
    export interface ClearCommand extends CommandNode {
        kind: CommandKind;
        target?: Selector;
        itemId?: string;
        data?: number;
        maxCount?: number;
    }

    export function createClearCommand(
        target?: Selector,
        itemId?: string,
        data?: number,
        maxCount?: number
    ): ClearCommand {
        return {
            kind: CommandKind.Clear,
            target: target,
            itemId: itemId,
            data: data,
            maxCount: maxCount
        };
    }
}
