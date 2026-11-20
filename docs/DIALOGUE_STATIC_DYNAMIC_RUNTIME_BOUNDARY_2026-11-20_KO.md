# Dialogue JSON 정적/동적 경계와 LANG·행동팩 연계 — 기능 감사 (2026-11-20)

## 범위·증거 수준
- 사용자 실게임 관찰: `dialogue.json`에서 **정적으로만 작동하는 기능이 있다**고 보고함. 어떤 필드·입력·출력이 해당되는지 이번 메시지에서 별도 테스트 원본을 확인하지 못했으므로 **항목별 FAIL은 미확정**. 해당 보고 자체를 삭제하지 않는다.
- 2026-11-20 업로드 명령어 `/help dialogue` 화면은 `dialogue open/change` 사용법을 보여 주지만 JSON의 정적/동적 기능 성공·실패를 증명하지 않는다.
- 과거 `PAST_RESEARCH_AND_HISTORY_ARCHIVE_2026-10-12.zip` 호환성 표는 `dialogue open scene: JSON scene PASS`(2026-10-07) 기록. 반면 `GPT_PROJECT_SOURCE_RECORD_C1_RIDE_AND_DIALOGUE_LANG_BACKLOG_2026-10-23.zip`은 사용자 정의 장면 및 행동팩 연계 *별도 미검증*이라고 판정. 서로 다른 시험·판정 범위를 혼동하지 않는다.
- GitHub `crosschang/command_block_coding`에서 현재 `Command.dialogue`는 Open/Change의 명령 AST/Compiler/Validator이며 JSON 정의 파일·LANG 블록은 구현되지 않았다. 기준 PXT `0.0.25`; 이 문서만 추가하고 기존 동작은 변경하지 않는다.

## 정적 파일과 동적 동작 분리
1. **정적 리소스 정의:** `DialogueFile.define`(제안 API)에서 scene_tag, NPC 이름, 본문, 버튼, on_open/on_close 명령을 모델로 구축해 `dialogue/*.json`을 출력한다. `LanguageFile.define`(제안 API)에서 locale 및 번역 키/텍스트를 구축해 리소스팩 `texts/*.lang`과 `texts/languages.json`을 출력한다. 파일 생성은 Compiler/Exporter 담당이며, Preview 전송만으로 팩 내부 JSON/LANG 파일이 새로 생성된다고 하지 않는다.
2. **동적 명령 제어:** 미리 설치한 scene_tag 사이의 `dialogue open/change`, 버튼 명령 및 `@initiator`의 NPC 문맥 전환은 공식 Bedrock 문서상 지원. 이는 장면 파일 자체를 실시간 수정하는 것과 다르다.
3. **동적 대사 데이터:** 공식 Bedrock DialogueDesigner 문서는 RawText의 `score`를 포함한 동적 데이터, `translate`와 locale 변환을 설명한다. 그러나 **Education 개별 버전과 각 Dialogue 필드의 렌더링 시점·Selector 필터 `[]` 동작은 미검증**. 실제 게임 실패/지연을 억지 성공 처리하지 않는다.
4. **동적 UI/조건부 구성:** 런타임에 임의 버튼·구성 요소를 추가·삭제해야 한다면 `@minecraft/server-ui`의 ActionFormData 등 별도 대안 설계가 가능하지만, 정식 NPC Dialogue와 동일 UI/명령 문맥이 아니다. Education에서 사용 가능성, 버전, 이벤트·응답·플레이어 분리를 확인하기 전 완료 표시하지 않는다.
5. **프리뷰 모드:** (A) 정의된 JSON의 **정적 편집기 Preview**, (B) 설치된 실제 NPC 장면을 `dialogue open`으로 호출하는 **실게임 Preview**, (C) 행동팩 UI로 재현하는 **동적 UI 실험**을 별도 선택·판정한다. 각 모드가 지원하지 않는 속성을 실시간 기능인 양 속이지 않는다.

## 기능별 검증 원장 초안
| 기능 | 공식 Bedrock 근거/상태 | Education 26.32 세부 실게임 판정 |
|---|---|---|
| scene_tag/버튼/장면 본문 | 행동팩의 JSON 정적 장면 | 특정 필드 독립 검증 필요 |
| `dialogue open/change` | 설치 장면 호출/전환 | 과거 일부 PASS, 최신 기능 전수는 미검증 |
| on_open/on_close/button commands | JSON에 사전 기입한 명령을 상호작용 시 실행 | 원본과 결과 증거를 연결한 테스트 필요 |
| `@initiator` | 공식 문서상 NPC Dialogue 전용 | 대상·조건 `[]` 조합 별도 실게임 확인 |
| `translate`/LANG | 리소스팩 언어 키 참조 | 언어 파일 적용·폴백·번역 치환 미검증 |
| RawText `score` / `selector` | RawText 동적 데이터 공식 지원 | NPC 속성별 평가 타이밍 및 업데이트 여부 미검증 |
| 런타임 버튼 추가·삭제, 동적 scene JSON 쓰기 | 명령 호출과는 다른 동작; 공식 정식 파일 런타임 갱신 API 확인 안 됨 | 구현 및 검증 전 |
| Script API의 별도 UI | `@minecraft/server-ui` API 공식 문서 있음 | Education 사용·기본 팩과 병행 가능성 미검증 |

## 실패 기능 회수: spawnpoint 등
- 현재 `commands/spawnpoint.ts`/블록/Validator/Compiler에 `spawnpoint`, `clearspawnpoint`, `setworldspawn` 구현 존재. 중복 생성 금지.
- 기존 Education 26.32 과거 기록: `spawnpoint` 절대좌표 Preview DIRECT PASS, 좌표 생략·상대좌표 Preview FAIL, `clearspawnpoint`·`setworldspawn` 대표 DIRECT PASS. 현재 `src/preview/runtime_dispatcher.ts`는 생략/상대 변형을 BridgeCandidate(후보)로 분류하지만 **브리지 성공 증거 아님**.
- 후속 작업: SPAWNPOINT의 직접 명령/MakeCode Preview/행동팩 브리지/실제 mcfunction 결과를 별도 검증. 원래 위치·실행 주체·대상 의미 보존, 원본 AST 재작성 금지. 별도 Script API 경로는 공식 API·Education 버전 확인 후 평가.
- `summon` orientation, Modern `execute`, 출력이 숨겨진 조회 명령, `ZERO_RESULT` 등 예전 FAIL/MIXED도 그대로 기능 회수 목록에 남긴다. 실행 시간 최적화는 정확성·기능 구현 후.

## 필수 설계/출하 게이트
- 미지원 필드·JSON 추가 속성·Custom ID는 입력에서 원본을 보존하고, 편집 결과를 저장할 때도 소실하지 않는다.
- MakeCode Blocks → Resource AST → Parser/Validator/Compiler → 리소스 파일 → 설치 팩, 역방향 파일 → AST → Blocks 경로를 분리 검증한다.
- Dialogue/LANG 정의 블록은 실행 명령 블록과 다르게 무부작용 정의 단계에서만 자료를 저장한다.
- 새 파일 작성 시 `pxt.json.files` 등록, `pxt.json.version` 보존. 행동팩 소스는 GitHub에 올리지 않으며 설치 가능한 `.mcpack`으로 별도 제공한다.
- **검증한 것:** 기존 보존 아카이브/명령어 스크린샷/현재 GitHub 기록과 공식 문서 정적 대조. **미검증:** 이번 변경 후 PXT 빌드, 새로운 NPC 대화 실게임, LANG 치환, 동적 UI, spawnpoint 재시험.

## Microsoft 공식 참고
- https://learn.microsoft.com/en-us/minecraft/creator/documents/npcdialogue?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/documents/npcdialoguedesigner?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/reference/content/rawmessagejson?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-ui/minecraft-server-ui?view=minecraft-bedrock-stable
