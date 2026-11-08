# Preview Internal Tag Policy — 2026-10-08

## Purpose

Preview-only temporary Minecraft tags now use one shared opaque naming policy.
They are runtime implementation details and are never emitted by the normal
`.mcfunction` Compiler.

## Format

```text
_cbi_<purpose>_<opaque token>
```

Current purpose codes:

```text
qv  TAG list query viewer
qt  TAG list query target snapshot
so  SUMMON emulation pre-existing entities
sn  SUMMON emulation newly summoned entity
```

Example:

```text
_cbi_qv_K7F2Q9
_cbi_qt_K7F2Q9
_cbi_so_P4M8XZ
_cbi_sn_P4M8XZ
```

The token is not cryptography. It combines a per-runtime random seed with an
invocation serial and encodes it as six selector-safe characters. The goal is
to make accidental user collisions and concurrent Preview collisions very
unlikely while keeping the tag valid in Minecraft commands.

## Rules

- `_cbi_` is reserved for Preview internals.
- Internal tags are excluded from Preview TAG vocabulary/output.
- One Preview action shares one opaque scope token across related tags.
- TAG list uses `qv` / `qt` tags and removes both after the query.
- SUMMON orientation emulation uses `so` / `sn` tags and removes both after use.
- Compiler output never contains these Preview tags.
- `test.ts` remains empty; runtime verification is performed only when requested.
