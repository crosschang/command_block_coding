/** C3 MakeCode EXECUTE blocks: typed clauses + typed RUN, no ad-hoc commands. */
namespace Command {
    export class ExecuteClauseValue {
        clause?: MCFunctionAST.ExecuteClause;
        next?: ExecuteClauseValue;
        constructor(clause?: MCFunctionAST.ExecuteClause, next?: ExecuteClauseValue) {
            this.clause = clause; this.next = next;
        }
    }
    export class ExecuteRunValue {
        command: MCFunctionAST.CommandNode;
        constructor(command: MCFunctionAST.CommandNode) { this.command = command; }
    }
    export enum ExecutePolarity {
        //% block="if"
        If = 0,
        //% block="unless"
        Unless = 1
    }
    export enum ExecuteDimensionChoice {
        //% block="overworld"
        Overworld = 0,
        //% block="nether"
        Nether = 1,
        //% block="the_end"
        TheEnd = 2
    }
    export enum ExecuteScanChoice {
        //% block="all"
        All = 0,
        //% block="masked"
        Masked = 1
    }
    export enum ExecuteAnchorChoice {
        //% block="feet"
        Feet = 0,
        //% block="eyes"
        Eyes = 1
    }
    //% group="EXECUTE" weight=125
    //% blockId=command_execute_unified
    //% block="EXECUTE clauses $clauses RUN $run"
    //% clauses.shadow="mcfunction_execute_end"
    //% run.shadow="mcfunction_execute_run_say"
    //% inlineInputMode=external
    export function execute(clauses: ExecuteClauseValue, run: ExecuteRunValue): void {
        let list: MCFunctionAST.ExecuteClause[] = [];
        let part = clauses;
        // EXECUTE only: no fixed clause-count limit. The GUI preserves every
        // ordered clause in the canonical AST (including clauses after 32).
        // Reject accidentally cyclic programmatic chains to avoid infinite loops.
        let slow = clauses;
        let fast = clauses;
        while (fast && fast.next) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                MCFunctionPreview.previewSay("ERROR [EXECUTE_CYCLE] Cyclic EXECUTE clauses; RUN blocked.");
                return;
            }
        }
        while (part && part.clause) {
            list.push(part.clause);
            part = part.next;
        }
        let cmd = MCFunctionBlocks.createExecuteCommand(list, run ? run.command : undefined);
        if (!FunctionFile.allowCommandExecution()) return;
        let issues = MCFunctionValidator.validateCommand(cmd);
        if (FunctionFile.capturePreviewAction(issues, function () {
            MCFunctionExecutePreview.execute(cmd);
        }, cmd)) return;
        if (MCFunctionValidator.hasError(issues)) {
            MCFunctionPreview.previewSay("ERROR [EXECUTE_VALIDATION] Invalid EXECUTE definition; RUN blocked.");
            return;
        }
        MCFunctionExecutePreview.execute(cmd);
    }
    //% group="EXECUTE" weight=124
    //% blockId=mcfunction_execute_end
    //% block="no more execute clauses"
    export function executeEnd(): ExecuteClauseValue { return new ExecuteClauseValue(); }
    function clause(k: MCFunctionAST.ExecuteClauseKind, next?: ExecuteClauseValue): ExecuteClauseValue {
        return new ExecuteClauseValue({kind:k},next);
    }
    //% group="EXECUTE" weight=123
    //% blockId=mcfunction_execute_if_entity
    //% block="$mode entity $target next $next"
    //% target.shadow="mcfunction_target_selector"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executeIfEntity(mode: ExecutePolarity, target: MCFunctionFields.TargetValue,
        next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(mode==ExecutePolarity.If?MCFunctionAST.ExecuteClauseKind.IfEntity:
            MCFunctionAST.ExecuteClauseKind.UnlessEntity,next);
        v.clause.target=target ? target.target : undefined;
        return v;
    }
    //% group="EXECUTE" weight=122
    //% blockId=mcfunction_execute_if_block
    //% block="$mode block at $position block $block next $next"
    //% position.shadow="mcfunction_position_absolute"
    //% block.shadow="mcfunction_block_custom_id"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executeIfBlock(mode: ExecutePolarity, position: MCFunctionPositionFields.PositionValue,
        block: MCFunctionFields.BlockValue, next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(mode==ExecutePolarity.If?MCFunctionAST.ExecuteClauseKind.IfBlock:
            MCFunctionAST.ExecuteClauseKind.UnlessBlock,next);
        v.clause.position=position ? position.position : undefined;
        v.clause.blockId=block ? block.blockId : "";
        return v;
    }
    //% group="EXECUTE" weight=121
    //% blockId=mcfunction_execute_if_blocks
    //% block="$mode blocks from $begin to $end destination $dest mode $scan next $next"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executeIfBlocks(mode: ExecutePolarity,
        begin: MCFunctionPositionFields.PositionValue, end: MCFunctionPositionFields.PositionValue,
        dest: MCFunctionPositionFields.PositionValue, scan: ExecuteScanChoice,
        next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(mode==ExecutePolarity.If?MCFunctionAST.ExecuteClauseKind.IfBlocks:
            MCFunctionAST.ExecuteClauseKind.UnlessBlocks,next);
        v.clause.begin=begin ? begin.position : undefined;
        v.clause.end=end ? end.position : undefined;
        v.clause.destination=dest ? dest.position : undefined;
        v.clause.scan=<MCFunctionAST.ExecuteScan><number>scan;
        return v;
    }
    // The Selector-style compact clauses below reuse the same ordered ExecuteClause AST.
    // Each next input has a typed terminal shadow; terminal RUN remains a separate slot.
    export enum ExecuteTargetContextMode {
        //% block="as"
        As = 0,
        //% block="at"
        At = 1
    }
    export enum ExecutePositionContextMode {
        //% block="positioned"
        Positioned = 0,
        //% block="facing position"
        FacingPosition = 1
    }
    //% group="EXECUTE" weight=124
    //% blockId=mcfunction_execute_target_context_compact
    //% block="$mode entity $target next $next"
    //% target.shadow="mcfunction_target_selector"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executeTargetContext(mode: ExecuteTargetContextMode,
        target: MCFunctionFields.TargetValue,
        next: ExecuteClauseValue): ExecuteClauseValue {
        let k = mode == ExecuteTargetContextMode.As ?
            MCFunctionAST.ExecuteClauseKind.As : MCFunctionAST.ExecuteClauseKind.At;
        let v = clause(k, next);
        v.clause.target = target ? target.target : undefined;
        return v;
    }
    //% group="EXECUTE" weight=123
    //% blockId=mcfunction_execute_position_context_compact
    //% block="$mode $position next $next"
    //% position.shadow="mcfunction_position_absolute"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executePositionContext(mode: ExecutePositionContextMode,
        position: MCFunctionPositionFields.PositionValue,
        next: ExecuteClauseValue): ExecuteClauseValue {
        let k = mode == ExecutePositionContextMode.Positioned ?
            MCFunctionAST.ExecuteClauseKind.Positioned : MCFunctionAST.ExecuteClauseKind.FacingPosition;
        let v = clause(k, next);
        if (k == MCFunctionAST.ExecuteClauseKind.Positioned) {
            v.clause.position = position ? position.position : undefined;
        } else if (position) {
            v.clause.facing = MCFunctionAST.createFacingPosition(position.position);
        }
        return v;
    }
    // Legacy single-action blocks remain callable by older MakeCode JS projects;
    // hide only their toolbox entries, never change their blockIds or signatures.
    //% blockHidden=true
    //% group="EXECUTE" weight=120
    //% blockId=mcfunction_execute_as
    //% block="as $target next $next"
    //% target.shadow="mcfunction_target_selector"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executeAs(target: MCFunctionFields.TargetValue, next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(MCFunctionAST.ExecuteClauseKind.As,next); v.clause.target=target ? target.target : undefined; return v;
    }
    //% blockHidden=true
    //% group="EXECUTE" weight=119
    //% blockId=mcfunction_execute_at
    //% block="at $target next $next"
    //% target.shadow="mcfunction_target_selector"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executeAt(target: MCFunctionFields.TargetValue, next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(MCFunctionAST.ExecuteClauseKind.At,next); v.clause.target=target ? target.target : undefined; return v;
    }
    //% blockHidden=true
    //% group="EXECUTE" weight=118
    //% blockId=mcfunction_execute_positioned
    //% block="positioned $position next $next"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executePositioned(position: MCFunctionPositionFields.PositionValue,
        next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(MCFunctionAST.ExecuteClauseKind.Positioned,next);
        v.clause.position=position ? position.position : undefined; return v;
    }
    //% group="EXECUTE" weight=117
    //% blockId=mcfunction_execute_in
    //% block="in $dimension next $next"
    //% next.shadow="mcfunction_execute_end"
    export function executeIn(dimension: ExecuteDimensionChoice, next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(MCFunctionAST.ExecuteClauseKind.In,next);
        v.clause.dimension=<MCFunctionAST.ExecuteDimension><number>dimension; return v;
    }
    //% group="EXECUTE" weight=116
    //% blockId=mcfunction_execute_rotated
    //% block="rotated $rotation next $next"
    //% next.shadow="mcfunction_execute_end"
    export function executeRotated(rotation: MCFunctionRotationFields.RotationValue,
        next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(MCFunctionAST.ExecuteClauseKind.Rotated,next);
        v.clause.rotation=rotation ? rotation.rotation : undefined; return v;
    }
    //% blockHidden=true
    //% group="EXECUTE" weight=115
    //% blockId=mcfunction_execute_facing_position
    //% block="facing position $position next $next"
    //% next.shadow="mcfunction_execute_end"
    export function executeFacingPosition(position: MCFunctionPositionFields.PositionValue,
        next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(MCFunctionAST.ExecuteClauseKind.FacingPosition,next);
        if (position) v.clause.facing=MCFunctionAST.createFacingPosition(position.position);
        return v;
    }
    //% group="EXECUTE" weight=114
    //% blockId=mcfunction_execute_facing_entity
    //% block="facing entity $target anchor $anchor next $next"
    //% target.shadow="mcfunction_target_selector"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executeFacingEntity(target: MCFunctionFields.TargetValue,
        anchor: ExecuteAnchorChoice, next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(MCFunctionAST.ExecuteClauseKind.FacingEntity,next);
        if (target && target.target && target.target.kind == MCFunctionAST.PlayerTargetKind.Selector) {
            v.clause.facing=MCFunctionAST.createFacingEntity(target.target.selector,
                anchor == ExecuteAnchorChoice.Eyes ? MCFunctionAST.EntityAnchor.Eyes : MCFunctionAST.EntityAnchor.Feet);
        }
        return v;
    }
    //% group="EXECUTE" weight=113
    //% blockId=mcfunction_execute_align
    //% block="align axes $axes next $next"
    //% axes.shadow="text" axes.defl="xyz"
    //% next.shadow="mcfunction_execute_end"
    export function executeAlign(axes: string, next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(MCFunctionAST.ExecuteClauseKind.Align,next); v.clause.axes=axes; return v;
    }
    //% group="EXECUTE" weight=113
    //% blockId=mcfunction_execute_anchored
    //% block="anchored $anchor next $next"
    //% next.shadow="mcfunction_execute_end"
    export function executeAnchored(anchor: ExecuteAnchorChoice, next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(MCFunctionAST.ExecuteClauseKind.Anchored,next);
        v.clause.anchor=anchor == ExecuteAnchorChoice.Eyes ? MCFunctionAST.EntityAnchor.Eyes : MCFunctionAST.EntityAnchor.Feet;
        return v;
    }
    //% group="EXECUTE" weight=112
    //% blockId=mcfunction_execute_if_score
    //% block="$mode score target $target objective $objective matches $range next $next"
    //% objective.shadow="text" objective.defl="points"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executeIfScore(mode: ExecutePolarity, target: MCFunctionFields.TargetValue,
        objective: string, range: MCFunctionFields.RangeValue,
        next: ExecuteClauseValue): ExecuteClauseValue {
        let v=clause(mode==ExecutePolarity.If?MCFunctionAST.ExecuteClauseKind.IfScoreMatches:
            MCFunctionAST.ExecuteClauseKind.UnlessScoreMatches,next);
        v.clause.target=target ? target.target : undefined;
        v.clause.objective=objective;
        v.clause.scoreRange=range ? range.range : undefined; return v;
    }
    //% group="EXECUTE" weight=111
    //% blockId=mcfunction_execute_run_say
    //% block="run SAY $message"
    //% message.shadow="text" message.defl="C3 condition matched"
    export function executeRunSay(message: string): ExecuteRunValue {
        return new ExecuteRunValue(MCFunctionBlocks.createSayCommand(message));
    }
    //% group="EXECUTE" weight=110
    //% blockId=mcfunction_execute_run_scoreboard
    //% block="run SCOREBOARD $action"
    export function executeRunScoreboard(action: ScoreboardActionValue): ExecuteRunValue {
        return new ExecuteRunValue(action ? MCFunctionBlocks.createScoreboardCommand(action.command) : undefined);
    }
    //% group="EXECUTE" weight=109
    //% blockId=mcfunction_execute_run_raw
    //% block="run RAW COMMAND $line"
    //% line.shadow="text" line.defl="say Hello"
    export function executeRunRaw(line: string): ExecuteRunValue {
        return new ExecuteRunValue(MCFunctionAST.createRawCommand(line));
    }
}
