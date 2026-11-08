/** C2 typed Bedrock/Education scoreboard command AST, shared command target. */
namespace MCFunctionAST {
    export enum ScoreboardAction {
        ObjectiveAdd = 0, ObjectiveRemove = 1, ObjectiveList = 2, ObjectiveDisplay = 3,
        PlayerSet = 4, PlayerAdd = 5, PlayerRemove = 6, PlayerReset = 7,
        PlayerList = 8, PlayerOperation = 9, PlayerTest = 10, PlayerRandom = 11
    }
    export enum ScoreboardDisplaySlot { Sidebar = 0, List = 1, BelowName = 2 }
    export enum ScoreboardSortOrder { Ascending = 0, Descending = 1 }
    export enum ScoreboardMathOperator {
        Assign = 0, Add = 1, Subtract = 2, Multiply = 3,
        Divide = 4, Modulo = 5, Minimum = 6, Maximum = 7, Swap = 8
    }
    export interface ScoreboardCommand extends CommandNode {
        action: ScoreboardAction;
        objective?: string;
        displayName?: string;
        slot?: ScoreboardDisplaySlot;
        sortOrder?: ScoreboardSortOrder;
        target?: PlayerTarget;
        count?: number;
        source?: PlayerTarget;
        sourceObjective?: string;
        operator?: ScoreboardMathOperator;
        minimum?: string;
        maximum?: string;
    }
    export function createScoreboardCommand(action: ScoreboardAction): ScoreboardCommand {
        return { kind: CommandKind.Scoreboard, action: action };
    }
}
