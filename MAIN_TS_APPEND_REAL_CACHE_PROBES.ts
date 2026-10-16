// 0.0.62 REAL DIAGNOSTIC CACHE PROBE: paste at the END of the active
// MakeCode main.ts, AFTER all FunctionFile.define(...) calls.
// Test-only code. No extension release is needed for subsequent main.ts edits.

let cbiProbeIndex62 = -1;

player.onChat("cacheinit", function () {
    cbiProbeIndex62 = MCFunctionDiagnostics.probeFindDetailIndex("diag52_warn");
    player.say("CACHE INDEX " + cbiProbeIndex62);
});

// A: search the REAL module-level cachedDetailNames array, no detail output.
player.onChat("cachefind", function () {
    let index = MCFunctionDiagnostics.probeFindDetailIndex("diag52_warn");
    player.say("FIND " + index);
});

// B: read/traverse the REAL cachedDetailLines[index], with NO detail output.
player.onChat("cachewalk", function () {
    let chars = MCFunctionDiagnostics.probeWalkDetailCharsAt(cbiProbeIndex62);
    player.say("WALK CHARS " + chars);
});

// C: output REAL cached lines with SAME emitCompactLine adapter, NO search.
player.onChat("cacheemit", function () {
    MCFunctionDiagnostics.probeEmitDetailAt(cbiProbeIndex62);
});

// D: baseline: real name search + cached output, registered in main.ts.
player.onChat("cachefull", function () {
    MCFunctionDiagnostics.showFunctionDetailsOnly("diag52_warn");
});
