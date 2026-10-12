# 0.0.41 — Sound + Music Library / Commands

Status: **code implemented / local TypeScript + Node tests PASS / new Education 26.32 in-game testing PENDING**.

## Scope and prior evidence

- Base: original user `command_block_coding(8).zip` + exact `0.0.40 Particle` patch. Do **not** use reconstructed `0.0.39 V2` as the sole project HEAD.
- All previous 0.0.39 V2 SUMMON and 0.0.40 Particle paths remain unchanged. No Behavior Pack `.mcfunction` deployment test is claimed.
- Historical `HISTORICAL_RESEARCH_6IN1.md` lists `/playsound`, `/stopsound`, `/music` and `/music stop` as `player.execute()` **DIRECT PASS**. The exact historical input/option coverage is not preserved; **Music queue/volume/fade/repeat and Sound optional combinations remain new tests**. Historical records must not be inflated into option-level PASS.

## Commands and AST

- `Command.playSound(sound, ... optional target, position, volume, pitch, minVolume)` — SoundValue and common Selector/Position reuse. Optional numeric wrapper reporters retain **zero vs absent**.
- `Command.stopSound(target, ... optional sound)` — required target, optional SoundValue.
- `Command.musicPlay(track, ... volume, fade, repeat)`.
- `Command.musicQueue(track, ... volume, fade, repeat)`.
- `Command.musicStop(... fade)`.
- `Command.musicVolume(value)`.
- Separate `PlaySoundCommand`, `StopSoundCommand`, `MusicCommand` nodes in the existing Minecraft Command AST. Block Adapter, Validator, Compiler and existing `FunctionFile` capture/Preview path are connected. Music repeat is a fixed dropdown (`play_once`, `loop`), and policy is `VERSIONED_COMMAND_ENUM` for Mojang updates.
- Preview defaults to canonical command serialization using `player.execute()`, consistent with **historical** DIRECT test results; game validation for this new 0.0.41 build still required.

## Sound and Music registry policy

- `sounds`: `EXTENSIBLE_STRING_ID`, no `namespace:path` requirement. `random.click` and other dotted IDs are valid inputs. Unknown IDs become WARNING, custom namespaces INFO, malformed IDs ERROR, never silently deleted.
- `music_tracks`: separate `EXTENSIBLE_STRING_ID` list; music tracks must not be treated as all general sounds. `record.cat` and background music events are supported. Repeat enum is `VERSIONED_COMMAND_ENUM`.
- `registry/source/bedrock/sounds.json` and `music_tracks.json` in the patch contain a **small starter subset only** (13 sound candidates / 5 music candidates), not an exhaustive current Mojang set. Direct Input works independently of coverage. No claim is made that every seed ID works in every Education version.
- `tools/update_audio_registry.cmd -Apply` downloads Mojang's `sound_definitions.json` and `music_definitions.json`, validates catalog sizes, derives Sound IDs and music event IDs plus `record.*`, saves source JSON, and runs the normal generator. On failed download/parse, existing source JSON is preserved.
- Generator `tools/generate_registry.ps1` v16 adds generated audio reporter blocks + sorted lookup. It handles possible dotted/underscore audio name collisions deterministically. **Do not hand-edit `*.generated.ts`.**
- Bedrock source updates do **not** automatically prove Minecraft Education 26.32 support; there is no forced 0.0.41 Registry whitelist.

## How to apply and test (Windows)

1. Keep backup of original `(8).zip` and previously applied 0.0.40 patch.
2. Apply this 0.0.41 PATCH ZIP **after 0.0.40**, preserving relative paths.
3. Run `tools\generate_registry.cmd -Check` — expected up to date for the **starter Registry**. For complete current Mojang audio candidates, run `tools\update_audio_registry.cmd -Apply` (network required); this regenerates reporter blocks. You can run `tools\generate_registry.cmd -Check` again.
4. Load in Minecraft Education MakeCode. Verify actual block visibility and JS ↔ Blocks conversion.
5. Paste `tests/AUDIO_0.0.41_PUBLIC_API_MAIN.ts` **temporarily** into main.ts; the fixture is **not** part of `pxt.json.files` and must not ship with canonical main.ts.
6. In Minecraft Education 26.32 chat, individually run `a41_sound`, `a41_sound_pos`, `a41_sound_local`, `a41_stopsound`, `a41_stopsound_one`, `a41_music_play`, `a41_music_queue`, `a41_music_stop`, `a41_music_volume` and `cbi_diag`. Use audible-volume settings and isolate sound/music to avoid masking.
7. Verify `a41_sound_unknown` / `a41_music_unknown` WARNING and still registered; `a41_sound_custom` INFO and still registered; `a41_sound_bad`, `a41_music_bad`, `a41_sound_pitch_bad` ERROR and **not registered**.
8. Report actual audible PASS/FAIL per option; record that `player.execute()` command acceptance and user-audible result may differ.

## Local test evidence

- Generic TypeScript ES5 compile with MakeCode API stubs: PASS (74 TS files + stubs).
- Node VM assertions: PASS **45** across compiler serialization, Registry/direct fallback, Validator range/syntax, public Command APIs, FunctionFile definition capture and validation gate.
- `generate_registry.cmd` Windows PowerShell **not run in this container** (no PowerShell runtime). Generated files are derived from the updated generator logic and starter JSON, but user Windows `-Check` is required.
- Actual Minecraft Education MakeCode compilation / JS ↔ Blocks / in-world Sound or Music runtime for **this patch**: PENDING.
- Canonical Behavior Pack file export and Parser round-trip: intentionally deferred to the user-agreed final phase.

## Official syntax references

- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/playsound?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/stopsound?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/music?view=minecraft-bedrock-stable
- https://github.com/Mojang/bedrock-samples/tree/main/resource_pack/sounds
