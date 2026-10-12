/**
 * Gamerule Preview paged Registry test fixture (TEMPORARY main.ts only).
 * Does not modify the canonical .mcfunction Grammar or registry generator.
 * Type chat commands below after the MakeCode program has started.
 */
FunctionFile.define("g42pg_list", function () {
    Command.gamerule(Command.gameruleListAction());
});

FunctionFile.define("g42pg_query_unknown", function () {
    Command.gamerule(Command.gameruleQueryAction(
        MCFunctionGameruleLibrary.keepinventory()));
});

FunctionFile.define("g42pg_set_off", function () {
    Command.gamerule(Command.gameruleBooleanAction(
        MCFunctionGameruleLibrary.showcoordinates(),
        MCFunctionFields.BooleanLiteral.False));
});

FunctionFile.define("g42pg_query_known", function () {
    Command.gamerule(Command.gameruleQueryAction(
        MCFunctionGameruleLibrary.showcoordinates()));
});

FunctionFile.define("g42pg_set_on", function () {
    Command.gamerule(Command.gameruleBooleanAction(
        MCFunctionGameruleLibrary.showcoordinates(),
        MCFunctionFields.BooleanLiteral.True));
});

/*
 * Test input sequence:
 * 1. g42pg_list               -> live values not available in Preview, page 1/7 shown
 * 2. cbi_rules 2             -> page 2/7 only, no world modification
 * 3. cbi_rules 7             -> page 7/7 (last 2 rules)
 * 4. cbi_rules 8             -> page bounds diagnostic
 * 5. cbi_rules               -> page 1 default (if MakeCode permits omitted arg)
 * 6. g42pg_query_unknown     -> /gamerule keepinventory direct chat instruction
 * 7. g42pg_set_off           -> showCoordinates false in the world
 * 8. g42pg_query_known       -> SESSION_KNOWN false (NOT live)
 * 9. g42pg_set_on            -> restore showCoordinates true
 * 10. g42pg_query_known      -> SESSION_KNOWN true (NOT live)
 * 11. /gamerule              -> real current world values from game chat
 * 12. /gamerule keepinventory -> real current rule value from game chat
 * TAG LIST existing functionality must remain unchanged.
 */
