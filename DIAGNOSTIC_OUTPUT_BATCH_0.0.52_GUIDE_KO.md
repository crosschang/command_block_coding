# 0.0.52 진단 출력 묶음 패치

## 적용 범위

사용자 제공 `command_block_coding(20261015-094146).zip` (버전 0.0.52) 기반. 이전에 성공한 SILENT RUN 패치와 충돌하지 않도록 **`src/preview/diagnostic_store.ts` 한 파일만** 교체합니다. `function_file.ts`, `pxt.json`, AST, Compiler, Validator, Registry, `main.ts`, `test.ts` 변경 없음.

## 변경 내용

- `함수명?` : 요약과 해당 함수 ERROR/WARNING/INFO 상세를 가능한 한 하나의 `tellraw` 호출로 출력합니다.
- `?`, `cbi_diag` : 전체 진단을 가능하면 적은 수의 `tellraw` 호출로 출력합니다. 700자 초과 시 줄 단위로 나눕니다.
- 기존 `previewSay()`와 JSON 텍스트 이스케이프를 재사용합니다.
- `함수명` 일반 실행은 기존 SILENT RUN 동작을 유지합니다. `?` 조회는 함수 본문을 실행하지 않습니다.

## 적용 방법

1. 프로젝트 백업 후 ZIP 안의 `src/preview/diagnostic_store.ts`를 동일 경로로 덮어씁니다. **`src/` 디렉터리부터 경로를 확인**하세요.
2. 최신 Extension을 다시 불러와 MakeCode JS↔Blocks 변환을 확인합니다.
3. 기존 `DIAGNOSTIC_QUERY_0.0.52_TEST_MAIN.ts`를 테스트 `main.ts`로 사용합니다. `player.onChat("?")` 임시 시험 코드는 제거하세요.
4. 다음 명령어를 슬래시 없이, 한 번씩 입력하여 출력을 확인합니다.
   - `diag52_warn` → `WARNING_TEST_EXECUTED`만 출력
   - `diag52_warn?` → 경고 진단 출력, **함수 본문 실행 안 함**
   - `diag52_info?` → 안내 진단 출력, **함수 본문 실행 안 함**
   - `diag52_error?` → 오류 진단 출력, **함수 본문 실행 안 함**
   - `?` → 전체 진단 출력
   - `diag52_parent` → 기존 내부 호출 동작 유지

## 검증 경계

단일 `tellraw` 호출로 묶는 것은 출력 섞임 가능성을 줄이는 **완화책**입니다. 실제 출력 지연의 근본 원인까지 규명·해결했다고 단정하지 않습니다. 코드에 대한 로컬 검사와 Education 실게임 검증은 별도 단계로 구분합니다.
