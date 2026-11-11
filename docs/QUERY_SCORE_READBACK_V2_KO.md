# 점수 조회 공통 데이터 연결 — SCALAR_SCORE_V2

## 범위

기존 cbxq4 scalar 수신팩을 확장한다. 기존 시간·keepInventory와 같은
Ticket → readLive → QueryReadback.Response 경로에 ScoreboardValue를 추가했다.

새 블록 API:

```typescript
let ticket = MCFunctionLiveQuery.requestScore(
    MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
    "points")
// 이후 별도 사용자 이벤트에서
let response = QueryReadback.readLive(ticket)
if (QueryReadback.hasNumber(response)) {
    let score = QueryReadback.numberOr(response, -999)
    player.say("계산 결과=" + (score + 10))
}
```

새 공통 타입을 다시 만들지 않고 기존 TargetValue → PlayerTarget AST를 재사용한다.
이번 단계 지원은 필터 없는 @s 및 직접 입력한 점수 보유자 이름이다.
Command.scoreboardFakePlayer()도 같은 TargetValue를 반환하므로 재사용한다.

이름 조회는 Objective 참가자 중 Player/FakePlayer의 displayName이 정확히 일치하는
단일 identity를 읽는다. 같은 이름이 여러 개면 AMBIGUOUS_SCORE_HOLDER 오류로 처리하고
값을 임의 선택하지 않는다. entity의 displayName을 플레이어 이름으로 추정하지 않는다.

@a/@e/@p/@r/@initiator, 필터 있는 @s, wildcard *는 이번 scalar 조회에서 미지원이다.
조건을 지우거나 첫 번째 대상만 선택하지 않고 요청 전에 실패를 반환한다.
이는 canonical Selector/Scoreboard 명령의 지원 범위를 축소하는 변경이 아니다.
실행 명령·AST·Compiler·mcfunction 출력은 변경하지 않는다.

## 결과 의미

| 상황 | 공통 상태 | 자료형/값 |
|---|---|---|
| 값 있음 | Ready=1 / OK | Number, 음수·0·양수 그대로 |
| Objective 없음 | Missing=5 / OBJECTIVE_NOT_FOUND | None, 기본 0을 값으로 쓰지 않음 |
| 해당 Objective에 점수 없음 | Missing=5 / SCORE_NOT_FOUND | None |
| API 예외·모호한 이름·잘못된 반환 | Error=2 / SERVER_ERROR | None |
| 아직 응답 없음 | Pending=0 | None |

기존 상태 번호는 유지하고 Missing을 끝에 추가한다. 일반 request(ScoreboardValue)는
필수 Objective/대상이 없으므로 USE_REQUEST_SCORE_BLOCK을 반환한다.
점수는 requestScore 블록으로 요청한다. 기존 numberValue getter도 점수 Number를 읽는다.
hasNumber 확인 또는 명시적 fallback 사용이 필요하며 ACK 2/3/9와 연결하지 않는다.

## 수신 구현과 제한

- 실제 world.scoreboard.getObjective → identity 확인 → hasParticipant/getScore를 사용한다.
- 조회 자체가 Objective/점수를 생성·설정·수정하지 않는다.
- signed int32 전체 범위를 2^31 bias를 적용한 32개 비트로 전송한다.
  JS의 signed bitwise 연산을 쓰지 않고 정확한 정수 산술로 복원한다.
- 4개 바이트를 순서대로 반영한 8-bit checksum, ready-last 및 기존 ACK/취소를 사용한다.
  checksum은 인증·암호화가 아니며 모든 변조를 감지하는 보장이 아니다.
- score_self / score_name 요청에 Objective/이름 UTF-16 hex 메타데이터를 붙인다.
  명령 문자열을 만들어 실행하는 경로가 아니다.
- 메타데이터는 각각 최대 64 UTF-16 단위다. 이 한도는 전송 한도이며 Minecraft ID
  자체의 새 문법 제한이 아니다. 제어 문자·wildcard·selector처럼 보이는 이름은 거절한다.
- 플레이어별 ID/취소·만료/제한 구조는 V1에서 유지한다. 실제 멀티 검증은 통합 단계 대기다.

## 적용

1. requestScore와 Missing을 포함한 Extension 소스를 반영한다.
2. CBX_LIVE_QUERY_SCALAR_SCORE_V2_DEV.mcpack으로 SCALAR_V1 조회팩을 교체한다.
   동일 UUID, 팩 버전 0.0.1 → 0.0.2. V1과 중복 활성화하지 않는다.
3. 기존 P4O2H ZERO RESULT ACK 팩은 유지한다. cbxp4o2h 실행 이벤트는 변경하지 않는다.
4. 의존 @minecraft/server 2.8.0 유지. ping은 PING_OK SCALAR_SCORE_V2를 출력한다.
5. QUERY_SCORE_V2_MAKECODE_MAIN.ts 전체를 사용자 MakeCode JavaScript에 적용한다.

새 Extension 실행용 TS 파일은 없고 기존 등록 파일 2개만 수정했다.
pxt.json.files와 사용자 PXT 0.0.8은 변경하지 않는다.
행동팩·전용 소스·검사는 GitHub에 넣지 않고 별도 제공한다.

## 싱글플레이 점수 테스트

테스트 전용 Objective cbxq_lab을 사용한다. qscore 0은 자기 점수를 0,
fake #cbxq_probe를 -7로 설정하고 #cbxq_missing의 해당 Objective 점수만 reset한다.
이 이름들은 테스트 전용으로 확보한다. 다른 Objective/참가자를 삭제하지 않는다.

| 순서 | 채팅 | 예상 |
|---|---|---|
| 준비 | qscore 0 | READY=true, PING_OK SCALAR_SCORE_V2 |
| 숫자 0 | qscore 1 → qscore 2 | NUMBER=0 ADD_10=10, BRANCH=ZERO |
| fake 음수 | qscore 3 → qscore 4 | NUMBER=-7 ADD_10=3, BRANCH=NEGATIVE |
| 점수 없음 | qscore 5 → qscore 6 | STATE=5 REASON=SCORE_NOT_FOUND, no new value used |
| 보존 | qscore 7 | STORED_SCORE=-7, 점수 없음 때문에 0으로 덮어쓰지 않음 |

한 줄씩 출력 후 진행한다. PENDING이면 읽기 단계만 다시 입력한다.
qscore 8은 명시적 취소다. timeout/취소의 실제 게임 판정은 별도다.
숫자 0이 scoreboard에서 통과해도 별도 daytime=0 codec 시험을 대신하지 않는다.

## 기존 scalar 경계 확인

새 전체 테스트 코드에는 qdata 0~6도 포함한다. 다음은 별도 테스트 월드에서 시행한다.

- 불리언 true: 먼저 `/gamerule keepinventory`로 원래 값을 기록한다.
  `/gamerule keepinventory true` → qdata 3 → qdata 4에서 BOOLEAN=true / BRANCH=TRUE 확인 후
  기록한 원래 값으로 복구한다.
- daytime 0: 먼저 `/gamerule dodaylightcycle`, `/time query daytime` 값을 기록한다.
  `/gamerule dodaylightcycle false`, `/time set 0` → qdata 1 → qdata 2에서
  NUMBER=0 ADD_100=100 확인 후 기록한 시간/주기 설정을 복구한다.
- qscore 0 또는 qdata 0으로 먼저 채널 교정을 완료한다.
- 테스트 프로그램은 시간·gamerule을 자동 변경하지 않는다.

## 검증 범위

새 점수 디코더·공통 응답, 실제 수신 스크립트의 모의 검증 및 API 2.8.0 타입 검사를
수행한다. 점수 실제 0/음수/누락·이름 조회·새 V2 팩은 실제 게임 판정 전까지 PENDING이다.
V1의 대표 실게임 결과는 VERIFICATION_QUERY_SCALAR_INGAME_2026-11-11_KO.md에 보존했다.

- 실제 디코더·wire 검사 29개, 수신팩+디코더 모의 연결 37개,
  공통 응답 회귀 14개, ACK 회귀 9개: 합계 89 LOCAL PASS.
- @minecraft/server 2.8.0 실제 타입 기반 수신 JS 검사: 진단 0.
- Extension 기존 TypeScript 진단 52개 유지, 추가 진단 0, 사용자 테스트 진단 0.
  기존 진단이 남아 있으므로 전체 컴파일 성공이라고 표현하지 않는다.

## 공식 근거

- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/scoreboardobjective?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/scoreboardidentitytype?view=minecraft-bedrock-stable
- @minecraft/server 2.8.0 실제 타입 정의와 대조한다.
