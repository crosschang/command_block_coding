/**
 * A8 Minecraft Education 26.32 in-game Preview test main.ts.
 * TEMPORARY: back up your main.ts, replace its contents with this file,
 * keep test.ts unchanged, and restore main.ts after testing.
 * No world-changing command runs until its chat function name is invoked.
 * Run ONLY in a disposable COPY of a test world with cheats enabled.
 *
 * Historical player.execute evidence (2026-10-07, project source):
 *   spawnpoint absolute    DIRECT PASS
 *   spawnpoint omitted     FAIL (Preview only)
 *   spawnpoint relative    FAIL (Preview only)
 *   clearspawnpoint        DIRECT PASS (specific target-form not recorded)
 *   setworldspawn         DIRECT PASS
 * These are previous observations, NOT results for this A8 implementation.
 *
 * Before testing, replace 10 80 10 and 16 80 16 with TWO safe, distinct
 * locations in your copied world. Ensure safe floors and clear headroom.
 * Replace "Steve" with the exact name of a connected test player.
 * To execute each case, type its function name in chat WITHOUT a slash.
 */

// Baseline: world spawn A. Test alone; this affects the copied world.
FunctionFile.define("a8_world_abs", function () {
    Command.setWorldSpawnCompact(MCFunctionPositionFields.absolute(10, 80, 10));
});

// Core: player spawn B, explicit @s and absolute coordinates.
// Prior player.execute evidence predicts direct execution is supported.
FunctionFile.define("a8_sp_abs", function () {
    Command.spawnpointShared(
        MCFunctionFields.targetSelector(
            MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        MCFunctionPositionFields.absolute(16, 80, 16));
});

// Clear the personal spawn. Expected new A8 canonical text:
// clearspawnpoint @s
FunctionFile.define("a8_clear_self", function () {
    Command.clearSpawnPoint(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())));
});

// Omitted target: canonical clearspawnpoint (no suffix).
// In chat this affects the player who ran the command. Previous records do
// NOT separately verify this form through new FunctionFile/Preview code.
// Re-run a8_sp_abs before this independent test. A context WARNING is expected.
FunctionFile.define("a8_clear_default", function () {
    Command.clearSpawnPoint();
});

// Named-target round trip: verify common SELECTOR -> named player reporter.
// Change "Steve" before testing this or the next named-target case.
FunctionFile.define("a8_sp_named", function () {
    Command.spawnpointShared(
        MCFunctionFields.namedPlayerTarget("Steve"),
        MCFunctionPositionFields.absolute(16, 80, 16));
});

FunctionFile.define("a8_clear_named", function () {
    Command.clearSpawnPoint(MCFunctionFields.namedPlayerTarget("Steve"));
});

// Optional multiplayer-only case. WARNING: clears every connected player's
// personal spawn in the disposable world; do not run in a shared live world.
FunctionFile.define("a8_clear_all", function () {
    Command.clearSpawnPoint(MCFunctionFields.targetSelector(
        MCFunctionFields.allPlayers(MCFunctionFields.noSelectorCondition())));
});

// Isolation only: these forms historically failed via player.execute,
// although the canonical Bedrock command permits them. Compare Preview
// against the equivalent direct chat commands; don't conflate outcomes.
FunctionFile.define("a8_sp_current", function () {
    Command.spawnpointShared(
        MCFunctionFields.targetSelector(
            MCFunctionFields.self(MCFunctionFields.noSelectorCondition())));
});

FunctionFile.define("a8_sp_relative", function () {
    Command.spawnpointShared(
        MCFunctionFields.targetSelector(
            MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        MCFunctionPositionFields.relative(0, 1, 0));
});

// Independent world-spawn optional-argument test, not a clearspawnpoint case.
FunctionFile.define("a8_world_current", function () {
    Command.setWorldSpawnCompact();
});
