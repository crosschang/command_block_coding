# C2 SCOREBOARD 0.0.77 — local implementation candidate

상태: **AST / Compiler / Validator / unified MakeCode block 소스 작성 + TypeScript/static smoke PASS**, **MakeCode 실제 UI/JavaScript↔Blocks 및 Education 실게임 미검증**.

원격 저장소: `crosschang/command_block_coding` (GitHub 변경 없음). 이 코드는 사용자에게 이전에 제공한 C1 RIDE/DIALOGUE 병합 0.0.77 소스를 기반으로 작성.

## 구조

- `Command.scoreboard(action: ScoreboardActionValue)` 통합 실행 블록 1개.
- `commands/c2_scoreboard.ts`: 공통 ScoreboardCommand AST. Selector 필터의 `scores`와 별개.
- `src/blocks/c2_scoreboard_blocks.ts`: objectifs & players 동작 reporter, Fake Player reporter.
- `src/blocks/command_adapter.ts`: typed AST adapter.
- `src/compiler/compiler.ts`: canonical Minecraft Bedrock/Education 명령 문자열.
- `src/validator/validator.ts`: 구조, 필수 인수, int32, 두 Objective/연산, wildcard 범위 검증.
- `pxt.json.files`: 위 새 TS 2개 추가 (`0.0.77` 변경 없음).

## 지원 범위

`scoreboard objectives`: `add dummy [displayName]`, `remove`, `list`, `setdisplay`(sidebar/list/belowname), 빈 slot clear, sidebar/list 정렬.

`scoreboard players`: `set/add/remove`, `reset [objective]`, `list [target]`, `operation` (=, +=, -=, *=, /=, %=, <, >, ><), `test` (inclusive bounds/wildcards), `random`.

대상은 기존 MCFunctionFields TargetValue의 Selector 또는 Named Target을 재사용. Fake Player reporter는 `namedPlayerTarget`을 참조. Objective 이름은 직접 텍스트 입력 지원. Registry/autocomplete는 나중에 추가하되 없는 값을 기본 차단하지 않음.

## 검증

- 전체 `pxt.json.files` TypeScript 106개 + MakeCode 공개 테스트 함수 샘플: TypeScript 5.8 검사 오류 0건 (MakeCode 환경별 namespace shim 사용)
- AST→Compiler/Validator 정상형 19개, 오류형 10개, public block & fake-player 경로 smoke PASS.
- 기존 C1 RIDE/DIALOGUE 회귀 테스트 4/4 PASS.
- 미검증: PXT 실제 빌드/MakeCode Toolbox 렌더링, JavaScript→Blocks round-trip, Minecraft Education 26.32 실제 명령 결과, Bedrock 타 버전.
- Scoreboard `list`/`test`처럼 결과 메시지를 반환하는 명령은 `player.execute()` Preview에서 상세 출력이 보이지 않을 수 있으므로 실게임은 실제 점수·화면·별도 직접 채팅으로 판정할 것.

## 실게임 사용 예시

1. `tests/C2_SCOREBOARD_PUBLIC_API_MAIN.ts`의 내용을 MakeCode JavaScript에 붙여넣어 블록 변환 여부를 확인.
2. **테스트 월드에서만** `c2add` → `c2set` → `c2add10` → `c2math` → `c2side` → `c2test` → `c2list`.
3. Fake Player `#c2a` 예상 점수 10 + 10 + 3 = **23**. `c2test`의 직접 명령 진위/사이드바 23 표시 확인.
4. `c2reset` → `c2remove`로 시험용 objective 정리. 같은 objective가 기존 월드에 있다면 실행하지 말 것.

원칙: 새 Core는 AST 중심, MakeCode 삭제/전환 없음, 기존 C1 UI·DIALOGUE 소스 보존, GitHub commit/tag/release/version upgrade 없음.

공식 문법 근거:
https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/scoreboard?view=minecraft-bedrock-stable
https://learn.microsoft.com/en-us/minecraft/creator/documents/scoreboardintroduction?view=minecraft-bedrock-stable
