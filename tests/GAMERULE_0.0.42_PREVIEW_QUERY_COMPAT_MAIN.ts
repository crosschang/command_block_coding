/**
 * 0.0.42 Gamerule Preview compatibility fixture.
 * Temporary main.ts only, never part of the canonical .mcfunction.
 * Confirm gameplay state before applying world-mutating test commands.
 */
FunctionFile.define("g42p_query_unknown", function () {
    Command.gamerule(Command.gameruleQueryAction(
        MCFunctionGameruleLibrary.keepinventory()));
});

FunctionFile.define("g42p_list", function () {
    Command.gamerule(Command.gameruleListAction());
});

FunctionFile.define("g42p_set_off", function () {
    Command.gamerule(Command.gameruleBooleanAction(
        MCFunctionGameruleLibrary.showcoordinates(),
        MCFunctionFields.BooleanLiteral.False));
});

FunctionFile.define("g42p_set_on", function () {
    Command.gamerule(Command.gameruleBooleanAction(
        MCFunctionGameruleLibrary.showcoordinates(),
        MCFunctionFields.BooleanLiteral.True));
});

FunctionFile.define("g42p_query_known", function () {
    Command.gamerule(Command.gameruleQueryAction(
        MCFunctionGameruleLibrary.showcoordinates()));
});

FunctionFile.define("g42p_enum", function () {
    Command.gamerule(Command.gameruleEnumAction(
        MCFunctionGameruleLibrary.playerwaypoints(), "off"));
});
