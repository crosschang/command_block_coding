# 0.0.52 함수 실행 시 진단 표시 최소화 패치

## 기준
- 기준 ZIP: `command_block_coding(20261015-094146).zip`
- `pxt.json.version`: **0.0.52 유지**
- 교체 파일: **`function_file.ts` 1개**
- 변경하지 않음: `src/preview/diagnostic_store.ts`, Validator, AST, Compiler, Registry, Generator, `main.ts`, `test.ts`, `pxt.json`.

## 의도된 정책
| 채팅 입력 | 결과 |
|---|---|
| `diag52_ok` | 함수 내용만 실행 (진단 자동 표시 없음) |
| `diag52_warn` | WARNING 세부 진단 없이 함수 내용 실행 |
| `diag52_info` | INFO 세부 진단 없이 함수 내용 실행 |
| `diag52_error` | 실행 차단. `diag52_error?`로 확인하라는 짧은 메시지만 표시 |
| `diag52_warn?` | WARNING 세부 진단 조회만, 함수 실행하지 않음 |
| `diag52_info?` | INFO 세부 진단 조회만, 함수 실행하지 않음 |
| `diag52_error?` | ERROR 세부 진단 조회만, 함수 실행하지 않음 |
| `?` 또는 `cbi_diag` | 전체 진단 조회만, 함수 실행하지 않음 |

`Preview.ready()`의 **초기 등록 결과 및 전체 진단 사용법 안내는 그대로 유지**됩니다. 즉, 이번 수정은 **사용자가 실제 함수명을 입력해서 실행할 때 자동으로 표시되던 진단만 줄입니다.**

## 적용
1. 사용 중인 0.0.52 전체 프로젝트를 백업합니다.
2. 패치 ZIP의 `function_file.ts`를 `pxt.json`이 있는 프로젝트 **루트**의 동일 파일에 덮어씁니다.
3. MakeCode Extension 새로고침 후 TypeScript 컴파일과 JavaScript ↔ Blocks 전환을 확인합니다.
4. 기존 `DIAGNOSTIC_QUERY_0.0.52_TEST_MAIN.ts`를 임시 `main.ts`에 넣어 사용합니다. `player.onChat("?")` 임시 테스트 핸들러가 있다면 제거합니다.

## 게임 검증
슬래시 없이 실행:

1. `diag52_warn` → **WARNING/상세 설명 없이** `WARNING_TEST_EXECUTED` 표시
2. `diag52_warn?` → 경고 상세 출력, `WARNING_TEST_EXECUTED` **출력되지 않음**
3. `diag52_info` → **INFO/상세 설명 없이** `INFO_TEST_EXECUTED` 표시 (카메라 프리셋 명령 자체는 월드에 해당 프리셋이 없으면 별도로 실패할 수 있음)
4. `diag52_info?` → INFO 상세 출력, `INFO_TEST_EXECUTED` **출력되지 않음**
5. `diag52_error` → 함수 본문 미실행, `diag52_error?` 안내만 표시
6. `diag52_error?` → 상세 오류 출력, 본문 실행 안 함
7. `?` → 전체 오류/경고/정보 조회
8. `diag52_parent` → WARNING/INFO 안내 중복 없이 기존 내부 함수 실행 유지

## 검증 범위와 주의
- 최신 실제 소스에서 추출한 `function_file.ts`와 `diagnostic_store.ts`를 사용한 **18/18 JavaScript 런타임 모의 검사 PASS**.
- Minecraft MakeCode에서의 PXT 컴파일과 Education 26.32 실제 실행은 **아직 확인 전**.
- 기존 `?`/`함수명?`은 세부 진단을 여러 `tellraw`로 출력합니다. 이번 패치는 **함수 실행 시 불필요한 진단 출력**을 제거한 최소 수정이며, 조회 메시지 자체의 비동기 출력 타이밍을 해결했다고 단정하지 않습니다.
- 사용자 정의 함수명이 `?`로 끝나는 경우의 예약 문자 충돌은 별도 후속 과제입니다.
