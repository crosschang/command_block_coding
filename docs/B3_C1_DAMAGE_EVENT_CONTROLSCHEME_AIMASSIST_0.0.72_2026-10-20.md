# B3 / C1 Structured Commands — `0.0.72` working patch (2026-10-20)

Repository: `crosschang/command_block_coding`, branch `master`.
**Do not change the version until the user explicitly makes a release. Do not
commit or push on the user's behalf.** These source changes are uncommitted.

## Included command families

| Family | Canonical command forms | MakeCode group | AST kind |
|---|---|---|---|
| B3 `damage` | `damage <target> <integer>`; `damage <target> <integer> <cause>`; advanced `damage <target> <integer> <cause> entity <damager>` | DAMAGE | Damage |
| B3 `event` | `event entity <target> <eventId>` | EVENT | Event |
| C1 `controlscheme` | `controlscheme <players> set <scheme>`; `controlscheme <players> clear` | CONTROLSCHEME | ControlScheme |
| C1 `aimassist` | `aimassist <players> set` with full optional angle/distance/mode/preset configuration, preset-only form, or `clear` | AIMASSIST | AimAssist |

Core path: public MakeCode block → `MCFunctionBlocks` adapter → `MCFunctionAST`
→ `MCFunctionValidator` → `MCFunctionCompiler` → existing `Command.executeAudioCommand`
→ FunctionFile capture or shared Preview execution. No command string is
constructed inside the public blocks. Canonical output omits a leading slash.

Existing common `MCFunctionFields.TargetValue` allows Selector ASTs and named
player references. `damage` and `event` also allow entity selectors. The
shared named-target reporter is still labeled `named player`; use entity
selectors for mobs when possible. The existing owner-scoped Entity Event
Registry is referenced for validation, **not** regenerated or modified.

## Validation behavior

- DAMAGE: integer amount >=0; 36 documented cause identifiers; a source
  attribution requires both cause and damager. The advanced form emits a
  nonblocking `DAMAGE_SOURCE_EDUCATION_SYNTAX_UNVERIFIED` INFO. Microsoft
  documentation disagrees on whether the origin slot is literally `entity`
  or a `damageoriginactor` parameter. This code uses the earlier documented
  `entity` token provisionally; confirm the Education 26.32 autocomplete before
  marking it in-game PASS. The canonical command is **not proven** for this
  advanced variant.
- EVENT: event ID must be a safe command token. Owner hint is optional and
  affects only authoring diagnostics, never compiled command arguments.
  Known vanilla owner + unlisted event yields a WARNING, not an ERROR, so
  add-on/version-specific IDs remain possible. Unknown owner gives INFO.
  The generated EVENT library's existing event ID blocks remain available.
- CONTROLSCHEME: supports all five documented scheme types. SET gives INFO
  because not every scheme is allowed in every camera preset; CLEAR resets.
  `camera_relative_strafe` may require an experimental camera setting.
  Built-in `minecraft:first_person`, `minecraft:third_person`, and
  `minecraft:third_person_front` only allow `locked_player_relative_strafe`.
  Built-in `minecraft:free` permits both `player_relative` and
  `camera_relative`; the C1 test fixture combines a compatible CAMERA SET
  followed by CONTROLSCHEME SET. Preview has no reliable way to prove the
  currently active camera or the resulting actual player input behavior.
- AIMASSIST: X/Y angles 10–90°, max distance 1–16 blocks, mode `distance` or
  `angle`, optional user-supplied preset ID. The normal SET block accepts an
  optional full options reporter so intermediate numeric parameters are not
  silently invented. The separate preset-only SET is provisionally based on
  optional positional syntax; actual Education parsing is not yet verified.
  SET gives context INFO because the assist uses player facing and is designed
  for third-person camera usage.

## Authoritative references reviewed

- Microsoft Learn `/damage`: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/damage?view=minecraft-bedrock-stable
- Older `/damage` form: https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/damage?view=minecraft-bedrock-stable
- `/event`: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/event?view=minecraft-bedrock-stable
- `/controlscheme`: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/controlscheme?view=minecraft-bedrock-stable
- Allowed control schemes by camera preset: https://learn.microsoft.com/en-us/minecraft/creator/documents/controlschemes?view=minecraft-bedrock-stable
- `/aimassist`: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/aimassist?view=minecraft-bedrock-stable
- Aim assist ranges: https://learn.microsoft.com/en-us/minecraft/creator/documents/camerasystem/introtoaimassist?view=minecraft-bedrock-stable

## Static verification (not in-game proof)

- TypeScript `tsc --project tsconfig.a8check.json` — PASS.
- `tests/B3_C1_STRUCTURED_COMMANDS_REGRESSION.cjs` — PASS:
  11 canonical command variants, 17 validator invalid cases, 11 public block
  wrappers, Event Registry hints, three ordered CAMERA/CONTROLSCHEME test
  definitions, PXT file registration and version guard.
- Existing A8, named-target, Preview INFO, and four CAMERA regression scripts
  — 7/7 PASS.
- `git diff --check` — PASS.
- Actual PXT build, JS↔Blocks conversion, Minecraft Education Preview, direct
  command chat, and real Behavior Pack `.mcfunction` — **NOT YET TESTED** for
  these newly added commands. A TypeScript PASS is not a Minecraft PASS.

## Minecraft Education 26.32 test procedure

1. Back up the user's project and `main.ts`. Work on a **disposable copy of
   the Minecraft world**. Do not paste the fixture into `test.ts`, and do not
   register the fixture itself in `pxt.json`.
2. Apply changed files to matching relative paths. Paste
   `tests/B3_C1_0.0.72_PUBLIC_API_MAIN.ts` into a temporary `main.ts` and test
   JS → Blocks translation. Refresh/release the GitHub Extension only when the
   **user** decides to issue a release and choose the next version.
3. Run MakeCode Code Builder. FunctionFile registration must **only capture**
   all nine function definitions, not apply damage/event/control changes.
   Expected definition: `b3_damage_zero` and `b3_damage_cause` OK;
   `b3_damage_source` one INFO; `b3_event_named` OK;
   `c1_controls_set` and `c1_controls_camera_relative` one INFO each;
   `c1_controls_clear` OK;
   `c1_aimassist_set` one INFO; `c1_aimassist_clear` OK.
   Expected aggregate: **0 ERROR, 0 WARNING, 4 INFO**, subject to actual
   MakeCode/PXT confirmation.
4. Inspect diagnostics with `?`, `b3_damage_source?`,
   `c1_controls_set?`, `c1_aimassist_set?` (**no world effects**).
5. Check direct game chat/autocomplete **without executing the incomplete
   command**: `/damage @s 0 entity_attack`. Confirm the next argument for
   the attributed-source branch. Do not claim the provisional syntax PASS
   until verified in Education 26.32.
6. DAMAGE gameplay: use a safe expendable mob and direct chat as baseline;
   then separately invoke FunctionFile with the corresponding selector. The
   fixture currently targets `@s` and contains two damaging variants: do
   **not** invoke `b3_damage_cause` or `b3_damage_source` blindly.
7. EVENT gameplay: `b3_event_named` targets a deliberately absent name
   `PreviewTestCow`. To verify actual event effect, customize a new disposable
   test entity target and choose an event documented for that owner. Event
   effects may occur on a following server tick and depend on entity state.
8. CONTROLSCHEME: the fixture now pairs CAMERA and CONTROLSCHEME in ordered
   FunctionFile definitions, so **do not set an incompatible camera mode**.
   Start in a copied world, then execute the three functions separately:
   - `c1_controls_set`: `camera @s set minecraft:free` followed by
     `controlscheme @s set player_relative`.
   - `c1_controls_camera_relative`: `camera @s set minecraft:free` followed by
     `controlscheme @s set camera_relative`.
   - `c1_controls_clear`: `controlscheme @s clear` followed by `camera @s clear`.
   Compare W/A/S/D controls and the player's facing direction, keeping the
   same free camera. Test with no nearby hazards. A successful Preview call
   or compiled command alone is not proof of actual control changes. Use
   `c1_controls_clear` after either comparison, including on error.
9. AIMASSIST: verify with a compatible third-person camera, visible target
   and reticle, first SET then `c1_aimassist_clear`. Compare actual aiming
   effect; test custom preset IDs only when the required BP exists.
10. Record each route as chat baseline / MakeCode Preview / actual BP
    `.mcfunction` separately. A Preview true result alone is not gameplay PASS.

## Open/remaining

1. Education 26.32 `damage` source-origin autocomplete and runtime effect.
2. AIMASSIST preset-only positional parsing and actual targeting behavior.
3. Custom EVENT owner matching and real event-state transition in game.
4. CONTROLSCHEME paired CAMERA/controls effects in Education 26.32; static
   ordering is covered, but actual player-control behavior is not yet proved.
5. Real BP `.mcfunction` execution and future Parser↔AST round-trip checks.

The previously documented A8 Preview INFO tests remain independent; see
`docs/PREVIEW_COMPATIBILITY_INFO_0.0.72_2026-10-20.md` for verified details.
