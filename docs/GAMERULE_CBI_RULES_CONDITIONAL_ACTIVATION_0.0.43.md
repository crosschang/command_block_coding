# Gamerule Preview `cbi_rules` 조건부 등록 — 0.0.43 유지 패치

## 목표

`cbi_rules <page>`는 **실제 Minecraft `/gamerule` 문법이 아니라 Preview 전용 Registry 탐색 도구**다. 모든 `FunctionFile.define()`에서 무조건 등록하지 않고, **유효한 FunctionFile 정의 안에서 구조화된 GAMERULE LIST 명령이 실제로 캡처되었을 때**에만 활성화한다.

## 등록 정책

| 프로그램에 존재하는 내용 | cbi_rules 등록 |
|---|---|
| FunctionFile 없이 테스트 리포터만 생성 | 아니요 |
| FunctionFile에 SAY, TAG, ENCHANT 등만 있음 | 아니요 |
| FunctionFile에 GAMERULE SET만 있음 | 아니요 |
| FunctionFile에 GAMERULE QUERY만 있음 | 아니요 |
| FunctionFile에 GAMERULE LIST가 있으나 해당 파일의 Definition Validation이 ERROR | 아니요 |
| 유효한 FunctionFile에 GAMERULE LIST 포함 | 예: 한 번만 |
| 유효한 FunctionFile들에 GAMERULE LIST 여러 개 | 예: 한 번만 |

- **활성화 시점**: FunctionFile 정의 단계의 Validation이 끝난 직후. `g42pg_list`를 실행하기 전부터 `cbi_rules`를 사용할 수 있다.
- **캡처 기준**: 리포터를 만들었다는 사실이 아니라, `Command.gamerule(Command.gameruleListAction())`로 전달된 **구조화된 AST 명령**이다. 다른 명령이 포함된 함수라도 전체 Definition Validation에 ERROR가 있으면 등록하지 않는다.
- **호환성**: 기존 `cbi_diag`는 기존과 같이 동작한다. TAG QUERY의 `SESSION_KNOWN` Selector 검사, Gamerule Query의 `SESSION_KNOWN`, 원래 `gamerule` Compiler 명령 및 Validator 동작도 변경하지 않는다.
- **주의**: `cbi_rules`라는 함수 이름은 충돌 방지를 위해 여전히 예약한다. 프로그램에서 명령을 일단 등록한 뒤 Definition을 런타임에 동적으로 교체·삭제하는 상황은 MakeCode의 `player.onChat` 등록 해제 API가 확인되지 않아 자동 해제 대상으로 다루지 않는다. 블록 변경 후 프로그램을 재실행해 새 등록 상태를 확인한다.
- `cbi_rules`로 출력하는 38개 Registry 이름과 타입은 **월드의 실시간 Gamerule 값이 아니다**. 실시간 상태는 게임 채팅에서 `/gamerule` 또는 `/gamerule <rule>`로 확인한다.

## 실게임 테스트: 3가지 `main.ts`를 **각각 별도 실행**

프로그램마다 임시 `main.ts`를 교체하고 MakeCode를 재실행한다. `test.ts` 및 기존 프로젝트 소스 파일은 유지한다. 테스트 간 핸들러가 남아 결과를 혼동하지 않도록 별도 실행을 권장한다.

### A: LIST 없음

파일: `tests/GAMERULE_0.0.43_CBI_RULES_ABSENT_MAIN.ts`

- `gate_set_only`, `gate_query_only`, `gate_say_only` 정의 요약이 나타나는지 확인.
- 게임 채팅에서 `cbi_rules 1` 입력 → **Registry 페이지가 출력되지 않아야 함**. MakeCode의 일반 채팅 동작 여부는 별개.
- `cbi_diag` → 기존 진단 조회 동작 유지.

### B: 오류가 있는 LIST

파일: `tests/GAMERULE_0.0.43_CBI_RULES_INVALID_MAIN.ts`

- `gate_invalid_list`가 Definition ERROR로 등록 차단되는지 확인.
- `cbi_rules 1` → **Registry 페이지가 출력되지 않아야 함**.
- `cbi_diag` → `GAMERULE_TYPE_MISMATCH` 상세 표시.

### C: 유효한 LIST 2개

파일: `tests/GAMERULE_0.0.43_CBI_RULES_ENABLED_MAIN.ts`

- `cbi_rules 1`, `cbi_rules 2`, `cbi_rules 7` → 각각 페이지 1/7, 2/7, 7/7 출력.
- `gate_list_1`, `gate_list_2` → 기존 GAMERULE LIST Preview 안내와 1페이지 출력.
- LIST가 2개여도 `cbi_rules 2`를 한 번 입력했을 때 페이지 메시지가 한 세트만 나오는지 확인.
- `cbi_diag` 계속 동작.

## 적용 범위 및 검증

- 변경 소스: `function_file.ts`, `custom.ts` **2개**. 테스트 파일과 문서만 추가.
- `pxt.json` 변경 없음. **기존 version 0.0.40 보존**.
- Generator, Registry, AST, Compiler, Validator, TAG Query, Enchant, Particle, Sound/Music 코드는 수정하지 않음.
- 개발 환경의 전체 PXT 파일에 대한 TypeScript 타입 검사와 JS 실행 모의 테스트 통과.
- 실제 Minecraft Education 26.32 실게임 PASS는 아직 사용자 재검증 필요.
