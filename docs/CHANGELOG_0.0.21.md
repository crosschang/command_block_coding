# CHANGELOG 0.0.21 — SUMMON Education compatibility

## Changed

- Kept the compact two-block SUMMON model.
- Finalized SIMPLE semantic order as `entity → [nameTag] → [position]`.
- Finalized ADVANCED semantic order as `entity → position → orientation → [spawnEvent] → [nameTag]`.
- Added Education-compatible serialization when ADVANCED has a nameTag but no spawnEvent.
- The compiler now inserts `" "` only as a synthetic spawnEvent-slot placeholder.
- The AST still stores `spawnEvent = undefined`; the compatibility token does not become command meaning.
- Name tags continue to be command-string quoted by the compiler, preserving spaces such as `Iron Guardian`.
- Documented the future Parser rule that compiler-generated `" "` should round-trip back to an omitted spawnEvent.

## Education observations

Verified directly in Minecraft Education on 2026-10-06:

```mcfunction
summon minecraft:armor_stand ~ ~ ~ facing @s IronGuardian
```

The trailing token occupies the Spawn Event slot; it is not the nameTag.

```mcfunction
summon minecraft:armor_stand ~ ~ ~ facing @s IronGuardian test
```

`IronGuardian` occupies spawnEvent and `test` occupies nameTag.

A quoted single-space token can occupy the omitted spawnEvent slot when a nameTag follows.
