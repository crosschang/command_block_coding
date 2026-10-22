/**
 * command_block_coding 0.0.77 — RIDE ONLY test fixture.
 * Uses public MakeCode API; NO dialogue commands, NO direct player.execute.
 * Use only after local C1 candidate was integrated and PXT compiled.
 * In a disposable Education world, tag exactly one chicken as c1_mount
 * and one baby zombie as c1_rider using the separate chat setup steps.
 * Chat: c1ride01 to execute; c1ride01? to inspect definition validation.
 */
function c1RideTestRider(): MCFunctionFields.TargetValue {
    return MCFunctionFields.targetSelector(
        MCFunctionFields.allEntities(
            MCFunctionFields.addTagFilter("c1_rider", false,
                MCFunctionFields.noSelectorCondition())));
}
function c1RideTestMount(): MCFunctionFields.TargetValue {
    return MCFunctionFields.targetSelector(
        MCFunctionFields.allEntities(
            MCFunctionFields.addTagFilter("c1_mount", false,
                MCFunctionFields.noSelectorCondition())));
}

// No world changes happen during FunctionFile.define() registration.
FunctionFile.define("c1ride01", function () {
    Command.ride(c1RideTestMount(), Command.rideActionSummonRider(
        MCFunctionEntityLibrary.custom("minecraft:zombie"),
        Command.rideSummonRiderOptions("minecraft:as_baby_jockey")));
});
FunctionFile.define("c1ride02", function () {
    Command.ride(c1RideTestRider(), Command.rideActionStop());
});
FunctionFile.define("c1ride03", function () {
    Command.ride(c1RideTestRider(), Command.rideActionStart(c1RideTestMount()));
});
FunctionFile.define("c1ride04", function () {
    Command.ride(c1RideTestMount(), Command.rideActionEvict());
});
FunctionFile.define("c1ride05", function () {
    Command.ride(c1RideTestRider(), Command.rideActionStart(c1RideTestMount(),
        Command.rideStartOptions(Command.RideTeleportChoice.Rider,
            Command.RideFillChoice.UntilFull)));
});
FunctionFile.define("c1ride06", function () {
    Command.ride(c1RideTestRider(), Command.rideActionStart(c1RideTestMount(),
        Command.rideStartOptions(Command.RideTeleportChoice.Ride,
            Command.RideFillChoice.IfGroupFits)));
});
FunctionFile.define("c1ride07", function () {
    Command.ride(c1RideTestRider(), Command.rideActionSummonRide(
        MCFunctionEntityLibrary.custom("minecraft:chicken"),
        Command.rideSummonRideOptions(Command.RideSummonRuleChoice.NoRideChange)));
});
FunctionFile.define("c1ride08", function () {
    Command.ride(c1RideTestRider(), Command.rideActionSummonRide(
        MCFunctionEntityLibrary.custom("minecraft:chicken"),
        Command.rideSummonRideOptions(Command.RideSummonRuleChoice.SkipRiders)));
});
FunctionFile.define("c1ride09", function () {
    Command.ride(c1RideTestRider(), Command.rideActionSummonRide(
        MCFunctionEntityLibrary.custom("minecraft:chicken"),
        Command.rideSummonRideOptions(Command.RideSummonRuleChoice.ReassignRides)));
});
// Deliberately no DIALOGUE functions in this test main.
Preview.ready();
