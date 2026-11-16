# 0.0.7 독립 진단 — 21:59 실게임 영상 판독

## 자료 및 판정 범위

- 영상: 사용자 제공 `2026-11-16 21-59-15.mp4` (69.4초, 1920×1080/60fps).
- 사용자 MakeCode JavaScript: `SMOKE_FUNCTION_GAP_MAIN.ts`에 해당하는 `ff26` FunctionFile 정의 26개 `Command.say`. 이 영상에서는 `ffgap` 대신 `ff26`을 직접 입력한 장면.
- 행동팩: 업로드한 `CBC_E5_Bridge_API(2).zip`의 0.0.6을 기초로 제작된 **개발용 0.0.7 PROGRESS_DIAG**. 이 실게임에서 `progress` 조회 응답을 확인. 영상만으로 실제 ZIP 체크섬/설치된 바이트 동일성은 단정하지 않음.
- 저장소 확인 당시 master=`1a55c46a50edad008bfe0834be52ec1652addcef`, `pxt.json.version=0.0.25` (사용자의 버전 수정으로 보임). **영상에서 실제 로드된 PXT 버전은 화면으로 확인하지 못함.**
- 판정: **이번 요청의 26개 SAY, 행동팩 DONE, ACK_DONE, progress DONE PASS.** 하지만 최초 요청 준비 및 BEGIN 이전 지연 문제는 남는다.

## 보이는 시점 (영상 시작 상대시각, 근사)

| 시점 | 기록 | 판정 |
|---|---|---|
| 약 30초 | `<n115> ff26`; 기존 `[Preview] ff26: OK` 안내도 보임 | 직접 `ff26` 실행 입력은 확인. `ff26: OK`는 정의 등록 안내이며 이번 명령 실행 완료 신호 아님 |
| 약 36~40초 | `Script event cbxp4o2h:progress has been sent` / `P4O2H PROGRESS NONE` | 독립 조회 이벤트 작동. **이 시점 조회한 플레이어에 현재 기록된 BEGIN이 없음** |
| 약 55~57초 | `[Preview] INFO [P4O2H_PLAYER_SCORE_PASS]`, `P4O2H CHUNK_BEGIN`, `CHUNK_ACCEPT`, `FF26_STEP_01...` 순으로 메시지가 나타남 | 조회 이후 최초 수신/실행 과정의 가시적 진행. MESSAGE 표시 타이밍은 정확한 API 호출 시각과 같지 않을 수 있음 |
| 약 60~61초 | `FF26_STEP_26`, `P4O2H DONE`, `[Preview] INFO [P4O2D_ACK_DONE] ff26` | 실제 26개 SAY 출력과 동일 요청 ACK 수신 확인 |
| 약 61초 | `P4O2H PROGRESS id=q466549_1 phase=DONE parts=18/18 tick=16086145` | 같은 플레이어의 독립 조회로 DONE 상태 검증 |

## 전체 로그에서 직접 확인한 값

```text
P4O2H CHUNK_BEGIN id=q466549_1 parts=18 (not executed)
P4O2H CHUNK_ACCEPT id=q466549_1 steps=26 (not DONE)
[n115] FF26_STEP_01 ... FF26_STEP_26
P4O2H DONE id=q466549_1 steps=26 stateChecks=0 rxTick=16086145 doneTick=16086145
[Preview] INFO [P4O2D_ACK_DONE] ff26 id=q466549_1 poll=1
P4O2H PROGRESS id=q466549_1 phase=DONE parts=18/18 tick=16086145
```

- `rxTick=doneTick`은 수신기에서 조립 완료 요청이 실행 큐에 들어온 시점부터 실행 종료까지의 값이다. 최초 채팅 입력 → BEGIN/PART 수신까지의 시간을 대표하지 않는다. **'전체 실행 0틱'이라는 뜻 아님.**
- `P4O2H PROGRESS NONE`은 쿼리 시점에 0.0.7의 `progressByPlayer` Map에 현재 플레이어의 기록이 없었다는 의미다. 실제 0.0.7 `execution.js`에서 `progressQuery`가 `progressByPlayer.get(String(p.id))`의 부재를 `NONE`으로 출력함을 확인했다.
- `NONE` 이후 새 `CHUNK_BEGIN`과 완료가 관측되어 '미수신으로 영구 실패', '수신기 미지원', '팩 전체 중단'으로 판정할 수 없다.
- 메시지 출력 시각만으로 MakeCode의 어느 native 호출(`gameplay.timeQuery`/19회 scoreboard 보정/`player.execute`)이 오래 걸렸는지는 구분할 수 없다. 다만 **초기 `NONE` 관측 이후에야 BEGIN이 보이므로 지연은 적어도 수신기 실행 루틴만의 문제가 아닐 가능성이 높아졌다.**
- `ACK_DONE poll=1`도 ACK 루프 내부의 이번 확인이 성공한 사실이며 전체 송신 시간이 빠르다는 뜻은 아니다.
- 이 사례 하나를 모든 요청·멀티플레이·실제 `.mcfunction` 내보내기 PASS로 확대하지 않는다.

## 다음 결정

1. **기존 0.0.7 유지.** 0.0.6으로 롤백하거나 TRACE ON을 상시 활성화하지 않는다.
2. `ff26`/ON/OFF/GAP의 동일 반복 시험을 요구하지 않는다. 이번 영상으로 독립 진단이 동작하며 적어도 BEGIN 이전 지연을 놓치지 않는다는 가치를 확인했다.
3. 실제 원인 분리는 기존 MakeCode 소스의 `clockMark`·초기 `probePlayerScoreboardReadback`·`sendChunkFrame` 중 어느 반환 경계가 긴지부터 설계한다. 확인되지 않은 native Promise timeout을 만들거나, 실패 불명 상태의 명령을 자동 재전송하지 않는다.
4. 필요시 **최소** 비교 관측을 설계하되 사용자에게 같은 작업을 무작정 재녹화시키지 않는다.

## 수행/미수행/파일

- **PASS:** 영상에서 동일 요청ID의 18/18 PART, 26 단계, DONE/ACK_DONE, 독립 진행 조회 DONE 확인.
- **미검증:** 사용자 Education 내장 shim의 실제 대기 원인, 다른 요청의 안정성, 멀티플레이 동시성, 실파일 Export 및 왕복 변환.
- **코드 변경 없음:** 실행 로직/PXT/행동팩을 수정하지 않고 관측 기록만 저장한다. `pxt.json.version` 변경 없음. 새 TS 없음/`pxt.json.files` 변경 불필요. 행동팩 소스는 GitHub에 올리지 않음.
