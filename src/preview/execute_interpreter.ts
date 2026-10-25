/**
 * C3 Execute Preview Interpreter - E1 virtual position context.
 *
 * E1 implementation scope:
 * - positioned absolute and relative (~) coordinates
 * - align x/y/z (floor, including negative positions)
 * - if/unless block(s) using the virtual position
 * - RUN SAY and RUN SETBLOCK using the virtual position
 * - preserve existing behavior for conditional-only EXECUTE without context modifiers
 *
 * Out of scope: local (^), as/at, entity/score, rotation, facing, anchored, dimension.
 * These are blocked; no modern EXECUTE is sent through player.execute().
 * This does NOT modify canonical AST or .mcfunction Compiler output.
 *
 * Only source file replaced: src/preview/execute_interpreter.ts.
 */
namespace MCFunctionExecutePreview {
    export enum Decision { Unknown = 0, False = 1, True = 2 }

    /** E1: transient runtime context, never serialized to .mcfunction. */
    interface PreviewPosition {
        x: number;
        y: number;
        z: number;
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

    /**
     * Called after definition validation. Never dispatch the *modern* execute
     * grammar to legacy MakeCode player.execute().
     */
    export function execute(command: MCFunctionAST.ExecuteCommand): void {
        let clauses = command.clauses;
        if (!clauses || !command.run) return;

        let changedPosition = false;
        // Preflight EVERY clause before mutating world state or evaluating a false condition.
        for (let i = 0; i < clauses.length; i++) {
            let k = clauses[i].kind;
            if (k == MCFunctionAST.ExecuteClauseKind.Positioned) {
                if (!e1SupportedPosition(clauses[i].position)) {
                    unsupportedClause(i);
                    return;
                }
                changedPosition = true;
            } else if (k == MCFunctionAST.ExecuteClauseKind.Align) {
                changedPosition = true;
            } else if (k != MCFunctionAST.ExecuteClauseKind.IfBlock &&
                k != MCFunctionAST.ExecuteClauseKind.UnlessBlock &&
                k != MCFunctionAST.ExecuteClauseKind.IfBlocks &&
                k != MCFunctionAST.ExecuteClauseKind.UnlessBlocks) {
                unsupportedClause(i);
                return;
            }
        }

        // Preserve the previous policy for nested EXECUTE / RAW RUN.
        if (command.run.kind == MCFunctionAST.CommandKind.Execute ||
            command.run.kind == MCFunctionAST.CommandKind.Raw) {
            MCFunctionPreview.previewSay("INFO [EXECUTE_RUN_UNSUPPORTED] RUN not replayed in Preview.");
            return;
        }
        if (changedPosition && !canRunWithPosition(command.run.kind)) {
            MCFunctionPreview.previewSay("INFO [EXECUTE_E1_RUN_UNSUPPORTED] " +
                "Position context for this RUN has not been implemented. No RUN executed.");
            return;
        }

        // The virtual context belongs to one single-player MakeCode executor.
        // E2 must model executor branches; do not silently emulate as/at here.
        let context = initialPosition();
        for (let i = 0; i < clauses.length; i++) {
            let c = clauses[i];
            let k = c.kind;
            if (k == MCFunctionAST.ExecuteClauseKind.Positioned) {
                let next = resolvePosition(c.position, context);
                if (!next) {
                    MCFunctionPreview.previewSay("INFO [EXECUTE_PREVIEW_UNKNOWN] " +
                        "Position could not be resolved. RUN skipped.");
                    return;
                }
                context = next;
            } else if (k == MCFunctionAST.ExecuteClauseKind.Align) {
                // Minecraft /execute align uses floor, NOT truncate (important for negatives).
                if (c.axes.indexOf("x") >= 0) context.x = Math.floor(context.x);
                if (c.axes.indexOf("y") >= 0) context.y = Math.floor(context.y);
                if (c.axes.indexOf("z") >= 0) context.z = Math.floor(context.z);
            } else {
                let decision = evaluateClause(c, context);
                if (decision == Decision.Unknown) {
                    MCFunctionPreview.previewSay("INFO [EXECUTE_PREVIEW_UNKNOWN] " +
                        "Unsupported block, state or coordinate. RUN skipped.");
                    return;
                }
                if (decision == Decision.False) return;
            }
        }

        let run = changedPosition ? resolveRun(command.run, context) : command.run;
        if (!run) {
            MCFunctionPreview.previewSay("INFO [EXECUTE_PREVIEW_UNKNOWN] " +
                "RUN position could not be resolved. RUN skipped.");
            return;
        }
        let query = MCFunctionPreview.tryHandleQuery(run);
        if (query.handled) return;
        // Block-state translation is Preview-only; canonical compiler remains untouched.
        let compiled = MCFunctionPreviewBlockCommandSerializer.tryCompile(run);
        if (compiled.length == 0) compiled = MCFunctionCompiler.compileCommand(run);
        if (compiled.length > 0) {
            let success = player.execute(compiled);
            MCFunctionPreview.observeCommand(run, success);
        }
    }
}
