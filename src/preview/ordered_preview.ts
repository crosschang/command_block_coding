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
    const CHUNK_BEGIN = "cbxp4o2h:begin";
    const CHUNK_PART = "cbxp4o2h:part";
    const CHUNK_COMMIT = "cbxp4o2h:commit";
    const CHUNK_CHARS = 96;
    const MAX_NATIVE_CHARS = 200; // experimental transport cap, not a game limit
    const HEX = "0123456789abcdef";
    const LEGACY_MAX_STEPS = 12;
    const LEGACY_MAX_PACKET = 1400;
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
        Busy = 8,
        // Receiver returned successCount=0, without an API exception.
        // Not DONE and not proof that an EXECUTE condition was false.
        ZeroResult = 9
    }


    /** ACK receipt transport is Preview-only, never part of command AST. */
    export enum AckTransport {
        Tag = 0,
        Scoreboard = 1,
        PlayerScoreboard = 2
    }

    let ackTransport = AckTransport.Tag;
    export function setAckTransport(value: AckTransport): void {
        if (inFlight) return;
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
        if (inFlight) return;
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
        let absent = !player.execute("scoreboard players test @s " + a + " 0 9");
        let pendingSet = player.execute("scoreboard players set @s " + a + " 0");
        let pending = player.execute("scoreboard players test @s " + a + " 0 0");
        let doneSet = player.execute("scoreboard players set @s " + a + " 2");
        let done = player.execute("scoreboard players test @s " + a + " 2 2");
        let errorSet = player.execute("scoreboard players set @s " + a + " 3");
        let error = player.execute("scoreboard players test @s " + a + " 3 3");
        let zeroSet = player.execute("scoreboard players set @s " + a + " 9");
        let zero = player.execute("scoreboard players test @s " + a + " 9 9");
        let zeroNotDone = !player.execute("scoreboard players test @s " + a + " 2 2");
        let zeroNotError = !player.execute("scoreboard players test @s " + a + " 3 3");
        let codeSet = player.execute("scoreboard players set @s " + n + " 1234567");
        let codeRead = player.execute("scoreboard players test @s " + n + " 1234567 1234567");
        let clearedA = player.execute("scoreboard players reset @s " + a) &&
            !player.execute("scoreboard players test @s " + a + " 0 9");
        let clearedN = player.execute("scoreboard players reset @s " + n) &&
            !player.execute("scoreboard players test @s " + n + " 1234567 1234567");
        let good = absent && pendingSet && pending && doneSet && done &&
            errorSet && error && zeroSet && zero && zeroNotDone && zeroNotError &&
            codeSet && codeRead && clearedA && clearedN;
        readbackReady = good ? 1 : -1;
        MCFunctionPreview.previewSay(good
            ? "INFO [P4O2H_PLAYER_SCORE_PASS] @s receipt 0/2/3/9 and nonce verified."
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
        if (player.execute(base + "9 9")) return AckStatus.ZeroResult;
        if (player.execute(base + "0 0")) return AckStatus.Submitted;
        MCFunctionPreview.previewSay("ERROR [P4O2H_UNKNOWN_PLAYER_SCORE] id=" + id);
        return AckStatus.Error;
    }

    function resetPlayerScoreboardAck(): boolean {
        let a = PLAYER_ACK_OBJECTIVE;
        let n = PLAYER_NONCE_OBJECTIVE;
        let removedA = player.execute("scoreboard players reset @s " + a);
        let removedN = player.execute("scoreboard players reset @s " + n);
        let clearedA = !player.execute("scoreboard players test @s " + a + " 0 2147483647");
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
                ? "INFO [P4O2D_ACK_DONE] " : status == AckStatus.ZeroResult
                ? "WARNING [P4O2H_ACK_ZERO_RESULT] " : "ERROR [P4O2D_ACK_ERROR] ") +
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
        // Zero means no configured command-count cap on the chunked player-ACK route.
        return receiptMode && ackTransport == AckTransport.PlayerScoreboard ? 0 : LEGACY_MAX_STEPS;
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

    // Stored diagnostics only: reading these does not query the game clock.
    let clockStage = "NOT_ENTERED";
    let clockTick = -1;
    export function lastClockStage(): string { return clockStage; }
    export function lastClockTick(): number { return clockTick; }
    function clockMark(stage: string): void {
        clockStage = stage + "_CLOCK_WAIT";
        clockTick = gameplay.timeQuery(TimeQuery.GameTime);
        clockStage = stage;
    }
    function chunkFailure(status: AckStatus, reason: string): void {
        lastReceipt = status;
        MCFunctionPreview.previewSay("ERROR [P4O2H_CHUNK_" + reason + "] id=" + lastId);
        inFlight = false;
    }
    function sendChunkFrame(command: string): boolean {
        if (command.length > MAX_NATIVE_CHARS) {
            chunkFailure(AckStatus.Rejected, "FRAME_LIMIT");
            return false;
        }
        if (!player.execute(command)) {
            // No fallback/resend after an uncertain transfer, including commit.
            chunkFailure(AckStatus.SendFailed, "SEND_FAILED");
            return false;
        }
        return true;
    }
    function chunkHash(plan: string): number {
        let n = 0;
        for (let i = 0; i < plan.length; i++) n = (n * 31 + plan.charCodeAt(i)) % 2147483647;
        return n;
    }
    /** Freeze all canonical command strings before the first clock/native yield.
     * Later edits to AST objects cannot change an assembling request.
     * World selectors/scores are still evaluated by Minecraft at execution time. */
    function submitChunk(name: string, nodes: MCFunctionAST.CommandNode[]): void {
        if (inFlight) {
            MCFunctionPreview.previewSay("ERROR [P4O2D_ACK_BUSY] " + name);
            return;
        }
        inFlight = true;
        lastId = "";
        lastReceipt = AckStatus.Rejected;
        if (!nodes || nodes.length == 0) {
            chunkFailure(AckStatus.Rejected, "STEP_LIMIT");
            return;
        }
        let lines: string[] = [];
        for (let i = 0; i < nodes.length; i++) {
            let issues = MCFunctionValidator.validateCommand(nodes[i]);
            if (MCFunctionValidator.hasError(issues)) {
                chunkFailure(AckStatus.Rejected, "VALIDATION");
                return;
            }
            let line = MCFunctionCompiler.compileCommand(nodes[i]);
            if (!line || line != line.trim() || line.charAt(0) == "/" ||
                line.indexOf("\n") >= 0 || line.indexOf("\r") >= 0 ||
                line.indexOf("\u0000") >= 0 || line.indexOf("@initiator") >= 0) {
                chunkFailure(AckStatus.Rejected, "BAD_LINE");
                return;
            }
            // Only a full line beginning # is a mcfunction comment.
            // Embedded # (fake player names etc.) is preserved verbatim.
            if (line.charAt(0) == "#") continue;
            lines.push(line);
        }
        if (lines.length == 0) {
            chunkFailure(AckStatus.Rejected, "EMPTY");
            return;
        }
        clockMark("ENTER");
        let plan = "";
        for (let i = 0; i < lines.length; i++) {
            if (i > 0) plan += ".";
            plan += encodeUtf16(lines[i]);
        }
        let hash = chunkHash(plan);
        sequence++;
        if (sequence > 999999) sequence = 1;
        let id = "q" + sessionToken + "_" + sequence;
        lastId = id;
        clockMark("PLAN_READY");
        if (readbackReady == 0) probePlayerScoreboardReadback();
        if (readbackReady != 1) {
            chunkFailure(AckStatus.Unsupported, "READBACK");
            return;
        }
        let code = playerRequestCode(id);
        if (!sendChunkFrame("scoreboard players set @s " + PLAYER_NONCE_OBJECTIVE + " " + code)) return;
        if (!sendChunkFrame("scoreboard players test @s " + PLAYER_NONCE_OBJECTIVE + " " + code + " " + code)) return;
        if (!sendChunkFrame("scoreboard players set @s " + PLAYER_ACK_OBJECTIVE + " 0")) return;
        if (!sendChunkFrame("scoreboard players test @s " + PLAYER_ACK_OBJECTIVE + " 0 0")) return;
        clockMark("PREPARED");
        let count = Math.ceil(plan.length / CHUNK_CHARS);
        if (!sendChunkFrame("scriptevent " + CHUNK_BEGIN + " " + id + " " + count + " " + plan.length + " " + hash)) return;
        for (let i = 0; i < count; i++) {
            if (!sendChunkFrame("scriptevent " + CHUNK_PART + " " + id + " " + i + " " + plan.substr(i * CHUNK_CHARS, CHUNK_CHARS))) return;
        }
        if (!sendChunkFrame("scriptevent " + CHUNK_COMMIT + " " + id)) return;
        lastReceipt = AckStatus.Submitted;
        clockMark("TRANSFER_RETURN");
        clockMark("VERIFY_ENTER");
        lastReceipt = waitReceipt(name, id);
        clockMark("VERIFY_EXIT");
        inFlight = false;
    }

    /** Fail closed; no fallback to per-line execution after an uncertain submit. */
    export function submit(name: string, nodes: MCFunctionAST.CommandNode[]): void {
        if (receiptMode && ackTransport == AckTransport.PlayerScoreboard) {
            submitChunk(name, nodes);
            return;
        }
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
        if (nodes.length > LEGACY_MAX_STEPS) {
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
            if (plan.length > LEGACY_MAX_PACKET) {
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
        let frame = "scriptevent " + eventId + " " + requestId + " " + plan;
        if (frame.length > MAX_NATIVE_CHARS) {
            inFlight = false;
            lastReceipt = AckStatus.Rejected;
            MCFunctionPreview.previewSay("ERROR [P4O2C_LEGACY_FRAME_LIMIT] Use player ACK chunk transport.");
            return;
        }
        trace("SEND_BEGIN", requestId);
        let submitted = player.execute(frame);
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
