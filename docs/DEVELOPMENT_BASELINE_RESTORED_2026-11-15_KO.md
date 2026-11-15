# 분할 전송 통합 기준으로 기능 개발 재개

## 사용자 결정

2026-11-15: 지연 최적화와 로컬 Codex/개인정보 격리 환경 설정을 보류하고 기능 개발을 먼저 마무리한다. 기준은 'FunctionFile 통합, 새 분할 전송 경로의12개 명령·인코딩1,400자 제한 제거' 완료 시점이다. PXT 버전은 MakeCode에서 사용자가 관리한다.

## 정확한 복원 범위

- 기준 통합 커밋: 54293003d402fdf50ec05d56aca3e2f8877e6d68.
- 작업 전 현재 master: ad89710c54d3826b86ee3bbb4cad879eadb52ce1. 실제 pxt.json.version은0.0.21.
- 기준 이후 변경 전체를 비교했다. 런타임 차이는 function_file.ts, src/preview/diagnostic_store.ts, src/validator/validator.ts의 시작 안내/프로브 처리다. 나머지는 README·병목 시험·문서와 사용자 버전 변경이다.
- 위3개 런타임 파일 및 tests/dev/chunk_functionfile_runtime_mock.cjs를 기준 통합 커밋과 바이트 단위로 동일하게 복원한다.
- 이로써 정의 완료 INFO/OK 안내와 수동 Preview.ready의 당시 동작도 복원한다. 최근 도입한 안내 억제와 StartupProbe 후킹·전용 시험 블록은 현재 런타임에서 제외한다. 지연 해결을 주장하지 않는다.
- README에 현재 개발 기준 안내를 추가한다. 기존 시작 병목 시험 TS/Node 파일·문서는 삭제하지 않는다. 해당 시험은 당시 커밋에서 재현할 수 있는 보관 자료이며 현재 런타임의 실행/검증 목록에서 제외한다.
- pxt.json 내용·version0.0.21·files 목록은 작업 전 master와 동일하게 보존하며 이 커밋에 포함하지 않는다. 사용자가 직접 올린 버전을 예전 번호로 되돌리지 않는다.
- master 기록을 강제로 되돌리지 않고, 현재 master 위에 복원 커밋을 추가한다.

## 유지되는 통합 기능

- 기존 AST → Validator → Compiler, FunctionFile 캡처·지역 함수 펼치기·tick.json 구조.
- 새 기본 begin/part/commit 경로의12명령/인코딩1,400자 설정 한도 해제, FunctionFile 펼치기에서도 해당 경로 maxSteps=0.
- 데이터96자 분할, native 명령200자 상한, 전부 조립·길이/해시/nonce 확인 후 실행, 입력 명령 확정, 재진입 차단.
- 실제 명령 전송 경로의 GameTime ON6지점. 시작 병목 전용 ON 실험과 구분한다.
- 레거시 batch의 기존12/1,400 한도와 재귀 깊이8·큐32·조립TTL2400틱 등 다른 보호 조건은 유지한다.
- 수신기의 ZERO_RESULT 뒤 요청 내 후속 명령 중단 제약도 그대로다. 일반 mcfunction의 거짓 조건 뒤 계속 실행 의미까지 동등하다고 주장하지 않는다. 기능 개발 때 해결 범위를 따로 다뤄야 한다.

## 행동팩과 적용

기존 CBX_RUNTIME_UNIFIED_DEV_0.0.6_CHUNK_FUNCTIONFILES.mcpack을 유지한다. 이번 작업에서 행동팩을 수정하거나 GitHub에 넣지 않는다. 구버전·분리 수신기를 함께 활성화하지 않는 기존 안내를 유지한다.

MakeCode 확장을 업데이트한 뒤 일반 FunctionFile 사용자 프로그램으로 돌아간다. StartupProbe.begin/scale 호출을 넣은 병목 시험은 사용하지 않는다. 기존 tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts 또는 앞서 제공한 블록용 일반 시험을 사용할 수 있으나, 이번 복원을 이유로 추가 녹화를 요구하지 않는다. 시험 TS를 Extension main.ts에 덮어쓰지 않는다.

## 검증과 다음 개발 기준

- 실제 전체 Extension+기존 통합 시험 TypeScript5.9 ES5 검사 및 모의 실행 통과.
- 실제 로컬 행동팩 수신기+모의 Minecraft에서 지역 함수5단계·3중 execute·Fake Player 점수17·ACK2/9·요청당ON6회·입력 확정/재진입·불완전 전송 실행 금지·66명령/인코딩9,161자·긴 단일 명령·#보존 확인. native 최대135자.
- 공식 Minecraft PXT target2.2.10/core13.2.19에서 기존 통합 사용자 프로그램과 복원 소스 컴파일 성공, diagnostics0.
- 복원3개 런타임 파일과 통합 회귀 검사 파일의 Git blob hash를 통합 기준과 대조한다. pxt.json 바이트 동일 확인.
- 기존 diagnostic_store_runtime_mock.cjs / removed_alias_runtime_mock.cjs의 cbi_page 기대 불일치는 앞서 기준에서도 재현된 별도 문제다. 이 문서는 전체 테스트 PASS를 주장하지 않는다.
- Education 실게임의 지연 개선·이번 복원 후 실행 성공을 새로 확인한 것은 아니다. 이전 대표 PASS와 지연/무응답 증거를 보존한다.

이후 우선순위는 현재 소스·최신 기능 기록을 대조해 남은 명령/FunctionFile/tick.json 의미와 파일 입출력·왕복 변환의 구현 여부를 확인하는 것이다. 오래된 PROJECT_PLAN의 '다음 give/tp 구현' 목록을 최신 상태로 간주하지 않는다. 시작 성능 시험은 후순위로 남긴다. 개발을 막는 기능 오류는 별도로 처리한다.
