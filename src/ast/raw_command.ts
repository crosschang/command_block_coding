/**
 * Raw Command AST.
 *
 * Keeps unsupported or not-yet-structured Minecraft command lines intact so
 * Blocks -> AST -> Compiler and future Parser round-trips never delete them.
 */
namespace MCFunctionAST {
    export interface RawCommand extends CommandNode {
        kind: CommandKind;
        raw: string;
    }

    export function createRawCommand(raw: string): RawCommand {
        return {
            kind: CommandKind.Raw,
            raw: raw
        };
    }
}
