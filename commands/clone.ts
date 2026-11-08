/** clone command AST. */
namespace MCFunctionAST {
    export enum CloneMaskKind {
        Replace = 0,
        Masked = 1,
        Filtered = 2
    }

    export enum CloneMode {
        //% block="normal"
        Normal = 0,

        //% block="force"
        Force = 1,

        //% block="move"
        Move = 2
    }

    export interface CloneCommand extends CommandNode {
        kind: CommandKind;
        begin: Position;
        end: Position;
        destination: Position;
        maskKind?: CloneMaskKind;
        cloneMode?: CloneMode;
        filterBlockId?: string;
        filterBlockStates?: BlockStates;
    }

    export function createCloneCommand(
        begin: Position,
        end: Position,
        destination: Position,
        maskKind?: CloneMaskKind,
        cloneMode?: CloneMode,
        filterBlockId?: string,
        filterBlockStates?: BlockStates
    ): CloneCommand {
        return {
            kind: CommandKind.Clone,
            begin: begin,
            end: end,
            destination: destination,
            maskKind: maskKind,
            cloneMode: cloneMode,
            filterBlockId: filterBlockId,
            filterBlockStates: filterBlockStates
        };
    }
}
