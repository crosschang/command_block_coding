/** C3 Phase2 MakeCode JavaScript -> Blocks integration checks, version 0.0.77.
 * Use TEST WORLD. Definitions are not run until their chat name is entered.
 * Setup using direct game chat:
 * /setblock 5 -60 -76 minecraft:gold_block
 * /setblock 6 -60 -76 minecraft:stone
 * /setblock 7 -60 -76 minecraft:air
 * Complex context and score comparisons intentionally cannot run in TS Preview.
 */
FunctionFile.define("c3p2block", function () {
    Command.execute(
        Command.executeIfBlockStates(Command.ExecutePolarity.If,
            MCFunctionPositionFields.absolute(5, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:gold_block"),
            MCFunctionBlockStateFields.none(),
            Command.executeEnd()),
        Command.executeRunSay("C3 P2 SIMPLE BLOCK MATCH")
    );
});
FunctionFile.define("c3p2state", function () {
    Command.execute(
        Command.executeIfBlockStates(Command.ExecutePolarity.If,
            MCFunctionPositionFields.absolute(5, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:oak_log"),
            MCFunctionBlockStateFields.text("pillar_axis", "x", MCFunctionBlockStateFields.none()),
            Command.executeEnd()),
        Command.executeRunSay("C3 P2 BLOCK STATE MATCH")
    );
});
FunctionFile.define("c3p2posas", function () {
    Command.execute(
        Command.executeEntityContext(Command.ExecuteEntityContextMode.PositionedAs,
            MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
            Command.executeEnd()),
        Command.executeRunSay("C3 P2 POSITIONED AS")
    );
});
FunctionFile.define("c3p2rotas", function () {
    Command.execute(
        Command.executeEntityContext(Command.ExecuteEntityContextMode.RotatedAs,
            MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
            Command.executeEnd()),
        Command.executeRunSay("C3 P2 ROTATED AS")
    );
});
FunctionFile.define("c3p2score", function () {
    Command.execute(
        Command.executeIfScoreCompare(Command.ExecutePolarity.If,
            MCFunctionFields.namedPlayerTarget("C3Left"), "c3_lab",
            Command.ExecuteCompareChoice.GreaterOrEqual,
            MCFunctionFields.namedPlayerTarget("C3Right"), "c3_lab",
            Command.executeEnd()),
        Command.executeRunSay("C3 P2 SCORE COMPARE")
    );
});
FunctionFile.define("c3p2setblock", function () {
    Command.execute(
        Command.executeIfBlockStates(Command.ExecutePolarity.If,
            MCFunctionPositionFields.absolute(5, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:gold_block"),
            MCFunctionBlockStateFields.none(),
            Command.executeEnd()),
        Command.executeRunSetBlock(
            MCFunctionPositionFields.absolute(7, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:stone"),
            MCFunctionBlockStateFields.none())
    );
});
FunctionFile.define("c3p2summon", function () {
    Command.execute(
        Command.executeIfBlockStates(Command.ExecutePolarity.If,
            MCFunctionPositionFields.absolute(5, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:gold_block"),
            MCFunctionBlockStateFields.none(),
            Command.executeEnd()),
        Command.executeRunSummon(MCFunctionEntityLibrary.custom("minecraft:chicken"),
            MCFunctionPositionFields.absolute(8, -60, -76))
    );
});
FunctionFile.define("c3p2function", function () {
    Command.execute(Command.executeEnd(), Command.executeRunFunction("c3/nonexistent_test"));
});
