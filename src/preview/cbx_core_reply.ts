/**
 * CBXCORE unified Minecraft Education MakeCode transport and reply adapter.
 * Integration target: crosschang/command_block_coding pxt.json 0.0.91.
 *
 * The Command AST, Validator and Compiler stay canonical. This module is an
 * optional RUNTIME transport only; it never changes exported .mcfunction lines.
 * All calls require the separate CBXCORE development Behavior Pack.
 *
 * Important: testfor/@s boolean return was empirically tested in Education
 * CBX13-CBX16, but this code still needs real PXT and game integration tests.
 */
namespace MCFunctionCBXCore {
    const MAX_COMMAND_LENGTH = 300;
    const MAX_OBJECTIVE_LENGTH = 64;
    const HEX_DIGITS = "0123456789abcdef";
    let sequence = 0;
    let calibrated = false;

    /** Handle for one outstanding server request (not a successful result). */
    export class Ticket {
        token: string;
        submitted: boolean;
        startedTick: number;
        errorStatus: string;
        constructor(token: string, submitted: boolean, startedTick: number, errorStatus: string) {
            this.token = token;
            this.submitted = submitted;
            this.startedTick = startedTick;
            this.errorStatus = errorStatus;
        }
    }

    /** Status and type MUST be checked before using any value or successCount. */
    export class Reply {
        received: boolean;
        ok: boolean;
        numeric: boolean;
        value: number;
        boolValue: boolean;
        status: string;
        elapsedTicks: number;
        constructor() {
            this.received = false;
            this.ok = false;
            this.numeric = false;
            this.value = 0;
            this.boolValue = false;
            this.status = "NOT_RECEIVED";
            this.elapsedTicks = -1;
        }
    }

    function failedTicket(code: string): Ticket {
        return new Ticket("", false, gameplay.timeQuery(TimeQuery.GameTime), code);
    }

    function hexEncode(value: string): string {
        let hex = "";
        for (let i = 0; i < value.length; i++) {
            let code = value.charCodeAt(i);
            hex += HEX_DIGITS.charAt(Math.floor(code / 4096)) +
                HEX_DIGITS.charAt(Math.floor(code / 256) % 16) +
                HEX_DIGITS.charAt(Math.floor(code / 16) % 16) +
                HEX_DIGITS.charAt(code % 16);
        }
        return hex;
    }

    function validCommand(line: string): boolean {
        return !!line && line.length <= MAX_COMMAND_LENGTH &&
            line === line.trim() && line.charAt(0) !== "/" &&
            line.indexOf("\n") < 0 && line.indexOf("\r") < 0 &&
            line.indexOf("\u0000") < 0;
    }

    function token(): string {
        sequence++;
        if (sequence > 9999) sequence = 1;
        // Only digits, lowercase letters and x: safe for Minecraft tag names.
        return "cbxcn" + gameplay.timeQuery(TimeQuery.GameTime) + "x" +
            sequence + "x" + Math.randomRange(100000, 999999);
    }

    function submit(customToken: string, operation: string, arg: string): Ticket {
        let started = gameplay.timeQuery(TimeQuery.GameTime);
        let submitted = player.execute("scriptevent cbxcore:req " +
            customToken + "|" + operation + "|" + arg);
        return new Ticket(customToken, submitted, started,
            submitted ? "" : "SEND_FAILED");
    }

    /** Separate ping: check CBXCORE PING_OK in game chat. */
    export function ping(): boolean {
        return player.execute("scriptevent cbxcore:ping MAKECODE");
    }

    /** Calibrate host's testfor boolean before trusting any tag packet. */
    export function calibrate(): boolean {
        let positive = player.execute("testfor @s");
        let negative = player.execute("testfor @s[tag=cbxcore_never_exists_712489]");
        calibrated = positive && !negative;
        MCFunctionPreview.previewSay("CBXCORE CAL positive=" + positive +
            " negative=" + negative + " usable=" + calibrated);
        return calibrated;
    }

    export function isCalibrated(): boolean { return calibrated; }

    /**
     * Fire-and-forget transport for preexisting Command.* blocks.
     * Submission=true is NOT actual command success; CBXCORE logs are authoritative.
     */
    export function fireCompiled(compiled: string): boolean {
        if (!validCommand(compiled)) {
            MCFunctionPreview.previewSay("ERROR [CBXCORE_BAD_COMMAND] invalid length/line");
            return false;
        }
        let submitted = player.execute("scriptevent cbxcore:exec_hex " + hexEncode(compiled));
        if (!submitted) {
            MCFunctionPreview.previewSay("WARNING [CBXCORE_SEND] script event not submitted");
        }
        return submitted;
    }

    /**
     * Experimental wire-only selective escaping. PXT must never see a literal @
     * in the scriptevent payload; the Behavior Pack decodes it before runCommand.
     * Percent is escaped FIRST, so a pre-existing "%40" remains literal.
     * Non-ASCII UTF-16 code units use %uXXXX to avoid lossy transports.
     * Does not change AST/Compiler/.mcfunction content.
     */
    export function encodeSelective(line: string): string {
        let out = "";
        for (let i = 0; i < line.length; i++) {
            let c = line.charAt(i);
            let n = line.charCodeAt(i);
            if (c === "%") out += "%25";
            else if (c === "@") out += "%40";
            else if (c === "|") out += "%7c";
            else if (n < 32 || n > 126) {
                out += "%u" + HEX_DIGITS.charAt(Math.floor(n / 4096)) +
                    HEX_DIGITS.charAt(Math.floor(n / 256) % 16) +
                    HEX_DIGITS.charAt(Math.floor(n / 16) % 16) +
                    HEX_DIGITS.charAt(n % 16);
            } else out += c;
        }
        return out;
    }

    export function fireCompiledSelective(compiled: string): boolean {
        if (!validCommand(compiled)) {
            MCFunctionPreview.previewSay("ERROR [CBXHY_BAD_COMMAND] invalid length/line");
            return false;
        }
        let encoded = encodeSelective(compiled);
        if (encoded.length > 1260) {
            MCFunctionPreview.previewSay("ERROR [CBXHY_WIRE_TOO_LONG] length=" + encoded.length);
            return false;
        }
        let submitted = player.execute("scriptevent cbxhy:select " + encoded);
        if (!submitted) MCFunctionPreview.previewSay("WARNING [CBXHY_SEND_FAILED]");
        return submitted;
    }

    /** Canonical AST validation and compilation, then request an ACK-able receipt. */
    export function requestCommand(command: MCFunctionAST.CommandNode): Ticket {
        if (!command) return failedTicket("MISSING_AST");
        let issues = MCFunctionValidator.validateCommand(command);
        if (MCFunctionValidator.hasError(issues)) return failedTicket("VALIDATION_ERROR");
        let line = MCFunctionCompiler.compileCommand(command);
        if (!validCommand(line)) return failedTicket("BAD_COMMAND");
        return submit(token(), "exec", hexEncode(line));
    }

    /**
     * Experimental ACK-able request that shares the same AST/Validator/Compiler
     * and CBX16 ticket/wait protocol, but avoids full 4x HEX inflation.
     * Original requestRawCommand() remains untouched for A/B baseline.
     */
    export function requestRawCommandSelective(line: string): Ticket {
        let ast = MCFunctionBlocks.createRawCommand(line);
        let issues = MCFunctionValidator.validateCommand(ast);
        if (MCFunctionValidator.hasError(issues)) return failedTicket("VALIDATION_ERROR");
        let compiled = MCFunctionCompiler.compileCommand(ast);
        if (!validCommand(compiled)) return failedTicket("BAD_COMMAND");
        let encoded = encodeSelective(compiled);
        // Reserve envelope space for token|exec_sel|, within the pack's cap.
        if (encoded.length > 1200) return failedTicket("SELECTIVE_WIRE_TOO_LONG");
        return submit(token(), "exec_sel", encoded);
    }

    /** User-authored text is retained as RawCommand AST before compilation. */
    export function requestRawCommand(line: string): Ticket {
        return requestCommand(MCFunctionBlocks.createRawCommand(line));
    }

    /** A player-specific scoreboard objective, sent HEX to preserve user IDs. */
    export function requestScore(objectiveId: string): Ticket {
        if (!objectiveId || objectiveId.length > MAX_OBJECTIVE_LENGTH ||
            objectiveId.indexOf("\n") >= 0 || objectiveId.indexOf("\r") >= 0 ||
            objectiveId.indexOf("\u0000") >= 0) return failedTicket("BAD_OBJECTIVE");
        return submit(token(), "score", hexEncode(objectiveId));
    }

    /** For two players to intentionally send the SAME token in isolation test. */
    export function requestScoreWithSeed(objectiveId: string, seed: number): Ticket {
        if (!objectiveId || objectiveId.length > MAX_OBJECTIVE_LENGTH ||
            objectiveId.indexOf("\n") >= 0 || objectiveId.indexOf("\r") >= 0 ||
            objectiveId.indexOf("\u0000") >= 0 ||
            seed < 1 || seed > 999999 || seed % 1 !== 0) return failedTicket("BAD_SEED_OR_OBJECTIVE");
        return submit("cbxcn424242x1x" + seed, "score", hexEncode(objectiveId));
    }

    /** Limited to the rule proven by CBX13-CBX16, not a fake generic gamerule API. */
    export function requestKeepInventory(): Ticket {
        return submit(token(), "rule", "keepInventory");
    }

    export function requestDaytime(): Ticket {
        return submit(token(), "time", "daytime");
    }

    /** Diagnostic requests; not required for production Minecraft commands. */
    export function requestBooleanForTest(value: boolean): Ticket {
        return submit(token(), "bool", value ? "true" : "false");
    }
    export function requestNumberForTest(value: number): Ticket {
        return submit(token(), "num", "" + value);
    }
    export function requestDelayForTest(ticks: number): Ticket {
        return submit(token(), "delay", "" + ticks);
    }
    export function requestExpectedErrorForTest(): Ticket {
        return submit(token(), "error", "expected");
    }

    export function ack(ticket: Ticket): boolean {
        return !!ticket && !!ticket.token &&
            player.execute("scriptevent cbxcore:ack " + ticket.token);
    }
    export function cancel(ticket: Ticket): boolean {
        return !!ticket && !!ticket.token &&
            player.execute("scriptevent cbxcore:cancel " + ticket.token);
    }
    export function stats(): boolean {
        return player.execute("scriptevent cbxcore:stats MAKECODE");
    }

    /** Exactly this token's reply tags, not a global tag reset. */
    export function hasReplyMarker(ticket: Ticket): boolean {
        return !!ticket && !!ticket.token && testTag(ticket.token + "_done");
    }

    function testTag(tag: string): boolean {
        return player.execute("testfor @s[tag=" + tag + "]");
    }

    /**
     * Wait on the previously proven testfor/tag channel. ACK only after read.
     * timeout => CANCEL, never treat an unavailable value as numeric zero.
     */
    export function wait(ticket: Ticket, maxPolls: number): Reply {
        let reply = new Reply();
        if (!ticket) { reply.status = "MISSING_TICKET"; return reply; }
        if (!ticket.submitted) {
            reply.status = ticket.errorStatus || "SEND_FAILED";
            return reply;
        }
        if (!calibrated) { reply.status = "NOT_CALIBRATED"; cancel(ticket); return reply; }
        let polls = maxPolls;
        if (polls < 1) polls = 1;
        if (polls > 100) polls = 100;
        let done = false;
        for (let n = 0; n < polls; n++) {
            loops.pause(50);
            if (testTag(ticket.token + "_done")) { done = true; break; }
        }
        reply.elapsedTicks = gameplay.timeQuery(TimeQuery.GameTime) - ticket.startedTick;
        if (!done) {
            reply.status = "TIMEOUT";
            cancel(ticket);
            return reply;
        }
        reply.received = true;
        if (testTag(ticket.token + "_err")) {
            reply.status = "SERVER_ERROR";
            ack(ticket);
            return reply;
        }
        reply.numeric = testTag(ticket.token + "_n");
        if (reply.numeric) {
            let zero = testTag(ticket.token + "_z");
            let w4 = testTag(ticket.token + "_w4");
            let w8 = testTag(ticket.token + "_w8");
            let w12 = testTag(ticket.token + "_w12");
            let w15 = testTag(ticket.token + "_w15");
            let negative = testTag(ticket.token + "_neg");
            let widths = (w4 ? 1 : 0) + (w8 ? 1 : 0) +
                (w12 ? 1 : 0) + (w15 ? 1 : 0);
            let bits = w4 ? 4 : (w8 ? 8 : (w12 ? 12 : 15));
            if ((zero && widths !== 0) || (!zero && widths !== 1) ||
                (zero && negative) || testTag(ticket.token + "_t") ||
                testTag(ticket.token + "_f")) {
                reply.status = "INVALID_NUMBER_PACKET";
            } else {
                let magnitude = 0;
                let place = 1;
                if (!zero) {
                    for (let b = 0; b < bits; b++) {
                        if (testTag(ticket.token + "_b" + b)) magnitude += place;
                        place *= 2;
                    }
                }
                if (!zero && magnitude === 0) reply.status = "INVALID_ZERO_PACKET";
                else {
                    reply.value = negative ? -magnitude : magnitude;
                    reply.ok = true;
                    reply.status = "OK";
                }
            }
        } else {
            let t = testTag(ticket.token + "_t");
            let f = testTag(ticket.token + "_f");
            if (t !== f) {
                reply.boolValue = t;
                reply.ok = true;
                reply.status = "OK";
            } else reply.status = "INVALID_BOOLEAN_PACKET";
        }
        ack(ticket);
        reply.elapsedTicks = gameplay.timeQuery(TimeQuery.GameTime) - ticket.startedTick;
        return reply;
    }
}
