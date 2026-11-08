/**
 * gamemode command AST.
 *
 * Bedrock form:
 * - gamemode <gameMode> [player]
 */
namespace MCFunctionAST {
    export enum GameMode {
        //% block="survival"
        Survival = 0,

        //% block="creative"
        Creative = 1,

        //% block="adventure"
        Adventure = 2,

        //% block="spectator"
        Spectator = 3
    }

    export interface GameModeCommand extends CommandNode {
        kind: CommandKind;
        gameMode: GameMode;
        target?: Selector;
    }

    export function createGameModeCommand(
        gameMode: GameMode,
        target?: Selector
    ): GameModeCommand {
        return {
            kind: CommandKind.GameMode,
            gameMode: gameMode,
            target: target
        };
    }
}
