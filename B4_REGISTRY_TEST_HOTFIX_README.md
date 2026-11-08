# B4 Registry test-only hotfix — 0.0.75

## Cause
The official animation-registry delta shipped a test fixture that assumed `fogs.json` always contained only 3 IDs. The user's previous update already expanded it to 80. Test 2 used `items.at(-1)` to assert the newly discovered `minecraft:fog_forest` was last even if already present; test 9 assumed the result count was always 81.

## Changed file
- `tests/B4_REGISTRY_SAFE_UPDATE_TEST.cjs` ONLY.
- Preserves existing registry update and generator scripts, B4 Registry snapshots, generated reporters, `pxt.json`, and all existing public block IDs.

## Installation
Extract this ZIP to your repository root, preserving paths, and allow replacement of `tests/B4_REGISTRY_SAFE_UPDATE_TEST.cjs`. Do NOT overwrite other files.

## Run in PowerShell
```powershell
node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs
node tools\generate_b4_registry.cjs --check
git diff -- tests/B4_REGISTRY_SAFE_UPDATE_TEST.cjs
```
After 9/9 PASS, proceed with the official animation source download if desired:
```powershell
node tools\update_b4_registry.cjs --apply
node tools\generate_b4_registry.cjs --check
```

## Local regression evidence
- 3-ID starting Fog catalog: 9/9 pass
- Simulated 80-ID starting Fog catalog (including existing `minecraft:fog_forest` with `minecraft:fog_warped_forest` last): 9/9 pass
- This does not establish Microsoft MakeCode or Minecraft Education runtime compatibility.
