# 0.0.65 Preview 진단 시스템 안정화 (2026-10-17)

## 대상과 원칙

- 기준: 사용자 제공 `command_block_coding(20261017-002903).zip`, `pxt.json.version=0.0.65`. **버전 번호 유지.**
- 이 작업은 **기능 안정화 정리**입니다. Minecraft Education에서 확인된 빠른 출력 구조와 AST/Compiler/Validator/Registry, `.mcfunction`의 의미를 변경하지 않습니다.
- 진단은 Preview 전용 파생 데이터로, 원본은 `DiagnosticRecord[]`, 조회 표시문은 `cachedPageTexts[]` 및 `cachedDetailLines[]`에 저장됩니다. `?`와 `함수명?`은 재검증하지 않습니다.

## 변경 사항

- `src/preview/diagnostic_store.ts`: 조사 과정에 추가했던 `probeFindDetailIndex`, `probeWalkDetailCharsAt`, `probeEmitDetailAt` (임시 공개 검사 API 3개) 삭제.
- 루트 임시 검사 조각 `MAIN_TS_APPEND_REAL_CACHE_PROBES.ts` 제외. 정식 테스트는 `tests/DIAG_0.0.65_STABILITY_MAIN.ts`로 분리해 보존.
- `main.ts`, `test.ts`, `function_file.ts`, `src/preview/output_adapter.ts`, `pxt.json` 변경 없음. `pxt.json.files`를 통한 MakeCode Extension 등록 구조 그대로 유지.
- 기존 7개 특수문자의 `String.indexOf()` 검사, `showBlockedExecutionHint()`, `?`, `cbi_page`, `함수명?` 유지. (과거 별칭 제거는 별도 제거 기록 참조.)

## 자동 회귀 검사 (Mock Preview)

- `tests/dev/diagnostic_store_runtime_mock.cjs`: TypeScript ES5 트랜스파일 후 모의 `player.say`, `player.onChat`, `MCFunctionPreview.previewSay`로 진단 시스템 테스트 16개 실행.
- 실행: 개발 환경에 Node.js와 `typescript` 패키지가 설치되어 있어야 합니다. 저장소 루트에서 `node tests/dev/diagnostic_store_runtime_mock.cjs` 실행. (전역 TypeScript만 있다면 환경에 따라 `NODE_PATH=$(npm root -g)` 설정 필요)
- 다루는 범위: 중복 등록 방지, ERROR/WARNING/INFO 집계, 요약·상세 조회, 오류 안내, 특수문자 출력 선택, 캐시 무효화, 중복 레코드 방지, 페이지, 임시 API 제거.
- 이것은 **모의 실행**이며 Minecraft Education·PXT 컴파일을 대체하지 않습니다.

## Minecraft Education에서 확인된 이전 사용자 테스트

| 항목 | 근거와 상태 |
| --- | --- |
| `?` / `함수명?` 출력 속도 | `indexOf()` 적용 후 사용자가 '놀라울 정도로 빨라졌다'고 확인 (기존 0.0.62 계열) |
| 일반 ERROR 함수 실행 시 차단 안내 | 빠른 차단 안내 패치 후 사용자가 '즉시 표시된다'고 확인 (기존 0.0.62 계열) |
| ERROR 명령의 실행 차단 | 기존 테스트에서 명령 실행이 차단됨을 관찰 |
| WARNING / INFO 정상 실행 및 침묵 실행 정책 | 기존 사용자 테스트 확인, **이번 안정화 패키지에서 재확인 필요** |
| 이번 0.0.65 안정화 정리본의 실게임 실행 | **미검증 (새 릴리스 후 직접 확인 필요)** |

> 로컬 TypeScript/모의 런타임 테스트 통과는 실제 MakeCode PXT 컴파일이나 Education 게임 실행 통과와 동일하지 않습니다.

## 적용 / 실게임 재검증

1. 기존 GitHub 프로젝트를 백업하고 `src/preview/diagnostic_store.ts` 교체. 테스트 목적으로 남아 있던 루트 `MAIN_TS_APPEND_REAL_CACHE_PROBES.ts` 파일은 제거할 수 있습니다.
2. GitHub 커밋 후 **새 테스트 릴리스/태그**를 만들고 MakeCode에서 업데이트된 Extension이 반영됐는지 확인합니다. 버전 번호는 사용자가 릴리스 정책에 따라 결정합니다 (배포물의 현재 버전 값은 0.0.65).
3. MakeCode `main.ts`는 일시적으로 `tests/DIAG_0.0.65_STABILITY_MAIN.ts` 내용으로 교체하고, `test.ts`는 빈 파일로 유지합니다. **두 파일을 중복 배치하지 않습니다.**
4. Education에서 `? → diag52_warn? → diag52_info? → diag52_error? → ?` 순으로 조회하고 지연/누락/응답 누적 확인.
5. `diag52_error`를 **두 번** 입력해 차단 안내가 빠르게 나오는지, `ERROR_MUST_NOT_EXECUTE`가 나오지 않는지 확인합니다.
6. `diag52_warn`, `diag52_info` 각각 실행: `WARNING_TEST_EXECUTED` / `INFO_TEST_EXECUTED`는 나오되 일반 실행 중 WARN/INFO 상세 헤더는 나오지 않아야 합니다. Camera Preset의 실제 적용 성공은 별도 명령 플랫폼 조건에 따라 다릅니다.
7. `diag52_ok`와 `diag52_parent` 확인: 정상 실행, 내부 경고 중복 출력 없음.
8. 블록↔JavaScript 변환과 기존 명령 샘플, `pxt.json` 파일 포함 상태 확인 후 테스트용 `main.ts`를 원복합니다.

## 판정 기준

- 전체 조회/개별 조회/차단 안내가 중단 없이 빠르게 응답하고, 명령 실행 허용/차단 정책이 유지되면 **Education Runtime PASS**로 기록합니다.
- 지연이 다시 발생하면 변경된 `diagnostic_store.ts`와 테스트 영상, 입력 순서를 함께 보존한 후 원인을 재조사합니다.
- `src/preview/output_adapter.ts`의 JSON 이스케이프용 문자 순회 등 **다른 Preview 경로**는 이번 변경 범위에서 제외했습니다.

## 설계·호환성 경계

현재 MakeCode Preview와 실제 `.mcfunction` 생성 결과는 별개입니다. 진단 UI용 캐시는 Minecraft AST의 Source of Truth가 아니며 Compiler 결과에 포함되지 않습니다. 향후 현지화 시 메시지 표시문이 바뀌면 캐시 갱신 절차가 필요합니다.
