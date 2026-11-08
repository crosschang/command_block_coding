# Definition Validation Gate — 2026-10-09

## Purpose

FunctionFile Runtime Preview now validates the static command structure **before** registering its chat preview command.
The Validation Gate is internal and does not appear as a MakeCode block.

## Definition flow

```text
FunctionFile.define(...)
→ capture Command AST / Preview actions without changing the world
→ command validators + structural validation
→ ERROR?
   ├─ yes: keep definition blocked, do not register chat command
   └─ no: register chat command with validated replay plan
```

`WARNING` and `INFO` do not block registration.

## Runtime flow

```text
registered chat/function/tick invocation
→ replay validated command plan
→ Minecraft evaluates current runtime state
   (selectors, tags, scores, blocks, gamerules, etc.)
```

Definition Validation is not a substitute for runtime state evaluation.

## Invalid project-local function references

Invalid FunctionFile IDs stay known to Preview. A `function`/tick reference to an invalid MakeCode-defined function is handled as unavailable and does not fall through to an unrelated Behavior Pack function with the same ID.

## SUMMON ADVANCED

The integrated patch retains the 0.0.29 rule:

```text
SUMMON ADVANCED Orientation reporter = required
```

Explicit `no orientation` is valid. A physically missing/disconnected Orientation reporter produces `SUMMON_ORIENTATION_MISSING` during Definition Validation, so the FunctionFile chat command is not registered.

## Included 0.0.29 work

This 0.0.30 patch is based directly on the user's unpatched `command_block_coding(5).zip` and therefore also includes the earlier un-applied 0.0.29 changes:

- required SUMMON ADVANCED Orientation reporter + explicit `no orientation`
- reusable Block State Library entry reporters
- initial block-state registry and block/state usage data
- reusable block-state chain adapter
- block-state compiler separator corrected to ` = `
- Preview validation hooks in generic commands and SUMMON Preview

`test.ts` remains unchanged/empty.
