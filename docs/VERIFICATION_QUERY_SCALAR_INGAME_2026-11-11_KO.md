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
