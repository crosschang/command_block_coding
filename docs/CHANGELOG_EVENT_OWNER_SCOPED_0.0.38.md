# 0.0.38 — Entity Event / Spawn Event owner-scoped Registry

Date: 2026-10-10

## Goal

Keep Entity Event and SUMMON Spawn Event authoring owner-aware without treating Mojang's
current vanilla behavior metadata as a hard whitelist.

## Source model

`/event entity <target> <eventName>` and `/summon ... <spawnEvent>` both use the
`EntityEvents` command argument domain.

Vanilla behavior JSON is used to derive:

```text
Entity → all events defined by that owner
```

The previous evidence-backed spawn-oriented subset is retained as metadata:

```text
spawnRecommended = true
```

It includes documented initialization events and events explicitly referenced by vanilla
`spawn_event` properties. This is an authoring hint only.

## Spawn Event Library

Before 0.0.38:

```text
150 spawn-oriented owner/event reporters
```

0.0.38:

```text
850 owner/event reporters
150 spawnRecommended reporters
```

Existing reporter block IDs/functions are preserved. New owner events are added rather
than replacing the old reporters.

Recommended reporters are labelled:

```text
cow recommended spawn event minecraft:entity_spawned
```

Other owner events remain selectable:

```text
cow spawn event minecraft:ageable_grow_up
```

## Definition Validation

New generated metadata:

```text
src/registry/entity_event_registry.generated.ts
```

For a statically known vanilla SUMMON owner:

```text
known owner + defined + spawnRecommended
→ no issue

known owner + defined + not spawnRecommended
→ INFO SUMMON_EVENT_NOT_SPAWN_RECOMMENDED

known owner + event not defined by current owner metadata
→ WARNING ENTITY_EVENT_NOT_DEFINED_FOR_OWNER

custom/unknown owner where exact owner metadata is unavailable
→ do not fabricate an owner mismatch
```

WARNING/INFO do not block Function registration, Preview, or export.
Minecraft Runtime remains the final authority for the actual target version and installed
Add-on content.

## Important limitation

`spawnRecommended` does not mean "the only valid spawn events". Minecraft's entity-event
system can produce unusual initialization states when events are used in unexpected ways.
The project therefore exposes all owner events and uses recommendation metadata only for UX.

## Future reuse

The same owner registry can later be reused by `/event entity ...` validation when a target
selector has one statically knowable entity type. Selectors that may resolve to multiple
entity types must not be overvalidated.
