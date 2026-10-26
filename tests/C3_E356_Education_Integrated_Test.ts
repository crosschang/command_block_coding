/**
 * C3 E3/E5/E6 Preview Gap Reduction / Minecraft Education / 0.0.86.
 * TEST ONLY in a duplicate world. No Behavior Pack or Function Bridge.
 * Uses only project Command/FunctionFile/Preview public block APIs.
 * Expected: E3 positive messages, E5 real block + E5 pose candidate, E6 SAY;
 *            negative comparisons do not RUN; unsafe local/dimension effects
 *            report an INFO and do not modify world blocks.
 */
FunctionFile.define("gsetup", function () {
    Command.scoreboard(Command.scoreboardObjectiveAdd("e3g_main"));
    Command.scoreboard(Command.scoreboardObjectiveAdd("e3g_other"));
    Command.scoreboard(Command.scoreboardPlayersScore(
        Command.ScoreboardNumberMode.Set,
        MCFunctionFields.targetSelector(MCFunctionFields.self(
            MCFunctionFields.noSelectorCondition())), "e3g_main", 3));
    Command.scoreboard(Command.scoreboardPlayersScore(
        Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("E3G_B"), "e3g_other", 1));
    Command.say("E356 SETUP - scores 3 and 1 submitted");
});

// E3: compare actual, *unmodified* scoreboard values 3 > 1 (TRUE).
FunctionFile.define("g3greater", function () {
    Command.execute(Command.executeIfScoreCompare(
        Command.ExecutePolarity.If,
        MCFunctionFields.targetSelector(MCFunctionFields.self(
            MCFunctionFields.noSelectorCondition())),
        "e3g_main", Command.ExecuteCompareChoice.Greater,
        Command.scoreboardFakePlayer("E3G_B"), "e3g_other",
        Command.executeEnd()),
        MCFunctionExecuteRun.say("E3 COMPARE GT TRUE - 3 greater than 1"));
});

// E3: compare 3 < 1 (FALSE). This sentinel must NEVER be seen.
FunctionFile.define("g3less", function () {
    Command.execute(Command.executeIfScoreCompare(
        Command.ExecutePolarity.If,
        MCFunctionFields.targetSelector(MCFunctionFields.self(
            MCFunctionFields.noSelectorCondition())),
        "e3g_main", Command.ExecuteCompareChoice.Less,
        Command.scoreboardFakePlayer("E3G_B"), "e3g_other",
        Command.executeEnd()),
        MCFunctionExecuteRun.say("ERROR E3 FALSE BRANCH EXECUTED"));
});

// E5: anchored eyes + facing changes rotation, but RUN ~ block does not
// use the anchor or facing rotation. Real block placement must occur.
FunctionFile.define("g5neutral", function () {
    Command.execute(Command.executeAnchored(
        Command.ExecuteAnchorChoice.Eyes,
        Command.executePositionContext(
            Command.ExecutePositionContextMode.FacingPosition,
            MCFunctionPositionFields.relative(10, 0, 10),
            Command.executeEnd())),
        MCFunctionExecuteRun.setblockFull(
            MCFunctionPositionFields.relative(4, 0, 0),
            MCFunctionBlockLibrary.custom("minecraft:emerald_block"),
            MCFunctionBlockStateFields.none()));
});
FunctionFile.define("g5check", function () {
    Command.execute(Command.executeIfBlock(
        Command.ExecutePolarity.If,
        MCFunctionPositionFields.relative(4, 0, 0),
        MCFunctionBlockLibrary.custom("minecraft:emerald_block"),
        Command.executeEnd()),
        MCFunctionExecuteRun.say("E5 POSE NEUTRAL PASS - emerald at ~4 ~ ~"));
});

// E5: local ^ coordinate after eyes is pose dependent; MUST NOT guess.
FunctionFile.define("g5guard", function () {
    Command.execute(Command.executeAnchored(
        Command.ExecuteAnchorChoice.Eyes,
        Command.executePositionContext(
            Command.ExecutePositionContextMode.FacingPosition,
            MCFunctionPositionFields.relative(10, 0, 10),
            Command.executeEnd())),
        MCFunctionExecuteRun.setblockFull(
            MCFunctionPositionFields.local(0, 0, 4),
            MCFunctionBlockLibrary.custom("minecraft:gold_block"),
            MCFunctionBlockStateFields.none()));
});

// E5: ONE user-facing pose/eye-candidate diagnostic.
// The RUN is deliberately BLOCKED until the eye-height registry is calibrated
// against native Bedrock in STANDING, SNEAK, and LOW poses.
// Height offsets: positioned ~ ~0.45 ~ makes the 3 candidate Y cells distinct.
FunctionFile.define("g5pose", function () {
    Command.execute(
        Command.executeTargetContext(
            Command.ExecuteTargetContextMode.As,
            MCFunctionFields.targetSelector(MCFunctionFields.self(
                MCFunctionFields.noSelectorCondition())),
            Command.executeTargetContext(
                Command.ExecuteTargetContextMode.At,
                MCFunctionFields.targetSelector(MCFunctionFields.self(
                    MCFunctionFields.noSelectorCondition())),
                Command.executePositionContext(
                    Command.ExecutePositionContextMode.Positioned,
                    MCFunctionPositionFields.relative(0, 0.45, 0),
                    Command.executeAnchored(
                        Command.ExecuteAnchorChoice.Eyes,
                        Command.executeRotated(
                            MCFunctionRotationFields.absolute(0, 0),
                            Command.executeEnd()
                        )
                    )
                )
            )
        ),
        MCFunctionExecuteRun.setblockFull(
            MCFunctionPositionFields.local(0, 0, 4),
            MCFunctionBlockLibrary.custom("minecraft:gold_block"),
            MCFunctionBlockStateFields.none()
        )
    );
});

// E6: global scoreboard comparison is dimension-independent;
// SAY does not change any dimension-specific game world state.
FunctionFile.define("g6global", function () {
    Command.execute(Command.executeIn(
        Command.ExecuteDimensionChoice.Nether,
        Command.executeIfScoreCompare(
            Command.ExecutePolarity.If,
            MCFunctionFields.targetSelector(MCFunctionFields.self(
                MCFunctionFields.noSelectorCondition())),
            "e3g_main", Command.ExecuteCompareChoice.Greater,
            Command.scoreboardFakePlayer("E3G_B"), "e3g_other",
            Command.executeEnd())),
        MCFunctionExecuteRun.say("E6 GLOBAL SCORE PASS - dimension neutral SAY"));
});

// E6: changing a Nether block through MakeCode Preview is still UNSUPPORTED.
FunctionFile.define("g6guard", function () {
    Command.execute(Command.executeIn(
        Command.ExecuteDimensionChoice.Nether,
        Command.executeEnd()),
        MCFunctionExecuteRun.setblockFull(
            MCFunctionPositionFields.absolute(75, 64, -80),
            MCFunctionBlockLibrary.custom("minecraft:glass"),
            MCFunctionBlockStateFields.none()));
});

// E3: out-of-range proof: no false "3 > 200" evaluation from a rejected probe.
FunctionFile.define("g3range", function () {
    Command.scoreboard(Command.scoreboardPlayersScore(
        Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("E3G_B"), "e3g_other", 200));
    Command.execute(Command.executeIfScoreCompare(
        Command.ExecutePolarity.If,
        MCFunctionFields.targetSelector(MCFunctionFields.self(
            MCFunctionFields.noSelectorCondition())),
        "e3g_main", Command.ExecuteCompareChoice.Greater,
        Command.scoreboardFakePlayer("E3G_B"), "e3g_other",
        Command.executeEnd()),
        MCFunctionExecuteRun.say("ERROR OUTSIDE SCORE DOMAIN RAN"));
});

// One command; run while both players are stationary. g3range goes LAST.
FunctionFile.define("gall", function () {
    Command.mcFunction("gsetup");
    Command.mcFunction("g3greater");
    Command.mcFunction("g3less");
    Command.mcFunction("g5neutral");
    Command.mcFunction("g5check");
    Command.mcFunction("g5guard");
    Command.mcFunction("g5pose");
    Command.mcFunction("g6global");
    Command.mcFunction("g6guard");
    Command.mcFunction("g3range");
    Command.say("E356 PREVIEW SEQUENCE COMPLETE - inspect messages");
});

Preview.ready();
