# Legacy P2 Migration — Position / Rotation / Facing / TP

기준: 2026-10-05

## 목적

`block_command_maker` 레거시에서 이미 구현된 공통 좌표 타입과 TP 명령을 `command_block_coding`의 현재 Core Engine에 선별 이식한다.

현재 프로젝트의 공통 실행 경로를 유지한다.

```text
MakeCode Block
→ Block Adapter
→ Minecraft Command AST
→ Validator
→ Compiler
→ player.execute()
```

## 복구한 코드

- `src/ast/position.ts`
  - Absolute
  - Relative `~`
  - Local `^`
- `src/ast/rotation.ts`
  - Absolute
  - Relative `~`
- `src/ast/facing.ts`
  - Facing Position
  - Facing Entity
  - EntityAnchor Eyes / Feet
- `commands/teleport.ts`
  - Position
  - Entity
  - Rotation
  - FacingPosition
  - FacingEntity
- `src/fields/position_field.ts`
- `src/fields/rotation_field.ts`
- `src/blocks/command_adapter.ts`
- `src/compiler/compiler.ts`
- `src/validator/validator.ts`
- `custom.ts`

## 중요한 문법 결정

Bedrock stable `/teleport`의 facing entity 문법에는 `eyes` / `feet` anchor가 없다.
따라서 `EntityAnchor`는 공통 AST로 보존하되 TP에는 연결하지 않는다.
향후 modern execute 구현의 `execute facing entity <target> <eyes|feet>`에서 재사용한다.

## Compiler smoke test

다음 5개가 자동 확인되었다.

```mcfunction
tp @s ~ ~1 ~ false
tp @s @p true
tp @s 10 64 -20 ~90 ~ false
tp @s 10 64 -20 facing ~ ~1 ~ true
tp @s ^ ^ ^3 facing @p false
```

결과:

```text
TP CORE TEST PASS: 5/5 compile + validator
```

전체 `pxt.json` TypeScript 파일도 일반 TypeScript 정적 컴파일 검사를 통과했다.

## 아직 PASS로 표시하지 않는 것

Minecraft Education 실제 Runtime Preview는 로컬 정적 테스트로 대체할 수 없다.
따라서 아래는 Education에서 직접 재검증 후 PASS 처리한다.

1. TP Position
2. TP Entity
3. TP Rotation
4. TP Facing Position
5. TP Facing Entity
6. checkForBlocks false / true
7. Absolute / Relative / Local Position

## 다음 단계

Education 실제 테스트가 끝나면 다음 순서로 진행한다.

```text
Anchor 공통 Field/UI
→ Summon
→ Effect
→ Setblock / Fill / Clone
→ 나머지 V1 commands
```
