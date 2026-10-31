/**
 * P1b: evidence-aware routing for Minecraft Education 26.32 Preview.
 *
 * Command meaning always belongs to the original Minecraft Command AST.
 * The dispatcher only decides how to execute a previously validated AST.
 *
 * Default is legacy P1a routing: bridge OFF => MakeCode, bridge ON => Bridge.
 * AUTO is opt-in and depends on a separately installed CBXCORE Behavior Pack.
 * No queue, delay, busy wait, ping, worker, or AST rewriting is introduced.
 *
 * Evidence classifications are not all game-verified routes! 2026-10-07
 * direct/adapter results apply only to the tested command variants. P2 will
 * add genuine readback for OUTPUT_HIDDEN, P3 will handle whole FunctionFiles.
 */
namespace MCFunctionRuntime {
    export enum Route {
        MakeCode = 0,
        Bridge = 1
    }

    export enum EvidenceClass {
        // Historical direct PASS for the tested kind/variant, or legacy path.
        Direct = 0,
        // A MakeCode-compatible adapter is present (not necessarily native).
        MakeCodeAdapter = 1,
        // player.execute() modern grammar was previously demonstrated to FAIL.
        BridgeRequired = 2,
        // Bridge is preferable but its exact variant needs in-game proof.
        BridgeCandidate = 3,
        // A command can execute, but complete live result readback is absent.
        ReadbackPending = 4,
        // No reliable per-variant evidence yet; preserve old Preview route.
        ReviewNeeded = 5
    }

    let automatic = false;

    /** Enables variant routing; CBXCORE SELECTIVE transport is set separately. */
    export function enableAutomatic(): void {
        automatic = true;
    }

    /** Restore unchanged P1a manual transport behavior. */
    export function disableAutomatic(): void {
        automatic = false;
    }

    export function isAutomatic(): boolean {
        return automatic;
    }

    /**
     * Read-only evidence category. Never changes a command or its export.
     * Return conservative classifications instead of asserting blanket PASS.
     */
    export function classify(command: MCFunctionAST.CommandNode): EvidenceClass {
        if (!command) return EvidenceClass.ReviewNeeded;

        if (command.kind == MCFunctionAST.CommandKind.Execute) {
            return EvidenceClass.BridgeRequired;
        }

        if (command.kind == MCFunctionAST.CommandKind.Raw) {
            // Raw remains an opaque source-of-truth line. We never reparse or
            // reconstruct it to guess whether old MakeCode syntax will work.
            return EvidenceClass.BridgeCandidate;
        }

        if (command.kind == MCFunctionAST.CommandKind.Summon) {
            let summon = <MCFunctionAST.SummonCommand>command;
            if (summon.form == MCFunctionAST.SummonForm.Advanced &&
                summon.orientation &&
                (summon.orientation.kind == MCFunctionAST.SummonOrientationKind.Rotation ||
                 summon.orientation.kind == MCFunctionAST.SummonOrientationKind.Facing)) {
                // Tested MakeCode TP workaround; direct Script API equivalent
                // is not yet demonstrated for all variants.
                return EvidenceClass.MakeCodeAdapter;
            }
            return EvidenceClass.Direct;
        }

        if (command.kind == MCFunctionAST.CommandKind.Time) {
            if ((<MCFunctionAST.TimeCommand>command).action == MCFunctionAST.TimeAction.Query) {
                return EvidenceClass.ReadbackPending;
            }
            return EvidenceClass.Direct;
        }

        if (command.kind == MCFunctionAST.CommandKind.Gamerule) {
            let rule = <MCFunctionAST.GameRuleCommand>command;
            if (rule.action == MCFunctionAST.GameRuleAction.Query ||
                rule.action == MCFunctionAST.GameRuleAction.List) {
                return EvidenceClass.ReadbackPending;
            }
            return EvidenceClass.Direct;
        }

        if (command.kind == MCFunctionAST.CommandKind.Scoreboard) {
            let score = <MCFunctionAST.ScoreboardCommand>command;
            if (score.action == MCFunctionAST.ScoreboardAction.ObjectiveList ||
                score.action == MCFunctionAST.ScoreboardAction.PlayerList ||
                score.action == MCFunctionAST.ScoreboardAction.PlayerTest) {
                return EvidenceClass.ReadbackPending;
            }
            return EvidenceClass.Direct;
        }

        if (command.kind == MCFunctionAST.CommandKind.Tag) {
            if ((<MCFunctionAST.TagCommand>command).action == MCFunctionAST.TagActionKind.List) {
                return EvidenceClass.ReadbackPending;
            }
            return EvidenceClass.Direct;
        }

        if (command.kind == MCFunctionAST.CommandKind.SpawnPoint) {
            let spawn = <MCFunctionAST.SpawnPointCommand>command;
            if (spawn.mode != MCFunctionAST.SpawnPointMode.TargetAt ||
                !spawn.position ||
                !isAbsolutePosition(spawn.position)) {
                // Omitted and relative variants failed in MakeCode history.
                // This is a bridge candidate, not a Behavior Pack PASS.
                return EvidenceClass.BridgeCandidate;
            }
            return EvidenceClass.Direct;
        }

        // Directly tested command families in the 2026-10-07 Education 26.32
        // matrix. This means ONLY the recorded variants are proven, not every
        // future argument combination of a command family.
        switch (command.kind) {
            case MCFunctionAST.CommandKind.Say:
            case MCFunctionAST.CommandKind.Tell:
            case MCFunctionAST.CommandKind.McFunction:
            case MCFunctionAST.CommandKind.Give:
            case MCFunctionAST.CommandKind.Teleport:
            case MCFunctionAST.CommandKind.Effect:
            case MCFunctionAST.CommandKind.GameMode:
            case MCFunctionAST.CommandKind.Kill:
            case MCFunctionAST.CommandKind.Clear:
            case MCFunctionAST.CommandKind.SetBlock:
            case MCFunctionAST.CommandKind.Fill:
            case MCFunctionAST.CommandKind.Clone:
            case MCFunctionAST.CommandKind.Particle:
            case MCFunctionAST.CommandKind.PlaySound:
            case MCFunctionAST.CommandKind.StopSound:
            case MCFunctionAST.CommandKind.Music:
            case MCFunctionAST.CommandKind.Enchant:
            case MCFunctionAST.CommandKind.CameraShake:
            case MCFunctionAST.CommandKind.Weather:
            case MCFunctionAST.CommandKind.Difficulty:
            case MCFunctionAST.CommandKind.Hud:
            case MCFunctionAST.CommandKind.InputPermission:
            case MCFunctionAST.CommandKind.Camera:
            case MCFunctionAST.CommandKind.SetWorldSpawn:
            case MCFunctionAST.CommandKind.ClearSpawnPoint:
            case MCFunctionAST.CommandKind.Damage:
            case MCFunctionAST.CommandKind.Event:
            case MCFunctionAST.CommandKind.ControlScheme:
            case MCFunctionAST.CommandKind.AimAssist:
            case MCFunctionAST.CommandKind.PlayAnimation:
            case MCFunctionAST.CommandKind.Fog:
            case MCFunctionAST.CommandKind.Ride:
            case MCFunctionAST.CommandKind.Dialogue:
                return EvidenceClass.Direct;
        }

        // No supporting evidence for a precise variant yet; preserve the P1a
        // MakeCode path, but never report a new PASS solely from this resolver.
        return EvidenceClass.ReviewNeeded;
    }

    function isAbsolutePosition(position: MCFunctionAST.Position): boolean {
        return position.x.mode == MCFunctionAST.CoordinateMode.Absolute &&
            position.y.mode == MCFunctionAST.CoordinateMode.Absolute &&
            position.z.mode == MCFunctionAST.CoordinateMode.Absolute;
    }

    /**
     * Resolve only the runtime transport. Existing adapters handle all
     * ReadbackPending cases until P2 can return genuine world values.
     *
     * BridgeCandidate is intentionally opt-in under AUTO: it does NOT mean
     * that Education Script API has already passed the variant's game test.
     */
    export function resolve(command: MCFunctionAST.CommandNode): Route {
        if (!automatic) {
            return MCFunctionCBX12Bridge.isEnabled() ? Route.Bridge : Route.MakeCode;
        }

        let evidence = classify(command);
        if (evidence == EvidenceClass.BridgeRequired ||
            evidence == EvidenceClass.BridgeCandidate) {
            return Route.Bridge;
        }
        return Route.MakeCode;
    }
}
