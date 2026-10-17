# Minecraft Education 0.0.62 — ERROR 차단 메시지 지연 최소 수정 패치

## 적용 대상
최신 0.0.62 전체 프로젝트와 **2026-10-17 `indexOf()` 패치가 이미 적용된 상태**에 사용합니다.
이 압축 파일은 전체 프로젝트가 아니라 **수정 파일 2개를 덮어쓰는 패치**입니다.

- `function_file.ts` (프로젝트 루트)
- `src/preview/diagnostic_store.ts`

`pxt.json.version`은 수정하지 않았습니다. 사용자가 GitHub Release 테스트용 태그를 만드는 것은 별도 작업입니다.

## 문제와 수정 범위
영상에서 `?`, `diag52_warn?`, `diag52_info?`, `diag52_error?` 조회는 `indexOf()` 수정 후 빨라졌지만,
물음표 없이 `diag52_error`를 실행하면 차단 문구가 수 초 지연되었습니다.

원래 무효 함수의 직접 실행(`function_file.ts`)은 `MCFunctionPreview.previewSay()`를 호출합니다.
그 함수는 `src/preview/output_adapter.ts`에서 글자별 JSON escape를 수행한 뒤 `player.execute('tellraw ...')`을 호출합니다.
조회 경로는 빠른 `emitCompactLine()`을 사용합니다.

이 패치는 실행 차단 분기에서 `MCFunctionDiagnostics.showBlockedExecutionHint(name)`을 호출하도록 변경합니다.
새 헬퍼는 기존 `emitCompactLine()`을 사용하므로, 평범한 메시지는 한 번의 `player.say()`로,
셀렉터나 JSON 관련 특수문자가 있는 메시지는 기존의 짧은 `tellraw` 경로로 안전하게 보냅니다.

**ERROR 정의의 실행 차단은 유지**됩니다. Validator/AST/Compiler/Registry, 기록 캐시, `?`와 `함수명?`,
WARNING·INFO의 정상 실행 정책, 실제 .mcfunction 출력은 변경하지 않습니다.

## 실게임 검증 (미완료)
MakeCode Extension에 위 두 파일을 반영하고 테스트 릴리스를 만든 뒤 동일한 main.ts로 실행합니다.
한 번에 빠르게 입력하지 말고 응답을 확인하며 다음을 수행합니다.

1. `?` — 빠른 요약이 유지되는가
2. `diag52_error?` — 상세 원인이 빠르게 출력되는가
3. `diag52_error` — 오류 차단 문구가 빠르게 출력되는가; 실제 명령이 실행되면 **FAIL**
4. `diag52_warn`, `diag52_info` — ERROR 외 함수는 기존처럼 실행되는가
5. `diag52_error`를 2~3회 반복 — 누적 지연이 생기지 않는가

정상 예상 문구: `mcfunction diag52_error: execution blocked. Type diag52_error? for details.`
이 문구는 `[Preview]` 접두가 생략될 수 있습니다(차단 안내만 출력 어댑터 변경).

### 주의
현재 검증 근거는 사용자 영상과 정적 코드 경로 분석입니다. **실제 Education Runtime PASS 판정 전**입니다.
만약 패치 후에도 지연이 지속되면 previewSay의 다른 호출부 또는 게임 측 이벤트 전달을 따로 조사해야 합니다.
원인을 더 구분하기 전에 Preview 전체 출력을 일괄 변환하거나 긴 JSON escape 로직 전체를 수정하지 마세요.
