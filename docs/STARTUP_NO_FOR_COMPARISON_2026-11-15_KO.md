# 시작 병목: 반복문과 개별 블록 비교

사용자 요청에 따라 모드3의 안내 출력 제거는 해결 적용 후보에서 제외한다. 이전 모드3 시험과 상태 기록은 증거 보존을 위해 남긴다. 새 시험은 동일한 모드0에서 사용자 프로그램의 반복문만 바꾼다.

## 변경 범위

- 대상: tests/dev/STARTUP_BOTTLENECK_NO_FOR_MAIN.ts.
- 기존 fflarge의 64회 반복문을 SCOREBOARD action 64개로 직접 펼쳤다.
- BEGIN/END를 포함한 fflarge 66명령, 전체 함수9개·캡처 명령82개, 함수 정의 순서, 명령 값·순서, 채팅 등록 및 진단/INFO 동작을 유지한다.
- helper 함수·Raw Command·문자열 배열 실행으로 대체하지 않았다.
- 사용자 시험 프로그램에는 for/while/do 반복문이 없다. AST·검사·등록 Core 내부의 기존 루프는 변경하지 않는다.
- 런타임 소스/행동팩을 변경하지 않는다. 사용자 PXT 버전0.0.19와 pxt.json.files는 보존한다. 새 TS는 tests/dev 전용이므로 pxt.json.files에 넣지 않는다.

## 앞선 관측과의 관계

`2026-11-15 19-34-42.mp4`에서 관측한 모드3 스냅샷은 defs=4, finish=DEFINITIONS, last=CHAT_WAIT, CAPTURE=4/4, CHECK=16/16, STORE=4/4, DIAG=4/4, CHAT=8/9였다. 당시 한 채팅 등록 호출의 반환을 기다리고 있었으며 검사 호출은 반환 수가 일치했다.

현재 시험 코드에서 반복문이 있는 fflarge는8번째 정의다. 따라서 네 번째 정의 중 관측한 대기를 여덟 번째 함수 본문의 반복문 탓으로 직접 확정할 수는 없다. 이번 비교는 사용자 반복문을 제거했을 때 전체 시작 지연에 차이가 있는지 추가로 확인하는 통제 시험이다. 프로그램의 for를 제거한다고 등록/검사 Core 내부의 모든 반복 처리가 사라지는 것도 아니다.

## 적용과 녹화

확장·행동팩은 현재 것을 유지한다. 사용자 JavaScript 전체만 교체한다. Extension main.ts에 덮어쓰지 않는다. 새 파일의 `StartupProbe.begin(0)`은0으로 유지한다.

동일 영상에서 다음 순서로 실행한다.

1. 기존 tests/dev/STARTUP_BOTTLENECK_MAIN.ts 전체, 모드0.
2. 개별 블록판 tests/dev/STARTUP_BOTTLENECK_NO_FOR_MAIN.ts 전체, 모드0.
3. 기존 반복문판 전체, 모드0 재확인.

각각 새로 실행하고 게임으로 돌아온 시점부터 BENCH_READY/BENCH_SKIP까지 녹화한다. 편집 시간은 제외한다. 코드 내용과 계측 시작/종료 순서를 유지하기 위해 비교 실행은 JavaScript 원문으로 한다. 블록 변환 결과에서는 fflarge에 SCOREBOARD action64개가 직접 생성된다.

완료 문구가20~30초 내 없으면 기존 `?`를 한 번 입력해 상태도 보존한다. 이번에도 표시 숫자는 호출 횟수이며 밀리초가 아니다. 검사·등록 비용을 제각각의 순수 시간으로 읽으면 안 된다.

이 시험은 프로브를 활성화하여 실제 FunctionFile 명령 실행을 막는다. 목표 생성이나 함수 채팅 입력, 행동팩 교체는 필요 없다. 실제 점수 결과/ACK 시험으로 기록하지 않는다. 반복문 유무의 성능 차이는 실게임 영상으로 판단한다.

## 검증

- TypeScript5.9 ES5로 양쪽 전체 사용자 프로그램과 확장 소스 검사: PASS.
- 실제 FunctionFile 캡처/공개 블록 API/Validator/Compiler를 사용해 모든9개 정의·82개 명령 원문·순서·값을 두 프로그램 간 비교: 동일.
- fflarge 66명령 중 score add가64개: 확인.
- 양쪽 채팅 등록 목록과 계측 완료 횟수: 동일.
- 새 사용자 TS의 for/for-of/for-in/while/do AST 개수:0.
- 공개 Minecraft 타깃2.2.10/PXT13.2.19 컴파일: 오류0, binary.js 생성.
- 같은 PXT의 JavaScript→Blocks 변환: 성공, 진단0, 전체 SCOREBOARD action71개, fflarge 안에64개, 반복 블록0개 확인.
- 실제 Education 내 블록 왕복 실행·성능 차이: 검증 대기.
