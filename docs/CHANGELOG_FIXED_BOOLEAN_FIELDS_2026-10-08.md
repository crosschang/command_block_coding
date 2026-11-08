# Fixed Boolean Field UX — 2026-10-08

## Decision

Minecraft command grammar positions that accept only literal `true` / `false` should not expose a general MakeCode Boolean input socket.

Public command/field blocks now use a fixed enum dropdown:

```text
false ▼
true
```

This prevents variables, comparison blocks, `not`, and other computed Boolean reporters from being plugged into literal-only command arguments.

## Shared UI type

`MCFunctionFields.BooleanLiteral` is the MakeCode-facing fixed dropdown type.

The Core Engine remains unchanged:

```text
MakeCode fixed dropdown
→ BooleanLiteral
→ booleanLiteralValue(...)
→ AST boolean
→ Validator / Compiler
```

The enum is a UI adapter only; AST / Compiler continue to use plain `boolean`.

## Updated public blocks

- `EFFECT` particle reporter: `hide particles false/true`
- `TP`: `check blocks false/true`
- `TP TARGET`: `check blocks false/true`
- Selector compact conditions: `exclude false/true`
  - type
  - name/tag/family text condition
  - gamemode

Hidden legacy compatibility helpers keep their existing primitive `boolean` signatures.

## TP semantics

The visible TP blocks now pass both literal values explicitly into the Teleport AST. Therefore:

```text
false → compiler emits false
true  → compiler emits true
```

This matches the fixed field the user selected instead of silently treating `false` as an omitted tail.

## Test policy

`test.ts` remains intentionally empty. Runtime verification code is deferred to the final verification stage.
