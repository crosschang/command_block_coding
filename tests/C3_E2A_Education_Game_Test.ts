/**
 * C3 E2A executor context smoke test for Minecraft Education MakeCode.
 * Updated 0.0.85 extension required (E1 + E2A execute_interpreter.ts).
 * Authoring code uses ONLY existing FunctionFile / Command AST block APIs.
 * No Behavior Pack; no direct player.execute; no new blocks.
 *
 * CHANGES WORLD:
 *   absolute (5..7,-60,-76) and ~1 ~ ~, ~2 ~ ~ by the player.
 * Run on a test-world copy; stand still in a clear open test area.
 * All tests below assume initial e2setup and unchanged player position.
 */
FunctionFile.define("e2setup", function () {
    Command.setblock(MCFunctionPositionFields.absolute(5, -60, -76),
        MCFunctionBlockLibrary.custom("minecraft:gold_block"), MCFunctionBlockStateFields.none());
    Command.setblock(MCFunctionPositionFields.absolute(6, -60, -76),
        MCFunctionBlockLibrary.custom("minecraft:stone"), MCFunctionBlockStateFields.none());
    Command.setblock(MCFunctionPositionFields.absolute(7, -60, -76),
        MCFunctionBlockLibrary.custom("minecraft:stone"), MCFunctionBlockStateFields.none());
    Command.setblock(MCFunctionPositionFields.relative(1, 0, 0),
        MCFunctionBlockLibrary.custom("minecraft:stone"), MCFunctionBlockStateFields.none());
    Command.setblock(MCFunctionPositionFields.relative(2, 0, 0),
        MCFunctionBlockLibrary.custom("minecraft:stone"), MCFunctionBlockStateFields.none());
    Command.say("E2A SETUP COMPLETE");
});

/** as @s at @s positioned abs -> if block -> RUN SETBLOCK. */
FunctionFile.define("e2asat", function () {
    Command.execute(
        Command.executeTargetContext(Command.ExecuteTargetContextMode.As,
            MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
            Command.executeTargetContext(Command.ExecuteTargetContextMode.At,
                MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
                Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
                    MCFunctionPositionFields.absolute(5, -60, -76),
                    Command.executeIfBlock(Command.ExecutePolarity.If,
                        MCFunctionPositionFields.relative(0, 0, 0),
                        MCFunctionBlockLibrary.custom("minecraft:gold_block"),
                        Command.executeEnd())))),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.relative(1, 0, 0),
            MCFunctionBlockLibrary.custom("minecraft:glass"), MCFunctionBlockStateFields.none()));
});
FunctionFile.define("e2checkasat", function () {
    Command.execute(Command.executeIfBlock(Command.ExecutePolarity.If,
        MCFunctionPositionFields.absolute(6, -60, -76),
        MCFunctionBlockLibrary.custom("minecraft:glass"), Command.executeEnd()),
        MCFunctionExecuteRun.say("E2A AS AT PASS glass at 6 -60 -76"));
});

/** positioned 5... then at @s: last AT must RESET location to player (not 5...). */
FunctionFile.define("e2at", function () {
    Command.execute(
        Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
            MCFunctionPositionFields.absolute(5, -60, -76),
            Command.executeTargetContext(Command.ExecuteTargetContextMode.At,
                MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
                Command.executeEnd())),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.relative(1, 0, 0),
            MCFunctionBlockLibrary.custom("minecraft:glass"), MCFunctionBlockStateFields.none()));
});
FunctionFile.define("e2checkat", function () {
    Command.execute(Command.executeIfBlock(Command.ExecutePolarity.If,
        MCFunctionPositionFields.relative(1, 0, 0),
        MCFunctionBlockLibrary.custom("minecraft:glass"), Command.executeEnd()),
        MCFunctionExecuteRun.say("E2A AT SELF PASS glass next to player"));
});

/** positioned as @s restores location but leaves executor unchanged. */
FunctionFile.define("e2positionedas", function () {
    Command.execute(
        Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
            MCFunctionPositionFields.absolute(5, -60, -76),
            Command.executeEntityContext(Command.ExecuteEntityContextMode.PositionedAs,
                MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
                Command.executeEnd())),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.relative(2, 0, 0),
            MCFunctionBlockLibrary.custom("minecraft:diamond_block"), MCFunctionBlockStateFields.none()));
});
FunctionFile.define("e2checkpositionedas", function () {
    Command.execute(Command.executeIfBlock(Command.ExecutePolarity.If,
        MCFunctionPositionFields.relative(2, 0, 0),
        MCFunctionBlockLibrary.custom("minecraft:diamond_block"), Command.executeEnd()),
        MCFunctionExecuteRun.say("E2A POSITIONED AS PASS diamond next to player"));
});

/** If false, RUN must NOT replace the absolute stone at (7,-60,-76). */
FunctionFile.define("e2false", function () {
    Command.execute(
        Command.executeTargetContext(Command.ExecuteTargetContextMode.As,
            MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
            Command.executeTargetContext(Command.ExecuteTargetContextMode.At,
                MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
                Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
                    MCFunctionPositionFields.absolute(5, -60, -76),
                    Command.executeIfBlock(Command.ExecutePolarity.Unless,
                        MCFunctionPositionFields.relative(0, 0, 0),
                        MCFunctionBlockLibrary.custom("minecraft:gold_block"),
                        Command.executeEnd())))),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.absolute(7, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:glass"), MCFunctionBlockStateFields.none()));
});
FunctionFile.define("e2checkfalse", function () {
    Command.execute(Command.executeIfBlock(Command.ExecutePolarity.If,
        MCFunctionPositionFields.absolute(7, -60, -76),
        MCFunctionBlockLibrary.custom("minecraft:stone"), Command.executeEnd()),
        MCFunctionExecuteRun.say("E2A FALSE PASS stone unchanged at 7 -60 -76"));
});

/** @a requires multi-executor branches; E2A must NOT execute and MUST explain. */
FunctionFile.define("e2reject", function () {
    Command.execute(
        Command.executeTargetContext(Command.ExecuteTargetContextMode.As,
            MCFunctionFields.targetSelector(MCFunctionFields.allPlayers(MCFunctionFields.noSelectorCondition())),
            Command.executeEnd()),
        MCFunctionExecuteRun.setblockFull(MCFunctionPositionFields.absolute(7, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:diamond_block"), MCFunctionBlockStateFields.none()));
});
FunctionFile.define("e2checkreject", function () {
    Command.execute(Command.executeIfBlock(Command.ExecutePolarity.If,
        MCFunctionPositionFields.absolute(7, -60, -76),
        MCFunctionBlockLibrary.custom("minecraft:stone"), Command.executeEnd()),
        MCFunctionExecuteRun.say("E2A REJECT PASS stone unchanged at 7 -60 -76"));
});
Preview.ready();
