# Dialogue / Language Resource 통합 로드맵 (2026-11-20)

## 0. 목표와 현재 판정
- 사용자 결정: 완성할 기능을 우선 구현하고, 마지막에 통합 실게임 성능 최적화를 수행한다. 다만 의미 손실·컴파일 오류·중복 실행은 개발 중에도 즉시 검증한다.
- 현재 GitHub master 기준 PXT 0.0.25. 기존 C1 `DialogueCommand` AST, `dialogue open/change` 블록, Validator/Compiler 경로는 있으나 이는 **명령 실행 정의**에 한정된다.
- `dialogue/*.json` 장면 파일과 `texts/*.lang` 및 `texts/languages.json`의 프로젝트 차원 입력/가져오기/내보내기는 확인된 완료 구현이 없다.
- 원래 Converter 목표는 여전히 미완성이다. 이번 문서는 설계·작업 순서만 변경하며, 별도의 런타임 지원 성공을 의미하지 않는다.

## 1. Project Resource 모델
파일 종류별 AST/리소스 모델을 구분한다. 명령 의미의 기준은 기존 `MCFunctionAST`이며, Dialogue와 언어 리소스도 독립된 구조화 모델을 만들고 프로젝트에서 참조한다.

```text
MakeCode Blocks / imported source
  ├─ FunctionFile -> MCFunctionAST -> Validator/Compiler -> functions/*.mcfunction
  ├─ DialogueFile -> DialogueDocument / Scene / Button
  │     └─ RawText + on_open/on_close/button Command AST or preserved raw -> dialogue/*.json
  └─ LanguageFile -> LanguageDocument / Entries -> texts/*.lang
                      └─ Language Catalog -> texts/languages.json

Project references -> scene_tag / translate key / locale mapping
.mcblock/project.json -> 블록 좌표, 연결과 UI 상태만 별도 저장
```

**프로젝트 원본과 게임 팩 출력 구분:** 위 구조는 논리적인 프로젝트 모델이며, 최종 `dialogue/`와 `functions/`는 행동팩, 번역용 `texts/`는 리소스팩으로 배치하도록 계획한다. 행동팩/리소스팩 manifest, 의존성, 사용 버전, 설치 방식은 출력 단계에서 별도 생성·검증한다. 행동팩 파일·전용 소스는 GitHub에 커밋/푸시하지 않고 설치 가능한 .mcpack으로 제공한다.

## 2. Dialogue JSON 구현 범위
- `DialogueFile.define(fileId, ...)` 같은 프로젝트 수준 정의 블록을 제안하며, 기존 `Command.dialogue` 명령과 혼동하지 않는다.
- `scene_tag` 필수, `npc_name`, `text`는 일반 문자열 또는 공통 RawText로 표현한다.
- `on_open_commands`, `on_close_commands`, `buttons[].name`, `buttons[].commands` 지원.
- 버튼 명령은 순서를 보존하며, `@initiator`는 NPC 장면 문맥의 지원 여부와 보존 범위를 별도로 처리한다. 일반 명령 Selector로 무조건 확대하지 않는다.
- 장면 참조/이동 및 중복 `scene_tag`/미정의 ID 진단. `dialogue change`가 장면을 변경하는 동작과 `dialogue open` 표시를 구분한다.
- **역방향** JSON 원본을 읽을 때 아직 인식하지 못하는 속성/미래 스키마를 임의 삭제하지 않는다. 미편집 원문 보존을 우선하며 편집 후 알려지지 않은 필드 보존 전략을 검사한다.
- JSON `format_version`은 대상 환경별 프로파일로 관리한다. 공식 튜토리얼의 1.17 예제와 2026-03-05 갱신된 스키마 문서의 1.20.80+ 안내를 무조건 같은 규칙으로 합치지 않는다. Education 26.32 실제 호환성은 미검증.

## 3. Language / RawText 구현 범위
- `LanguageFile.define(locale, ...)`, `LanguageEntry(key, value)`와 같은 정의 기반 편집을 목표로 한다.
- 언어별 키-문장 사전, 주석, 빈 줄, 동일 키 충돌 감지, 번역 누락, 중복 locale 및 직접 입력 키 처리.
- `texts/languages.json`의 모든 locale마다 해당 .lang 파일이 존재하고 반대 방향도 확인. 기본 `en_US` 포함 여부를 검증. `ko_KR` 별도 지원.
- 리소스팩용 `.lang` 출력은 공식 로컬라이제이션 가이드의 UTF-8 **BOM 없음** 규칙을 적용한다. 입력은 변경 없이 보존하는 정책과 게임에 유효한 출력 정규화 정책을 분리한다.
- 공통 RawText AST/Compiler/Parser: `text`, `translate`, `selector`, `score`, `with`. `tellraw`/`titleraw`와 Dialogue 화면을 공유한다.
- `%s`, `%%1`, `%%2` 치환은 공식 설명대로 인수 위치를 보존하고 누락 인수를 진단한다. `with` 문자열 배열/RawText 객체의 차이, 동적값 Evaluation 여부는 실제 버전별로 검증한다.
- 문자열 ID는 임의로 번역·치환하지 않는다. 사용자 정의 이름공간 허용, 충돌/미정의 키 경고와 런타임 지원 여부를 구분한다.
- 일반 텍스트/RawText/번역 항목의 Preview를 구분하여, 실제 Education 언어 설정에 따른 표시를 확인하기 전 PASS 처리하지 않는다.

## 3-1. Dialogue 조건/동적 표시 호환성 이슈 (기능 완성 대상)
- `DIALOGUE_INITIATOR_FILTER_CONTEXT`: NPC Dialogue에서 `@initiator[]` 조건 적용 문제를 별도 추적한다. 현재 직접 `@initiator[tag=...]` 실패 증거는 없으므로 **재현 필요**. 디지털 리터러시맵에서 확인된 것은 **중첩 `execute ... run tag @initiator` FAIL**이며 서로 다른 입력이다.
- `DIALOGUE_EXECUTE_INITIATOR_NESTED`: 같은 `@s[tag=computer1]` 조건의 `run say`는 성공, `run tag @initiator ...`는 과거 FAIL. NPC 실행 문맥 Validator의 WARNING 및 Raw 원문 보존을 구현한다.
- `DIALOGUE_DYNAMIC_SCORE_RENDER`: 마인마블에서 Dialogue 동적 Score/Fake Player 표시 실패 관찰이 있다. 점수 조건 판정은 Function과 구분하며, 정적 Scene·Tellraw/Actionbar 우회를 편집기 옵션으로 설계한다.
- `DIALOGUE_DYNAMIC_SELECTOR_RENDER`: 플레이어 이름 동적 표시 문제를 개발 과제로 등록하되, 문서상 직접 RawText `selector` 재현은 미확인. 공통 RawText는 삭제·차단하지 않고 사용 위치별 WARNING과 검증 기록으로 처리한다.
- 위 항목들은 LANG/Dialogue 블록 및 브리지 Preview 완성 범위에 포함하되, **게임용 JSON/언어 파일을 전송만으로 갱신할 수 있다고 가정하지 않는다**. 정확성 중심 경로의 기능 구현 후 통합 게임 테스트·성능 최적화를 시행한다.
- 증거 출처 및 세부 재현 매트릭스: `docs/NPC_DIALOGUE_SELECTOR_RAWTEXT_EVIDENCE_2026-11-20_KO.md`.

## 4. 설계/기능 구현 순서
1. 공통 RawText AST / JSON compiler / 보수적 역파서 (C4) + 기본 편집 블록.
2. LanguageDocument AST / parser / compiler / `languages.json` catalog / Validator / 블록 정의. 예시 입력과의 Round-trip.
3. DialogueDocument/Scene/Button AST / parser / compiler / Validator / 정의 블록. 기존 `Command.dialogue`와 `scene_tag` 연결.
4. 프로젝트 레퍼런스 검사 (scene/tag/translate/locale) 및 입력 불명 항목의 Raw 보존.
5. `functions/*.mcfunction`, `dialogue/*.json`, `texts/*.lang`의 내보내기·가져오기와 MakeCode JS↔Blocks 변환 연결.
6. 행동팩·리소스팩 분리 생성과 실제 게임 설치 검증, 언어 전환/버튼/중첩 대화/멀티플레이 검증.
7. 최종 성능 최적화, 지연 분석, 대규모 파일 통합 검사.

## 5. 검증 구분 및 기존 실행 브리지 보호
- 정적: JSON parse, AST 역변환, 사용자 정의 키/scene 원문 보존, 스키마 필수 항목/중복 검사.
- 모의: 여러 언어 번역 참조, 미지원 RawText 보존, 단계별 출력, 선택지 분기, 프로젝트 참조/파일 왕복.
- 실게임: Minecraft Education에 실제 팩 설치 후 장면 열림·버튼 명령·@initiator·lang 변환·인코딩/언어 전환·팩 의존성 확인.
- 이전 0.0.7 PROGRESS_DIAG 행동팩, NativePlayerAck, ACK/nonce, ZERO_RESULT 기록은 유지한다. Dialogue/lang의 구현을 위해 브리지의 전송 의미·속도 경로를 임의로 변경하지 않는다.
- PXT `pxt.json.version`은 사용자가 직접 관리한다. 새 TS가 생길 경우에만 `pxt.json.files` 등록을 확인한다.

## 6. Microsoft 공식 근거 (Bedrock 문서; Education 별도 검증)
- NPC Dialogue Guide: https://learn.microsoft.com/en-us/minecraft/creator/documents/npcdialogue?view=minecraft-bedrock-stable
- Dialogue current schema: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/dialoguereference/examples/dialoguedefinitions/dialogue_document?view=minecraft-bedrock-stable
- DialogueDesigner / resource pack translation: https://learn.microsoft.com/en-us/minecraft/creator/documents/npcdialoguedesigner?view=minecraft-bedrock-stable
- Raw Message JSON (`%%1`, `%s`, `with`): https://learn.microsoft.com/en-us/minecraft/creator/reference/content/rawmessagejson?view=minecraft-bedrock-stable
- Language validation catalog: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/mctoolsvalreference/langfiles?view=minecraft-bedrock-stable
- Localization .lang encoding: https://learn.microsoft.com/en-us/minecraft/creator/documents/preparingrawtextforlocalization?view=minecraft-bedrock-stable
