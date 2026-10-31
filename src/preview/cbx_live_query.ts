/**
 * P2b FAST: nonblocking live readback for Minecraft Education MakeCode.
 * This is Preview-only runtime metadata, NEVER a Minecraft Command AST node.
 * P2b tag readback was observed in-game; FAST codec requires new game verification.
 *
 * V3 wire cbxq3; requires P2b FAST lab pack (not old cbxq2 pack).
 * Fast64 alphabet, ASCII7, full UTF-16; scalar numbers/booleans have dedicated wire.
 * Two-phase contract (no worker / loops.pause / busy wait):
 *   ticket = request(kind, page);
 *   // In a later player.onChat callback or other user event:
 *   result = tryRead(ticket);
 * Readback is explicitly bounded to two UTF-16 strings of <=32 code units each.
 * It relies on calibrated player.execute("testfor @s[tag=...]")
 * boolean behavior, NOT direct text extraction from game chat.
 */
//% color=#477D95 weight=92 icon="\uf002" block="LIVE QUERY"
namespace MCFunctionLiveQuery {
    const MAX_PAGE = 99;
    const PAGE_SIZE = 2;
    const MAX_UNITS = 32;
    const MAX_WAIT_TICKS = 1200;
    let seq = 0;
    let calibrated = false;
    let probeCalls = 0;
    // The compact 64-symbol alphabet covers normal ID, objective, tag and user names.
    const FAST_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789_-ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    export enum Kind {
        //% block="online players (/list)"
        Players = 0,
        //% block="scoreboard objectives"
        Objectives = 1,
        //% block="scoreboard participants"
        Participants = 2,
        //% block="my tags"
        MyTags = 3,
        //% block="daytime"
        Daytime = 4,
        //% block="keepInventory gamerule"
        KeepInventory = 5
    }

    export class Ticket {
        token: string;
        kind: Kind;
        page: number;
        started: number;
        sent: boolean;
        closed: boolean;
        failure: string;
        constructor(token: string, kind: Kind, page: number, sent: boolean, failure: string) {
            this.token = token;
            this.kind = kind;
            this.page = page;
            this.started = gameplay.timeQuery(TimeQuery.GameTime);
            this.sent = sent;
            this.closed = false;
            this.failure = failure;
        }
    }
    export class Result {
        status: string;
        ready: boolean;
        ok: boolean;
        total: number;
        items: string[];
        numberValue: number;
        booleanValue: boolean;
        probeCalls: number;
        readTicks: number;
        kind: Kind;
        page: number;
        constructor(kind: Kind, page: number) {
            this.kind = kind;
            this.page = page;
            this.status = "PENDING";
            this.ready = false;
            this.ok = false;
            this.total = 0;
            this.items = [];
            this.numberValue = 0;
            this.booleanValue = false;
            this.probeCalls = 0;
            this.readTicks = 0;
        }
    }

    function sourceToken(): string {
        seq++;
        if (seq > 9999) seq = 1;
        return "cbxq3" + gameplay.timeQuery(TimeQuery.GameTime) + "x" + seq + "x" +
            (Math.floor(Math.random() * 900000) + 100000);
    }
    function validPage(page: number): boolean {
        return page >= 0 && page <= MAX_PAGE && page % 1 == 0;
    }
    function op(kind: Kind): string {
        if (kind == Kind.Players) return "players";
        if (kind == Kind.Objectives) return "objectives";
        if (kind == Kind.Participants) return "participants";
        if (kind == Kind.MyTags) return "tags_self";
        if (kind == Kind.Daytime) return "time_daytime";
        if (kind == Kind.KeepInventory) return "rule_keepinventory";
        return "";
    }
    function probe(tag: string): boolean {
        probeCalls++;
        return player.execute("testfor @s[tag=" + tag + "]");
    }
    function bits(prefix: string, width: number): number {
        let result = 0;
        let power = 1;
        for (let bit = 0; bit < width; bit++) {
            if (probe(prefix + bit)) result += power;
            power *= 2;
        }
        return result;
    }
    function checksum(items: string[], total: number, page: number): number {
        let sum = (total + page * 17 + items.length * 19) % 256;
        for (let i = 0; i < items.length; i++) {
            let value = items[i];
            sum = (sum * 31 + value.length) % 256;
            for (let j = 0; j < value.length; j++) sum = (sum * 31 + value.charCodeAt(j)) % 256;
        }
        return sum;
    }
    function ack(ticket: Ticket): void {
        player.execute("scriptevent cbxq3:ack " + ticket.token);
        ticket.closed = true;
    }

    /** Test the Boolean testfor transport before receiving any UTF-16 packet. */
    //% blockId=cbxq2_calibrate
    //% block="LIVE QUERY calibrate tag channel"
    //% weight=100
    export function calibrate(): boolean {
        let yes = player.execute("testfor @s");
        let no = player.execute("testfor @s[tag=cbxq2_absent_marker_819273]");
        calibrated = yes && !no;
        return calibrated;
    }
    //% blockId=cbxq2_ping
    //% block="LIVE QUERY ping behavior pack"
    //% weight=95
    export function ping(): boolean {
        return player.execute("scriptevent cbxq3:ping MAKECODE");
    }

    /** Requests a snapshot. No read or waiting occurs in this call. */
    //% blockId=cbxq2_begin
    //% block="LIVE QUERY request $kind page $page"
    //% page.defl=0
    //% weight=90
    export function request(kind: Kind, page: number): Ticket {
        if (!validPage(page) || op(kind).length == 0) {
            return new Ticket("", kind, page, false, "BAD_ARGUMENT");
        }
        if ((kind == Kind.Daytime || kind == Kind.KeepInventory) && page != 0) {
            return new Ticket("", kind, page, false, "SCALAR_PAGE_NOT_ZERO");
        }
        let token = sourceToken();
        let sent = player.execute("scriptevent cbxq3:req " + token + "|" + op(kind) + "|" + page);
        return new Ticket(token, kind, page, sent, sent ? "" : "SEND_FAILED");
    }

    /** One bounded read; the value is ready before this is called. */
    function completed(result: Result, ticket: Ticket, started: number): Result {
        ack(ticket);
        result.probeCalls = probeCalls;
        result.readTicks = gameplay.timeQuery(TimeQuery.GameTime) - started;
        return result;
    }

    /** Reads only an ALREADY READY snapshot. No poll, pause, or background worker. */
    //% blockId=cbxq2_tryread
    //% block="LIVE QUERY read $ticket now"
    //% weight=85
    export function tryRead(ticket: Ticket): Result {
        let result = new Result(ticket ? ticket.kind : Kind.Players, ticket ? ticket.page : 0);
        if (!ticket) { result.status = "MISSING_TICKET"; return result; }
        if (ticket.closed) { result.status = "ALREADY_CLOSED"; return result; }
        if (!ticket.sent) { result.status = ticket.failure || "NOT_SENT"; return result; }
        if (!calibrated) { result.status = "NOT_CALIBRATED"; return result; }
        probeCalls = 0;
        let started = gameplay.timeQuery(TimeQuery.GameTime);
        if (!probe(ticket.token + "_r")) {
            result.probeCalls = probeCalls;
            result.readTicks = gameplay.timeQuery(TimeQuery.GameTime) - started;
            if (gameplay.timeQuery(TimeQuery.GameTime) - ticket.started > MAX_WAIT_TICKS) {
                result.status = "EXPIRED";
                cancel(ticket);
            }
            return result;
        }
        result.ready = true;
        if (probe(ticket.token + "_e")) {
            result.status = "SERVER_ERROR";
            return completed(result, ticket, started);
        }
        let base = ticket.token + "_";

        // Direct scalar packets avoid decoding "1000" or "false" as UTF-16.
        if (ticket.kind == Kind.Daytime) {
            let time = bits(base + "v", 15);
            let check = bits(base + "h", 8);
            if (time > 24000 || check != ((time * 31 + 73) % 256)) {
                result.status = "INVALID_TIME_PACKET";
                return completed(result, ticket, started);
            }
            result.total = 1;
            result.numberValue = time;
            result.items.push("" + time);
            result.status = "OK";
            result.ok = true;
            return completed(result, ticket, started);
        }
        if (ticket.kind == Kind.KeepInventory) {
            let yes = probe(base + "v");
            let no = probe(base + "z");
            if (yes == no) {
                result.status = "INVALID_BOOLEAN_PACKET";
                return completed(result, ticket, started);
            }
            result.total = 1;
            result.booleanValue = yes;
            result.items.push(yes ? "true" : "false");
            result.status = "OK";
            result.ok = true;
            return completed(result, ticket, started);
        }

        let count = bits(base + "n", 2);
        let total = bits(base + "t", 12);
        if (count > PAGE_SIZE || total > 4095 || count > total ||
            (ticket.page * PAGE_SIZE >= total && count != 0)) {
            result.status = "INVALID_PACKET_COUNT";
            return completed(result, ticket, started);
        }
        result.total = total;
        for (let index = 0; index < count; index++) {
            let len = bits(base + "l" + index + "x", 6);
            let mode = bits(base + "m" + index + "x", 2);
            if (len > MAX_UNITS || mode > 2) {
                result.status = "INVALID_PACKET_FORMAT";
                return completed(result, ticket, started);
            }
            let width = mode == 0 ? 6 : (mode == 1 ? 7 : 16);
            let s = "";
            for (let pos = 0; pos < len; pos++) {
                let n = bits(base + "c" + index + "x" + pos + "x", width);
                if (mode == 0) {
                    if (n >= FAST_ALPHABET.length) {
                        result.status = "INVALID_FAST_SYMBOL";
                        return completed(result, ticket, started);
                    }
                    s += FAST_ALPHABET.charAt(n);
                } else {
                    s += String.fromCharCode(n);
                }
            }
            result.items.push(s);
        }
        if (bits(base + "h", 8) != checksum(result.items, total, ticket.page)) {
            result.status = "INVALID_PACKET_CHECKSUM";
            return completed(result, ticket, started);
        }
        if (probe(base + "o")) {
            if (count != 0 || total == 0 || ticket.page * PAGE_SIZE < total) {
                result.status = "INVALID_PACKET_RANGE";
            } else {
                result.status = "PAGE_OUT_OF_RANGE";
            }
            return completed(result, ticket, started);
        }
        result.status = "OK";
        result.ok = true;
        return completed(result, ticket, started);
    }
    //% blockId=cbxq2_cancel
    //% block="LIVE QUERY cancel $ticket"
    //% weight=80
    export function cancel(ticket: Ticket): void {
        if (!ticket || ticket.closed || !ticket.sent) return;
        player.execute("scriptevent cbxq3:cancel " + ticket.token);
        ticket.closed = true;
    }
    //% blockId=cbxq2_item
    //% block="LIVE QUERY item $index of $result"
    //% weight=70
    export function item(result: Result, index: number): string {
        if (!result || !result.ok || index < 0 || index >= result.items.length || index % 1 != 0) return "";
        return result.items[index];
    }
    //% blockId=cbxq2_total
    //% block="LIVE QUERY total $result"
    //% weight=69
    export function total(result: Result): number { return result && result.ok ? result.total : -1; }
    //% blockId=cbxq2_success
    //% block="LIVE QUERY success $result"
    //% weight=68
    export function success(result: Result): boolean { return !!result && result.ok; }
    //% blockId=cbxq2_status
    //% block="LIVE QUERY status $result"
    //% weight=67
    export function status(result: Result): string { return result ? result.status : "MISSING_RESULT"; }
    //% blockId=cbxq2_number
    //% block="LIVE QUERY number value $result"
    //% weight=66
    export function numberValue(result: Result): number { return result && result.ok && result.kind == Kind.Daytime ? result.numberValue : 0; }
    //% blockId=cbxq2_boolean
    //% block="LIVE QUERY Boolean value $result"
    //% weight=65
    export function booleanValue(result: Result): boolean { return !!result && result.ok && result.kind == Kind.KeepInventory && result.booleanValue; }
}
