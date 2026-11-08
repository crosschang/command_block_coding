/**
 * Preview-only world/session state.
 *
 * This is NOT Minecraft's Source of Truth and is never exported to .mcfunction.
 * It only remembers information authored through this extension so OUTPUT_HIDDEN
 * commands can give useful feedback in the MakeCode runtime.
 */
namespace MCFunctionPreview {
    let knownTagNames: string[] = [];

    // Preview session only: player.execute() reported success for the last set.
    // This does NOT guarantee that the command changed the world or that the
    // value remains current (chat, packs, or others may change it).
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

    /** Last API-reported successful set THROUGH THIS preview; never a world read. */
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

    /**
     * Numeric hint limited to the last API-reported successful, single-target
     * SCOREBOARD PLAYERS SET. It is not an authoritative world read.
     * Any score mutation whose new value is not known invalidates the hints.
     */
    export interface ScoreboardLastSetHint {
        hasValue: boolean;
        value: number;
    }
    let scoreboardLastSetNames: string[] = [];
    let scoreboardLastSetObjectives: string[] = [];
    let scoreboardLastSetNumbers: number[] = [];

    export function rememberScoreboardLastSet(name: string, objective: string, value: number): void {
        if (!name || !objective) return;
        for (let i = 0; i < scoreboardLastSetNames.length; i++) {
            if (scoreboardLastSetNames[i] == name && scoreboardLastSetObjectives[i] == objective) {
                scoreboardLastSetNumbers[i] = value;
                return;
            }
        }
        scoreboardLastSetNames.push(name);
        scoreboardLastSetObjectives.push(objective);
        scoreboardLastSetNumbers.push(value);
    }

    export function getScoreboardLastSet(name: string, objective: string): ScoreboardLastSetHint {
        for (let i = 0; i < scoreboardLastSetNames.length; i++) {
            if (scoreboardLastSetNames[i] == name && scoreboardLastSetObjectives[i] == objective) {
                return {hasValue: true, value: scoreboardLastSetNumbers[i]};
            }
        }
        return {hasValue: false, value: 0};
    }

    export function clearScoreboardLastSetValues(): void {
        scoreboardLastSetNames = [];
        scoreboardLastSetObjectives = [];
        scoreboardLastSetNumbers = [];
    }

    export function forgetScoreboardLastSet(name: string, objective: string): void {
        let names: string[] = [];
        let objectives: string[] = [];
        let numbers: number[] = [];
        for (let i = 0; i < scoreboardLastSetNames.length; i++) {
            if (scoreboardLastSetNames[i] == name && scoreboardLastSetObjectives[i] == objective) continue;
            names.push(scoreboardLastSetNames[i]);
            objectives.push(scoreboardLastSetObjectives[i]);
            numbers.push(scoreboardLastSetNumbers[i]);
        }
        scoreboardLastSetNames = names;
        scoreboardLastSetObjectives = objectives;
        scoreboardLastSetNumbers = numbers;
    }

    export function forgetScoreboardLastSetForObjective(objective: string): void {
        let names: string[] = [];
        let objectives: string[] = [];
        let numbers: number[] = [];
        for (let i = 0; i < scoreboardLastSetNames.length; i++) {
            if (scoreboardLastSetObjectives[i] == objective) continue;
            names.push(scoreboardLastSetNames[i]);
            objectives.push(scoreboardLastSetObjectives[i]);
            numbers.push(scoreboardLastSetNumbers[i]);
        }
        scoreboardLastSetNames = names;
        scoreboardLastSetObjectives = objectives;
        scoreboardLastSetNumbers = numbers;
    }

    // C2 SCOREBOARD Preview vocabulary, not the complete or authoritative world.
    // Only API-reported successful extension operations enter this session index.
    // Never cache calculated numeric scores: /random, /operation, /execute,
    // other packs and game chat can change the live value at any time.
    let scoreboardKnownObjectiveIds: string[] = [];
    let scoreboardKnownObjectiveLabels: string[] = [];
    let scoreboardKnownHolderNames: string[] = [];
    let scoreboardKnownHolderObjectives: string[] = [];

    export function rememberScoreboardObjective(id: string, displayName: string): void {
        if (!id) return;
        for (let i = 0; i < scoreboardKnownObjectiveIds.length; i++) {
            if (scoreboardKnownObjectiveIds[i] == id) {
                scoreboardKnownObjectiveLabels[i] = displayName;
                return;
            }
        }
        scoreboardKnownObjectiveIds.push(id);
        scoreboardKnownObjectiveLabels.push(displayName);
    }

    export function forgetScoreboardObjective(id: string): void {
        let ids: string[] = [];
        let labels: string[] = [];
        for (let i = 0; i < scoreboardKnownObjectiveIds.length; i++) {
            if (scoreboardKnownObjectiveIds[i] != id) {
                ids.push(scoreboardKnownObjectiveIds[i]);
                labels.push(scoreboardKnownObjectiveLabels[i]);
            }
        }
        scoreboardKnownObjectiveIds = ids;
        scoreboardKnownObjectiveLabels = labels;
        let holders: string[] = [];
        let objectives: string[] = [];
        for (let i = 0; i < scoreboardKnownHolderNames.length; i++) {
            if (scoreboardKnownHolderObjectives[i] != id) {
                holders.push(scoreboardKnownHolderNames[i]);
                objectives.push(scoreboardKnownHolderObjectives[i]);
            }
        }
        scoreboardKnownHolderNames = holders;
        scoreboardKnownHolderObjectives = objectives;
    }

    export function getScoreboardKnownObjectiveIds(): string[] {
        let result: string[] = [];
        for (let i = 0; i < scoreboardKnownObjectiveIds.length; i++) result.push(scoreboardKnownObjectiveIds[i]);
        return result;
    }

    export function getScoreboardKnownObjectiveLabels(): string[] {
        let result: string[] = [];
        for (let i = 0; i < scoreboardKnownObjectiveLabels.length; i++) result.push(scoreboardKnownObjectiveLabels[i]);
        return result;
    }

    export function rememberScoreboardHolder(name: string, objective: string): void {
        if (!name || !objective) return;
        for (let i = 0; i < scoreboardKnownHolderNames.length; i++) {
            if (scoreboardKnownHolderNames[i] == name && scoreboardKnownHolderObjectives[i] == objective) return;
        }
        scoreboardKnownHolderNames.push(name);
        scoreboardKnownHolderObjectives.push(objective);
    }

    export function forgetScoreboardHolder(name: string, objective: string): void {
        let holders: string[] = [];
        let objectives: string[] = [];
        for (let i = 0; i < scoreboardKnownHolderNames.length; i++) {
            if (scoreboardKnownHolderNames[i] == name &&
                (!objective || objective == scoreboardKnownHolderObjectives[i])) continue;
            holders.push(scoreboardKnownHolderNames[i]);
            objectives.push(scoreboardKnownHolderObjectives[i]);
        }
        scoreboardKnownHolderNames = holders;
        scoreboardKnownHolderObjectives = objectives;
    }

    export function getScoreboardKnownHolderNames(): string[] {
        let result: string[] = [];
        for (let i = 0; i < scoreboardKnownHolderNames.length; i++) result.push(scoreboardKnownHolderNames[i]);
        return result;
    }

    export function getScoreboardKnownHolderObjectives(): string[] {
        let result: string[] = [];
        for (let i = 0; i < scoreboardKnownHolderObjectives.length; i++) result.push(scoreboardKnownHolderObjectives[i]);
        return result;
    }

}
