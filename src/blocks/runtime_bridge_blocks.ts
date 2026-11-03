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
