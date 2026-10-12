/**
 * 0.0.41 MakeCode Education manual test fixture.
 * Paste into a TEMPORARY main.ts. Do not include this fixture in pxt.json.files.
 * Test Sound and Music one chat command at a time. Turn game/Music/Sound volume on.
 */
FunctionFile.define("a41_sound", function () {
    Command.playSound(MCFunctionSoundLibrary.randomClick());
});
FunctionFile.define("a41_sound_pos", function () {
    Command.playSound(
        MCFunctionSoundLibrary.randomClick(),
        MCFunctionFields.allPlayers(MCFunctionFields.noSelectorCondition()),
        MCFunctionPositionFields.relative(0, 1, 0),
        Command.soundVolume(1),
        Command.soundPitch(1),
        Command.soundMinimumVolume(0)
    );
});
FunctionFile.define("a41_sound_local", function () {
    Command.playSound(
        MCFunctionSoundLibrary.randomClick(),
        undefined,
        MCFunctionPositionFields.local(0, 0, 2)
    );
});
FunctionFile.define("a41_stopsound", function () {
    Command.stopSound(MCFunctionFields.allPlayers(MCFunctionFields.noSelectorCondition()));
});
FunctionFile.define("a41_stopsound_one", function () {
    Command.stopSound(
        MCFunctionFields.allPlayers(MCFunctionFields.noSelectorCondition()),
        MCFunctionSoundLibrary.randomClick()
    );
});
FunctionFile.define("a41_music_play", function () {
    Command.music(Command.musicPlayback(Command.MusicPlaybackChoice.Play, MCFunctionMusicLibrary.recordCat()));
});
FunctionFile.define("a41_music_queue", function () {
    Command.music(Command.musicPlayback(
        Command.MusicPlaybackChoice.Queue,
        MCFunctionMusicLibrary.recordCat(),
        Command.musicVolumeOption(1),
        Command.musicFadeOption(0),
        Command.musicRepeatOption(Command.MusicRepeatChoice.Loop)
    ));
});
FunctionFile.define("a41_music_stop", function () {
    Command.music(Command.musicStopAction(Command.musicFadeOption(1)));
});
FunctionFile.define("a41_music_volume", function () {
    Command.music(Command.musicSetVolumeAction(0.5));
});

// Unknown IDs retain user intent: WARNING and still registered.
FunctionFile.define("a41_sound_unknown", function () {
    Command.playSound(MCFunctionSoundLibrary.custom("future.audio_id"));
});
FunctionFile.define("a41_music_unknown", function () {
    Command.music(Command.musicPlayback(Command.MusicPlaybackChoice.Play, MCFunctionMusicLibrary.custom("future.music_track")));
});
// Custom namespaced sound: INFO and still registered; audible only with a matching pack.
FunctionFile.define("a41_sound_custom", function () {
    Command.playSound(MCFunctionSoundLibrary.custom("example:custom_sound"));
});
// Malformed IDs / out-of-range values: ERROR and NOT registered.
FunctionFile.define("a41_sound_bad", function () {
    Command.playSound(MCFunctionSoundLibrary.custom("bad sound id"));
});
FunctionFile.define("a41_music_bad", function () {
    Command.music(Command.musicPlayback(Command.MusicPlaybackChoice.Play, MCFunctionMusicLibrary.custom("bad music id")));
});
FunctionFile.define("a41_sound_pitch_bad", function () {
    Command.playSound(
        MCFunctionSoundLibrary.randomClick(), undefined, undefined,
        undefined, Command.soundPitch(-1)
    );
});

// Type cbi_diag to inspect all registered FunctionFile diagnostics.
