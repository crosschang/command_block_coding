# 복원 통합본 스모크 시험

기준: master0c9cf2816040ca6cb724c73637b038418d0db386. 실제 PXT0.0.21은 변경하지 않는다. Runtime/BP 변경 없이 사용자 시험만 추가한다. 기존 통합 행동팩0.0.6을 유지한다.

## 적용과 최소 입력

복원 master가 적용된 MakeCode에서 tests/CHUNK_FUNCTIONFILES_SMOKE_MAIN.ts 전체를 사용자 JavaScript로 교체하고 실행한다. Extension main.ts에 덮어쓰지 않는다. 기존 StartupProbe.begin/scale 코드는 제거된다. 이 시험은 함수3개와 일반 채팅 이벤트1개이며 타이밍 측정·자동 대기·새 Worker를 추가하지 않는다. PXT에서 회색 JavaScript 블록이나 반복문 없이 변환되는지 사전 확인한다.

cbx_ff1 목표가 없다면 사용자가 직접 한 번 생성한다. 기존 목표는 그대로 사용한다.

```text
/scoreboard objectives add cbx_ff1 dummy
```

게임으로 돌아와 정의 완료 안내를 확인한 뒤 일반 채팅에 / 없이 순서대로 입력한다. 앞의 결과가 나왔을 때만 다음으로 진행한다.

| 입력 | 확인할 결과 |
|---|---|
| smping | SMOKE_CHAT_OK: MakeCode 채팅 이벤트 응답 |
| smoke | SMOKE_BEGIN → SMOKE_NEST_OK → SMOKE_PASS_33, 해당 요청 steps=26 DONE/ACK_DONE |
| 일반 채팅 SMOKE_END | 일반 채팅 표시 정상 |

무응답이면 반복 입력하거나 재접속 후 PASS 처리하지 않는다. 해당 화면 또는 영상으로 결과를 보존한다. 속도 최적화·장시간 유휴·음성 조건·멀티플레이 시험으로 확대하지 않는다. 임의 시간 내 출력이 없다는 이유만으로 영구 실패라 단정하지 않는다.

## 범위

- smcalc: #sm_i7 + #sm_t10 → #sm_r17. Compiler의 실제 scoreboard 연산 사용.
- smnest: if17 → unless18 → if17의3중 execute → say SMOKE_NEST_OK.
- smoke: BEGIN, 점수 초기화, 위 지역 함수2개 호출, 점수17검사, 개별 SCOREBOARD +1 블록16개, 점수33검사, PASS 출력.
- 지역 함수 호출을 펼친 전체26명령이 단일 요청으로 전송된다. 모의 실행의 인코딩 길이4,493자·47조각으로 기존12/1,400 한도를 넘는다. native 최대135자.
- 실제 점수17/33검사가 실패하면 현재 수신기 ZERO_RESULT 정책에 따라 같은 요청의 다음 단계가 중단되므로 최종 PASS와 ACK_DONE을 함께 본다.
- score는 기존 cbx_ff1 안의 #sm_i/#sm_t/#sm_r만 초기화·변경한다. 기존 #i/#t/#r는 바꾸지 않는다.
- 수동 Preview.ready, tick.json, 실패/취소/유휴/중복 요청·다중 사용자 전체 검증은 이번 범위가 아니다.

## 사전 검증

- TypeScript5.9 ES5 전체 소스+사용자 시험 컴파일 통과.
- 기존 통합 수신기 모의 환경을 재사용하는 chunk_smoke_runtime_mock.cjs 통과. 채팅, 정의 시 실행0, 지역 함수 펼치기, 정확한26단계, 중첩 say 결과, 점수33, ACK2, 요청당ON6회, 재실행 시 초기화와 새ID 확인.
- 실제 행동팩 수신기 소스는 로컬 외부 파일로만 읽으며 GitHub에 넣지 않는다.
- Minecraft PXT target2.2.10/core13.2.19 컴파일·decompile diagnostics0. SCOREBOARD23개·반복 블록0개. 변환 성공과 Education 실게임 성공은 구분한다.
- 사용자 TS·Node 검사·문서만 추가하므로 pxt.json.files 추가 불필요. 버전·런타임·행동팩·릴리즈는 변경하지 않는다.

실게임 스모크 결과는 사용자 실행 후 판정하며, 이 문서 작성 시점에는 미검증이다.
