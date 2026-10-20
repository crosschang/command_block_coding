# Preview compatibility INFO / QueryConfidence — 2026-10-20

Scope: `command_block_coding` 0.0.72 (no version change). Source only;
actual runtime retest of **this change** remains pending.

## Reason and evidence

Minecraft Education 26.32 in-game A8 tests (2026-10-20):

- Direct chat `/spawnpoint @s 35 -60 -100` changed the personal respawn point,
  and a later death returned the player to those coordinates (**PASS**).
- MakeCode `player.execute("spawnpoint @a 35 -60 -100")` returned `true`,
  but respawn remained near world spawn (**effect FAIL**).
- MakeCode `mobs.execute(mobs.target(LOCAL_PLAYER), player.position(),
  "spawnpoint @s 35 -60 -100")` also returned `true`, but effect **FAIL**.
- FunctionFile `a8_sp_abs` was definition-validated **OK**, but the actual
  preview attempt did not change respawn. This does not prove that canonical
  `.mcfunction` files fail: no real Behavior Pack file was executed here.
- The earlier compatibility matrix that listed SPAWNPOINT absolute as Preview
  PASS is **superseded for these exact observed variants**, not erased.

## Two independent concepts

1. `MCFunctionValidator.ValidationLevel` (`Error`, `Warning`, `Info`) describes
   correctness or user-facing compatibility caveats. MakeCode bridge caveats
   are appended *only during FunctionFile Preview definition capture*, via
   `MCFunctionPreview.previewCompatibilityIssues(command)`. The canonical
   validator / AST / compiler output are unchanged.
2. `MCFunctionPreview.QueryConfidence` remains unchanged: `Exact`,
   `SessionKnown`, `Partial`, `Unavailable`. It describes the provenance and
   completeness of **query results**, not the validity of command syntax.

| Command / form | Definition diagnostic | Runtime/query notice | Confidence |
|---|---|---|---|
| SPAWNPOINT (any structured form) | INFO `SPAWNPOINT_PREVIEW_LIMITATION` | One WARNING per MakeCode run; `true` is not gameplay proof | Not a query |
| TAG LIST | INFO `TAG_LIST_SESSION_KNOWN` | Session-only known tag names; real Minecraft selector probes membership for those names | `SessionKnown` |
| GAMERULE QUERY | INFO `GAMERULE_QUERY_OUTPUT_HIDDEN` | Last set reported successful by Preview, explicitly not live; otherwise unavailable | `SessionKnown` / `Unavailable` |
| GAMERULE LIST | INFO `GAMERULE_LIST_REGISTRY_ONLY` | Registry names/types, not live world values | `Partial` |
| GAMERULE `playerwaypoints` SET | WARNING `GAMERULE_PLAYERWAYPOINTS_PREVIEW_UNSUPPORTED` | Prints manual direct-chat command; does not attempt known-failing Preview call | `Unavailable` in adapter |
| Other verified GAMERULE SET | No new issue | Original execution preserved | Not a query |
| TIME QUERY | No new issue | Existing live MakeCode API value | `Exact` |
| CLEARSPAWNPOINT / SETWORLDSPAWN | No new issue | No unproven generalization from SPAWNPOINT | Not a query |

The GAMERULE cache remains **session-only**. A successful `player.execute()`
boolean is not authoritative proof that the world changed: the stored snapshot
is an *API-reported success*, never a live world read. Direct chat, command
blocks, other packs, or players can change world settings independently.

TAG LIST differs: the vocabulary of tag **names** is session-limited, but
membership for known names is checked with real Minecraft selectors. Unknown
tag names may be omitted, not fabricated. The temporary `_cbi_` tags are
removed by existing cleanup and are not part of canonical output.

## Definition capture and runtime

`FunctionFile.capturePreviewAction` collects nonblocking Preview-only
diagnostics from the captured *structured command AST*, without inserting
them into the canonical validator. The existing `?`, paginated `?1..`, and
`functionName?` viewers work unchanged. Each issue is de-duplicated per
function, including when the same command kind occurs more than once.

Normal function execution remains quiet about stored definition diagnostics.
SPAWNPOINT is an exception: its execution prints one runtime WARNING during
the current MakeCode run, even when the bridge returned `true`; repeated
calls (including tick invocation) do not repeatedly emit the warning.

## Minecraft in-game test, after safely applying the patch

1. Work on a **copy** of the world and preserve the existing `main.ts`.
2. Temporarily paste `tests/PREVIEW_COMPAT_DIAGNOSTICS_0.0.72_MAIN.ts` into
   `main.ts`, test JS↔Blocks conversion, run Code Builder.
3. Definition summaries: expect `pc72_spawnpoint`, `pc72_tag_list`,
   `pc72_rule_query`, `pc72_rule_list` = 1 info each;
   `pc72_rule_enum` = 1 warning; `pc72_normal` = OK.
4. `?` and `pc72_spawnpoint?`/`pc72_tag_list?`/`pc72_rule_query?`/
   `pc72_rule_list?`/`pc72_rule_enum?` must show the expected codes without
   invoking world-changing commands.
5. `pc72_tag_list`: expect `INFO [SESSION_KNOWN]`, without fabricating tags.
   `pc72_rule_query`: expect `INFO [UNAVAILABLE]` if no stored session value.
   `pc72_rule_list`: expect `INFO [PARTIAL]` and a Registry reference.
   `pc72_rule_enum`: expect the direct-chat instruction, not an applied rule.
6. **Only on the disposable world**, run `pc72_spawnpoint` twice and confirm
   the runtime warning is shown once. Its boolean result must not be reported
   as a confirmed change to respawn. Do not infer real `.mcfunction` support.

This patch does not commit code, change the extension version, create real
`.mcfunction` files, or claim an in-game PASS for the newly written diagnostics.
