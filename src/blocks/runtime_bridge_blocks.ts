/**
 * P1b Preview transport setup. AUTO routes typed, previously validated
 * command ASTs by evidence and preserves legacy Preview readback adapters.
 * CBXCORE Behavior Pack is required for Bridge routes.
 * This configuration is not part of exported .mcfunction or tick.json.
 */
//% color=#B65C29 weight=94 icon="\uf0ec" block="RUNTIME BRIDGE"
namespace RuntimeBridge {
    export enum Transport {
        //% block="MakeCode original (bridge OFF)"
        Original = 0,
        //% block="CBX12 HEX (diagnostic)"
        CBX12Hex = 1,
        //% block="CBXCORE HEX (diagnostic)"
        CBXCoreHex = 2,
        //% block="CBXCORE SELECTIVE (diagnostic)"
        CBXCoreSelective = 3,
        //% block="AUTO: MakeCode + CBXCORE (requires Behavior Pack)"
        Auto = 4
    }
    //% blockId=mcfunction_runtime_bridge_select
    //% block="PREVIEW bridge route $mode"
    //% topblock=true
    //% blockAllowMultiple=1
    //% weight=100
    export function select(mode: Transport): void {
        if (!FunctionFile.allowBridgeConfiguration()) return;
        MCFunctionRuntime.disableAutomatic();
        if (mode == Transport.Original) MCFunctionCBX12Bridge.disable();
        else if (mode == Transport.CBX12Hex) MCFunctionCBX12Bridge.enable();
        else if (mode == Transport.CBXCoreHex) MCFunctionCBX12Bridge.enableUnified();
        else if (mode == Transport.CBXCoreSelective) MCFunctionCBX12Bridge.enableSelective();
        else if (mode == Transport.Auto) {
            MCFunctionCBX12Bridge.enableSelective();
            MCFunctionRuntime.enableAutomatic();
        } else MCFunctionPreview.previewSay("ERROR [BRIDGE_MODE_UNKNOWN] Unsupported Preview bridge route.");
    }

    /** Explicit opt-in. Legacy Preview and other bridges remain unchanged. */
    export enum OrderedMode {
        //% block="original Preview (ordered batching OFF)"
        Off = 0,
        //% block="FunctionFile ordered batch (pack required, experimental)"
        On = 1
    }
    //% blockId=mcfunction_ordered_preview_mode
    //% block="PREVIEW FunctionFile order $mode"
    //% topblock=true
    //% weight=63
    export function orderedMode(mode: OrderedMode): void {
        if (!FunctionFile.allowBridgeConfiguration()) return;
        MCFunctionOrderedPreview.setEnabled(mode == OrderedMode.On);
    }

    /**
     * P4-ORDER-2D: optional receipt readback. In Confirm mode the FunctionFile
     * preview does NOT return before DONE/ERROR/TIMEOUT is determined.
     * Only use if calibration has proved that player.execute() reflects
     * TAG or Scoreboard test results, not mere command submission.
     */
    export enum OrderedAckMode {
        //% block="submit only (legacy P4-ORDER-2C)"
        Off = 0,
        //% block="wait for DONE / ERROR (experimental)"
        Confirm = 1
    }

    //% blockId=mcfunction_ordered_ack_mode
    //% block="PREVIEW ordered receipt $mode"
    //% topblock=true
    //% weight=62
    export function orderedAckMode(mode: OrderedAckMode): void {
        if (!FunctionFile.allowBridgeConfiguration()) return;
        MCFunctionOrderedPreview.setReceiptMode(mode == OrderedAckMode.Confirm);
    }

    /** Choose the transport explicitly. Previous TAG ACK remains as a fallback.
     * New Scoreboard mode uses a per-request Fake Player under cbxo2f. */
    export enum OrderedAckTransport {
        //% block="legacy TAG receipts"
        Tag = 0,
        //% block="Scoreboard Fake Player receipts (legacy)"
        Scoreboard = 1,
        //% block="player-scoped Scoreboard ACK (multiplayer)"
        PlayerScoreboard = 2
    }

    //% blockId=mcfunction_ordered_ack_transport
    //% block="PREVIEW ordered ACK transport $mode"
    //% topblock=true
    //% weight=61
    export function orderedAckTransport(mode: OrderedAckTransport): void {
        if (!FunctionFile.allowBridgeConfiguration()) return;
        let choice = MCFunctionOrderedPreview.AckTransport.Tag;
        if (mode == OrderedAckTransport.Scoreboard)
            choice = MCFunctionOrderedPreview.AckTransport.Scoreboard;
        if (mode == OrderedAckTransport.PlayerScoreboard)
            choice = MCFunctionOrderedPreview.AckTransport.PlayerScoreboard;
        MCFunctionOrderedPreview.setAckTransport(choice);
    }

    /** Explicit calibration can be called from a chat handler. */
    //% blockId=mcfunction_ordered_ack_calibrate
    //% block="PREVIEW test ACK readback"
    //% weight=59
    export function orderedAckCalibrate(): boolean {
        if (!FunctionFile.allowBridgeConfiguration()) return false;
        return MCFunctionOrderedPreview.probeReadback();
    }

    /** Submission success is never returned as confirmed DONE. */
    export enum OrderedAckResult {
        Idle = 0, Submitted = 1, Done = 2, Error = 3,
        Timeout = 4, Unsupported = 5, SendFailed = 6,
        Rejected = 7, Busy = 8
    }
    //% blockId=mcfunction_ordered_ack_last_status
    //% block="PREVIEW last ordered receipt"
    //% weight=58
    export function lastOrderedAck(): OrderedAckResult {
        return <OrderedAckResult>MCFunctionOrderedPreview.lastAckStatus();
    }

    export function lastOrderedRequestId(): string {
        return MCFunctionOrderedPreview.lastRequestId();
    }

    /** TAG LIST display mode affects Preview only, not the command AST. */
    export enum TagListOutputMode {
        //% block="DETAIL (all targets and tags)"
        Detail = 0,
        //% block="SUMMARY (one line per request)"
        Summary = 1
    }
    //% blockId=mcfunction_taglist_preview_output_mode
    //% block="PREVIEW TAG LIST display $mode"
    //% weight=61
    //% blockAllowMultiple=1
    export function tagListPreviewOutput(mode: TagListOutputMode): void {
        if (!FunctionFile.allowBridgeConfiguration()) return;
        MCFunctionTagListDirect.setSummaryOutput(mode == TagListOutputMode.Summary);
    }

    /**
     * P2c-4 PREVIEW-only preflight: call ONCE at the start of a chat callback
     * before any TAG LIST commands in that logical batch.
     * The extension cannot infer MakeCode onChat callback boundaries, so it
     * cannot safely insert one yield for all bursts automatically.
     */
    //% blockId=mcfunction_taglist_preview_prepare_batch
    //% block="PREVIEW prepare TAG LIST batch (yield 1ms)"
    //% weight=60
    export function prepareTagListBatch(): void {
        if (!MCFunctionRuntime.isAutomatic() || !FunctionFile.allowCommandExecution()) return;
        loops.pause(1);
    }
}
