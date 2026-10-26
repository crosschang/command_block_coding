/**
 * C3 E1..E6: a SINGLE integrated TS Preview evaluator (experimental).
 * Minecraft Command AST / Compiler unchanged; no Behavior Pack / Function Bridge.
 * The PXT MakeCode surface lacks arbitrary entity pose / dimension APIs.
 * Therefore the integrated pass SUPPORTS safe subsets and REJECTS unprovable
 * combinations; a diagnostic is never an equivalent runtime PASS.
 *
 * E1: positioned/align and block comparisons; E2: @s + restricted native
 * legacy dispatcher for multi-entity simple actions; E3: provable entity
 * existence; E4: explicit rotation + local math; E5: facing position/anchor;
 * E6: dimension-neutral SAY only. Score queries, player pitch from API,
 * complex entity branching, and dimension-dependent world effects remain
 * gated until an exact implementation exists.
 */
namespace MCFunctionExecutePreview {
    export enum Decision { Unknown = 0, False = 1, True = 2 }

    /** E1: transient runtime context, never serialized to .mcfunction. */
    interface PreviewPosition {
        x: number;
        y: number;
        z: number;
    }

    /** Direction is a runtime artifact. The canonical AST stores exact syntax. */
    interface PreviewDirection {
        yaw: number;
        pitch: number;
        yawKnown: boolean;
        pitchKnown: boolean;
        anchor: MCFunctionAST.EntityAnchor;
    }
    function initialDirection(): PreviewDirection {
        return {yaw: player.getOrientation(), pitch: 0, yawKnown: true,
            pitchKnown: false, anchor: MCFunctionAST.EntityAnchor.Feet};
    }
    function isLocal(p: MCFunctionAST.Position): boolean {
        return !!p && !!p.x && !!p.y && !!p.z &&
            p.x.mode == MCFunctionAST.CoordinateMode.Local &&
            p.y.mode == MCFunctionAST.CoordinateMode.Local &&
            p.z.mode == MCFunctionAST.CoordinateMode.Local;
    }
    function canResolvePosition(p: MCFunctionAST.Position, d: PreviewDirection,
        playerCamera: boolean): boolean {
        if (e1SupportedPosition(p)) return true;
        if (!isLocal(p)) return false;
        if (d.anchor != MCFunctionAST.EntityAnchor.Feet) return false;
        if (d.yawKnown && d.pitchKnown) return true;
        return playerCamera;
    }
    /** 3D Bedrock local frame. Yaw 0 faces south; +local X is right. */
    function resolvePositionWithDirection(p: MCFunctionAST.Position,
        base: PreviewPosition, d: PreviewDirection,
        playerCamera: boolean): PreviewPosition {
        if (e1SupportedPosition(p)) return resolvePosition(p, base);
        if (!isLocal(p) || d.anchor != MCFunctionAST.EntityAnchor.Feet) return undefined;
        let rx = p.x.value, ry = p.y.value, rz = p.z.value;
        // PXT posLocal inherits the real player's yaw AND pitch. This is only
        // valid if the virtual orientation still equals the current player.
        if (!d.pitchKnown && playerCamera) {
            let q = posLocal(rx, ry, rz).toWorld();
            let origin = player.position();
            return {x: base.x + q.getValue(Axis.X) - origin.getValue(Axis.X),
                y: base.y + q.getValue(Axis.Y) - origin.getValue(Axis.Y),
                z: base.z + q.getValue(Axis.Z) - origin.getValue(Axis.Z)};
        }
        if (!d.yawKnown || !d.pitchKnown) return undefined;
        let rad = Math.PI / 180;
        let yaw = d.yaw * rad, pitch = d.pitch * rad;
        let sy = Math.sin(yaw), cy = Math.cos(yaw);
        let sp = Math.sin(pitch), cp = Math.cos(pitch);
        return {
            x: base.x + rx * cy + ry * sy * sp - rz * sy * cp,
            y: base.y + ry * cp - rz * sp,
            z: base.z + rx * sy - ry * cy * sp + rz * cy * cp
        };
    }
    function playerPos(): PreviewPosition { return initialPosition(); }
    function setFacing(d: PreviewDirection, from: PreviewPosition,
        to: PreviewPosition): boolean {
        let dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z;
        let h = Math.sqrt(dx * dx + dz * dz);
        if (h == 0 && dy == 0) return false;
        // When horizontal difference is zero, yaw is not uniquely determined.
        if (h > 0) { d.yaw = -Math.atan2(dx, dz) * 180 / Math.PI; d.yawKnown = true; }
        d.pitch = -Math.atan2(dy, h) * 180 / Math.PI;
        d.pitchKnown = true;
        return d.yawKnown;
    }
    function applyRotation(r: MCFunctionAST.Rotation,
        d: PreviewDirection): void {
        if (r.yaw.mode == MCFunctionAST.RotationMode.Absolute) {
            d.yaw = r.yaw.value; d.yawKnown = true;
        } else if (d.yawKnown) d.yaw += r.yaw.value;
        if (r.pitch.mode == MCFunctionAST.RotationMode.Absolute) {
            d.pitch = r.pitch.value; d.pitchKnown = true;
        } else if (d.pitchKnown) d.pitch += r.pitch.value;
    }
    function entityProof(target: MCFunctionAST.PlayerTarget): Decision {
        // Provably true existence only; an arbitrary filtered selector needs
        // accurate query result + parser-failure distinction, absent in PXT.
        if (!target || target.kind != MCFunctionAST.PlayerTargetKind.Selector ||
            !target.selector) return Decision.Unknown;
        let s = target.selector;
        if (!s.filters || s.filters.length || !s.scores || s.scores.length ||
            !s.hasItems || s.hasItems.length) return Decision.Unknown;
        return Decision.True; // @s, @a, @e, @p, @r all include local player
    }
    /** E3 live score predicate using only old read-only /testfor selector syntax.
     * API true proves match; false does NOT prove mismatch (may be syntax/API
     * rejection). A complementary hit proves mismatch without guessing. */
    function scoreSelectorTest(objective: string, range: MCFunctionAST.NumberRange): boolean {
        let selector = MCFunctionAST.createSelector(MCFunctionAST.SelectorBase.Self);
        MCFunctionAST.addSelectorScoreCondition(selector,
            MCFunctionAST.createSelectorScoreCondition(objective, range, false));
        return player.execute("testfor " + MCFunctionCompiler.compileSelector(selector));
    }
    function evaluateScoreMatch(c: MCFunctionAST.ExecuteClause): Decision {
        if (!isUnfilteredSelf(c.target) || !c.objective || !c.scoreRange)
            return Decision.Unknown;
        let range = c.scoreRange;
        if (scoreSelectorTest(c.objective, range)) return Decision.True;
        // A missing score or PXT syntax refusal cannot be mistaken for FALSE.
        // Complement searches are proof of a genuine nonmatching integer score.
        if (range.hasMin && range.min > -2147483648) {
            let lower = MCFunctionAST.createMaxRange(range.min - 1);
            if (scoreSelectorTest(c.objective, lower)) return Decision.False;
        }
        if (range.hasMax && range.max < 2147483647) {
            let upper = MCFunctionAST.createMinRange(range.max + 1);
            if (scoreSelectorTest(c.objective, upper)) return Decision.False;
        }
        return Decision.Unknown;
    }

    function isAdvanced(k: MCFunctionAST.ExecuteClauseKind): boolean {
        return k == MCFunctionAST.ExecuteClauseKind.IfEntity ||
            k == MCFunctionAST.ExecuteClauseKind.UnlessEntity ||
            k == MCFunctionAST.ExecuteClauseKind.IfScoreMatches ||
            k == MCFunctionAST.ExecuteClauseKind.UnlessScoreMatches ||
            k == MCFunctionAST.ExecuteClauseKind.IfScoreCompare ||
            k == MCFunctionAST.ExecuteClauseKind.UnlessScoreCompare ||
            k == MCFunctionAST.ExecuteClauseKind.Rotated ||
            k == MCFunctionAST.ExecuteClauseKind.RotatedAs ||
            k == MCFunctionAST.ExecuteClauseKind.FacingPosition ||
            k == MCFunctionAST.ExecuteClauseKind.FacingEntity ||
            k == MCFunctionAST.ExecuteClauseKind.Anchored ||
            k == MCFunctionAST.ExecuteClauseKind.In;
    }
    function advancedUnsupported(code: string): void {
        MCFunctionPreview.previewSay("INFO [" + code + "] Exact context unavailable. RUN skipped.");
    }

    /** MakeCode exposes the current player's world coordinates. */
    function initialPosition(): PreviewPosition {
        let p = player.position();
        return {
            x: p.getValue(Axis.X),
            y: p.getValue(Axis.Y),
            z: p.getValue(Axis.Z)
        };
    }

    /** E4 will add local-coordinate rotation. Reject them in E1. */
    function e1SupportedPosition(p: MCFunctionAST.Position): boolean {
        return !!p && !!p.x && !!p.y && !!p.z &&
            (p.x.mode == MCFunctionAST.CoordinateMode.Absolute ||
             p.x.mode == MCFunctionAST.CoordinateMode.Relative) &&
            (p.y.mode == MCFunctionAST.CoordinateMode.Absolute ||
             p.y.mode == MCFunctionAST.CoordinateMode.Relative) &&
            (p.z.mode == MCFunctionAST.CoordinateMode.Absolute ||
             p.z.mode == MCFunctionAST.CoordinateMode.Relative);
    }

    function resolveAxis(c: MCFunctionAST.Coordinate, base: number): number {
        return c.mode == MCFunctionAST.CoordinateMode.Absolute ? c.value : base + c.value;
    }

    function resolvePosition(p: MCFunctionAST.Position,
        base: PreviewPosition): PreviewPosition {
        if (!e1SupportedPosition(p)) return undefined;
        return {
            x: resolveAxis(p.x, base.x),
            y: resolveAxis(p.y, base.y),
            z: resolveAxis(p.z, base.z)
        };
    }

    function absoluteWorld(p: PreviewPosition): Position {
        return world(p.x, p.y, p.z);
    }

    function absoluteAST(p: PreviewPosition): MCFunctionAST.Position {
        return MCFunctionAST.createAbsolutePosition(p.x, p.y, p.z);
    }

    function supportedVanillaBlock(id: string): boolean {
        // Unknown/custom IDs can be mapped to AIR by blocks.blockByName().
        let known = "|stone|dirt|grass|grass_block|glass|gold_block|diamond_block|emerald_block|" +
            "cobblestone|obsidian|air|sand|oak_planks|bedrock|iron_block|redstone_block|";
        return id.length > 0 && known.indexOf("|" + id + "|") >= 0;
    }

    function checkBlockId(id: string): string {
        if (!id) return "";
        if (id.indexOf("minecraft:") == 0) return id.substr(10);
        return id;
    }

    /**
     * E2A deliberately supports ONLY unfiltered @s. The MakeCode player is the
     * executor of a direct FunctionFile Preview invocation. Other selectors
     * require per-entity branches (E2B); never silently approximate @a/@e.
     */
    function isUnfilteredSelf(target: MCFunctionAST.PlayerTarget): boolean {
        if (!target || target.kind != MCFunctionAST.PlayerTargetKind.Selector)
            return false;
        let selector = target.selector;
        return !!selector && selector.base == MCFunctionAST.SelectorBase.Self &&
            !!selector.filters && selector.filters.length == 0 &&
            !!selector.scores && selector.scores.length == 0 &&
            !!selector.hasItems && selector.hasItems.length == 0;
    }

    /**
     * E2 Preview compatibility gate. This is not modern EXECUTE compilation.
     * We accept selectors only when the legacy engine can select the very same
     * entities at the initial MakeCode origin. Filtered self requires true
     * per-executor filtering and is not simulated here.
     */
    function e2LegacyTarget(target: MCFunctionAST.PlayerTarget): string {
        if (!target) return "";
        if (target.kind == MCFunctionAST.PlayerTargetKind.Name) {
            return target.name ? MCFunctionCompiler.compilePlayerTarget(target) : "";
        }
        if (target.kind != MCFunctionAST.PlayerTargetKind.Selector || !target.selector)
            return "";
        if (target.selector.base == MCFunctionAST.SelectorBase.Initiator ||
            target.selector.base == MCFunctionAST.SelectorBase.Self) return "";
        return MCFunctionCompiler.compilePlayerTarget(target);
    }

    /**
     * E2 semantic restrictions:
     * - AS branches change executor, but retain original position unless AT @s.
     * - AT / POSITIONED AS branches change position, NOT executor; therefore
     *   only RUN SETBLOCK (no executor-dependent target or sender) is replayed.
     * - Branch-local IF / unless and extra modifiers require an entity-scoped
     *   TS context evaluator not available in this implementation.
     * Any non-equivalent chain is blocked BEFORE executing a world command.
     */
    function executeE2Selector(command: MCFunctionAST.ExecuteCommand): void {
        let clauses = command.clauses;
        let first = clauses[0];
        let kind = first.kind;
        let isAs = kind == MCFunctionAST.ExecuteClauseKind.As;
        let isAt = kind == MCFunctionAST.ExecuteClauseKind.At;
        let isPositionedAs = kind == MCFunctionAST.ExecuteClauseKind.PositionedAs;
        if ((!isAs && !isAt && !isPositionedAs) || clauses.length > 2) {
            e2UnsupportedCombination();
            return;
        }
        let target = e2LegacyTarget(first.target);
        if (target.length == 0) {
            e2UnsupportedCombination();
            return;
        }
        let resetAtSelf = false;
        if (clauses.length == 2) {
            let second = clauses[1];
            if (!isAs || second.kind != MCFunctionAST.ExecuteClauseKind.At ||
                !isUnfilteredSelf(second.target)) {
                e2UnsupportedCombination();
                return;
            }
            resetAtSelf = true;
        }
        let run = command.run;
        if (!run || run.kind == MCFunctionAST.CommandKind.Execute ||
            run.kind == MCFunctionAST.CommandKind.Raw) {
            MCFunctionPreview.previewSay("INFO [EXECUTE_RUN_UNSUPPORTED] RUN not replayed in Preview.");
            return;
        }
        let positionIndependent = run.kind == MCFunctionAST.CommandKind.Say ||
            run.kind == MCFunctionAST.CommandKind.SetBlock;
        let executorSafe = positionIndependent ||
            run.kind == MCFunctionAST.CommandKind.Give ||
            run.kind == MCFunctionAST.CommandKind.Effect ||
            run.kind == MCFunctionAST.CommandKind.Tag;
        if ((isAt || isPositionedAs) &&
            run.kind != MCFunctionAST.CommandKind.SetBlock ||
            isAs && !executorSafe) {
            e2UnsupportedCombination();
            return;
        }
        let compiled = MCFunctionPreviewBlockCommandSerializer.tryCompile(run);
        if (compiled.length == 0) compiled = MCFunctionCompiler.compileCommand(run);
        if (compiled.length == 0) {
            e2UnsupportedCombination();
            return;
        }
        // Legacy execute is ALREADY verified in Minecraft Education MakeCode.
        // AS retains initial context using its absolute origin; AS+AT @s and
        // AT / POSITIONED AS apply target position using legacy ~ ~ ~.
        // This string is a Preview-only dispatcher and NEVER the canonical
        // .mcfunction compiler output (which remains modern EXECUTE).
        let prefix = "execute " + target + " ";
        if (isAs && !resetAtSelf) {
            let origin = initialPosition();
            prefix += origin.x + " " + origin.y + " " + origin.z + " ";
        } else {
            prefix += "~ ~ ~ ";
        }
        let success = player.execute(prefix + compiled);
        if (!success) {
            MCFunctionPreview.previewSay("INFO [EXECUTE_E2_LEGACY_REJECTED] " +
                "Legacy Preview dispatch was rejected; RUN not confirmed.");
        }
    }

    function e2UnsupportedCombination(): void {
        MCFunctionPreview.previewSay("INFO [EXECUTE_E2_UNSUPPORTED_COMBINATION] " +
            "Executor/position semantics are not safely replayable. No RUN executed.");
    }

    /** Evaluate supported block conditions relative to the *current* virtual position. */
    function evaluateClause(c: MCFunctionAST.ExecuteClause,
        context: PreviewPosition): Decision {
        let k = c.kind;
        if (k == MCFunctionAST.ExecuteClauseKind.IfBlock ||
            k == MCFunctionAST.ExecuteClauseKind.UnlessBlock) {
            let p = resolvePosition(c.position, context);
            if (!p) return Decision.Unknown;
            // Typed block states remain canonical but cannot be safely queried via blockByName.
            if (c.blockStates && c.blockStates.entries && c.blockStates.entries.length > 0)
                return Decision.Unknown;
            let id = checkBlockId(c.blockId);
            if (!supportedVanillaBlock(id)) return Decision.Unknown;
            let match = blocks.testForBlock(blocks.blockByName(id), absoluteWorld(p));
            if (k == MCFunctionAST.ExecuteClauseKind.UnlessBlock) match = !match;
            return match ? Decision.True : Decision.False;
        }
        if (k == MCFunctionAST.ExecuteClauseKind.IfBlocks ||
            k == MCFunctionAST.ExecuteClauseKind.UnlessBlocks) {
            let begin = resolvePosition(c.begin, context);
            let end = resolvePosition(c.end, context);
            let destination = resolvePosition(c.destination, context);
            if (!begin || !end || !destination) return Decision.Unknown;
            let match = blocks.testForBlocks(absoluteWorld(begin), absoluteWorld(end),
                absoluteWorld(destination), c.scan == MCFunctionAST.ExecuteScan.Masked ?
                TestForBlocksMask.Masked : TestForBlocksMask.All);
            if (k == MCFunctionAST.ExecuteClauseKind.UnlessBlocks) match = !match;
            return match ? Decision.True : Decision.False;
        }
        return Decision.Unknown;
    }

    /** RUN supports only semantics we can preserve under changed E1 context. */
    function canRunWithPosition(kind: MCFunctionAST.CommandKind): boolean {
        return kind == MCFunctionAST.CommandKind.Say ||
            kind == MCFunctionAST.CommandKind.SetBlock;
    }

    /** Clone a typed RUN where required; never mutate the canonical original. */
    function resolveRun(command: MCFunctionAST.CommandNode,
        context: PreviewPosition): MCFunctionAST.CommandNode {
        if (command.kind != MCFunctionAST.CommandKind.SetBlock) return command;
        let set = <MCFunctionAST.SetBlockCommand>command;
        let p = resolvePosition(set.position, context);
        if (!p) return undefined;
        return MCFunctionAST.createSetBlockCommand(
            // SETBLOCK addresses a block cell: floor coordinates, including negatives.
            absoluteAST({ x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) }),
            set.blockId, set.blockStates, set.mode);
    }

    function unsupportedClause(index: number): void {
        MCFunctionPreview.previewSay("INFO [EXECUTE_PREVIEW_UNSUPPORTED] clause " +
            (index + 1) + " changes/needs unsupported context. No RUN executed.");
    }

    /** Recursively flatten nested modern RUN EXECUTE without changing original AST. */
    function flatten(command: MCFunctionAST.ExecuteCommand): MCFunctionAST.ExecuteCommand {
        let all: MCFunctionAST.ExecuteClause[] = [];
        let cur = command;
        let depth = 0;
        while (cur && cur.run && cur.run.kind == MCFunctionAST.CommandKind.Execute) {
            if (++depth > 16) return undefined;
            for (let i = 0; i < cur.clauses.length; i++) all.push(cur.clauses[i]);
            cur = <MCFunctionAST.ExecuteCommand>cur.run;
        }
        if (!cur || !cur.run) return undefined;
        for (let i = 0; i < cur.clauses.length; i++) all.push(cur.clauses[i]);
        return MCFunctionAST.createExecuteCommand(all, cur.run);
    }
    /** Called after definition validation; dispatches no modern EXECUTE via PXT. */
    export function execute(original: MCFunctionAST.ExecuteCommand): void {
        let command = flatten(original);
        if (!command) {
            advancedUnsupported("EXECUTE_NESTED_LIMIT");
            return;
        }
        let clauses = command.clauses;
        if (!clauses || !command.run) return;
        let hasMultiTarget = false;
        let hasAdvanced = false;
        for (let i = 0; i < clauses.length; i++) {
            let k = clauses[i].kind;
            if ((k == MCFunctionAST.ExecuteClauseKind.As ||
                 k == MCFunctionAST.ExecuteClauseKind.At ||
                 k == MCFunctionAST.ExecuteClauseKind.PositionedAs) &&
                !isUnfilteredSelf(clauses[i].target)) hasMultiTarget = true;
            if (isAdvanced(k)) hasAdvanced = true;
        }
        if (hasMultiTarget) {
            // E2 multi-entity dispatcher supports a precisely limited shape;
            // never guess cross-product execution or complex context conditions.
            executeE2Selector(command);
            return;
        }
        if (command.run.kind == MCFunctionAST.CommandKind.Raw) {
            advancedUnsupported("EXECUTE_RAW_RUN_UNSUPPORTED");
            return;
        }
        let changedPosition = false;
        let changedRotation = false;
        let changedDimension = false;
        let direction = initialDirection();
        let playerCamera = true;
        let preflightValid = true;
        for (let i = 0; i < clauses.length; i++) {
            let c = clauses[i], k = c.kind;
            if (k == MCFunctionAST.ExecuteClauseKind.Positioned) {
                if (!canResolvePosition(c.position, direction, playerCamera)) {
                    // Explicit rotation earlier might give local pose later;
                    // otherwise unresolved local coordinates MUST NOT be accepted.
                    preflightValid = false;
                }
                changedPosition = true;
            } else if (k == MCFunctionAST.ExecuteClauseKind.Align) {
                changedPosition = true;
            } else if (k == MCFunctionAST.ExecuteClauseKind.As ||
                k == MCFunctionAST.ExecuteClauseKind.At ||
                k == MCFunctionAST.ExecuteClauseKind.PositionedAs ||
                k == MCFunctionAST.ExecuteClauseKind.RotatedAs) {
                if (!isUnfilteredSelf(c.target)) preflightValid = false;
                if (k == MCFunctionAST.ExecuteClauseKind.At ||
                    k == MCFunctionAST.ExecuteClauseKind.PositionedAs) changedPosition = true;
                if (k == MCFunctionAST.ExecuteClauseKind.At ||
                    k == MCFunctionAST.ExecuteClauseKind.RotatedAs) changedRotation = true;
            } else if (k == MCFunctionAST.ExecuteClauseKind.Rotated) {
                if (!c.rotation) preflightValid = false;
                else applyRotation(c.rotation, direction);
                changedRotation = true;
                playerCamera = false;
            } else if (k == MCFunctionAST.ExecuteClauseKind.FacingPosition) {
                if (!c.facing || !c.facing.position) preflightValid = false;
                changedRotation = true;
                playerCamera = false;
            } else if (k == MCFunctionAST.ExecuteClauseKind.FacingEntity) {
                if (!c.facing || !c.facing.entitySelector ||
                    c.facing.entitySelector.base != MCFunctionAST.SelectorBase.Self ||
                    !c.facing.entitySelector.filters || c.facing.entitySelector.filters.length > 0 ||
                    !c.facing.entitySelector.scores || c.facing.entitySelector.scores.length > 0 ||
                    !c.facing.entitySelector.hasItems || c.facing.entitySelector.hasItems.length > 0 ||
                    c.facing.anchor != MCFunctionAST.EntityAnchor.Feet) preflightValid = false;
                changedRotation = true;
                playerCamera = false;
            } else if (k == MCFunctionAST.ExecuteClauseKind.Anchored) {
                if (c.anchor != MCFunctionAST.EntityAnchor.Feet &&
                    c.anchor != MCFunctionAST.EntityAnchor.Eyes) preflightValid = false;
                if (c.anchor == MCFunctionAST.EntityAnchor.Eyes) playerCamera = false;
            } else if (k == MCFunctionAST.ExecuteClauseKind.In) {
                changedDimension = true;
            } else if (k == MCFunctionAST.ExecuteClauseKind.IfEntity ||
                k == MCFunctionAST.ExecuteClauseKind.UnlessEntity) {
                if (entityProof(c.target) == Decision.Unknown) preflightValid = false;
            } else if (k == MCFunctionAST.ExecuteClauseKind.IfScoreMatches ||
                k == MCFunctionAST.ExecuteClauseKind.UnlessScoreMatches) {
                if (!isUnfilteredSelf(c.target) || !c.objective || !c.scoreRange)
                    preflightValid = false;
            } else if (k == MCFunctionAST.ExecuteClauseKind.IfScoreCompare ||
                k == MCFunctionAST.ExecuteClauseKind.UnlessScoreCompare) {
                // Cross-objective comparison is not exposed by current PXT reads.
                preflightValid = false;
            } else if (k != MCFunctionAST.ExecuteClauseKind.IfBlock &&
                k != MCFunctionAST.ExecuteClauseKind.UnlessBlock &&
                k != MCFunctionAST.ExecuteClauseKind.IfBlocks &&
                k != MCFunctionAST.ExecuteClauseKind.UnlessBlocks) {
                preflightValid = false;
            }
            if (!preflightValid) {
                unsupportedClause(i); return;
            }
        }
        if (changedDimension) {
            // E6: only SAY is semantically independent of dimension. World
            // mutation, conditions and all coordinate-sensitive commands
            // cannot be replayed correctly by PXT across dimensions.
            if (command.run.kind != MCFunctionAST.CommandKind.Say) {
                advancedUnsupported("EXECUTE_DIMENSION_UNSUPPORTED"); return;
            }
            for (let i = 0; i < clauses.length; i++) {
                let k = clauses[i].kind;
                if (k == MCFunctionAST.ExecuteClauseKind.IfBlock ||
                    k == MCFunctionAST.ExecuteClauseKind.UnlessBlock ||
                    k == MCFunctionAST.ExecuteClauseKind.IfBlocks ||
                    k == MCFunctionAST.ExecuteClauseKind.UnlessBlocks ||
                    k == MCFunctionAST.ExecuteClauseKind.IfEntity ||
                    k == MCFunctionAST.ExecuteClauseKind.UnlessEntity ||
                    k == MCFunctionAST.ExecuteClauseKind.IfScoreMatches ||
                    k == MCFunctionAST.ExecuteClauseKind.UnlessScoreMatches) {
                    advancedUnsupported("EXECUTE_DIMENSION_UNSUPPORTED"); return;
                }
            }
        }
        // The MakeCode surface cannot read eye anchor position with exact
        // crouching/swimming pose; do not calculate facing from a guessed 1.62m.
        let eyes = false;
        for (let i = 0; i < clauses.length; i++) {
            let k = clauses[i].kind;
            if (k == MCFunctionAST.ExecuteClauseKind.Anchored)
                eyes = clauses[i].anchor == MCFunctionAST.EntityAnchor.Eyes;
            if (eyes && (k == MCFunctionAST.ExecuteClauseKind.FacingPosition ||
                k == MCFunctionAST.ExecuteClauseKind.FacingEntity)) {
                advancedUnsupported("EXECUTE_EYES_POSE_UNAVAILABLE"); return;
            }
        }
        if ((changedPosition || changedRotation || changedDimension || hasAdvanced) &&
            !canRunWithPosition(command.run.kind)) {
            advancedUnsupported("EXECUTE_CONTEXT_RUN_UNSUPPORTED"); return;
        }
        let context = initialPosition();
        let orientation = initialDirection();
        let usingCamera = true;
        for (let i = 0; i < clauses.length; i++) {
            let c = clauses[i], k = c.kind;
            if (k == MCFunctionAST.ExecuteClauseKind.Positioned) {
                let next = resolvePositionWithDirection(c.position, context,
                    orientation, usingCamera);
                if (!next) {advancedUnsupported("EXECUTE_LOCAL_UNKNOWN"); return;}
                context = next;
            } else if (k == MCFunctionAST.ExecuteClauseKind.Align) {
                if (c.axes.indexOf("x") >= 0) context.x = Math.floor(context.x);
                if (c.axes.indexOf("y") >= 0) context.y = Math.floor(context.y);
                if (c.axes.indexOf("z") >= 0) context.z = Math.floor(context.z);
            } else if (k == MCFunctionAST.ExecuteClauseKind.As) {
                // as @s keeps original executor, position, and direction.
            } else if (k == MCFunctionAST.ExecuteClauseKind.At) {
                context = playerPos(); orientation = initialDirection();
                usingCamera = true;
            } else if (k == MCFunctionAST.ExecuteClauseKind.PositionedAs) {
                context = playerPos();
            } else if (k == MCFunctionAST.ExecuteClauseKind.RotatedAs) {
                orientation = initialDirection(); usingCamera = true;
            } else if (k == MCFunctionAST.ExecuteClauseKind.Rotated) {
                applyRotation(c.rotation, orientation); usingCamera = false;
            } else if (k == MCFunctionAST.ExecuteClauseKind.Anchored) {
                orientation.anchor = c.anchor;
                if (c.anchor == MCFunctionAST.EntityAnchor.Eyes) usingCamera = false;
            } else if (k == MCFunctionAST.ExecuteClauseKind.FacingPosition) {
                let target = resolvePositionWithDirection(c.facing.position,
                    context, orientation, usingCamera);
                if (!target || !setFacing(orientation, context, target)) {
                    advancedUnsupported("EXECUTE_FACING_UNKNOWN");return;
                }
                usingCamera = false;
            } else if (k == MCFunctionAST.ExecuteClauseKind.FacingEntity) {
                if (!setFacing(orientation, context, playerPos())) {
                    advancedUnsupported("EXECUTE_FACING_UNKNOWN");return;
                }
                usingCamera = false;
            } else if (k == MCFunctionAST.ExecuteClauseKind.In) {
                // Dimension-neutral SAY: no world coordinates are evaluated.
            } else if (k == MCFunctionAST.ExecuteClauseKind.IfEntity ||
                k == MCFunctionAST.ExecuteClauseKind.UnlessEntity) {
                // Preflight proved the selector contains a local active player.
                if (k == MCFunctionAST.ExecuteClauseKind.UnlessEntity) return;
            } else {
                let decision = evaluateClauseWithDirection(c, context,
                    orientation, usingCamera);
                if (decision == Decision.Unknown) {
                    advancedUnsupported("EXECUTE_PREVIEW_UNKNOWN"); return;
                }
                if (decision == Decision.False) return;
            }
        }
        let run: MCFunctionAST.CommandNode = command.run;
        if (changedPosition || changedRotation || changedDimension || hasAdvanced) {
            if (run.kind == MCFunctionAST.CommandKind.SetBlock) {
                let set = <MCFunctionAST.SetBlockCommand>run;
                let p = resolvePositionWithDirection(set.position, context,
                    orientation, usingCamera);
                if (!p) {advancedUnsupported("EXECUTE_RUN_POSITION_UNKNOWN"); return;}
                run = MCFunctionAST.createSetBlockCommand(
                    absoluteAST({x:Math.floor(p.x), y:Math.floor(p.y), z:Math.floor(p.z)}),
                    set.blockId, set.blockStates, set.mode);
            }
        }
        let query = MCFunctionPreview.tryHandleQuery(run);
        if (query.handled) return;
        let compiled = MCFunctionPreviewBlockCommandSerializer.tryCompile(run);
        if (compiled.length == 0) compiled = MCFunctionCompiler.compileCommand(run);
        if (compiled.length > 0) {
            let success = player.execute(compiled);
            MCFunctionPreview.observeCommand(run, success);
        }
    }

    function evaluateClauseWithDirection(c: MCFunctionAST.ExecuteClause,
        context: PreviewPosition, d: PreviewDirection, camera: boolean): Decision {
        let k = c.kind;
        if (k == MCFunctionAST.ExecuteClauseKind.IfScoreMatches ||
            k == MCFunctionAST.ExecuteClauseKind.UnlessScoreMatches) {
            let decision = evaluateScoreMatch(c);
            if (decision == Decision.Unknown) return Decision.Unknown;
            if (k == MCFunctionAST.ExecuteClauseKind.UnlessScoreMatches)
                return decision == Decision.True ? Decision.False : Decision.True;
            return decision;
        }
        if (k == MCFunctionAST.ExecuteClauseKind.IfBlock ||
            k == MCFunctionAST.ExecuteClauseKind.UnlessBlock) {
            let p = resolvePositionWithDirection(c.position, context, d, camera);
            if (!p || (c.blockStates && c.blockStates.entries && c.blockStates.entries.length))
                return Decision.Unknown;
            let id = checkBlockId(c.blockId);
            if (!supportedVanillaBlock(id)) return Decision.Unknown;
            let match = blocks.testForBlock(blocks.blockByName(id), absoluteWorld(p));
            if (k == MCFunctionAST.ExecuteClauseKind.UnlessBlock) match = !match;
            return match ? Decision.True : Decision.False;
        }
        if (k == MCFunctionAST.ExecuteClauseKind.IfBlocks ||
            k == MCFunctionAST.ExecuteClauseKind.UnlessBlocks) {
            let b = resolvePositionWithDirection(c.begin, context, d, camera);
            let e = resolvePositionWithDirection(c.end, context, d, camera);
            let to = resolvePositionWithDirection(c.destination, context, d, camera);
            if (!b || !e || !to) return Decision.Unknown;
            let match = blocks.testForBlocks(absoluteWorld(b), absoluteWorld(e),
                absoluteWorld(to), c.scan == MCFunctionAST.ExecuteScan.Masked ?
                TestForBlocksMask.Masked : TestForBlocksMask.All);
            if (k == MCFunctionAST.ExecuteClauseKind.UnlessBlocks) match = !match;
            return match ? Decision.True : Decision.False;
        }
        return Decision.Unknown;
    }
}
