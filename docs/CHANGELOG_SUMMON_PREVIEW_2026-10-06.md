# SUMMON Runtime Preview Orientation Emulation — 2026-10-06

## Added

- Added `src/preview/summon_preview.ts`.
- SUMMON SIMPLE and ADVANCED without orientation still execute normal compiler output directly.
- SUMMON ADVANCED Rotation / Facing Position / Facing Entity now use Preview-only emulation when running through MakeCode.
- Preview preserves entity, position, spawn event and name tag through the normal SUMMON compiler.
- Preview identifies the newly summoned entity with temporary tags, then reuses the existing Teleport AST + Compiler to apply orientation.
- Temporary tags are removed after the preview operation.

## Not changed

- SUMMON AST semantics.
- Validator rules.
- Modern `.mcfunction` compiler output.
- Converter/Round-trip meaning.

## Runtime basis

Verified in Minecraft Education on 2026-10-06:

- SpawnEvent + NameTag direct summon works through `player.execute()`.
- `" "` synthetic event-slot placeholder + NameTag works through `player.execute()`.
- Modern SUMMON Rotation/Facing overloads fail directly through the MakeCode bridge.
- Temporary-tag isolation + TP orientation succeeds for unnamed armor stands.

## Verification status

Already verified manually in Minecraft Education before integration:

- Facing Entity emulation with an unnamed armor stand: PASS.
- Facing Position emulation with an unnamed armor stand: PASS.
- Absolute Rotation (`90 0`) emulation with an unnamed armor stand: PASS.

Still worth checking separately after integration:

- Relative Rotation (`~yaw ~pitch`) exact semantics.
- Local-coordinate (`^ ^ ^`) spawn/facing positions through the legacy execute step.
- Spawn events that transform the summoned entity into a different entity type.
