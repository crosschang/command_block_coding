# 0.0.42 Gamerule typed library — candidate implementation

Base: user-supplied `command_block_coding (2).zip`, `pxt.json` version **0.0.39**; version stays 0.0.39.

- Registry source: `registry/source/bedrock/gamerules.json`, official Microsoft Creator Bedrock command enums, checked 2026-10-12. 32 Boolean, 5 Integer, 1 Enum; **not** Education 26.32 confirmation.
- Policy: `VERSIONED_NATIVE_ENUM`. Regeneration source of truth is JSON and `tools/generate_registry.ps1`; do NOT edit `.generated.ts` manually.
- One public GAMERULE statement with List/Query/Set Boolean/Set Integer/Set Enum action reporters. Native Boolean literals use fixed enum field.
- GameRule AST, adapter, validator, compiler and FunctionFile Preview entry reuse. Canonical results: `gamerule`, `gamerule keepinventory`, `gamerule showcoordinates true`, `gamerule randomtickspeed 1`, `gamerule playerwaypoints everyone`.
- Unknown *syntactically valid* native gamerule name: WARNING and preserved for future/version-specific runtime. Type mismatch and non-integer numeric values: ERROR and FunctionFile registration blocked. Known enum undocumented value: WARNING.
- `playerwaypoints` may not be available in Education 26.32. Use query/definition only until live support is verified. Do not modify world using unsupported values on assumption.
- Preview query feedback may be hidden by `player.execute`, so query readback success is NOT proved by a Definition OK message.
- Test public API file: `tests/GAMERULE_0.0.42_PUBLIC_API_MAIN.ts`. `test.ts` remains 0 bytes; production `main.ts` untouched.

Source documentation: https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/gamerule?view=minecraft-bedrock-stable

Status: code/static checks pending or passed per delivery notes; Minecraft Education live tests PENDING.
