// Paste into MakeCode JavaScript after applying the EFFECT unified-block patch.

player.onChat("ef0", function () {
    // Duration omitted: official Bedrock default is 30 seconds.
    // This exact player.execute variant is the only new runtime check needed.
    Command.effect(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.effectApply(MCFunctionEffectLibrary.speed())
    )
})

player.onChat("ef1", function () {
    // Timed: Speed II for 10 seconds.
    Command.effect(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.effectApply(MCFunctionEffectLibrary.speed()),
        Command.effectSeconds(10),
        1,
        false
    )
})

player.onChat("ef2", function () {
    // Infinite: Speed II, verify infinity symbol with Z.
    Command.effect(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.effectApply(MCFunctionEffectLibrary.speed()),
        Command.effectInfinite(),
        1,
        false
    )
})

player.onChat("ef3", function () {
    // Apply a second effect so specific/all clear are easy to distinguish.
    Command.effect(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.effectApply(MCFunctionEffectLibrary.nightVision()),
        Command.effectInfinite(),
        0,
        false
    )
})

player.onChat("ef4", function () {
    // Clear speed only.
    Command.effect(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.effectClear(MCFunctionEffectLibrary.speed())
    )
})

player.onChat("ef5", function () {
    // Clear all effects.
    Command.effect(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.effectClear()
    )
})
