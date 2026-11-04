/**
 * P4-ORDER-2C, opt-in FunctionFile ordered Preview transport.
 * The canonical AST, Validator, Compiler and mcfunction export remain unchanged.
 * This is a Preview transport: submitted != DONE. The Behavior Pack owns ACK.
 * A batch runs under the source player's command context and fails closed.
 */
namespace MCFunctionOrderedPreview {
    const EVENT_ID = "cbxp4o2c:batch";
    const HEX = "0123456789abcdef";
    const MAX_STEPS = 12;
    const MAX_PACKET = 1400;
    let enabled = false;
    let sequence = 0;
    // Random per-PXT-start session token avoids stale q1 collisions after reload.
    let sessionToken = Math.floor(Math.random() * 900000) + 100000;
    let introShown = false;

    export function setEnabled(value: boolean): void {
        enabled = value;
    }

    export function isEnabled(): boolean {
        return enabled;
    }

    export function maxSteps(): number {
        return MAX_STEPS;
    }

    function encodeUtf16(input: string): string {
        let encoded = "";
        for (let i = 0; i < input.length; i++) {
            let code = input.charCodeAt(i);
            encoded += HEX.charAt(Math.floor(code / 4096));
            encoded += HEX.charAt(Math.floor(code / 256) % 16);
            encoded += HEX.charAt(Math.floor(code / 16) % 16);
            encoded += HEX.charAt(code % 16);
        }
        return encoded;
    }

    /** Fail closed; no fallback to per-line execution after an uncertain submit. */
    export function submit(name: string, nodes: MCFunctionAST.CommandNode[]): void {
        if (!nodes || nodes.length == 0) {
            MCFunctionPreview.previewSay("INFO [P4O2C_EMPTY] " + name + " has no commands.");
            return;
        }
        if (nodes.length > MAX_STEPS) {
            MCFunctionPreview.previewSay("ERROR [P4O2C_TOO_MANY_STEPS] " + name);
            return;
        }
        let plan = "";
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            let issues = MCFunctionValidator.validateCommand(node);
            if (MCFunctionValidator.hasError(issues)) {
                MCFunctionPreview.previewSay("ERROR [P4O2C_VALIDATION] " + name + " step=" + (i + 1));
                return;
            }
            // Exact canonical command line from AST. No per-command block-string assembly.
            let line = MCFunctionCompiler.compileCommand(node);
            if (!line || line.length == 0 || line != line.trim() ||
                line.charAt(0) == "/" || line.indexOf("\n") >= 0 ||
                line.indexOf("\r") >= 0 || line.indexOf("\u0000") >= 0 ||
                line.indexOf("@initiator") >= 0) {
                MCFunctionPreview.previewSay("ERROR [P4O2C_BAD_LINE] " + name + " step=" + (i + 1));
                return;
            }
            let part = encodeUtf16(line);
            if (plan.length > 0) plan += ".";
            plan += part;
            if (plan.length > MAX_PACKET) {
                MCFunctionPreview.previewSay("ERROR [P4O2C_PACKET_LIMIT] " + name);
                return;
            }
        }
        sequence++;
        if (sequence > 999999) sequence = 1;
        let requestId = "q" + sessionToken + "_" + sequence;
        // The single, tested P2c-4-style yield occurs before one batch,
        // NOT between individual commands; avoids fabricating a per-line delay.
        loops.pause(1);
        let submitted = player.execute("scriptevent " + EVENT_ID + " " + requestId + " " + plan);
        if (!submitted) {
            MCFunctionPreview.previewSay("ERROR [P4O2C_SEND] " + name + " id=" + requestId);
            return;
        }
        if (!introShown) {
            introShown = true;
            MCFunctionPreview.previewSay(
                "INFO [P4O2C_SUBMITTED] Pack sends ACCEPT/DONE/ERROR. No MakeCode ACK callback."
            );
        }
    }
}
