/** B4 advanced PLAYANIMATION + FOG media compatibility test (Minecraft Education).
 * COPY INTO A TEMPORARY MakeCode project's main.ts. NOT an Extension source file.
 * Test in Creative, open space; clear the camera before each visual comparison.
 * Command -> Block Adapter -> AST -> Validator -> Compiler -> Preview path.
 * INFO RESOURCE_DEPENDENT is expected, not proof of visual effect.
 */

// A named Allay and a second, untouched control Allay.
FunctionFile.define("b4v_anim_prepare", function () {
    Command.summonSimple(MCFunctionEntityLibrary.allay(),
        "CBI_B4V_DANCE_075", MCFunctionPositionFields.local(-2, 1, 5));
    Command.summonSimple(MCFunctionEntityLibrary.allay(),
        "CBI_B4V_CONTROL_075", MCFunctionPositionFields.local(2, 1, 5));
});

// All advanced tests use the SAME selector; only optional parameters change.
FunctionFile.define("b4v_anim_base", function () {
    Command.playAnimation(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(MCFunctionEntityLibrary.allay(),
                MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_B4V_DANCE_075", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.noSelectorCondition())))),
        MCFunctionAnimationLibrary.animationAllayDance());
});

// Tests next_state argument only. "default" is a common controller-state name,
// not a guaranteed state in every entity or resource pack.
FunctionFile.define("b4v_anim_state", function () {
    Command.playAnimation(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(MCFunctionEntityLibrary.allay(),
                MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_B4V_DANCE_075", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.noSelectorCondition())))),
        MCFunctionAnimationLibrary.animationAllayDance(),
        Command.animationOptions("default"));
});

FunctionFile.define("b4v_anim_blend0", function () {
    Command.playAnimation(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(MCFunctionEntityLibrary.allay(),
                MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_B4V_DANCE_075", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.noSelectorCondition())))),
        MCFunctionAnimationLibrary.animationAllayDance(),
        Command.animationOptions("default", Command.animationBlend(0)));
});

FunctionFile.define("b4v_anim_blend2", function () {
    Command.playAnimation(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(MCFunctionEntityLibrary.allay(),
                MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_B4V_DANCE_075", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.noSelectorCondition())))),
        MCFunctionAnimationLibrary.animationAllayDance(),
        Command.animationOptions("default", Command.animationBlend(2)));
});

// Molang query.anim_time: seconds since current animation started.
// The expression should stop the animation once it exceeds ~3 seconds.
FunctionFile.define("b4v_anim_stop3", function () {
    Command.playAnimation(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(MCFunctionEntityLibrary.allay(),
                MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_B4V_DANCE_075", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.noSelectorCondition())))),
        MCFunctionAnimationLibrary.animationAllayDance(),
        Command.animationOptions("default", Command.animationBlend(0.5),
            Command.animationStop("query.anim_time > 3.0")));
});

// Compatibility test: an OFFICIAL Allay controller ID, separate from animation ID.
// Not every built-in controller necessarily works as the /playanimation controller arg.
FunctionFile.define("b4v_anim_controller", function () {
    Command.playAnimation(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(MCFunctionEntityLibrary.allay(),
                MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_B4V_DANCE_075", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.noSelectorCondition())))),
        MCFunctionAnimationLibrary.animationAllayDance(),
        Command.animationOptions("default", Command.animationBlend(0.5),
            Command.animationStop("query.anim_time > 3.0"),
            MCFunctionAnimationControllerLibrary.custom("controller.animation.allay.dancing")));
});

FunctionFile.define("b4v_anim_cleanup", function () {
    Command.kill(MCFunctionFields.allEntities(
        MCFunctionFields.addEntityTypeCondition(MCFunctionEntityLibrary.allay(),
            MCFunctionFields.BooleanLiteral.False,
            MCFunctionFields.addTextCondition(
                MCFunctionFields.SelectorTextConditionType.Name,
                "CBI_B4V_DANCE_075", MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.noSelectorCondition()))));
    Command.kill(MCFunctionFields.allEntities(
        MCFunctionFields.addEntityTypeCondition(MCFunctionEntityLibrary.allay(),
            MCFunctionFields.BooleanLiteral.False,
            MCFunctionFields.addTextCondition(
                MCFunctionFields.SelectorTextConditionType.Name,
                "CBI_B4V_CONTROL_075", MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.noSelectorCondition()))));
});

// Air+weather+water fog. Confirmed visible in previous Minecraft Education test.
FunctionFile.define("b4v_fog_air_push", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogPush(MCFunctionFogLibrary.fogCrimsonForest(), "b4v_air_075"));
});
FunctionFile.define("b4v_fog_air_pop", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogPop("b4v_air_075"));
});
FunctionFile.define("b4v_fog_air_remove", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogRemove("b4v_air_075"));
});

// Water-only in Mojang's definition. Test while camera is underwater; a dry-land
// test does NOT establish failure because no distance.air setting is declared.
FunctionFile.define("b4v_fog_water_push", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogPush(MCFunctionFogLibrary.fogDesert(), "b4v_water_075"));
});
FunctionFile.define("b4v_fog_water_remove", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogRemove("b4v_water_075"));
});

// Second confirmed official AIR definition. Rendering depends on version/pack.
FunctionFile.define("b4v_fog_end_push", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogPush(MCFunctionFogLibrary.custom("minecraft:fog_the_end"), "b4v_end_075"));
});
FunctionFile.define("b4v_fog_end_remove", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogRemove("b4v_end_075"));
});

// Stack order: crimson as bottom, End as top, then pop End and remove crimson.
FunctionFile.define("b4v_fog_stack_a", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogPush(MCFunctionFogLibrary.fogCrimsonForest(), "b4v_stack_a"));
});
FunctionFile.define("b4v_fog_stack_b", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogPush(MCFunctionFogLibrary.custom("minecraft:fog_the_end"), "b4v_stack_b"));
});
FunctionFile.define("b4v_fog_stack_pop_b", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogPop("b4v_stack_b"));
});
FunctionFile.define("b4v_fog_stack_remove_a", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogRemove("b4v_stack_a"));
});

// Clean up ONLY tags owned by this test; run before AND after fog experiments.
FunctionFile.define("b4v_fog_cleanup", function () {
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogRemove("b4v_air_075"));
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogRemove("b4v_water_075"));
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogRemove("b4v_end_075"));
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogRemove("b4v_stack_a"));
    Command.fog(MCFunctionFields.targetSelector(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.fogRemove("b4v_stack_b"));
});
