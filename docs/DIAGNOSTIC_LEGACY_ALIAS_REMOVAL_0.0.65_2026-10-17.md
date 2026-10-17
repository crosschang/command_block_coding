# 0.0.65 진단 레거시 별칭 완전 제거 — 2026-10-17

## 적용 범위

- 기반: `command_block_coding_0.0.65_STABILIZED_FULL_2026-10-17.zip`.
- `pxt.json.version=0.0.65` 유지. MakeCode/PXT Extension, AST/Parser/Compiler/Validator/Registry, `.mcfunction` 생성 동작 변경 없음.
- **기존 내부 진단 별칭 `cbi_diag`를 실제 실행 API에서 제거**합니다. 변경 전 사용자 테스트는 이전 동작에 대한 기록이며, 현재 기능 설명이 아닙니다.

## 실제 변경

1. `src/preview/diagnostic_store.ts`: 별칭을 반환하던 `chatCommandName()` 함수와 해당 `player.onChat()` 등록 제거; `isReservedChatCommand()`에서 별칭을 제외. 현행 진단 명령 `?`, 페이지 명령 `cbi_page N` 유지.
2. `function_file.ts`: 과거 별칭에 대한 예약어 오류 문구/조건 제거. 사용자는 이제 그 문자열을 일반 함수 이름으로 정의할 수 있습니다.
3. 현재 진단 회귀 테스트/임시 Education 테스트 설명을 새 명령 체계에 맞추고, 오래된 안내서는 과거 버전 참고 문서임을 명시했습니다. 과거 시점의 changelog 원문은 재작성하지 않았습니다.
4. `tests/DIAG_0.0.65_RECLAIMED_NAME_MAIN.ts`: 이전에 예약됐던 이름으로 일반 함수를 정의하는 별도 게임 확인용 테스트 파일 추가.

## 현행 명령

| 입력 | 동작 |
|---|---|
| `?` | 전체 진단 요약. 함수 실행 없음 |
| `함수명?` | 특정 함수 진단 상세. 함수 실행 없음 |
| `cbi_page 2` | 전체 진단 목록의 2페이지 조회(있을 경우) |
| `함수명` | 유효한 함수만 실행, ERROR는 즉시 차단 |
| `cbi_diag` | **내부 진단 명령 아님**. 사용자가 동일한 이름의 함수를 정의한 경우에만 일반 함수로 작동 |

## 로컬 회귀 검사

- `node tests/dev/diagnostic_store_runtime_mock.cjs`: 16개 모의 테스트. 내부 채팅 이벤트는 `?`, `cbi_page` 2개만 등록하며, `cbi_diag`는 예약어가 아님을 확인.
- `node tests/dev/removed_alias_runtime_mock.cjs`: 실제 `FunctionFile.define("cbi_diag", ...)`의 채팅 등록, 실행 가능 여부, 상세 조회 연결을 추가 모의 검증.
- `pxt.json.files`에 등록된 모든 파일 존재 확인, TS 구문 검사, 새 스모크 테스트 파일 별도 확인.
- **로컬 검사는 Minecraft Education 게임 내 테스트 또는 실제 PXT 빌드를 대체하지 않습니다.**

## Education 실게임 재검증

1. GitHub에 적용한 다음 새로운 테스트 릴리스/태그를 발행하고 MakeCode Extension을 업데이트합니다. 배포물 버전 필드는 임의 변경하지 않습니다.
2. `tests/DIAG_0.0.65_STABILITY_MAIN.ts`를 **임시** 루트 `main.ts`로 교체하여 `?`, `diag52_warn?`, `diag52_info?`, `diag52_error?`, `diag52_error`, `diag52_warn`, `diag52_info`, `?`를 테스트합니다. `test.ts`는 비워 둡니다.
3. 이 상태에서 `cbi_diag`를 입력하면 **이전 전체 진단 별칭이 실행되지 않아야** 합니다. 같은 문자열을 사용자가 직접 정의하지 않았다면 진단 내용이 출력되면 안 됩니다.
4. 별도의 실행으로 `tests/DIAG_0.0.65_RECLAIMED_NAME_MAIN.ts`를 루트 `main.ts`에 적용합니다. `cbi_diag`가 `USER_DEFINED_FUNCTION_OK`를 출력하고, `cbi_diag?`는 실행하지 않고 상세 조회만 하는지 확인합니다.
5. 기존 ERROR 차단, WARNING/INFO 침묵 실행, 짧은 진단 출력의 속도가 유지되는지 확인합니다. 통과 전까지 **Education Runtime PASS로 판정하지 않습니다.**

## 주의

- 과거 릴리스와 문서에 별칭 기록이 남아 있는 것은 변경 이력입니다. 이 패키지의 **현재 실행 소스에는 별칭 등록/예약이 없습니다**.
- 이전에 별칭에 의존하던 테스트나 사용자는 `?`로 변경해야 합니다.
