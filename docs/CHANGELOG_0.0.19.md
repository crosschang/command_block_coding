# 0.0.19 — SUMMON

## Added

- Structured `SUMMON` AST / Block Adapter / Validator / Compiler.
- SUMMON Toolbox group.
- Basic summon.
- Named summon.
- Spawn-event summon.
- Rotation summon.
- Facing-position summon.
- Facing-entity summon.

## Shared values reused

- Entity ID Registry / Direct Input
- Position
- Rotation
- Selector
- EVENT / SPAWN EVENT string reporters

## Syntax source

Bedrock stable `/summon` command supports position, yaw/pitch, spawn event,
name tag, facing position, and facing entity forms.

## Notes

- Legacy `commands/summon.ts` was only an empty `player.onChat("run", ...)` stub,
  so no legacy command implementation was copied.
- Empty optional `spawnEvent` / `nameTag` values are omitted by the compiler.
- Entity registry values and custom entity IDs remain supported.
