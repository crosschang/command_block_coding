/** Animation and controller IDs remain open to resource-pack/add-on definitions. */
//% color="#895DA0" weight=82 icon="\uf008" block="ANIMATION ID"
namespace MCFunctionAnimationLibrary {
    export class AnimationValue {
        id: string;
        constructor(id: string) { this.id = id; }
    }
    export class ControllerValue {
        id: string;
        constructor(id: string) { this.id = id; }
    }
    //% group="Direct Input" weight=100
    //% blockId=mcfunction_animation_custom_id
    //% block="animation ID $id"
    //% id.shadow="text" id.defl="animation.creeper.swelling"
    export function custom(id: string): AnimationValue {
        return new AnimationValue(id);
    }
    //% blockHidden=true
    //% group="Direct Input" weight=99
    //% blockId=mcfunction_animation_controller_id
    //% block="animation controller ID $id"
    //% id.shadow="text" id.defl="controller.animation.custom"
    export function controller(id: string): ControllerValue {
        return new ControllerValue(id);
    }
}

/** Animation controllers have their own searchable MakeCode category.
 *  The canonical value type is still the existing ControllerValue. */
//% color="#6648A8" weight=81 icon="\uf085" block="ANIMATION CONTROLLER"
namespace MCFunctionAnimationControllerLibrary {
    //% group="Direct Input" weight=100
    //% blockId=mcfunction_animation_controller_custom_id
    //% block="animation controller ID $id"
    //% id.shadow="text" id.defl="controller.animation.creeper.swelling"
    export function custom(id: string): MCFunctionAnimationLibrary.ControllerValue {
        return new MCFunctionAnimationLibrary.ControllerValue(id);
    }
}
