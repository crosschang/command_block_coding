/**
 * 0.0.40 manual MakeCode test fixture.
 * Paste this file's contents into main.ts of a temporary MakeCode test project.
 * Do not merge it into the canonical main.ts or pxt.json.files.
 * After loading, type each function name in Minecraft Education chat.
 */

// Default position (executor): no optional Position reporter.
FunctionFile.define("p40_default", function () {
    Command.particle(MCFunctionParticleLibrary.basicFlameParticle());
});

// Shared Position reporters: relative, absolute and local.
FunctionFile.define("p40_relative", function () {
    Command.particle(
        MCFunctionParticleLibrary.basicSmokeParticle(),
        MCFunctionPositionFields.relative(0, 1, 0)
    );
});
FunctionFile.define("p40_absolute", function () {
    Command.particle(
        MCFunctionParticleLibrary.basicFlameParticle(),
        MCFunctionPositionFields.absolute(0, 64, 0)
    );
});
FunctionFile.define("p40_local", function () {
    Command.particle(
        MCFunctionParticleLibrary.basicFlameParticle(),
        MCFunctionPositionFields.local(0, 0, 2)
    );
});

// Custom resource-pack ID: INFO; execution requires matching resource pack.
FunctionFile.define("p40_custom", function () {
    Command.particle(
        MCFunctionParticleLibrary.custom("sample:colored_smoke"),
        MCFunctionPositionFields.relative(0, 1, 0)
    );
});

// Future vanilla ID: WARNING, should still register for forward compatibility.
FunctionFile.define("p40_unknown", function () {
    Command.particle(MCFunctionParticleLibrary.custom("minecraft:future_particle_999"));
});

// Invalid syntax: ERROR and chat handler MUST NOT register.
FunctionFile.define("p40_bad", function () {
    Command.particle(MCFunctionParticleLibrary.custom("invalid particle id"));
});

// Run the existing cbi_diag chat command to inspect WARNING/INFO/ERROR.
