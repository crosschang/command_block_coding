/** C2 scoreboard manual MakeCode JS -> Blocks representative tests.
 * Paste into MakeCode JavaScript workspace. Chat names are distinct.
 * Order: c2add, c2set, c2add10, c2math, c2side, c2test, c2list, c2reset, c2remove.
 * Objective c2_points is deliberately disposable. Do not run in a valuable world.
 */
FunctionFile.define("c2add", function () {
    Command.scoreboard(Command.scoreboardObjectiveAdd("c2_points", "C2 Test Points"));
});
FunctionFile.define("c2set", function () {
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("#c2a"), "c2_points", 10));
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("#c2b"), "c2_points", 3));
});
FunctionFile.define("c2add10", function () {
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#c2a"), "c2_points", 10));
});
FunctionFile.define("c2math", function () {
    Command.scoreboard(Command.scoreboardPlayersOperation(
        Command.scoreboardFakePlayer("#c2a"), "c2_points",
        Command.ScoreboardOperatorChoice.Add,
        Command.scoreboardFakePlayer("#c2b"), "c2_points"));
});
FunctionFile.define("c2side", function () {
    Command.scoreboard(Command.scoreboardObjectiveDisplay(
        Command.ScoreboardSlotChoice.Sidebar, "c2_points"));
});
FunctionFile.define("c2test", function () {
    Command.scoreboard(Command.scoreboardPlayersTest(
        Command.scoreboardFakePlayer("#c2a"), "c2_points", "23", "23"));
});
FunctionFile.define("c2list", function () {
    Command.scoreboard(Command.scoreboardPlayersList(Command.scoreboardFakePlayer("#c2a")));
});
FunctionFile.define("c2reset", function () {
    Command.scoreboard(Command.scoreboardPlayersReset(Command.scoreboardFakePlayer("#c2a"), "c2_points"));
});
FunctionFile.define("c2remove", function () {
    Command.scoreboard(Command.scoreboardObjectiveDisplay(Command.ScoreboardSlotChoice.Sidebar));
    Command.scoreboard(Command.scoreboardObjectiveRemove("c2_points"));
});
