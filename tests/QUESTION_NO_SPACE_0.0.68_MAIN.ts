/**
 * 0.0.68 ?N no-space diagnostic page smoke test (temporary root main.ts).
 * Replace root main.ts for the test, then restore the original.
 * Uses synthetic Preview-only records; no actual mcfunction is generated.
 */
FunctionFile.define("question_smoke", function () {
    Command.say("QUESTION_SMOKE_EXECUTED");
});

// 31 affected names = 11 pages at 3 per page; exercises ?10 and ?11.
for (let i = 1; i <= 31; i++) {
    MCFunctionDiagnostics.add(
        "diag_page_" + i,
        MCFunctionValidator.ValidationLevel.Warning,
        "QUESTION_PAGE_SMOKE",
        "Synthetic page " + i,
        MCFunctionDiagnostics.DiagnosticSource.Preview
    );
}

// The old built-in command remains available as an ordinary function name.
FunctionFile.define("cbi_page", function () {
    Command.say("USER_CBI_PAGE_OK");
});
Preview.ready();
