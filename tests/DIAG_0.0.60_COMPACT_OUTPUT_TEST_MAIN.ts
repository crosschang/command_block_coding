/**
 * command_block_coding 0.0.60 / Minecraft Education diagnostic performance test.
 * Temporary main.ts only. Do not put this in test.ts.
 * The Extension owns player.onChat("?"), player.onChat("cbi_diag") and
 * player.onChat("cbi_page"); do NOT register them here.
 *
 * 4 affected functions => ? page 1/2 and cbi_page 2.
 */

FunctionFile.define("diag60_error", function () {
    Command.cameraSet(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetCustom("INVALID CAMERA ID")
    );
    Command.say("ERROR_MUST_NOT_EXECUTE");
});

FunctionFile.define("diag60_warn", function () {
    Command.music(Command.musicPlayback(
        Command.MusicPlaybackChoice.Play,
        MCFunctionMusicLibrary.custom("teset")
    ));
    Command.say("WARNING_TEST_EXECUTED");
});

FunctionFile.define("diag60_info", function () {
    Command.cameraSet(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetCustom("example:unknown_camera")
    );
    Command.say("INFO_TEST_EXECUTED");
});

FunctionFile.define("diag60_warn2", function () {
    Command.music(Command.musicPlayback(
        Command.MusicPlaybackChoice.Play,
        MCFunctionMusicLibrary.custom("teset2")
    ));
    Command.say("WARNING2_TEST_EXECUTED");
});

FunctionFile.define("diag60_ok", function () {
    Command.say("NORMAL_TEST_EXECUTED");
});

// Keep last so the once-only ready guide includes all definitions.
Preview.ready();
