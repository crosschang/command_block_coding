/**
 * MakeCode Range value blocks
 */

namespace MCFunctionFields {

    export class RangeValue {
        range: MCFunctionAST.NumberRange;

        constructor(range: MCFunctionAST.NumberRange) {
            this.range = range;
        }
    }

    //% group="Common Values"
    //% blockId=mcfunction_range_min
    //% block="range $min or more"
    //% min.defl=0
    export function rangeMin(
        min: number
    ): RangeValue {
        return new RangeValue(
            MCFunctionAST.createMinRange(min)
        );
    }

    //% group="Common Values"
    //% blockId=mcfunction_range_max
    //% block="range $max or less"
    //% max.defl=10
    export function rangeMax(
        max: number
    ): RangeValue {
        return new RangeValue(
            MCFunctionAST.createMaxRange(max)
        );
    }

    //% group="Common Values"
    //% blockId=mcfunction_range_min_max
    //% block="range $min to $max"
    //% min.defl=0
    //% max.defl=10
    export function rangeMinMax(
        min: number,
        max: number
    ): RangeValue {
        return new RangeValue(
            MCFunctionAST.createMinMaxRange(min, max)
        );
    }
}