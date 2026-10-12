# 0.0.42 Gamerule Registry Generator hotfix

Basis: user-provided `command_block_coding(9).zip`.

## Root cause

`src/libraries/gamerule_library.generated.ts` contains 38 `//%` block annotations and `export function` declarations flattened into a single line per entry. In TypeScript, the `//` annotation comments out the remainder of that line, so none of the 38 functions exists to the compiler. `generate_registry.cmd -Check` reported up-to-date because the generator reproduced the same malformed file. This is a generator formatting defect, not missing Registry data or `pxt.json.files` registration.

## Files changed

- `tools/generate_registry.ps1`: add each annotation/declaration line individually to the List rather than via a mixed PowerShell expression in an array literal.
- `src/libraries/gamerule_library.generated.ts`: regenerate all 38 Reporter functions, each on separate lines.

No other project file is replaced. `pxt.json` is not included, so the original PXT version (`0.0.40` in uploaded `(9).zip`) remains untouched. Previous source versions should not be automatically changed.

## Apply and verify on Windows

1. Back up the project.
2. Extract this patch at the project root, preserving paths; overwrite the two files only.
3. Run `tools\generate_registry.cmd -Check` and confirm `Generated Registry files are up to date.`
4. Reload the MakeCode extension and rerun the original `tests/GAMERULE_0.0.42_PUBLIC_API_MAIN.ts` fixture.
5. Verify `showcoordinates`, `randomtickspeed`, and `keepinventory` function reporters compile and convert to Blocks.
6. Test Definition Validation in Minecraft Education. Do not label in-game commands PASS until observed.

## Checks performed in this environment

- Confirmed 38 names/annotations, 0 actual declarations in the uploaded malformed file.
- Corrected file now has 38 separate TypeScript declarations.
- PXT file list includes both Gamerule files.
- Generator fixes source generation, not just generated output.
