/**
 * Temporary Minecraft Education 26.32 MakeCode main.ts fixture.
 * Copy into main.ts in a disposable world; DO NOT put in pxt.json.
 * FunctionFile registration captures commands and does not execute them.
 * The C1 control test first switches to minecraft:free, because the default
 * first/third-person camera modes cannot use player_relative/camera_relative.
 * Invoke individual functions only after reading their effects and resetting
 * camera/controls with the corresponding clear action.
 */
FunctionFile.define("b3_damage_zero", function () {
    Command.damageApply(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        0
    );
});

FunctionFile.define("b3_damage_cause", function () {
    Command.damageApply(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        1, Command.damageCauseChoice(Command.DamageCauseChoice.Fall)
    );
});

FunctionFile.define("b3_damage_source", function () {
    Command.damageFromEntity(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        1, Command.damageCauseChoice(Command.DamageCauseChoice.EntityAttack),
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()))
    );
});

FunctionFile.define("b3_event_named", function () {
    Command.eventEntity(
        MCFunctionFields.namedPlayerTarget("PreviewTestCow"),
        MCFunctionEntityEventLibrary.cowEntitySpawned(),
        "minecraft:cow"
    );
});

FunctionFile.define("c1_controls_set", function () {
    // Order matters: make this scheme legal by activating a compatible camera.
    Command.cameraSet(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetBuiltin(Command.CameraPresetChoice.Free)
    );
    Command.controlSchemeSet(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.ControlSchemeChoice.PlayerRelative
    );
});

FunctionFile.define("c1_controls_camera_relative", function () {
    // Compare A/D movement with c1_controls_set; keep the same camera preset.
    Command.cameraSet(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetBuiltin(Command.CameraPresetChoice.Free)
    );
    Command.controlSchemeSet(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.ControlSchemeChoice.CameraRelative
    );
});

FunctionFile.define("c1_controls_clear", function () {
    // Restore both pieces of the combined test: scheme first, then camera.
    Command.controlSchemeClear(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()))
    );
    Command.cameraClear(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())
    );
});

FunctionFile.define("c1_aimassist_set", function () {
    Command.aimAssistSet(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.aimAssistOptions(45, 45, 8, Command.AimAssistModeChoice.Distance)
    );
});
FunctionFile.define("c1_aimassist_clear", function () {
    Command.aimAssistClear(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()))
    );
});
Preview.ready();
