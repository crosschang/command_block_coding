# LANG / NPC Dialogue 전용 MakeCode 블록 — 1차 구현 (2026-11-24)

## 구현한 범위
- LanguageFile.define(locale, callback) / LanguageFile.entry(key,value,comment): 번역 파일 정의 블록
- DialogueFile.define(fileId,formatVersion,callback) / scene / button / onOpen / onClose / buttonCommand: 장면·버튼·명령 정의 블록
- ResourceText.plain / text / translate / translateWith / selector / score / join: 공통 RawText 정의 블록
- ResourceFiles.paths / text / diagnostics: 메모리에서 컴파일 결과 경로·내용과 진단을 살펴보는 블록
- Core: Resource AST → Validator → Codec → Project outputPlan. 기존 Command AST, FunctionFile, 실행 브리지는 별도 유지.
- 출력 계획: Resource Pack의 `texts/languages.json`, `texts/en_US.lang`, `texts/ko_KR.lang` 등; Behavior Pack의 `dialogue/*.json`.
- **이번 단계는 실제 파일 생성/팩 설치 구현이 아니라 AST 기반 콘텐츠와 내보내기용 문자열 출력까지다.** ResourceFiles.text()가 값을 반환하는 것을 Minecraft 설치 성공으로 표시하지 않는다.

## JavaScript 사용 예제
```typescript
LanguageFile.define("en_US", function () {
    LanguageFile.entry("npc.welcome", "Welcome!");
    LanguageFile.entry("npc.start", "Start");
});
LanguageFile.define("ko_KR", function () {
    LanguageFile.entry("npc.welcome", "환영합니다!");
    LanguageFile.entry("npc.start", "시작");
});
DialogueFile.define("npc/intro", "1.20.80", function () {
    DialogueFile.scene("welcome",
        ResourceText.plain("Guide"),
        ResourceText.translate("npc.welcome"), function () {
            DialogueFile.button(ResourceText.translate("npc.start"), function () {
                DialogueFile.buttonCommand("give @initiator minecraft:gold_ingot");
            });
        });
});
// ResourceFiles.paths() : 경로 목록 문자열
// ResourceFiles.text("dialogue/npc/intro.json") : 출력 내용 문자열
// ResourceFiles.diagnostics() : ERROR/WARNING/INFO 문자열
```

- 위 DEFINE 블록은 workspace 최상위에 배치. 명령을 게임에서 즉시 실행하는 이벤트가 아니며, 설치된 NPC의 장면을 변경하지 않는다.
- LANG은 키-값+탭+`###` 주석과 UTF-8 BOM 없는 텍스트를 생성한다. 영어 en_US가 없거나 키/로캘이 중복되면 ERROR로 파일 출력 차단.
- Dialogue JSON은 `minecraft:npc_dialogue.scenes`, `scene_tag`, `npc_name`, `text`, `on_open_commands`, `on_close_commands`, `buttons`를 생성한다. 기존 Parser로 알 수 있는 명령은 AST로, 미지원 명령은 Raw Command AST로 보존하며 JSON 내부 명령에 슬래시를 붙인다.
- 같은 의미로 LANG 번역 키를 RawText translate에 참조하고, 미등록 키에는 WARNING을 낸다.
- 과거 Education 동적 점수·Selector 표시 문제, `@initiator[...]`, 중첩 `execute ... @initiator` 문제는 원본 보존 + WARNING. 일반 선택자 필터 전체를 차단하지 않는다.
- JSON에는 현재 알려진 필드만 생성하며 **기존 JSON을 읽어 미인식 속성을 보존하는 역방향 Import는 아직 구현하지 않았다**.
- RawText의 `with`는 지금 문자열 인수 최대 2개(`translateWith`)를 직접 입력한다. RawText 객체를 넣는 복합 with는 이후 작업.
- 최신 Bedrock 스키마의 format_version 1.20.80 안내와 Education의 실제 지원 버전은 구분한다. 원하는 버전을 입력할 수 있으나 미검증이다.

## 변경/검증 범위
- 새 PXT TS: `src/project/resource_ast.ts`, `resource_codec.ts`, `resource_validator.ts`, `resource_project.ts`, `src/blocks/resource_blocks.ts`.
- `pxt.json.files` 5건 등록, `pxt.json.version` 유지, 사용자가 직접 변경한 `targetVersions` 및 `main.blocks` 보존.
- 정적 회귀 스크립트: `node --test tests/RESOURCE_LANG_DIALOGUE_REGRESSION.cjs`.
- 검증 완료: ResourceCodec 실제 함수 본문 11건 모의 검사에서 JSON parse·RawText·한글·LANG·escape·명령 접두사 모두 일치.
- 미검증: 위 Node 테스트의 실제 실행, 전체 PXT/MakeCode 블록 GUI, Behavior/Resource Pack 설치, 실게임 Dialogue/언어 변경, Script API Preview, Round-trip.
- 행동팩 코드/리소스는 GitHub에 추가하지 않음. 이후 행동팩은 설치 가능한 mcpack 파일로 별도 제공.

## 공식 참고
- https://learn.microsoft.com/en-us/minecraft/creator/documents/npcdialogue?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/reference/content/dialoguereference/examples/dialoguedefinitions/dialogue_document?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/documents/preparingrawtextforlocalization?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/reference/content/mctoolsvalreference/langfiles?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/reference/content/rawmessagejson?view=minecraft-bedrock-stable

## 2026-11-24 Scene / Button 연결 블록 보정
- 사용자 MakeCode 블록 사진에서 Scene와 Button은 둘 다 C자형 내부 공간이 있지만, Button 자체는 상단 이전-명령 연결 돌기가 없는 **이벤트/최상위 블록** 모양이었다. 따라서 Scene 내부에 Button을 꽂을 수 없었다. 이는 구현상의 UI 결함이며 JSON AST 중첩 구조와는 별개다.
- `DialogueFile.scene`와 `DialogueFile.button`에 **`//% handlerStatement=1`**을 적용한다. MakeCode PXT 디컴파일러는 이 설정을 일반 명령형(이벤트가 아닌 콜백 포함 문장)으로 다루며, 위/아래 연결을 갖는 C자형 블록을 의도한다. 기존 블록 ID·API·콜백 구조·AST·Codec은 변경하지 않는다.
- 기대 연결: `DialogueFile.define` 안에 여러 `scene`을 연결하고, 각 `scene` 안에 여러 `button` 및 열기/닫기 명령을 연결한다. 각 버튼의 내부 공간에는 `buttonCommand` 명령을 연결한다.
- **검증:** 변경 파일·메타데이터와 기존 AST/컨텍스트 검증 코드를 정적으로 확인했다. MakeCode 대상 `2.2.14`의 실제 블록 편집기에서 연결 모양, 연결 가능 여부, Blocks↔JavaScript 왕복을 새로 검증해야 한다. 핸들러 블록 메타데이터가 해당 PXT 버전에서 작동하지 않으면 별도 호환 경로 검토. 실게임 실행/행동팩은 변경 없음.
