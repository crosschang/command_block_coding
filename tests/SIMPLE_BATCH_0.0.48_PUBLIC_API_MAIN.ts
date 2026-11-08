/** MakeCode Preview test - replace temporary main.ts contents, do NOT edit test.ts. */
FunctionFile.define("sb48_tell", function () {
    Command.tell(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()), "Hello from simple batch!");
});
FunctionFile.define("sb48_day", function () {
    Command.timeSetPreset(Command.TimePresetChoice.Day);
});
FunctionFile.define("sb48_noon", function () {
    Command.timeSetPreset(Command.TimePresetChoice.Noon);
});
FunctionFile.define("sb48_set6000", function () {
    Command.timeSetTicks(6000);
});
FunctionFile.define("sb48_add1000", function () {
    Command.timeAddTicks(1000);
});
FunctionFile.define("sb48_rain", function () {
    Command.weatherSet(Command.WeatherChoice.Rain, Command.weatherDuration(300));
});
FunctionFile.define("sb48_clear", function () {
    Command.weatherSet(Command.WeatherChoice.Clear);
});
FunctionFile.define("sb48_normal", function () {
    Command.difficultySet(Command.DifficultyChoice.Normal);
});
FunctionFile.define("sb48_cs_pos", function () {
    Command.cameraShakeAdd(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraShakeIntensity(0.5), Command.cameraShakeSeconds(2),
        Command.cameraShakeType(Command.CameraShakeChoice.Positional));
});
FunctionFile.define("sb48_cs_rot", function () {
    Command.cameraShakeAdd(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraShakeIntensity(1), Command.cameraShakeSeconds(2),
        Command.cameraShakeType(Command.CameraShakeChoice.Rotational));
});
FunctionFile.define("sb48_cs_stop", function () {
    Command.cameraShakeStop(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()));
});
FunctionFile.define("sb48_hud_hide", function () {
    Command.hudSet(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.HudVisibilityChoice.Hide, Command.hudElement(Command.HudElementChoice.Hotbar));
});
FunctionFile.define("sb48_hud_reset", function () {
    Command.hudSet(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.HudVisibilityChoice.Reset, Command.hudElement(Command.HudElementChoice.Hotbar));
});
// Camera setting only: restore it immediately; avoid disabling movement in your test world.
FunctionFile.define("sb48_input_off", function () {
    Command.inputPermissionSet(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.InputPermissionChoice.Camera, Command.InputStateChoice.Disabled);
});
FunctionFile.define("sb48_input_on", function () {
    Command.inputPermissionSet(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.InputPermissionChoice.Camera, Command.InputStateChoice.Enabled);
});
// ERROR should prevent function chat registration.
FunctionFile.define("sb48_bad_shake", function () {
    Command.cameraShakeAdd(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.cameraShakeIntensity(5));
});
FunctionFile.define("sb48_bad_weather", function () {
    Command.weatherSet(Command.WeatherChoice.Clear, Command.weatherDuration(1.5));
});
Preview.ready();
