/** Minecraft Education 26.32 TIME QUERY Preview smoke tests.
 * Temporary main.ts only. Never add this file to pxt.json or test.ts.
 * Requires combined CAMERA BASIC + TIME QUERY patch on 0.0.49.
 */
FunctionFile.define("tq49_daytime", function () {
    Command.timeQuery(Command.TimeQueryChoice.DayTime);
});
FunctionFile.define("tq49_gametime", function () {
    Command.timeQuery(Command.TimeQueryChoice.GameTime);
});
FunctionFile.define("tq49_day", function () {
    Command.timeQuery(Command.TimeQueryChoice.Day);
});
Preview.ready();
