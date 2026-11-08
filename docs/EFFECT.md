# EFFECT — unified structured command block

## Decision

EFFECT is exposed as **one command block**.

The UI follows the same expansion idea used by SUMMON:

- required values are visible,
- optional positional values are added/removed with MakeCode `+ / -`,
- mutually exclusive meanings use reporter variants instead of separate command blocks.

This keeps the Minecraft command concept visible as one `effect` command while the AST remains the Source of Truth.

## MakeCode block shape

Canonical command block:

```text
EFFECT
  target  @s
  action  [apply effect speed]
  + duration
  + amplifier
  + hide particles
```

The optional add tail expands in Bedrock syntax order:

```text
duration → amplifier → hide particles
```

### Apply reporter

```text
[apply effect speed]
```

Effect IDs reuse `MCFunctionEffectLibrary` Registry reporters and Direct Input.

### Clear reporter

Default:

```text
[clear] [+]
```

means:

```mcfunction
effect @s clear
```

Press `+` on the CLEAR reporter:

```text
[clear effect speed] [-]
```

means:

```mcfunction
effect @s clear speed
```

### Duration reporters

Numeric:

```text
[duration 30 seconds]
```

Infinite:

```text
[duration infinite]
```

`infinite` was verified through `player.execute()` in Minecraft Education 26.32. The active-effect screen opened with `Z` displayed `∞`.

## Canonical TypeScript API

```ts
Command.effect(
    target,
    Command.effectApply(effect)
)

Command.effect(
    target,
    Command.effectApply(effect),
    Command.effectSeconds(10),
    1,
    false
)

Command.effect(
    target,
    Command.effectApply(effect),
    Command.effectInfinite(),
    1,
    false
)

Command.effect(
    target,
    Command.effectClear(effect)
)

Command.effect(
    target,
    Command.effectClear()
)
```

## AST

```ts
EffectCommand {
    mode: Add | ClearAll | ClearSpecific
    target: Selector
    effectId?: string
    durationMode?: Seconds | Infinite
    seconds?: number
    amplifier?: number
    hideParticles?: boolean
}
```

The UI reporter classes are Block Adapter values only. They do not replace the Minecraft Command AST.

## Compiler forms

The compiler can serialize the real positional syntax:

```mcfunction
effect @s speed
effect @s speed 10
effect @s speed 10 1
effect @s speed 10 1 false
effect @s speed infinite
effect @s speed infinite 1
effect @s speed infinite 1 false
effect @s clear
effect @s clear speed
```

Timed, infinite, clear-specific, and clear-all paths are DIRECT Preview paths. The minimal add form with omitted duration should be runtime-checked in Education after this UI refactor before adding a separate empirical PASS note for that exact variant.

## Validation

- Selector uses the shared Selector validator.
- Effect ID accepts Registry or custom-safe tokens.
- Clear All rejects add-tail values.
- Clear Specific rejects duration/amplifier/hideParticles.
- Seconds duration requires an integer seconds value.
- Infinite duration must not contain seconds.
- Amplifier, when present, must be an integer.
- `hideParticles` cannot appear unless amplifier is also present.
- Amplifier/hideParticles cannot appear unless duration is present.

## Preview compatibility

Already verified in Minecraft Education 26.32:

```text
effect timed          DIRECT PASS
effect infinite       DIRECT PASS
effect clear specific DIRECT PASS
effect clear all      DIRECT PASS
```

No EFFECT emulation is required.
