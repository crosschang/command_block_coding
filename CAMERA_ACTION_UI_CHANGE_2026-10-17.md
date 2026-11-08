# CAMERA Action Reporter 통합 (현재 소스 버전 0.0.67)

기준: 사용자 최신 ZIP `command_block_coding(20261017-015455).zip`.

## 변경
- `command_camera_dispatch` 메인 블록 CAMERA target + command Reporter 추가.
- `mcfunction_camera_action_set` : Preset, Ease, Position, Orientation, Mode, View/Entity Offset.
- `mcfunction_camera_action_clear`, `mcfunction_camera_action_fade`, `mcfunction_camera_action_entity`, `mcfunction_camera_action_fov` 추가.
- `MCFunctionBlocks.createCameraFromAction`이 Reporter에서 생성한 Camera AST의 대상만 메인 Selector로 바인딩하여 AST를 출력.
- 기존 SET / CLEAR / FADE / Attach / Detach / Target / FOV 실행 함수 및 blockId 삭제 없이 blockHidden 처리.
- 진단/컴파일러/AST/pxt.json 변경하지 않음. `.mcfunction` 파일 생성 기능 추가하지 않음.

## 주의 및 검증 방법
1. MakeCode에서 새 CAMERA target command 블록이 생성되는지 확인.
2. 명령 소켓의 기본 SET Reporter가 렌더링되는지 확인.
3. Reporter를 CLEAR, FADE, ENTITY CONTROL, FOV로 바꿔 JS↔Blocks 변환을 확인.
4. PREVIEW 생성 텍스트와 기존 블록 동작 비교. CAMERA SET의 옵션 조합은 기존 Validator 규칙을 그대로 따름.
5. ENTITY CONTROL의 attach/track은 대상 entity 입력 필수, detach/remove tracking에는 entity/offset 연결을 빼야 함. 선택값에 따른 UI 자동 숨김은 미구현.
6. FOV SET은 고급 입력을 펼쳐 값을 조절할 수 있으며 접힌 상태에는 기본 70 적용.
7. 블록 생성·시뮬레이터/실게임 검증을 통과한 상태는 아님. 실게임 통합 검증은 사용자 요청대로 전체 구현 후 실시.

`play_spline`은 최신 소스 구현에 없으며 이번 UI 통합 패치에 포함하지 않음. 공식 버전별 문법 및 Education 호환성 검토 후 별도 적용.
