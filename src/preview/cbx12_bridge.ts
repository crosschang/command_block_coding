/**
 * CBX12 opt-in Runtime Preview transport for Minecraft Education 26.32.
 * Actual repository source: crosschang/command_block_coding @ 0.0.89.
 * Canonical AST / Validator / Compiler and .mcfunction output stay unchanged.
 *
 * SCRIPT API BEHAVIOR PACK REQUIRED. Experimental solo-test-world use only.
 * Sending a command is not an acknowledgement of successful game execution.
 */
namespace MCFunctionCBX12Bridge {
    const MAX_COMMAND_LENGTH = 300;
    const HEX_DIGITS = "0123456789abcdef";
    let enabled = false;

    /** Opt in at runtime. No in-game command is sent during initialization. */
    export function enable(): void {
        enabled = true;
    }

    /** Restore the original PXT Preview execution routes. */
    export function disable(): void {
        enabled = false;
    }

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
        let submitted = player.execute("scriptevent cbx12:ping MAKECODE");
        if (!submitted) {
            MCFunctionPreview.previewSay("WARNING [CBX12_PING_SEND] Check behavior pack.");
        }
    }

    function sendCompiled(compiled: string): void {
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
