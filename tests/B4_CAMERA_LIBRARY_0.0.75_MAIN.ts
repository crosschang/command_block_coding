/** B4 / CAMERA library MakeCode UI smoke fixture.
 * This file is NOT added to pxt.json. Copy its contents to main.ts only for testing.
 * In Education 26.32, verify definition diagnostics first and run only in a test world.
 */
FunctionFile.define("b4_cam_boom", function () {
    Command.cameraSet(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionCameraPresetLibrary.fixedBoom()
    );
});
FunctionFile.define("b4_cam_orbit", function () {
    Command.cameraSet(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionCameraPresetLibrary.followOrbit()
    );
});
FunctionFile.define("b4_cam_clear", function () {
    Command.cameraClear(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()));
});

// Use the test world in Creative mode; creepers can otherwise explode.
// Spawn a named creeper, then target ONLY that creeper by its type + name.
FunctionFile.define("b4_anim_prepare", function () {
    Command.summonSimple(
        MCFunctionEntityLibrary.creeper(),
        "CBI_B4_CREEPER",
        MCFunctionPositionFields.local(0, 0, 6)
    );
});
FunctionFile.define("b4_anim_creeper", function () {
    Command.playAnimation(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.creeper(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_B4_CREEPER", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.noSelectorCondition()
                )
            )
        )),
        MCFunctionAnimationLibrary.creeperSwelling()
    );
});
FunctionFile.define("b4_anim_cleanup", function () {
    // WARNING: kill may drop items. Only the uniquely named creeper is selected.
    Command.kill(MCFunctionFields.allEntities(
        MCFunctionFields.addEntityTypeCondition(
            MCFunctionEntityLibrary.creeper(), MCFunctionFields.BooleanLiteral.False,
            MCFunctionFields.addTextCondition(
                MCFunctionFields.SelectorTextConditionType.Name,
                "CBI_B4_CREEPER", MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.noSelectorCondition()
            )
        )
    ));
});

FunctionFile.define("b4_fog_push", function () {
    Command.fog(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogPush(MCFunctionFogLibrary.fogDesert(), "cbi_b4_test")
    );
});
FunctionFile.define("b4_fog_pop", function () {
    Command.fog(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogPop("cbi_b4_test")
    );
});
FunctionFile.define("b4_fog_remove", function () {
    Command.fog(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogRemove("cbi_b4_test")
    );
});
