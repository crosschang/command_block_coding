# 시작 크기 시험에 ON 추가

## 관측과 변경 이유

사용자는 기존 크기 시험에서 장기 무응답을 보고했고, MakeCode를 정지한 뒤 일반 채팅은 정상이라고 확인했다. 게임 채팅 전체 정지로 단정하지 않는다. 초기 SCALE 시험은 과거 ON의 게임 시간 조회를 호출하지 않았다. 이번 요청에 따라 시험 경로에 ON을 추가한다. 이전 경로의 실게임 성공을 이번 시작 시험의 지연 예방 성공으로 확대하지 않는다.

현재 기준 master a543423b9f291806a55497c4827b1d5c6bead11f의 실제 소스와 pxt.json을 확인했다. 사용자 변경 버전0.0.20을 그대로 유지한다.

## 적용

MakeCode 확장을 master 최신 코드로 업데이트하고, tests/dev/STARTUP_SCALE_MAIN.ts로 **사용자** JavaScript 전체를 교체한다. Extension main.ts에는 덮어쓰지 않는다. 첫 시험은 다음 한 줄이다.

```typescript
StartupProbe.scale(6, true)
```

6은 함수1개·명령64개·채팅 등록 제외 사례이며 true는 **시계 ON**이다. 결과에 chat=OFF가 나와도 CLOCK=ON과 함께 존재하는 것이 정상이다. chat은 함수별 실행/조회 이벤트 등록, CLOCK은 GameTime 조회로 서로 다른 설정이다.

최종 결과 예: SCALE_RESULT case=6 defs=1 commands=64 CLOCK=ON QUERIES=6 CLOCK_TICKS=... complete=true chat=OFF ... EXECUTION_DISABLED.

CLOCK=ON QUERIES=6은 조회6회의 반환 확인이며 지연 방지 성공 판정은 아니다. complete=true는 예정한 정의 수 및 단계별 진입/반환 횟수 일치만 뜻한다. 실제 점수 변경·ACK 실행 성공을 뜻하지 않는다. 실제 명령 실행은 계속 차단한다.

6번이 완료되면2번도 true로 새로 실행해 같은64명령에서 채팅 등록만 비교한다. 이어서1~8을 동일 ON으로 실행한다. 아직6번도 완료가 확인되지 않으면 8개 전체를 반복시키지 않는다. 게임 화면 복귀부터 SCALE_RESULT까지 영상 시간을 본다. 60초 내 없으면 '60초 내 완료 미확인'으로 남기고 추가 대기는 중단한다.

## ON/OFF와 구현 범위

```typescript
StartupProbe.scale(6, true)  // ON
StartupProbe.scale(6, false) // 동일 사례 OFF 대조
```

매번 **새 프로그램 실행**으로 비교한다. 생략된 두 번째 인수는 ON으로 처리한다. 블록에도 clock ON 불리언 입력이 있으며 decompile 결과는 단일 on-start → startup_probe_scale 안의 case6/TRUE로 확인했다. 초기 사용자의 블록 전환 사례처럼 begin/finish가 분리되지 않는다. 실제 Education UI 블록 실행은 실게임 검증 대상이다.

ON은 gameplay.timeQuery(TimeQuery.GameTime)를 다음 고정6지점에서 호출한다.

1. ENTER: 시험 시작 및 계수 초기화 후, 구성 계산 전.
2. PLAN_READY: 함수/명령 수 결정 후.
3. PREPARED: 정의 반복 처리 직전.
4. DEFINITIONS_RETURN: 전체 정의/검사/등록 반환 후.
5. VERIFY_ENTER: 예정 정의 수와 진입/반환 일치 확인 전.
6. VERIFY_EXIT: 해당 확인 후.

기존 실행 전송 경로의 GameTime ON과 같은 API를 사용하지만 시작 시험에 맞춰 지점을 배치했다. 상시 heartbeat, 새 Worker, 추가 pause는 넣지 않는다. 시간 조회 자체가 응답 대기를 포함하므로 CLOCK_TICKS는 첫 조회가 반환한 tick부터 마지막 조회 tick까지의 간격이며 순수 검사 시간이 아니다. 시작 전 지연과 최종 채팅 전달 대기는 포함하지 않는다. OFF는 조회0회이고 CLOCK_TICKS=-1로 표시한다.

기존8사례의 AST·컴파일 명령·함수 이름·검사·진단/INFO 저장·채팅 등록 ON/OFF 대응은 유지한다. 모든 사례의 함수별 안내는 공통 생략하고 최종 결과 한 번만 출력한다. 출력 제거를 제품 해결책으로 채택한 것이 아니다. 기존 begin(0~5) 시험 및 일반 실행은 이 ON 옵션을 자동 호출하지 않는다. 프로브는 전용 시험 호출 전에는 기본 OFF다.

## 검증

- TypeScript ES5 전체 소스 검사 통과.
- 8사례×ON/OFF16개 및 생략 인수 ON 모의 검사 통과. AST 컴파일 명령·정의/등록·출력/계수는 ON/OFF 동일하고 시계 관련 필드만 다름.
- ON 조회 정확히6회: 최초3조회는 명령 캡처0개, 후반3조회는 모든 명령 캡처 이후임을 확인. OFF 조회0회. 임의 pause/Worker/native player.execute 호출 없음.
- 기존6모드 모의 회귀, FunctionFile+청크 전송 모의 회귀 통과. 기존 INFO 유지 확인.
- 공식 Minecraft PXT target2.2.10/core13.2.19 컴파일·블록 변환 성공, diagnostics0, 단일 시험 블록 case6/clock TRUE 확인.
- 일반 채팅 정상과 SCALE 장기 무응답은 사용자 보고. ON 추가 후의 Education 실게임 완료·속도는 검증 대기다.
- 기존 function_file.ts 수정이므로 pxt.json.files 추가 불필요. 사용자 TS·Node 검사 수정 및 문서 추가. pxt.json.version0.0.20·행동팩 보존, 릴리즈 생성 없음.
