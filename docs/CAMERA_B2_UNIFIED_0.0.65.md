# CAMERA B2 Unified — 0.0.65 (implementation candidate)

## Scope
- `cameraSetUnified` is the preferred expandable MakeCode block. Its inputs are canonical AST values, not raw command snippets.
- Historical CAMERA SET block IDs are hidden from the toolbox but the callable functions and block IDs remain for existing workspaces.
- CLEAR and FADE remain separate statement blocks.
- Official Bedrock `/camera` additions: `view_offset`, `entity_offset`, `attach_to_entity`, `detach_from_entity`, `targetEntity` with optional `targetCenterOffset`, `removeTarget`, `fov_set`, `fov_clear`.
- **Education compatibility has not been verified.** Official grammar: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/camera?view=minecraft-bedrock-stable
- This change does not implement `.mcfunction` file exports or parser/round-trip.

## Representative Preview expectations (verify in MakeCode)
```
camera @s set minecraft:free ease 2 linear pos 50 70 50 rot 0 180
camera @s set minecraft:free view_offset 1 2 entity_offset 0 1 0
camera @s attach_to_entity @e[type=armor_stand,c=1]
camera @s detach_from_entity
camera @s targetEntity @e[type=armor_stand,c=1] targetCenterOffset 0 1 0
camera @s removeTarget
camera @s fov_set 30 0.5 linear
camera @s fov_clear
```

## Checklist (do not mark PASS without user verification)
1. PXT loads extension and CAMERA toolbox shows single preferred SET (expandable), CLEAR, FADE, attach/detach, track/untrack, FOV set/clear, and value reporters.
2. Expanded slots connect compatible reporters; JS ↔ Blocks conversion persists.
3. PREVIEW output is exact; no pseudo-commands are generated.
4. Invalid combinations (pos + view_offset, facing + rot, default + offsets) generate ERROR rather than a command.
5. All previous CAMERA B1/B2 blocks still load from saved workspaces.
6. No changes to diagnostic cache, `cbi_diag`, or runtime plumbing.
7. Game validation only after full Bedrock CAMERA implementation is reviewed.

## Known environment limitations
Generic `tsc` includes errors about MakeCode globals (player, loops, gameplay, etc.) in existing files; this does not establish PXT compilation success. MakeCode compilation and editor rendering remain unverified.
