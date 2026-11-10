# Native API 대표 검증과 다음 개발 순서 — 2026-11-11

## 판정 범위

Minecraft Education PC 플레이어 n15가 제공한 화면·영상과 사용자 테스트 프로그램을
대조한 기록이다. 현재 소스의 버전과 실제 영상에 로드된 패키지 버전을 자동으로
동일시하지 않는다. 영상에서 Education/PXT의 정확한 빌드 번호는 확인되지 않았다.
과거 26.32 기록을 이번 환경의 실측 버전으로 옮겨 적지 않는다.

실행 경로: Command 블록 → 기존 Adapter/AST → Validator/Compiler →
NativePlayerAck → 기존 P4O2H 수신팩 → source player runCommand → ACK.
ACK=2는 실행 상태이며 조회 데이터가 아니다. native successCount는 정밀 좌표 측정이 아니다.

| 단계 | 입력/목적 | 관찰과 근거 | 판정/한계 |
|---|---|---|---|
| 1 | execute as/at → tag @s add | 11/10 화면 q348841_1, ACK=2, TAG_OBSERVED=true. 11/11 재시험 q993219_1도 확인 | 대표 GAME PASS. 모든 조항의 PASS 아님 |
| 2 | 고급 summon rotation 90 0 | 거치대 생성, ACK=2. 08-08-39 영상에서 긴 대기 없이 생성 | 실행·시각적 방향 대표 PASS. yaw 수치 정밀 측정 대기 |
| 3 | 고급 summon facing @s | 08-12-30 영상 q993219_4, ACK=2/poll=1, rxTick=doneTick=13406623. 새 거치대가 플레이어 쪽을 향한 모습 | 대표 GAME PASS. 모든 selector·동시성·각도 전수 아님 |
| 4 | execute rotated 90 0 run tp @s ^ ^ ^1 | 08-15-01 영상 q993219_6, ACK=2/poll=1, rxTick=doneTick=13409583. 표시 좌표 (28,-60,-136) → (27,-60,-136) | 회전 문맥·X 감소 방향 대표 GAME PASS. 정수 표시만으로 소수점까지 정확한 1m를 실측했다고 하지 않음 |
| 5 | anchored eyes → positioned ^ ^ ^3 → run advanced summon | 08-17-45 영상 q993219_7, ACK=2/poll=1, rxTick=doneTick=13413042. 전방 공중 생성 후 아래로 이동·착지 | 실행·전방 생성 대표 GAME PASS. 정확한 초기 높이/거리/회전 수치는 PENDING |

5단계의 바닥 블록은 시각적 기준이다. 사용자는 플레이어가 블록 정중앙이 아니었다고
명시했다. 블록 중앙과 거치대 중심이 다르다는 이유로 실패 판정을 하지 않는다.
정착 후 위치와 최초 소환 위치를 구분한다.

## 지연 기록 — 해결로 처리하지 않음

- 07-59-01 영상: 최신 cbxtrace 진단 코드. cbxtrace 0으로 준비 후 2를 실행.
  채팅 입력 표시 약 3.25s → 수신/생성 표시 약 5.25s. 약 2초의 화면상 간격.
  BEFORE_YIELD → SEND_BEGIN도 화면상 간격이 보임. pause(1)의 인자와 전체 경과시간을 혼동하지 않는다.
- 08-00-03 영상: 이전 cbxnative 코드. 1단계 성공 이후 2단계 입력 표시 약 13s →
  ACCEPT/DONE 약 27.25s. 약 14초 대기 재현. 구간 도중 채팅창을 다시 연다.
  콜백 시작/전송 직전 표시가 없어 정확한 대기 지점 및 UI 재개 영향은 미확인이다.
- 08-08-39 영상: 이전 코드에 CBXOLDTRACE 출력만 추가. 2단계에서 약 1~2초 내
  생성이 관찰되며 이전 긴 대기는 재현되지 않음.
- 위 시간은 영상의 표시를 표본 프레임으로 읽은 근사치다. 정밀 ms 계측이 아니다.
- 수신 이후 같은 틱 완료는 입력부터 수신까지의 지연을 부정하지 않는다.
- 로그 자체, MakeCode 스케줄링, 실행 세션 상태는 원인 후보다. 예열이나 특정 원인으로
  확정하지 않는다. 로그 추가로 속도 개선 완료라고 주장하지 않는다.

## C3 잔여 점검

- 기존 21종 ExecuteClause와 조립식 RUN/중첩 블록을 보존한다.
- 점수 matches의 32-bit 정수 경계, Facing kind/anchor, 잘못된 enum,
  nested RUN 순환 참조를 정적 검사에서 차단하도록 보완한다.
- if/unless entity/block/blocks/score와 중첩은 canonical 출력 검사와 게임 판정을 분리한다.
- 기존 P4O2H 팩은 successCount<1을 오류로 처리한다. 조건 불충족이 zero/예외로
  돌아오는 실제 형태와 후속 명령 처리 정책은 별도 검증해야 한다.
  조건 불충족을 문법 오류라고 기록하거나 모든 0을 성공으로 바꾸지 않는다.
- 정확한 동시 틱·멀티플레이 전수·장시간 부하·정밀 좌표 측정은 완료되지 않았다.

## 로컬 검사 (게임 판정과 별도)

- C3_CANONICAL_BOUNDARY_REGRESSION.cjs: 33항목 LOCAL PASS.
- 기존 B3_C1_STRUCTURED_COMMANDS_REGRESSION.cjs는 문법 사례 검사 후
  과거 버전 0.0.72 고정 assertion에서 실패한다. 현재 버전은 사용자가 변경한 0.0.5다.
- 기존 C1_RIDE_DIALOGUE_STATIC_REGRESSION.cjs는 기능 검사 3개 통과,
  과거 버전 0.0.77 고정 assertion 1개 실패다.
- 기존 integrated_unit_test.js는 stub에 MCFunctionCBX12Bridge 선언이 없어
  TypeScript 컴파일 단계에서 실패한다. 이 파일의 실행기를 이번 변경에서 수정하지 않았다.
- 위 실패를 숨기거나 전체 회귀 PASS라고 기록하지 않는다. 버전을 과거값으로 되돌리지 않는다.

## 조회 반환 현황의 정정

src/preview/cbx_live_query.ts에는 이미 cbxq4 Ticket/Result와 페이지 문자열 목록,
daytime 숫자·keepInventory 불리언 역수신 시제품이 존재한다. 결과 데이터 기능이
전혀 없다고 한 이전 설명은 부정확했다. 다만 파일 헤더 자체가 V4 codec의 별도
실게임 검증 필요를 명시하며, 현 P4O2H 팩은 cbxq4 수신기를 포함하지 않는다.

따라서 현재 상태는 "기존 시제품 존재 / 현재 팩 연결·공통화·실게임 검증 미완료"이다.
공통 반환 구조는 이 시제품을 재사용하고, ACK와 데이터 응답을 구분하며,
PENDING/실패의 기본값 0·false를 실제 조회값처럼 사용하지 않게 해야 한다.

## 사용자 지정 순서

1. 이 검증 기록을 보존한다.
2. C3의 실제 누락·검증 경계를 보완한다. 이미 PASS인 대표 사례를 모두 반복하지 않는다.
3. 조회값을 데이터로 반환하는 공통 구조를 구현한다. 값 타입·상태·요청 대응과
   변수/조건/계산 사용을 시험하되, .mcfunction으로 자동 변환 가능하다고 주장하지 않는다.
4. 부하/성능 재연구는 선행 게이트로 되돌리지 않는다.

행동팩 소스·팩 파일·사용자 영상은 이 문서를 위해 저장소에 추가하지 않는다.
