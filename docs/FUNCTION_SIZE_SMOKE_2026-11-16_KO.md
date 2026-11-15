# 단일 FunctionFile 성공 뒤 명령 수·조각 수 증가 시험

## 앞선 실게임 근거

image(20261115-232719).png에서 ffone:OK → ffone 입력 → PLAYER_SCORE_PASS → CHUNK_BEGIN parts1 → CHUNK_ACCEPT steps1 → FF_ONE_OK → DONE steps1 → ACK_DONE poll1 확인. 요청ID q876332_1, receiver rxTick/doneTick15886609다. 단일 SAY FunctionFile의 정의→전송→실제 실행→MakeCode 완료 확인은 해당 실행에서 PASS다. 같은 월드에서 재접속 없이 실행하도록 안내했으나 화면 자체에는 재접속 여부가 없으므로 조건을 영상 밖 사실로 확대하지 않는다. 26명령·#·점수·중첩 execute 성공은 이 화면으로 증명되지 않는다.

## 새 시험

사용자 지시에 따라 단일 SAY 다음에는 동일한 SAY만2·13·26개로 늘린다. tests/SMOKE_FUNCTION_SIZE_MAIN.ts 전체를 사용자 JavaScript로 교체하고 같은 월드에서 재접속하지 않고 새 실행한다. Extension main.ts에 덮어쓰지 않는다. 현재 복원 확장·행동팩0.0.6·PXT0.0.22를 유지하며 목표 생성은 필요 없다.

사용자 코드에는3개 FunctionFile과 개별 Command.say41개만 있다. 반복문·점수·#·중첩 execute·별도 전송 함수·시작 타이머를 넣지 않는다. 기존 FunctionFile 캡처→AST/검사/Compiler→분할 송신→행동팩→ACK 경로를 사용하며 요청당 실행ON6회도 그대로다. 이 시험은 명령 수와 조각 수가 동시에 증가하는 대표 규모 비교이며 둘 중 어느 쪽의 비용인지 단독으로 분리하는 성능 시험은 아니다.

| 입력 | 요청 내 명령 수 | 인코딩 길이 | 조각 수 | 마지막 실행 출력 |
|---|---:|---:|---:|---|
| ff2 | 2 | 121 | 2 | FF2_STEP_02 |
| ff13 | 13 | 844 | 9 | FF13_STEP_13 |
| ff26 | 26 | 1689 | 18 | FF26_STEP_26 |

각각 마지막 STEP 출력과 같은 요청의 DONE steps=N/ACK_DONE을 확인하고 다음을 입력한다. 3개 요청의ID는 서로 달라야 한다. 첫 무응답·오류에서 중단하고 해당 명령과 화면을 남긴다. 입력을 반복하거나 재접속 후 성공을 이전 실행의 PASS로 합치지 않는다. 설정을 다시 바꾸거나 미리 ACK보정을 따로 실행할 필요 없다.

13명령은 기존12명령 상한을 넘지만 인코딩1400자 미만이다.26명령은 둘 다 넘는다. 실제 게임 엔진/메모리/전송시간의 무제한을 주장하지 않는다. 각 요청의 BEGIN/ACCEPT는 아직 실행 완료가 아니므로 마지막 출력·DONE·ACK까지 확인한다.

## 사전 검증 및 변경 범위

실제 기준 master6bc4e508928e0e416b0ec96a5b7adf75c6dba5b0와 로컬 pxt.json.version0.0.22 확인. 원래3개 런타임 복원 상태를 유지한다. TypeScript ES5+실제 로컬 수신기 모의 검사에서2/13/26개 문자열의 순서·내용, 인코딩121/844/1689 및2/9/18조각, 각ACK2·ON6회·서로 다른3요청ID 확인. 전체41개 명령은 정의 때 실행되지 않고 요청 때만 실행됨을 확인했다.

Minecraft PXT target2.2.10/core13.2.19 컴파일·블록 변환 diagnostics0. 실게임 규모 시험은 미검증이다. 시험TS·Node 검사·이 문서만 추가하며 pxt.json.files 등록 불필요, 버전·런타임·행동팩·릴리즈 변경 없음. 기존 실패·지연·미검증 기록은 보존한다.
