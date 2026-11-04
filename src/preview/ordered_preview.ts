/**
 * P4-ORDER-2C, opt-in FunctionFile ordered Preview transport.
 * The canonical AST, Validator, Compiler and mcfunction export remain unchanged.
 * P4-ORDER-2F adds Scoreboard + Fake Player readback, with optional
 * legacy per-player TAG readback. Both require in-game calibration.
 * A batch runs under the source player's command context and fails closed.
 */
namespace MCFunctionOrderedPreview {
    const EVENT_ID = "cbxp4o2c:batch";
    const SCORE_EVENT_ID = "cbxp4o2f:batch";
    const SCORE_OBJECTIVE = "cbxo2f";
    const SCORE_FAKE_PREFIX = "cbx2f_";
    const HEX = "0123456789abcdef";
    const MAX_STEPS = 12;
    const MAX_PACKET = 1400;
    /** Transport result, not a new canonical command or .mcfunction construct. */
    export enum AckStatus {
        Idle = 0,
        Submitted = 1,
        Done = 2,
        Error = 3,
        Timeout = 4,
        Unsupported = 5,
        SendFailed = 6,
        Rejected = 7,
        Busy = 8
    }


    /** ACK receipt transport is Preview-only, never part of command AST. */
    export enum AckTransport {
        Tag = 0,
        Scoreboard = 1
    }

    let ackTransport = AckTransport.Tag;
    export function setAckTransport(value: AckTransport): void {
        ackTransport = value;
        readbackReady = 0;
        lastReceipt = AckStatus.Idle;
    }
    export function selectedAckTransport(): AckTransport { return ackTransport; }

    let enabled = false;
    let sequence = 0;
    // Random per-PXT-start session token avoids stale q1 collisions after reload.
    let sessionToken = Math.floor(Math.random() * 900000) + 100000;
    let introShown = false;
    let receiptMode = false;
    let readbackReady = 0; // 0 = untested; 1 = supported; -1 = unsupported.
    let inFlight = false;
    let lastReceipt = AckStatus.Idle;
    let lastId = "";
    const ACK_DONE = "cbxo2d_done_";
    const ACK_ERROR = "cbxo2d_error_";
    const ACK_POLL_PAUSE = 100;
    const ACK_POLL_LIMIT = 12;

    export function setReceiptMode(value: boolean): void {
        receiptMode = value;
        lastReceipt = AckStatus.Idle;
    }

    export function isReceiptMode(): boolean {
        return receiptMode;
    }

    export function lastAckStatus(): number { return lastReceipt; }
    export function lastRequestId(): string { return lastId; }

    /** Prevent a previously completed request from masquerading as the result
     * of a rejected/unknown FunctionFile. Never alter an in-flight result. */
    export function markRejected(): void {
        if (inFlight) return;
        lastId = "";
        lastReceipt = AckStatus.Rejected;
    }


    /**
     * A boolean command submission is NOT automatically an ACK.
     * Calibrate against a real player tag which is initially absent, then
     * present, then absent again. If player.execute() returns submission
     * success alone, this test fails closed. No blocks are changed.
     */
    export function probeReadback(): boolean {
        if (inFlight) return false;
        if (ackTransport == AckTransport.Scoreboard) return probeScoreboardReadback();
        let marker = "cbxo2d_cal_" + sessionToken;
        let absentBefore = player.execute("testfor @s[tag=" + marker + "]");
        let added = player.execute("tag @s add " + marker);
        loops.pause(1);
        let present = player.execute("testfor @s[tag=" + marker + "]");
        let removed = player.execute("tag @s remove " + marker);
        loops.pause(1);
        let absentAfter = player.execute("testfor @s[tag=" + marker + "]");
        let good = !absentBefore && added && present && removed && !absentAfter;
        readbackReady = good ? 1 : -1;
        MCFunctionPreview.previewSay(good
            ? "INFO [P4O2D_READBACK_PASS] testfor reflects actual player TAG state."
            : "ERROR [P4O2D_READBACK_UNSUPPORTED] Cannot safely read ACK; no command will be submitted in ACK mode.");
        return good;
    }

    /** Fail closed unless MakeCode's boolean reports the actual Fake Player
     * score. Uses a temporary fake player; the objective must be provisioned
     * by the P4-ORDER-2F behavior pack before this calibration runs. */
    function probeScoreboardReadback(): boolean {
        let marker = "cbx2fcal_" + sessionToken;
        let prefix = "scoreboard players ";
        let tail = " " + SCORE_OBJECTIVE;
        // Cleanup only the dedicated calibration participant (no shared reset).
        player.execute(prefix + "reset " + marker + tail);
        let absent = !player.execute(prefix + "test " + marker + tail + " 2 2");
        let setZero = player.execute(prefix + "set " + marker + tail + " 0");
        let pending = player.execute(prefix + "test " + marker + tail + " 0 0");
        let setDone = player.execute(prefix + "set " + marker + tail + " 2");
        let done = player.execute(prefix + "test " + marker + tail + " 2 2");
        let notError = !player.execute(prefix + "test " + marker + tail + " 3 3");
        let setError = player.execute(prefix + "set " + marker + tail + " 3");
        let error = player.execute(prefix + "test " + marker + tail + " 3 3");
        let notDone = !player.execute(prefix + "test " + marker + tail + " 2 2");
        let reset = player.execute(prefix + "reset " + marker + tail);
        let cleared = !player.execute(prefix + "test " + marker + tail + " 3 3") &&
            !player.execute(prefix + "test " + marker + tail + " 2 2") &&
            !player.execute(prefix + "test " + marker + tail + " 0 0");
        let good = absent && setZero && pending && setDone && done && notError &&
            setError && error && notDone && reset && cleared;
        readbackReady = good ? 1 : -1;
        MCFunctionPreview.previewSay(good
            ? "INFO [P4O2F_SCORE_READBACK_PASS] 0/2/3/missing distinguished."
            : "ERROR [P4O2F_SCORE_READBACK_FAIL] No Scoreboard ACK submission permitted.");
        return good;
    }

    function scoreFakePlayer(id: string): string {
        return SCORE_FAKE_PREFIX + id;
    }

    /** A missing, changed, or malformed status is NEVER treated as DONE. */
    function readScoreboardAck(id: string): AckStatus {
        let key = scoreFakePlayer(id);
        let base = "scoreboard players test " + key + " " + SCORE_OBJECTIVE + " ";
        if (player.execute(base + "2 2")) return AckStatus.Done;
        if (player.execute(base + "3 3")) return AckStatus.Error;
        if (player.execute(base + "0 1")) return AckStatus.Submitted;
        MCFunctionPreview.previewSay("ERROR [P4O2F_UNKNOWN_SCORE] id=" + id);
        return AckStatus.Error;
    }

    function resetScoreboardAck(id: string): boolean {
        let key = scoreFakePlayer(id);
        let base = "scoreboard players ";
        let tail = " " + SCORE_OBJECTIVE;
        let removed = player.execute(base + "reset " + key + tail);
        let cleared = !player.execute(base + "test " + key + tail + " 0 3");
        return removed && cleared;
    }

    function readAck(id: string): AckStatus {
        if (ackTransport == AckTransport.Scoreboard) return readScoreboardAck(id);
        let done = player.execute("testfor @s[tag=" + ACK_DONE + id + "]");
        let error = player.execute("testfor @s[tag=" + ACK_ERROR + id + "]");
        if (done && error) return AckStatus.Error; // conflicting ACK => never accept as DONE
        if (error) return AckStatus.Error;
        if (done) return AckStatus.Done;
        return AckStatus.Submitted;
    }

    function waitReceipt(name: string, id: string): AckStatus {
        for (let attempt = 0; attempt < ACK_POLL_LIMIT; attempt++) {
            loops.pause(ACK_POLL_PAUSE);
            let status = readAck(id);
            if (status == AckStatus.Submitted) continue;
            if (ackTransport == AckTransport.Scoreboard) {
                if (!resetScoreboardAck(id)) {
                    MCFunctionPreview.previewSay("ERROR [P4O2F_SCORE_CLEANUP] id=" + id);
                    return AckStatus.Error;
                }
            } else {
                // Remove only our own request's receipt tags.
                player.execute("tag @s remove " + ACK_DONE + id);
                player.execute("tag @s remove " + ACK_ERROR + id);
            }
            MCFunctionPreview.previewSay((status == AckStatus.Done
                ? "INFO [P4O2D_ACK_DONE] " : "ERROR [P4O2D_ACK_ERROR] ") +
                name + " id=" + id + " poll=" + (attempt + 1));
            return status;
        }
        // A late server completion after timeout can still change world state.
        // Clear our PENDING participant; the pack may write a late terminal
        // receipt and independently expires Scoreboard results after 2 min.
        if (ackTransport == AckTransport.Scoreboard)
            resetScoreboardAck(id);
        MCFunctionPreview.previewSay("ERROR [P4O2D_ACK_TIMEOUT] " + name +
            " id=" + id + " after=" + ACK_POLL_LIMIT + " polls.");
        return AckStatus.Timeout;
    }

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
        if (inFlight) {
            MCFunctionPreview.previewSay("ERROR [P4O2D_ACK_BUSY] " + name);
            return;
        }
        lastId = "";
        lastReceipt = AckStatus.Rejected;
        if (receiptMode && readbackReady == 0) probeReadback();
        if (receiptMode && readbackReady != 1) {
            lastReceipt = AckStatus.Unsupported;
            MCFunctionPreview.previewSay("ERROR [P4O2D_ACK_NOT_VERIFIED] " + name);
            return;
        }
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
        lastId = requestId;
        if (receiptMode) {
            inFlight = true;
            if (ackTransport == AckTransport.Scoreboard) {
                // Arm this exact request; overwrites stale DONE/ERROR with PENDING.
                let fake = scoreFakePlayer(requestId);
                let cmd = "scoreboard players set " + fake + " " + SCORE_OBJECTIVE + " 0";
                let test = "scoreboard players test " + fake + " " + SCORE_OBJECTIVE + " 0 0";
                if (!player.execute(cmd) || !player.execute(test)) {
                    inFlight = false;
                    lastReceipt = AckStatus.Unsupported;
                    MCFunctionPreview.previewSay("ERROR [P4O2F_ARM_FAILED] id=" + requestId);
                    return;
                }
            } else {
                // Legacy TAG fallback: remove only this request's stale receipts.
                player.execute("tag @s remove " + ACK_DONE + requestId);
                player.execute("tag @s remove " + ACK_ERROR + requestId);
            }
        }
        // The single, tested P2c-4-style yield occurs before one batch,
        // NOT between individual commands; avoids fabricating a per-line delay.
        loops.pause(1);
        let eventId = receiptMode && ackTransport == AckTransport.Scoreboard
            ? SCORE_EVENT_ID : EVENT_ID;
        let submitted = player.execute("scriptevent " + eventId + " " + requestId + " " + plan);
        if (!submitted) {
            if (receiptMode && ackTransport == AckTransport.Scoreboard)
                resetScoreboardAck(requestId);
            inFlight = false;
            lastReceipt = AckStatus.SendFailed;
            MCFunctionPreview.previewSay("ERROR [P4O2C_SEND] " + name + " id=" + requestId);
            return;
        }
        lastReceipt = AckStatus.Submitted;
        if (receiptMode) {
            // This is synchronous waiting for a VERIFIED readback, not a callback
            // from ScriptEvent. Do not allow another request in this wait window.
            lastReceipt = waitReceipt(name, requestId);
            inFlight = false;
            return;
        }
        if (!introShown) {
            introShown = true;
            MCFunctionPreview.previewSay(
                "INFO [P4O2C_SUBMITTED] Non-ACK mode; use opt-in P4O2D readback for confirmation."
            );
        }
    }
}
