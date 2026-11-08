# 0.0.43 Enchant + 0.0.42 Gamerule paged Preview regression fix

## Root cause
0.0.43 patch replaced `tools/generate_registry.ps1` with an implementation of
`Generate-GameRuleLookup` that had dropped the previously introduced
`MCFunctionGameruleRegistry.knownRuleIds()` generator. Regenerating Registry
therefore removed this method from `src/registry/gamerule_registry.generated.ts`,
while `src/preview/query_adapter.ts` continued to call it.

## Contents
- `tools/generate_registry.ps1`: restore 0.0.42 knownRuleIds emission within
  the 0.0.43 generator, without removing the Enchantment generator.
- `src/registry/gamerule_registry.generated.ts`: restore generated list of
  38 rule names; generated output synchronized with current gamerules.json.

## Apply
1. Back up the current project.
2. Extract this ZIP into the project root, preserving relative paths.
3. Run `tools\generate_registry.cmd -Check` (should report up to date).
4. If needed, run `tools\generate_registry.cmd`, then re-run `-Check`.
5. Reload MakeCode and verify `knownRuleIds` error is gone.
6. Smoke-test `g42pg_list`, `cbi_rules 2`, `cbi_rules 7`, and Enchant test blocks.

No `pxt.json` is included or edited. Original PXT version remains unchanged.
This hotfix does NOT change the command AST/Compiler/Validator/Preview logic.
A successful Registry generator check does NOT by itself establish MakeCode or Minecraft Education runtime PASS.
