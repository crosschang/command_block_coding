/** B4 canonical command AST: PLAYANIMATION and FOG. */
namespace MCFunctionAST {
    export interface PlayAnimationCommand extends CommandNode {
        target: PlayerTarget;
        animationId: string;
        nextState?: string;
        blendOutTime?: number;
        stopExpression?: string;
        controllerId?: string;
    }
    export function createPlayAnimationCommand(target: PlayerTarget,
        animationId: string, nextState?: string, blendOutTime?: number,
        stopExpression?: string, controllerId?: string): PlayAnimationCommand {
        return { kind: CommandKind.PlayAnimation, target: target, animationId: animationId,
            nextState: nextState, blendOutTime: blendOutTime,
            stopExpression: stopExpression, controllerId: controllerId };
    }

    export enum FogAction { Push = 0, Pop = 1, Remove = 2 }
    export interface FogCommand extends CommandNode {
        target: PlayerTarget;
        action: FogAction;
        fogId?: string;
        userProvidedId: string;
    }
    export function createFogCommand(target: PlayerTarget,
        action: FogAction, userProvidedId: string, fogId?: string): FogCommand {
        return { kind: CommandKind.Fog, target: target, action: action,
            userProvidedId: userProvidedId, fogId: fogId };
    }
}
