# GIVE / TP Unified Block Refactor — 2026-10-07

## Scope

This change only reorganizes GIVE / TP public MakeCode block UX and the AST structures needed to preserve current Bedrock command meaning.

`test.ts` remains empty. Runtime verification code is intentionally deferred until the final verification step.

## GIVE

Public command block is one expandable GIVE block:

```text
GIVE
  target
  item
  + count
  + data
  + components
```

- `count` and `data` use wrapper reporter objects so collapsed MakeCode expandable inputs are distinguishable from real primitive values.
- `components` reuses the existing `ItemComponentsValue` chain.
- `ItemStack.amount`, `data`, and `components` are optional in the AST.
- Compiler inserts positional defaults only when required by a later argument:
  - components with omitted count/data -> count `1`, data `0`
  - data with omitted count -> count `1`
- If the optional tail is absent, compiler can emit the short form `give <target> <item>`.

## TP

Public toolbox now exposes one TP command block plus reporter blocks.

```text
TP
  target
  destination
    - position
    - entity
  check blocks false
  + orientation (position destination only)
    - rotation
    - facing position
    - facing entity
```

AST is structured as:

```text
TeleportCommand
  target
  destination
  orientation?
  checkForBlocks?
```

The previous five TP command functions remain as hidden compatibility wrappers so existing Preview code does not need to be rewritten immediately.

## Validation

- Entity destination + orientation is an ERROR.
- Position destination accepts rotation / facing position / facing entity.
- Existing Selector / Position / Rotation validators are reused.
- `checkForBlocks=false` in the unified TP block uses Bedrock's default/omitted form; `true` is emitted explicitly.

## pxt.json

No new TypeScript files were added, so the `files` list did not require a source entry change.
