/** B4 MakeCode blocks. Each command goes through Adapter -> AST -> Validator -> Compiler. */
namespace Command {
    export class PlayAnimationBlendValue {
        seconds: number;
        constructor(seconds: number) { this.seconds = seconds; }
    }
    export class PlayAnimationStopValue {
        expression: string;
        constructor(expression: string) { this.expression = expression; }
    }
    export class PlayAnimationOptionsValue {
        nextState: string;
        blendOutTime?: number;
        stopExpression?: string;
        controllerId?: string;
        constructor(nextState: string, blendOutTime?: number,
            stopExpression?: string, controllerId?: string) {
            this.nextState = nextState;
            this.blendOutTime = blendOutTime;
            this.stopExpression = stopExpression;
            this.controllerId = controllerId;
        }
    }

    //% blockId=mcfunction_playanimation_blend_seconds
    //% group="PLAYANIMATION" weight=97
    //% block="blend out $seconds seconds"
    //% seconds.defl=0
    export function animationBlend(seconds: number): PlayAnimationBlendValue {
        return new PlayAnimationBlendValue(seconds);
    }
    //% blockId=mcfunction_playanimation_stop_expression
    //% group="PLAYANIMATION" weight=96
    //% block="stop when $expression"
    //% expression.shadow="text" expression.defl="query.is_alive"
    export function animationStop(expression: string): PlayAnimationStopValue {
        return new PlayAnimationStopValue(expression);
    }
    /** Bedrock optional argument order is fixed; later options require earlier ones. */
    //% blockId=mcfunction_playanimation_options
    //% group="PLAYANIMATION" weight=98
    //% block="animation next state $nextState || blend $blend stop $stop controller $controller"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% nextState.shadow="text" nextState.defl="default"
    //% blend.shadow="mcfunction_playanimation_blend_seconds"
    //% stop.shadow="mcfunction_playanimation_stop_expression"
    //% controller.shadow="mcfunction_animation_controller_custom_id"
    export function animationOptions(nextState: string,
        blend?: PlayAnimationBlendValue, stop?: PlayAnimationStopValue,
        controller?: MCFunctionAnimationLibrary.ControllerValue): PlayAnimationOptionsValue {
        return new PlayAnimationOptionsValue(nextState,
            blend ? blend.seconds : undefined,
            stop ? stop.expression : undefined,
            controller ? controller.id : undefined);
    }

    //% blockId=command_playanimation
    //% group="PLAYANIMATION" weight=115
    //% block="PLAYANIMATION entity $target animation $animation || options $options"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% animation.shadow="mcfunction_animation_custom_id"
    //% options.shadow="mcfunction_playanimation_options"
    export function playAnimation(target: MCFunctionFields.TargetValue,
        animation: MCFunctionAnimationLibrary.AnimationValue,
        options?: PlayAnimationOptionsValue): void {
        executeAudioCommand(MCFunctionBlocks.createPlayAnimationCommand(
            target ? target.target : undefined,
            animation ? animation.id : undefined,
            options ? options.nextState : undefined,
            options ? options.blendOutTime : undefined,
            options ? options.stopExpression : undefined,
            options ? options.controllerId : undefined));
    }

    /** One FOG block with typed action reporters, to avoid 3 duplicate commands. */
    export class FogActionValue {
        action: MCFunctionAST.FogAction;
        fogId?: string;
        userProvidedId: string;
        constructor(action: MCFunctionAST.FogAction, id: string, fogId?: string) {
            this.action = action;
            this.userProvidedId = id;
            this.fogId = fogId;
        }
    }
    //% blockId=mcfunction_fog_action_push
    //% group="FOG" weight=99
    //% block="push fog $fogId as $userId"
    //% fogId.shadow="mcfunction_fog_builtin_default"
    //% userId.shadow="text" userId.defl="cbi_fog_test"
    export function fogPush(fogId: MCFunctionFogLibrary.FogValue,
        userId: string): FogActionValue {
        return new FogActionValue(MCFunctionAST.FogAction.Push,
            userId, fogId ? fogId.id : undefined);
    }
    //% blockId=mcfunction_fog_action_pop
    //% group="FOG" weight=98
    //% block="pop fog ID $userId"
    //% userId.shadow="text" userId.defl="cbi_fog_test"
    export function fogPop(userId: string): FogActionValue {
        return new FogActionValue(MCFunctionAST.FogAction.Pop, userId);
    }
    //% blockId=mcfunction_fog_action_remove
    //% group="FOG" weight=97
    //% block="remove all fog with ID $userId"
    //% userId.shadow="text" userId.defl="cbi_fog_test"
    export function fogRemove(userId: string): FogActionValue {
        return new FogActionValue(MCFunctionAST.FogAction.Remove, userId);
    }
    //% blockId=command_fog
    //% group="FOG" weight=114
    //% block="FOG player $target action $action"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_fog_action_push"
    export function fog(target: MCFunctionFields.TargetValue,
        action: FogActionValue): void {
        executeAudioCommand(MCFunctionBlocks.createFogCommand(
            target ? target.target : undefined,
            action ? action.action : undefined,
            action ? action.userProvidedId : undefined,
            action ? action.fogId : undefined));
    }
}
