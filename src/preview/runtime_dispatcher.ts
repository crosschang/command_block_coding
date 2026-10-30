/**
 * Runtime route selection for command AST preview.
 * P1a: preserve the existing opt-in bridge behavior. This is deliberately NOT
 * the final evidence-based AUTO router. P1b will use variant-level evidence.
 *
 * No poller, queue, timeout, or command-string reconstruction is introduced.
 * The original command AST is passed unchanged to the active execution path.
 */
namespace MCFunctionRuntime {
    export enum Route {
        MakeCode = 0,
        Bridge = 1
    }

    /** Resolve transport only; validation and definition capture happen upstream. */
    export function resolve(command: MCFunctionAST.CommandNode): Route {
        // Preserve the 0.0.93 contract: bridge is opt-in and otherwise OFF.
        return MCFunctionCBX12Bridge.isEnabled() ? Route.Bridge : Route.MakeCode;
    }
}
