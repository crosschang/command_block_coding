/** EXECUTE creation by block shape. 
 * C-shaped mode captures ordered clause statements as AST and dispatches only
 * after the callback finishes, through the existing Command.execute route.
 * One-block mode delegates to the existing typed chain and RUN reporters.
 * Never assemble command-line text in a block.
 */
//% color=#7651A8 weight=102 icon="\uf04b" block="EXECUTE C자형"
//% groups='["C자형","실행 조건","위치와 회전","고급 조항","RUN"]'
namespace ExecuteC {
    class Draft {
        clauses: MCFunctionAST.ExecuteClause[];
        run: MCFunctionAST.CommandNode;
        hasRun: boolean;
        error: string;
        constructor() {
            this.clauses = [];
            this.run = undefined;
            this.hasRun = false;
            this.error = "";
        }
    }
    let active: Draft = undefined;

    function fail(message: string): void {
        if (active) {
            if (!active.error) active.error = message;
        } else {
            MCFunctionPreview.previewSay("ERROR [EXECUTE_C_CONTEXT] " + message);
        }
    }

    function append(value: Command.ExecuteClauseValue): void {
        if (!active) { fail("An EXECUTE clause belongs inside EXECUTE C."); return; }
        if (active.hasRun) { fail("EXECUTE clauses cannot follow RUN."); return; }
        if (!value || !value.clause) { fail("An EXECUTE clause is missing."); return; }
        let slow = value;
        let fast = value;
        while (fast && fast.next) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) { fail("Cyclic EXECUTE clauses were rejected."); return; }
        }
        let part = value;
        while (part && part.clause) {
            active.clauses.push(part.clause);
            part = part.next;
        }
    }

    //% group="C자형" weight=150
    //% blockId=mcfunction_execute_c_root
    //% block="EXECUTE (C자형)"
    //% handlerStatement=1
    export function execute(handler: () => void): void {
        if (active) { fail("Nested EXECUTE C blocks are not supported; use RUN EXECUTE."); return; }
        let draft = new Draft();
        active = draft;
        handler();
        active = undefined;
        if (draft.error) {
            MCFunctionPreview.previewSay("ERROR [EXECUTE_C_STRUCTURE] " + draft.error);
            return;
        }
        if (!draft.hasRun || !draft.run) {
            MCFunctionPreview.previewSay("ERROR [EXECUTE_C_RUN_MISSING] A RUN command is required.");
            return;
        }
        // Rebuild the same typed chain consumed by existing validated Preview/Bridge.
        let next = Command.executeEnd();
        for (let i = draft.clauses.length - 1; i >= 0; i--) {
            next = new Command.ExecuteClauseValue(draft.clauses[i], next);
        }
        Command.execute(next, new Command.ExecuteRunValue(draft.run));
    }

    //% group="실행 조건" weight=145
    //% blockId=mcfunction_execute_c_as
    //% block="as entity $target"
    //% target.shadow="mcfunction_target_selector"
    export function asEntity(target: MCFunctionFields.TargetValue): void {
        append(Command.executeAs(target, Command.executeEnd()));
    }
    //% group="실행 조건" weight=144
    //% blockId=mcfunction_execute_c_at
    //% block="at entity $target"
    //% target.shadow="mcfunction_target_selector"
    export function atEntity(target: MCFunctionFields.TargetValue): void {
        append(Command.executeAt(target, Command.executeEnd()));
    }
    //% group="실행 조건" weight=143
    //% blockId=mcfunction_execute_c_in
    //% block="in dimension $dimension"
    export function inDimension(dimension: Command.ExecuteDimensionChoice): void {
        append(Command.executeIn(dimension, Command.executeEnd()));
    }
    //% group="위치와 회전" weight=142
    //% blockId=mcfunction_execute_c_positioned
    //% block="positioned $position"
    //% position.shadow="mcfunction_position_absolute"
    export function positioned(position: MCFunctionPositionFields.PositionValue): void {
        append(Command.executePositioned(position, Command.executeEnd()));
    }
    //% group="위치와 회전" weight=141
    //% blockId=mcfunction_execute_c_rotated
    //% block="rotated $rotation"
    export function rotated(rotation: MCFunctionRotationFields.RotationValue): void {
        append(Command.executeRotated(rotation, Command.executeEnd()));
    }
    //% group="위치와 회전" weight=140
    //% blockId=mcfunction_execute_c_facing_position
    //% block="facing position $position"
    //% position.shadow="mcfunction_position_absolute"
    export function facingPosition(position: MCFunctionPositionFields.PositionValue): void {
        append(Command.executeFacingPosition(position, Command.executeEnd()));
    }
    //% group="위치와 회전" weight=139
    //% blockId=mcfunction_execute_c_facing_entity
    //% block="facing entity $target anchor $anchor"
    //% target.shadow="mcfunction_target_selector"
    export function facingEntity(target: MCFunctionFields.TargetValue,
        anchor: Command.ExecuteAnchorChoice): void {
        append(Command.executeFacingEntity(target, anchor, Command.executeEnd()));
    }
    //% group="위치와 회전" weight=138
    //% blockId=mcfunction_execute_c_align
    //% block="align axes $axes"
    //% axes.shadow="text" axes.defl="xyz"
    export function align(axes: string): void {
        append(Command.executeAlign(axes, Command.executeEnd()));
    }
    //% group="위치와 회전" weight=137
    //% blockId=mcfunction_execute_c_anchored
    //% block="anchored $anchor"
    export function anchored(anchor: Command.ExecuteAnchorChoice): void {
        append(Command.executeAnchored(anchor, Command.executeEnd()));
    }
    //% group="실행 조건" weight=136
    //% blockId=mcfunction_execute_c_if_entity
    //% block="$mode entity $target"
    //% target.shadow="mcfunction_target_selector"
    export function ifEntity(mode: Command.ExecutePolarity,
        target: MCFunctionFields.TargetValue): void {
        append(Command.executeIfEntity(mode, target, Command.executeEnd()));
    }
    //% group="실행 조건" weight=135
    //% blockId=mcfunction_execute_c_if_block
    //% block="$mode block at $position block $block"
    //% position.shadow="mcfunction_position_absolute"
    //% block.shadow="mcfunction_block_custom_id"
    export function ifBlock(mode: Command.ExecutePolarity,
        position: MCFunctionPositionFields.PositionValue, block: MCFunctionFields.BlockValue): void {
        append(Command.executeIfBlock(mode, position, block, Command.executeEnd()));
    }
    //% group="실행 조건" weight=134
    //% blockId=mcfunction_execute_c_if_blocks
    //% block="$mode blocks from $begin to $end destination $dest scan $scan"
    export function ifBlocks(mode: Command.ExecutePolarity,
        begin: MCFunctionPositionFields.PositionValue, end: MCFunctionPositionFields.PositionValue,
        dest: MCFunctionPositionFields.PositionValue, scan: Command.ExecuteScanChoice): void {
        append(Command.executeIfBlocks(mode, begin, end, dest, scan, Command.executeEnd()));
    }
    //% group="실행 조건" weight=133
    //% blockId=mcfunction_execute_c_if_score
    //% block="$mode score target $target objective $objective matches $range"
    //% target.shadow="mcfunction_target_selector"
    //% objective.shadow="text" objective.defl="points"
    export function ifScore(mode: Command.ExecutePolarity, target: MCFunctionFields.TargetValue,
        objective: string, range: MCFunctionFields.RangeValue): void {
        append(Command.executeIfScore(mode, target, objective, range, Command.executeEnd()));
    }
    //% group="실행 조건" weight=132
    //% blockId=mcfunction_execute_c_if_score_compare
    //% block="$mode score target $target objective $objective $comparison source $source source objective $sourceObjective"
    //% target.shadow="mcfunction_target_selector"
    //% source.shadow="mcfunction_target_selector"
    //% objective.shadow="text" objective.defl="points"
    //% sourceObjective.shadow="text" sourceObjective.defl="points"
    export function ifScoreCompare(mode: Command.ExecutePolarity,
        target: MCFunctionFields.TargetValue, objective: string,
        comparison: Command.ExecuteCompareChoice, source: MCFunctionFields.TargetValue,
        sourceObjective: string): void {
        append(Command.executeIfScoreCompare(mode, target, objective, comparison,
            source, sourceObjective, Command.executeEnd()));
    }
    //% group="고급 조항" weight=129
    //% blockId=mcfunction_execute_c_clause
    //% block="EXECUTE clause $value"
    //% value.shadow="mcfunction_execute_end"
    export function clause(value: Command.ExecuteClauseValue): void {
        append(value);
    }

    //% group="RUN" weight=150
    //% blockId=mcfunction_execute_c_run
    //% block="RUN $action"
    //% action.shadow="mcfunction_execute_run_group_say"
    export function run(action: Command.ExecuteRunValue): void {
        if (!active) { fail("RUN must be inside EXECUTE C."); return; }
        if (active.hasRun) { fail("Only one RUN is allowed."); return; }
        active.hasRun = true;
        if (!action || !action.command) { fail("RUN requires a command."); return; }
        active.run = action.command;
    }
}

//% color=#7651A8 weight=101 icon="\uf04b" block="EXECUTE 원블록"
//% groups='["실행","조립","EXECUTE","FILL","SETBLOCK","GIVE","TAG","TELEPORT","SUMMON","EFFECT","CLEAR","GAMEMODE","SETWORLDSPAWN","SPAWNPOINT","INPUTPERMISSION","HUD","CAMERA","CAMERASHAKE","DIFFICULTY","WEATHER","TIME","TELL","ENCHANT","MUSIC","SOUND","PARTICLE","CLONE","AIMASSIST","CONTROLSCHEME","EVENT","DAMAGE","FOG","PLAYANIMATION","DIALOGUE","RIDE","GAMERULE","KILL","FUNCTION","RAW COMMAND","SCOREBOARD","SAY"]'
namespace ExecuteOne {
    //% group="실행" weight=140
    //% blockId=mcfunction_execute_one_execute
    //% block="EXECUTE clauses $clauses RUN $run"
    //% clauses.shadow="mcfunction_execute_end"
    //% run.shadow="mcfunction_execute_run_group_say"
    //% inlineInputMode=external
    export function execute(clauses: Command.ExecuteClauseValue,
        run: Command.ExecuteRunValue): void {
        Command.execute(clauses, run);
    }
    //% group="조립" weight=139
    //% blockId=mcfunction_execute_one_command
    //% block="EXECUTE command clauses $clauses RUN $run"
    //% clauses.shadow="mcfunction_execute_end"
    //% run.shadow="mcfunction_execute_run_group_say"
    //% inlineInputMode=external
    export function command(clauses: Command.ExecuteClauseValue,
        run: Command.ExecuteRunValue): Command.ExecuteRunValue {
        // AST-only reporter; does NOT run the command or invoke Preview.
        return MCFunctionExecuteRun.nestedExecute(clauses, run);
    }
}
