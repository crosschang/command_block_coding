# 0.0.39 — SUMMON spawn-event orientation validation

Date: 2026-10-10

## Runtime finding

Minecraft Education 26.32 rejected:

```mcfunction
/summon minecraft:cow ~ ~ ~3 minecraft:entity_born
```

and accepted:

```mcfunction
/summon minecraft:cow ~ ~ ~3 ~ ~ minecraft:entity_born
```

The accepted form spawned a baby cow.

Microsoft's Bedrock command reference exposes both the yRot/xRot overload and
separate `facing <position|entity>` overloads for SUMMON.

## Validator

`No Orientation + spawnEvent` is now an ERROR:

```text
SUMMON_ORIENTATION_REQUIRED_FOR_EVENT
```

Message: choose Rotation, Facing Position, or Facing Entity.

`No Orientation` remains valid when no spawn event is present. A physically
missing Orientation reporter continues to use `SUMMON_ORIENTATION_MISSING`.

## Compiler

The canonical compiler no longer silently injects synthetic `~ ~` into a
user-selected No Orientation AST. Export remains blocked by Definition Validation
for the unsupported No Orientation + spawnEvent combination.

## Preview

Rotation/Facing Preview emulation still needs an orientation-free intermediate
summon. When that intermediate summon carries a spawn event, Preview uses a
relative 0/0 Rotation only for the internal summon, then applies the user's real
Rotation/Facing via TP. Canonical export is unchanged.

## Status

SOURCE implemented. Runtime re-test required before PASS.

## Correction: NameTag-only overload

Direct Education 26.32 testing showed that:

```text
summon minecraft:cow ~ ~ ~3 "My Cow"
```

is invalid because the NameTag-only overload places `nameTag` before `spawnPos`.

Correct syntax:

```text
summon minecraft:cow "My Cow" ~ ~ ~3
```

Compiler rule:

```text
No Orientation + no spawnEvent + nameTag
→ use the dedicated NameTag-first overload

No Orientation + spawnEvent
→ require explicit Rotation / Facing Position / Facing Entity
```


## Preview emulation correction (2026-10-10) — SOURCE, Runtime pending

The pre-existing Rotation/Facing Position/Facing Entity EMULATED paths already
passed Minecraft Education Runtime tests before 0.0.39. Those tests are not
invalidated by this fix.

The 0.0.39 Preview accidentally introduced a synthetic `~ ~` rotation into
its **intermediate** SUMMON whenever a spawn event was set. That reintroduced
a grammar form already known to fail in MakeCode `player.execute()`. The new
`summon_event_named_rotation` screenshot shows this intermediate failed, whereas
`summon_named_no_orientation` successfully spawned a named adult cow and the
`No Orientation + spawnEvent` Definition ERROR still correctly blocked registration.

This repair restores the previously verified PREVIEW-only legacy bridge:

```text
Original AST: Rotation/Facing + event + name
  -> Preview-only `summon entity position event name` (no rotation tokens)
  -> isolate newly summoned entity
  -> apply user-selected Rotation/Facing through TP
  -> cleanup
```

Only the Preview serializer/adapter and these explanatory docs change. The
original AST, Validator, canonical Compiler, Registry and `pxt.json` do not.
The Preview-only legacy text is NEVER a valid export substitute for the modern
Bedrock/Education SUMMON syntax. This patch also checks the intermediate
`player.execute()` boolean result, shows a Preview failure message if false,
and cleans up temporary tags.

**Evidence status**: 0.0.39 source repair; Education 26.32 re-test of the new
Event+NameTag combinations is still required before claiming Runtime PASS.
