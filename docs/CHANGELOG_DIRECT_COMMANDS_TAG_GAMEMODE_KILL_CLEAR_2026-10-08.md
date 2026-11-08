# TAG / GAMEMODE / KILL / CLEAR — Direct Command Implementation

Date: 2026-10-08
Version: 0.0.22

## Scope

Added structured AST -> Validator -> Compiler -> Runtime Preview paths for four
Bedrock / Minecraft Education commands already classified as DIRECT in the
project compatibility work:

- TAG
- GAMEMODE
- KILL
- CLEAR

No command string is assembled in the public block functions. Public blocks
create structured AST nodes through `MCFunctionBlocks`, then reuse the common
Validator and Compiler path.

## TAG

Canonical forms:

```text
tag <target> add <name>
tag <target> remove <name>
tag <target> list
```

MakeCode UI:

```text
TAG target <selector> action <reporter>

add tag <name>
remove tag <name>
list tags
```

Tag names remain direct user input because they are user-defined values.

## GAMEMODE

Canonical form:

```text
gamemode <mode> [target]
```

MakeCode UI:

```text
GAMEMODE <mode>
+ target <selector>
```

The mode is a fixed enum/dropdown: survival, creative, adventure, spectator.
The optional target is omitted to preserve the command's self/default-player
form.

`SelectorGameMode` numeric values are aligned with the shared AST `GameMode`
enum so the selector and command definitions cannot silently drift apart.

## KILL

Canonical form:

```text
kill [target]
```

MakeCode UI:

```text
KILL
+ target <selector>
```

Omitting the target keeps the literal `kill` form rather than forcing `@s`.

## CLEAR

Canonical form:

```text
clear [player] [item] [data] [maxCount]
```

MakeCode UI:

```text
CLEAR
+ target
+ item
+ data
+ max count
```

Presence-sensitive numeric optionals use reporter objects:

```text
ClearDataValue
ClearMaxCountValue
```

This preserves `0` as a real value and distinguishes it from an omitted input.
If `maxCount` exists while `data` is omitted, Compiler inserts the Bedrock
default `-1` into the data slot. If item filtering is requested with no
explicit target, Compiler emits `@s` to occupy the positional player slot.

Validator rejects data/maxCount when no item is present.

## Files

Added:

```text
commands/tag.ts
commands/gamemode.ts
commands/kill.ts
commands/clear.ts
```

Updated:

```text
src/ast/command.ts
src/blocks/command_adapter.ts
src/compiler/compiler.ts
src/validator/validator.ts
src/fields/selector_field.ts
custom.ts
pxt.json
README.md
```

## Verification performed before packaging

- TypeScript project check: no new errors compared with the existing baseline;
  remaining 19 errors are the pre-existing MakeCode globals / old standalone
  EFFECT_UNIFIED_TEST.ts issues.
- Compiler smoke test: PASS for representative TAG/GAMEMODE/KILL/CLEAR forms.
- Validator smoke test: PASS for representative valid and invalid ASTs.
- `test.ts`: kept empty (0 bytes) by project policy for later final runtime test.

Minecraft Education block conversion and in-game runtime verification are still
required before these newly wired public blocks are marked final PASS.


## MakeCode/PXT enum compatibility fix

`MCFunctionFields.SelectorGameMode` keeps literal numeric values `0..3` instead of assigning members from `MCFunctionAST.GameMode`. This preserves the same mapping while avoiding MakeCode/PXT cross-enum assignment errors.
