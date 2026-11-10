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
    // P4-ORDER-2H: the receiving player is the ACK score participant.
    // A per-request nonce prevents a late packet from becoming a fresh ACK.
    // Legacy 2F remains independently selectable and unchanged.
    const PLAYER_SCORE_EVENT_ID = "cbxp4o2h:batch";
    const PLAYER_ACK_OBJECTIVE = "cbxo2h";
    const PLAYER_NONCE_OBJECTIVE = "cbxo2hn";
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
        Scoreboard = 1,
        PlayerScoreboard = 2
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
    // Diagnostic only; OFF by default. No command or transport rewriting.
    let traceEnabled = false;
    export function setTraceEnabled(value: boolean): void { traceEnabled = value; }
    function trace(step: string, id: string): void {
        if (traceEnabled)
            MCFunctionPreview.previewSay("INFO [NATIVE_TRACE] " + step + " id=" + id);
    }
    const ACK_DONE = "cbxo2d_done_";
    const ACK_ERROR = "cbxo2d_error_";
    const ACK_POLL_PAUSE = 100;
    const ACK_POLL_LIMIT = 13; // first quick poll + 12 standard fallback polls

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
        if (ackTransport == AckTransport.PlayerScoreboard) return probePlayerScoreboardReadback();
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

    // Keep arithmetic exact in JS Number and the MakeCode TypeScript subset.
    // A nonzero 31-bit request code is written to the actual player, not to a
    // world-global fake participant. This is an anti-stale marker, not a secret.
    function playerRequestCode(id: string): number {
        let n = 0;
        for (let i = 0; i < id.length; i++) {
            n = (n * 31 + id.charCodeAt(i)) % 2147483647;
        }
        return n == 0 ? 1 : n;
    }

    /** Require actual @s score readback before enabling player-scoped ACK.
     * This test never touches the old cbxo2f fake-player objective. */
    function probePlayerScoreboardReadback(): boolean {
        let a = PLAYER_ACK_OBJECTIVE;
        let n = PLAYER_NONCE_OBJECTIVE;
        player.execute("scoreboard players reset @s " + a);
        player.execute("scoreboard players reset @s " + n);
        let absent = !player.execute("scoreboard players test @s " + a + " 0 3");
        let pendingSet = player.execute("scoreboard players set @s " + a + " 0");
        let pending = player.execute("scoreboard players test @s " + a + " 0 0");
        let doneSet = player.execute("scoreboard players set @s " + a + " 2");
        let done = player.execute("scoreboard players test @s " + a + " 2 2");
        let errorSet = player.execute("scoreboard players set @s " + a + " 3");
        let error = player.execute("scoreboard players test @s " + a + " 3 3");
        let codeSet = player.execute("scoreboard players set @s " + n + " 1234567");
        let codeRead = player.execute("scoreboard players test @s " + n + " 1234567 1234567");
        let clearedA = player.execute("scoreboard players reset @s " + a) &&
            !player.execute("scoreboard players test @s " + a + " 0 3");
        let clearedN = player.execute("scoreboard players reset @s " + n) &&
            !player.execute("scoreboard players test @s " + n + " 1234567 1234567");
        let good = absent && pendingSet && pending && doneSet && done &&
            errorSet && error && codeSet && codeRead && clearedA && clearedN;
        readbackReady = good ? 1 : -1;
        MCFunctionPreview.previewSay(good
            ? "INFO [P4O2H_PLAYER_SCORE_PASS] @s receipt and nonce both verified."
            : "ERROR [P4O2H_PLAYER_SCORE_FAIL] Player-scoped ACK disabled.");
        return good;
    }

    function readPlayerScoreboardAck(id: string): AckStatus {
        let code = playerRequestCode(id);
        let check = "scoreboard players test @s " + PLAYER_NONCE_OBJECTIVE + " " + code + " " + code;
        if (!player.execute(check)) {
            MCFunctionPreview.previewSay("ERROR [P4O2H_NONCE_MISMATCH] id=" + id);
            return AckStatus.Error;
        }
        let base = "scoreboard players test @s " + PLAYER_ACK_OBJECTIVE + " ";
        if (player.execute(base + "2 2")) return AckStatus.Done;
        if (player.execute(base + "3 3")) return AckStatus.Error;
        if (player.execute(base + "0 0")) return AckStatus.Submitted;
        MCFunctionPreview.previewSay("ERROR [P4O2H_UNKNOWN_PLAYER_SCORE] id=" + id);
        return AckStatus.Error;
    }

    function resetPlayerScoreboardAck(): boolean {
        let a = PLAYER_ACK_OBJECTIVE;
        let n = PLAYER_NONCE_OBJECTIVE;
        let removedA = player.execute("scoreboard players reset @s " + a);
        let removedN = player.execute("scoreboard players reset @s " + n);
        let clearedA = !player.execute("scoreboard players test @s " + a + " 0 3");
        let clearedN = !player.execute("scoreboard players test @s " + n + " 0 2147483647");
        return removedA && removedN && clearedA && clearedN;
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
        if (ackTransport == AckTransport.PlayerScoreboard) return readPlayerScoreboardAck(id);
        let done = player.execute("testfor @s[tag=" + ACK_DONE + id + "]");
        let error = player.execute("testfor @s[tag=" + ACK_ERROR + id + "]");
        if (done && error) return AckStatus.Error; // conflicting ACK => never accept as DONE
        if (error) return AckStatus.Error;
        if (done) return AckStatus.Done;
        return AckStatus.Submitted;
    }

    function waitReceipt(name: string, id: string): AckStatus {
        for (let attempt = 0; attempt < ACK_POLL_LIMIT; attempt++) {
            // Try the first receipt sooner without weakening the previous
            // timeout policy. If a receipt is not ready, fall back to 100ms.
            loops.pause(attempt == 0 ? 1 : ACK_POLL_PAUSE);
            let status = readAck(id);
            if (status == AckStatus.Submitted) continue;
            if (ackTransport == AckTransport.Scoreboard) {
                if (!resetScoreboardAck(id)) {
                    MCFunctionPreview.previewSay("ERROR [P4O2F_SCORE_CLEANUP] id=" + id);
                    return AckStatus.Error;
                }
            } else if (ackTransport == AckTransport.PlayerScoreboard) {
                if (!resetPlayerScoreboardAck()) {
                    MCFunctionPreview.previewSay("ERROR [P4O2H_SCORE_CLEANUP] id=" + id);
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
        else if (ackTransport == AckTransport.PlayerScoreboard)
            resetPlayerScoreboardAck();
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
        trace("SUBMIT_ENTER " + name, "pending");
        if (inFlight) {
            MCFunctionPreview.previewSay("ERROR [P4O2D_ACK_BUSY] " + name);
            return;
        }
        lastId = "";
        lastReceipt = AckStatus.Rejected;
        if (receiptMode && readbackReady == 0) {
            trace("CALIBRATE_BEGIN", "pending");
            probeReadback();
            trace("CALIBRATE_RETURN", "pending");
        }
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
        trace("PLAN_READY", requestId);
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
            } else if (ackTransport == AckTransport.PlayerScoreboard) {
                // Two player-identity scores: PENDING and a request-specific code.
                // No global fake-player slot. Do not send unless both arm checks pass.
                let code = playerRequestCode(requestId);
                let armN = "scoreboard players set @s " + PLAYER_NONCE_OBJECTIVE + " " + code;
                let testN = "scoreboard players test @s " + PLAYER_NONCE_OBJECTIVE + " " + code + " " + code;
                let armA = "scoreboard players set @s " + PLAYER_ACK_OBJECTIVE + " 0";
                let testA = "scoreboard players test @s " + PLAYER_ACK_OBJECTIVE + " 0 0";
                if (!player.execute(armN) || !player.execute(testN) ||
                    !player.execute(armA) || !player.execute(testA)) {
                    resetPlayerScoreboardAck();
                    inFlight = false;
                    lastReceipt = AckStatus.Unsupported;
                    MCFunctionPreview.previewSay("ERROR [P4O2H_ARM_FAILED] id=" + requestId);
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
        trace("BEFORE_YIELD", requestId);
        loops.pause(1);
        let eventId = EVENT_ID;
        if (receiptMode && ackTransport == AckTransport.Scoreboard)
            eventId = SCORE_EVENT_ID;
        if (receiptMode && ackTransport == AckTransport.PlayerScoreboard)
            eventId = PLAYER_SCORE_EVENT_ID;
        trace("SEND_BEGIN", requestId);
        let submitted = player.execute("scriptevent " + eventId + " " + requestId + " " + plan);
        trace(submitted ? "SEND_RETURN_TRUE" : "SEND_RETURN_FALSE", requestId);
        if (!submitted) {
            if (receiptMode && ackTransport == AckTransport.Scoreboard)
                resetScoreboardAck(requestId);
            else if (receiptMode && ackTransport == AckTransport.PlayerScoreboard)
                resetPlayerScoreboardAck();
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
            trace("RECEIPT_RETURN status=" + lastReceipt, requestId);
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
