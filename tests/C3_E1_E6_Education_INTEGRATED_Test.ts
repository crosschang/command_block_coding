/**
 * C3 E1..E6 integrated ONE-PASS Minecraft Education test.
 * Use ONLY the project's typed Command / FunctionFile Extension API.
 * No direct player.execute, no bridge, no Behavior Pack.
 * Ensure Editor Extension has replaced src/preview/execute_interpreter.ts.
 * DANGER: tests edit blocks around (30..37,-60,-70), so use a CLONED world.
 * DO NOT interpret INFO [UNSUPPORTED] as runtime command PASS.
 */
FunctionFile.define("e16setup", function () {
    Command.setblock(MCFunctionPositionFields.absolute(30, -60, -70),
        MCFunctionBlockLibrary.custom("minecraft:gold_block"), MCFunctionBlockStateFields.none());
    Command.setblock(MCFunctionPositionFields.absolute(31, -60, -70),
        MCFunctionBlockLibrary.custom("minecraft:stone"), MCFunctionBlockStateFields.none());
    Command.setblock(MCFunctionPositionFields.absolute(32, -60, -70),
        MCFunctionBlockLibrary.custom("minecraft:stone"), MCFunctionBlockStateFields.none());
    Command.setblock(MCFunctionPositionFields.absolute(33, -60, -69),
        MCFunctionBlockLibrary.custom("minecraft:stone"), MCFunctionBlockStateFields.none());
    Command.setblock(MCFunctionPositionFields.absolute(34, -60, -69),
        MCFunctionBlockLibrary.custom("minecraft:stone"), MCFunctionBlockStateFields.none());
    Command.setblock(MCFunctionPositionFields.absolute(35, -60, -70),
        MCFunctionBlockLibrary.custom("minecraft:stone"), MCFunctionBlockStateFields.none());
    Command.scoreboard(Command.scoreboardObjectiveAdd("e16score"));
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Set,
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        "e16score", 3));
    Command.say("E16 SETUP COMPLETE");
});

/** E1: positioned, relative IF and RUN. */
FunctionFile.define("e16e1", function () {
    Command.execute(
        Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
            MCFunctionPositionFields.absolute(30, -60, -70),
            Command.executeIfBlock(Command.ExecutePolarity.If,
                MCFunctionPositionFields.relative(0, 0, 0),
                MCFunctionBlockLibrary.custom("minecraft:gold_block"), Command.executeEnd())),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.relative(1, 0, 0),
            MCFunctionBlockLibrary.custom("minecraft:glass"), MCFunctionBlockStateFields.none()));
});
FunctionFile.define("e16check1", function () {
    Command.execute(Command.executeIfBlock(Command.ExecutePolarity.If,
        MCFunctionPositionFields.absolute(31, -60, -70),
        MCFunctionBlockLibrary.custom("minecraft:glass"), Command.executeEnd()),
        MCFunctionExecuteRun.say("E1 PASS glass at 31 -60 -70"));
});

/** E2 self: as @s at @s then positioned (preserves the exact E1 position). */
FunctionFile.define("e16e2", function () {
    Command.execute(
        Command.executeTargetContext(Command.ExecuteTargetContextMode.As,
            MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
            Command.executeTargetContext(Command.ExecuteTargetContextMode.At,
                MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
                Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
                    MCFunctionPositionFields.absolute(30, -60, -70), Command.executeEnd()))),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.relative(2, 0, 0),
            MCFunctionBlockLibrary.custom("minecraft:diamond_block"), MCFunctionBlockStateFields.none()));
});
FunctionFile.define("e16check2", function () {
    Command.execute(Command.executeIfBlock(Command.ExecutePolarity.If,
        MCFunctionPositionFields.absolute(32, -60, -70),
        MCFunctionBlockLibrary.custom("minecraft:diamond_block"), Command.executeEnd()),
        MCFunctionExecuteRun.say("E2 PASS diamond at 32 -60 -70"));
});
/** E2 multi: each online player says message through legacy Preview dispatcher. */
FunctionFile.define("e16multi", function () {
    Command.execute(
        Command.executeTargetContext(Command.ExecuteTargetContextMode.As,
            MCFunctionFields.targetSelector(MCFunctionFields.allPlayers(MCFunctionFields.noSelectorCondition())),
            Command.executeTargetContext(Command.ExecuteTargetContextMode.At,
                MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
                Command.executeEnd())),
        MCFunctionExecuteRun.say("E2 MULTI PLAYER SAY"));
});

/** E3: entity predicate proven true; no estimated entity counts. */
FunctionFile.define("e16entity", function () {
    Command.execute(Command.executeIfEntity(Command.ExecutePolarity.If,
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        Command.executeEnd()), MCFunctionExecuteRun.say("E3 ENTITY TRUE"));
});
/** E3 FALSE: unless @a is false because the active player exists. */
FunctionFile.define("e16unlesse", function () {
    Command.execute(Command.executeIfEntity(Command.ExecutePolarity.Unless,
        MCFunctionFields.targetSelector(MCFunctionFields.allPlayers(MCFunctionFields.noSelectorCondition())),
        Command.executeEnd()),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.absolute(35, -60, -70),
            MCFunctionBlockLibrary.custom("minecraft:glass"), MCFunctionBlockStateFields.none()));
});
FunctionFile.define("e16check3", function () {
    Command.execute(Command.executeIfBlock(Command.ExecutePolarity.If,
        MCFunctionPositionFields.absolute(35, -60, -70),
        MCFunctionBlockLibrary.custom("minecraft:stone"), Command.executeEnd()),
        MCFunctionExecuteRun.say("E3 FALSE PASS stone unchanged"));
});
/** E3 Score condition: read-only testfor using selector; failure may be UNKNOWN. */
FunctionFile.define("e16score", function () {
    Command.execute(Command.executeIfScore(Command.ExecutePolarity.If,
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        "e16score", MCFunctionFields.rangeMinMax(3, 3), Command.executeEnd()),
        MCFunctionExecuteRun.say("E3 SCORE TRUE - selector query supported"));
});

/** E4: rotated 0 0 local ^ ^ ^1 at 33 -60 -70 => 33 -60 -69. */
FunctionFile.define("e16e4", function () {
    Command.execute(Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
        MCFunctionPositionFields.absolute(33, -60, -70),
        Command.executeRotated(MCFunctionRotationFields.absolute(0, 0),
            Command.executeEnd())),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.local(0, 0, 1),
            MCFunctionBlockLibrary.custom("minecraft:emerald_block"), MCFunctionBlockStateFields.none()));
});
FunctionFile.define("e16check4", function () {
    Command.execute(Command.executeIfBlock(Command.ExecutePolarity.If,
        MCFunctionPositionFields.absolute(33, -60, -69),
        MCFunctionBlockLibrary.custom("minecraft:emerald_block"), Command.executeEnd()),
        MCFunctionExecuteRun.say("E4 PASS emerald at 33 -60 -69"));
});

/** E5: face towards +Z from 34,-60,-70 then local ^ ^ ^1. */
FunctionFile.define("e16e5", function () {
    Command.execute(Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
        MCFunctionPositionFields.absolute(34, -60, -70),
        Command.executePositionContext(Command.ExecutePositionContextMode.FacingPosition,
            MCFunctionPositionFields.absolute(34, -60, -60),
            Command.executeEnd())),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.local(0, 0, 1),
            MCFunctionBlockLibrary.custom("minecraft:diamond_block"), MCFunctionBlockStateFields.none()));
});
FunctionFile.define("e16check5", function () {
    Command.execute(Command.executeIfBlock(Command.ExecutePolarity.If,
        MCFunctionPositionFields.absolute(34, -60, -69),
        MCFunctionBlockLibrary.custom("minecraft:diamond_block"), Command.executeEnd()),
        MCFunctionExecuteRun.say("E5 PASS diamond at 34 -60 -69"));
});
/** E5 guard: exact eye pose unavailable, MUST NOT execute local SETBLOCK. */
FunctionFile.define("e16eyes", function () {
    Command.execute(Command.executeAnchored(Command.ExecuteAnchorChoice.Eyes,
        Command.executeEnd()),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.local(0, 0, 1),
            MCFunctionBlockLibrary.custom("minecraft:glass"), MCFunctionBlockStateFields.none()));
});

/** E6: SAY is dimension-neutral, so modern 'in' may be emulated safely. */
FunctionFile.define("e16e6say", function () {
    Command.execute(Command.executeIn(Command.ExecuteDimensionChoice.Nether,
        Command.executeEnd()), MCFunctionExecuteRun.say("E6 SAFE SAY"));
});
/** E6 guard: MUST NOT mutate overworld when a Nether context was requested. */
FunctionFile.define("e16e6guard", function () {
    Command.execute(Command.executeIn(Command.ExecuteDimensionChoice.Nether,
        Command.executeEnd()),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.absolute(35, -60, -70),
            MCFunctionBlockLibrary.custom("minecraft:glass"), MCFunctionBlockStateFields.none()));
});
FunctionFile.define("e16check6", function () {
    Command.execute(Command.executeIfBlock(Command.ExecutePolarity.If,
        MCFunctionPositionFields.absolute(35, -60, -70),
        MCFunctionBlockLibrary.custom("minecraft:stone"), Command.executeEnd()),
        MCFunctionExecuteRun.say("E6 GUARD PASS - overworld stone unchanged"));
});
Preview.ready()

/** One chat command runs the complete E1..E6 verification sequence. */
FunctionFile.define("e16all", function () {
    Command.mcFunction("e16setup");
    Command.mcFunction("e16e1");
    Command.mcFunction("e16check1");
    Command.mcFunction("e16e2");
    Command.mcFunction("e16check2");
    Command.mcFunction("e16multi");
    Command.mcFunction("e16entity");
    Command.mcFunction("e16unlesse");
    Command.mcFunction("e16check3");
    Command.mcFunction("e16score");
    Command.mcFunction("e16e4");
    Command.mcFunction("e16check4");
    Command.mcFunction("e16e5");
    Command.mcFunction("e16check5");
    Command.mcFunction("e16eyes");
    Command.mcFunction("e16e6say");
    Command.mcFunction("e16e6guard");
    Command.mcFunction("e16check6");
});
