# CAMERA Action Reporter 구조 개선 — 0.0.68

## 범위
- 기준: 사용자 제공 `command_block_coding(20261017-065229).zip`에 앞서 반영한 SET Reporter 수정본 (`command_block_coding_0.0.68_CAMERA_SET_REPORTER_FULL.zip`)
- 버전: **0.0.68 유지** (`pxt.json`, `main.ts` 변경 없음)
- 변경된 **기존 소스 파일은 2개**: `src/blocks/camera_blocks.ts`, `src/blocks/command_adapter.ts`
- CAMERA 이외 명령/진단 최적화/`cbi_diag`/FunctionFile/Compiler/Validator 변경 없음
- `.mcfunction` 파일 생성과 Parser/Round-trip 추가 없음

## 공개 블록 구조

```text
CAMERA [Target: Selector] [Command: CameraActionValue]
  ├─ SET [Preset: CameraPresetValue] [Settings?: CameraSetOptionsValue]
  │    ├─ Built-in / Custom Preset ID
  │    └─ Ease, Position, Orientation (Rotation OR Facing), Default, Offsets
  ├─ CLEAR
  ├─ FADE [Settings?: CameraFadeOptionsValue]
  │    └─ Time?, Color? (0 RGB, 0초도 명시된 값으로 유지)
  ├─ ENTITY CONTROL [Operation: CameraEntityOperationValue]
  │    ├─ ATTACH [Entity]
  │    ├─ DETACH
  │    ├─ TRACK [Entity] [Center Offset?]
  │    └─ REMOVE TARGET
  ├─ FOV [Operation: CameraFovOperationValue]
  │    ├─ SET [FOV] [Ease?]
  │    └─ CLEAR [Ease?]
  └─ PLAY SPLINE [Spline ID]
```

일반 실행용 CAMERA 블록은 기존 `command_camera_dispatch` **1개**입니다.
기존 `mcfunction_camera_action_fade`, `mcfunction_camera_action_entity`, `mcfunction_camera_action_fov` 블록 ID 및 API는 삭제하지 않고 `blockHidden=true`로 전환했습니다. 기존 프로젝트가 해당 블록을 사용할 수 있어야 합니다.

## Adapter 보호
- `createCameraFromAction()`에서 모든 선택 필드를 수동으로 복사하지 않고, `CameraAction` 분기별로 기존 AST 생성 함수를 호출합니다.
- Reporter 부재 시 임의의 SET을 만들지 않고 `CAMERA_ACTION_INVALID`로 검사되는 AST를 반환합니다.
- 완성된 AST 의미는 기존 CAMERA Compiler/Validator로 전달됩니다.

## 로컬 점검 결과
- 0.0.68 `pxt.json` 항목 수정 없음; 기존에 포함된 `camera_blocks.ts`, `command_adapter.ts`만 변경
- PXT 없이 일반 `tsc`로 프로젝트 실제 TypeScript 파일만 검사할 경우 CAMERA 변경 파일 신규 오류 없음. 기존 `player`, `loops`, `Math.randomRange` 등 MakeCode 런타임 의존 오류는 남아 있음
- 별도 Node VM에서 해당 소스의 TypeScript 빌드 결과를 실행한 **정상 12종 + 오류/Custom 5종** 점검 통과
- 이 테스트는 MakeCode 블록 UI/JavaScript↔Blocks 편집기나 실게임 검증을 대체하지 않음

## MakeCode 검증 순서
1. `CAMERA 대상 / 명령` 블록 1개가 주요 실행 블록으로 표시되는지 확인
2. SET: 기본 Preset 및 Custom Preset 각각 연결; Settings를 펼친 뒤 Position/Orientation/Ease 등 연결
3. CLEAR: 추가 입력이 없는지 확인
4. FADE: 기본, Color 단독, Time 단독, Time+Color 모두 조립 후 PREVIEW 출력 확인
5. FOV: `FOV > set(value, ease?)` / `FOV > clear(ease?)` 각각 조립 확인
6. ENTITY: attach, detach, track(+center offset), remove target 각각 조립 확인
7. PLAY SPLINE: 입력 Spline ID 보존 확인
8. JavaScript → Blocks 왕복, 이전 숨김 블록을 쓰는 기존 워크스페이스 복원 검증
9. `?`, `함수명?`, `cbi_page`, 진단 출력 회귀 확인
10. 전체 CAMERA 명령 구현 완료 후 Bedrock/Education 실제 게임 통합 검증

## 주의
- 공식 문서의 `targetEntity` 표기와 양 플랫폼의 실제 자동완성 `target_entity` 표기 차이는 이전 합의대로 기존 Compiler의 밑줄 표기를 유지
- 플레이스플라인(`play_spline`)은 게임 버전별 지원 및 행동 팩 준비 여부 확인 필요
- 명령어 문자열은 Reporter 함수에서 조립하지 않으며 AST → Validator → Compiler 경로를 유지
- PXT 컴파일러 환경에서 실제 화면 동작 확인 전까지 최종 PASS라고 표기하지 않음
