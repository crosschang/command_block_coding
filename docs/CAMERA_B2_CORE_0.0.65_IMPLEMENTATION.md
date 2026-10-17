# B2 CAMERA CORE — implementation checkpoint (0.0.65 unchanged)

## Included
- Existing B1 SET/CLEAR and B2-1 position/rotation preserved.
- Structured AST for facing (common Facing: position or no-anchor entity), ease, default, fade time and RGB.
- Separate block APIs for facing, ease+rotation, ease+facing, default, ease+default, fade.
- Camera validator covers mutually exclusive `rot`/`facing`, `default` exclusivity, fade ranges, easing enum bounds.
- The compiler uses `ease ...` before `pos ...` and `rot ...` / `facing ...`.

## Out of scope
- Direct `.mcfunction` file export, import, or Round-trip (these are future stages).
- Additional Bedrock-only camera extensions (entity attachments, FOV, offsets, targetEntity); Education support not established.

## Test in MakeCode
1. Keep original root main.ts; temporarily paste `tests/CAMERA_B2_CORE_PUBLIC_API_MAIN.ts` into it.
2. Make sure Blocks ↔ JavaScript switch succeeds; inspect PREVIEW for the generated commands.
3. Run each command in Minecraft Education (version recorded by tester) in an appropriate test world, then run `camera @s clear`.
4. Test invalid combinations with AST-level validation and verify diagnostic codes; never call unsupported PXT globals.
5. Restore root main.ts and note PASS/FAIL evidence for each case.

## Expected preview output
```
camera @s set minecraft:free pos 50 100 50 facing 0 64 0
camera @s set minecraft:free ease 2 linear pos 100 80 100 rot 0 180
camera @s set minecraft:free ease 1.5 in_out_cubic pos 10 70 10 facing @s
camera @s set minecraft:free default
camera @s set minecraft:free ease 1 linear default
camera @s fade time 0.5 1 0.5 color 0 0 0
camera @s fade
camera @s clear
```

Official Bedrock source: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/camera?view=minecraft-bedrock-stable
Education parity requires game verification; no PASS claim before testing.
