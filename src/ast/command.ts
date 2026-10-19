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
        Particle = 14,
        PlaySound = 15,
        StopSound = 16,
        Music = 17,
        Gamerule = 18,
        Enchant = 19,
        CameraShake = 20,
        Tell = 21,
        Time = 22,
        Weather = 23,
        Difficulty = 24,
        Hud = 25,
        InputPermission = 26,
        Camera = 27,
        SpawnPoint = 28,
        SetWorldSpawn = 29
    }

    export interface CommandNode {
        kind: CommandKind;
    }
}
