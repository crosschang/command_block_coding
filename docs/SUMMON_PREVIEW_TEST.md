# SUMMON Preview Orientation — Education integration test

Use the latest source after `src/preview/summon_preview.ts` is included by `pxt.json`.

## Test 1 — Rotation

```ts
player.onChat("psrot", function () {
    Command.summonAdvanced(
        MCFunctionEntityLibrary.armorStand(),
        MCFunctionPositionFields.relative(3, 0, 0),
        Command.summonRotation(
            MCFunctionRotationFields.absolute(90, 0)
        )
    )
})
```

Expected: an unnamed armor stand spawns at `~3 ~ ~`, stays there, and has rotation `90 0` applied by Preview emulation.

## Test 2 — Facing Position

```ts
player.onChat("pspos", function () {
    Command.summonAdvanced(
        MCFunctionEntityLibrary.armorStand(),
        MCFunctionPositionFields.relative(5, 0, 0),
        Command.summonFacingPositionOption(
            MCFunctionPositionFields.relative(0, 0, 5)
        )
    )
})
```

Expected: the armor stand stays at the summon position and faces the requested position.

## Test 3 — Facing Entity

```ts
player.onChat("psentity", function () {
    Command.summonAdvanced(
        MCFunctionEntityLibrary.armorStand(),
        MCFunctionPositionFields.relative(7, 0, 0),
        Command.summonFacingEntityOption(
            MCFunctionFields.self(MCFunctionFields.noSelectorCondition())
        )
    )
})
```

Expected: the armor stand stays at the summon position and faces the player.

## Export check

The Converter/compiler must still output one modern SUMMON command, not the Preview helper commands.

Examples:

```mcfunction
summon minecraft:armor_stand ~3 ~ ~ 90 0
summon minecraft:armor_stand ~5 ~ ~ facing ~ ~ ~5
summon minecraft:armor_stand ~7 ~ ~ facing @s
```

Temporary `cbc_p_*` tags and TP helper commands are Runtime Preview implementation details only.
