# SUMMON — 0.0.21 Education-verified serialization

## Goal

Keep the MakeCode toolbox compact while preserving the two useful SUMMON forms and the argument order verified in Minecraft Education.

```text
SUMMON
├─ SUMMON SIMPLE
└─ SUMMON ADVANCED
```

The shared core path remains:

```text
MakeCode Block
→ Block Adapter
→ SummonCommand AST
→ Validator
→ Compiler
→ player.execute()
```

## 1. SUMMON SIMPLE

Canonical API:

```ts
Command.summonSimple(entity, nameTag?, spawnPosition?)
```

Semantic order:

```text
entity → [nameTag] → [position]
```

Examples:

```mcfunction
summon minecraft:armor_stand
summon minecraft:armor_stand test
summon minecraft:armor_stand "test mp"
summon minecraft:armor_stand test ~ ~ ~
summon minecraft:armor_stand "test mp" ~ ~ ~
summon minecraft:armor_stand ~ ~ ~
```

`nameTag` is stored as plain text in the AST. The compiler quotes it so spaces and special command-string characters are preserved.

Omitted position and explicit `~ ~ ~` remain different AST values for round-trip preservation.

## 2. SUMMON ADVANCED

Canonical API:

```ts
Command.summonAdvanced(
    entity,
    spawnPosition,
    orientation?,
    spawnEvent?,
    nameTag?
)
```

Semantic order:

```text
entity
→ position
→ orientation
→ [spawnEvent]
→ [nameTag]
```

Orientation reuses shared types:

```text
no orientation
rotation [Rotation]
facing position [Position]
facing entity [Selector]
```

Examples:

```mcfunction
summon minecraft:villager ~ ~ ~
summon minecraft:villager ~ ~ ~ ~ ~
summon minecraft:armor_stand ~ ~ ~ facing @s
summon minecraft:armor_stand ~ ~ ~ facing ~ ~ ~
```

### Spawn event + name tag

When both are present they are emitted in that order:

```mcfunction
summon minecraft:armor_stand ~ ~ ~ facing @s minecraft:some_event "test mp"
```

Registry values and Direct/Custom input remain allowed for spawn events. Registry membership is not a whitelist.

### Name tag without spawn event — Education compatibility rule

Minecraft Education testing on 2026-10-06 showed that the nameTag occupies the argument after spawnEvent in ADVANCED forms. If a nameTag exists while spawnEvent is omitted, the compiler emits a quoted single-space token as a **synthetic compatibility placeholder**:

```text
AST:
spawnEvent = undefined
nameTag = "test"
```

Facing Entity compiler result:

```mcfunction
summon minecraft:armor_stand ~ ~ ~ facing @s " " "test"
```

Rotation compiler result:

```mcfunction
summon minecraft:iron_golem ~ ~ ~ ~ ~ " " "Iron Guardian"
```

Important:

- `" "` is **not stored as the Spawn Event AST value**.
- It is emitted only by the compiler when a missing spawnEvent slot must be crossed to reach nameTag.
- Future `.mcfunction` Parser support should recognize this compiler-generated placeholder and restore `spawnEvent = undefined`.
- A user-entered spawn event containing whitespace is not treated as this placeholder; normal spawn-event validation still applies.

## 3. Education observations used for this rule

The following behavior was verified directly in Minecraft Education:

```text
... facing @s IronGuardian
→ IronGuardian occupies spawnEvent; no name tag is displayed.

... facing @s IronGuardian test
→ IronGuardian = spawnEvent, test = nameTag.

... facing @s "IronGuardian" "test mp"
→ quoted spawnEvent token + spaced nameTag works.

... facing @s " " test
→ empty-event compatibility placeholder allows test to occupy nameTag.
```

For SIMPLE, the separate name-first overload remains independent of spawnEvent.

## 4. AST model

```ts
SummonCommand {
    form: Simple | Advanced
    entityId: string
    nameTag?: string
    spawnPosition?: Position
    orientation?: SummonOrientation
    spawnEvent?: string
}
```

```ts
SummonOrientation {
    kind: None | Rotation | Facing
    rotation?: Rotation
    facing?: Facing
}
```

## 5. Round-trip policy

The AST stores semantic values, not compiler compatibility tokens.

```text
spawnEvent omitted + nameTag present
AST: spawnEvent = undefined
Compiler: inserts " "
Future Parser: " " in this synthetic position → spawnEvent = undefined
```

This keeps Minecraft Education execution compatibility without making a fake Spawn Event part of the command meaning.

## 6. MakeCode Runtime Preview compatibility — Orientation emulation

Minecraft Education itself accepts the modern ADVANCED SUMMON Rotation/Facing
forms, but runtime testing on 2026-10-06 showed that MakeCode
`player.execute()` rejects those overloads directly.

This does **not** change the AST or `.mcfunction` compiler.

```text
Export / Converter
SUMMON AST
→ Validator
→ Compiler
→ modern summon ... rotation/facing ...
```

Runtime Preview only:

```text
SUMMON ADVANCED Rotation/Facing
→ temporarily tag pre-existing same-type entities
→ summon entity + position + spawnEvent + nameTag without orientation
→ identify the newly summoned entity at the spawn position
→ apply orientation with the existing TP AST/Compiler
→ remove temporary tags
```

Verified Education/MakeCode behavior used by the adapter:

- `summon villager ~ ~ ~ minecraft:become_farmer "test"` works through `player.execute()`.
- `summon villager ~ ~ ~ " " "test"` works through `player.execute()`.
- Direct modern SUMMON Rotation/Facing overloads fail through `player.execute()`.
- A newly summoned unnamed `armor_stand` can be isolated with temporary tags.
- TP can then apply Rotation, Facing Position, or Facing Entity in place.

Preview-only temporary tags use the `cbc_p_*` prefix and are removed after each
emulated summon. The exported `.mcfunction` never contains those tag/TP helper
commands.

## Education 26.32 spawn-event orientation requirement

Runtime verification on 2026-10-10 showed that Minecraft Education 26.32 rejected:

```mcfunction
summon minecraft:cow ~ ~ ~3 minecraft:entity_born
```

while the explicit-rotation form succeeded and spawned a baby cow:

```mcfunction
summon minecraft:cow ~ ~ ~3 ~ ~ minecraft:entity_born
```

For ADVANCED SUMMON, `No Orientation` remains a valid explicit choice when no
spawn event is present. When a spawn event is present, Definition Validation
requires one of the real orientation reporters:

```text
Rotation
Facing Position
Facing Entity
```

The compiler does not silently synthesize `~ ~` for a user-selected
`No Orientation`, because that would add an orientation meaning that is not
represented in the AST.

Definition Validation emits:

```text
ERROR SUMMON_ORIENTATION_REQUIRED_FOR_EVENT
```

and the FunctionFile is not registered/exported until an explicit orientation is
selected.

Preview emulation for an already-explicit Rotation/Facing command retains
the previously verified **orientation-free intermediate** accepted by the
legacy MakeCode `player.execute()` bridge. Spawn Event + NameTag uses the
Preview-only ordering `entity position event nameTag`; when no event is given,
the canonical valid NameTag-first overload can be reused. After the intermediate
summon, orientation is applied through TP and temporary tags are cleaned up.

The intermediate is never sent to the canonical `.mcfunction` output. In
Education chat/`.mcfunction`, `No Orientation + spawnEvent` remains an ERROR;
the Preview-only legacy bridge exception is not a change in command grammar.

This 0.0.39 compatibility repair is SOURCE only until Education Runtime re-test.

## NameTag-only overload clarification (0.0.39)

Minecraft Bedrock/Education has a separate NameTag overload:

```text
summon <entity> <nameTag> [spawnPos]
```

Therefore:

```text
No Orientation + no spawnEvent + no nameTag
→ VALID
→ summon <entity> <spawnPos>

No Orientation + no spawnEvent + nameTag
→ VALID
→ summon <entity> <nameTag> <spawnPos>

No Orientation + spawnEvent + no nameTag
→ ERROR SUMMON_ORIENTATION_REQUIRED_FOR_EVENT

No Orientation + spawnEvent + nameTag
→ ERROR SUMMON_ORIENTATION_REQUIRED_FOR_EVENT
```

The compiler must not synthesize Rotation for the NameTag-only case.
When a spawn event is present, users must choose Rotation, Facing Position,
or Facing Entity explicitly.

