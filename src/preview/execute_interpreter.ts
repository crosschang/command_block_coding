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
 * E6: dimension-neutral SAY plus global score predicates (no world access).
 * E3 limited read-only bounded score compare (fail-closed on ambiguous response);
 * E5 pose-irrelevant facing position can run. E5 selector-gated diagnostics
 * replace the unreliable PXT /testfor boolean pose detector, using the
 * existing Preview internal-tag lifecycle.
 * Candidate values are NOT Native-parity calibrated: local eye-anchored
 * world changes continue to be blocked, with a diagnostic coordinate instead.
 * Unknown poses/entities, ambiguous score probes and cross-dimension effects
 * remain gated until exact execution is possible.
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

    /**
     * E5: candidate eye heights for diagnostic ONLY. These are not certified
     * Minecraft Education runtime eye heights and MUST NOT be used for RUN.
     * A low hitbox includes crawling/swimming/gliding and is not a unique pose.
     */
    interface EyePoseSample {
        label: string;
        eyeHeightCandidate: number;
    }

    /**
     * PXT's player.execute() boolean did not agree with native hitbox tests.
     * Never ask TypeScript to interpret that boolean as a pose result.
     * Instead the GAME's selector filters decide which tellraw receives the
     * independently calculated (and NOT YET CALIBRATED) eye coordinate.
     *
     * Two temporary tags capture HIGH and MID hits; one captures LOW.  Three
     * disjoint combinations are selected by /tellraw; all other combinations
     * are UNKNOWN. Every tag is scoped and cleaned up after this diagnostic.
     * This is Preview-only, not Minecraft Command AST or .mcfunction output.
     */
    function showPoseCandidates(standing: string, sneak: string, low: string): void {
        let token = MCFunctionPreview.createInternalTagScopeToken();
        let highTag = MCFunctionPreview.createInternalTagName("ph", token);
        let midTag = MCFunctionPreview.createInternalTagName("pm", token);
        let lowTag = MCFunctionPreview.createInternalTagName("pl", token);

        // Do not inspect player.execute() return values. The native selectors
        // control actual tag changes, just as in verified command-block tests.
        // A failed command or absent match can only lead to UNKNOWN, not a
        // fabricated STANDING/SNEAK/LOW match (unless the runtime itself lies
        // about selector-based tag changes; test this in Education).
        player.execute("execute @s ~ ~ ~ tag @s[y=~1.5,dy=0] add " + highTag);
        player.execute("execute @s ~ ~ ~ tag @s[y=~0.7,dy=0] add " + midTag);
        player.execute("execute @s ~ ~ ~ tag @s[y=~0.3,dy=0] add " + lowTag);

        sendPoseLine("@s[tag=" + highTag + ",tag=" + midTag + ",tag=" + lowTag + "]", standing);
        sendPoseLine("@s[tag=!" + highTag + ",tag=" + midTag + ",tag=" + lowTag + "]", sneak);
        sendPoseLine("@s[tag=!" + highTag + ",tag=!" + midTag + ",tag=" + lowTag + "]", low);

        // Unknown (no valid LOW match OR inconsistent upper tiers).
        let unknown = "INFO [EXECUTE_POSE_UNKNOWN] Hitbox selector result " +
            "not classified. CALIBRATION ONLY; no RUN executed.";
        sendPoseLine("@s[tag=!" + lowTag + "]", unknown);
        sendPoseLine("@s[tag=" + highTag + ",tag=!" + midTag + "]", unknown);

        MCFunctionPreview.cleanupInternalTag(highTag);
        MCFunctionPreview.cleanupInternalTag(midTag);
        MCFunctionPreview.cleanupInternalTag(lowTag);
    }

    function sendPoseLine(target: string, message: string): void {
        let escaped = MCFunctionPreview.previewEscapeJsonText("[Preview] " + message);
        player.execute("tellraw " + target +
            " {\"rawtext\":[{\"text\":\"" + escaped + "\"}]}");
    }

    /**
     * Project the same canonical RUN using one candidate height; do not mutate
     * AST and do not execute RUN. The game gates the displayed candidate only
     * *after* all three independent projections are available.
     */
    function eyeCandidateText(cmd: MCFunctionAST.ExecuteCommand,
        sample: EyePoseSample): string {
        let run = cmd.run;
        let context = initialPosition();
        let d = initialDirection();
        let playerCamera = true;
        let clauses = cmd.clauses;
        for (let i = 0; i < clauses.length; i++) {
            let c = clauses[i], k = c.kind;
            if (k == MCFunctionAST.ExecuteClauseKind.As ||
                k == MCFunctionAST.ExecuteClauseKind.At ||
                k == MCFunctionAST.ExecuteClauseKind.PositionedAs ||
                k == MCFunctionAST.ExecuteClauseKind.RotatedAs) {
                if (!isUnfilteredSelf(c.target)) {
                    advancedUnsupported("EXECUTE_EYE_COMPLEX_CONTEXT"); return undefined;
                }
                if (k == MCFunctionAST.ExecuteClauseKind.At ||
                    k == MCFunctionAST.ExecuteClauseKind.PositionedAs) context = initialPosition();
                if (k == MCFunctionAST.ExecuteClauseKind.At ||
                    k == MCFunctionAST.ExecuteClauseKind.RotatedAs) {
                    d = initialDirection(); playerCamera = true;
                }
            } else if (k == MCFunctionAST.ExecuteClauseKind.Positioned) {
                let next = resolvePosition(c.position, context);
                if (!next) {advancedUnsupported("EXECUTE_EYE_COMPLEX_CONTEXT");return undefined;}
                context = next;
                d.anchor = MCFunctionAST.EntityAnchor.Feet;
            } else if (k == MCFunctionAST.ExecuteClauseKind.Align) {
                if (c.axes.indexOf("x") >= 0) context.x = Math.floor(context.x);
                if (c.axes.indexOf("y") >= 0) context.y = Math.floor(context.y);
                if (c.axes.indexOf("z") >= 0) context.z = Math.floor(context.z);
            } else if (k == MCFunctionAST.ExecuteClauseKind.Anchored) {
                d.anchor = c.anchor;
            } else if (k == MCFunctionAST.ExecuteClauseKind.Rotated) {
                if (!c.rotation) {advancedUnsupported("EXECUTE_EYE_COMPLEX_CONTEXT");return undefined;}
                applyRotation(c.rotation, d); playerCamera = false;
            } else if (k == MCFunctionAST.ExecuteClauseKind.FacingPosition) {
                let to = resolvePosition(c.facing ? c.facing.position : undefined, context);
                if (!to) {advancedUnsupported("EXECUTE_EYE_COMPLEX_CONTEXT");return undefined;}
                let from = {x:context.x, y:context.y, z:context.z};
                if (d.anchor == MCFunctionAST.EntityAnchor.Eyes)
                    from.y += sample.eyeHeightCandidate;
                if (!setFacing(d, from, to)) {
                    advancedUnsupported("EXECUTE_EYE_COMPLEX_CONTEXT");return undefined;
                }
                playerCamera = false;
            } else {
                advancedUnsupported("EXECUTE_EYE_COMPLEX_CONTEXT"); return undefined;
            }
        }
        if (d.anchor != MCFunctionAST.EntityAnchor.Eyes) {
            advancedUnsupported("EXECUTE_EYE_ANCHOR_RESET"); return undefined;
        }
        let dFeet: PreviewDirection = {yaw:d.yaw, pitch:d.pitch,
            yawKnown:d.yawKnown, pitchKnown:d.pitchKnown,
            anchor:MCFunctionAST.EntityAnchor.Feet};
        let base: PreviewPosition = {x:context.x,
            y:context.y + sample.eyeHeightCandidate,z:context.z};
        let p = resolvePositionWithDirection(
            (<MCFunctionAST.SetBlockCommand>run).position,
            base, dFeet, playerCamera);
        if (!p) {advancedUnsupported("EXECUTE_EYE_ROTATION_UNKNOWN");return undefined;}
        let x = Math.floor(p.x), y = Math.floor(p.y), z = Math.floor(p.z);
        return "INFO [EXECUTE_EYE_HEIGHT_CANDIDATE] " +
            sample.label + " eye +" + sample.eyeHeightCandidate +
            " block " + x + " " + y + " " + z +
            "; CALIBRATION ONLY. No RUN executed.";
    }

    function eyeAnchorLocalCandidate(cmd: MCFunctionAST.ExecuteCommand): void {
        let run = cmd.run;
        if (!run || run.kind != MCFunctionAST.CommandKind.SetBlock ||
            !isLocal((<MCFunctionAST.SetBlockCommand>run).position)) {
            advancedUnsupported("EXECUTE_EYE_HEIGHT_UNCALIBRATED"); return;
        }
        let standing = eyeCandidateText(cmd,
            {label: "STANDING", eyeHeightCandidate: 1.62});
        if (!standing) return;
        let sneak = eyeCandidateText(cmd,
            {label: "SNEAK", eyeHeightCandidate: 1.27});
        if (!sneak) return;
        let low = eyeCandidateText(cmd,
            {label: "LOW", eyeHeightCandidate: 0.40});
        if (!low) return;
        showPoseCandidates(standing, sneak, low);
    }

    /** Determine whether local RUN will consume a live eye anchor. */
    function needsEyeAnchorCandidate(command: MCFunctionAST.ExecuteCommand): boolean {
        if (!command || !command.run ||
            command.run.kind != MCFunctionAST.CommandKind.SetBlock ||
            !isLocal((<MCFunctionAST.SetBlockCommand>command.run).position))
            return false;
        let anchor = MCFunctionAST.EntityAnchor.Feet;
        for (let i = 0; i < command.clauses.length; i++) {
            let c = command.clauses[i];
            if (c.kind == MCFunctionAST.ExecuteClauseKind.FacingPosition ||
                c.kind == MCFunctionAST.ExecuteClauseKind.FacingEntity)
                return false; // Existing E5 facing safeguard stays authoritative.
            if (c.kind == MCFunctionAST.ExecuteClauseKind.Anchored) anchor = c.anchor;
            // 'positioned' resets anchor, unlike 'at'.
            if (c.kind == MCFunctionAST.ExecuteClauseKind.Positioned)
                anchor = MCFunctionAST.EntityAnchor.Feet;
        }
        return anchor == MCFunctionAST.EntityAnchor.Eyes;
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

    /**
     * E3: Experimental, read-only score comparison via mutually exclusive
     * legacy score-range probes. The MakeCode boolean response is NOT trusted
     * merely because one command returned true: every split tests BOTH halves.
     * If the host accepts all strings as success, both halves become true and
     * the function rejects the result instead of fabricating a score.
     *
     * Initial bounded scope: integer scores [-64, 63]. Values outside this
     * domain are UNSUPPORTED, never treated as failed comparisons.
     * Requires in-world Education validation for @s and Fake Player holders.
     */
    function safeScoreWord(value: string, fakeName: boolean): boolean {
        if (!value || value.length > 32) return false;
        for (let i = 0; i < value.length; i++) {
            let n = value.charCodeAt(i);
            let valid = (n >= 48 && n <= 57) ||
                (n >= 65 && n <= 90) || (n >= 97 && n <= 122) ||
                n == 95 || n == 45 || n == 46 ||
                (fakeName && n == 35);
            if (!valid) return false;
        }
        return true;
    }
    function scoreHolderProbe(target: MCFunctionAST.PlayerTarget,
        objective: string, minimum: number, maximum: number): boolean {
        if (!safeScoreWord(objective, false)) return false;
        if (isUnfilteredSelf(target)) {
            return scoreSelectorTest(objective,
                MCFunctionAST.createMinMaxRange(minimum, maximum));
        }
        // Literal fake-player and simple named holder: no quoting or injection.
        if (!target || target.kind != MCFunctionAST.PlayerTargetKind.Name ||
            !safeScoreWord(target.name, true)) return false;
        return player.execute("scoreboard players test " + target.name + " " +
            objective + " " + minimum + " " + maximum);
    }
    function readableScoreHolder(target: MCFunctionAST.PlayerTarget): boolean {
        return isUnfilteredSelf(target) ||
            (!!target && target.kind == MCFunctionAST.PlayerTargetKind.Name &&
             safeScoreWord(target.name, true));
    }
    function readBoundedScore(target: MCFunctionAST.PlayerTarget,
        objective: string): number {
        const below = -64, above = 63;
        if (!readableScoreHolder(target) || !safeScoreWord(objective, false))
            return undefined;
        if (!scoreHolderProbe(target, objective, below, above)) return undefined;
        let low = below, high = above;
        while (low < high) {
            let middle = Math.floor((low + high) / 2);
            let left = scoreHolderProbe(target, objective, low, middle);
            let right = scoreHolderProbe(target, objective, middle + 1, high);
            // Both true => host boolean is not a valid predicate, or changed state.
            // Both false => score absent, API failure, or changed state.
            if (left == right) return undefined;
            if (left) high = middle;
            else low = middle + 1;
        }
        // Final verification protects against host returning unconditional true
        // and against score changes between the binary-search probes.
        if (!scoreHolderProbe(target, objective, low, low)) return undefined;
        let another = low == above ? low - 1 : low + 1;
        if (scoreHolderProbe(target, objective, another, another)) return undefined;
        return low;
    }
    function scoreCompareDecision(c: MCFunctionAST.ExecuteClause): Decision {
        let left = readBoundedScore(c.target, c.objective);
        if (left == undefined) return Decision.Unknown;
        let right = readBoundedScore(c.sourceTarget, c.sourceObjective);
        if (right == undefined) return Decision.Unknown;
        let same = c.scoreComparison == MCFunctionAST.ExecuteScoreComparison.Equal && left == right;
        let less = c.scoreComparison == MCFunctionAST.ExecuteScoreComparison.Less && left < right;
        let lessEqual = c.scoreComparison == MCFunctionAST.ExecuteScoreComparison.LessOrEqual && left <= right;
        let greater = c.scoreComparison == MCFunctionAST.ExecuteScoreComparison.Greater && left > right;
        let greaterEqual = c.scoreComparison == MCFunctionAST.ExecuteScoreComparison.GreaterOrEqual && left >= right;
        return same || less || lessEqual || greater || greaterEqual ?
            Decision.True : Decision.False;
    }

    /** Detect any local ^ coordinate that would make pose/anchor observable. */
    function anyLocalCoordinate(command: MCFunctionAST.ExecuteCommand): boolean {
        let cs = command.clauses;
        for (let i = 0; i < cs.length; i++) {
            let c = cs[i], k = c.kind;
            if (k == MCFunctionAST.ExecuteClauseKind.Positioned && isLocal(c.position)) return true;
            if ((k == MCFunctionAST.ExecuteClauseKind.IfBlock ||
                 k == MCFunctionAST.ExecuteClauseKind.UnlessBlock) && isLocal(c.position)) return true;
            if ((k == MCFunctionAST.ExecuteClauseKind.IfBlocks ||
                 k == MCFunctionAST.ExecuteClauseKind.UnlessBlocks) &&
                (isLocal(c.begin) || isLocal(c.end) || isLocal(c.destination))) return true;
            if (k == MCFunctionAST.ExecuteClauseKind.FacingPosition &&
                c.facing && isLocal(c.facing.position)) return true;
        }
        return command.run && command.run.kind == MCFunctionAST.CommandKind.SetBlock &&
            isLocal((<MCFunctionAST.SetBlockCommand>command.run).position);
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
        // CBX12 opt-in: use the canonical Execute AST, not PXT emulation.
        if (MCFunctionCBX12Bridge.isEnabled()) {
            MCFunctionCBX12Bridge.execute(original);
            return;
        }
        let command = flatten(original);
        if (!command) {
            advancedUnsupported("EXECUTE_NESTED_LIMIT");
            return;
        }
        let clauses = command.clauses;
        if (!clauses || !command.run) return;
        // E5: run ONLY the diagnostic pose-to-eye calculation. Until the
        // eye-height table is Native-calibrated this must never modify blocks.
        if (needsEyeAnchorCandidate(command)) {
            eyeAnchorLocalCandidate(command);
            return;
        }
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
                if (!readableScoreHolder(c.target) || !readableScoreHolder(c.sourceTarget) ||
                    !safeScoreWord(c.objective, false) ||
                    !safeScoreWord(c.sourceObjective, false)) preflightValid = false;
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
            // E6: SAY and global scoreboard predicates do not access block/entity
            // state in the selected dimension. Block modifications and any
            // world-dependent predicates remain forbidden.
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
                    k == MCFunctionAST.ExecuteClauseKind.UnlessEntity) {
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
                // If any later local ^ coordinate might consume the facing,
                // exact pose is mandatory. Never invent an eye offset.
                if (anyLocalCoordinate(command)) {
                    advancedUnsupported("EXECUTE_EYES_POSE_UNAVAILABLE"); return;
                }
                // Entity eyes still lack an exact 3D target pose.
                if (k == MCFunctionAST.ExecuteClauseKind.FacingEntity) {
                    advancedUnsupported("EXECUTE_EYES_POSE_UNAVAILABLE"); return;
                }
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
                // Modern EXECUTE positioned resets the anchor to FEET.
                orientation.anchor = MCFunctionAST.EntityAnchor.Feet;
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
                if (!target) {
                    advancedUnsupported("EXECUTE_FACING_UNKNOWN"); return;
                }
                if (orientation.anchor == MCFunctionAST.EntityAnchor.Eyes) {
                    // For eyes, we can prove facing has a valid target when
                    // the horizontal displacement is nonzero. Rotation is
                    // intentionally left unknown: no local ^ consumers exist.
                    if (target.x == context.x && target.z == context.z ||
                        anyLocalCoordinate(command)) {
                        advancedUnsupported("EXECUTE_EYES_POSE_UNAVAILABLE"); return;
                    }
                    orientation.yawKnown = false;
                    orientation.pitchKnown = false;
                } else if (!setFacing(orientation, context, target)) {
                    advancedUnsupported("EXECUTE_FACING_UNKNOWN"); return;
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
        if (k == MCFunctionAST.ExecuteClauseKind.IfScoreCompare ||
            k == MCFunctionAST.ExecuteClauseKind.UnlessScoreCompare) {
            let decision = scoreCompareDecision(c);
            if (decision == Decision.Unknown) return Decision.Unknown;
            if (k == MCFunctionAST.ExecuteClauseKind.UnlessScoreCompare)
                return decision == Decision.True ? Decision.False : Decision.True;
            return decision;
        }
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
