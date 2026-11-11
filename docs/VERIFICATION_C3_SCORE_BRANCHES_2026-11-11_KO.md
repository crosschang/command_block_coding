# C3 점수 조건·중첩 실행 실게임 기록

사용자 제공 2026-11-11 화면과 C3_REMAINING_NATIVE_MAKECODE_MAIN.ts 기준이다.
Education/PXT의 정확한 빌드 및 화면에 실제 로드된 Extension 커밋은 미확인이다.
이 기록은 새 ZERO_ACK_V1 팩 적용 전의 기존 P4O2H 결과다.

| 단계 | 관찰 | 판정 |
|---|---|---|
| 0 | READY=true | 점수 7 설정 및 기존 ACK 준비 확인 |
| 1 | q847857_1, ACK=2, TAG_OBSERVED=true | if score matches 7 대표 GAME PASS |
| 2 | q689629_2, ACK=2, TAG_OBSERVED=true, rxTick=doneTick=13634850 | unless score matches 8 대표 GAME PASS |
| 3 | q847857_2, ACK=2, TAG_OBSERVED=true | 동일 점수 비교 대표 GAME PASS |
| 4 최초 | COMMAND_CALL 후 ACCEPT·최종 결과 미표시 | 당시 미완료 기록 보존, 원인 미확인 |
| 4 재시험 | q689629_1, 4A~4F 모두 출력, ACK=2, TAG_OBSERVED=true, rxTick=doneTick=13633190 | if 7 → nested unless 8 → tag 대표 GAME PASS |
| 5 | q689629_3, ACK=3, TAG_OBSERVED=false, COMMAND_NOT_CONFIRMED, completed=0 | 거짓 조건에서 태그 미적용 확인. 기존 수신팩의 결과 0을 오류로 바꾸는 처리 재현 |

4단계 최초 멈춤 이후 일반 채팅도 표시되지 않았다는 사용자 보고가 있었고,
월드 재입장 후 일반 채팅 및 수정 테스트가 복구됐다. 재입장 효과는 관찰했지만,
중첩 Execute·MakeCode·행동팩 중 무엇이 원인인지 확정하지 않는다.
진단 출력 추가 자체로 문제가 해결됐다고 주장하지 않는다.

5단계의 태그 미적용만으로 원시 API 반환 전체를 관찰했다고 주장하지 않는다.
다만 기존 수신팩 소스의 COMMAND_NOT_CONFIRMED는 반환 누락·비숫자·성공 횟수 1 미만을
같이 묶고 있으므로 원인 세분화가 필요하다. 새 팩은 유효한 정수 successCount=0만
ACK=9로 분리한다. 그 상태를 조건 false 확정값으로 반환하지 않는다.

## 다음 검증

- ZERO_ACK_V1 교체팩 + 수정 Extension: c3check 0 → 5 → 1 → 6을 한 줄씩 실행한다.
- 5: ACK=9, TAG_OBSERVED=false 및 ZERO_RESULT / cause=UNCONFIRMED 예상.
- 1: ACK=2, TAG_OBSERVED=true 예상. 9 처리 후 다음 새 요청이 정상인지 확인한다.
- 6: 의도적으로 tag add 인수를 누락한 Raw RUN 음성 검사. API 예외라면 ACK=3 예상.
- 새 수신팩·새 상태의 실제 게임 검증은 PENDING이다.
- 전체 Execute 조항·Selector·멀티플레이·정밀 시간 측정의 전수 PASS가 아니다.

## ZERO_ACK_V1 후속 실게임 결과

기존 위 기록은 보존한다. 아래는 교체팩을 사용한 후속 관찰이다.

| 단계 | 관찰 | 판정 |
|---|---|---|
| 0 | receipt 0/2/3/9 검증, READY=true | 새 ACK 교정 대표 PASS |
| 5 | q181581_1, successCount=0, ZERO_RESULT, cause=UNCONFIRMED, ACK=9, TAG_OBSERVED=false, rxTick=doneTick=14017824 | 결과 0 분리 대표 GAME PASS. 모든 zero의 사유를 확정한 것은 아님 |
| 1 | 바로 다음 요청 q181581_2, DONE, ACK=2, TAG_OBSERVED=true, rxTick=doneTick=14018064 | zero 처리 후 새 요청 실행·정리 대표 GAME PASS |
| 6 최초 | ENTER 후 빨간 오류, ACCEPT/ACK 없음, 5단계 안내는 이전 문구 | 이전 사용자 테스트 프로그램으로 보이며 음성 검사 PASS 아님 |
| 6 재시험 | ZERO_ACK_V1 STARTED, q333190_1 ACCEPT → 실제 CommandError(태그 이름 인수 누락) → ACK=3, TAG_OBSERVED=false | 의도한 구문 오류의 예외 처리 대표 GAME PASS |

판정 범위는 정상 완료(2)·유효한 결과 0(9)·실제 API 예외(3)의 대표 구분이다.
전체 명령의 zero/예외 정책, 배치 zero 후 자동 계속, 조회 데이터 반환은 검증하지 않았다.
