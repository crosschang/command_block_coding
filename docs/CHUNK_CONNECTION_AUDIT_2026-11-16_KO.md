# 0.0.6 적용 후 무응답 연결 분석

## 관측과 판정 범위

사용자는 기존0.0.5 사용을 확인해 제공된0.0.6을 적용했지만 시험 실행/진단 둘 다 무응답이라고 보고했다. 앞서 smping 응답, smoke?의 E0 W0 I1 및 '#sm_r 기록된 점수 없음' 화면은 확인됐다. # 없는 이름 대조를 제공했으나 성공 결과는 확인되지 않았다. 현재는 실게임 스모크 미통과이며 #·팩 로딩·MakeCode 대기 중 어느 하나를 확정하지 않는다.

기준 master18aed1f59c81f3092f11ed28ca3eeacc449d3ce4, PXT0.0.22. 분석 중 런타임·PXT·행동팩은 수정하지 않았다. 제공된0.0.6 mcpack의 manifest/실행 코드와 외부 보관 원본을 분석했다. mcpack SHA256:2f54141579025abd7e1f8bf1cef05af609c6b08f2ae2829d1bc84d0caa06163d. 실제 사용자 PC에 이 바이트가 로드됐는지는 아직 별도 확인 대상이다.

## 확인된 소스 구조

1. sender ordered_preview.ts와 receiver execution.js의 cbxp4o2h:begin/part/commit,96자 조각, UTF16소문자hex, 점(.) 구분,31기반mod2147483647 해시, q+6자리세션+요청번호, cbxo2h/cbxo2hn 목표와 요청code 계산이 대응한다. 단순 이벤트 이름 오타나 # 전체 제거가 확인된 것은 아니다. 최초 문자가 #인 명령 줄만 주석으로 제외하며 점수 이름 중간 #은 보존한다.
2. 최초 실제 begin을 보내기 전 GameTime ENTER/PLAN_READY 조회와 ACK준비가 선행한다. 정상 모의 추적에서 준비 native 호출24회(점수 판독 보정19회+안내tellraw1회+nonce/ACK준비4회) 뒤에 첫begin이 나온다. 수신기 명령을 아직 실행하지 않은 대기 구간이 크다. 이 횟수는 시간이 아니며 현재 사용자 대기가 그 구간이라는 증거도 아니다.
3. ACK반복13회 상한은 각 native/API 호출의 반환을 전제로 한다. GameTime/player.execute 자체의 미반환까지 제한하는 외부 타임아웃은 없다. ON은 해당 API 응답을 기다리는 처리이지 독립 watchdog이 아니다.
4. main.js는 execution.js와 query.js를 정적 import한다. query.js는 GameRule 등 @minecraft/server2.8.0 export를 요구한다. 전체 모듈 링크/초기화 실패는 설치됨과 실제 수신기 동작을 다르게 만들 수 있다. 기존 모의 검사는 execution.js import를 제거하고 단독 평가했으며 이 전체 시작 과정을 검증하지 않았다.
5. execution.js의 마지막 system.run에서 목표를 한 번 생성하되 실패를 catch로 조용히 넘긴다. 초기화 단계에 재시도·ready표시는 없다. 이후 수신 처리에서 목표 생성을 다시 시도하는 경로는 있으나, MakeCode의 보정 검사는 첫begin 이전에 그 목표를 필요로 한다.
6. event.sourceEntity가 player가 아니면 chunk와ping 처리에서 응답 없이 반환한다. sourceEntity는 공식 API에서도 선택 속성이므로 모든 이벤트가 player 주체라고 가정한 기존 모의 검사의 한계다. 현재 사용자 입력의 실제 sourceEntity가 누락됐다는 증거는 아직 없다.

## 추가로 수행한 검사 (행동팩 소스는 GitHub에 넣지 않음)

Node의 실제 ES module 링크/평가로 원본 main.js/execution.js/query.js를 모두 로드하고 API만 대체했다.

- 정상 API대체: 구독2개·목표cbxo2f/cbxo2h/cbxo2hn 생성, 직접 begin/probe 입력에 P4O2H CHUNK_REJECT reason=FRAME_FORMAT 응답. 해당 잘못된 입력은 명령을 실행하거나 목표를 변경하지 않는다.
- 고의 초기 world 접근 오류: 초기 목표가 생성되지 않고 오류가 숨겨지는 경로를 재현. 수신 이벤트 구독 자체는 살아 있어 위 짧은 거절 응답은 가능했다.
- 고의 GameRule export 누락: 전체 정적 module 링크 실패, 수신기 구독0개를 재현. 실제 Education에서 export가 없다는 판정은 아니다. 공식 Bedrock 문서에는 GameRule/2.8.0이 있으며 Education 환경의 실제 로드 지원은 별도다.
- 고의 첫 native 호출 예외: 첫begin/실행0, clock PLAN_READY·phaseCALL·ACK7로 예외가 전파되는 경로 확인. 이는 게임에서 관측된 예외가 아니라 장애 주입이다. 일반 native false 반환 처리와 예외/미반환을 혼동하지 않는다.
- 정상 # 없는 진단 시험의26단계·ON6회·점수33 실행 확인. 모의 native전송은 즉시 응답하므로 실제 MakeCode 비동기 대기/이벤트 재개를 증명하지 않는다.

분석 도구와 행동팩 원본은 로컬 외부 분석 디렉터리에만 두고 이 문서에 결과만 기록한다. 현재 결론은 결함 후보와 검증 공백이며 사용자 장애의 근본 원인 확정은 아니다.

## 최소 독립 확인: MakeCode를 거치지 않는 수신기 탐침

게임 일반 채팅에 직접 입력한다. MakeCode 코드나 커맨드 블록에는 넣지 않는다.

```text
/scriptevent cbxp4o2h:begin probe
```

예상 수신기 응답:

```text
P4O2H CHUNK_REJECT reason=FRAME_FORMAT
```

일부러 잘못된 요청ID를 보내0.0.6 chunk수신기의 존재를 확인한다. 이 단계는 nonce/ACK보정·Fake Player·실제 명령 실행이 필요 없다. 일반 명령 전송 성공 메시지가 아니라 **P4O2H CHUNK_REJECT**를 확인해야 한다. 예전0.0.5의 handler는 chunk begin을 처리하지 않아 이 응답을 만들지 않는다.

- 응답 있음: 현재 월드에서 player 주체의 새chunk handler까지 도달. 다음 조사 우선순위는 MakeCode GameTime/ACK보정/native전송 전후의 대기다. 전체 조립/실행 PASS는 아니다.
- 응답 없음: MakeCode 송신기를 거치지 않았으므로 먼저 실제 팩 로딩·활성 버전·@minecraft/server 의존성·콘텐츠 로그·이벤트 주체를 확인한다. 무조건 '팩이 꺼짐'이라고 단정하지 않는다.

ACK객체는 사용자 목표 cbx_ff1과 다른 cbxo2h/cbxo2hn이다. cbx_ff1 생성 완료만으로 bridge ACK준비 성공을 보장하지 않는다.

## 공식 근거

- ScriptEvent의 id/message/sourceEntity/sourceType 정의: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/scripteventcommandmessageafterevent?view=minecraft-bedrock-stable
- Script API2의 초기 실행 및 world접근 제약: https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/v2-overview?view=minecraft-bedrock-stable
- Bedrock @minecraft/server2.8.0 및 GameRule 목록: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/minecraft-server?view=minecraft-bedrock-stable

이 자료는 Bedrock API 자료이며 현재 Education 빌드가 모든 항목을 동일하게 지원한다는 근거로 사용하지 않는다. 기존 Pack/Extension을 추측으로 다시 바꾸지 않고 독립 탐침으로 연결 경계를 먼저 확인한다.
