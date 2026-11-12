# 통합 Runtime 기본 Preview 대표 실게임 결과

근거: 사용자가 제공한 블록 화면 `image(20261112-073249).png` 및 게임 출력 `image(20261112-073337).png`.

- 블록 화면 SHA-256: `4449955a5ed855a717d2fa220ac1fd96ee2675334669d088f25738e01b27eacb`
- 게임 화면 SHA-256: `b098d3a65eb42d6e85ba5cffe5895dfa212ba0ebc170156b45398c7a928f6da6`

## 직접 관찰

FunctionFile `unified_preview` 안에 SAY BEGIN, anchored eyes → positioned ^ ^ ^1 → run SAY, SAY END가 구성되어 있다. 해당 화면에는 별도 브릿지 설정 블록이 없다.

채팅으로 unified_preview를 호출한 뒤 다음을 확인했다.

| 순서 | 명령 출력 | 요청 | 결과 |
| --- | --- | --- | --- |
| 1 | UNIFIED_BEGIN | q745810_1 | DONE / ACK_DONE |
| 2 | UNIFIED_MODERN_EXECUTE | q745810_2 | DONE / ACK_DONE |
| 3 | UNIFIED_END | q745810_3 | DONE / ACK_DONE |

P4O2H 플레이어 점수판 교정 PASS도 보인다. 각 요청의 rxTick/doneTick은 각각 14610719/14610719, 14610759/14610759, 14610799/14610799이다. 수신 후 처리 틱이 같다는 기록이며 사용자 입력부터의 전체 지연이나 세 요청 사이 40틱의 원인을 증명하지 않는다.

판정: 브릿지 설정 블록 없는 FunctionFile의 기본 P4 실행 연결과 대표 모던 execute 실행은 GAME PASS.

## 판정 범위

이 변경 때 제공한 통합팩을 사용하는 확인 절차에 대한 사용자 제출 결과다. 두 화면에는 팩 관리 화면이나 manifest가 없고 P4 메시지는 이전 팩과 동일하므로, 이미지 자체로 정확한 활성 팩 버전 또는 조회 모듈의 로딩 여부까지 독립 확인한 것은 아니다.

SAY는 위치에 의존하지 않으므로 anchored eyes/로컬 좌표의 실제 위치 효과를 새로 판정하지 않는다. 전체 도구상자, PREVIEW READY 블록의 노출, 조회 기능, tick 반복 실행, 멀티플레이는 이 화면에서 검증하지 않았다. 정확한 Education 클라이언트 빌드도 미확인이다.

## 다음 확인

1. 통합팩 하나를 유지하고 별도 P4/조회팩의 중복 활성화가 없는지 확인한다.
2. 도구상자에서 PREVIEW READY는 보이고 RUNTIME BRIDGE / LIVE QUERY / QUERY RESULT의 내부 블록 36개가 숨겨졌는지 확인한다.
3. 기존 QUERY_COMMAND_FLOW_MAKECODE_MAIN.ts를 사용자 프로그램에 넣고 qflow 0~10을 한 단계씩 실행한다. Pending이면 같은 읽기 단계를 나중에 다시 입력한다.
4. V6 ping, TRUE/FALSE 분기, RESULT=17, MISSING_BLOCKED writes=0, FLOW_VERIFIED, CLEAN=true를 각각 확인한다.

조회 블록을 일반 제작 도구상자에 다시 노출하는 작업은 하지 않는다. qflow는 개발 검증 전용 코드다. 새 행동팩 또는 Extension 버전 변경은 필요하지 않다.
