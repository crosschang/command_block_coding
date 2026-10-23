# C2 SCOREBOARD UI COMPRESSION — 2026-10-23

## 설계 원칙
- 원본 사진의 `/scoreboard objectives` 및 `/scoreboard players` 명령 문법을 각기 독립된 AST action으로 보존한다.
- MakeCode `Command.scoreboard(action)` 최상위 블록 1개, 동작 reporter 9개, fake-player reporter 1개.
- 새 코드에서 두 가지 통합 reporter를 우선 사용. 과거 함수 ID 유지, `blockHidden=true`로 새 toolbox 노출만 제한.
- 블록 UI가 문자열을 직접 조립하지 않음. Scoreboard AST -> Validation -> Compiler -> Preview.
- Objective 이름과 fake-player 이름은 입력 가능; 다른 명령에서도 사용하는 TargetValue / Selector를 재사용.

## 동작 reporter (기존 11 → 새 9)

| 분류 | 보이는 reporter | Minecraft 문법 |
|---|---|---|
| objectives | objective manage (add/remove) | objectives add/remove |
| objectives | list objectives | objectives list |
| objectives | display slot/objective/sort | objectives setdisplay [sort] (아래 이름 포함) |
| players | players set/add/remove | players set/add/remove |
| players | reset score | players reset |
| players | list players | players list |
| players | score operation | players operation |
| players | test score | players test |
| players | random score | players random |

## Validator
- objective `remove` + displayName은 무시하지 않고 ERROR `SCOREBOARD_DISPLAYNAME_NOT_APPLICABLE`.
- `belowname` 정렬, 목표 없는 정렬 등은 기존 `SCOREBOARD_SORT_INVALID`.
- 위 항목 외 AST·Compiler·Registry 공통 타입·기존 RIDE/DIALOGUE는 변경 없음.

## 실게임 테스트
- 실제 Minecraft Education 26.32에서 직접 명령 문법·점수판 표시/연산 결과 검증 전.
- MakeCode 블록으로 변환된 모양(드롭다운, text shadow, 색상, default action)은 사용자 확인 필요.
- 기존 `c2_demo` score objective가 없는 테스트 월드에서 실행.

## 변경 파일
- `src/blocks/c2_scoreboard_blocks.ts`: 신규 2 reporter, enum 2개, legacy 4개 toolbox 숨김, default action shadow 교체.
- `src/validator/validator.ts`: `remove` 선택 + 표시 이름 입력 시 오류.
- 신규 테스트: `tests/C2_SCOREBOARD_COMPACT_UI_INGAME_MAIN.ts`.
- 그 외 이전 C2 ZIP의 파일은 사용자에게 별도 선행 설치를 요구하지 않도록 그대로 포함.
- `pxt.json.version = 0.0.77`.
