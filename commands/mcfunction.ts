/** Minecraft `function` command AST. */
namespace MCFunctionAST {
    export interface McFunctionCommand extends CommandNode {
        kind: CommandKind;
        functionId: string;
    }

    export function createMcFunctionCommand(functionId: string): McFunctionCommand {
        return {
            kind: CommandKind.McFunction,
            functionId: functionId
        };
    }
}
