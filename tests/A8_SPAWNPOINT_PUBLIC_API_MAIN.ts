/**
 * Copy selected FunctionFile.define blocks into main.ts for Education tests.
 * WARNING: spawn points persist. Run ONLY in a disposable copy of a test world.
 * Do not execute all cases in production or an active lesson world.
 * Keep test.ts empty and do not add this file to pxt.json.
 */
FunctionFile.define("a8_sp_default", function () {
    Command.spawnpointDefault();
});

FunctionFile.define("a8_sp_self", function () {
    Command.spawnpointSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()));
});

FunctionFile.define("a8_sp_abs", function () {
    Command.spawnpointSelectorAt(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionPositionFields.absolute(10, 80, 10));
});

FunctionFile.define("a8_sp_rel", function () {
    Command.spawnpointSelectorAt(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionPositionFields.relative(0, 1, 0));
});

// Replace "Steve" with a real player name in your disposable test world.
FunctionFile.define("a8_sp_named", function () {
    Command.spawnpointNamed("Steve");
});

// These alter the WORLD spawn. Test individually in a copied test world.
FunctionFile.define("a8_world_abs", function () {
    Command.setWorldSpawnAt(MCFunctionPositionFields.absolute(10, 80, 10));
});

FunctionFile.define("a8_world_rel", function () {
    Command.setWorldSpawnAt(MCFunctionPositionFields.relative(0, 0, 0));
});

FunctionFile.define("a8_world_default", function () {
    Command.setWorldSpawnDefault();
});
