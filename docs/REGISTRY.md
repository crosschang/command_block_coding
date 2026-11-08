# Registry Library

The Registry is **search/autocomplete data**, not Minecraft command meaning. Command meaning remains in the AST.

## V1 Registry libraries

- Items
- Blocks
- Entities
- Effects
- Particles
- Families
- Events
- Spawn Events
- Block States (typed command Registry + custom fallback)

There is no Quick Preset layer. Direct/custom input remains available, including custom namespaces, custom families, and custom behavior-pack events. Registry data is never a whitelist.

## Source vs derived data

```text
registry/
├─ registry_policies.json
├─ source/bedrock/
│  ├─ items.json
│  ├─ blocks.json
│  ├─ block_states.json
│  ├─ entities.json
│  ├─ effects.json
│  └─ particles.json

registry/derived/bedrock/
├─ families.json
├─ entity_events.json
├─ spawn_events.json
└─ block_state_usage.json
```

`families.json` is derived from `minecraft:type_family` components in Mojang vanilla behavior entity JSON.

`entity_events.json` is derived from the `events` object of each vanilla behavior entity JSON and drives the **EVENT** Toolbox category.

`spawn_events.json` is kept as a separate snapshot and drives the **SPAWN EVENT** category. Minecraft command documentation uses the same `EntityEvents` argument domain for `/event` and `/summon ... spawnEvent`, so the project does not invent an unsupported second Mojang enum. The categories are separate for authoring context.

## Event Toolbox layout

EVENT and SPAWN EVENT are separate categories. Inside each category, generated reporters are grouped by entity:

```text
EVENT
├─ Zombie
├─ Villager
├─ Skeleton
└─ ...

SPAWN EVENT
├─ Zombie
├─ Villager
├─ Skeleton
└─ ...
```

Reporter text also contains the entity name so MakeCode Toolbox Search can find values by entity or event text.

## Generate

From the project root in a VS Code PowerShell terminal:

```powershell
.\tools\generate_registry.ps1
```

Generated files live in `src/libraries/*_library.generated.ts` and must not be edited by hand.

## Update for a Minecraft release

Check upstream changes without modifying the project:

```powershell
.\tools\update_registry.ps1
```

Apply the current official snapshots and regenerate libraries:

```powershell
.\tools\update_registry.ps1 -Apply
```

The updater reads:

- Item / Block / Effect data from Microsoft Minecraft Creator command documentation
- Entity IDs from the official command `EntityType` enum, merged with the documented vanilla entity listing as a non-destructive fallback
- Particle identifiers from Mojang `bedrock-samples`
- Family and per-entity event relationships from Mojang vanilla behavior entity JSON
- Microsoft `EntityEvents` documentation as a sanity check for the command argument domain

It prints additions/removals before writing.

## Bootstrap note

The repository includes a Family bootstrap snapshot. Per-entity Event/Spawn Event snapshots can be regenerated from current Mojang data by running `update_registry.ps1 -Apply`. This avoids freezing a guessed event/entity relationship into the repository.

## Bedrock vs Education

Do not infer Education compatibility from the Bedrock snapshot. Education-only or version-different IDs belong in a separate Education overlay after official documentation or in-game verification. Direct input remains available in the meantime.

## Windows PowerShell execution policy

If Windows blocks `.ps1` execution, use the included `.cmd` wrappers (they use `-ExecutionPolicy Bypass` only for that process):

```powershell
.\tools\update_registry.cmd
.\tools\update_registry.cmd -Apply
.\tools\generate_registry.cmd
```

No Python installation is required.

## Block State Registry and Library

Block states are shared authoring data for SETBLOCK / FILL / CLONE and future
`execute if/unless block`. The runtime AST always keeps typed state values and
direct/custom fallback.

Pure Command Registry generation uses Mojang `mojang-blocks.json` in two passes:

```text
vanilla data_items
→ collect the properties actually attached to vanilla blocks
→ resolve only those properties in block_properties
→ preserve exact state ID / type / allowed values
```

Do not infer Add-on-only status from a `minecraft:` prefix. Vanilla blocks can
use both namespaced and unnamespaced state IDs.

`block_states.json` records state definitions.
`block_state_usage.json` records block → applicable-state relationships.
The updater marks generated complete snapshots with coverage metadata; the
validator uses that metadata to avoid overclaiming when an older representative
snapshot is loaded.

The stable common reporter APIs remain hand-authored so existing saved Blocks do
not break. `block_state_library.generated.ts` adds typed reporters for additional
vanilla states after Registry update.

Generated Runtime metadata in `block_state_registry.generated.ts` supports:

```text
state value-kind validation
allowed-value validation
block/state applicability WARNING
complete-vs-representative coverage awareness
```

Registry applicability is a diagnostic aid, not a replacement for Minecraft
Runtime. Custom Block IDs and Custom Block States remain available through
Direct Input.

## Existing Library policy update (0.0.37)

Entity Registry source priority:

```text
official command EntityType enum
+ documented vanilla entity listing fallback
→ one non-destructive authoring Registry
```

The fallback prevents command-authoring suggestions from losing documented IDs that are
not present in the current command-enum snapshot. Registry membership does not prove an
entity is summonable; `/summon` capability is a separate concern.

Effect uses `VERSIONED_NATIVE_ENUM`: Add-on authors do not extend the native `/effect`
domain, but Mojang may add or change native Effect values by Minecraft version/platform.
The Direct Input reporter remains available for forward-version/import preservation and is
labelled **effect direct value**, not custom effect. Unknown values produce
`EFFECT_ID_UNKNOWN` WARNING rather than Custom Namespace INFO or a hard ERROR.

Particle and Family remain extensible/reference-oriented Registries and are not converted
to fixed-enum validation by this update.


### Versioned native/command enums

Do not use `FIXED_NATIVE_ENUM` to mean “this list can never change.” The project distinguishes:

```text
VERSIONED_NATIVE_ENUM
→ Mojang-owned semantic/native registries
→ Effect / Gamerule / Enchantment

VERSIONED_COMMAND_ENUM
→ fixed choices in command grammar
→ Gamemode / Difficulty / Weather / Fill mode / Clone mode
```

Both may change with Minecraft version/platform, but Add-on authors do not extend those native
command domains. Unknown Direct Input can still be preserved where the authoring/import path
requires forward-version compatibility.


## Entity Event owner model (0.0.38)

Entity Event and SUMMON Spawn Event use owner-scoped metadata rather than a flat whitelist.

```text
Entity behavior JSON
→ all events defined by each owner
→ entity_events.json
→ owner/event lookup
```

`spawn_events.json` schema v2 exposes the same owner events and adds:

```text
recommendedEvents
```

This preserves the previous evidence-backed spawn-oriented subset as an authoring hint while
making every owner event available to SUMMON authoring.

Validation policy:

```text
known owner + missing owner event
→ WARNING

known owner + defined but non-recommended spawn event
→ INFO

custom/unknown owner relation
→ preserve Direct Input and do not invent an owner mismatch
```

`spawnRecommended` is not a command-validity whitelist. It is versioned authoring metadata.
Minecraft Runtime remains the final authority.


## 0.0.42 typed Gamerule native enum

Registry source is `registry/source/bedrock/gamerules.json` (Microsoft Creator official Bedrock stable command enum as of 2026-10-12). It contains 32 Boolean, 5 Integer, and 1 special Enum (`playerwaypoints`) entries. The enum is Mojang-owned and *versioned*: `VERSIONED_NATIVE_ENUM`; it is **not** an Add-on Custom ID mechanism. Unknown syntactically valid native names must remain authorable as Direct Input with WARNING for future platform/version support.

Source JSON → `tools/generate_registry.ps1` → `src/libraries/gamerule_library.generated.ts` and `src/registry/gamerule_registry.generated.ts`. To check without rewriting:

```cmd
tools\generate_registry.cmd -Check
```

Boolean/Integer/Enum have distinct action reporters; `GAMERULE` is one public statement block, with query/list reporters. Invalid typed values block function registration, but unknown names do not. `playerwaypoints` on Minecraft Education 26.32 remains Runtime **PENDING**; Bedrock official metadata alone does not prove Education support.

For an official Mojang update, preserve the prior Registry snapshot under `registry/versions/`, compare additions/removals and value-kind changes, verify against official Creator source, update current JSON, then regenerate. A fully automated version-migration utility has **not** been implemented here.

### 0.0.41 Sound / Music observations

The starter Sound Registry adds `record.cat` and the starter Music Registry adds `record.11` based on 2026-10-12 Minecraft Education listening reports. These entries carry `verifiedBy` metadata and are **not** labeled as all-version official catalog support. `update_audio_registry.ps1 -Apply` preserves those annotated runtime observations if missing from an upstream download, while the authoritative Mojang catalog is still fetched and validated separately.
