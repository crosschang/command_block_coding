/** Minecraft native game rules: versioned typed command enum, not custom Add-on values. */
//% color="#795548" weight=81 icon="\uf085" block="GAMERULE ID"
//% groups='["Direct Input", "Boolean", "Integer", "Enum"]'
namespace MCFunctionGameruleLibrary {
    export class GameRuleRef {
        ruleId: string;
        constructor(ruleId: string) { this.ruleId = ruleId; }
    }
    //% group="Direct Input" weight=100
    //% blockId=mcfunction_gamerule_direct
    //% block="gamerule direct value $ruleId"
    //% ruleId.shadow="text"
    //% ruleId.defl="keepinventory"
    export function custom(ruleId: string): GameRuleRef {
        return new GameRuleRef(ruleId);
    }
}
