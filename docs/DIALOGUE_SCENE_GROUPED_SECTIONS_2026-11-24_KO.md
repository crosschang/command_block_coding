# Dialogue Scene OPEN/CLOSE/BUTTON 다중 C자형 UI 보완 (2026-11-24)

## 사용자 이미지와 목표
- 손그림의 의도: Scene의 내부에 OPEN, CLOSE, BUTTON이 세 구역으로 보이고 각 구역마다 명령 블록을 넣을 수 있는 UI.
- PXT 기본 조건문인 `만약/아니면`은 하나의 블록에 여러 statement input을 갖는 내장 Blockly mutator. **GitHub Extension 블록 주석과 핸들러 API만으로 동일한 한 개 블록을 만들 수 없음**. Microsoft MakeCode 개발진 설명 및 pxtblocks/loader.ts 확인.
- 구현 가능한 가장 가까운 구조는 기존 Scene의 C자형 슬롯 내부에 **OPEN 그룹, CLOSE 그룹, BUTTON 그룹(C자형)**을 각각 연결하는 방식. 새 선택지 +/− 값 입력 UI도 삭제하지 않음.

## 추가된 MakeCode 블록
- `DialogueFile.openSection(handler)` — OPEN C자형 하위 블록. 내부 `DialogueFile.sectionCommand(line)`은 `on_open_commands` AST에 저장됨.
- `DialogueFile.closeSection(handler)` — CLOSE C자형 하위 블록. 내부 `sectionCommand(line)`은 `on_close_commands` AST에 저장됨.
- 기존 `DialogueFile.button(name,handler)` — BUTTON C자형 하위 블록을 그대로 사용. 내부에는 기존 `DialogueFile.buttonCommand(line)`을 사용함.
- 기존 `DialogueFile.scene(...)`와 `DialogueFile.define(...)`, 추가된 `sceneChoices/ buttonChoice`, 모든 블록 ID·공통 AST·Compiler·Validator는 보존.

## 블록 작성 예시 (기존 Scene 안에 OPEN/CLOSE/BUTTON 연결)
```typescript
DialogueFile.define("npc/intro", "1.20.80", function () {
    DialogueFile.scene("intro", ResourceText.plain("Guide"),
        ResourceText.translate("dialogue.welcome"), function () {
            DialogueFile.openSection(function () {
                DialogueFile.sectionCommand("say dialogue opened");
                DialogueFile.sectionCommand("tag @initiator add entered");
            });
            DialogueFile.closeSection(function () {
                DialogueFile.sectionCommand("say dialogue closed");
            });
            DialogueFile.button(ResourceText.plain("Start"), function () {
                DialogueFile.buttonCommand("give @initiator minecraft:gold_ingot");
            });
        });
});
```

위 코드는 DialogueScene의 기존 `onOpenCommands`, `onCloseCommands`, `buttons[].commands` 배열로 각각 직렬화된다. OPEN/CLOSE는 명령을 정의하며 인게임에서 직접 실행하거나 게임이 설치하지 않은 JSON을 실시간 변경하지 않는다.

## 문맥 검사
- OPEN/CLOSE는 Scene 안에서만 유효. Button 안, 정의된 Scene 외부, 다른 OPEN/CLOSE 내부에서 실행하면 오류를 기록하고 해당 그룹 명령을 생성하지 않는다.
- `sectionCommand`는 활성 OPEN/CLOSE에서만 작동; 그룹을 벗어나면 오류를 기록.
- OPEN/CLOSE 그룹 안에 Button을 잘못 넣지 않도록 기존 addButton 검사를 보완.
- 사용자 프로그램의 이전 `DialogueFile.onOpen/onClose` 개별 명령 블록도 그대로 동작. 기존 파일의 자동 변환이나 뜻 변경을 강제하지 않는다.

## 변경 파일
- NEW: `src/blocks/dialogue_scene_sections_blocks.ts`, `tests/DIALOGUE_SCENE_SECTION_REGRESSION.cjs`.
- UPDATE: `src/project/resource_project.ts`, `pxt.json.files`.
- `pxt.json.version 0.0.25` 및 사용자 `targetVersions 2.2.14`, `main.blocks` 보존.
- 행동팩 생성/수정/푸시 없음.

## 검증
- 변경된 테스트 스크립트를 현재 Git 소스 blob에 대조하여 모의 Node V8 3개 회귀 테스트 PASS:
  1. OPEN/CLOSE handlerStatement=1 및 기존 블록 ID 보존
  2. OPEN 2개 명령과 CLOSE 1개 명령이 AST의 서로 다른 배열에 순서대로 저장
  3. Scene 바깥/중첩/버튼 안에서 잘못 배치한 콜백 호출 차단
- **미검증:** 실제 PXT/MakeCode Blockly 화면의 모양 및 Blocks→JavaScript→Blocks 왕복, Minecraft Education 실제 게임에서 JSON 실행.
- 새 블록의 C자형 그룹이 기본 조건문처럼 **한 덩어리**로 보인다는 뜻은 아님. 이는 후속 제작자 IDE의 독립 Editor 확장/커스텀 Blockly를 고려해야 하는 별도 고급 UI 요구사항으로 유지.

## 공식 자료
- https://forum.makecode.com/t/custom-block-with-javascript/13876
- https://forum.makecode.com/t/are-try-catch-statements-supported/19117
- https://github.com/microsoft/pxt/blob/master/pxtblocks/loader.ts
- https://learn.microsoft.com/ko-kr/minecraft/creator/documents/npcdialogue
