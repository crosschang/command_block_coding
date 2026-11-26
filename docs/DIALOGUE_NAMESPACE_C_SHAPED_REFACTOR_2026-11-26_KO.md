# Dialogue MakeCode 네임스페이스 분리 및 C자형 기본 UI — 2026-11-26

## 목적과 기준
- 사용자 요청은 ChatGPT Space가 아닌 **MakeCode Extension의 TypeScript 네임스페이스**를 분리하는 것이다.
- Dialogue는 **C자형(Scene·Button·OPEN/CLOSE)**을 기본 편집 방법으로 유지한다. 향후 조립식 execute에도 같은 **블록은 입력/UI, AST는 명령 의미의 원본** 원칙을 적용한다.
- 기존 작업을 파괴하지 않는다. 이전 블록 ID, 공개 TypeScript API, 명령 AST, Parser/Validator/Compiler, JSON Codec, 행동팩은 유지한다.

## 새 MakeCode 도구상자 구성
| TypeScript namespace | 기본 C자형 블록 | 별도 보존 블록 |
| --- | --- | --- |
| `DialogueFile` | Dialogue JSON 파일 정의 | 이전 DialogueFile.* API는 숨김 호환 블록으로 보존 |
| `DialogueScene` | `scene(...)` (C자형, 기본) | `choices(...)`, `typed(...)` |
| `DialogueButton` | `button(...)` (C자형), `command(...)` | `choice(...)`, `none()` |
| `DialogueEvent` | `openSection(...)`, `closeSection(...)` (C자형), `sectionCommand(...)` | OPEN/CLOSE 타입 값 슬롯 및 없음, 개별 onOpen/onClose |
| `ResourceText` | 그대로 유지 | RawText 공통 값 |
| `LanguageFile` | 그대로 유지 | LANG 문서 |
| `ResourceFiles` | 그대로 유지 | 생성 계획/진단 |

- 새 분리 코드는 `src/blocks/dialogue_namespaces.ts`에 세 개의 실제 namespace를 선언한다.
- 새 블록 ID(`mcresource_ns_dialogue_*`)로 도구상자에서 C자형을 우선 표시한다.
- 이전 `DialogueFile.scene`, `DialogueFile.button` 및 기타 16개 예전 블록 ID에는 `blockHidden=true`를 지정하여 도구상자 중복 노출만 줄인다. **함수·ID는 삭제하지 않는다.**
- 새 namespace 함수는 기존 `DialogueFile.*` 공개 API로 위임한다. Core의 중복 명령 문자열 생성 또는 새 AST를 만들지 않는다.

## 작성 예시
```typescript
DialogueFile.define("npc/intro", "1.20.80", function () {
    DialogueScene.scene(
        "intro",
        ResourceText.plain("안내자"),
        ResourceText.translate("dialogue.welcome"),
        function () {
            DialogueEvent.openSection(function () {
                DialogueEvent.sectionCommand("say welcome");
            });
            DialogueEvent.closeSection(function () {
                DialogueEvent.sectionCommand("say goodbye");
            });
            DialogueButton.button(ResourceText.plain("시작"), function () {
                DialogueButton.command("say clicked");
            });
        }
    );
});
```

- 위 코드는 기존 Resource AST 배열인 `onOpenCommands`, `onCloseCommands`, `buttons[].commands`에 매핑된다.
- C자형 이벤트·명령 공간은 Blockly가 모든 문장 블록을 물리적으로 연결할 수 있도록 생성한다. 잘못 넣은 Scene·Button 블록은 Resource Project/Validator에서 오류로 검사한다. **C자형에서 타입별 물리적 연결을 잠근 것은 아니다.**
- OPEN → CLOSE → BUTTON은 추천 작성 순서이나 C자형 편집기에 의해 위치 잠금이 강제되지는 않는다. JSON 필드 출력 순서는 기존 Codec이 정한다.
- 기존 `typedScene`/`openNone` 등의 타입 기반 블록은 대안(Alternatives)으로 남겨 화면이 복잡해지는 것을 완화한다. 기존 JavaScript 프로그램 호환성은 실제 MakeCode 화면에서 검증이 필요하다.

## 향후 Execute와의 연결 원칙 (이번 구현 범위 외)
- `execute as/at/positioned/rotated/facing/if/unless/run`을 조합하는 C자형 블록은 UI 콜백만 제공하고, AST 조항을 순서대로 축적하는 공통 Block Adapter에 연결한다.
- 조건 순서와 실행 주체·위치·차원 의미를 보존하며, 실제 Minecraft 버전별 문법은 Validator/Compiler가 담당한다.
- 기존 `player.execute()`, 행동팩 Script API, 실제 함수 문법은 구분한다.
- **실제 execute C자형 블록은 이 커밋에서 추가하지 않는다.** 별도 구현 및 실게임 검증 대상이다.

## 변경 및 검증
- 신규 파일: `src/blocks/dialogue_namespaces.ts` (PXT 파일 등록 필요하며 적용).
- 수정: `src/blocks/resource_blocks.ts`, `src/blocks/dialogue_scene_choices_blocks.ts`, `src/blocks/dialogue_scene_sections_blocks.ts`, `src/blocks/dialogue_typed_scene_blocks.ts`: 16개 옛 블록에 숨김 메타데이터만 추가.
- 신규 회귀 검사: `tests/DIALOGUE_NAMESPACE_REGRESSION.cjs`; 기존 Scene 4개 회귀 스크립트는 수정하지 않음.
- 소스 Git 객체와 Node API 모의 환경을 이용한 V8 검사: 새 namespace 4/4, 기존 Scene 관련 14/14 = 총 18/18 PASS.
- 검사 내용: 세 namespace 선언, 위임 시 함수 인수/순서 보존, PXT blockId 고유성 및 그림자 블록 참조, C자형 우선 그룹, 기존 블록 ID 보존.
- **미검증:** 전체 MakeCode/PXT 컴파일, 블록 도구상자 실제 표시, 기존 .blocks 열기·JavaScript 왕복, Minecraft Education 실제 실행. 이번 결과를 실게임 PASS로 기록하지 않음.
- `pxt.json.version`은 0.0.25, `targetVersions.target`은 2.2.14 유지. `main.blocks`, `main.ts`, 기존 브리지/행동팩은 변경 없음.

## 공식 PXT 근거
- https://github.com/microsoft/pxt/blob/master/docs/defining-blocks.md
- https://github.com/microsoft/pxt/blob/master/pxtblocks/loader.ts
