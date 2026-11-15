# 연결 단계0~4 실게임 영상 판독

자료: 2026-11-16 08-14-31.mp4, 길이32.083333초. 화면 전체와 주요 결과 프레임을 확인했다. 영상 상단의 기존 smgo/smstate·FunctionFile 안내는 과거 채팅 이력이며 이번 영상에서 재실행 성공한 증거로 쓰지 않는다.

| 이번 입력 | 실제 확인한 결과 | 해당 실행 판정 |
|---|---|---|
| linkprobe0 | LINK_CHAT_OK | PASS: 이벤트 및 player.say |
| linkprobe1 | LINK_EVENT_RETURN result=true, P4O2H CHUNK_REJECT reason=FRAME_FORMAT | PASS: MakeCode→게임명령→새chunk handler, player 주체 응답 |
| linkprobe2 | LINK_TIME_RETURN tick=15871977 | PASS: standalone GameTime1회 반환 |
| linkprobe3 | P4O2H_PLAYER_SCORE_PASS, LINK_ACK_RETURN ready=true | PASS: @s ACK0/2/3/9 및nonce보정 |
| linkprobe4 | CHUNK_BEGIN parts=1, CHUNK_ACCEPT steps=1, LINK_ONE_OK, DONE steps=1, ACK_DONE poll=1, LINK_SUBMIT_RETURN ack=2 | PASS: 작은 단일 명령 전송·실행·ACK·호출 반환 |
| linkprobe5 | LINK_HELP steps=0,1,2,3,4 status=9 | 정상 도움말:5번은 시험에 없음 |

4번 요청ID q469544_1, receiver rxTick=15872100/doneTick=15872100이다. 해당 동일 tick은 수신기의 실행 구간을 뜻하며 MakeCode부터의 전체 지연을 뜻하지 않는다. 4번은1조각/1명령이므로26명령·수십조각·기존 한도 해제 경로의 실게임 통과가 아니다.

## 남은 핵심 차이

이번에는 단계1·2·3을 따로 실행한 뒤4를 실행했다. 특히3번이 readbackReady를1로 만들었기 때문에4번 내부에서는 최초19회 ACK보정을 다시 하지 않는다. 앞선 스모크는 FunctionFile 등록 뒤 하나의 호출 안에서 GameTime·ACK보정·분할 전송을 이어 수행했다. 따라서 이번 성공만으로 최초 준비/실행 대기가 항상 정상이라고 결론내리지 않는다. 예열·이벤트 분리 효과도 아직 미확인이다.

현재 영상에서는 팩 전체 미동작·MakeCode의 모든 ScriptEvent 주체 누락·GameTime 항상 실패·ACK보정 항상 실패 가설은 지지되지 않는다. 실제 수신 경로가 확인됐으므로 추가 팩 재설치·버전변경은 필요 없다.

다음 최소 비교는 **같은 LINK_PROBE 코드를 새로 실행한 뒤0 → 4만** 입력하는 것이다.0의 응답을 확인하고4로 넘어간다.1·2·3은 실행하지 않아4가 최초ACK보정과 전송을 한 호출에서 수행하도록 한다. 이는 새 코드를 추가하거나 사용자 PXT 버전을 바꾸지 않는다.

- 이 비교도 성공하면: 작은 요청의 최초 통합 경로는 해당 실행에서 PASS. 다음에는 FunctionFile의 단일 SAY와 여러 명령/여러 조각을 분리해 비교한다.
- 앞0~4순서에서는 성공하고 새0→4에서 멈추면: 단계 분리/최초 준비 또는 호출 재개 관련 조건이 후보다. 근본 원인 확정 전 반복 대조와 대기 지점이 필요하다.

기존 FunctionFile 스모크·# 대조·큰 요청·멀티플레이 성공은 여전히 미확인이다. 원래 목표는 기능 개발 우선이며 성능 최적화를 재개했다는 뜻이 아니다. 코드·행동팩·pxt.json 버전을 이 판독 때문에 변경하지 않는다.
