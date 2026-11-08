/** B3 damage/event and C1 controlscheme/aimassist canonical AST. */
namespace MCFunctionAST {
    export enum DamageAction { Apply = 0, FromEntity = 1 }
    export interface DamageCommand extends CommandNode {
        target: PlayerTarget;
        amount: number;
        cause?: string;
        action: DamageAction;
        damager?: PlayerTarget;
    }
    export function createDamageCommand(target: PlayerTarget, amount: number,
        cause?: string, damager?: PlayerTarget,
        action?: DamageAction): DamageCommand {
        return { kind: CommandKind.Damage, target: target, amount: amount, cause: cause,
            action: action == undefined ? (damager ? DamageAction.FromEntity : DamageAction.Apply) : action,
            damager: damager };
    }

    export interface EventCommand extends CommandNode {
        target: PlayerTarget;
        eventId: string;
        /** Metadata hint for owner-scoped validation; not a command token. */
        ownerEntityId?: string;
    }
    export function createEventCommand(target: PlayerTarget, eventId: string,
        ownerEntityId?: string): EventCommand {
        return { kind: CommandKind.Event, target: target, eventId: eventId,
            ownerEntityId: ownerEntityId };
    }

    export enum ControlSchemeAction { Set = 0, Clear = 1 }
    export enum ControlSchemeType {
        CameraRelative = 0, CameraRelativeStrafe = 1,
        PlayerRelative = 2, PlayerRelativeStrafe = 3,
        LockedPlayerRelativeStrafe = 4
    }
    export interface ControlSchemeCommand extends CommandNode {
        target: PlayerTarget;
        action: ControlSchemeAction;
        scheme?: ControlSchemeType;
    }
    export function createControlSchemeCommand(target: PlayerTarget,
        action: ControlSchemeAction, scheme?: ControlSchemeType): ControlSchemeCommand {
        return { kind: CommandKind.ControlScheme, target: target, action: action, scheme: scheme };
    }

    export enum AimAssistAction { Set = 0, Clear = 1 }
    export enum AimAssistTargetMode { Distance = 0, Angle = 1 }
    export interface AimAssistCommand extends CommandNode {
        target: PlayerTarget;
        action: AimAssistAction;
        xAngle?: number;
        yAngle?: number;
        maxDistance?: number;
        targetMode?: AimAssistTargetMode;
        presetId?: string;
    }
    export function createAimAssistCommand(target: PlayerTarget,
        action: AimAssistAction, xAngle?: number, yAngle?: number,
        maxDistance?: number, targetMode?: AimAssistTargetMode,
        presetId?: string): AimAssistCommand {
        return { kind: CommandKind.AimAssist, target: target, action: action,
            xAngle: xAngle, yAngle: yAngle, maxDistance: maxDistance,
            targetMode: targetMode, presetId: presetId };
    }
}
