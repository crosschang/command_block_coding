# Dialogue Scene 선택지 (+/−) 블록 1차 구현 (2026-11-24)

## 요청과 구현 범위
- 사용자는 Scene을 MakeCode의 '만약–아니면'처럼 +로 선택지 개수를 늘리는 형태로 개선하길 요청했다.
- Education 공식 NPC 가이드에서는 최대 6개 버튼을 안내한다. 이 프로젝트에서는 현재 Scene 선택지 입력을 1~6개로 제공한다.
- PXT의 `expandableArgumentMode=enabled` 및 `||` 지원을 이용해 +/− 선택 입력을 추가·숨긴다. 이는 기본 `controls_if`의 'C자형 조건별 statement 분기 추가'를 완전히 복제한 것은 **아니다**.

## 구현된 블록과 보존
- `DialogueFile.sceneChoices(...)`: 첫 버튼 입력과 선택 버튼 2~6. +로 입력 칸을 하나씩 추가한다.
- `DialogueFile.buttonChoice(...)`: 버튼 이름(RawText 공통 값), 첫 명령, 선택 명령 2·3까지. 별도 +로 입력 칸을 추가한다.
- 이전 `DialogueFile.scene(...)` 및 `DialogueFile.button(...)`와 블록 ID는 모두 유지한다. 기존 C자형 내부 명령 공간에는 제한 없이 Button 및 buttonCommand를 직접 배치할 수 있다.
- 새로운 빠른 작성 방식은 1~6개의 버튼과 버튼당 1~3개 명령에 적합하다. onOpen/onClose나 더 많은 명령이 필요한 장면은 기존 C자형 Scene을 사용한다.
- 기존 코드를 삭제하거나 MakeCode/PXT 프로젝트 구조를 바꾸지 않는다.

## Core 연결 및 의미
- 새로운 `MCFunctionResourceProject.createButtonChoice`는 기존 Parser로 각 명령을 AST로 변환한다. 미지원 명령은 Raw로 원문 보존.
- `MCFunctionResourceProject.addSceneChoices`는 입력 순서로 `DialogueScene.buttons`에 추가하며 공통 Validator와 JSON Codec을 그대로 사용한다.
- 편집기가 명령 실행·파일 저장·팩 설치를 자동 처리하지 않는다. `ResourceFiles.outputPlan()`은 여전히 메모리 출력 계획이며 실제 파일 생성/실게임 실행은 미구현.

## 테스트
- 새로운 TypeScript 파일: `src/blocks/dialogue_scene_choices_blocks.ts`, 기존 `src/project/resource_project.ts` 확장, `pxt.json.files` 등록.
- 새로운 회귀 검사: `tests/DIALOGUE_SCENE_CHOICES_REGRESSION.cjs`.
- 실제 변경 소스의 함수 본문과 AST 스텁을 사용한 모의 검사 8건 PASS.
- 새 회귀 스크립트 4개 테스트를 V8에서 가상 Node 파일 시스템으로 실행: 4건 PASS. 이는 PXT 빌드 및 실제 MakeCode 편집기 동작 검증과 다르다.
- 미실행: 전체 MakeCode/PXT 빌드, 실제 +/− UI, Blocks↔JavaScript 왕복, 실제 Minecraft Education 파일 로딩·버튼 실행.
- `pxt.json.version=0.0.25` 유지 및 사용자가 변경한 targetVersions와 main.blocks 보존.

## 공식 참고
- https://makecode.com/defining-blocks
- https://github.com/microsoft/pxt/blob/master/pxtblocks/loader.ts
- https://github.com/microsoft/pxt/blob/master/pxtblocks/composableMutations.ts
- https://edusupport.minecraft.net/hc/en-us/articles/360047555651-Adding-Non-Player-Characters-NPCs
