/**
 * C3 Execute Preview TypeScript E1 test - Minecraft Education.
 * Paste into an EMPTY MakeCode project using the UPDATED extension.
 * Uses command_block_coding API ONLY (no player.* in user code).
 *
 * Target blocks are modified at (5,-60,-76), (6,-60,-76), (7,-60,-76),
 * (8,-60,-76) and (-3,-60,-75). Run only in a throwaway test world.
 *
 * TEST: e1setup -> e1abs -> e1checkabs -> e1relative -> e1checkrelative
 *       -> e1negative -> e1checknegative -> e1false -> e1checkfalse
 *       -> e1b04 -> e1b09
 */

// Setup uses only Extension Command AST APIs.
FunctionFile.define("e1setup", function () {
    Command.setblock(
        MCFunctionPositionFields.absolute(5, -60, -76),
        MCFunctionBlockLibrary.custom("minecraft:gold_block"),
        MCFunctionBlockStateFields.none())
    Command.setblock(
        MCFunctionPositionFields.absolute(6, -60, -76),
        MCFunctionBlockLibrary.custom("minecraft:stone"),
        MCFunctionBlockStateFields.none())
    Command.setblock(
        MCFunctionPositionFields.absolute(7, -60, -76),
        MCFunctionBlockLibrary.custom("minecraft:stone"),
        MCFunctionBlockStateFields.none())
    Command.setblock(
        MCFunctionPositionFields.absolute(8, -60, -76),
        MCFunctionBlockLibrary.custom("minecraft:stone"),
        MCFunctionBlockStateFields.none())
    Command.setblock(
        MCFunctionPositionFields.absolute(-3, -60, -75),
        MCFunctionBlockLibrary.custom("minecraft:stone"),
        MCFunctionBlockStateFields.none())
    Command.say("E1 SETUP COMPLETE")
})

// positioned ABS + if block REL + RUN setblock REL.
FunctionFile.define("e1abs", function () {
    Command.execute(
        Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
            MCFunctionPositionFields.absolute(5, -60, -76),
            Command.executeIfBlock(Command.ExecutePolarity.If,
                MCFunctionPositionFields.relative(0, 0, 0),
                MCFunctionBlockLibrary.custom("minecraft:gold_block"),
                Command.executeEnd())),
        MCFunctionExecuteRun.setblockFull(
            MCFunctionPositionFields.relative(1, 0, 0),
            MCFunctionBlockLibrary.custom("minecraft:glass"),
            MCFunctionBlockStateFields.none()))
})

FunctionFile.define("e1checkabs", function () {
    Command.execute(
        Command.executeIfBlock(Command.ExecutePolarity.If,
            MCFunctionPositionFields.absolute(6, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:glass"),
            Command.executeEnd()),
        MCFunctionExecuteRun.say("E1 ABS PASS - glass at 6 -60 -76"))
})

// Ordered double positioned: absolute base, then relative +2.
FunctionFile.define("e1relative", function () {
    Command.execute(
        Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
            MCFunctionPositionFields.absolute(5, -60, -76),
            Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
                MCFunctionPositionFields.relative(2, 0, 0),
                Command.executeIfBlock(Command.ExecutePolarity.If,
                    MCFunctionPositionFields.relative(-2, 0, 0),
                    MCFunctionBlockLibrary.custom("minecraft:gold_block"),
                    Command.executeEnd()))),
        MCFunctionExecuteRun.setblockFull(
            MCFunctionPositionFields.relative(0, 0, 0),
            MCFunctionBlockLibrary.custom("minecraft:diamond_block"),
            MCFunctionBlockStateFields.none()))
})

FunctionFile.define("e1checkrelative", function () {
    Command.execute(
        Command.executeIfBlock(Command.ExecutePolarity.If,
            MCFunctionPositionFields.absolute(7, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:diamond_block"),
            Command.executeEnd()),
        MCFunctionExecuteRun.say("E1 RELATIVE PASS - diamond at 7 -60 -76"))
})

// Align xz floors NEGATIVE coordinates, then a small relative offset.
// With align: (-2.4, -59.1, -74.8) -> (-3, -59.1, -75)
// Then +(.8, 0, .8) -> (-2.2, -59.1, -74.2) -> block (-3, -60, -75).
// Without align the target cell is different. This is NOT a cosmetic check.
FunctionFile.define("e1negative", function () {
    Command.execute(
        Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
            MCFunctionPositionFields.absolute(-2.4, -59.1, -74.8),
            Command.executeAlign("xz",
                Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
                    MCFunctionPositionFields.relative(0.8, 0, 0.8),
                    Command.executeEnd()))),
        MCFunctionExecuteRun.setblockFull(
            MCFunctionPositionFields.relative(0, 0, 0),
            MCFunctionBlockLibrary.custom("minecraft:emerald_block"),
            MCFunctionBlockStateFields.none()))
})

FunctionFile.define("e1checknegative", function () {
    Command.execute(
        Command.executeIfBlock(Command.ExecutePolarity.If,
            MCFunctionPositionFields.absolute(-3, -60, -75),
            MCFunctionBlockLibrary.custom("minecraft:emerald_block"),
            Command.executeEnd()),
        MCFunctionExecuteRun.say("E1 ALIGN NEGATIVE PASS - emerald at -3 -60 -75"))
})

// Failure branch: gold exists, so UNLESS gold must NOT execute.
FunctionFile.define("e1false", function () {
    Command.execute(
        Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
            MCFunctionPositionFields.absolute(5, -60, -76),
            Command.executeIfBlock(Command.ExecutePolarity.Unless,
                MCFunctionPositionFields.relative(0, 0, 0),
                MCFunctionBlockLibrary.custom("minecraft:gold_block"),
                Command.executeEnd())),
        MCFunctionExecuteRun.setblockFull(
            MCFunctionPositionFields.relative(3, 0, 0),
            MCFunctionBlockLibrary.custom("minecraft:glass"),
            MCFunctionBlockStateFields.none()))
})

FunctionFile.define("e1checkfalse", function () {
    Command.execute(
        Command.executeIfBlock(Command.ExecutePolarity.If,
            MCFunctionPositionFields.absolute(8, -60, -76),
            MCFunctionBlockLibrary.custom("minecraft:stone"),
            Command.executeEnd()),
        MCFunctionExecuteRun.say("E1 FALSE PASS - stone unchanged at 8 -60 -76"))
})

// Original regression cases: B04 and B09 will no longer show UNSUPPORTED
// after E1, but RUN SAY alone does not prove position semantics.
FunctionFile.define("e1b04", function () {
    Command.execute(
        Command.executePositionContext(Command.ExecutePositionContextMode.Positioned,
            MCFunctionPositionFields.relative(0, 0, 0), Command.executeEnd()),
        MCFunctionExecuteRun.say("E1 B04 relative positioned RUN SAY"))
})
FunctionFile.define("e1b09", function () {
    Command.execute(Command.executeAlign("xyz", Command.executeEnd()),
        MCFunctionExecuteRun.say("E1 B09 align xyz RUN SAY"))
})

// Preview metadata only. Converter must skip it.
Preview.ready()
