# EFFECT unified block refactor — 2026-10-07

## UI decision

Replaced the four separate EFFECT command blocks with one canonical `EFFECT` command block.

Reporter values now express the mutually exclusive parts:

```text
apply effect <effect>
clear [ + effect ]
duration <seconds>
duration infinite
```

The command block uses MakeCode expandable arguments for the optional add tail:

```text
duration → amplifier → hide particles
```

This matches the project-wide UI rule:

```text
required value       → visible
optional positional  → + / -
mutually exclusive   → reporter variant
```

## Architecture

No command string is assembled in the block API.

```text
EFFECT block
→ EffectActionValue / EffectDurationValue
→ Block Adapter
→ EffectCommand AST
→ Validator
→ Compiler
→ player.execute Preview
```

`EffectActionValue` and `EffectDurationValue` are UI/Block Adapter wrappers only. `EffectCommand` remains the command Source of Truth.

## Runtime evidence retained

Minecraft Education 26.32:

```text
timed add        DIRECT PASS
infinite add     DIRECT PASS
clear specific   DIRECT PASS
clear all        DIRECT PASS
```

`effect @s speed infinite 1 false` showed `속도 II` with `∞` on the `Z` active-effect screen.

## Follow-up runtime check

The unified block can now compile the official optional-duration form:

```mcfunction
effect @s speed
```

That exact omitted-duration variant should be checked once through Education `player.execute()` after applying this patch. It does not affect the already verified timed/infinite variants.
