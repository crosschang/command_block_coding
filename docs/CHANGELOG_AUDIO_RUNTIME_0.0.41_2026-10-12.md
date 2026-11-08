# 0.0.41 Sound + Music — Minecraft Education 26.32 Runtime Evidence

Date: 2026-10-12. Source: user-observed screenshots and listening reports in ChatGPT project conversation.
Scope: MakeCode Preview / `player.execute()` via public Command blocks, **not** actual Behavior Pack `.mcfunction` installation.

## Definition Validation

- Original 15-function test: 3 expected ERROR, 2 WARNING, 1 INFO; invalid functions not registered. `cbi_diag` displayed details.
- Focused retest: 17 registered test functions, ERROR 0, WARNING 3, INFO 0. Screenshot supports registration/diagnostics, **not** audio effects by itself.
- WARN `record.cat` in Sound Registry (start and stop), `record.11` in Music Registry (short play); warning does not mean runtime failure.

## Audible observations, as reported by tester

- `a41_sound` and `a41_music_play`: audio clearly heard — PASS.
- `a41b_sound_left`/`right`: positional audio distinguishable — PASS by user report; not proof of physical 5.1/7.1 surround format.
- `a41b_sound_near`/`far`: audible distance difference — PASS by user report.
- Focused SOUND volume, sound start/stop, all/one stop: user reported PASS.
- MUSIC play/stop, volume 0/1: user reported PASS.
- `a41b_music_volume_001` (value 0.01): no audible sound to tester. Recorded as extremely low/inaudible level; NOT evidence that `0.01` is equivalent to numeric zero.
- MUSIC QUEUE: initial test stopped playing music **before** invoking QUEUE; delayed subsequent playback observed. Focused retest reported PASS for remaining tests including sequential QUEUE; exact track identities/timings not independently logged.

## Limitations and follow-up

- Do not claim canonical `.mcfunction` Runtime PASS or all variants of Sound/Music IDs.
- Update Sound/Music Registry from authenticated data or explicitly version-scoped observed IDs; warn conservatively about differences across Bedrock and Education.
- Keep `VERSIONED_NATIVE_ENUM` naming, preserve Registry Direct Input and MakeCode AST design.
