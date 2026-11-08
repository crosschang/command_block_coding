/**
 * kill command AST.
 *
 * Bedrock form:
 * - kill [target]
 */
namespace MCFunctionAST {
    export interface KillCommand extends CommandNode {
        kind: CommandKind;
        target?: Selector;
    }

    export function createKillCommand(
        target?: Selector
    ): KillCommand {
        return {
            kind: CommandKind.Kill,
            target: target
        };
    }
}
