/**
 * TEMPORARY main.ts — test B: LIST occurs inside a definition with ERROR.
 * Use alone, not together with the enabled test fixture.
 * Expected: gate_invalid_list NOT registered; cbi_diag shows type mismatch;
 *           cbi_rules does NOT register.
 */
FunctionFile.define("gate_invalid_list", function () {
    Command.gamerule(Command.gameruleListAction());
    // This is intentionally invalid: keepinventory is Boolean, not Integer.
    Command.gamerule(Command.gameruleIntegerAction(
        MCFunctionGameruleLibrary.keepinventory(), 9));
});
