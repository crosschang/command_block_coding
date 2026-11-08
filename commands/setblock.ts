/** setblock command AST. */
namespace MCFunctionAST {
    export enum SetBlockMode {
        //% block="replace"
        Replace = 0,

        //% block="destroy"
        Destroy = 1,

        //% block="keep"
        Keep = 2
    }

    export interface SetBlockCommand extends CommandNode {
        kind: CommandKind;
        position: Position;
        blockId: string;
        blockStates?: BlockStates;
        mode?: SetBlockMode;
    }

    export function createSetBlockCommand(
        position: Position,
        blockId: string,
        blockStates?: BlockStates,
        mode?: SetBlockMode
    ): SetBlockCommand {
        return {
            kind: CommandKind.SetBlock,
            position: position,
            blockId: blockId,
            blockStates: blockStates,
            mode: mode
        };
    }
}
