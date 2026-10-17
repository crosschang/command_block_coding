// B2 CAMERA core smoke-test: temporarily replace root main.ts with these calls.
// Verify PREVIEW output first; Minecraft Education gameplay still needs manual validation.
// Clear camera afterwards if the camera view becomes disorienting.
Command.cameraSetFacing(
    MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
    Command.cameraPresetBuiltin(Command.CameraPresetChoice.Free),
    MCFunctionPositionFields.absolute(50, 100, 50),
    Command.cameraFacingPosition(MCFunctionPositionFields.absolute(0, 64, 0)));

Command.cameraSetEaseRotation(
    MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
    Command.cameraPresetBuiltin(Command.CameraPresetChoice.Free),
    Command.cameraEase(2, MCFunctionAST.CameraEaseType.Linear),
    MCFunctionPositionFields.absolute(100, 80, 100),
    MCFunctionRotationFields.absolute(180, 0));

Command.cameraSetEaseFacing(
    MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
    Command.cameraPresetBuiltin(Command.CameraPresetChoice.Free),
    Command.cameraEase(1.5, MCFunctionAST.CameraEaseType.InOutCubic),
    MCFunctionPositionFields.absolute(10, 70, 10),
    Command.cameraFacingEntity(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())));

Command.cameraSetDefault(
    MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
    Command.cameraPresetBuiltin(Command.CameraPresetChoice.Free));

Command.cameraSetEaseDefault(
    MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
    Command.cameraPresetBuiltin(Command.CameraPresetChoice.Free),
    Command.cameraEase(1, MCFunctionAST.CameraEaseType.Linear));

Command.cameraFade(
    MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
    Command.cameraFadeTime(0.5, 1, 0.5),
    Command.cameraFadeColor(0, 0, 0));
Command.cameraFade(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()));
Command.cameraClear(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()));
