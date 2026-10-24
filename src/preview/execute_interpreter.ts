/** C3 Preview-only TS interpreter. Canonical compileExecute() NEVER uses this path. */
namespace MCFunctionExecutePreview {
    export enum Decision { Unknown = 0, False = 1, True = 2 }
    function absolute(p: MCFunctionAST.Position): boolean {
        return !!p && p.x.mode == MCFunctionAST.CoordinateMode.Absolute &&
            p.y.mode == MCFunctionAST.CoordinateMode.Absolute &&
            p.z.mode == MCFunctionAST.CoordinateMode.Absolute;
    }
    function absoluteWorld(p: MCFunctionAST.Position): Position {
        return world(p.x.value, p.y.value, p.z.value);
    }
    function supportedVanillaBlock(id: string): boolean {
        // Reject unknown/custom IDs; MakeCode blockByName may map them to AIR.
        let known = "|stone|dirt|grass|grass_block|glass|gold_block|diamond_block|emerald_block|" +
            "cobblestone|obsidian|air|sand|oak_planks|bedrock|iron_block|redstone_block|";
        return id.length > 0 && known.indexOf("|" + id + "|") >= 0;
    }
    function evaluateClause(c: MCFunctionAST.ExecuteClause): Decision {
        let k = c.kind;
        if (k == MCFunctionAST.ExecuteClauseKind.IfBlock ||
            k == MCFunctionAST.ExecuteClauseKind.UnlessBlock) {
            if (!absolute(c.position)) return Decision.Unknown;
            // TypeScript block IDs alone cannot prove a state match.
            // Preserve typed BlockStates in Compiler; do not fake a Preview PASS.
            if (c.blockStates && c.blockStates.entries && c.blockStates.entries.length > 0)
                return Decision.Unknown;
            let id = c.blockId;
            if (id.indexOf("minecraft:") == 0) id = id.substr(10);
            if (!supportedVanillaBlock(id)) return Decision.Unknown;
            let match = blocks.testForBlock(blocks.blockByName(id), absoluteWorld(c.position));
            if (k == MCFunctionAST.ExecuteClauseKind.UnlessBlock) match = !match;
            return match ? Decision.True : Decision.False;
        }
        if (k == MCFunctionAST.ExecuteClauseKind.IfBlocks ||
            k == MCFunctionAST.ExecuteClauseKind.UnlessBlocks) {
            if (!absolute(c.begin) || !absolute(c.end) || !absolute(c.destination))
                return Decision.Unknown;
            let match = blocks.testForBlocks(absoluteWorld(c.begin), absoluteWorld(c.end),
                absoluteWorld(c.destination), c.scan == MCFunctionAST.ExecuteScan.Masked ?
                TestForBlocksMask.Masked : TestForBlocksMask.All);
            if (k == MCFunctionAST.ExecuteClauseKind.UnlessBlocks) match = !match;
            return match ? Decision.True : Decision.False;
        }
        // Entity/score conditions need reliable false vs parser/API failure distinction.
        // Context modifiers require faithful @s/location/rotation replay, not a fake global @s.
        return Decision.Unknown;
    }
    /** Called only after Definition Validation. Never issue modern execute via player.execute(). */
    export function execute(command: MCFunctionAST.ExecuteCommand): void {
        let clauses = command.clauses;
        if (!clauses || !command.run) return;
        // Preflight ALL clauses before evaluating ANY of them, even if earlier false.
        // Prevent pretending `unless entity` or `as` has been evaluated correctly.
        for (let i = 0; i < clauses.length; i++) {
            let k = clauses[i].kind;
            if (k != MCFunctionAST.ExecuteClauseKind.IfBlock &&
                k != MCFunctionAST.ExecuteClauseKind.UnlessBlock &&
                k != MCFunctionAST.ExecuteClauseKind.IfBlocks &&
                k != MCFunctionAST.ExecuteClauseKind.UnlessBlocks) {
                MCFunctionPreview.previewSay("INFO [EXECUTE_PREVIEW_UNSUPPORTED] clause " +
                    (i + 1) + " changes/needs unsupported context. No RUN executed. " +
                    "Use exported command or direct game chat for verification.");
                return;
            }
        }
        // Reuse the existing typed command Compiler/Preview pipeline for RUN.
        // Nested modern EXECUTE requires context replay, while RAW bypasses typed
        // validation; neither is safe to dispatch using legacy player.execute().
        if (command.run.kind == MCFunctionAST.CommandKind.Execute ||
            command.run.kind == MCFunctionAST.CommandKind.Raw) {
            MCFunctionPreview.previewSay("INFO [EXECUTE_RUN_UNSUPPORTED] RUN not replayed in Preview.");
            return;
        }
        for (let i = 0; i < clauses.length; i++) {
            let result = evaluateClause(clauses[i]);
            if (result == Decision.Unknown) {
                MCFunctionPreview.previewSay("INFO [EXECUTE_PREVIEW_UNKNOWN] Unsupported block or coordinate. RUN skipped.");
                return;
            }
            if (result == Decision.False) return;
        }
        let query = MCFunctionPreview.tryHandleQuery(command.run);
        if (query.handled) return;
        let compiled = MCFunctionCompiler.compileCommand(command.run);
        if (compiled.length > 0) {
            let success = player.execute(compiled);
            MCFunctionPreview.observeCommand(command.run, success);
        }
    }
}
