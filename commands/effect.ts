/**
 * effect command AST.
 *
 * Canonical Bedrock / Education forms:
 * - add: effect <target> <effect> [seconds] [amplifier] [hideParticles]
 * - infinite add: effect <target> <effect> infinite [amplifier] [hideParticles]
 * - clear all: effect <target> clear
 * - clear one: effect <target> clear [effect]
 *
 * UI note:
 * The MakeCode surface exposes one EFFECT command block. Apply/Clear and
 * Seconds/Infinite are reporter values; optional tail arguments expand with
 * MakeCode's + / - control. AST meaning stays independent from that UI.
 */
namespace MCFunctionAST {
    export enum EffectMode {
        Add = 0,
        ClearAll = 1,
        ClearSpecific = 2
    }

    export enum EffectDurationMode {
        Seconds = 0,
        Infinite = 1
    }

    export interface EffectCommand extends CommandNode {
        kind: CommandKind;
        mode: EffectMode;
        target: Selector;
        effectId?: string;
        durationMode?: EffectDurationMode;
        seconds?: number;
        amplifier?: number;
        hideParticles?: boolean;
    }

    /**
     * Generic EFFECT AST constructor used by the unified MakeCode block.
     * Optional values are preserved so Validator can reject invalid
     * combinations instead of the Block Adapter silently discarding them.
     */
    export function createEffectCommand(
        target: Selector,
        mode: EffectMode,
        effectId?: string,
        durationMode?: EffectDurationMode,
        seconds?: number,
        amplifier?: number,
        hideParticles?: boolean
    ): EffectCommand {
        return {
            kind: CommandKind.Effect,
            mode: mode,
            target: target,
            effectId: effectId,
            durationMode: durationMode,
            seconds: seconds,
            amplifier: amplifier,
            hideParticles: hideParticles
        };
    }

    /** Backward-compatible AST helper for a timed status effect. */
    export function createEffectAddCommand(
        target: Selector,
        effectId: string,
        seconds: number,
        amplifier: number,
        hideParticles: boolean
    ): EffectCommand {
        return createEffectCommand(
            target,
            EffectMode.Add,
            effectId,
            EffectDurationMode.Seconds,
            seconds,
            amplifier,
            hideParticles
        );
    }

    /** Backward-compatible AST helper for an infinite status effect. */
    export function createEffectInfiniteCommand(
        target: Selector,
        effectId: string,
        amplifier: number,
        hideParticles: boolean
    ): EffectCommand {
        return createEffectCommand(
            target,
            EffectMode.Add,
            effectId,
            EffectDurationMode.Infinite,
            undefined,
            amplifier,
            hideParticles
        );
    }

    export function createEffectClearAllCommand(
        target: Selector
    ): EffectCommand {
        return createEffectCommand(target, EffectMode.ClearAll);
    }

    export function createEffectClearSpecificCommand(
        target: Selector,
        effectId: string
    ): EffectCommand {
        return createEffectCommand(
            target,
            EffectMode.ClearSpecific,
            effectId
        );
    }
}
