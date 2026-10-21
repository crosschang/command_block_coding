# B4 PLAYANIMATION / FOG + CAMERA PRESET LIBRARY — 2026-10-21

## 기준 및 근거

- 저장소 `crosschang/command_block_coding` `master`의 `0.0.75` (확인 시점 2026-10-21). 패치 자체로 버전을 올리지 않음.
- `src/ast/command.ts`, `src/blocks/command_adapter.ts`, `src/compiler/compiler.ts`, `src/validator/validator.ts`, `custom.ts`의 SHA가 이전 누적 패치와 동일함을 확인함.
- 공식 명령 문법:
  - PLAYANIMATION: https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/playanimation
  - FOG: https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/fog
  - CAMERA: https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/camera
  - FOG 리소스: https://learn.microsoft.com/en-us/minecraft/creator/documents/foginresourcepacks

## 설계

```text
MakeCode Blocks → MCFunctionBlocks Adapter → MCFunctionAST → MCFunctionValidator
    → MCFunctionCompiler → canonical .mcfunction line → existing Preview runtime
```

- 새 종류: `CommandKind.PlayAnimation` (35), `CommandKind.Fog` (36); 기존 번호 유지.
- CAMERA 기존 `Command.CameraPresetValue`와 `command_camera_*` Block ID 유지. Library Reporter만 추가.
- CAMERA 기본 7종은 공식 Bedrock 목록 기준. Minecraft Education 26.32 동작을 모두 검증한 것은 아님.
- ANIMATION, FOG의 사용자 정의 ID는 제한된 Registry 외에도 입력 가능.
- FOG의 **fogId** (리소스 팩 ID)와 **userProvidedId** (스택에 지정한 식별자)는 혼동하지 말 것.
- FOG `pop`은 일치하는 최상위 레이어 1개, `remove`는 일치하는 레이어 전체 제거. 월드 재접속 후에도 fog stack이 남을 수 있으므로 테스트 종료 시 `remove` 권장.
- PLAYANIMATION의 선택 인자는 공식 순서 `next_state → blend_out_time → stop_expression → controller`; 앞의 인자 없이 뒤의 인자를 연결하면 ERROR 처리. 0초 blend는 유효한 값.
- `stop_expression`은 Molang 문자열 그대로 AST에 저장하고 Compiler가 한 줄 인용 문자열로 이스케이프 처리.
- 공식 예시 `animation.creeper.swelling`은 Creeper에 적합한 예시이며, 다른 엔티티 재생 보장은 없음.
- 커맨드 실제 게임 적용, 시각적 효과, `.mcfunction` 파일 실행은 아직 검증되지 않음.

## 파일 적용

1. 현재 `0.0.75` 프로젝트 백업.
2. ZIP 내 **수정/추가 파일만** 저장소 루트에 같은 상대 경로로 복사(덮어쓰기).
3. `pxt.json`에 신규 8개 TS 경로가 등록되어 있는지 확인.
4. `tests/B4_CAMERA_LIBRARY_0.0.75_MAIN.ts`의 내용을 **임시** MakeCode `main.ts`에 복사. `test.ts`와 릴리즈용 `main.ts`는 변경하지 않음.
5. JavaScript → Blocks 전환 후 CAMERA PRESET, ANIMATION ID, FOG ID, PLAYANIMATION, FOG 블록이 회색이 아닌지 확인.
6. `?` 진단에서 E0 확인. 초기 정의 시 INFO는 리소스 팩/엔티티 호환성 안내로 정상.

## 인게임 테스트 (테스트 월드)

- `b4_cam_boom` → 플레이어를 추적하는지 확인
- `b4_cam_orbit` → 플레이어를 추적하면서 카메라 회전 가능한지 비교
- `b4_cam_clear` → 카메라 원복
- `b4_anim_prepare` → 크리에이티브에서 플레이어 전방 소환된 이름 지정 Creeper 확인. 폭발 주의.
- `b4_anim_creeper` → Creeper의 swelling animation이 재생되는지 프레임별 관찰
- `b4_anim_cleanup` → 이름과 유형이 일치하는 테스트용 Creeper만 제거
- `b4_fog_push` → `minecraft:fog_desert`를 `cbi_b4_test`라는 ID로 추가. 안개 효과가 가시적이지 않을 수 있음.
- `b4_fog_pop` → 위 레이어 1개 제거
- `b4_fog_push` 두 번 → `b4_fog_remove` → 동일 user ID 레이어 전부 제거

**중요:** `b4_anim_prepare` / `b4_anim_cleanup`은 실제 월드를 변경함. 서바이벌에서 Creeper 소환 위험. 실제 효과가 보이지 않으면 `true` 반환이나 INFO만으로 PASS 기록하지 않는다. 특수 Resource/Behavior Pack이 필요한 ID는 그 팩이 있을 때만 검증한다.

## 정적 확인 결과

- 새 Library/Block/AST 타입 컴파일 검사: PASS (격리한 TypeScript ES5 환경).
- canonical Compiler 12종 및 Validator 잘못된 입력 12종: PASS.
- 신규 8개 TS 경로와 카메라 7개 Library 값 정합성, blockId 중복 검사: PASS.
- 전체 MakeCode UI 실제 블록 표시와 게임 동작은 사용자 인게임 검증 필요.

- 기존 A8, B3/C1, SELECTOR, Preview 회귀 4종: 테스트 환경의 고정된 과거 버전 기대값(0.0.72)만 0.0.75로 바꿔 PASS 확인. 배포 파일 내 기존 테스트는 손대지 않음.
- 전체 GitHub 0.0.75 PXT MakeCode 실제 컴파일 및 UI 변환은 미실행. 신규 코드 격리 타입검사와 canonical 명령 회귀는 PASS.
