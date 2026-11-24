# Dialogue / LANG 블록 소스 정리 — 2026-11-24

## 정리 기준
- 실제 저장소: crosschang/command_block_coding, master.
- 이번 변경은 **호환성을 유지하는 리팩터링**이다. 사용자가 이미 배치한 Scene/버튼 블록이나 블록 ID, TypeScript API, AST·JSON 표현을 삭제/변경하지 않는다.
- Minecraft MakeCode/PXT GitHub Extension 유지. `pxt.json.version` 및 대상 버전은 변경하지 않는다.
- 행동팩과 리소스팩 원본 소스는 GitHub에 업로드하지 않으며, 기존 브리지/Preview를 수정하지 않는다.

## 공존하는 작성 UI의 역할
| UI | 기존 공개 API | 용도 | 상태 |
| --- | --- | --- | --- |
| C자형 Scene | `DialogueFile.scene` / `button` | 원하는 수의 명령과 버튼을 이어 붙이는 고급 방식 | 기존 호환 유지 |
| Scene choices | `DialogueFile.sceneChoices` / `buttonChoice` | 버튼 입력칸을 +로 펼치는 방식 | 기존 호환 유지 |
| 고정 타입 Scene | `DialogueFile.typedScene` / `openSlot` / `closeSlot` / `openNone` / `closeNone` / `buttonNone` | OPEN → CLOSE → BUTTON의 입력 위치와 타입을 구분하는 기본 제작자 방식 | 차후 UI 검증 필요 |
- 추가 OPEN/CLOSE C자형 구역(`openSection/closeSection`)도 기존 프로젝트와 호환되게 유지한다.
- 앞으로 블록을 하나로 대체하거나 삭제하려면 **Blocks↔JavaScript 왕복과 기존 사용자 프로젝트 호환성 검증 후** 별도 단계로 진행한다.

## 이번에 수정한 코드
- `src/project/resource_project.ts`:
  - `createButtonChoice`의 명령 AST 생성은 기존 `createSceneCommandList` 호출로 통합.
  - `addSceneChoices`와 `addTypedScene`의 Scene 생성·OPEN/CLOSE·Button 배열 수집은 공통 내부 함수 `buildScene`으로 통합.
  - 각 API의 기존 문맥 오류 검사, 버튼 최대 개수 검사, 메시지와 순서는 변경하지 않는다.
  - 빈 선택지는 원래처럼 무시하고, 미지원 명령은 기존 Parser의 Raw Command 보존 경로를 사용한다.
- `src/blocks/resource_blocks.ts`:
  - Dialogue Toolbox 그룹을 `DIALOGUE FILE → Structured Scene → Scene → Button → Commands` 순서로 명시.
  - 그룹 표시만 정리하며 블록 ID나 입력 시그니처는 변경하지 않는다.
- 회귀 검사 도구:
  - `tests/DIALOGUE_TYPED_SCENE_REGRESSION.cjs` 및 `tests/DIALOGUE_SCENE_CHOICES_REGRESSION.cjs`가 신규 공통 함수의 TypeScript 반환 타입을 테스트 환경에서 안전하게 제거하도록 보완. 실제 MakeCode 소스의 타입을 느슨하게 바꾸지 않는다.

## 회귀 결과와 남은 한계
- 소스 blob 기준, 네 회귀 테스트 스크립트를 V8에서 Node API 모의 객체로 실행한 결과 14건 PASS:
  - Scene choices 4/4
  - Typed Scene 4/4
  - Scene OPEN/CLOSE 3/3
  - 기존 C자형 연결 구조 3/3
- 검사 범위: 공통 AST 조립, 순서·빈 선택지, 문맥 검사, PXT 블록 메타데이터와 등록 구조.
- **미검증:** 실제 MakeCode/PXT 전체 빌드, 블록 편집기에서의 타입별 물리적 연결 차단, Blocks↔JavaScript 왕복, Education 실게임과 행동팩 실행.
- 제작자용 C자형 고정 템플릿을 제공하는 기능은 이번 변경에 포함하지 않는다. 현재 구현한 타입 입력 UI와 별개로 검토한다.
- 파일 저장과 행동팩·리소스팩 패키징도 이전과 같이 미구현 상태이다.

## 다음 정리 후보 (이번에 변경하지 않음)
- 프로젝트 리소스 정의의 수명/초기화 방식: MakeCode 실행을 다시 시작했을 때 중복 정의가 누적되는지 실환경 검증.
- JSON Import 및 왕복 보존, 오류가 있는 파일의 내보내기 차단.
- Scene UI를 하나의 기본 패턴으로 일관화하기 전, C자형/타입형 사용 경험과 기존 저장 프로젝트 전환 검증.
