# CAMERA B2-1: Position + Rotation, 0.0.65

Scope: additive changes to commands/camera.ts, src/blocks/camera_blocks.ts,
src/blocks/command_adapter.ts, src/compiler/compiler.ts, src/validator/validator.ts.
No change to version, diagnostics system, main.ts, or PXT files manifest.

Official reference: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/camera?view=minecraft-bedrock-stable

Syntax used:
- `camera <players> set <preset> pos <x> <y> <z>`
- `camera <players> set <preset> rot <xRot> <yRot>`
- `camera <players> set <preset> pos <x> <y> <z> rot <xRot> <yRot>`

The shared Rotation AST stores `yaw, pitch`; CAMERA requires `xRot (pitch), yRot (yaw)`.
The CAMERA compiler intentionally serializes pitch before yaw, while the shared
rotation serializer remains unchanged for commands that use its normal order.

Expected outputs for tests/CAMERA_B2_1_PUBLIC_API_MAIN.ts:
```
camera @s set minecraft:free pos 10 70 10 rot 0 180
camera @s set minecraft:free pos ~ ~2 ~
camera @s set minecraft:free rot ~ ~90
camera @s clear
```

Required test checklist:
- B1 existing cameraSet and cameraClear keep their exact outputs.
- Verify Position absolute, relative, local and mixed-mode rejection.
- Verify Rotation absolute and relative, no local rotations.
- Verify malformed/non-finite coordinates and rotations trigger ERROR.
- Verify custom preset INFO and invalid preset ERROR retain their behavior.
- Verify JS/Blocks conversion, Preview command emission and in-game Education execution.
- Verify diagnostic `?`, `functionName?`, `cbi_page N` and reclaimed `cbi_diag` remain stable.
- Education support for every position/rotation combination is **NOT YET VERIFIED**.
- `.mcfunction` parsing is future work: B2-1 currently adds structured AST-to-command compilation, NOT a completed reverse parser.

Verification at patch creation: TypeScript compiler emitted no diagnostics referencing the
five modified files, but full `tsc` is not a valid PXT test (Minecraft APIs missing).
PXT build, block round-trip, and Minecraft Education real-game verification remain pending.
