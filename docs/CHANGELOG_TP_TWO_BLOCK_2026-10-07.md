# TP Public Block Split — 2026-10-07

## Decision

Keep one Teleport AST/Validator/Compiler path, but expose two public MakeCode command blocks matching Bedrock's two user-facing TP families.

```text
TP
  destination
  check blocks
  [+ orientation]

TP TARGET
  victim
  destination
  check blocks
  [+ orientation]
```

`destination` remains the shared reporter:

- Position
- Entity

For a Position destination, optional orientation remains:

- Rotation
- Facing Position
- Facing Entity

## AST / Compiler

`TeleportCommand.target` is now optional.

- target omitted -> `tp <destination> ...`
- target present -> `tp <victim> <destination> ...`

The compiler does not synthesize `@s` for the self form.

## Compatibility

The previous unified `Command.teleport(target, destination, ...)` API and its `mcfunction_tp` block id remain hidden for compatibility.
The older five TP helper APIs also remain hidden.

## Test policy

`test.ts` intentionally remains empty. Runtime verification is reserved for the final verification stage.
