/**
 * B3/C1 REMAINING LIVE TEST — Minecraft Education 26.32 / plugin 0.0.72.
 * TEST-ONLY main.ts; do not add this file to pxt.json or production main.ts.
 *
 * Paste the WHOLE file into an EMPTY temporary MakeCode main.ts in a copied,
 * flat, cheat-enabled test world. Registration captures only definitions.
 * Invoke each chat function MANUALLY in the order in the accompanying guide.
 * They must not auto-run as one uninterrupted batch: observing movement,
 * growth and the aim reticle between steps is the evidence we need.
 *
 * All destructive mob commands target ONLY a cow bearing the precise
 * dedicated test NAME AND TAG, never @e alone or an ordinary world animal.
 * Stand clear, look horizontally at an unobstructed patch, and PREPARE ONCE.
 */

// Stage 1: B3 damage; summon an expendable tagged cow off to the left.
FunctionFile.define("cbi_dmg_prepare", function () {
    Command.summonSimple(
        MCFunctionEntityLibrary.cow(),
        "CBI_DAMAGE_COW_072", MCFunctionPositionFields.local(-5, 0, 6)
    );
    Command.tag(
        MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.cow(),
                MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_DAMAGE_COW_072", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addRangeCondition(
                        MCFunctionFields.SelectorRangeConditionType.Distance,
                        MCFunctionFields.rangeMax(12),
                        MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        ), Command.tagAdd("cbi_damage_cow_072")
    );
});

FunctionFile.define("cbi_dmg_zero", function () {
    Command.damageApply(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.cow(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name, "CBI_DAMAGE_COW_072",
                    MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addTextCondition(
                        MCFunctionFields.SelectorTextConditionType.Tag, "cbi_damage_cow_072",
                        MCFunctionFields.BooleanLiteral.False, MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        )), 0
    );
});

FunctionFile.define("cbi_dmg_cause", function () {
    Command.damageApply(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.cow(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name, "CBI_DAMAGE_COW_072",
                    MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addTextCondition(
                        MCFunctionFields.SelectorTextConditionType.Tag, "cbi_damage_cow_072",
                        MCFunctionFields.BooleanLiteral.False, MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        )), 1, Command.damageCauseChoice(Command.DamageCauseChoice.EntityAttack)
    );
});

FunctionFile.define("cbi_dmg_source", function () {
    // UNVERIFIED in Education 26.32: 'entity' origin token, not yet a runtime PASS.
    // If this function gets a syntax error, record the message and move on.
    Command.damageFromEntity(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.cow(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name, "CBI_DAMAGE_COW_072",
                    MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addTextCondition(
                        MCFunctionFields.SelectorTextConditionType.Tag, "cbi_damage_cow_072",
                        MCFunctionFields.BooleanLiteral.False, MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        )), 1, Command.damageCauseChoice(Command.DamageCauseChoice.EntityAttack),
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()))
    );
});

// Stage 2: B3 event; a reliably BABY cow is needed to observe GROW UP.
FunctionFile.define("cbi_evt_prepare", function () {
    Command.summonAdvanced(
        MCFunctionEntityLibrary.cow(),
        MCFunctionPositionFields.local(5, 0, 6),
        Command.summonRotation(
            MCFunctionRotationFields.absolute(0, 0)
        ),
        "minecraft:entity_born", "CBI_EVENT_COW_072"
    );
    Command.tag(
        MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.cow(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name, "CBI_EVENT_COW_072",
                    MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addRangeCondition(
                        MCFunctionFields.SelectorRangeConditionType.Distance,
                        MCFunctionFields.rangeMax(12), MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        ), Command.tagAdd("cbi_event_cow_072")
    );
});

FunctionFile.define("cbi_evt_grow", function () {
    // First visually confirm that cbi_evt_prepare spawned a BABY cow.
    Command.eventEntity(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.cow(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name, "CBI_EVENT_COW_072",
                    MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addTextCondition(
                        MCFunctionFields.SelectorTextConditionType.Tag, "cbi_event_cow_072",
                        MCFunctionFields.BooleanLiteral.False, MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        )), "minecraft:ageable_grow_up", "minecraft:cow"
    );
});

// Stage 3: controls. Only move a couple of blocks in each test; record WASD.
// minecraft:free permits all five control schemes (one is experimental).
FunctionFile.define("cbi_ctrl_player", function () {
    Command.cameraSet(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetCustom("minecraft:fixed_boom"));
    Command.controlSchemeSet(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.ControlSchemeChoice.PlayerRelative);
});
FunctionFile.define("cbi_ctrl_p_strafe", function () {
    Command.cameraSet(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetCustom("minecraft:fixed_boom"));
    Command.controlSchemeSet(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.ControlSchemeChoice.PlayerRelativeStrafe);
});
FunctionFile.define("cbi_ctrl_camera", function () {
    Command.cameraSet(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetCustom("minecraft:fixed_boom"));
    Command.controlSchemeSet(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.ControlSchemeChoice.CameraRelative);
});
FunctionFile.define("cbi_ctrl_c_strafe", function () {
    // SKIP if the world does not enable Experimental Creator Camera.
    Command.cameraSet(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetCustom("minecraft:fixed_boom"));
    Command.controlSchemeSet(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.ControlSchemeChoice.CameraRelativeStrafe);
});
FunctionFile.define("cbi_ctrl_locked", function () {
    // Built-in third_person specifically allows locked_player_relative_strafe.
    Command.cameraSet(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetBuiltin(Command.CameraPresetChoice.ThirdPerson));
    Command.controlSchemeSet(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.ControlSchemeChoice.LockedPlayerRelativeStrafe);
});
FunctionFile.define("cbi_ctrl_reset", function () {
    // Recovery action usable after ANY control scheme test, including failure.
    Command.controlSchemeClear(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())));
    Command.cameraClear(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()));
});

// Stage 4: remaining AIMASSIST variants; previous 45/45/8 distance PASS.
FunctionFile.define("cbi_aim_prepare", function () {
    Command.controlSchemeClear(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())));
    Command.cameraSet(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraPresetBuiltin(Command.CameraPresetChoice.ThirdPerson));
    Command.summonSimple(MCFunctionEntityLibrary.cow(),
        "CBI_AIM_REMAIN_COW_072", MCFunctionPositionFields.local(0, 0, 5));
    Command.tag(
        MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.cow(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name, "CBI_AIM_REMAIN_COW_072",
                    MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addRangeCondition(
                        MCFunctionFields.SelectorRangeConditionType.Distance,
                        MCFunctionFields.rangeMax(10), MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        ), Command.tagAdd("cbi_aim_remain_cow_072")
    );
});

FunctionFile.define("cbi_aim_default", function () {
    // Verify whether bare SET uses game defaults and produces a visible reticle.
    Command.aimAssistSet(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())));
});
FunctionFile.define("cbi_aim_angle", function () {
    // Compare target-mode angle with the previously verified distance mode.
    Command.aimAssistSet(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.aimAssistOptions(25, 25, 8, Command.AimAssistModeChoice.Angle));
});
FunctionFile.define("cbi_aim_distance", function () {
    Command.aimAssistSet(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.aimAssistOptions(45, 45, 8, Command.AimAssistModeChoice.Distance));
});
FunctionFile.define("cbi_aim_preset_only", function () {
    // OPTIONAL / SKIP by default. REQUIRES custom Behavior Pack preset.
    // Example preset ID is NOT an actual verified world resource.
    Command.aimAssistSetPreset(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        "example:my_preset");
});
FunctionFile.define("cbi_aim_clear", function () {
    Command.aimAssistClear(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())));
});

// Final cleanup: only the three individually name+tag-guarded test cows.
FunctionFile.define("cbi_all_cleanup", function () {
    Command.aimAssistClear(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())));
    Command.controlSchemeClear(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())));
    Command.cameraClear(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()));
    Command.kill(MCFunctionFields.allEntities(MCFunctionFields.addEntityTypeCondition(
        MCFunctionEntityLibrary.cow(), MCFunctionFields.BooleanLiteral.False,
        MCFunctionFields.addTextCondition(
            MCFunctionFields.SelectorTextConditionType.Name, "CBI_DAMAGE_COW_072",
            MCFunctionFields.BooleanLiteral.False,
            MCFunctionFields.addTextCondition(
                MCFunctionFields.SelectorTextConditionType.Tag, "cbi_damage_cow_072",
                MCFunctionFields.BooleanLiteral.False, MCFunctionFields.noSelectorCondition()
            )
        )
    )));
    Command.kill(MCFunctionFields.allEntities(MCFunctionFields.addEntityTypeCondition(
        MCFunctionEntityLibrary.cow(), MCFunctionFields.BooleanLiteral.False,
        MCFunctionFields.addTextCondition(
            MCFunctionFields.SelectorTextConditionType.Name, "CBI_EVENT_COW_072",
            MCFunctionFields.BooleanLiteral.False,
            MCFunctionFields.addTextCondition(
                MCFunctionFields.SelectorTextConditionType.Tag, "cbi_event_cow_072",
                MCFunctionFields.BooleanLiteral.False, MCFunctionFields.noSelectorCondition()
            )
        )
    )));
    Command.kill(MCFunctionFields.allEntities(MCFunctionFields.addEntityTypeCondition(
        MCFunctionEntityLibrary.cow(), MCFunctionFields.BooleanLiteral.False,
        MCFunctionFields.addTextCondition(
            MCFunctionFields.SelectorTextConditionType.Name, "CBI_AIM_REMAIN_COW_072",
            MCFunctionFields.BooleanLiteral.False,
            MCFunctionFields.addTextCondition(
                MCFunctionFields.SelectorTextConditionType.Tag, "cbi_aim_remain_cow_072",
                MCFunctionFields.BooleanLiteral.False, MCFunctionFields.noSelectorCondition()
            )
        )
    )));
});

Preview.ready();
