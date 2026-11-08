# 0.0.68 통합 패치 — Preview JSON 출력 최적화 + ? N 진단 페이지

## 기준

- 기준 ZIP: `command_block_coding(20261017-105416).zip`
- `pxt.json.version`: **0.0.68 고정**. 임의로 변경하지 않음.
- 이 문서/테스트는 외부 MakeCode/PXT 컴파일 및 Education 실게임 검증을 대체하지 않음.
- 다른 채팅에서 CAMERA를 계속 변경 중이면 **본 패치의 수정 파일만** 최신 Git 작업 트리에 적용해 충돌을 검토하세요. 전체 ZIP을 무조건 덮어쓰면 이후 개발 작업이 사라질 수 있습니다.

## 실제 수정 파일 3개

1. `src/preview/output_adapter.ts` — 기존 0.0.65 패치의 `indexOf()` 중심 `previewEscapeJsonText()`를 현재 0.0.68에 적용. `tellraw` 출력 포맷/JSON escaping/공통 API 유지.
2. `src/preview/diagnostic_store.ts` — `?` 하나의 numeric chat event에서 `?`와 `? N` 처리. `Next: ? 2` 등 안내 문구 변경. `cbi_page` 이벤트·예약 제거.
3. `function_file.ts` — `cbi_page`에 대한 예약 함수명 에러 분기 제거. 기존 `?`, `cbi_rules` 예약 유지.

기존 `main.ts`, `main.blocks`, `test.ts`, `pxt.json`, CAMERA AST·Compiler·Validator·블록 API, TAG·GAMERULE 명령 의미는 수정하지 않았습니다.

## 설치

1. 현재 Git 작업 트리를 백업하거나 별도 테스트 브랜치를 만듭니다.
2. 패치 ZIP의 **실제 소스 파일 3개만** 동일 경로에 덮어씁니다. 부록 `tests/`, `docs/` 파일은 보관용이며 `pxt.json`에 추가하지 않습니다.
3. MakeCode Extension의 업데이트 캐시를 피하기 위해 사용 중인 릴리스 방식을 따라 새 테스트 릴리스/태그를 만듭니다. **pxt.json의 0.0.68은 유지**합니다.
4. `tests/PREVIEW_DIAGNOSTIC_COMBINED_0.0.68_MAIN.ts`의 내용을 **임시 테스트용 `main.ts` 전체**로 사용합니다. 기존 main.ts 백업, `test.ts`는 건드리지 않습니다. 테스트 후 main.ts를 복원합니다.

## 입력 방식

- `?` → 1페이지; 숫자 미입력 시 MakeCode 기본 numeric argument 0을 1페이지로 간주.
- `? 1`, `? 2`, `? 3` → 요청한 페이지.
- `? 0` → 숫자 0은 생략 시 기본값과 구별할 수 없어 1페이지로 처리됨.
- `? 99` / `? -1` → 범위 초과 페이지 안내.
- `page_a?` → 개별 함수 진단 상세; 함수 실행 금지.
- `cbi_page` → 내장 페이지 명령이 아니며, 테스트 fixture에서는 **일반 사용자 함수**로 정의됨. `cbi_page 2`의 내장 페이지 조회는 제거됨.

## Education 테스트 순서

**A. 진단 페이지**
```
?
? 1
? 2
? 3
? 99
? 2
?
page_a?
cbi_page
```
예상: 1~3페이지에 `page_a`~`page_g`가 세 개씩/남은 한 개로 나뉘어 표시. 다음 페이지 안내는 `Next: ? 2`/`Next: ? 3`. `cbi_page`는 `USER_PAGE_NAME_OK` 출력. 다시 `?` 호출해도 빠르게 동작해야 함.

**B. Preview 특수문자·개행·한글**
```
pv68_short
pv68_special
pv68_multiline
pv68_korean
```
예상: `[Preview]` prefix/따옴표/역슬래시/대괄호/`@s` 원문, 개행, 한글 보존. 연속 입력 지연 여부 확인.

**C. TAG / GAMERULE 실제 월드 테스트**
```
pv68_gamerules
cbi_rules 1
cbi_rules 2
pv68_tag_add
pv68_tag_list
pv68_tag_remove
pv68_tag_list
```
테스트 월드에서 실행. GAMERULE Registry 목록은 실제 라이브 설정값이 아닌 것을 구분. TAG 쿼리는 내부 execute/tellraw 횟수와 게임 상태에 따른 지연이 여전히 발생할 수 있음.

**D. 회귀 체크**
- 기존 `함수명?`, ERROR 차단, WARNING/INFO 실행 허용, 정상 함수 실행 정책 유지.
- `?` 또는 페이지 이동을 반복해도 다른 채팅 명령이 밀리지 않는지 확인.
- `cbi_rules`는 GAMERULE 조회 명령으로 유지.
- CAMERA 고급 기능의 Editor/AST 변경 여부는 다른 채팅 기준 그대로 유지.

## 로컬 검증과 한계

- Preview JSON escape 동등성 및 가상 `player.onChat` numeric handler 시뮬레이션.
- Syntax/파일 등록 검사만으로 MakeCode PXT 빌드나 Education 실게임 PASS를 의미하지 않음.
- MakeCode 공식 문서: https://minecraft.makecode.com/reference/player/on-chat-command
- 공식 예시: https://minecraft.makecode.com/courses/csintro/variables/activity-1 (숫자 인수 생략 시 기본 0)
