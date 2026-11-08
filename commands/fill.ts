/** fill command AST. */
namespace MCFunctionAST {
    export enum FillMode {
        Replace = 0,
        Destroy = 1,
        Hollow = 2,
        Keep = 3,
        Outline = 4
    }

    export interface FillCommand extends CommandNode {
        kind: CommandKind;
        from: Position;
        to: Position;
        blockId: string;
        blockStates?: BlockStates;
        mode?: FillMode;
        replaceBlockId?: string;
        replaceBlockStates?: BlockStates;
    }

    export function createFillCommand(
        from: Position,
        to: Position,
        blockId: string,
        blockStates?: BlockStates,
        mode?: FillMode,
        replaceBlockId?: string,
        replaceBlockStates?: BlockStates
    ): FillCommand {
        return {
            kind: CommandKind.Fill,
            from: from,
            to: to,
            blockId: blockId,
            blockStates: blockStates,
            mode: mode,
            replaceBlockId: replaceBlockId,
            replaceBlockStates: replaceBlockStates
        };
    }
}
