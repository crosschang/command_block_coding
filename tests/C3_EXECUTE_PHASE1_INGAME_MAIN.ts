/** C3 Education Preview tests. Paste all into MakeCode JavaScript, convert to Blocks. */
/** Setup in TEST WORLD via direct game chat:
 * /setblock 5 -60 -76 minecraft:gold_block
 * /setblock 6 -60 -76 minecraft:stone
 */
FunctionFile.define("c3gold", function () {
    Command.execute(
        Command.executeIfBlock(
            Command.ExecutePolarity.If,
            MCFunctionPositionFields.absolute(5, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:gold_block"),
            Command.executeEnd()
        ),
        Command.executeRunSay("C3 GOLD MATCH")
    );
});
FunctionFile.define("c3nogold", function () {
    Command.execute(
        Command.executeIfBlock(
            Command.ExecutePolarity.Unless,
            MCFunctionPositionFields.absolute(5, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:gold_block"),
            Command.executeEnd()
        ),
        Command.executeRunSay("C3 GOLD NOT FOUND")
    );
});
FunctionFile.define("c3stone", function () {
    Command.execute(
        Command.executeIfBlock(
            Command.ExecutePolarity.If,
            MCFunctionPositionFields.absolute(6, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:stone"),
            Command.executeEnd()
        ),
        Command.executeRunSay("C3 STONE MATCH")
    );
});
FunctionFile.define("c3chain", function () {
    Command.execute(
        Command.executeIfBlock(
            Command.ExecutePolarity.If,
            MCFunctionPositionFields.absolute(5, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:gold_block"),
            Command.executeIfBlock(
                Command.ExecutePolarity.Unless,
                MCFunctionPositionFields.absolute(6, -60, -76),
                MCFunctionBlockLibrary.custom("minecraft:gold_block"),
                Command.executeEnd()
            )
        ),
        Command.executeRunSay("C3 CHAIN MATCH")
    );
});
FunctionFile.define("c3score", function () {
    Command.execute(
        Command.executeIfScore(
            Command.ExecutePolarity.If,
            MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
            "c2_lab", MCFunctionFields.rangeMin(10),
            Command.executeEnd()
        ),
        Command.executeRunSay("C3 SCORE MATCH")
    );
});
FunctionFile.define("c3as", function () {
    Command.execute(
        Command.executeTargetContext(Command.ExecuteTargetContextMode.As,
            MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
            Command.executeEnd()
        ),
        Command.executeRunSay("C3 AS MATCH")
    );
});
FunctionFile.define("c3raw", function () {
    Command.execute(
        Command.executeEnd(),
        Command.executeRunRaw("say C3 RAW RUN")
    );
});

// Selector-like context clause assembly: compiles to "execute as @s at @s run say ...";
// Preview intentionally reports UNSUPPORTED until entity context replay is validated.
FunctionFile.define("c3compact", function () {
    Command.execute(
        Command.executeTargetContext(Command.ExecuteTargetContextMode.As,
            MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
            Command.executeTargetContext(Command.ExecuteTargetContextMode.At,
                MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
                Command.executeEnd())),
        Command.executeRunSay("C3 CONTEXT TEST")
    );
});
// "facing position" is a different clause from "positioned"; both share the same coordinate input.
FunctionFile.define("c3compactpos", function () {
    Command.execute(
        Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
            MCFunctionPositionFields.absolute(5, -60, -76),
            Command.executePositionContext(Command.ExecutePositionContextMode.FacingPosition,
                MCFunctionPositionFields.absolute(6, -60, -76),
                Command.executeEnd())),
        Command.executeRunSay("C3 POSITION TEST")
    );
});
