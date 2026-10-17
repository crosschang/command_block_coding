> **보관된 과거 버전 안내**: 아래 명령 및 동작은 해당 당시 패치 설명입니다. 현재 0.0.65에서는 과거 진단 별칭이 제거되었습니다. 최신 사용법은 `docs/DIAGNOSTIC_LEGACY_ALIAS_REMOVAL_0.0.65_2026-10-17.md`를 참조하세요.

# 0.0.52 진단 출력 안정화·현지화 대비 패치

## 기준 / 보존 범위

- **최종 제공 전체 소스**: `command_block_coding(20261015-094146).zip`, `pxt.json.version = 0.0.52`.
- **현재 작동 정책**: 앞서 적용한 SILENT RUN(정상·WARNING·INFO 실행 시 상세 진단 무출력, ERROR 실행 차단)과 `?` / `함수명?` / `cbi_diag`.
- **이번 패치 수정 파일은 한 개**: `src/preview/diagnostic_store.ts`. AST, Compiler, Validator, Registry, `function_file.ts`, `pxt.json`, `main.ts`, `test.ts`는 패치에 포함하지 않습니다.
- 이전의 **긴 문장을 하나의 tellraw로 합치는** `PATCH_0.0.52_DIAGNOSTIC_OUTPUT_BATCH_2026-10-15.zip`은 다시 적용하지 마세요. 이 파일이 그 출력 부분을 대체합니다.

## 왜 수정하나

Education 26.32 실게임 실험에서 `?` 진단 7줄/497자에 대해 `DIAG START → BEFORE LINES → SHOWLINES... → AFTER LINES → DIAG END`는 즉시 완료됐습니다. 반대로 짧은 `previewSay("SHORT TEST")`는 통과했지만, 진단을 결합한 긴 `previewSay(content)` 이후 `PROBE C`가 늦거나 나타나지 않았습니다. **관찰된 문제 구간은 긴 Preview 출력 호출**이며, 구체적인 길이 한계 또는 Minecraft 내부 원인은 미확정입니다.

## 구현

1. 모든 진단 출력은 `showLines()` / `emitDiagnosticLine()`으로 모읍니다.
2. 모든 **단일 전송 단위는 최대 100자**로 분할합니다. 100자는 안전이 증명된 상한이 아니라 보수적 테스트 값입니다.
3. 일반 메시지는 `player.say("DIAG " + 내용)`을 사용해 긴 `tellraw`를 피합니다.
4. `@`, `[`, `]`, `{`, `}`, 큰따옴표, 역슬래시가 포함되면 **짧은 `MCFunctionPreview.previewSay()`(RawText/tellraw)**를 사용합니다. 이 문자를 `player.say()`로 출력하면 Minecraft가 Selector/명령 구문으로 해석할 수 있기 때문입니다. 출력 내용에서 문자나 오류 코드를 삭제하지 않습니다.
5. 나중에 번역할 기본 UI 문구는 `uiText(key)`에 모았습니다. `CAMERA_PRESET_ID_INVALID` 등 오류 코드와 Validator 원문 메시지는 별도로 유지되며, 이번 패치에 한국어 번역 전체가 구현된 것은 아닙니다.
6. 다른 명령의 실제 `.mcfunction` 생성 방식과 의미 AST는 변경하지 않습니다.

## 적용

1. 프로젝트 전체 폴더를 백업합니다.
2. ZIP 내부 `src/preview/diagnostic_store.ts`를 프로젝트 루트의 **동일 상대경로**에 덮어씁니다. `src/` 없이 루트에 풀면 안 됩니다.
3. 앞선 원인 분석을 위해 `function_file.ts` 또는 다른 파일에 추가한 `DIAG START`/`DIAG END` 등의 **임시 디버그 출력**이 남아 있다면 삭제하세요. 이번 ZIP에는 `function_file.ts`가 포함되지 않습니다.
4. 실제 Education 검증을 위해 GitHub 반영 및 Extension 릴리스를 수행하고 MakeCode가 **새 릴리스**를 로드하는지 확인합니다. 버전 번호를 임의로 바꾸지 않았습니다. 기존과 동일한 버전/태그만 재사용하면 캐시된 이전 코드를 불러올 수 있습니다.
5. `DIAGNOSTIC_QUERY_0.0.52_TEST_MAIN.ts`를 임시 `main.ts`로 사용하고 JavaScript → Blocks 변환을 확인합니다. `test.ts`는 비워둡니다. 임시 `player.onChat("?")` 핸들러가 있다면 제거합니다.

## Education 실행 검사 (슬래시 없이)

| 입력 | 기대 결과 |
|---|---|
| `?` | 전체 오류·경고·안내가 **즉시 여러 짧은 메시지로** 출력 |
| `diag52_warn?` | WARNING 코드 및 설명 조회만, `WARNING_TEST_EXECUTED` 미출력 |
| `diag52_info?` | INFO 코드 및 설명 조회만, `INFO_TEST_EXECUTED` 미출력 |
| `diag52_error?` | ERROR 원인 조회만, 함수 실행 없음 |
| `diag52_warn` | `WARNING_TEST_EXECUTED`만 출력, 경고 상세는 자동 출력하지 않음 |
| `diag52_info` | `INFO_TEST_EXECUTED`만 출력, 안내 상세는 자동 출력하지 않음 |
| `diag52_error` | 실행 차단, 상세는 `diag52_error?`로 조회 |
| `diag52_parent` | 내부 함수를 실행해도 상세 진단이 반복 출력되지 않음 |
| `cbi_diag` | `?`와 동일한 전체 진단 조회 |

### 현지화 및 기호 처리 회귀 확인

- 특별히 `@e[type=...]`, `[text]`, `{"key":"value"}` 등이 들어간 Validator 진단은 **원문 그대로 출력**되어야 하며, 실제 월드 Selector 치환이 일어나면 실패입니다.
- 영어/한국어 UI 문구를 바꾸는 작업은 `uiText(key)` 또는 향후 독립적인 로케일 카탈로그에서만 담당하게 확장하세요. 오류 코드 자체는 번역하지 않습니다.

## 검증 수준

- ZIP 내용 무결성 및 **ES5 TypeScript 정적 검사 통과**.
- 로컬 모의 실행에서 전체/개별 조회, INFO/WARNING/ERROR, 긴 메시지 100자 분할, 특수문자 보존 검사 통과.
- **Minecraft Education 26.32에 이번 패치를 적용한 실제 런타임 검증은 아직 대기 중**입니다. 이전 0.0.52 실험은 원인 특정 근거이지 이번 구현의 PASS 근거가 아닙니다.
