# NPC Dialogue Selector [] / RawText 동적 출력 — 근거 대조 (2026-11-20)

## 확인 범위와 결론
- 기준 GitHub: crosschang/command_block_coding master, PXT 0.0.25. 소스 변경 없이 문서 연구만 수행.
- 사용자 제공 `Minemarble_Dialogue_Research_KO.md` (2026-11-13, 프로젝트 내부 실험 정리): NPC 대화에 fake-player Scoreboard의 건설비·잔액 동적 표시 실패; 동일 값의 계산 및 Tellraw 출력 정상. 닉네임과 건물 상태를 Selector로 NPC 본문에 직접 표시하는 방식은 미채택. `translate + with`의 정적 줄바꿈/텍스트는 유지. 이 기록은 Education 사용 사례이지만 정확한 클라이언트 빌드 및 모든 조건형 `[]`의 테스트 로그를 뜻하지 않는다.
- 같은 자료에서 NPC를 `@e[type=minecraft:npc,tag=mm_system_npc,c=1]`로 지정해 대화 열기, Scene 버튼 내 `@initiator` 사용, 다중 Scene 분기/6버튼 성공 사례 기록. **이로써 NPC 대상 선택자 `[]` 전체가 고장 났다고 할 수 없음.**
- Microsoft 공식 Target Selectors는 `tag`, `scores` 등 `[]` 조건을 기술하며, NPC Dialogue 문서에서는 `@initiator`를 NPC 컨텍스트 한정 선택자로 설명한다. Raw Message JSON은 `selector`, `score` 컴포넌트를 정의하고 DialogueDesigner 공식 문서는 NPC Raw JSON 본문에서 Scoreboard 동적 출력이 가능하다고 설명한다.
- 따라서 **명령의 실행 대상 Selector 조건**, **NPC JSON 버튼 명령 안의 Selector 조건**, **NPC UI RawText 본문 안의 Selector/Score 컴포넌트**, **`@initiator` + 조건 `[]` 조합**을 다른 검증 경로로 취급한다.
- Mojang 공식 Mojira에서 NPC/Dialogue/RawText/Scoreboard/Selector 키워드로 검색했으나 현재 접근된 공개 검색 결과로는 위 현상을 직접 재현하는 특정 MCPE 이슈 번호를 확인하지 못했다. 검색 결과의 MCPE-163092(닫기 버튼 2개) 및 MCPE-229540(안드로이드 NPC 대사 편집 불가)은 **서로 다른 현상**이므로 동일 버그 증거로 인용 금지.
- **정확한 원인(파서·렌더러·실행 컨텍스트·Education 차이)은 미확정.** 공식 Bedrock 명세를 Education 실게임 PASS로 승격 금지.

## 사용 위치별 보존·지원 정책
| 사용 위치 | 판정 | IDE 처리 |
|---|---|---|
| `/dialogue open @e[type=npc,tag=...]` | 대상 지정 문법 공식 지원 + 프로젝트 사용 사례 | 조건 `[]`을 보존하고 정상 Selector AST 처리 |
| JSON `buttons[].commands` 내 `@initiator` | 공식 NPC 문맥 지원, 프로젝트 일부 Runtime PASS | NPC 명령 문맥만 허용. `@initiator[...]`은 별도 미검증 |
| JSON `text` RawText `selector` / `score` | 공식 기능 서술은 존재, Education 프로젝트는 미표시 경험 | 구조·원문 보존, Education 경고/지원 검증 필요 |
| `tellraw` / `titleraw` RawText `selector` / `score` | Microsoft 공식 명령 기능 | 공통 RawText AST 재사용, 채널별 검증 구분 |
| 번역 `translate + with` 정적 입력 | 프로젝트 Runtime 기록 있음 | 지원 유지; 동적 필터의 실패와 혼동 금지 |
| JSON 화면의 실시간 버튼 구성 변경 | 정식 파일 방식과 다름 | 설치된 정적 Scene·명령 분기 우선, 동적 UI는 독립 후보 |

## 2026-11-20 추가 증거: 디지털 리터러시맵 NPC 중첩 `@initiator`

**출처 및 확인 경계:** 사용자 제공 `Digital_Literacy_Map_Dialogue_Selector_Findings_KO.md` (2026-11-20). 이 문서는 과거 채팅과 `리터러시 클래스 룸(2).mcworld` 분석을 정리한 **2차 연구 자료**다. 본 병합에서는 월드 자체를 새로 재실행/독립 분석하지 않았으며, 과거 실험 기록을 현재 버전의 재현 PASS/FAIL로 승격하지 않는다.

### 같은 NPC 조건에서 분리된 실제 시험 (2026-05-20 기록)

```mcfunction
execute if entity @s[tag=computer1] run say 작동함
# 정상 출력

execute if entity @s[tag=computer1] run tag @initiator add examination_1
# 플레이어에게 examination_1 태그 미등록
```

이 비교는 **`@s[tag=computer1]` 조건 자체가 정상**이라는 근거다. 실패 후보는 NPC Dialogue 문맥 안에서 `execute ... run` 이후 상호작용자 `@initiator`로 명령을 실행하는 **중첩 조합**이다. 엔진 원인, 지원 범위 및 다른 버전 전체의 실패는 확정되지 않았다. 한편 이 자료에는 `tag @initiator add tmp_exam_target_day2/day5` 형태의 **직접 명령 사용**이 실제 우회 구현으로 존재한다. 따라서 `@initiator` 전체를 금지해서도 안 된다.

### 실제 우회 구조 (2일차/5일차)

- `dialogue/class2.json` 및 `dialogue/class5/class5.def.json`에서 상호작용자 `@initiator`에게 `tmp_exam_target_day2` / `tmp_exam_target_day5` 임시 태그 부여.
- NPC를 `@s`로 유지한 채 `execute as @s run function class2/class_presetting` 등 외부 함수를 호출.
- 외부 `.mcfunction`에서 `execute at @s if entity @s[tag=computerN,tag=npc_dayN]`로 NPC 조건 확인 후 `@a` 또는 `@p`의 임시 태그·거리 `r=3` 조건으로 플레이어 재선택.
- 마지막으로 임시 태그 제거. 15 NPC/15 참가자 및 점수 0~4에 맞춰 75개의 명시적인 `dialogue open` 분기가 생김.
- **동시 접속 주의:** 임시 태그와 근접 조건만으로 플레이어를 복원하는 구조는 여러 참가자의 동시 조작·거리 중복에서 수신 대상이 섞일 수 있다. 새 편집기에서 이 우회를 무조건 안전한 정식 자동생성으로 제공하지 말고 멀티플레이 충돌 검사·요청 분리 후 적용한다.

### 기능별 판정의 재분류

| 입력 위치·행동 | 새 자료의 판정 | IDE 설계 |
|---|---|---|
| NPC 문맥 `@s[tag=computer1]` 조건 검사 | 같은 조건의 SAY 경로 성공 기록 | Selector `[]`을 일반 금지하지 않음 |
| NPC Dialogue 버튼의 직접 `tag @initiator ...` | 우회 정의에 사용됨; 단독 전수 검사와 동일시 금지 | NPC 전용 실행 문맥 유지 |
| NPC `execute if entity @s[tag=...] run tag @initiator ...` | **과거 실게임 FAIL** (태그 미등록) | 원형 보존 + Education 호환성 경고; 변환 중 자동 의미변경 금지 |
| NPC `execute ... run say ...` | **과거 실게임 PASS** | 해당 조합의 근거만 남김 |
| JSON 본문 RawText `selector` | 디지털 리터러시맵 조사에서는 **직접 테스트 증거 없음**; Dialogue JSON 36개에서 사용 0건 | RawText AST 보존·별도 검증 |
| JSON 본문 RawText `score` | 디지털 리터러시맵: 조건 분기와 값 표시 기능 혼동 금지. **마인마블에서는 동적 점수 표시 불안정 경험 있음** | 프로젝트·명령 문맥별로 분리 기록 |
| `scores={score=...}` 조건으로 정적 Scene 선택 | 실제 월드 구조에 반영된 15자리×5단계 분기 | Function 조건 처리 + Scene 정적 분기 재사용 |

### 명령/블록 구현에 추가할 비파괴적 요구사항

1. `DialogueFile`은 정적 Scene 정의 블록과 명령 실행 블록을 분리한다.
2. 명령 의미를 보존하는 AST/Compiler와 별개로 `DialogueExecutionContext`(개념 설계; **아직 실제 API 아님**)를 두어 **NPC 직접**, **Execute 중첩**, **외부 Function**, **일반 MakeCode**, **행동팩 Preview** 각각의 실행 문맥을 검증한다.
3. `@initiator`가 `execute run` 내부에서 사용되면, Education 검증이 없는 한 WARNING을 내고 정확한 런타임 사용 문맥을 요구한다. 전체 Selector 제한, Raw 강제 변환 또는 몰래 `@p`로 바꾸는 동작 금지.
4. 호환성 우회 블록 후보는 `상호작용자 표시(임시 태그)` → `NPC 조건 검사` → `대상 확인` → `해제` 단계를 명시하되, 충돌·중복 대상·태그 정리 실패를 구분하고 실게임 검증 전 정식 PASS 처리하지 않는다.
5. 프로젝트/버전별 기록은 정적 검사, 과거 사용자 실게임 기록, 신규 실게임 재현을 각각 분리. 공개 Mojira 이슈 번호는 이번 자료에도 없으므로 **특정 공식 버그와 동일하다고 확정하지 않는다**.

## Dialogue 호환성 이슈 등록 (2026-11-20 사용자 보완 요청)

**기록 원칙:** 사용자가 지적한 세 가지 문제를 모두 추적 대상으로 등록한다. 그러나 재현하지 않은 입력에 확정 FAIL을 부여하지 않는다. `[]`는 일반 Selector 필터와 `@initiator` 필터, 명령 실행의 Selector와 Dialogue RawText 표시의 Selector를 구분한다.

| 이슈 ID | 사용자 문제 제기 / 관찰 | 현재 증거 수준 | IDE 대응 |
|---|---|---|---|
| `DIALOGUE_INITIATOR_FILTER_CONTEXT` | Dialogue에서 `@initiator[]` 조건이 제대로 적용되지 않는 문제 | **재현 필요.** 디지털 리터러시맵에서 확인된 FAIL은 `execute if entity @s[tag=computer1] run tag @initiator add examination_1`이며, 이 명령의 `@initiator`에는 `[]`가 없다. `@initiator[tag=...]` 직접 검사 결과는 없음 | NPC 전용 Selector 문맥을 구별하고 조건 필터를 삭제하지 않음. 복합 컨텍스트 사용 시 WARNING 및 실게임 확인 |
| `DIALOGUE_EXECUTE_INITIATOR_NESTED` | Dialogue에서 `execute`를 거쳐 `@initiator`에게 태그 부여 실패 | **과거 사용자 실게임 FAIL 기록 있음.** 동일 `@s[tag=computer1]` 조건 아래 `run say`는 성공 | 별도 호환성 WARNING, `@s` 실행 문맥 보존, 원본 명령 자동 변경 금지 |
| `DIALOGUE_DYNAMIC_SCORE_RENDER` | NPC 대화문에 동적 Scoreboard/Fake Player 점수가 표시되지 않음 | **마인마블 프로젝트 과거 실패 관찰 있음.** 점수 계산과 Tellraw는 정상, NPC 표시 불안정. 정확한 JSON 필드별 재현 로그는 추가 필요 | Dialogue 본문 표시에 WARNING, Function으로 점수 조건 판정 후 정적 Scene 선택 또는 Tellraw/Actionbar 표시 선택지 |
| `DIALOGUE_DYNAMIC_SELECTOR_RENDER` | NPC 대화문에 동적 Selector 이름이 표시되지 않거나 불안정 | **사용자 문제 제기 및 채택 포기 기록**. 마인마블은 직접 조합 미채택, 디지털 리터러시맵 JSON 36개는 `"selector"` 사용 0건이어서 **직접 실패 재현은 미확인** | 지원 가능한 RawText 구조 보존, Education 호환성 WARNING, 직접 실게임 검증 전 미지원 확정 금지 |

### 기능 등록·검증을 위한 최소 분리 테스트
- **선택자 조건 정상 대조:** NPC의 `@s[tag=computer1]`에 대한 `execute if entity ... run say`를 기준선으로 유지.
- **상호작용자 직접/필터 비교:** NPC 버튼 `tag @initiator add ...`와 `@initiator[tag=...]` 사용(실제 버전별 문법 지원 확인 후) 결과를 독립 비교.
- **중첩 비교:** 동일 NPC 문맥에서 `execute ... run tag @initiator add ...`를 별도 시험하고 대상 태그를 검사.
- **동적 데이터 표시 비교:** 같은 값으로 `tellraw` RawText `score`/`selector`와 NPC Dialogue 본문 `score`/`selector`를 나누어 확인. 함수의 점수 조건에 따른 정적 Scene 전환은 다른 기능으로 분리.
- **멀티플레이 검증:** 상호작용자별 독립 식별, 2명 이상 동시 조작, 임시 태그 충돌·미정리 방지.
- **기록 항목:** 게임 정확한 빌드, 행동팩/리소스팩 버전, 실행 컨텍스트, JSON 원본, 명령문, 관찰 결과, 재현 여부를 각각 보존한다.

**구현 정책:** 원문을 보존하는 Parser/AST/Compiler 및 RawText/Dialogue 전용 블록 모두 기능을 제공한다. 의심 조합은 경고하고 검증된 대체 설계를 선택하도록 안내하되, 보이지 않게 Selector를 `@p`로 대체하거나 `[]` 필터를 삭제하지 않는다. Script API 우회도 별도 실게임 검증 전 성공 처리하지 않는다.

## 후속 기능 개발에 적용
1. C4 RawText는 `text/translate/selector/score/with` 전체를 보존하며 `tellraw/titleraw/dialogue` 사용자 인터페이스를 공통 타입으로 재사용.
2. DialogueFile 정의 블록은 정적 장면 생성과 실행시점 동적 값 해석의 차이를 구분. 현재 확인된 실패를 자동으로 해결한 척 하지 않는다.
3. 호환성 Registry는 **사용 위치 + Edition/버전 + 입력 + 출력 + 판정 근거**를 기준으로 관리. 하나의 조건 `[]` 실패를 전체 Selector 금지로 일반화하지 않는다.
4. Education이 신뢰할 수 없는 NPC 동적 본문은 Function에서 판정하여 정적 Scene 선택 + Lang 고정 문자열로 출력하고, 진짜 동적 숫자/닉네임은 필요한 경우 별도 Tellraw/Actionbar에 표시하도록 설계한다.
5. 추후 실제 JSON·명령·시각 결과가 확보되면 공식 버그 보고서와 정확히 비교. 이 문서 작업에 새 실게임 테스트, 빌드, 팩 수정 없음.

## 공식 자료
- https://learn.microsoft.com/en-us/minecraft/creator/documents/targetselectors?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/documents/npcdialogue?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/reference/content/rawmessagejson?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/documents/npcdialoguedesigner?view=minecraft-bedrock-stable
- https://bugs.mojang.com/browse/MCPE-163092 (관련 아님)
- https://bugs.mojang.com/browse/MCPE-229540 (관련 아님)
