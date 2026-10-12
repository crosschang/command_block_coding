/**
 * Minecraft command AST core.
 * Command meaning lives here, not in block text or raw strings.
 */
namespace MCFunctionAST {
    export enum CommandKind {
        Raw = 0,
        Say = 1,
        McFunction = 2,
        Give = 3,
        Teleport = 4,
        Summon = 5,
        Effect = 6,
        Tag = 7,
        GameMode = 8,
        Kill = 9,
        Clear = 10,
        SetBlock = 11,
        Fill = 12,
        Clone = 13,
        Particle = 14
    }

    export interface CommandNode {
        kind: CommandKind;
    }
}
