/**
 * command_block_coding 0.0.65 - diagnostic stability regression test
 * Minecraft Education / MakeCode diagnostic command test (temporary main.ts).
 *
 * Verify chat commands:
 *   ?               : all diagnostics, no function execution
 *   diag52_warn?    : WARNING details only, no execution
 *   diag52_warn     : WARNING function execution (normal run is silent)
 *   diag52_info?    : INFO details only, no execution
 *   diag52_info     : INFO function execution (normal run is silent)
 *   diag52_error?   : ERROR details only, no execution
 *   diag52_error    : ERROR, execution blocked
 *   diag52_ok?      : no-issue details only
 *   diag52_ok       : normal execution
 *   diag52_parent   : internal diag52_warn call, no repeated WARNING header
 *
 * Do NOT define player.onChat("?") in this file: the extension owns that command.
 * Replace main.ts content temporarily; keep pxt.json and test.ts unchanged.
 */

// WARNING only: unknown music ID must not block the subsequent SAY.
FunctionFile.define("diag52_warn", function () {
    Command.music(Command.musicPlayback(
        Command.MusicPlaybackChoice.Play,
        MCFunctionMusicLibrary.custom("teset")
    ));
    Command.say("WARNING_TEST_EXECUTED");
});

// INFO only: syntactically valid custom camera preset, usually absent in this world.
// Camera may fail to activate at runtime; the subsequent SAY should still run.
FunctionFile.define("diag52_info", function () {
    Command.cameraSet(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetCustom("example:unknown_camera")
    );
    Command.say("INFO_TEST_EXECUTED");
});

// ERROR: invalid camera preset ID. The SAY must NEVER execute.
FunctionFile.define("diag52_error", function () {
    Command.cameraSet(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetCustom("INVALID CAMERA ID")
    );
    Command.say("ERROR_MUST_NOT_EXECUTE");
});

// Normal function: no issues.
FunctionFile.define("diag52_ok", function () {
    Command.say("NORMAL_TEST_EXECUTED");
});

// Calling a WARNING function from another function must not repeat its chat-only
// diagnostic header. The two SAY messages should still execute.
FunctionFile.define("diag52_parent", function () {
    Command.mcFunction("diag52_warn");
    Command.say("PARENT_TEST_EXECUTED");
});

// Place PREVIEW READY after all FunctionFile definitions for final guidance.
Preview.ready();
