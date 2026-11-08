/* Host-only smoke tests. Does NOT test Minecraft/PXT or an installed Behavior Pack. */
namespace MCFunctionAST {
    export enum CommandKind { Say = 1, Summon = 5, Execute = 40 }
    export interface CommandNode { kind: CommandKind }
}
namespace MCFunctionCBX12Bridge {
    let enabled = false;
    let unified = false;
    let selective = false;
    export function isEnabled(): boolean { return enabled; }
    export function disable(): void { enabled = false; unified = false; selective = false; }
    export function enable(): void { enabled = true; unified = false; selective = false; }
    export function enableUnified(): void { enabled = true; unified = true; selective = false; }
    export function enableSelective(): void { enabled = true; unified = true; selective = true; }
    export function isUnified(): boolean { return unified; }
    export function isSelective(): boolean { return selective; }
}
namespace FunctionFile {
    let safe = true;
    export function setSafe(value: boolean): void { safe = value; }
    export function allowBridgeConfiguration(): boolean { return safe; }
}
namespace MCFunctionPreview {
    export let lastMessage = "";
    export function previewSay(message: string): void { lastMessage = message; }
}
function assert(condition: boolean, message: string): void {
    if (!condition) { throw new Error(message); }
}
function route(kind: MCFunctionAST.CommandKind): MCFunctionRuntime.Route {
    return MCFunctionRuntime.resolve({ kind: kind });
}
RuntimeBridge.select(RuntimeBridge.Transport.Original);
assert(route(MCFunctionAST.CommandKind.Say) == MCFunctionRuntime.Route.MakeCode, "OFF normal");
assert(route(MCFunctionAST.CommandKind.Execute) == MCFunctionRuntime.Route.MakeCode, "OFF C3");
assert(route(MCFunctionAST.CommandKind.Summon) == MCFunctionRuntime.Route.MakeCode, "OFF summon");
RuntimeBridge.select(RuntimeBridge.Transport.CBX12Hex);
assert(route(MCFunctionAST.CommandKind.Execute) == MCFunctionRuntime.Route.Bridge, "CBX12 route");
assert(!MCFunctionCBX12Bridge.isUnified(), "CBX12 mode");
RuntimeBridge.select(RuntimeBridge.Transport.CBXCoreHex);
assert(route(MCFunctionAST.CommandKind.Say) == MCFunctionRuntime.Route.Bridge, "CBXCORE route");
assert(MCFunctionCBX12Bridge.isUnified() && !MCFunctionCBX12Bridge.isSelective(), "core hex");
RuntimeBridge.select(RuntimeBridge.Transport.CBXCoreSelective);
assert(MCFunctionCBX12Bridge.isSelective(), "selective mode");
FunctionFile.setSafe(false);
RuntimeBridge.select(RuntimeBridge.Transport.Original);
assert(route(MCFunctionAST.CommandKind.Execute) == MCFunctionRuntime.Route.Bridge, "guard prevents mode change");
FunctionFile.setSafe(true);
RuntimeBridge.select(<RuntimeBridge.Transport>99);
assert(MCFunctionPreview.lastMessage.indexOf("BRIDGE_MODE_UNKNOWN") >= 0, "reject invalid mode");
assert(route(MCFunctionAST.CommandKind.Execute) == MCFunctionRuntime.Route.Bridge, "invalid mode preserves previous route");
RuntimeBridge.select(RuntimeBridge.Transport.Original);
assert(route(MCFunctionAST.CommandKind.Execute) == MCFunctionRuntime.Route.MakeCode, "return to OFF");
