/** Typed, version-aware native /gamerule AST; not an Add-on-defined ID space. */
namespace MCFunctionAST {
    export enum GameRuleAction {
        List = 0,
        Query = 1,
        SetBoolean = 2,
        SetInteger = 3,
        SetEnum = 4
    }
    export interface GameRuleCommand extends CommandNode {
        kind: CommandKind;
        action: GameRuleAction;
        ruleId?: string;
        booleanValue?: boolean;
        integerValue?: number;
        enumValue?: string;
    }
    export function createGameRuleCommand(
        action: GameRuleAction, ruleId?: string,
        booleanValue?: boolean, integerValue?: number, enumValue?: string
    ): GameRuleCommand {
        return { kind: CommandKind.Gamerule, action: action, ruleId: ruleId,
            booleanValue: booleanValue, integerValue: integerValue, enumValue: enumValue };
    }
}
