/** One public GAMERULE statement; action reporters preserve typed native values. */
namespace Command {
    export class GameRuleOperationValue {
        command: MCFunctionAST.GameRuleCommand;
        constructor(command: MCFunctionAST.GameRuleCommand) { this.command = command; }
    }

    //% blockId=mcfunction_gamerule_list_action
    //% group="GAMERULE" weight=96
    //% block="list gamerules"
    export function gameruleListAction(): GameRuleOperationValue {
        return new GameRuleOperationValue(MCFunctionBlocks.createGameRuleCommand(MCFunctionAST.GameRuleAction.List));
    }

    //% blockId=mcfunction_gamerule_query_action
    //% group="GAMERULE" weight=95
    //% block="query gamerule $rule"
    //% rule.shadow="mcfunction_gamerule_registry_keepinventory"
    export function gameruleQueryAction(rule: MCFunctionGameruleLibrary.GameRuleRef): GameRuleOperationValue {
        return new GameRuleOperationValue(MCFunctionBlocks.createGameRuleCommand(
            MCFunctionAST.GameRuleAction.Query, rule ? rule.ruleId : ""));
    }

    //% blockId=mcfunction_gamerule_boolean_action
    //% group="GAMERULE" weight=94
    //% block="set boolean gamerule $rule to $value"
    //% rule.shadow="mcfunction_gamerule_registry_keepinventory"
    export function gameruleBooleanAction(
        rule: MCFunctionGameruleLibrary.GameRuleRef,
        value: MCFunctionFields.BooleanLiteral
    ): GameRuleOperationValue {
        return new GameRuleOperationValue(MCFunctionBlocks.createGameRuleCommand(
            MCFunctionAST.GameRuleAction.SetBoolean,
            rule ? rule.ruleId : "",
            MCFunctionFields.booleanLiteralValue(value)
        ));
    }

    //% blockId=mcfunction_gamerule_integer_action
    //% group="GAMERULE" weight=93
    //% block="set integer gamerule $rule to $value"
    //% rule.shadow="mcfunction_gamerule_registry_randomtickspeed"
    //% value.defl=1
    export function gameruleIntegerAction(
        rule: MCFunctionGameruleLibrary.GameRuleRef, value: number
    ): GameRuleOperationValue {
        return new GameRuleOperationValue(MCFunctionBlocks.createGameRuleCommand(
            MCFunctionAST.GameRuleAction.SetInteger, rule ? rule.ruleId : "",
            undefined, value));
    }

    //% blockId=mcfunction_gamerule_enum_action
    //% group="GAMERULE" weight=92
    //% block="set enum gamerule $rule to $value"
    //% rule.shadow="mcfunction_gamerule_registry_playerwaypoints"
    //% value.shadow="text"
    //% value.defl="everyone"
    export function gameruleEnumAction(
        rule: MCFunctionGameruleLibrary.GameRuleRef, value: string
    ): GameRuleOperationValue {
        return new GameRuleOperationValue(MCFunctionBlocks.createGameRuleCommand(
            MCFunctionAST.GameRuleAction.SetEnum, rule ? rule.ruleId : "",
            undefined, undefined, value));
    }

    //% blockId=command_gamerule_unified
    //% group="GAMERULE" weight=110
    //% block="GAMERULE $operation"
    //% operation.shadow="mcfunction_gamerule_boolean_action"
    //% inlineInputMode=external
    export function gamerule(operation: GameRuleOperationValue): void {
        executeAudioCommand(operation ? operation.command :
            MCFunctionBlocks.createGameRuleCommand(MCFunctionAST.GameRuleAction.Query, ""));
    }
}
