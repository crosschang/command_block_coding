# Block State Registry / Validation Pipeline — 0.0.34

Date: 2026-10-10

Status: **SOURCE IMPLEMENTED / Minecraft Runtime re-test pending**

## Goal

Turn Block State from a small curated authoring catalog into a data-driven Pure Command Registry without mixing Add-on authoring schemas into command semantics.

The AST and serializer rules are unchanged:

```text
BlockStateValue = String | Number | Boolean
Canonical chat/.mcfunction = ["key"=value]
MakeCode player.execute Preview = ["key":value]
```

Those serializer rules were already Runtime verified before this change.

## Registry policy layer

Added `registry/registry_policies.json` to record whether a Registry domain is:

```text
FIXED_NATIVE_ENUM
EXTENSIBLE_NAMESPACED_ID
EXTENSIBLE_STRING_ID
OWNER_SCOPED_ID
PROJECT_DEFINED_STRING
VANILLA_STATE_PLUS_CUSTOM_FALLBACK
```

This metadata does not replace AST meaning.

## Mojang Block State update pipeline

`tools/update_registry.ps1 -Apply` now reads:

```text
Mojang/bedrock-samples
metadata/vanilladata_modules/mojang-blocks.json
```

and derives two snapshots.

### `registry/source/bedrock/block_states.json`

Only properties that are actually referenced by vanilla `data_items` are imported.

Each state preserves:

```text
id
value type: string | number | boolean
allowed values
UI role metadata
```

A property is not exposed to the Pure Command Registry merely because it exists in an Add-on/Creator schema.

### `registry/derived/bedrock/block_state_usage.json`

Maps vanilla block IDs to the exact property IDs attached to each block in the Mojang metadata.

The generated snapshot is marked complete for that upstream Bedrock metadata snapshot.

## Namespaced state rule

Namespace presence is not used to decide whether a state is Add-on-only.

Examples such as these remain distinct exact IDs:

```text
facing_direction
minecraft:facing_direction
```

If a vanilla `data_item` references a namespaced property, it belongs in the vanilla command-relevant Registry.

## Generated Runtime Registry

Added:

```text
src/registry/block_state_registry.generated.ts
```

It provides MakeCode-safe lookup helpers for:

```text
known state ID
expected value kind
allowed values
block -> state applicability
catalog/usage completeness
```

Wildcard relationships in the old representative snapshot are expanded during generation so Runtime TypeScript only uses exact block IDs.

## Generated Block State Library

Added:

```text
src/libraries/block_state_library.generated.ts
```

The existing hand-authored reporter IDs/functions remain stable for the already-used common states.
The generator adds typed reporters only for additional vanilla states.

Generated UI groups:

```text
ORIENTATION
ACTIVATION
STRUCTURE
LEVEL / GROWTH
VARIANT / APPEARANCE
SPECIAL / EDUCATION
OTHER
CUSTOM
```

Groups are authoring metadata only, not AST semantic kinds.

## Context-aware validation

`validateBlockStates(states, blockId?)` now uses Registry metadata when available.

Rules:

```text
invalid state key                         ERROR
same state key repeated                   ERROR
known state wrong value kind              ERROR
known state value outside allowed values  ERROR
known vanilla block + known non-applicable state
                                          WARNING
unknown state on known vanilla block      WARNING only when catalog is complete
custom block/state                         not hard-blocked
```

SETBLOCK, FILL target/replacement, and CLONE filtered block validation now pass their block ID into the shared Block State validator.

## Preservation

Not changed:

```text
Minecraft Command AST Source of Truth
Compiler `=` Block State syntax
Preview `:` compatibility serializer
Custom Namespace / Direct Input fallback
existing common Block State blockIds
```

## Bundled snapshot note

The source ZIP that first introduces 0.0.34 still carries the previous representative Block State JSON snapshot plus explicit `coverage: representative` metadata.

Run:

```powershell
.\tools\update_registry.cmd -Apply
```

on a networked development machine to replace it with the complete current Mojang-derived snapshot and regenerate the full Block State Library/lookup.

Until that update is applied, the validator intentionally does not claim that unknown State IDs are invalid globally.
## Windows PowerShell 5.1 updater hotfixes

The initial 0.0.34 updater exposed two Windows PowerShell 5.1 / StrictMode issues during real execution:

```text
Generic.List wrapped directly by @(... )
→ Argument types do not match

$LASTEXITCODE read after invoking a .ps1 script
→ VariableIsUndefined under Set-StrictMode
```

The updater now:

```text
converts Generic.List results with .ToArray()
checks the PowerShell script invocation with $? instead of $LASTEXITCODE
```

These fixes affect the development updater only and do not change Minecraft command semantics, AST, Compiler, or Preview serialization.

