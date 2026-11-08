# Preview compatibility INFO / QueryConfidence — 2026-10-20

Scope: `command_block_coding` 0.0.72 (no version change).
Definition diagnostics, details/navigation, and the three read-only query
handlers below were retested in Minecraft Education 26.32 on 2026-10-20.
Other paths remain pending as distinguished in the evidence addendum.

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

This patch does not commit code, change the extension version, or create real
`.mcfunction` files. The in-game PASS scope for diagnostics is recorded below.

## In-game evidence addendum — 2026-10-20 (Education 26.32)

User-provided in-game chat screenshots confirm the following **new** tests
for the diagnostic compatibility patch. The broader execution limitations
described above still hold.

| Observed operation | In-game result | Verdict |
|---|---|---|
| FunctionFile registration with `PREVIEW_COMPAT_DIAGNOSTICS_0.0.72_MAIN.ts` | `pc72_spawnpoint`, `pc72_tag_list`, `pc72_rule_query`, `pc72_rule_list` each showed `1 info`; `pc72_rule_enum` showed `1 warning`; `pc72_normal` showed `OK`; aggregate `0 error(s), 1 warning(s), 4 info` | PASS: definition diagnostics |
| `pc72_spawnpoint?` | `E0 W0 I1`, `SPAWNPOINT_PREVIEW_LIMITATION`, `Diagnostic only; not executed` | PASS: detail and nonexecution |
| `pc72_tag_list?` | `E0 W0 I1`, `TAG_LIST_SESSION_KNOWN` | PASS: detail |
| `pc72_rule_query?` | `E0 W0 I1`, `GAMERULE_QUERY_OUTPUT_HIDDEN` | PASS: detail |
| `pc72_rule_list?` | `E0 W0 I1`, `GAMERULE_LIST_REGISTRY_ONLY` | PASS: detail |
| `pc72_rule_enum?` | `E0 W1 I0`, `GAMERULE_PLAYERWAYPOINTS_PREVIEW_UNSUPPORTED` | PASS: detail |
| `?`, `?1`, `?2` | `E0 W1 I4`, 14 total diagnostics, paginated 1/2 and 2/2 | PASS: diagnostics navigation |
| `pc72_rule_query` | `[UNAVAILABLE]` for live `keepinventory`, with direct-chat `/gamerule keepinventory` guidance | PASS: query result provenance |
| `pc72_rule_list` | `[PARTIAL]`, `GAMERULE Registry 1/7`, names/types explicitly not live world values | PASS: partial Registry guidance |
| `pc72_tag_list` | No session-tracked tag names; `[SESSION_KNOWN]` warning about possible omissions | PASS: empty-vocabulary result and notice |

**Not yet proven by these screenshots:** nonempty TAG vocabulary/membership
probing; GAMERULE Query `SESSION_KNOWN` after a reported-successful SET;
SPAWNPOINT one-time runtime warning; actual change of respawn by any Preview
bridge; and actual Bedrock Behavior Pack `.mcfunction` execution. Do not
promote any of those to PASS based on the diagnostics above.
