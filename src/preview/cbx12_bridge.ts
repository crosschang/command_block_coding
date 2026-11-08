/**
 * Backward-compatible CBX12 and opt-in CBXCORE runtime transport.
 * Integration base: crosschang/command_block_coding @ pxt.json 0.0.91.
 * Canonical AST / Validator / Compiler / .mcfunction output are unchanged.
 *
 * enable(): legacy CBX12 solo-world route; enableUnified(): CBXCORE route.
 * Separate Script API pack required. Both are experimental and NOT for public use.
 * Submitting a command is not proof of game execution or a world-state change.
 */
namespace MCFunctionCBX12Bridge {
    const MAX_COMMAND_LENGTH = 300;
    const HEX_DIGITS = "0123456789abcdef";
    let enabled = false;
    let unifiedTransport = false;
    let selectiveTransport = false;

    /** Opt in at runtime. No in-game command is sent during initialization. */
    export function enable(): void {
        enabled = true;
        unifiedTransport = false; // Existing callers always get their original CBX12 route.
        selectiveTransport = false;
    }

    /** Restore the original PXT Preview execution routes. */
    export function disable(): void {
        enabled = false;
        unifiedTransport = false;
        selectiveTransport = false;
    }

    /** CBX12 old path stays available; this opts in to the unified CBXCORE pack. */
    export function enableUnified(): void {
        enabled = true;
        unifiedTransport = true;
        selectiveTransport = false;
    }

    /** EXPERIMENTAL: compiled AST line, only @/%/non-ASCII selectively escaped. */
    export function enableSelective(): void {
        enabled = true;
        unifiedTransport = true;
        selectiveTransport = true;
    }

    export function isSelective(): boolean { return isUnified() && selectiveTransport; }

    export function isUnified(): boolean { return enabled && unifiedTransport; }

    export function isEnabled(): boolean {
        return enabled;
    }

    /**
     * Called AFTER the existing AST Validator / FunctionFile capture gate.
     * Compile the original command, never reconstruct it from block inputs.
     */
    export function execute(command: MCFunctionAST.CommandNode): void {
        if (!command) {
            MCFunctionPreview.previewSay("ERROR [CBX12_MISSING_AST] Command is missing.");
            return;
        }
        let compiled = MCFunctionCompiler.compileCommand(command);
        sendCompiled(compiled);
    }

    /** Diagnostic only. The behavior pack reports its own PING_OK message. */
    export function ping(): void {
        if (isUnified()) {
            MCFunctionCBXCore.ping();
            return;
        }
        let submitted = player.execute("scriptevent cbx12:ping MAKECODE");
        if (!submitted) {
            MCFunctionPreview.previewSay("WARNING [CBX12_PING_SEND] Check behavior pack.");
        }
    }

    function sendCompiled(compiled: string): void {
        if (isUnified()) {
            if (isSelective()) MCFunctionCBXCore.fireCompiledSelective(compiled);
            else MCFunctionCBXCore.fireCompiled(compiled);
            return;
        }
        if (!compiled || compiled.length == 0) {
            MCFunctionPreview.previewSay("ERROR [CBX12_EMPTY] No compiled command.");
            return;
        }
        if (compiled.length > MAX_COMMAND_LENGTH) {
            MCFunctionPreview.previewSay("ERROR [CBX12_TOO_LONG] Command length " +
                compiled.length + " exceeds " + MAX_COMMAND_LENGTH + ".");
            return;
        }
        if (compiled != compiled.trim() || compiled.charAt(0) == "/" ||
            compiled.indexOf("\n") >= 0 || compiled.indexOf("\r") >= 0 ||
            compiled.indexOf("\u0000") >= 0) {
            MCFunctionPreview.previewSay("ERROR [CBX12_BAD_LINE] Single command without leading slash required.");
            return;
        }

        // Four lowercase hex digits per UTF-16 code unit. Preserves @s, ^ and
        // other syntax that the PXT player.execute() route used to reinterpret.
        let hex = "";
        for (let i = 0; i < compiled.length; i++) {
            let code = compiled.charCodeAt(i);
            hex += HEX_DIGITS.charAt(Math.floor(code / 4096)) +
                HEX_DIGITS.charAt(Math.floor(code / 256) % 16) +
                HEX_DIGITS.charAt(Math.floor(code / 16) % 16) +
                HEX_DIGITS.charAt(code % 16);
        }

        // IMPORTANT: true/false here is only a MakeCode submission result.
        // Only the behavior-pack logs can report RUN_OK / RUN_ERROR.
        let submitted = player.execute("scriptevent cbx12:exec_hex " + hex);
        if (!submitted) {
            MCFunctionPreview.previewSay("WARNING [CBX12_SEND] Submission failed. " +
                "No direct Preview fallback was attempted.");
        }
    }
}
