# 0.0.41 — Unified MUSIC UI (Sound blocks unchanged)

Status: **UI/TypeScript patch prepared; MakeCode Blocks and Education in-game revalidation pending**.

## UI decision

- **One visible `MUSIC` statement block**, with a composable operation reporter.
- Operation reporters: `musicPlayback(play/queue dropdown, track, optional volume/fade/repeat)`, `musicStopAction(optional fade)`, `musicSetVolumeAction(value)`.
- `PLAY SOUND` and `STOP SOUND` stay as **two separate visible command blocks**; both reuse the existing common SoundValue/Registry.
- The MUSIC operation reporter carries the *existing* canonical `MCFunctionAST.MusicCommand`. The adapter, validator, compiler and preview flow are unchanged. No command strings are assembled by the MakeCode UI.
- Previous `command_music_play`, `command_music_queue`, `command_music_stop`, `command_music_volume` block IDs and public APIs remain with `blockHidden=true`, **not deleted**, for compatibility with previous saved workspaces and JS. Their toolbox entries are hidden in favor of the unified MUSIC statement block.
- Unknown music IDs remain WARNING; malformed IDs and invalid argument values retain existing ERROR behavior.

## Public MakeCode example

```typescript
FunctionFile.define("a41_music_play", function () {
    Command.music(Command.musicPlayback(
        Command.MusicPlaybackChoice.Play,
        MCFunctionMusicLibrary.recordCat()
    ));
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
```

## Verification limits

- Use the refreshed `tests/AUDIO_0.0.41_PUBLIC_API_MAIN.ts` fixture temporarily in main.ts.
- Verify **JS → Blocks** conversion, MUSIC toolbox visibility, operation reporters, and the hidden legacy blocks' import behavior in actual Minecraft Education MakeCode.
- The historical `player.execute()` Music DIRECT PASS evidence does not establish runtime success for every 0.0.41 music argument combination. Keep queue/volume/repeat/fade cases pending until tested.
- Do not modify `test.ts` or auto-generated Registry TypeScript files for this UI-only patch.
