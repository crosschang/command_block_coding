/** C2 SCOREBOARD unified MakeCode block surface. All grammar lives in typed AST/compiler. */
namespace Command {
    export class ScoreboardActionValue {
        command: MCFunctionAST.ScoreboardCommand;
        constructor(command: MCFunctionAST.ScoreboardCommand) { this.command = command; }
    }
    export enum ScoreboardNumberMode {
        //% block="set"
        Set = 0,
        //% block="add"
        Add = 1,
        //% block="remove"
        Remove = 2
    }
    /** Compact objective lifecycle. The game only supports dummy criteria. */
    export enum ScoreboardObjectiveEditChoice {
        //% block="add"
        Add = 0,
        //% block="remove"
        Remove = 1
    }
    /** Sort 0 encodes the absence of a command argument, not a new command token. */
    export enum ScoreboardDisplaySortMode {
        //% block="no sorting"
        None = 0,
        //% block="ascending"
        Ascending = 1,
        //% block="descending"
        Descending = 2
    }
    export enum ScoreboardSlotChoice {
        //% block="sidebar"
        Sidebar = 0,
        //% block="list"
        List = 1,
        //% block="belowname"
        BelowName = 2
    }
    export enum ScoreboardSortChoice {
        //% block="ascending"
        Ascending = 0,
        //% block="descending"
        Descending = 1
    }
    export enum ScoreboardOperatorChoice {
        //% block="="
        Assign = 0,
        //% block="+="
        Add = 1,
        //% block="-="
        Subtract = 2,
        //% block="*="
        Multiply = 3,
        //% block="/="
        Divide = 4,
        //% block="%="
        Modulo = 5,
        //% block="< (minimum)"
        Minimum = 6,
        //% block="> (maximum)"
        Maximum = 7,
        //% block=">< (swap)"
        Swap = 8
    }
    //% group="SCOREBOARD" weight=120
    //% blockId=command_scoreboard_unified
    //% block="SCOREBOARD action $action"
    //% action.shadow="mcfunction_scoreboard_objective_manage_compact"
    //% inlineInputMode=external
    export function scoreboard(action: ScoreboardActionValue): void {
        let command = action ? MCFunctionBlocks.createScoreboardCommand(action.command) :
            MCFunctionAST.createScoreboardCommand(<MCFunctionAST.ScoreboardAction>-1);
        executeAudioCommand(command);
    }
    /** Fake-player scoreboard holders reuse the shared literal PlayerTarget AST. */
    //% group="SCOREBOARD" weight=111
    //% blockId=mcfunction_scoreboard_fake_player
    //% block="fake player $name"
    //% name.shadow="text" name.defl="#counter"
    export function scoreboardFakePlayer(name: string): MCFunctionFields.TargetValue {
        return MCFunctionFields.namedPlayerTarget(name);
    }
    /** Unified objectives add/remove: command semantics stay in typed AST. */
    //% group="SCOREBOARD" weight=116
    //% blockId=mcfunction_scoreboard_objective_manage_compact
    //% block="objective $mode name $objective || display name $displayName"
    //% expandableArgumentMode="enabled"
    //% objective.shadow="text" objective.defl="c2_points"
    //% displayName.shadow="text" displayName.defl=""
    export function scoreboardObjectiveManage(mode: ScoreboardObjectiveEditChoice,
        objective: string, displayName?: string): ScoreboardActionValue {
        let action = mode == ScoreboardObjectiveEditChoice.Add ?
            MCFunctionAST.ScoreboardAction.ObjectiveAdd : MCFunctionAST.ScoreboardAction.ObjectiveRemove;
        let cmd = MCFunctionAST.createScoreboardCommand(action);
        cmd.objective = objective;
        if (displayName && displayName.length > 0) cmd.displayName = displayName;
        return new ScoreboardActionValue(cmd);
    }
    /** Unified display/setdisplay, sorted or unsorted, including clearing a slot. */
    //% group="SCOREBOARD" weight=113
    //% blockId=mcfunction_scoreboard_objective_display_compact
    //% block="display $slot objective $objective sort $sort"
    //% inlineInputMode=external
    //% objective.shadow="text" objective.defl="c2_points"
    export function scoreboardObjectiveDisplayCompact(slot: ScoreboardSlotChoice,
        objective: string, sort: ScoreboardDisplaySortMode): ScoreboardActionValue {
        let cmd = MCFunctionAST.createScoreboardCommand(MCFunctionAST.ScoreboardAction.ObjectiveDisplay);
        cmd.slot = <MCFunctionAST.ScoreboardDisplaySlot><number>slot;
        if (objective && objective.length > 0) cmd.objective = objective;
        if (sort == ScoreboardDisplaySortMode.Ascending) {
            cmd.sortOrder = MCFunctionAST.ScoreboardSortOrder.Ascending;
        } else if (sort == ScoreboardDisplaySortMode.Descending) {
            cmd.sortOrder = MCFunctionAST.ScoreboardSortOrder.Descending;
        }
        return new ScoreboardActionValue(cmd);
    }
    //% blockHidden=true
    //% group="SCOREBOARD" weight=110
    //% blockId=mcfunction_scoreboard_objective_add
    //% block="objective add $objective || display name $displayName"
    //% expandableArgumentMode="enabled"
    //% objective.shadow="text" objective.defl="c2_points"
    //% displayName.shadow="text" displayName.defl=""
    export function scoreboardObjectiveAdd(objective: string, displayName?: string): ScoreboardActionValue {
        let cmd = MCFunctionAST.createScoreboardCommand(MCFunctionAST.ScoreboardAction.ObjectiveAdd);
        cmd.objective = objective;
        if (displayName && displayName.length > 0) cmd.displayName = displayName;
        return new ScoreboardActionValue(cmd);
    }
    //% group="SCOREBOARD" weight=109
    //% blockHidden=true
    //% blockId=mcfunction_scoreboard_objective_remove
    //% block="objective remove $objective"
    //% objective.shadow="text" objective.defl="c2_points"
    export function scoreboardObjectiveRemove(objective: string): ScoreboardActionValue {
        let cmd = MCFunctionAST.createScoreboardCommand(MCFunctionAST.ScoreboardAction.ObjectiveRemove);
        cmd.objective = objective;
        return new ScoreboardActionValue(cmd);
    }
    //% group="SCOREBOARD" weight=108
    //% blockId=mcfunction_scoreboard_objective_list
    //% block="list objectives"
    export function scoreboardObjectiveList(): ScoreboardActionValue {
        return new ScoreboardActionValue(MCFunctionAST.createScoreboardCommand(MCFunctionAST.ScoreboardAction.ObjectiveList));
    }
    //% group="SCOREBOARD" weight=107
    //% blockHidden=true
    //% blockId=mcfunction_scoreboard_objective_display
    //% block="display in $slot || objective $objective"
    //% expandableArgumentMode="enabled"
    //% objective.shadow="text" objective.defl="c2_points"
    export function scoreboardObjectiveDisplay(slot: ScoreboardSlotChoice,
        objective?: string): ScoreboardActionValue {
        let cmd = MCFunctionAST.createScoreboardCommand(MCFunctionAST.ScoreboardAction.ObjectiveDisplay);
        cmd.slot = <MCFunctionAST.ScoreboardDisplaySlot><number>slot;
        if (objective && objective.length > 0) cmd.objective = objective;
        return new ScoreboardActionValue(cmd);
    }
    //% group="SCOREBOARD" weight=106
    //% blockHidden=true
    //% blockId=mcfunction_scoreboard_objective_sorted_display
    //% block="display in $slot objective $objective sort $sort"
    //% objective.shadow="text" objective.defl="c2_points"
    export function scoreboardObjectiveSortedDisplay(slot: ScoreboardSlotChoice,
        objective: string, sort: ScoreboardSortChoice): ScoreboardActionValue {
        let cmd = MCFunctionAST.createScoreboardCommand(MCFunctionAST.ScoreboardAction.ObjectiveDisplay);
        cmd.slot = <MCFunctionAST.ScoreboardDisplaySlot><number>slot;
        cmd.objective = objective;
        cmd.sortOrder = <MCFunctionAST.ScoreboardSortOrder><number>sort;
        return new ScoreboardActionValue(cmd);
    }
    //% group="SCOREBOARD" weight=105
    //% blockId=mcfunction_scoreboard_players_score
    //% block="players $mode target $target objective $objective amount $count"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% objective.shadow="text" objective.defl="c2_points"
    //% count.defl=1
    export function scoreboardPlayersScore(mode: ScoreboardNumberMode,
        target: MCFunctionFields.TargetValue, objective: string, count: number): ScoreboardActionValue {
        let action = mode == ScoreboardNumberMode.Set ? MCFunctionAST.ScoreboardAction.PlayerSet :
            mode == ScoreboardNumberMode.Add ? MCFunctionAST.ScoreboardAction.PlayerAdd :
            MCFunctionAST.ScoreboardAction.PlayerRemove;
        let cmd = MCFunctionAST.createScoreboardCommand(action);
        cmd.target = target ? target.target : undefined;
        cmd.objective = objective;
        cmd.count = count;
        return new ScoreboardActionValue(cmd);
    }
    //% group="SCOREBOARD" weight=104
    //% blockId=mcfunction_scoreboard_players_reset
    //% block="reset score target $target || objective $objective"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_target_selector"
    //% objective.shadow="text" objective.defl=""
    export function scoreboardPlayersReset(target: MCFunctionFields.TargetValue,
        objective?: string): ScoreboardActionValue {
        let cmd = MCFunctionAST.createScoreboardCommand(MCFunctionAST.ScoreboardAction.PlayerReset);
        cmd.target = target ? target.target : undefined;
        if (objective && objective.length > 0) cmd.objective = objective;
        return new ScoreboardActionValue(cmd);
    }
    //% group="SCOREBOARD" weight=103
    //% blockId=mcfunction_scoreboard_players_list
    //% block="list players || target $target"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_target_selector"
    export function scoreboardPlayersList(target?: MCFunctionFields.TargetValue): ScoreboardActionValue {
        let cmd = MCFunctionAST.createScoreboardCommand(MCFunctionAST.ScoreboardAction.PlayerList);
        if (target) cmd.target = target.target;
        return new ScoreboardActionValue(cmd);
    }
    //% group="SCOREBOARD" weight=102
    //% blockId=mcfunction_scoreboard_players_operation
    //% block="score $target objective $objective $operator source $source source objective $sourceObjective"
    //% inlineInputMode=external
    //% target.shadow="mcfunction_target_selector"
    //% objective.shadow="text" objective.defl="c2_points"
    //% source.shadow="mcfunction_target_selector"
    //% sourceObjective.shadow="text" sourceObjective.defl="c2_points"
    export function scoreboardPlayersOperation(target: MCFunctionFields.TargetValue,
        objective: string, operator: ScoreboardOperatorChoice,
        source: MCFunctionFields.TargetValue, sourceObjective: string): ScoreboardActionValue {
        let cmd = MCFunctionAST.createScoreboardCommand(MCFunctionAST.ScoreboardAction.PlayerOperation);
        cmd.target = target ? target.target : undefined;
        cmd.objective = objective;
        cmd.operator = <MCFunctionAST.ScoreboardMathOperator><number>operator;
        cmd.source = source ? source.target : undefined;
        cmd.sourceObjective = sourceObjective;
        return new ScoreboardActionValue(cmd);
    }
    //% group="SCOREBOARD" weight=101
    //% blockId=mcfunction_scoreboard_players_test
    //% block="test score target $target objective $objective min $minimum || max $maximum"
    //% expandableArgumentMode="enabled"
    //% target.shadow="mcfunction_target_selector"
    //% objective.shadow="text" objective.defl="c2_points"
    //% minimum.shadow="text" minimum.defl="*"
    //% maximum.shadow="text" maximum.defl="*"
    export function scoreboardPlayersTest(target: MCFunctionFields.TargetValue,
        objective: string, minimum: string, maximum?: string): ScoreboardActionValue {
        let cmd = MCFunctionAST.createScoreboardCommand(MCFunctionAST.ScoreboardAction.PlayerTest);
        cmd.target = target ? target.target : undefined;
        cmd.objective = objective;
        cmd.minimum = minimum;
        if (maximum && maximum.length > 0) cmd.maximum = maximum;
        return new ScoreboardActionValue(cmd);
    }
    //% group="SCOREBOARD" weight=100
    //% blockId=mcfunction_scoreboard_players_random
    //% block="random score target $target objective $objective min $minimum max $maximum"
    //% target.shadow="mcfunction_target_selector"
    //% objective.shadow="text" objective.defl="c2_points"
    //% minimum.defl=1 maximum.defl=10
    export function scoreboardPlayersRandom(target: MCFunctionFields.TargetValue,
        objective: string, minimum: number, maximum: number): ScoreboardActionValue {
        let cmd = MCFunctionAST.createScoreboardCommand(MCFunctionAST.ScoreboardAction.PlayerRandom);
        cmd.target = target ? target.target : undefined;
        cmd.objective = objective;
        cmd.minimum = "" + minimum;
        cmd.maximum = "" + maximum;
        return new ScoreboardActionValue(cmd);
    }
}
