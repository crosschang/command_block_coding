/**
 * P2c-3 experimental no-temporary-tag TAG LIST live display.
 *
 * Canonical command AST and mcfunction output are never changed.
 * In AUTO Preview only, build a temporary, derived AST whose final RUN
 * sends a ScriptEvent per *Minecraft-selected* entity. The Behavior Pack
 * gets event.sourceEntity, reads getTags(), and displays to the requester.
 *
 * Request transport uses bounded UTF-16 hex chunks, not testfor bits or a
 * polling worker. Missing pack is NOT silently treated as success.
 * This does not yet guarantee whole-FunctionFile execution order (P3).
 */
namespace MCFunctionTagListDirect {
    const HIT_MARKER = "scriptevent cbxtag:hit q";
    const HEX_DIGITS = "0123456789abcdef";
    const HEX_CHUNK_LENGTH = 680;
    const MAX_COMMAND_LENGTH = 2400;
    const MAX_CHUNKS = 16;
    let nextSequence = 0;
    let packNoticeShown = false;

    /** Pure AST test. Raw commands are deliberately opaque and not guessed. */
    export function isTagListLeaf(command: MCFunctionAST.CommandNode): boolean {
        if (!command) return false;
        if (command.kind == MCFunctionAST.CommandKind.Tag) {
            return (<MCFunctionAST.TagCommand>command).action == MCFunctionAST.TagActionKind.List;
        }
        if (command.kind == MCFunctionAST.CommandKind.Execute) {
            return isTagListLeaf((<MCFunctionAST.ExecuteCommand>command).run);
        }
        return false;
    }

    /**
     * Construct new PREVIEW-ONLY AST, leaving the canonical input untouched.
     * Keep all ordered EXECUTE clauses, including nested chains and filters.
     * TAG's own target is evaluated at the final, original RUN context.
     */
    function queryAst(command: MCFunctionAST.CommandNode): MCFunctionAST.CommandNode {
        if (command.kind == MCFunctionAST.CommandKind.Tag) {
            let target = (<MCFunctionAST.TagCommand>command).target;
            let select: MCFunctionAST.ExecuteClause = {
                kind: MCFunctionAST.ExecuteClauseKind.As,
                target: MCFunctionAST.createSelectorPlayerTarget(target)
            };
            return MCFunctionAST.createExecuteCommand(
                [select], MCFunctionAST.createRawCommand(HIT_MARKER)
            );
        }
        let exec = <MCFunctionAST.ExecuteCommand>command;
        return MCFunctionAST.createExecuteCommand(
            exec.clauses.slice(), queryAst(exec.run)
        );
    }

    /** Hex avoids MakeCode's @/% replacement and preserves Unicode filters. */
    function hexEncode(text: string): string {
        let out = "";
        for (let i = 0; i < text.length; i++) {
            let c = text.charCodeAt(i);
            out += HEX_DIGITS.charAt(Math.floor(c / 4096));
            out += HEX_DIGITS.charAt(Math.floor(c / 256) % 16);
            out += HEX_DIGITS.charAt(Math.floor(c / 16) % 16);
            out += HEX_DIGITS.charAt(c % 16);
        }
        return out;
    }

    function sendPlan(plan: string): void {
        if (!plan || plan.length > MAX_COMMAND_LENGTH ||
            plan.indexOf("\n") >= 0 || plan.indexOf("\r") >= 0 ||
            plan.indexOf("\u0000") >= 0 ||
            plan.indexOf("@initiator") >= 0) {
            MCFunctionPreview.previewSay(
                "ERROR [CBXTAG_PLAN_UNSUPPORTED] Too long, invalid, or dialogue initiator context unavailable."
            );
            return;
        }
        let encoded = hexEncode(plan);
        let chunks = Math.ceil(encoded.length / HEX_CHUNK_LENGTH);
        if (chunks < 1 || chunks > MAX_CHUNKS) {
            MCFunctionPreview.previewSay("ERROR [CBXTAG_PLAN_TOO_LONG] Cannot send this query safely.");
            return;
        }

        // The pack isolates requests by player-id + session-local request ID;
        // it then assigns an independent private token to HIT events.
        nextSequence++;
        if (nextSequence > 99999999) nextSequence = 1;
        let sequence = "q" + nextSequence;
        for (let i = 0; i < chunks; i++) {
            let part = encoded.substr(i * HEX_CHUNK_LENGTH, HEX_CHUNK_LENGTH);
            let submitted = player.execute(
                "scriptevent cbxtag:chunk " + sequence + " " + i + " " + chunks + " " + part
            );
            if (!submitted) {
                MCFunctionPreview.previewSay("ERROR [CBXTAG_CHUNK_SEND] Failed part " + (i + 1) + "/" + chunks);
                return;
            }
        }
        let committed = player.execute("scriptevent cbxtag:commit " + sequence);
        if (!committed) {
            MCFunctionPreview.previewSay("ERROR [CBXTAG_COMMIT_SEND] Query commit failed.");
            return;
        }
        if (!packNoticeShown) {
            packNoticeShown = true;
            MCFunctionPreview.previewSay(
                "INFO [CBXTAG_PREVIEW] Sent TAG LIST to P2c-3 pack; submission alone is not proof. " +
                "Use CBXTAG PING_OK to verify installation."
            );
        }
    }

    /**
     * Called after the existing Validator / FunctionFile capture gate.
     * Return true only when AUTO's TAG LIST query was handled by this route.
     */
    export function tryDisplay(command: MCFunctionAST.CommandNode): boolean {
        if (!MCFunctionRuntime.isAutomatic() || !isTagListLeaf(command)) return false;
        let previewAst = queryAst(command);
        let plan = MCFunctionCompiler.compileCommand(previewAst);
        sendPlan(plan);
        return true;
    }

    /** Explicit lab diagnostic: the pack itself must print PING_OK. */
    export function ping(): boolean {
        return player.execute("scriptevent cbxtag:ping FROM_MAKECODE");
    }
}
