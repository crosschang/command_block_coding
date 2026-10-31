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
    /** The same route as other Command AST blocks; legacy OFF stays unchanged. */
    function executeC3ThroughRuntime(command: MCFunctionAST.ExecuteCommand): void {
        // P2c-3: preserve existing Execute AST.
        if (MCFunctionTagListDirect.tryDisplay(command)) return;
        if (MCFunctionRuntime.resolve(command) == MCFunctionRuntime.Route.Bridge) {
            MCFunctionCBX12Bridge.execute(command);
        } else {
            MCFunctionExecutePreview.execute(command);
        }
    }
    //% group="EXECUTE" weight=125
    //% blockId=command_execute_unified
    //% block="EXECUTE clauses $clauses RUN $run"
    //% clauses.shadow="mcfunction_execute_end"
    //% run.shadow="mcfunction_execute_run_group_say"
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
            executeC3ThroughRuntime(cmd);
        }, cmd)) return;
        if (MCFunctionValidator.hasError(issues)) {
            MCFunctionPreview.previewSay("ERROR [EXECUTE_VALIDATION] Invalid EXECUTE definition; RUN blocked.");
            return;
        }
        executeC3ThroughRuntime(cmd);
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
    export enum ExecuteEntityContextMode {
        //% block="positioned as"
        PositionedAs = 0,
        //% block="rotated as"
        RotatedAs = 1
    }
    //% group="EXECUTE" weight=124
    //% blockId=mcfunction_execute_as_context_compact
    //% block="$mode entity $target next $next"
    //% target.shadow="mcfunction_target_selector"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executeEntityContext(mode: ExecuteEntityContextMode,
        target: MCFunctionFields.TargetValue, next: ExecuteClauseValue): ExecuteClauseValue {
        let k = mode == ExecuteEntityContextMode.PositionedAs ?
            MCFunctionAST.ExecuteClauseKind.PositionedAs : MCFunctionAST.ExecuteClauseKind.RotatedAs;
        let v = clause(k, next);
        v.clause.target = target ? target.target : undefined;
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
    //% group="EXECUTE" weight=121
    //% blockId=mcfunction_execute_if_block_states
    //% block="$mode block at $position block $block states $states next $next"
    //% position.shadow="mcfunction_position_absolute"
    //% block.shadow="mcfunction_block_custom_id"
    //% states.shadow="mcfunction_block_states_none"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executeIfBlockStates(mode: ExecutePolarity,
        position: MCFunctionPositionFields.PositionValue, block: MCFunctionFields.BlockValue,
        states: MCFunctionBlockStateFields.BlockStatesValue,
        next: ExecuteClauseValue): ExecuteClauseValue {
        let v = executeIfBlock(mode, position, block, next);
        v.clause.blockStates = states ? states.states : undefined;
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
    export enum ExecuteCompareChoice {
        //% block="="
        Equal = 0,
        //% block="<"
        Less = 1,
        //% block="<="
        LessOrEqual = 2,
        //% block=">"
        Greater = 3,
        //% block=">="
        GreaterOrEqual = 4
    }
    //% group="EXECUTE" weight=112
    //% blockId=mcfunction_execute_if_score_compare
    //% block="$mode score target $target objective $objective comparator $operation source $source objective $sourceObjective next $next"
    //% target.shadow="mcfunction_target_selector"
    //% source.shadow="mcfunction_target_selector"
    //% objective.shadow="text" objective.defl="points"
    //% sourceObjective.shadow="text" sourceObjective.defl="points"
    //% next.shadow="mcfunction_execute_end"
    //% inlineInputMode=external
    export function executeIfScoreCompare(mode: ExecutePolarity, target: MCFunctionFields.TargetValue,
        objective: string, operation: ExecuteCompareChoice, source: MCFunctionFields.TargetValue,
        sourceObjective: string, next: ExecuteClauseValue): ExecuteClauseValue {
        let v = clause(mode == ExecutePolarity.If ? MCFunctionAST.ExecuteClauseKind.IfScoreCompare :
            MCFunctionAST.ExecuteClauseKind.UnlessScoreCompare, next);
        v.clause.target = target ? target.target : undefined;
        v.clause.objective = objective;
        v.clause.scoreComparison = <MCFunctionAST.ExecuteScoreComparison><number>operation;
        v.clause.sourceTarget = source ? source.target : undefined;
        v.clause.sourceObjective = sourceObjective;
        return v;
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=111
    //% blockId=mcfunction_execute_run_say
    //% block="run SAY $message"
    //% message.shadow="text" message.defl="C3 condition matched"
    export function executeRunSay(message: string): ExecuteRunValue {
        return MCFunctionExecuteRun.say(message);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=110
    //% blockId=mcfunction_execute_run_scoreboard
    //% block="run SCOREBOARD $action"
    export function executeRunScoreboard(action: ScoreboardActionValue): ExecuteRunValue {
        return MCFunctionExecuteRun.scoreboard(action);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=109
    //% blockId=mcfunction_execute_run_raw
    //% block="run RAW COMMAND $line"
    //% line.shadow="text" line.defl="say Hello"
    export function executeRunRaw(line: string): ExecuteRunValue {
        return MCFunctionExecuteRun.raw(line);
    }
    // Typed RUN reporters wrap the shared AST constructors; no Minecraft command
    // strings are assembled in the block layer. Existing Say/Scoreboard/Raw remain.
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=108
    //% blockId=mcfunction_execute_run_function
    //% block="run FUNCTION $functionId"
    //% functionId.shadow="text" functionId.defl="test/example"
    export function executeRunFunction(functionId: string): ExecuteRunValue {
        return MCFunctionExecuteRun.mcfunction(functionId);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=107
    //% blockId=mcfunction_execute_run_kill
    //% block="run KILL $target"
    //% target.shadow="mcfunction_selector_self"
    export function executeRunKill(target: MCFunctionFields.SelectorValue): ExecuteRunValue {
        return MCFunctionExecuteRun.kill(target);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=106
    //% blockId=mcfunction_execute_run_setblock
    //% block="run SETBLOCK position $position block $block states $states"
    //% position.shadow="mcfunction_position_absolute"
    //% block.shadow="mcfunction_block_custom_id"
    //% states.shadow="mcfunction_block_states_none"
    //% inlineInputMode=external
    export function executeRunSetBlock(position: MCFunctionPositionFields.PositionValue,
        block: MCFunctionFields.BlockValue,
        states: MCFunctionBlockStateFields.BlockStatesValue): ExecuteRunValue {
        return MCFunctionExecuteRun.setblock(position, block, states);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=105
    //% blockId=mcfunction_execute_run_summon
    //% block="run SUMMON entity $entity at $position"
    //% entity.shadow="mcfunction_entity_select"
    //% position.shadow="mcfunction_position_absolute"
    //% inlineInputMode=external
    export function executeRunSummon(entity: MCFunctionFields.EntityValue,
        position: MCFunctionPositionFields.PositionValue): ExecuteRunValue {
        return MCFunctionExecuteRun.summon(entity, position);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=104
    //% blockId=mcfunction_execute_run_tag
    //% block="run TAG target $target add $tag"
    //% target.shadow="mcfunction_selector_self"
    //% tag.shadow="text" tag.defl="c3_test"
    //% inlineInputMode=external
    export function executeRunTag(target: MCFunctionFields.SelectorValue,
        tag: string): ExecuteRunValue {
        return MCFunctionExecuteRun.tag(target, tag);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=103
    //% blockId=mcfunction_execute_run_tp
    //% block="run TP target $target destination $position"
    //% target.shadow="mcfunction_target_selector"
    //% position.shadow="mcfunction_position_absolute"
    //% inlineInputMode=external
    export function executeRunTp(target: MCFunctionFields.TargetValue,
        position: MCFunctionPositionFields.PositionValue): ExecuteRunValue {
        return MCFunctionExecuteRun.teleport(target, position);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=102
    //% blockId=mcfunction_execute_run_give
    //% block="run GIVE $target item $item count $amount"
    //% target.shadow="mcfunction_selector_self"
    //% item.shadow="mcfunction_item_custom_id"
    //% amount.defl=1
    //% inlineInputMode=external
    export function executeRunGive(target: MCFunctionFields.SelectorValue,
        item: string, amount: number): ExecuteRunValue {
        return MCFunctionExecuteRun.give(target, item, amount);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=101
    //% blockId=mcfunction_execute_run_fill
    //% block="run FILL from $from to $to block $block states $states"
    //% from.shadow="mcfunction_position_absolute"
    //% to.shadow="mcfunction_position_absolute"
    //% block.shadow="mcfunction_block_custom_id"
    //% states.shadow="mcfunction_block_states_none"
    //% inlineInputMode=external
    export function executeRunFill(from: MCFunctionPositionFields.PositionValue,
        to: MCFunctionPositionFields.PositionValue, block: MCFunctionFields.BlockValue,
        states: MCFunctionBlockStateFields.BlockStatesValue): ExecuteRunValue {
        return MCFunctionExecuteRun.fill(from, to, block, states);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=100
    //% blockId=mcfunction_execute_run_gamerule
    //% block="run GAMERULE $action"
    export function executeRunGamerule(action: GameRuleOperationValue): ExecuteRunValue {
        return MCFunctionExecuteRun.gamerule(action);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=99
    //% blockId=mcfunction_execute_run_ride
    //% block="run RIDE target $target action $action"
    //% target.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_ride_action_stop"
    //% inlineInputMode=external
    export function executeRunRide(target: MCFunctionFields.TargetValue,
        action: RideActionValue): ExecuteRunValue {
        return MCFunctionExecuteRun.ride(target, action);
    }
    // Deprecated but callable legacy block. New editor blocks live in MCFunctionExecuteRun.
    //% blockHidden=true
    //% group="EXECUTE" weight=98
    //% blockId=mcfunction_execute_run_dialogue
    //% block="run DIALOGUE NPC $npc action $action"
    //% npc.shadow="mcfunction_target_selector"
    //% action.shadow="mcfunction_dialogue_action_open"
    //% inlineInputMode=external
    export function executeRunDialogue(npc: MCFunctionFields.TargetValue,
        action: DialogueActionValue): ExecuteRunValue {
        return MCFunctionExecuteRun.dialogue(npc, action);
    }
}
