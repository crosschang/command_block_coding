# P4 수신기 독립 진행 상태 진단 설계 (구현 전)

작성일: 2026-11-16 / 저장소: crosschang/command_block_coding / 기준 HEAD 2581cc09b2d8ed379b11bf00dc3cb5956e9fcee0 / pxt.json.version 0.0.24

## 목적 및 현재 판정

TRACE ON 수초 완료, OFF 수십 초~95초 새 완료 미관찰 사례가 공존한다. 원인은 **미확정**이다. 이미 2026-11-16 `LINK_PROBE_INGAME`에는 작은 1명령의 수신/ACK 성공 사례와 재접속 후 첫 보정+전송 성공 사례가 있으므로 전체 브리지가 항상 고장 났다고 해석하지 않는다. 반대로 작은 성공을 26명령/18 PART의 안정성으로 일반화하지 않는다.

본 문서는 **설계만** 기록한다. 실제 0.0.6 수신기 소스 수정, mcpack 생성, PXT 수정, 정적/모의/실게임 검증은 수행하지 않았다.

## 관찰 경계

1. MakeCode: `CHAT_ENTER`, `COMPILE_RETURN`, `READBACK_RETURN`, `NATIVE_n_BEFORE/RETURN`, `ACK_RETURN` 등의 내부 단계는 현재 코드에 있지만, MakeCode `player.onChat` 자체가 대기 중일 때 `ffwhere`는 독립적인 관찰자가 아니다.
2. 수신기: BEGIN/각 PART/COMMIT 수신과 수신기 명령 실행, 결과 ACK를 구분해야 한다. `player.execute`가 복귀하지 않아 송신기 측 로그가 끊겨도 수신기에 이미 도착한 단계는 확인 가능해야 한다.
3. 게임 명령: 일반 게임 채팅의 `/scoreboard players list` 등 **MakeCode와 독립적인 명령 경로**를 우선 고려한다. 정확한 조회 구문/가시성은 대상 Education 버전에서 검증 전이므로 기존 명령 문법을 임의로 확정하지 않는다.

## 제안: 수신기 전용 상태 원장

행동팩의 **실제 수신 이벤트 처리 지점**에서 상태를 기록한다. 기존 `cbxo2h`(ACK)와 `cbxo2hn`(nonce)는 절대로 덮어쓰지 않는다. 별도 진단 전용 scoreboard objective를 쓰거나 수신기 내부 메모리에 상태를 보관하는 두 방식을 비교한 후, 게임 명령으로 조회 가능한 수단을 선택한다.

| 상태 | 기록 시점 | 의미 / 주의 |
|---|---|---|
| RX_BEGIN | 요청 ID·길이·조각수 형식 검사 통과 후 | 수신기 도착이지 실행 성공이 아님 |
| RX_PART | 해당 조각 번호를 검증·수락한 뒤 | 중복 PART는 진행 카운트를 늘리지 않음 |
| RX_READY | 조각수·길이·해시가 모두 일치한 뒤 | 아직 명령 실행 완료가 아님 |
| RX_COMMIT | 요청의 실행 진입을 허용할 때 | 동일 ID의 재실행 금지 |
| RX_EXECUTED | 실제 명령 실행 루틴 반환 후 | 성공 건수/실패 건수를 별도 보존; 0 성공은 DONE과 다름 |
| RX_ACK | 기존 ACK 상태 2/3/9를 기록한 뒤 | ACK 기록 완료이지 MakeCode가 읽었다는 뜻이 아님 |
| RX_REJECT | 형식·nonce·중복·만료 등으로 거부 | 이유 코드만 저장, 원문 명령 노출 금지 |

**필수 상관관계**: 플레이어 식별자 + sessionToken/요청ID + nonce. 전역 단일 fake player에 최신 요청 하나만 기록하면 멀티플레이에서 덮어쓰기 위험이 있으므로 금지. 요청 ID 문자열을 scoreboard 이름에 직접 넣을 경우 길이/문자 제한을 공식 문법으로 검증하고, 불가하면 안전한 별도 매핑을 둔다.

**기록 최소화**: 요청 원문, 명령 인자, 플레이어 채팅 내용은 기록하지 않는다. 단계·마지막 PART 인덱스·전체 PART 수·요청 식별 정보의 최소 표현·게임 tick만 고려한다. 오류가 나도 기존 명령 실행/ACK 의미를 바꾸지 않는다. 관찰용 쓰기가 실패하면 실행을 중단할지 단순 진단 불가로 처리할지 명시적인 정책이 필요하며, 원본 명령 실행 성공을 허위로 기록하면 안 된다.

## 독립 조회 경로: 2단계 설계

- **1단계(가장 작은 변경)**: 수신기 측에서 진단 전용 상태를 플레이어별로 남기고, 사용자가 MakeCode 없이 게임의 일반 명령으로 조회한다. 조회는 읽기 전용이며 새로운 BEGIN/PART/COMMIT을 전송하지 않는다. 다만 실제 명령 문법·권한·표시 형식은 Education에서 확인 필요.
- **2단계(필요할 때만)**: 일반 게임 `/scriptevent`로 수신기에 진단 조회를 요청하는 별도 ID를 고려한다. 이 경우 조회 이벤트가 MakeCode `player.onChat`을 거치지 않는지, `sourceEntity`가 플레이어인지, 출력이 실제로 반환되는지를 분리 검증한다. 조회 이벤트는 **명령 실행 요청이 아니어야** 하고 상태를 변경하거나 ACK를 새로 생성하면 안 된다.

## 구현 안전 규칙

- 기존 `cbxp4o2h:begin/part/commit` 형식, UTF-16 hex 인코딩, 96자 PART, 해시, nonce, 원본 AST → Validator → Compiler 경로, 기존 ACK 2/3/9 의미와 ZERO_RESULT를 변경하지 않는다.
- 수신기 상태 기록은 단일 요청·단일 플레이어 기준으로 원자적으로 갱신한다. 이전 요청의 늦은 PART/ACK가 현재 요청의 상태를 덮지 못하게 한다.
- 부분 전송은 절대 실행하지 않는다. 진단 기능은 재전송/자동 재시도를 만들지 않는다.
- 시간제한·TTL은 수신기 상태 메모리 정리용과 명령 실행/ACK 타임아웃을 분리한다. 표시된 마지막 tick은 경과 시간 자체가 아니다.
- 기존 `0.0.6` 팩의 정확한 원본 `manifest.json`, `main.js`, `execution.js`, `query.js`와 활성화 상태를 확보한 뒤 변경한다. 현재 이 대화에서 0.0.6 원본 바이트는 확인하지 못했으므로 기존 ZIP/오래된 팩을 추측해 수정하지 않는다.
- 행동팩 전용 파일은 GitHub에 올리지 않고 수정이 필요하면 별도 `.mcpack`으로 제공한다. 행동팩 버전과 PXT 버전은 독립 관리하며 `pxt.json.version`은 사용자 지시 없이 수정하지 않는다.

## 검증 계획 (모두 미수행)

1. **정적**: 0.0.6 수신기 실제 코드와 상태 전이 지점, 기존 목표/ID, sourceEntity, 중복·TTL 정책 대조.
2. **모의**: 정상 1명령, 26명령/18 PART, 누락/중복/역순 PART, 불완전 COMMIT, 늦은 ACK, nonce 불일치, 2명 동시 요청, 조회만 반복, 진단 기록 실패. 각 결과에서 원본 실행·ACK 불변성 검증.
3. **실게임(마지막)**: 별도 작은 테스트에서 MakeCode의 `ffwhere`가 응답하지 않는 순간에도 일반 게임 명령 조회가 가능한지, 요청ID와 PART 진행이 정확한지 확인. 새 녹화는 현재 요청하지 않는다.
4. **실패 처리**: 조회 불가를 곧바로 송신 실패로 판단하지 않는다. 수신기 미기록·진단 미지원·권한·게임 UI 출력 지연을 분리한다.

## 현재 작업 결과

설계 문서만 추가. 새 Extension TS 파일 없음. `pxt.json.files` 변경 불필요. 행동팩 파일/리소스 추가 없음. 코드 수정·컴파일·모의·실게임 검증 **미수행**.

참조: `docs/NATIVE_ASYNC_WAIT_SOURCE_AUDIT_2026-11-16_KO.md`, `docs/CHUNK_CONNECTION_AUDIT_2026-11-16_KO.md`, `docs/LINK_PROBE_INGAME_2026-11-16_KO.md`; 공식 API: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/scripteventcommandmessageafterevent?view=minecraft-bedrock-stable (Education 동일 지원 여부 별도 검증).
