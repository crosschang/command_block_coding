# 0.0.42 Gamerule Preview — paged Registry viewer (TAG-compatible)

## Evidence and semantic boundary

- Real Minecraft Education 26.32 game chat `/gamerule` prints **all current world values**; `/gamerule keepinventory` prints **one current world value**. Both were observed by the user.
- MakeCode `player.execute()` returns success as a boolean but does **not expose the textual command output**. Gamerule LIST / QUERY output is therefore classified `OUTPUT_HIDDEN`, **not an invented command failure**.
- Direct chat `/gamerule playerwaypoints off` worked while MakeCode `player.execute("gamerule playerwaypoints off")` failed. This is a separate `DIRECT FAIL` for that specific Preview path, not a missing Education gamerule.
- Existing TAG LIST uses the **originally selected entities + real selectors + session-known tag vocabulary** and retains `SESSION_KNOWN`. Gamerule values cannot be reconstructed using TAG selectors. Preserve the TAG query code untouched.

## Behavior

| Input | Preview behavior | Canonical Minecraft meaning |
|---|---|---|
| `g42pg_list` (GAMERULE LIST reporter) | Says live output is hidden; recommends direct `/gamerule`; shows Registry **page 1/7** (names and value kinds only) | `gamerule` — prints live world values in game chat |
| `cbi_rules 1` ... `cbi_rules 7` | One `tellraw` message containing **six** Registry IDs per page (last page has two), with Boolean/Integer/Enum kinds and next-page hint | Preview-only helper. Never exported |
| `cbi_rules` | Defaults to first page when MakeCode supplies zero for omitted numeric argument | Preview-only helper |
| `cbi_rules 8` | Invalid-page guide, no Registry values or game-state changes | Preview-only helper |
| `GAMERULE QUERY` | Last value **successfully set in current Preview session** labelled `SESSION_KNOWN, NOT live`, or explicit unavailable instruction | `gamerule <rule>` — prints live rule value in game chat |
| `GAMERULE SET` | Existing supported normal `player.execute` route; `playerwaypoints` still offers direct-chat fallback | `gamerule <rule> <value>` — changes world rule |

The 38-rule catalog is generated from `MCFunctionGameruleRegistry.knownRuleIds()` and `valueKindOf()`. Its items are **names / expected value types only**. Do not claim Education 26.32 supports every registry entry. `cbi_rules` neither fetches current Gamerule values nor changes the world. Do not confuse the help viewer with `/help` or the real `/gamerule` output.

The viewer is a singleton registered when the extension's `FunctionFile.define()` initializes. `cbi_rules` is reserved as an internal **Preview chat command**, like `cbi_diag`; defining a file with that name is rejected with a clear diagnostic. This protection affects only the Preview function registration workflow; canonical AST/Compiler is unchanged.

## Applying the patch

Base: user `command_block_coding(9).zip` with the previously delivered `PATCH_0.0.42_GAMERULE_PREVIEW_QUERY_LIST_COMPAT.zip` applied. This ZIP includes only subsequent changed/added files. It does not overwrite or rerun the Registry generator, alter `pxt.json`, `main.ts`, or `test.ts`, or update its version (user source recorded `0.0.40`).

Changed code:
- `src/preview/query_adapter.ts` — one-page-per-request catalog, `cbi_rules` handler, output clarity
- `function_file.ts` — register `cbi_rules` handler only once; reserve the chat name

New non-PXT test/document files:
- `tests/GAMERULE_0.0.42_PAGED_REGISTRY_MAIN.ts`
- `docs/GAMERULE_PREVIEW_PAGED_REGISTRY_0.0.42.md`

Apply patch to project root (where `pxt.json` lives). For an editor test only, **back up** `main.ts`, temporarily paste the test fixture, and open MakeCode Blocks. In Minecraft Education, enter `g42pg_list`, `cbi_rules 2`, `cbi_rules 7`, and the rest of the fixture's checks. Finally restore the existing `main.ts`. No `generate_registry` run is necessary: no Registry source or generated files changed.

## Validation and known limitations

- Pure TypeScript static test with MakeCode API stubs and local Node VM tests are meaningful developer checks, **not** Minecraft Education runtime PASS for the new viewer.
- The real `gamerule` output is only obtained by a **direct in-game chat** command. The Preview viewer cannot capture values through the documented `player.execute(): boolean` interface.
- The page helper uses numeric `player.onChat` arguments as supported by official Minecraft MakeCode. Actual Minecraft Education 26.32 chat registration and line rendering still require user runtime verification.
