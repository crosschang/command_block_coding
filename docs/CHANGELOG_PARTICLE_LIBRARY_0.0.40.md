# 0.0.40 — Particle Command / Library Integration

**Authoritative source baseline:** user-confirmed full project `command_block_coding(8).zip`, `pxt.json` version `0.0.37`.
**Comparison:** the separate reconstructed `command_block_coding_0.0.39_V2_GPT_DOCSYNC_SOURCE.zip` has byte-identical implementation files for all 127 common non-Git paths except `pxt.json` (which only differs in version metadata, `0.0.37` versus `0.0.39`). This 0.0.40 patch is derived from the **user's original** and preserves its full implementation. Earlier 0.0.39 V2 runtime evidence remains distinct from the original manifest version; it is not proof that this new patch was tested in-game.

## Implementation

- Retains all 192 existing Mojang Bedrock particle registry entries and generated reporter blocks, the existing `MCFunctionFields.ParticleValue`, and `MCFunctionPositionFields.PositionValue`.
- Introduces `MCFunctionAST.CommandKind.Particle = 14` (**appended**; preserves previous enum numeric values), `ParticleCommand { particleId, position? }` and `MCFunctionAST.createParticleCommand`.
- Adds `MCFunctionBlocks.createParticleCommand` (adapter), `Command.particle` (public MakeCode block, required ParticleValue with optional PositionValue), `MCFunctionCompiler.compileParticle`, and `MCFunctionValidator.validateParticleCommand`.
- Adds particle lookup to the **source generator** `tools/generate_registry.ps1`, then includes the corresponding regenerated `src/registry/registry_lookup.generated.ts`. Subsequent generator runs should retain the lookup; do not hand-edit generated code.
- Updates `pxt.json.files` for `commands/particle.ts` and this changelog; updates package version to `0.0.40`.
- Leaves `main.ts`, `test.ts` (empty), original Particle reporter generator outputs, command paths for other commands, and the 0.0.39 SUMMON Preview V2 unchanged.

## Canonical command syntax

Microsoft's official Bedrock documentation describes:

```
particle <effect: id> [position: x y z]
```

The canonical compiler emits **no leading slash** for `.mcfunction`:

```mcfunction
particle minecraft:basic_flame_particle
particle minecraft:basic_flame_particle ~ ~1 ~
particle minecraft:basic_flame_particle 0 64 0
particle minecraft:basic_flame_particle ^ ^ ^2
particle sample:colored_smoke ~ ~1 ~
```

The optional position is genuinely omitted if no PositionValue was connected. Position is compiled using the existing shared `compilePosition()` implementation, including `~`, `^`, negative/fractional coordinates and their existing validation.

Official sources:

- https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/particle?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/documents/particleeffects?view=minecraft-bedrock-stable

## Registry policy and diagnostics

`particles.customPolicy=EXTENSIBLE_NAMESPACED_ID` and `runtimeValidationReliability=LOW` are **unchanged**.

| Condition | Diagnostic | Level | Definition registration |
|---|---|---|---|
| ID empty, whitespace, illegal characters, malformed colon | `PARTICLE_ID_INVALID` | ERROR | blocked |
| Known vanilla particle ID (with or without `minecraft:` prefix) | none | — | allowed |
| Unknown `minecraft:` ID | `PARTICLE_ID_UNKNOWN` | WARNING | allowed |
| Valid non-`minecraft:` namespace ID | `PARTICLE_ID_CUSTOM_NAMESPACE` | INFO | allowed |
| Invalid/mixed local Position | existing Position Validator | ERROR | blocked |

Registry presence is not a guarantee that a particle is independently visible with `/particle`; some particle definitions require entity/Molang context. Particle effects are client-side, and **nonexistent particles may produce no server error**, so a missing visual effect or `player.execute()` feedback is not proof of failure. For custom particles, the relevant resource pack must be installed and active. Registry is not a whitelist.

`VERSIONED_NATIVE_ENUM` remains the separate, already-established policy for Effect, Gamerule and Enchantment. This particle patch does not rename or alter that policy.

## Runtime Preview

The existing `Command.executeCommand()` Definition Gate captures and validates the `ParticleCommand`. Upon actual invocation, the existing Preview path sends the canonical `particle ...` command to `player.execute()` (DIRECT); no new behavior is added to command text and no Preview-only alteration is made. A historical direct-execute result is not evidence that this **new public block** has been tested in Minecraft.

## Test instructions

1. Open MakeCode project with this patch and switch **JavaScript → Blocks → JavaScript**. Confirm `Command.particle` and the Particle Registry reporter are real colored Blocks rather than gray JavaScript blocks.
2. Copy `tests/PARTICLE_0.0.40_PUBLIC_API_MAIN.ts` into temporary `main.ts` (NOT into the shipped source), run Minecraft Education 26.32 with cheats enabled; trigger each `p40_*` chat command and inspect `cbi_diag`.
3. Confirm `p40_bad` does not register; `p40_unknown` and `p40_custom` do register, with WARNING/INFO respectively.
4. Separately run direct Minecraft chat `/particle ...` and a behavior pack `functions/*.mcfunction` with the same canonical commands. Record actual visual results and loaded resource-pack context.
5. Bedrock results and Education results must be recorded separately. Record `code/typecheck`, `Blocks conversion`, `Preview`, `direct chat`, and `actual .mcfunction` independently.

**Test status at patch creation:** standard TypeScript typecheck against temporary PXT API declarations and Node-based compiler/validator tests are performed separately; **MakeCode PXT editor compilation, JavaScript↔Blocks conversion, Education/Bedrock real runtime and installed Behavior Pack `.mcfunction` are PENDING**. Bidirectional Parser/Import remains a larger planned component, not implemented by this patch.
