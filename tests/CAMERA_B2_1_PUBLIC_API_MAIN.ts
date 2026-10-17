// B2-1 manual Education Preview smoke test (temporarily paste into root main.ts).
// Run individual cases and verify printed commands BEFORE testing camera movement.
// CAUTION: camera orientation may disorient players; end with CAMERA clear.
Command.cameraSetAdvanced(
    MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
    Command.cameraPresetBuiltin(Command.CameraPresetChoice.Free),
    MCFunctionPositionFields.absolute(10, 70, 10),
    MCFunctionRotationFields.absolute(180, 0));

Command.cameraSetAdvanced(
    MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
    Command.cameraPresetBuiltin(Command.CameraPresetChoice.Free),
    MCFunctionPositionFields.relative(0, 2, 0));

Command.cameraSetAdvanced(
    MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
    Command.cameraPresetBuiltin(Command.CameraPresetChoice.Free),
    undefined,
    MCFunctionRotationFields.relative(90, 0));

Command.cameraClear(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()));
