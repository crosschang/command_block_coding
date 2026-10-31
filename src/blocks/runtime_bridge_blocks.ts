/**
 * P1b Preview transport setup. AUTO routes typed, previously validated
 * command ASTs by evidence and preserves legacy Preview readback adapters.
 *
 * CBXCORE Behavior Pack is required when AUTO selects a Bridge route.
 * AUTO does not perform a handshake and send success is not execution proof.
 * Do not assume function-wide ordering or tick.json semantics until P3/P4.
 * This configuration block is not part of exported .mcfunction or tick.json.
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

        // Existing four selections are completely backward-compatible.
        MCFunctionRuntime.disableAutomatic();
        if (mode == Transport.Original) {
            MCFunctionCBX12Bridge.disable();
        } else if (mode == Transport.CBX12Hex) {
            MCFunctionCBX12Bridge.enable();
        } else if (mode == Transport.CBXCoreHex) {
            MCFunctionCBX12Bridge.enableUnified();
        } else if (mode == Transport.CBXCoreSelective) {
            MCFunctionCBX12Bridge.enableSelective();
        } else if (mode == Transport.Auto) {
            // Only commands classified as BridgeRequired or BridgeCandidate
            // reach this transport. Direct and query adapters remain MakeCode.
            MCFunctionCBX12Bridge.enableSelective();
            MCFunctionRuntime.enableAutomatic();
        } else {
            MCFunctionPreview.previewSay("ERROR [BRIDGE_MODE_UNKNOWN] Unsupported Preview bridge route.");
        }
    }
}
