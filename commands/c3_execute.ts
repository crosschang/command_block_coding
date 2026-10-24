/** C3 modern Bedrock EXECUTE. Ordered clauses and nested RUN AST remain canonical. */
namespace MCFunctionAST {
    export enum ExecuteClauseKind {
        As = 0, At = 1, In = 2, Positioned = 3, Rotated = 4,
        FacingPosition = 5, FacingEntity = 6, Align = 7, Anchored = 8,
        IfEntity = 9, UnlessEntity = 10, IfBlock = 11, UnlessBlock = 12,
        IfBlocks = 13, UnlessBlocks = 14, IfScoreMatches = 15, UnlessScoreMatches = 16
    }
    export enum ExecuteDimension { Overworld = 0, Nether = 1, TheEnd = 2 }
    export enum ExecuteScan { All = 0, Masked = 1 }
    export interface ExecuteClause {
        kind: ExecuteClauseKind;
        target?: PlayerTarget;
        position?: Position;
        rotation?: Rotation;
        facing?: Facing;
        dimension?: ExecuteDimension;
        axes?: string;
        anchor?: EntityAnchor;
        blockId?: string;
        begin?: Position;
        end?: Position;
        destination?: Position;
        scan?: ExecuteScan;
        objective?: string;
        scoreRange?: NumberRange;
    }
    export interface ExecuteCommand extends CommandNode {
        kind: CommandKind;
        clauses: ExecuteClause[];
        run: CommandNode;
    }
    export function createExecuteCommand(clauses: ExecuteClause[], run: CommandNode): ExecuteCommand {
        return {kind: CommandKind.Execute, clauses: clauses, run: run};
    }
}
