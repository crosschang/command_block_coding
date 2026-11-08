# CHANGELOG 0.0.20 — SUMMON compact model

## Changed

- Replaced the six public SUMMON command blocks from 0.0.19 with two canonical command blocks:
  - `Command.summonSimple(...)`
  - `Command.summonAdvanced(...)`
- Added expandable optional arguments so the toolbox remains compact.
- Added SUMMON orientation reporter blocks:
  - no orientation
  - rotation
  - facing position
  - facing entity
- Reworked `SummonCommand` AST into `Simple | Advanced` forms.
- Reused shared `Position`, `Rotation`, `Facing`, `Selector`, Entity Registry and Spawn Event values.
- Preserved the semantic difference between an omitted position and explicit `~ ~ ~`.
- Added `createFacingEntityNoAnchor()` for commands such as SUMMON whose facing-entity syntax has no eyes/feet anchor.
- Updated Validator and Compiler for the compact model.

## Compiler cases verified

```mcfunction
summon minecraft:villager
summon minecraft:villager "Bob"
summon minecraft:villager "Bob" ~ ~ ~
summon minecraft:villager ~ ~ ~
summon minecraft:villager ~ ~ ~ ~ ~
summon minecraft:villager ~ ~ ~ facing @s
summon minecraft:villager ~ ~ ~ facing ~ ~ ~
summon minecraft:villager ~ ~2 ~ minecraft:spawn_farmer
summon minecraft:iron_golem ~ ~ ~ "Iron Guardian"
```

Core AST → Validator → Compiler tests pass for the cases above.
Minecraft Education Runtime Preview still requires in-game verification for the new block/API layout.
