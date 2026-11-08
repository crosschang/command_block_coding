# 0.0.37 — Existing Library Policy Phase 1

## Scope

This release starts applying the Registry/Library Audit to existing libraries without changing Command AST meaning.

## Registry policy terminology

`FIXED_NATIVE_ENUM` is replaced by the more precise `VERSIONED_NATIVE_ENUM` policy.

```text
VERSIONED_NATIVE_ENUM
→ Mojang-owned native value domain
→ Add-on authors do not extend it
→ known values can still change by Minecraft version/platform
→ examples: Effect, Gamerule, Enchantment

VERSIONED_COMMAND_ENUM
→ fixed choices in Minecraft command grammar
→ Add-on authors do not extend them
→ choices can still change by Minecraft version/platform
→ examples: Gamemode, Difficulty, Weather, Fill mode, Clone mode
```

This is a Registry/authoring policy distinction. It does not change Minecraft Command AST meaning.

## Entity

- Registry updater now treats the official Microsoft `EntityType` command enum as the primary source.
- The documented vanilla entity listing is merged as a non-destructive fallback.
- Custom entity namespaces remain supported.
- Registry membership does not assert that an entity is summonable.

## Effect

- `/effect` uses `VERSIONED_NATIVE_ENUM` policy.
- Add-on authors cannot create a new native `/effect` value, but Mojang may add/change native Effect values in later Minecraft versions/platforms.
- Existing block ID and JavaScript function name are preserved, but the Direct Input block label changes from `effect custom id` to `effect direct value`.
- Generated Definition Validation lookup now includes Effect values.
- Unknown Effect values produce `EFFECT_ID_UNKNOWN` WARNING; Preview/export remain allowed for forward-version/import preservation.

## Policy-only entries added

The policy file now also records future/native domains without claiming their Library implementation is complete:

- Gamerule → `VERSIONED_NATIVE_ENUM`
- Enchantment → `VERSIONED_NATIVE_ENUM`
- Gamemode → `VERSIONED_COMMAND_ENUM`
- Difficulty → `VERSIONED_COMMAND_ENUM`
- Weather → `VERSIONED_COMMAND_ENUM`
- Fill mode → `VERSIONED_COMMAND_ENUM`
- Clone mode → `VERSIONED_COMMAND_ENUM`

These policy entries are not Runtime PASS claims and do not by themselves add new blocks/validators.

## Not changed yet

- Event / Spawn Event owner model
- Particle reliability metadata behavior
- Sound Registry
- Gamerule Library/typed Registry implementation
- Enchantment Library implementation

Those remain follow-up library phases.
