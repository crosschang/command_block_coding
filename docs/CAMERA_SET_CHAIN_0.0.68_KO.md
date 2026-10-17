# CAMERA SET Selector-style option-chain 적용 안내 (0.0.68)

## 기준

- 입력 소스: `command_block_coding(20261017-100614).zip`
- `pxt.json` 버전 변경 없음: **0.0.68**
- CAMERA 외 커맨드, SELECTOR 필드, 진단 최적화(`cbi_diag` 제거 포함) 변경 없음
- `.mcfunction` 파일 작성/저장 기능 미구현(이번 패치 범위 아님)
- GitHub 저장소 `crosschang/block_command_maker`에는 커밋하지 않음. 현재 연결에서 해당 저장소 파일 조회가 404이므로 업로드 소스를 기준으로 제작함.

## 기본 UI 변경

`CAMERA target [Selector] command [SET Preset + options chain]`

CAMERA의 새로운 SET 액션은 `mcfunction_camera_action_set_chain` 입니다.
옵션은 SELECTOR와 같은 `next` 구조이며 `end SET options`로 끝납니다.
지원 옵션: `ease`, `default`, `pos`, `rot`, `facing entity`, `facing position`, `view offset`, `entity offset`.

- `pos`와 `rot`는 독립 또는 `pos -> rot`으로 사용
- `pos -> facing entity/position` 가능
- `rot -> view_offset -> entity_offset` 가능
- `view_offset -> entity_offset` 가능
- `ease`는 맨 앞에서 위의 공식 SET 설정 하나를 감쌈
- `default`, `facing`, `entity_offset`는 단말 Reporter (뒤에 `next` 없음)
- 다른 연결(중복, 역순, pos + offset, rot + facing)은 Validator 오류
- 프리셋은 기본 목록과 사용자 정의 ID 모두 유지

## 이전 블록 보존

기존 `mcfunction_camera_action_set_grammar`와 `mcfunction_camera_set_branch_*` 는 숨김 처리만 하며 기존 함수명/블록 ID는 그대로입니다. 예전 작업공간에 있던 기존 블록은 자동으로 새 구조로 변환되지 않습니다. 새 CAMERA 블록을 Toolbox에서 가져와 확인하세요.

## 변경 소스

1. `commands/camera.ts` — CAMERA SET 옵션 키워드 종류 및 선택적 입력 순서 정보 추가.
2. `src/blocks/camera_blocks.ts` — CAMERA SET 체인/종료 블록과 구성 함수 추가; 기존 Reporter 숨김.
3. `src/blocks/command_adapter.ts` — 입력 순서를 최종 CAMERA AST로 전달.
4. `src/validator/validator.ts` — 순서/중복/필수값 누락/단독 ease 검사. 기존 문법 검사 유지.

기존 Compiler, Parser, MakeCode 루트 파일, `pxt.json`, 다른 커맨드는 변경하지 않습니다. `commands/camera.ts`와 `src/blocks/camera_blocks.ts`는 이미 `pxt.json.files`에 등록되어 있습니다.

## 기대 명령 예시

```mcfunction
camera @s set minecraft:free
camera @s set minecraft:free pos 10 70 10
camera @s set minecraft:free rot 0 180
camera @s set minecraft:free pos 10 70 10 rot 0 180
camera @s set minecraft:free ease 2 linear pos 10 70 10 rot 0 180
camera @s set minecraft:free view_offset 1 2 entity_offset 3 4 5
camera @s set minecraft:free rot 0 180 view_offset 1 2 entity_offset 3 4 5
```

> `rot`의 출력 순서는 Bedrock CAMERA 인수 순서에 맞춰 pitch(xRot) 다음 yaw(yRot)입니다. 기존 공통 Rotation 타입 자체는 변경하지 않았습니다.

## 검증

프로젝트 루트에서:

```shell
node tests/CAMERA_0.0.68_SET_CHAIN_REGRESSION.cjs
node tests/CAMERA_0.0.68_SET_28_GRAMMAR_REGRESSION.cjs
node tests/CAMERA_0.0.68_SET_COMPOSITION_REGRESSION.cjs
node tests/CAMERA_0.0.68_FOV_ENTITY_FADE_REGRESSION.cjs
```

- 체인 방식으로 SET 공식 28가지 변형 출력 및 유효성 검사: PASS
- 잘못된 체인 9건(역순/중복/잘못된 조합/입력 누락/순환): PASS(오류 탐지)
- 기존 SET 문법별/통합 Reporter, FADE/FOV/ENTITY 회귀: PASS
- 원본 대비 TS 진단 개수 **27 → 27**, 새로운 진단 유형 없음 (일반 TypeScript 검사, MakeCode PXT 빌드 보증 아님)
- **MakeCode 블록 표시, JavaScript↔Blocks, PREVIEW 연결, 실제 Bedrock/Education 게임 실행은 미검증**

## 수동 MakeCode 점검

1. 새 CAMERA 메인 블록의 SET 기본값이 나타나는지 확인.
2. `options`에 `ease -> pos -> rot -> end SET options`를 연결하여 JS↔Blocks 왕복.
3. `pos` 단독, `rot` 단독, `view_offset -> entity_offset`, `rot -> view_offset -> entity_offset` 출력 확인.
4. `pos -> entity_offset` 등의 공식 문법 밖 조합이 Validator 오류가 되는지 확인.
5. FADE/FOV/ENTITY와 이전에 작성한 숨김 레거시 블록이 정상 유지되는지 확인.
6. CAMERA 전체 기능의 게임 검증은 사용자 계획대로 마지막 통합 단계에서 진행.
