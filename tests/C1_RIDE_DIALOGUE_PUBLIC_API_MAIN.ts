/** C1 public MakeCode API fixture (Education runtime remains separate verification). */
function c1Rider(): MCFunctionFields.TargetValue {
    return MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
        MCFunctionFields.addTagFilter("c1_rider", false,
            MCFunctionFields.noSelectorCondition())));
}
function c1Mount(): MCFunctionFields.TargetValue {
    return MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
        MCFunctionFields.addTagFilter("c1_mount", false,
            MCFunctionFields.noSelectorCondition())));
}
function c1Npc(): MCFunctionFields.TargetValue {
    return MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
        MCFunctionFields.addTagFilter("c1_npc", false,
            MCFunctionFields.noSelectorCondition())));
}
function c1Player(): MCFunctionFields.TargetValue {
    return MCFunctionFields.targetSelector(MCFunctionFields.self(
        MCFunctionFields.noSelectorCondition()));
}
FunctionFile.define("c1_ride_start", function () {
    Command.ride(c1Rider(), Command.rideActionStart(c1Mount(),
        Command.rideStartOptions(Command.RideTeleportChoice.Rider,
            Command.RideFillChoice.UntilFull)));
});
FunctionFile.define("c1_ride_stop", function () {
    Command.ride(c1Rider(), Command.rideActionStop());
});
FunctionFile.define("c1_ride_evict", function () {
    Command.ride(c1Mount(), Command.rideActionEvict());
});
FunctionFile.define("c1_summon_rider", function () {
    Command.ride(c1Mount(), Command.rideActionSummonRider(MCFunctionEntityLibrary.custom("minecraft:zombie")));
});
FunctionFile.define("c1_summon_ride", function () {
    Command.ride(c1Rider(), Command.rideActionSummonRide(MCFunctionEntityLibrary.custom("minecraft:chicken")));
});
FunctionFile.define("c1_dialogue_open", function () {
    Command.dialogue(c1Npc(), Command.dialogueActionOpen(c1Player()));
});
FunctionFile.define("c1_dialogue_change", function () {
    Command.dialogue(c1Npc(), Command.dialogueActionChange("example_scene"));
});
Preview.ready();
