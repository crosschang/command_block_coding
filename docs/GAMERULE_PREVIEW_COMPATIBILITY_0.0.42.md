# 0.0.42 Gamerule Preview Query/List/Enum compatibility patch

## Basis and evidence

- Based on user-uploaded `command_block_coding(9).zip` **plus** the previously delivered `PATCH_0.0.42_GAMERULE_GENERATOR_HOTFIX.zip`.
- User's Minecraft Education 26.32 observations:
  - `gamerule showcoordinates false/true`, `randomtickspeed 1` via MakeCode Preview: actual game setting updated, **PASS**.
  - Direct chat `/gamerule keepinventory` and `/gamerule`: output visible; MakeCode `player.execute()`-backed Query/List: output not visible.
  - Direct chat `/gamerule playerwaypoints everyone/off`: **PASS**; MakeCode native `player.execute("gamerule playerwaypoints off")`: **FAIL**, syntax rejection.
- Official MakeCode `player.execute(command: string): boolean` supplies only command success, **not** the textual gamerule value/list. https://minecraft.makecode.com/reference/player/execute
- `VERSIONED_NATIVE_ENUM` policy preserved. Bedrock/Education canonical command IDs and syntax are **not** changed.

## Actual code behavior

1. **Query**: the Preview shows the latest value *successfully set through the current extension Preview session* when one exists. This is `SESSION_KNOWN`, **not** a live read; changes made in direct game chat, command blocks, other players or behavior packs are not tracked. If no session value exists, it explicitly says live readback is unavailable. In either case the Preview shows the direct chat command `/gamerule <id>` for an exact world value.
2. **List**: lists known rule **names** from the 38-entry Bedrock registry by Boolean/Integer/Enum, plus any last values successfully set through the current Preview session. These names are registry metadata, **not** the current world's live values and not a guarantee every rule exists in this Education version. Direct `/gamerule` in game chat is the live alternative. The list is generated from the Registry source, not a hard-coded list in Preview.
3. **playerwaypoints enum**: observed `player.execute()` syntax failure on Education 26.32. The Preview does not send the known-failing command and instead displays the exact canonical command for manual direct game chat execution. It does **not** claim the rule was changed. Other enum IDs are not generalized from this one observation.
4. **Normal set paths**, existing TAG list adapter, AST, Compiler, Validation, and Registry policies remain unchanged.

## Modified files

- `src/preview/query_adapter.ts` — query/list output and targeted `playerwaypoints` Preview compatibility handling
- `src/preview/world_state.ts` — successful Preview-only Gamerule set snapshots, never world truth
- `tools/generate_registry.ps1` — generate `knownRuleIds()` from the native source JSON
- `src/registry/gamerule_registry.generated.ts` — matching newly generated lookup function
- `tests/GAMERULE_0.0.42_PREVIEW_QUERY_COMPAT_MAIN.ts` — **test-only** fixture, not in `pxt.json.files`

The ZIP also retains the prior generator hotfix (the corrected `gamerule_library.generated.ts` and the working generator), because it is based on the uploaded `(9).zip` before the hotfix. No `pxt.json`, `main.ts`, or `test.ts` is changed; the PXT version stays exactly as installed on your PC.

## MakeCode test sequence

Back up the existing project. Unzip the patch at the project root, preserving paths. On Windows run `tools\generate_registry.cmd -Check` and confirm `Generated Registry files are up to date.` **This Windows check has not been run in the assistant's Linux container.**

Back up `main.ts` and temporarily paste `tests/GAMERULE_0.0.42_PREVIEW_QUERY_COMPAT_MAIN.ts` into it. Verify conversion into MakeCode Blocks. Start the Preview.

1. `g42p_query_unknown` → no fabricated `keepinventory` value; displays `/gamerule keepinventory` as the live lookup.
2. `g42p_list` → displays 38 **registry IDs**, grouped by type; explicit `NOT current world values` message.
3. `g42p_set_off` → coordinate display actually disappears. (Affects the world.)
4. `g42p_query_known` → says `showcoordinates: last set by this Preview false`, marked `NOT live`.
5. `g42p_set_on` → coordinate display returns, then `g42p_query_known` shows last Preview set `true`.
6. `g42p_list` again → session-known `showcoordinates = true` in addition to Registry list.
7. `g42p_enum` → displays the direct-chat `/gamerule playerwaypoints off` instruction **without** attempting `player.execute` or modifying game state. Only run it directly in game chat if desired.
8. **Stale state test**: after running `g42p_set_on`, use direct chat `/gamerule showcoordinates false`; `g42p_query_known` should still label the last **session** value `true (NOT live)`, proving it is not pretending to read live game state. Restore manually afterward.

Ensure final gamerules (`showcoordinates`, etc.) are restored to your original settings. `g42p_query_unknown` and `g42p_list` do not mutate the world.

## Verification already performed

- Full-project general TS ES5 compile with MakeCode runtime declarations stubbed: PASS.
- Node VM smoke tests: no fake live read; 38 typed Registry IDs; successful-set tracking; failed set not tracked; enum interception; normal set route unchanged: PASS.
- FunctionFile public API integration tests, definition does not change gamerules, Preview execution paths: PASS.
- **Minecraft MakeCode editor compile, JS↔Blocks, Education 26.32 runtime with THIS patch: PENDING.**
- True live Gamerule Query/List readback **cannot be provided through the documented `player.execute(): boolean` interface**. Do not call these capabilities live query PASS.
