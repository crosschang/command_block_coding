/**
 * 공통 Number Range AST
 *
 * 거리, 레벨, 회전, scoreboard 범위 등에서 재사용한다.
 */

namespace MCFunctionAST {

    export interface NumberRange {
        hasMin: boolean;
        min: number;

        hasMax: boolean;
        max: number;
    }

    export function createRange(
        hasMin: boolean,
        min: number,
        hasMax: boolean,
        max: number
    ): NumberRange {
        return {
            hasMin: hasMin,
            min: min,
            hasMax: hasMax,
            max: max
        };
    }

    export function createMinRange(
        min: number
    ): NumberRange {
        return {
            hasMin: true,
            min: min,
            hasMax: false,
            max: 0
        };
    }

    export function createMaxRange(
        max: number
    ): NumberRange {
        return {
            hasMin: false,
            min: 0,
            hasMax: true,
            max: max
        };
    }

    export function createMinMaxRange(
        min: number,
        max: number
    ): NumberRange {
        return {
            hasMin: true,
            min: min,
            hasMax: true,
            max: max
        };
    }
}