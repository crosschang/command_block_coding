/**
 * Copy one FunctionFile.define() at a time into main.ts to test the shared
 * SELECTOR named-player reporter. Replace Steve and Alex with real players.
 * TP changes actual player positions. Use a disposable test world only.
 * Keep test.ts empty; this file is not registered in pxt.json.
 */
FunctionFile.define("named_tp_victim", function () {
    Command.teleportTargetReference(
        MCFunctionFields.namedPlayerTarget("Steve"),
        Command.teleportDestinationPosition(MCFunctionPositionFields.absolute(10, 80, 10)),
        MCFunctionFields.BooleanLiteral.False
    );
});

FunctionFile.define("named_tp_destination", function () {
    Command.teleportSelf(
        Command.teleportDestinationTarget(MCFunctionFields.namedPlayerTarget("Alex")),
        MCFunctionFields.BooleanLiteral.False
    );
});

FunctionFile.define("named_tp_facing", function () {
    Command.teleportTargetReference(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.teleportDestinationPosition(MCFunctionPositionFields.absolute(10, 80, 10)),
        MCFunctionFields.BooleanLiteral.False,
        Command.teleportFacingTargetOption(MCFunctionFields.namedPlayerTarget("Alex"))
    );
});

FunctionFile.define("named_sp_single", function () {
    Command.spawnpointShared(MCFunctionFields.namedPlayerTarget("Steve"));
});
