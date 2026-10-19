/**
 * Copy selected FunctionFile.define blocks into main.ts for Education tests.
 * WARNING: spawn points persist. Run ONLY in a disposable copy of a test world.
 * Do not execute all cases in production or an active lesson world.
 * Keep test.ts empty and do not add this file to pxt.json.
 */
FunctionFile.define("a8_sp_default", function () {
    Command.spawnpointShared();
});

FunctionFile.define("a8_sp_self", function () {
    Command.spawnpointShared(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())));
});

FunctionFile.define("a8_sp_abs", function () {
    Command.spawnpointShared(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        MCFunctionPositionFields.absolute(10, 80, 10));
});

FunctionFile.define("a8_sp_rel", function () {
    Command.spawnpointShared(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        MCFunctionPositionFields.relative(0, 1, 0));
});

// Replace "Steve" with a real player name in your disposable test world.
FunctionFile.define("a8_sp_named", function () {
    Command.spawnpointShared(MCFunctionFields.namedPlayerTarget("Steve"));
});

FunctionFile.define("a8_sp_named_at", function () {
    Command.spawnpointShared(MCFunctionFields.namedPlayerTarget("Steve"),
        MCFunctionPositionFields.absolute(10, 80, 10));
});

// Clear the per-player spawn checkpoint set above; do not use in a live world.
// In Preview/command-block context, the explicit target is important.
// Chat-style omitted target is supported by the AST; compare Preview separately.
FunctionFile.define("a8_clear_default", function () {
    Command.clearSpawnPoint();
});

FunctionFile.define("a8_clear_self", function () {
    Command.clearSpawnPoint(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())));
});

FunctionFile.define("a8_clear_all", function () {
    Command.clearSpawnPoint(MCFunctionFields.targetSelector(
        MCFunctionFields.allPlayers(MCFunctionFields.noSelectorCondition())));
});

// Replace "Steve" with a connected test player's exact name.
FunctionFile.define("a8_clear_named", function () {
    Command.clearSpawnPoint(MCFunctionFields.namedPlayerTarget("Steve"));
});

// These alter the WORLD spawn. Test individually in a copied test world.
FunctionFile.define("a8_world_abs", function () {
    Command.setWorldSpawnCompact(MCFunctionPositionFields.absolute(10, 80, 10));
});

FunctionFile.define("a8_world_rel", function () {
    Command.setWorldSpawnCompact(MCFunctionPositionFields.relative(0, 0, 0));
});

FunctionFile.define("a8_world_default", function () {
    Command.setWorldSpawnCompact();
});
