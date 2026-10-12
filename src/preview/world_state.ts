/**
 * Preview-only world/session state.
 *
 * This is NOT Minecraft's Source of Truth and is never exported to .mcfunction.
 * It only remembers information authored through this extension so OUTPUT_HIDDEN
 * commands can give useful feedback in the MakeCode runtime.
 */
namespace MCFunctionPreview {
    let knownTagNames: string[] = [];

    // Preview session only: a successful set through this extension does NOT
    // guarantee the world still has the value (chat, packs, or others may change it).
    let gameRuleLastSetIds: string[] = [];
    let gameRuleLastSetValues: string[] = [];

    export function rememberSuccessfulGameRuleSet(ruleId: string, value: string): void {
        if (!ruleId || !value) return;
        for (let i = 0; i < gameRuleLastSetIds.length; i++) {
            if (gameRuleLastSetIds[i] == ruleId) {
                gameRuleLastSetValues[i] = value;
                return;
            }
        }
        gameRuleLastSetIds.push(ruleId);
        gameRuleLastSetValues.push(value);
    }

    /** Last value set successfully THROUGH THIS preview; never an actual world read. */
    export function getLastSetGameRuleValue(ruleId: string): string {
        for (let i = 0; i < gameRuleLastSetIds.length; i++) {
            if (gameRuleLastSetIds[i] == ruleId) return gameRuleLastSetValues[i];
        }
        return "";
    }

    export function getPreviewSetGameRuleIds(): string[] {
        let result: string[] = [];
        for (let i = 0; i < gameRuleLastSetIds.length; i++) {
            result.push(gameRuleLastSetIds[i]);
        }
        return result;
    }

    /** Remember a tag token referenced by a structured TAG add/remove block. */
    export function rememberTagName(name: string): void {
        if (!name || name.length == 0) return;
        if (isInternalPreviewTag(name)) return;

        for (let i = 0; i < knownTagNames.length; i++) {
            if (knownTagNames[i] == name) return;
        }

        knownTagNames.push(name);
    }

    /** Return a copy so callers cannot mutate Preview state accidentally. */
    export function getKnownTagNames(): string[] {
        let result: string[] = [];
        for (let i = 0; i < knownTagNames.length; i++) {
            result.push(knownTagNames[i]);
        }
        return result;
    }

}
