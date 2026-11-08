/**
 * MakeCode player.execute() compatibility serializer for block-state commands.
 *
 * Verified runtime behavior (Minecraft Education 26.32):
 * - chat/.mcfunction block states use compact `"key"=value`
 * - MakeCode player.execute() requires legacy-compatible compact `"key":value`
 * - block-state value types must be preserved (string / number / boolean)
 *
 * This is Preview-only syntax adaptation. It must never change the canonical
 * .mcfunction compiler output or the command AST.
 */
namespace MCFunctionPreviewBlockCommandSerializer {
    function escapeBlockStateText(value: string): string {
        let result = "";
        for (let i = 0; i < value.length; i++) {
            let ch = value.charAt(i);
            if (ch == "\\" || ch == "\"") result = result + "\\";
            result = result + ch;
        }
        return result;
    }

    /** player.execute()-only block_state_array serialization. */
    export function serializeBlockStates(states: MCFunctionAST.BlockStates): string {
        let result = "[";

        for (let i = 0; i < states.entries.length; i++) {
            if (i > 0) result = result + ",";

            let entry = states.entries[i];
            result = result + "\"" + escapeBlockStateText(entry.key) + "\":";

            if (entry.kind == MCFunctionAST.BlockStateValueKind.String) {
                result = result + "\"" + escapeBlockStateText(entry.stringValue) + "\"";
            } else if (entry.kind == MCFunctionAST.BlockStateValueKind.Number) {
                result = result + entry.numberValue;
            } else {
                result = result + (entry.booleanValue ? "true" : "false");
            }
        }

        return result + "]";
    }

    function compileSetBlockMode(mode: MCFunctionAST.SetBlockMode): string {
        if (mode == MCFunctionAST.SetBlockMode.Destroy) return "destroy";
        if (mode == MCFunctionAST.SetBlockMode.Keep) return "keep";
        return "replace";
    }

    function compileFillMode(mode: MCFunctionAST.FillMode): string {
        if (mode == MCFunctionAST.FillMode.Destroy) return "destroy";
        if (mode == MCFunctionAST.FillMode.Hollow) return "hollow";
        if (mode == MCFunctionAST.FillMode.Keep) return "keep";
        if (mode == MCFunctionAST.FillMode.Outline) return "outline";
        return "replace";
    }

    function compileCloneMode(mode: MCFunctionAST.CloneMode): string {
        if (mode == MCFunctionAST.CloneMode.Force) return "force";
        if (mode == MCFunctionAST.CloneMode.Move) return "move";
        return "normal";
    }

    function compileCloneMask(mask: MCFunctionAST.CloneMaskKind): string {
        if (mask == MCFunctionAST.CloneMaskKind.Masked) return "masked";
        if (mask == MCFunctionAST.CloneMaskKind.Filtered) return "filtered";
        return "replace";
    }

    function compileSetBlock(command: MCFunctionAST.SetBlockCommand): string {
        let result =
            "setblock " +
            MCFunctionCompiler.compilePosition(command.position) +
            " " + command.blockId;

        if (command.blockStates && command.blockStates.entries.length > 0) {
            result = result + " " + serializeBlockStates(command.blockStates);
        }

        if (command.mode != undefined) {
            result = result + " " + compileSetBlockMode(command.mode);
        }

        return result;
    }

    function compileFill(command: MCFunctionAST.FillCommand): string {
        let result =
            "fill " +
            MCFunctionCompiler.compilePosition(command.from) + " " +
            MCFunctionCompiler.compilePosition(command.to) + " " +
            command.blockId;

        if (command.blockStates && command.blockStates.entries.length > 0) {
            result = result + " " + serializeBlockStates(command.blockStates);
        }

        if (command.mode != undefined) {
            result = result + " " + compileFillMode(command.mode);
        } else if (command.replaceBlockId != undefined) {
            result = result + " replace";
        }

        if (command.replaceBlockId != undefined) {
            result = result + " " + command.replaceBlockId;

            if (command.replaceBlockStates && command.replaceBlockStates.entries.length > 0) {
                result = result + " " + serializeBlockStates(command.replaceBlockStates);
            }
        }

        return result;
    }

    function compileClone(command: MCFunctionAST.CloneCommand): string {
        let result =
            "clone " +
            MCFunctionCompiler.compilePosition(command.begin) + " " +
            MCFunctionCompiler.compilePosition(command.end) + " " +
            MCFunctionCompiler.compilePosition(command.destination);

        let hasMask = command.maskKind != undefined;
        let hasMode = command.cloneMode != undefined;

        if (!hasMask && !hasMode) {
            return result;
        }

        let mask = command.maskKind;
        if (mask == undefined) mask = MCFunctionAST.CloneMaskKind.Replace;
        result = result + " " + compileCloneMask(mask);

        if (mask == MCFunctionAST.CloneMaskKind.Filtered) {
            let mode = command.cloneMode;
            if (mode == undefined) mode = MCFunctionAST.CloneMode.Normal;
            result = result + " " + compileCloneMode(mode);
            result = result + " " + command.filterBlockId;

            if (command.filterBlockStates && command.filterBlockStates.entries.length > 0) {
                result = result + " " + serializeBlockStates(command.filterBlockStates);
            }

            return result;
        }

        if (command.cloneMode != undefined) {
            result = result + " " + compileCloneMode(command.cloneMode);
        }

        return result;
    }

    /**
     * Return a Preview-specific command only when player.execute() needs a
     * block-state compatibility rewrite. Empty string means use Compiler output.
     */
    export function tryCompile(command: MCFunctionAST.CommandNode): string {
        if (command.kind == MCFunctionAST.CommandKind.SetBlock) {
            let setBlock = <MCFunctionAST.SetBlockCommand>command;
            if (setBlock.blockStates && setBlock.blockStates.entries.length > 0) {
                return compileSetBlock(setBlock);
            }
            return "";
        }

        if (command.kind == MCFunctionAST.CommandKind.Fill) {
            let fill = <MCFunctionAST.FillCommand>command;
            let hasStates = !!fill.blockStates && fill.blockStates.entries.length > 0;
            let hasReplaceStates = !!fill.replaceBlockStates && fill.replaceBlockStates.entries.length > 0;
            if (hasStates || hasReplaceStates) {
                return compileFill(fill);
            }
            return "";
        }

        if (command.kind == MCFunctionAST.CommandKind.Clone) {
            let clone = <MCFunctionAST.CloneCommand>command;
            if (clone.filterBlockStates && clone.filterBlockStates.entries.length > 0) {
                return compileClone(clone);
            }
            return "";
        }

        return "";
    }
}
