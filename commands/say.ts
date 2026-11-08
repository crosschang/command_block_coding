/** SAY command AST. */
namespace MCFunctionAST {
    export interface SayCommand extends CommandNode {
        kind: CommandKind;
        message: string;
    }

    export function createSayCommand(message: string): SayCommand {
        return {
            kind: CommandKind.Say,
            message: message
        };
    }
}
