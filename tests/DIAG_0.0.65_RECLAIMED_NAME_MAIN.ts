/**
 * 0.0.65 chat-alias retirement smoke test, for temporary main.ts only.
 * The former internal diagnostic alias is now an ordinary user function name.
 * Do NOT combine with the regular stability fixture in the same main.ts.
 *
 * Expected Education chat behavior:
 *   ?          -> project diagnostic summary
 *   cbi_diag   -> USER_DEFINED_FUNCTION_OK
 *   cbi_diag?  -> no-problem detail only (never executes the function)
 *   cbi_page 1 -> diagnostic summary page 1
 */
FunctionFile.define("cbi_diag", function () {
    Command.say("USER_DEFINED_FUNCTION_OK");
});
Preview.ready();
