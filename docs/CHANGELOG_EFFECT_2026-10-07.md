# EFFECT structured support — 2026-10-07

## Added

- `commands/effect.ts` AST.
- `Effect` command kind.
- `EffectDurationMode.Seconds` / `EffectDurationMode.Infinite`.
- Block Adapter factories for timed add / infinite add / clear all / clear specific.
- Compiler serialization for numeric duration and literal `infinite`.
- Validator integration.
- MakeCode `EFFECT` block group.
- Dedicated `EFFECT INFINITE` block.
- Reused existing `MCFunctionEffectLibrary` Registry/Direct Input reporters.

## Preview verification

Minecraft Education 26.32 actual runtime results:

```text
effect timed          DIRECT PASS
effect infinite       DIRECT PASS
effect clear specific DIRECT PASS
effect clear all      DIRECT PASS
```

`effect @s speed infinite 1 false` was applied through `player.execute()` and the Education active-effect screen (`Z`) displayed `속도 II` with `∞`, confirming infinite duration.

No EFFECT Preview emulation is used.

## Compatibility rule

The Compiler emits real Bedrock/Education syntax. Preview capability does not alter the exported `.mcfunction` grammar.

## SUMMON handoff

The existing SUMMON orientation Preview adapter remains the implemented EMULATED command path at this stage:

- Rotation → TP emulation
- Facing Position → TP emulation
- Facing Entity → TP emulation

Compiler/export syntax remains modern Bedrock SUMMON syntax.
