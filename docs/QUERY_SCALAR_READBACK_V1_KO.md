# 조회값 → MakeCode 변수·계산·조건 연결 — SCALAR_V1

## 현재 구현

기존 src/preview/cbx_live_query.ts의 V4 요청·태그 디코더와
src/preview/query_result.ts의 QueryReadback 공통 응답을 재사용한다.
이번 수신팩은 기존 wire 중 두 가지 자료형만 구현한다.

| 입력 | 실제 읽기 | 공통 응답 | 사용자 코드 사용 |
|---|---|---|---|
| Daytime | world.getTimeOfDay() | Number | returnedTime에 저장 → +100 계산 |
| KeepInventory | world.gameRules.keepInventory | Boolean | returnedKeepInventory에 저장 → if 분기 |

명령 ACK 2·3·9와 조회 데이터는 별개다. 채팅 문자열에서 숫자를 추출하거나 고정값을
측정값으로 쓰지 않는다. 새 AST 명령·문법을 만들지 않고 조회 전용 런타임으로 연결한다.
MakeCode의 변수·if·계산을 mcfunction으로 자동 변환하는 기능은 아니다.

## 별도 팩과 적용

- CBX_LIVE_QUERY_SCALAR_V1_DEV.mcpack (팩 버전 0.0.1), @minecraft/server 2.8.0.
- 기존 P4O2H ZERO RESULT ACK 팩을 유지하고 새 조회팩을 추가로 활성화한다.
- 이벤트는 cbxq4:req / ack / cancel / ping이다. 기존 cbxp4o2h 실행 이벤트와 다르다.
- 기존 별도 cbxq4 수신팩이 있다면 비활성화해 수신기가 중복되지 않게 한다.
- CBXTB 등 다른 네임스페이스 팩은 이번 작업 때문에 교체하지 않는다.
- Players/Objectives/Participants/MyTags 목록 조회, scoreboard 숫자 조회는 미구현이다.
  이번 팩에 해당 요청을 보내면 SERVER_ERROR를 반환한다. 빈 목록이나 0으로 위장하지 않는다.
- 행동팩 파일·전용 소스·전용 테스트는 GitHub에 넣지 않는다.
- 새 MakeCode 실행용 TS 파일은 없으며 pxt.json.files 수정은 필요 없다.
  사용자 테스트 TS는 Extension main.ts와 별도다. 사용자 PXT 0.0.7을 보존한다.

## 요청·수신과 한계

1. calibrate로 testfor의 실제 true/false 반환을 확인한다.
2. request는 기존 token|op|page 형식 이벤트를 한 번 전송하고 Ticket을 반환한다.
3. 수신기는 sourceEntity 플레이어별로 요청을 분리하고 API 스냅샷을 읽는다.
4. 데이터 태그를 쓴 후 마지막에 ready를 쓴다. 시간에는 기존 8-bit 체크섬을 쓴다.
5. 다음 사용자 이벤트에서 readLive(ticket)로 읽는다. Pending이면 값을 쓰지 않는다.
6. 준비된 숫자·불리언만 변수에 복사하고 계산/분기에 쓴다. 실제 0·false는 유효하다.
7. 기존 decoder가 ACK해 임시 태그를 정리한다. 저장한 MakeCode 변수는 유지한다.

receiver는 요청당 1300틱 만료, 플레이어당 4개·전체 64개 활성 요청 제한을 둔다.
client는 1200틱 초과 미준비 요청을 취소한다. 최근 512개 요청 키로 중복을 억제한다.
ACK·취소는 sourceEntity.id + token으로만 자신의 요청을 닫는다. 취소·퇴장 후
예약된 작업은 값을 다시 쓰지 않는다. 재접속/팩 초기화 시 이전 scalar 태그 형식만 정리한다.

이는 인증·암호화나 모든 공격/세션 재사용에 대한 보장이 아니다. token은 기존
gameTime·일련번호·난수를 재사용한다. 동일 네임스페이스 팩의 동시 사용은 지원하지 않는다.
만료 정리 중 이미 퇴장한 엔티티의 태그 삭제는 실패할 수 있어 재접속 정리로 보완한다.
제한 초과/형식 불량 요청은 로그로 거절하며 데이터 응답을 조작하지 않는다.

자동 polling worker, loops.forever, 내부 대기·자동 재시도는 없다. system.run은
요청 1회 처리, runTimeout은 만료 정리 용도다. 실제 게임 왕복 시간은 미측정이다.

## 사용자 테스트

QUERY_SCALAR_MAKECODE_MAIN.ts 전체를 사용자 MakeCode JavaScript에 적용한다.
Extension에는 이미 필요한 LIVE QUERY / QUERY RESULT 공개 API가 있다.

| 채팅 | 의미 | 기대 로그 |
|---|---|---|
| qdata 0 | 읽기 채널 교정 및 팩 ping | CHANNEL_READY=true, PING_OK SCALAR_V1 |
| qdata 1 | 현재 시간 요청 | SENT=true, 팩 READY value=N |
| qdata 2 | 시간 응답 읽어 계산 | STATE=1 REASON=OK, NUMBER=N ADD_100=N+100 |
| qdata 3 | keepInventory 요청 | SENT=true, 팩 READY value=true 또는 false |
| qdata 4 | 불리언 응답 읽어 조건 분기 | STATE=1 REASON=OK, BOOLEAN 값과 같은 BRANCH |
| qdata 6 | 읽고 저장한 변수 재사용 | STORED_TIME / STORED_KEEP |
| qdata 5 | 미완료 요청 취소 | CANCEL requested |

한 줄씩 결과 확인 후 진행한다. qdata 2/4가 PENDING이면 같은 읽기 단계만 다시 입력한다.
요청 단계 재입력은 자동 재시도가 아니다. 미완료 요청을 덮어쓰지 않도록 테스트에서 막는다.
CHANNEL_READY는 MakeCode의 태그 읽기 검증이며 팩 설치 성공을 뜻하지 않는다.
READY 팩 로그가 있어도 MakeCode REASON=OK / 실제 변수 사용 전에는 종단 PASS가 아니다.

테스트 프로그램은 시간·gamerule을 변경하지 않는다. 실제 0·false 경계의 실게임 확인은
별도 테스트 월드에서 원래 설정을 기록·복구하며 시행한다. 이번 로컬 검사만으로
그 경계의 GAME PASS를 부여하지 않는다.

## 검증 기록

- Extension 실제 request/decoder + 공통 응답을 태그 모의 데이터로 검사: 15 LOCAL PASS.
- 별도 실제 receiver + 실제 decoder + 공통 응답 전체를 연결한 모의 검사: 20 LOCAL PASS.
  숫자 0/1/6000/23999, false/true, 대기·만료·취소, 동일 token 두 플레이어,
  다른 플레이어 ACK/취소, 중복·스냅샷 보존·퇴장·잘못된 API 값 등을 포함한다.
- 실제 @minecraft/server 2.8.0 타입 정의로 수신 JS 정적 검사: 진단 0.
- 새 수신팩의 Education 실제 지원, 실제 변수·분기·계산, 멀티플레이 격리는 GAME PENDING.

## 공식 API 근거

- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/world?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/gamerules?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/playerleaveafterevent?view=minecraft-bedrock-stable
- npm @minecraft/server 2.8.0의 실제 타입 정의로 별도 대조했다.
