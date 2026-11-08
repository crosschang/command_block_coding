/**
 * Project-level representation of Behavior Pack functions/tick.json.
 *
 * This intentionally lives outside MCFunctionAST because tick.json is not a
 * Minecraft command. It is project metadata that references .mcfunction files.
 */
namespace MCFunctionProject {
    export interface TickFile {
        values: string[];
    }

    export function createTickFile(): TickFile {
        return {
            values: []
        };
    }

    export function addTickValue(
        tickFile: TickFile,
        functionId: string
    ): void {
        tickFile.values.push(functionId);
    }
}
