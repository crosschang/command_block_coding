# command_block_coding — 명령 구현 로드맵 / 2026-10-22 최신 업데이트

> 이 문서는 2026-10-14 로드맵을 **현행 상태로 갱신**한 것이다. 이전 역사적 판정을 삭제하지 않는다. 사용자 실행 근거와 GitHub `master` 확인을 함께 사용한다. 버전 `0.0.76`에서 수행한 B4 실게임 시험은 `0.0.77`의 동일 기능 소스에 대한 대표 증거로 승계할 수 있지만, 0.0.77 독립 재실행을 의미하지 않는다.

## 현재 기준
- 저장소: `crosschang/command_block_coding` / `master`.
- GitHub `pxt.json.version`: **0.0.77**. `0.0.77` 커밋 `351aae3d3397f2b4f1a5e1ee134cf3ce506c7c5f`은 **`pxt.json`만 변경**(2026-10-21T23:59:23Z). 애니메이션·안개 등 B4 기능 코드는 0.0.76과 동일한 것으로 확인.
- 실제 B4 테스트: 주로 **0.0.75~0.0.76 / Minecraft Education 26.32**. 사용자 화면·녹화 결과 기준.
- 코드 구조: MakeCode Blocks → Block Adapter → Minecraft Command AST → Validator → Compiler → Preview의 `player.execute()`; 나중에 실제 `.mcfunction` Converter. MakeCode 제거/웹앱 전환 금지.

## 진행 상태 — 구현과 실측 분리

| 단계 | 현재 상태 | 대표 근거 / 남은 범위 |
|---|---|---|
| A1 TELL | 구조화 구현 소스 확인 | 전체 옵션·여러 대상 전수 검사 별도 |
| A2 TIME | 구조화 구현 기록 / `time query` 별도 | Query Preview 결과 표시 한계 보존 |
| A3 WEATHER | 구조화 구현 기록 | 기간 변형 전수 아님 |
| A4 DIFFICULTY | 구조화 CommandKind/블록 존재 확인 | Education 실게임 대표 확인은 별도 |
| A5 CAMERASHAKE | 구조화 구현·실게임 대표 테스트 기록 | 강도/모드 옵션 전체 아님 |
| A6 HUD | 구조화 구현·대표 테스트 기록 | 요소 조합·접근성 차이 별도 |
| A7 INPUTPERMISSION | 구조화 구현·대표 테스트 기록 | Query 출력 숨김과 SET 성공 구분 |
| A8 SPAWNPOINT / SETWORLDSPAWN | 구조화 구현·대표 테스트 기록 | 절대/상대/생략 Preview 호환성 주의 |
| B1·B2 CAMERA | **대표 CAMERA 기능과 7개 preset Toolbox UI 검증** | 특수 spline / 모든 preset / 파라미터 조합은 보류. 사용자 원칙: CAMERA 전체 범위 구현 뒤 통합 인게임 시험 |
| B3 DAMAGE / EVENT | **대표 실게임 PASS** | 모든 원인·가해자·owner/event 전수 아님 |
| B4 PLAYANIMATION | **대표 고급 인수 검증 완료** | 기본, 연속 자세, `stop_expression`, `blend_out_time`, `next_state`, `controller` 대표 시각 PASS; precise state_time/전체 Animation ID 미검증 |
| B4 FOG | **대표 실게임 PASS + 5개 Toolbox 그룹** | push/pop/remove, 중첩·복귀, 지상·수중·End fog 시각 PASS; 80개 ID 전수는 미검증 |
| C1 CONTROLSCHEME / AIMASSIST | **대표 실게임 PASS** | `ride`/`dialogue`와 별개 명령 계열 |
| C1 RIDE / DIALOGUE | **다음 명령 후보: 현재 AST CommandKind에 없음** | Education·Bedrock 최신 공식 문법 확인 후 구현 착수. API/Registry/권한/실게임 분리 |
| C2 SCOREBOARD 명령 AST | **미구현 우선 후보** | Selector의 `scores` 필터와 혼동 금지; objective/players/operation/setdisplay, fake player UI |
| C3 Modern EXECUTE | **미구현 우선 후보** | as/at/in/positioned/rotated/facing/align/anchored/if/unless/run 체인 AST |
| C4 RawText TELLRAW/TITLERAW | **미구현 우선 후보** | text/translate/selector/score/with 공통 AST, JSON escape·리버스 파서 |
| D `.mcfunction` Converter / Parser | **장기 필수, 아직 완성 아님** | 실제 파일 내보내기/불러오기, Raw 보존, Round-trip, Bedrock/Education 실제 BP 실행 |

## B4 완료 및 다음 단계 진입 게이트
1. 완료로 기록: B4 **대표 경로** PLAYANIMATION·FOG 사용자 인게임 검증. 모든 ID, 모든 패키지/플랫폼의 완전 호환성 아님.
2. 0.0.77 기준 정적 검증 권장: `node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs`, `node --test tests\B4_FOG_ENVIRONMENT_GROUPS_TEST.cjs`, `node --test tests\B4_ADVANCED_FOG_COMPAT_STATIC_TEST.cjs`, `node tools\generate_b4_registry.cjs --check`, JS↔Blocks 확인. 이 문서 패키지를 만들면서 **실행한 것으로 기록하지 않음**.
3. 사용자 PC의 최신 전체 ZIP은 새 코드 구현 직전 재확인. GitHub `master`가 실제 PC 변경사항과 같다는 보장은 별개.
4. 차기 권장: **C1 `ride` / `dialogue` 설계 점검**(사용자 선택 가능) → C2 Scoreboard → C3 execute → C4 RawText → D Converter. B2 CAMERA 고급 미완료 부분도 별도 backlog 유지.
5. 새 기능은 공통 Selector/Position/Registry/AST 재사용; `main.ts`에 문자열 조립 로직 집중 금지. 추가 TS는 `pxt.json.files` 포함 확인. 새로운 자동 ID 등록 시 기존 reporter/blockId 호환.

## 금지 사항 / 검증 경계
- `pxt.json.version` 자동 증가 금지. GitHub 커밋/푸시는 사용자가 진행.
- Bedrock 공식 샘플의 동작을 Education 실제 검증으로 자동 승격 금지.
- `query.anim_time > 1.5`, `query.state_time > 1.5` 등이 정확히 1.5초 후 전환되었다는 **정량 PASS 주장 금지**. 상태 변화 관찰과 시간 측정을 분리.
- `controller`의 교체/추가/종료는 화면상 대표 PASS. 내부 레이어 우선순위·전수 관계는 미검증.
- 기존 도구 `tools/update_registry.ps1`, `tools/generate_registry.ps1`의 동작을 B4 패치로 훼손하지 말 것.
