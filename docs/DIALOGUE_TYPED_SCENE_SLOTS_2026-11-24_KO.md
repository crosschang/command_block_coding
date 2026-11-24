# Dialogue 고정 타입 슬롯 및 '없음' 블록 — 2026-11-24

## 요청 및 디자인
- 사용자는 Scene 내부에 Scene·Button 등 잘못된 블록을 끼울 수 있는 문제를 제기했고, **OPEN → CLOSE → BUTTON 순서 고정 및 슬롯별 타입 연결**을 선택했다.
- 후속 요청인 **기능이 없는 경우를 명시할 수 있는 블록**도 제공한다.
- 새 `SCENE (typed)` 블록은 OPEN, CLOSE, BUTTON 1 순서를 고정하며, BUTTON 2~6 입력은 MakeCode `+`/`−`로 선택적으로 표시한다.
- `OpenSlotValue`, `CloseSlotValue`, `ChoiceValue`를 별도 타입으로 사용한다. OPEN/CLOSE 클래스에 서로 다른 openSlotKind/closeSlotKind 속성도 부여해 타입상 실수로 교차 연결되지 않게 한다.

## NONE (없음) 블록의 동작
- `DialogueFile.openNone()` → OPEN 없음: 빈 명령 배열. JSON에 `on_open_commands`를 만들지 않음.
- `DialogueFile.closeNone()` → CLOSE 없음: 빈 명령 배열. JSON에 `on_close_commands`를 만들지 않음.
- `DialogueFile.buttonNone()` → BUTTON 없음: 버튼 정보 없음. JSON의 `buttons` 배열에 빈 버튼을 추가하지 않음.
- 세 블록 모두 자기 타입의 연결 슬롯에 사용할 수 있으며, Scene 기본 그림자 블록으로 노출한다.
- 버튼 1이 없음이더라도 버튼 2 이후에 정상 버튼이 연결되면 정상 버튼만 순서대로 기록한다.

## MakeCode JavaScript 예시
```typescript
DialogueFile.define("npc/intro", "1.20.80", function () {
    DialogueFile.typedScene(
        "intro",
        ResourceText.plain("안내자"),
        ResourceText.translate("npc.welcome"),
        DialogueFile.openNone(),
        DialogueFile.closeNone(),
        DialogueFile.buttonNone()
    );
});
```

OPEN에서 명령을 실행하려면 `DialogueFile.openSlot("say hello")`로 바꾸고, 버튼을 추가하려면 `DialogueFile.buttonChoice(...)` 블록을 연결한다.

## 기존 기능과 제한
- 기존 `Scene`/`Button` C자형 및 `Scene choices` 블록을 제거하지 않는다. 원래 블록 ID·AST·Codec·브리지도 유지한다.
- 타입 연결 슬롯은 값 입력칸이다. `만약–아니면`처럼 하나의 블록에 C자형 명령 영역을 여러 개 직접 생성하는 기능과는 다르다.
- OPEN/CLOSE 입력 명령은 각 최대 4개, Button Choice는 최대 3개 명령을 GUI에서 지원한다. 더 많은 명령은 기존 C자형 블록 또는 `function` 명령으로 작성 가능.
- `ResourceFiles.outputs()`는 메모리의 파일 내용/경로 계획이며 실제 .lang·.json 저장, .mcpack 생성, 실게임 설치는 아직 구현하지 않았다.

## 검증 수준
- 파일: 신규 `src/blocks/dialogue_typed_scene_blocks.ts`, 수정 `src/project/resource_project.ts`·`pxt.json.files`, 신규 `tests/DIALOGUE_TYPED_SCENE_REGRESSION.cjs`.
- 실제 변경 소스 blob을 사용한 V8 가상 Node 회귀 검사 4/4 PASS: 슬롯과 NONE 블록 구조, 전체 없음 처리, 혼합 버튼 순서, 잘못된 Scene 사용 위치.
- **미검증:** 전체 MakeCode/PXT 빌드, 실제 블록 편집기의 타입 연결 제한/그림자 표시, Blocks↔JavaScript 왕복, Minecraft Education 실행. 타입 선언만으로 화면 차단이 실증됐다고 하지 않는다.
- `pxt.json.version`은 0.0.25로 유지하고 기존 `targetVersions`, `main.blocks`, 행동팩은 변경하지 않는다.

## 공식 참고
- https://makecode.com/defining-blocks
- https://github.com/microsoft/pxt/blob/master/pxtblocks/loader.ts
- https://github.com/microsoft/pxt/blob/master/pxtblocks/composableMutations.ts
