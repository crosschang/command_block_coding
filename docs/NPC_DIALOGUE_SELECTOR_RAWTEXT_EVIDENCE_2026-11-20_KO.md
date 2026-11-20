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
