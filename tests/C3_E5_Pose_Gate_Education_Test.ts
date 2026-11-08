/**
 * C3 E5 Native selector gate: pose calibration only.
 * Applies to a copy of command_block_coding 0.0.86 Extension.
 * No Behavior Pack, no Function Bridge and no real SETBLOCK by g5pose.
 * Enter g5pose while standing, forced sneaking and forced low pose.
 * Keep your native POSE_STANDING/SNEAK/LOW repeat command blocks as oracle.
 */
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


Preview.ready();
