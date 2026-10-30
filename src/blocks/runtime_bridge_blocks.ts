/**
 * Existing CBX12/CBXCORE transport configuration exposed as a MakeCode block.
 * This is Preview-only project setup, never a Minecraft command AST or export.
 * The evidence-based AUTO policy is intentionally NOT exposed in P1a.
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
        CBXCoreSelective = 3
    }

    //% blockId=mcfunction_runtime_bridge_select
    //% block="PREVIEW bridge route $mode"
    //% topblock=true
    //% blockAllowMultiple=1
    //% weight=100
    export function select(mode: Transport): void {
        if (!FunctionFile.allowBridgeConfiguration()) return;
        if (mode == Transport.Original) {
            MCFunctionCBX12Bridge.disable();
        } else if (mode == Transport.CBX12Hex) {
            MCFunctionCBX12Bridge.enable();
        } else if (mode == Transport.CBXCoreHex) {
            MCFunctionCBX12Bridge.enableUnified();
        } else if (mode == Transport.CBXCoreSelective) {
            MCFunctionCBX12Bridge.enableSelective();
        } else {
            MCFunctionPreview.previewSay("ERROR [BRIDGE_MODE_UNKNOWN] Unsupported Preview bridge route.");
        }
    }
}
