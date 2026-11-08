# command_block_coding — Current Plan (updated 2026-10-22)

**현재 단계:** MakeCode/PXT AST 기반 명령 구현·실게임 대표 검증. GitHub master `0.0.77`(버전 커밋은 `pxt.json`만 수정); B4 실제 검증은 0.0.76 동일 기능 소스. **Parser/Converter·`.mcfunction` 실제 파일 Export/Import는 완료되지 않음.**

## 빠른 현재 현황
- B4 **PLAYANIMATION 대표 고급 인수**와 **FOG 지상·수중·스택**: 사용자 Minecraft Education 26.32 시각 PASS. 세부 범위와 미검증은 `docs/B4_TEST_EVIDENCE_2026-10-22.md`.
- CAMERA 주요 명령 대표 실게임 및 7개 CAMERA PRESET Library UI 확인. CAMERA 특수 기능 전체 완료는 아님.
- B3 Damage/Event, C1 ControlScheme/AimAssist 대표 경로 사용자 PASS 기록. C1 Ride/Dialogue는 현재 미완료.
- FOG 80개 ID 최신 5개 그룹 42/24/7/6/1; Animation 536, Controller 179, CAMERA PRESET 7. 전체 Education 런타임 호환성 보증 아님.
- **다음 후보:** Ride/Dialogue → Scoreboard AST → Modern Execute AST → RawText Tellraw/Titleraw → 실제 `.mcfunction` 양방향 Converter. CAMERA 고급 미완료는 별도 backlog.

## 현재 읽을 문서
1. `docs/HANDOFF_BLOCK_COMMAND_MAKER_0.0.77_2026-10-22.md`
2. `docs/COMMAND_IMPLEMENTATION_ROADMAP_2026-10-22.md`
3. `docs/B4_TEST_EVIDENCE_2026-10-22.md`

## 역사적 계획 원문 보존
아래는 초창기 `PROJECT_PLAN.md` 원문이며, `give`, `tp`를 다음 작업으로 지칭하는 등 **현재 개발 단계와 달라진 항목이 있다.** 최신 작업 순서는 위 2026-10-22 섹션을 따른다.

---

# command_block_coding — Current Plan

## Confirmed runtime structure

```text
FunctionFile.define("main", ...)
  -> Minecraft Education preview: chat trigger
  -> Converter meaning: functions/main.mcfunction

Command block
  -> Block Adapter
  -> Command AST
  -> Validator
  -> Compiler
  -> player.execute(compiled) for in-game preview
```

Confirmed commands:
- `Command.say(...)`
- `Command.mcFunction(...)`

`Command.mcFunction()` first resolves another `FunctionFile.define()` for MakeCode preview.
If no local definition exists, it falls back to the real Minecraft `function <id>` command.

## Converter Edition — recorded, implementation deferred

The Converter will not require `.mkcd` as its normal workflow.

### Blocks -> mcfunction
1. Build blocks in MakeCode.
2. Switch to JavaScript.
3. Copy the generated `FunctionFile.*` / `Command.*` code.
4. Paste into Converter.
5. Converter parses the canonical API -> AST -> `.mcfunction` files.

### mcfunction -> Blocks
1. Converter parses `.mcfunction` -> AST.
2. Generate canonical MakeCode JavaScript (`FunctionFile.*` / `Command.*`).
3. Copy generated JavaScript into MakeCode.
4. Switch JavaScript -> Blocks using MakeCode's own decompiler.

Converter work is intentionally deferred until command-block coverage is stronger.

## Legacy reuse policy

Reuse proven Core code and restore only the Registry behavior that is useful for the production tool.

Restored now:
- Selector AST and Selector condition blocks
- Range / Slot common types
- Selector compiler
- `@a`, `@e`, `@p`, `@r`, `@s`, Dialogue-only `@initiator`
- Generated searchable Registry reporters
- Direct/custom input alongside Registry values
- Raw Command AST / Compiler fallback

Registry scope:
- Item / Block / Entity / Effect / Particle
- Family
- Event and Spawn Event as separate Toolbox categories
- Event/Spawn Event reporters grouped by entity inside each category

Quick Preset is intentionally not restored.

## Next command-block work

Use the restored common types instead of reimplementing them per command.
Suggested next order:
1. `give` using Selector + direct Item ID
2. Position
3. `tp`
4. `setblock`
5. other verified legacy command cores
