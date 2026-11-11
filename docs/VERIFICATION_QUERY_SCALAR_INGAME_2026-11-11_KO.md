# Scalar 조회 실제 게임 검증

근거: 사용자 제공 image(20261111-082846).png, image(20261111-082905).png.
정확한 Education/PXT 빌드와 화면에 로드된 Extension 커밋은 미확인이다.
프로그램 표시는 QDATA SCALAR_V1 STARTED, 수신기는 PING_OK SCALAR_V1이다.

| 단계 | 관찰 | 판정 |
|---|---|---|
| qdata 0 | CHANNEL_READY=true 및 수신팩 PING_OK | 채널·팩 응답 대표 PASS |
| qdata 1 → 2 | time_daytime value=1000, STATE=1 REASON=OK, NUMBER=1000 ADD_100=1100 | API 조회 → 실제 데이터 수신 → 계산 대표 GAME PASS |
| qdata 3 → 4 | rule_keepinventory value=false, STATE=1 REASON=OK, BOOLEAN=false BRANCH=FALSE | 실제 false 값과 MakeCode 조건 분기 대표 GAME PASS |
| qdata 6 | STORED_TIME=1000, STORED_KEEP=false | 응답 소비 이후 MakeCode 변수 유지·재사용 대표 GAME PASS |
| qdata 5 | 이미 읽은 뒤 CANCEL requested | 출력만 확인. 미완료 요청 취소/팩 정리의 GAME PASS가 아님 |
| qdata 7 | 도움말 stages 0 1 2 3 4 5 6 | 미정의 단계의 정상 안내. 오류 아님 |

다음은 미검증으로 보존한다: daytime=0, keepInventory=true, 실제 만료·미완료 취소,
오류 주입, 부하·정밀 지연, scoreboard 점수 및 모든 목록 조회.
V1의 성공을 후속 V2 수신팩의 전체 PASS로 확대하지 않는다.

## 사용자 지정 개발 순서

사용자는 2026-11-11 멀티플레이 실게임 검증을 기능 완성 후 통합 테스트로 미루기로 했다.
현재 개발의 선행 조건으로 삼지 않는다. 요청 ID·플레이어별 분리 구조와 기존 모의
회귀 검사는 유지한다. 실제 멀티플레이, 응답 혼합·동시성·재접속 전수는 대기다.

현재 순서: 싱글플레이 경계 확인 → scoreboard 등 공통 반환 확장 → 기능 통합 후 멀티.

## V2 경계·점수 후속 실게임 확인

근거: image(20261111-105430).png, image(20261111-110204).png,
image(20261111-110218).png 및 QUERY_SCORE_V2_MAKECODE_MAIN.ts.

| 항목 | 관찰 | 판정 |
|---|---|---|
| daytime 0 | DATA SCALAR_SCORE_V2 시작·ping, API value=0 → STATE=1 REASON=OK → NUMBER=0 ADD_100=100 | 숫자 0 경계 대표 GAME PASS |
| keepInventory true | API value=true → STATE=1 REASON=OK → BOOLEAN=true BRANCH=TRUE | 불리언 true 경계 대표 GAME PASS |
| 자기 점수 0 | score_self value=0 → NUMBER=0 ADD_10=10 BRANCH=ZERO | 점수 0 대표 GAME PASS |
| fake holder 음수 | score_name value=-7 → NUMBER=-7 ADD_10=3 BRANCH=NEGATIVE | #cbxq_probe 단일 이름 조회 대표 GAME PASS |
| 점수 없음 | MISSING_SCORE → STATE=5 REASON=SCORE_NOT_FOUND → no new value used | 값 없음과 0 구분 대표 GAME PASS |
| 저장 변수 유지 | 누락 응답 후 STORED_SCORE=-7 | 마지막 유효값 보존 대표 GAME PASS |
| 테스트 설정 | 시간 1000, keepinventory=false, dodaylightcycle=false 적용 메시지 | 사용자가 선택한 테스트 상태 확인. 원래 설정을 추정 복구했다고 주장하지 않음 |

사용자는 원래 설정을 따로 기록하지 않았다고 했으며, 시간이 멈춘 상태였을 것이라고
정정했다. 따라서 향후 설정을 바꾸는 테스트는 현재 값을 먼저 확인·기록하고 복구한다.

미검증으로 남길 것: Objective 없음, 실제 named player의 점수, 중복 이름,
int32 최솟값·최댓값, 모든 Selector, 목록, 실제 만료/취소, 부하, 멀티 실게임.
이전 위 표의 미검증은 당시 상태이며 이 후속 표가 해당 대표 사례를 갱신한다.
후속 V3 수신팩에 이 결과를 자동으로 옮겨 GAME PASS를 부여하지 않는다.
