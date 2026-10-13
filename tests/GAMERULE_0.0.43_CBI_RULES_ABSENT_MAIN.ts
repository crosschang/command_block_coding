/**
 * TEMPORARY main.ts — test A: no GAMERULE LIST block.
 * Start this program separately (not together with the other fixtures).
 * Expected: cbi_diag remains registered; cbi_rules does NOT register.
 */
FunctionFile.define("gate_set_only", function () {
    Command.gamerule(Command.gameruleBooleanAction(
        MCFunctionGameruleLibrary.showcoordinates(),
        MCFunctionFields.BooleanLiteral.True));
});

FunctionFile.define("gate_query_only", function () {
    Command.gamerule(Command.gameruleQueryAction(
        MCFunctionGameruleLibrary.keepinventory()));
});

FunctionFile.define("gate_say_only", function () {
    Command.say("Gate test: no gamerule LIST here");
});
