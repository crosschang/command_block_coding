/**
 * tag command AST.
 *
 * Bedrock forms:
 * - tag <entity> add <name>
 * - tag <entity> remove <name>
 * - tag <entity> list
 */
namespace MCFunctionAST {
    export enum TagActionKind {
        Add = 0,
        Remove = 1,
        List = 2
    }

    export interface TagCommand extends CommandNode {
        kind: CommandKind;
        target: Selector;
        action: TagActionKind;
        name?: string;
    }

    export function createTagCommand(
        target: Selector,
        action: TagActionKind,
        name?: string
    ): TagCommand {
        return {
            kind: CommandKind.Tag,
            target: target,
            action: action,
            name: name
        };
    }
}
