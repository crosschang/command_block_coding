/** Temporary MakeCode main.ts fixture. Copy only after backing up main.ts.
 * Definitions do NOT modify world state. Only running the chat functions will. */
FunctionFile.define("g42_bool_on", function () {
    Command.gamerule(Command.gameruleBooleanAction(
        MCFunctionGameruleLibrary.showcoordinates(), MCFunctionFields.BooleanLiteral.True));
});
FunctionFile.define("g42_bool_off", function () {
    Command.gamerule(Command.gameruleBooleanAction(
        MCFunctionGameruleLibrary.showcoordinates(), MCFunctionFields.BooleanLiteral.False));
});
FunctionFile.define("g42_int", function () {
    Command.gamerule(Command.gameruleIntegerAction(
        MCFunctionGameruleLibrary.randomtickspeed(), 1));
});
FunctionFile.define("g42_query", function () {
    Command.gamerule(Command.gameruleQueryAction(
        MCFunctionGameruleLibrary.keepinventory()));
});
FunctionFile.define("g42_list", function () {
    Command.gamerule(Command.gameruleListAction());
});
FunctionFile.define("g42_unknown", function () {
    Command.gamerule(Command.gameruleBooleanAction(
        MCFunctionGameruleLibrary.custom("futuregamerule"), MCFunctionFields.BooleanLiteral.True));
});
FunctionFile.define("g42_bad_type", function () {
    Command.gamerule(Command.gameruleIntegerAction(
        MCFunctionGameruleLibrary.keepinventory(), 1));
});
FunctionFile.define("g42_bad_integer", function () {
    Command.gamerule(Command.gameruleIntegerAction(
        MCFunctionGameruleLibrary.randomtickspeed(), 1.5));
});
FunctionFile.define("g42_enum", function () {
    Command.gamerule(Command.gameruleEnumAction(
        MCFunctionGameruleLibrary.playerwaypoints(), "everyone"));
});
