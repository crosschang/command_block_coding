/**
 * C2 compact SCOREBOARD / Minecraft Education JS -> Blocks test (manual execution).
 * Use ONLY on a disposable test world, in the order printed below.
 * Keep FunctionFile.define blocks top-level.
 */
FunctionFile.define("c2create", function () {
    Command.scoreboard(Command.scoreboardObjectiveManage(
        Command.ScoreboardObjectiveEditChoice.Add, "c2_demo", "C2 Demo"));
});
FunctionFile.define("c2setup", function () {
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("#alice"), "c2_demo", 10));
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("#bob"), "c2_demo", 3));
});
FunctionFile.define("c2plus", function () {
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#alice"), "c2_demo", 2));
});
FunctionFile.define("c2minus", function () {
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Remove,
        Command.scoreboardFakePlayer("#bob"), "c2_demo", 1));
});
FunctionFile.define("c2math", function () {
    Command.scoreboard(Command.scoreboardPlayersOperation(
        Command.scoreboardFakePlayer("#alice"), "c2_demo",
        Command.ScoreboardOperatorChoice.Add,
        Command.scoreboardFakePlayer("#bob"), "c2_demo"));
});
FunctionFile.define("c2sidebar", function () {
    Command.scoreboard(Command.scoreboardObjectiveDisplayCompact(
        Command.ScoreboardSlotChoice.Sidebar, "c2_demo",
        Command.ScoreboardDisplaySortMode.Descending));
});
FunctionFile.define("c2below", function () {
    Command.scoreboard(Command.scoreboardObjectiveDisplayCompact(
        Command.ScoreboardSlotChoice.BelowName, "c2_demo",
        Command.ScoreboardDisplaySortMode.None));
});
FunctionFile.define("c2query", function () {
    Command.scoreboard(Command.scoreboardObjectiveList());
    Command.scoreboard(Command.scoreboardPlayersList(Command.scoreboardFakePlayer("#alice")));
    Command.scoreboard(Command.scoreboardPlayersTest(
        Command.scoreboardFakePlayer("#alice"), "c2_demo", "14", "14"));
});
FunctionFile.define("c2random", function () {
    Command.scoreboard(Command.scoreboardPlayersRandom(
        Command.scoreboardFakePlayer("#bob"), "c2_demo", 1, 3));
});
FunctionFile.define("c2cleanup", function () {
    Command.scoreboard(Command.scoreboardObjectiveDisplayCompact(
        Command.ScoreboardSlotChoice.Sidebar, "", Command.ScoreboardDisplaySortMode.None));
    Command.scoreboard(Command.scoreboardPlayersReset(
        Command.scoreboardFakePlayer("#alice"), "c2_demo"));
    Command.scoreboard(Command.scoreboardObjectiveManage(
        Command.ScoreboardObjectiveEditChoice.Remove, "c2_demo"));
});
