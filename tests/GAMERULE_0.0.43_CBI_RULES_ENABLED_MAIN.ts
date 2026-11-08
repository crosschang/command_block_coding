/**
 * TEMPORARY main.ts — test C: at least one valid GAMERULE LIST block.
 * Use alone, not together with the absent/invalid test fixtures.
 * Expected: cbi_rules 1 / 2 / 7 show Registry pages, one chat handler total.
 *          gate_list_1 and gate_list_2 each display the first page.
 */
FunctionFile.define("gate_list_1", function () {
    Command.gamerule(Command.gameruleListAction());
});

FunctionFile.define("gate_list_2", function () {
    Command.gamerule(Command.gameruleListAction());
});

FunctionFile.define("gate_other", function () {
    Command.gamerule(Command.gameruleQueryAction(
        MCFunctionGameruleLibrary.keepinventory()));
});
