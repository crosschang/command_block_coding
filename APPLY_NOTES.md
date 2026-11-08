# EFFECT unified block patch — apply notes

This patch is designed to merge into the source that already has SUMMON Preview Emulation and EFFECT infinite support.

## Replace these files

```text
commands/effect.ts
src/blocks/command_adapter.ts
src/compiler/compiler.ts
src/validator/validator.ts
custom.ts
docs/EFFECT.md
```

Optional documentation:

```text
docs/CHANGELOG_EFFECT_UNIFIED_2026-10-07.md
```

`EFFECT_UNIFIED_TEST.ts` is a test snippet. It does not need to be added to `pxt.json`; paste it into MakeCode JavaScript or merge it into your test file.

## pxt.json

No new runtime TypeScript file is introduced, so **no pxt.json source-file change is required**.

This is intentional so your existing Execute / EMULATED documentation entries in the current source are not overwritten.

## New public block model

There is now one command block:

```text
EFFECT target ... action ... [+]
```

Action reporters:

```text
apply effect <effect>
clear [+ effect]
```

Duration reporters:

```text
duration <seconds> seconds
duration infinite
```

The EFFECT command block's + / - tail is:

```text
duration → amplifier → hide particles
```

## Runtime check after applying

The previously tested variants remain:

```text
timed           DIRECT PASS
infinite        DIRECT PASS
clear specific  DIRECT PASS
clear all       DIRECT PASS
```

One additional exact syntax variant should be checked because the unified block can omit duration:

```mcfunction
effect @s speed
```

Run `ef0` from `EFFECT_UNIFIED_TEST.ts`. Expected: Speed I is applied using Minecraft's default duration (official syntax says 30 seconds). Record it as empirical PASS only after Education confirms it.
