# MakeCode 연결 단계 분리

## 새 실게임 근거

image(20261115-230559).png에서 일반 게임 채팅의 /scriptevent cbxp4o2h:begin probe에 대해 P4O2H CHUNK_REJECT reason=FRAME_FORMAT 응답을 확인했다. 현재 월드의 새 분할 수신기와 게임 직접 player 주체 경로는 동작한다. 단순 팩 미설치/새 handler 전체 미실행 가설의 우선순위를 낮춘다. 정확한 팩 바이트·MakeCode 발신 주체·정상 조립/실행 성공까지 증명한 것은 아니다.

다음은 MakeCode→수신기 직접호출, GameTime, ACK보정, 실제 단일 명령 전송을 분리한다. 이전 FunctionFile 시험의 진단 채팅까지 무응답이어서 FunctionFile 정의·지역 함수·복잡한 명령은 이번 시험에서 제외한다. 최적화나 성공 우회가 아니라 연결 경계 확인용이며 FunctionFile 스모크 PASS로 대체하지 않는다.

## 적용

tests/MAKECODE_LINK_PROBE_MAIN.ts 전체를 MakeCode **사용자 JavaScript**로 교체한다. Extension main.ts에 덮어쓰지 않는다. 내부 API를 쓰는 진단용 코드이므로 JavaScript 상태를 유지한다. 새 실행이므로 이전 요청의 상태를 되살리는 조회는 아니다. 현재 확장·행동팩0.0.6·PXT0.0.22를 그대로 쓴다. 확장 업데이트나 사용자 목표 생성은 필요 없다.

시작 시 채팅 이벤트 linkprobe 하나만 등록한다. 자동 송신·시작 출력·FunctionFile 정의·반복문·새 Worker·추가 pause는 없다. 단계 앞에 출력 호출을 붙이지 않아 그 출력 대기와 실제 단계 대기를 섞지 않는다. 기존 bridge 내부의 대기는 그대로다.

각 결과를 확인한 뒤에만 다음으로 진행한다. 바로 5개를 연속 입력하지 않는다.

| 입력 | 처리 | 통과 근거 |
|---|---|---|
| linkprobe 0 | player.say만 | LINK_CHAT_OK |
| linkprobe 1 | MakeCode player.execute로 짧은 begin/probe | P4O2H CHUNK_REJECT reason=FRAME_FORMAT **및** LINK_EVENT_RETURN result=true |
| linkprobe 2 | GameTime 조회1회 | LINK_TIME_RETURN tick=숫자 |
| linkprobe 3 | 원래 @s ACK보정 경로 | P4O2H_PLAYER_SCORE_PASS와 LINK_ACK_RETURN ready=true |
| linkprobe 4 | SAY1개를 기존 AST→검사→컴파일→분할→ACK로 전송 | LINK_ONE_OK, steps=1 DONE/ACK_DONE, LINK_SUBMIT_RETURN ack=2 |

어느 단계든 무응답·false·오류이면 다음 실행은 멈춘다. 응답이 없었던 번호와 화면을 보존한다. 원하면 linkprobe9를 한 번 입력할 수 있으나 같은 MakeCode 이벤트 처리에 의존해 응답을 보장하지 않는다. 상태는 마지막 처리 시점의 스냅샷이며 GameTime을 새로 조회하지 않는다. 준비를 건너뛰거나 재전송·일반 직접 명령으로 실행 성공을 대체하지 않는다.

1번의 native result=true만으로 이벤트 수신을 판정하지 않는다. P4O2H 응답도 함께 확인한다. 2번의 숫자 반환은 standalone GameTime 호출1회의 성공만 증명한다. 전송 ON은4번 기존 경로 내부6지점에 그대로 적용한다. 3번은 bridge 전용 cbxo2h/cbxo2hn의 @s 점수를 보정·정리하며, 다른 미확인 요청과 겹쳐 실행하지 않는다. 사용자 cbx_ff1·sm_r 등의 점수는 변경하지 않는다.

4번은 FunctionFile/Block Adapter를 제외하고 기존 MCFunctionAST.createSayCommand를 MCFunctionOrderedPreview.submit에 넘기는 진단이다. 원래 Validator/Compiler/수신기/ACK를 사용하며 rawbatch 우회나 판정 완화는 없다. 0~4를 통과해도 FunctionFile 등록·펼치기·큰 요청·중첩 execute·멀티플레이 전체 성공으로 확대하지 않는다.

## 사전 검증

- 기준 master bdd0bad601274e903d5c44cf270ca309b6cffdb0, 실제 pxt.json.version0.0.22와 기존 API 확인.
- 전체 TS ES5 및 기존 실제 로컬 수신기+모의 Minecraft에서 각 단계 확인. 이벤트등록1개, 시작native/시계/출력0, GameTime1회, ACK보정19+안내1 native, 단일명령ACK2와 전송ON6회 통과.
- 고의 ACK목표 누락 시 ready=false, 고의 sourceEntity 누락 시 native true/수신기무응답 구분, 고의시계예외에서 TIME_WAIT 상태 조회 확인. 장애 주입이며 사용자 실게임 원인 판정은 아니다.
- Minecraft PXT target2.2.10/core13.2.19 컴파일 diagnostics0.
- 실게임 단계별 결과는 미검증. 런타임·행동팩·pxt.json/files·버전·릴리즈 변경 없음. 사용자 시험TS·모의검사·문서만 추가.
