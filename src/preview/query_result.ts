/**
 * Shared result model for Preview-only query/output adapters.
 *
 * Query adapters never change exported .mcfunction syntax. They only describe
 * how confidently the MakeCode runtime can reproduce output that player.execute()
 * does not expose to the user.
 */
namespace MCFunctionPreview {
    export enum QueryConfidence {
        Exact = 0,
        SessionKnown = 1,
        Partial = 2,
        Unavailable = 3
    }

    export interface QueryResult {
        handled: boolean;
        confidence: QueryConfidence;
        summary: string;
    }

    export function unhandledQuery(): QueryResult {
        return {
            handled: false,
            confidence: QueryConfidence.Unavailable,
            summary: ""
        };
    }

    export function handledQuery(
        confidence: QueryConfidence,
        summary: string
    ): QueryResult {
        return {
            handled: true,
            confidence: confidence,
            summary: summary
        };
    }
}

/**
 * Typed data response for Preview queries. Separate from display summaries,
 * command AST and execution ACK. No new wire protocol or polling loop.
 * readLive() delegates to the existing bounded decoder, including its ACK.
 */
//% color=#477D95 weight=91 block="QUERY RESULT"
namespace QueryReadback {
    export enum State { Pending = 0, Ready = 1, Error = 2, Timeout = 3, Closed = 4, Missing = 5 }
    export enum ValueKind { None = 0, Number = 1, Boolean = 2, TextList = 3 }

    export class Response {
        requestId: string;
        state: State;
        valueKind: ValueKind;
        reason: string;
        numberValue: number;
        booleanValue: boolean;
        items: string[];
        total: number;
        // Diagnostic metadata only. Never a query value or execution ACK.
        hasReadMetrics: boolean;
        readProbes: number;
        readTicks: number;
        constructor(requestId: string) {
            this.requestId = requestId;
            this.state = State.Pending;
            this.valueKind = ValueKind.None;
            this.reason = "PENDING";
            this.numberValue = 0;
            this.booleanValue = false;
            this.items = [];
            this.total = -1;
            this.hasReadMetrics = false;
            this.readProbes = 0;
            this.readTicks = 0;
        }
    }

    export function pending(requestId: string): Response { return new Response(requestId); }
    export function failed(requestId: string, reason: string): Response {
        let r = new Response(requestId);
        r.state = State.Error;
        r.reason = reason;
        return r;
    }
    function finiteNumber(value: number): boolean {
        return typeof value == "number" && value - value == 0;
    }
    export function numberResponse(requestId: string, value: number): Response {
        if (!requestId || !finiteNumber(value)) return failed(requestId, "INVALID_NUMBER_VALUE");
        let r = new Response(requestId);
        r.state = State.Ready; r.valueKind = ValueKind.Number; r.reason = "OK";
        r.numberValue = value; r.total = 1;
        return r;
    }
    export function booleanResponse(requestId: string, value: boolean): Response {
        if (!requestId || typeof value != "boolean") return failed(requestId, "INVALID_BOOLEAN_VALUE");
        let r = new Response(requestId);
        r.state = State.Ready; r.valueKind = ValueKind.Boolean; r.reason = "OK";
        r.booleanValue = value; r.total = 1;
        return r;
    }
    export function listResponse(requestId: string, items: string[], total: number): Response {
        if (!requestId || !items || !finiteNumber(total) || total % 1 != 0 ||
            total < 0 || items.length > total) return failed(requestId, "INVALID_LIST_VALUE");
        let r = new Response(requestId);
        for (let i = 0; i < items.length; i++) {
            if (typeof items[i] != "string") return failed(requestId, "INVALID_LIST_ITEM");
            r.items.push(items[i]); // own snapshot; do not alias transport storage
        }
        r.state = State.Ready; r.valueKind = ValueKind.TextList; r.reason = "OK";
        r.total = total;
        return r;
    }

    /** Adapter for the EXISTING experimental cbxq4 Ticket/Result protocol.
     * No new request or wait. Requires its separate, compatible query receiver;
     * P4O2H execution ACK alone never supplies this data.
     * Matching kind/page is a consistency check, not an owner/session proof. */
    //% blockId=cbx_readback_read_live
    //% block="QUERY RESULT read LIVE QUERY ticket $ticket now"
    //% weight=90
    //% blockHidden=true
    //% hidden=true
    export function readLive(ticket: MCFunctionLiveQuery.Ticket): Response {
        // Read the snapshot from this ticket ourselves. Do not let a caller
        // accidentally pair a result from another request with this ticket.
        if (!ticket) return failed("", "MISSING_TICKET");
        let snapshot = MCFunctionLiveQuery.tryRead(ticket);
        let response = fromLiveResult(ticket, snapshot);
        let measured = snapshot && (snapshot.ready === true || snapshot.status == "EXPIRED" ||
            (snapshot.status == "PENDING" && snapshot.ready === false && snapshot.ok === false));
        if (measured && finiteNumber(snapshot.probeCalls) && snapshot.probeCalls >= 0 &&
            snapshot.probeCalls % 1 == 0 && finiteNumber(snapshot.readTicks) &&
            snapshot.readTicks >= 0 && snapshot.readTicks % 1 == 0) {
            response.hasReadMetrics = true;
            response.readProbes = snapshot.probeCalls;
            response.readTicks = snapshot.readTicks;
        }
        return response;
    }
    function fromLiveResult(ticket: MCFunctionLiveQuery.Ticket,
        snapshot: MCFunctionLiveQuery.Result): Response {
        let id = ticket ? ticket.token : "";
        if (!ticket || !id) return failed(id, "MISSING_TICKET");
        if (!ticket.sent) return failed(id, ticket.failure || "NOT_SENT");
        if (!snapshot) return failed(id, "MISSING_RESULT");
        if (snapshot.kind != ticket.kind || snapshot.page != ticket.page)
            return failed(id, "QUERY_CONTEXT_MISMATCH");
        if (snapshot.status == "PENDING" && !snapshot.ready && !snapshot.ok) return pending(id);
        if (snapshot.status == "EXPIRED" || snapshot.status == "ALREADY_CLOSED") {
            let r = failed(id, snapshot.status);
            r.state = snapshot.status == "EXPIRED" ? State.Timeout : State.Closed;
            return r;
        }
        if (ticket.kind == MCFunctionLiveQuery.Kind.ScoreboardValue && snapshot.ready === true &&
            snapshot.ok === false && (snapshot.status == "OBJECTIVE_NOT_FOUND" || snapshot.status == "SCORE_NOT_FOUND")) {
            let r = failed(id, snapshot.status);
            r.state = State.Missing;
            return r;
        }
        if (snapshot.ready !== true || snapshot.ok !== true || snapshot.status != "OK")
            return failed(id, snapshot.status || "INVALID_RESULT");
        if (ticket.kind == MCFunctionLiveQuery.Kind.Daytime || ticket.kind == MCFunctionLiveQuery.Kind.ScoreboardValue ||
            ticket.kind == MCFunctionLiveQuery.Kind.GameruleInteger)
            return numberResponse(id, snapshot.numberValue);
        if (ticket.kind == MCFunctionLiveQuery.Kind.KeepInventory ||
            ticket.kind == MCFunctionLiveQuery.Kind.OwnTagPresent || ticket.kind == MCFunctionLiveQuery.Kind.GameruleBoolean)
            return booleanResponse(id, snapshot.booleanValue);
        if (ticket.kind == MCFunctionLiveQuery.Kind.Players ||
            ticket.kind == MCFunctionLiveQuery.Kind.Objectives ||
            ticket.kind == MCFunctionLiveQuery.Kind.Participants ||
            ticket.kind == MCFunctionLiveQuery.Kind.MyTags)
            return listResponse(id, snapshot.items, snapshot.total);
        return failed(id, "UNSUPPORTED_QUERY_KIND");
    }

    //% blockId=cbx_readback_success block="QUERY RESULT succeeded $response" weight=85
    //% blockHidden=true
    //% hidden=true
    export function success(response: Response): boolean {
        return !!response && response.state == State.Ready && response.valueKind != ValueKind.None;
    }
    //% blockId=cbx_readback_state block="QUERY RESULT state $response" weight=84
    //% blockHidden=true
    //% hidden=true
    export function state(response: Response): State { return response ? response.state : State.Error; }
    //% blockId=cbx_readback_reason block="QUERY RESULT reason $response" weight=83
    //% blockHidden=true
    //% hidden=true
    export function reason(response: Response): string { return response ? response.reason : "MISSING_RESULT"; }
    //% blockId=cbx_readback_has_number block="QUERY RESULT has number $response" weight=80
    //% blockHidden=true
    //% hidden=true
    export function hasNumber(response: Response): boolean {
        return success(response) && response.valueKind == ValueKind.Number;
    }
    /** Caller chooses a fallback explicitly; Pending/Error is never a zero measurement. */
    //% blockId=cbx_readback_number_or block="QUERY RESULT number $response or $fallback" weight=79
    //% blockHidden=true
    //% hidden=true
    export function numberOr(response: Response, fallback: number): number {
        return hasNumber(response) ? response.numberValue : fallback;
    }
    //% blockId=cbx_readback_has_boolean block="QUERY RESULT has Boolean $response" weight=78
    //% blockHidden=true
    //% hidden=true
    export function hasBoolean(response: Response): boolean {
        return success(response) && response.valueKind == ValueKind.Boolean;
    }
    //% blockId=cbx_readback_has_list block="QUERY RESULT has text list $response" weight=74
    //% blockHidden=true
    //% hidden=true
    export function hasTextList(response: Response): boolean {
        return success(response) && response.valueKind == ValueKind.TextList;
    }
    /** Page size, distinct from totalOr() which is the full snapshot count. */
    //% blockId=cbx_readback_page_count_or block="QUERY RESULT page item count $response or $fallback" weight=73
    //% blockHidden=true
    //% hidden=true
    export function pageCountOr(response: Response, fallback: number): number {
        return hasTextList(response) ? response.items.length : fallback;
    }
    /** Number of Boolean tag probes; excludes ACK and log output calls. */
    //% blockId=cbx_readback_probes_or block="QUERY RESULT read probes $response or $fallback" weight=72
    //% blockHidden=true
    //% hidden=true
    export function readProbesOr(response: Response, fallback: number): number {
        return response && response.hasReadMetrics ? response.readProbes : fallback;
    }
    /** GameTime ticks in the decoder; not wall-clock milliseconds. */
    //% blockId=cbx_readback_ticks_or block="QUERY RESULT read ticks $response or $fallback" weight=71
    //% blockHidden=true
    //% hidden=true
    export function readTicksOr(response: Response, fallback: number): number {
        return response && response.hasReadMetrics ? response.readTicks : fallback;
    }
    //% blockId=cbx_readback_boolean_or block="QUERY RESULT Boolean $response or $fallback" weight=77
    //% blockHidden=true
    //% hidden=true
    export function booleanOr(response: Response, fallback: boolean): boolean {
        return hasBoolean(response) ? response.booleanValue : fallback;
    }
    //% blockId=cbx_readback_total_or block="QUERY RESULT total $response or $fallback" weight=76
    //% blockHidden=true
    //% hidden=true
    export function totalOr(response: Response, fallback: number): number {
        return success(response) ? response.total : fallback;
    }
    //% blockId=cbx_readback_text_or block="QUERY RESULT item $index of $response or $fallback" weight=75
    //% blockHidden=true
    //% hidden=true
    export function textOr(response: Response, index: number, fallback: string): string {
        if (!success(response) || response.valueKind != ValueKind.TextList || index % 1 != 0 ||
            index < 0 || index >= response.items.length) return fallback;
        return response.items[index];
    }
}
