# 조회 결과 공통 데이터 구조 — 구현 1단계

> 아래는 공통 구조 도입 시점의 기록이다. 이후 시간·게임 규칙·점수·목록은 각 후속 구현과
> 대표 실게임 기록이 추가됐다. 현재 태그 보유 여부 구현·팩 교체·검증 범위는
> QUERY_OWN_TAG_READBACK_V5_KO.md를 따른다. V5의 한글 태그 있음·없음과 저장 재사용은
> VERIFICATION_QUERY_OWN_TAG_V5_INGAME_2026-11-12_KO.md에서 대표 실게임 PASS로 확인했다.
> 추가 게임 규칙 Boolean·정수 조회는 QUERY_GAMERULE_READBACK_V6_KO.md에 구현 범위와
> 별도 V6 팩을 기록했다. dodaylightcycle=false·randomtickspeed=1의 조회·조건·계산·저장
> 재사용은 VERIFICATION_QUERY_GAMERULE_V6_INGAME_2026-11-12_KO.md에서 대표 GAME PASS로 확인했다.

## 범위와 구현 위치

src/preview/query_result.ts의 기존 화면 요약 QueryResult는 그대로 보존했다.
같은 등록 파일에 QueryReadback.Response와 기존 LIVE QUERY 연결 어댑터를 추가했다.
명령 AST·Compiler·mcfunction 출력과 실행 DONE/ERROR ACK는 변경하지 않는다.
새 MakeCode 실행용 TS 파일이나 pxt.json.files 추가는 없다.

데이터 구조와 어댑터는 구현됐으며 정적·모의 검사를 통과했다. 게임에서 새로운
조회 프로토콜을 구현·검증했다고 주장하지 않는다.

## 상태와 값은 별개

| 상태 | 의미 | 값으로 사용 |
|---|---|---|
| Pending | 아직 데이터가 없음 | 금지 |
| Ready | 자료형을 확인한 데이터가 있음 | hasNumber/hasBoolean 등으로 확인 후 사용 |
| Error | 조회/검증 실패 | 명시적 fallback 또는 오류 처리 |
| Timeout | 기존 조회 요청이 만료됨 | 실제 0/false로 취급하지 않음 |
| Closed | 이미 닫힌/소비된 ticket | 재사용하지 않음 |

ValueKind는 None / Number / Boolean / TextList다. 숫자 0, 불리언 false, 빈 목록은
정상 데이터일 수 있다. Response의 초기 numberValue=0, booleanValue=false는 실제
조회값이 아니므로 hasNumber/hasBoolean 확인 또는 numberOr/booleanOr의 명시적
fallback을 사용한다. 문자열 목록은 복사해 조회 쪽 배열과 공유하지 않는다.

목록의 total은 전체 개수이고 items.length는 이번 페이지 개수다.
Scalar 응답의 total은 1이다. 타입이 다르거나 준비되지 않은 값은 잘못된 타입의
getter로 읽히지 않는다. ACK=2/3을 QueryReadback 상태나 데이터로 변환하지 않는다.

## 기존 LIVE QUERY 재사용

기존 MCFunctionLiveQuery.request()가 Ticket을 생성한다. 이후 사용자 이벤트에서
QueryReadback.readLive(ticket)를 호출하면 기존 tryRead(ticket)가 그 ticket의
snapshot을 읽고, 공통 응답으로 변환한다. Pending이면 내부에서 기다리지 않는다.

readLive가 직접 해당 ticket의 tryRead를 호출한다. 외부에서 서로 다른 요청의
ticket과 snapshot을 임의로 묶도록 공개 API를 만들지 않았다. 기존 decoder의
ACK/cleanup·만료 처리는 유지한다. readLive는 새 요청이나 자동 재시도를 하지 않는다.

- 기존 Daytime → Number
- 기존 KeepInventory → Boolean
- 기존 Players/Objectives/Participants/MyTags → TextList
- scoreboard 개별 점수, 임의 태그 보유 여부, 추가 gamerule은 후속 조회 어댑터 대상이다.

기존 cbxq4의 메시지/태그 형식·페이지 제한을 바꾸지 않았다. 현재 P4O2H 실행팩에는
cbxq4 수신기가 없다. 별도 호환 조회 수신팩의 확보·대조·게임 시험 전에는 이 기능을
일반 사용 완료로 안내하지 않는다. 팩 생성/수정이 필요하면 저장소에 넣지 않고
별도 mcpack으로 제공한다.

## 조건문·계산 사용 예시 (호환 조회팩 시험용)

```typescript
let ticket: MCFunctionLiveQuery.Ticket
player.onChat("qstart", function () {
    if (MCFunctionLiveQuery.calibrate()) {
        ticket = MCFunctionLiveQuery.request(MCFunctionLiveQuery.Kind.Daytime, 0)
    }
})
player.onChat("qread", function () {
    let response = QueryReadback.readLive(ticket)
    if (QueryReadback.hasNumber(response)) {
        let time = QueryReadback.numberOr(response, -1)
        player.say("계산 결과: " + (time + 100))
    } else {
        player.say(QueryReadback.reason(response))
    }
})
```

위 예시는 조회팩이 없는 현재 P4O2H 전용 월드에 바로 실행하도록 권장하는 코드가 아니다.
채팅 출력 내용에서 숫자를 추출하지 않고, 기존 조회 getter→packet→decoder의 실제
numberValue를 이용하는 설계다. 이 MakeCode 계산이 mcfunction으로 자동 변환된다는
의미도 아니다.

## 남은 전송 검증

이 모델의 requestId는 기존 ticket.token이다. source owner/session을 별도 API로
검증한 모델이 아니다. 기존 채널은 @s 태그 조회와 token에 의존한다. 소유자·세션·요청
혼합 방지, 다른 플레이어 응답 격리, 재접속/늦은 응답, 취소/정리, 현재 팩과의
공존은 후속 실게임 게이트다. kind/page 일치 검사는 일관성 검사이며 보안 증명이 아니다.

공통 구조를 연결했다는 이유로 기존 V4 codec·모든 조회 데이터·멀티플레이에
GAME PASS를 부여하지 않는다. 재현 가능한 작은 숫자·불리언·태그 조회부터 시험한다.

## 이번 로컬 검증

- QUERY_READBACK_CONTRACT_REGRESSION.cjs: 14항목 LOCAL PASS.
- Pending 기본값, 실제 0/false, 타입 불일치, 비정상 숫자, 목록 복사·빈 목록,
  context 불일치, 만료/닫힘/오류, ACK의 오인 방지를 검사했다.
- compatible pack의 실제 getter값과 MakeCode 변수·조건·계산 연결은 PENDING.

공식 근거:
- Execute: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/execute
- CommandResult.successCount: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/commandresult

successCount는 명령 적용 성공 횟수이며 조회 텍스트나 임의의 숫자 payload가 아니다.
