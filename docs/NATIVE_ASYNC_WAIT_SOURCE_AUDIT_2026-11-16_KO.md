# Native 호출 대기와 채팅 이벤트 큐 소스 감사

작성일 2026-11-16 (KST) / 기준 `crosschang/command_block_coding` master `2716ec71143769be7a0bd9a96b0df67ae5a889cd` / PXT `0.0.24` / 행동팩은 별도 `0.0.6`

**판정: 지연의 근본 원인은 미확정.** 아래는 정적 소스 대조이며 Minecraft Education 내부 shim 계측 또는 실게임 수정 검증이 아니다. 추가 게임 녹화를 요구하지 않는다.

## 보존할 실게임 근거

- 26개 SAY(인코딩 1,689자, 18 PART) 완료 사례가 있다. 이것은 해당 실행의 성공이지 모든 실행의 안정성을 의미하지 않는다.
- TRACE ON 약 2~5초 완료, OFF 약 25초 지연 완료 및 약 47~95초 새 완료 미관찰 사례가 공존한다.
- `ffgap 100`은 보정 안내 약 30초, BEGIN 약 40초, 입력 약 70초까지 완료 미관찰. 뒤의 공백 없는 `ffgap100/ffgap1/ffgap0`은 별도 미등록 명령이므로 비교 실패로 세지 않는다.
- 새 메시지 미출력만으로 영구 교착 또는 실제 명령 실패를 단정하지 않는다.
- 근거: 2026-11-16 인수인계 ZIP의 `01_MASTER_HANDOFF_KO.md` / `03_EVIDENCE_LEDGER.csv`.

## 현재 코드에서 확인한 경계

| 구간 | 실제 코드 | 판정 |
|---|---|---|
| 채팅 진입 | `function_file.ts`의 `player.onChat` → `runPreview` → `submit` | 진단 채팅도 MakeCode 경로이므로 독립 감시가 아님 |
| TRACE | `ordered_preview.ts`의 `recordExecutionStage` → `previewSay`; `output_adapter.ts`에서 `player.execute("tellraw …")` | TRACE는 순수 기록이 아니라 추가 native 호출이며 실행 타이밍에 영향을 줄 수 있음 |
| 최초 읽기 보정 | `probePlayerScoreboardReadback`의 정상 경로 `player.execute` 약 19회 | BEGIN 이전 여러 native 호출이 선행 |
| 요청 준비 | `submitChunk`: nonce/ACK 설정·검사 4회 후 BEGIN / PART / COMMIT 각각 별도 `player.execute` | 각 native 호출이 반환돼야 다음 단계 진행 |
| ON 시계 | `clockMark`: ENTER / PLAN_READY / PREPARED / TRANSFER_RETURN / VERIFY_ENTER / VERIFY_EXIT의 `gameplay.timeQuery` 6회 | GameTime 조회도 반환 대기 지점 |
| ACK 조회 | `waitReceipt`: 최초 1ms + 이후 100ms 간격, 최대 13번 `readAck`; player ACK는 nonce 후 2/3/9/0 검증 | 최대 13번 **반복**이지 전체 실시간 timeout이 아님 |
| 예외 종료 | `submitChunk` 정상 경로 말미 `inFlight=false`, 일부 실패에 `chunkFailure` | native 예외에 대해 포괄적인 `try/finally`가 없어 상태 해제 누락 가능. 실게임 예외 발생은 미확인 |

`loops.pause(100)`은 **이미 내부 native 호출이 복귀하지 않는 상황을 취소하지 못한다.** 처음 호출을 끝내지 못하면 다음 pause/폴링으로 가지 않는다. TRACE ON의 성공은 추가 `tellraw`가 영향을 준 관측일 뿐 해결책 확정이 아니다.

## 공식 Microsoft 소스와의 비교

1. [MakeCode Async and threads](https://makecode.com/async): PXT는 `//% promise`와 `//% async`로 비동기 호출을 일반 함수처럼 보이게 제공한다. [shim 설명](https://makecode.com/simshim)은 `fooAsync`의 `foo` 노출과 `getResume()`를 명시한다.
2. [공개 PXT 런타임](https://github.com/microsoft/pxt/blob/master/pxtsim/runtime.ts)의 `EventHandler.runAsync`와 `EventQueue.poke`는 이벤트를 처리하며 `await handler.runAsync`로 순서대로 기다린다. **가능한 가설:** 앞선 오래 걸리는 채팅 핸들러가 후속 `ffwhere`·`traceon`을 막을 수 있다.
3. [Minecraft player.execute API](https://minecraft.makecode.com/reference/player/execute)는 `player.execute(command: string): boolean`을 설명하고, [timeQuery API](https://minecraft.makecode.com/reference/gameplay/time-query)는 GameTime 조회를 설명한다. 두 API의 Education 내부 shim, 최대 응답 시간, timeout·cancel 구현은 공개된 이 자료에서 **미확인**이다.
4. 공개 `microsoft/pxt`는 일반 PXT 소스다. **Minecraft Education의 player.onChat이 동일 EventQueue 경로를 사용하는지 확인하지 못했다.** 일반 PXT 시뮬레이터 코드를 Education 게임 내부 구현으로 단정하지 않는다.
5. [PXT #11280](https://github.com/microsoft/pxt/issues/11280)은 iframe 편집기 초기화의 `postHostMessageAsync` 지연 문제이다. Minecraft `player.execute`와 같은 호출 경로라는 증거가 없으므로 그 timeout 코드를 옮기지 않는다.

## 우선순위 및 다음 단계

1. **native 응답 반환 경계 규명(최우선)**: BEGIN 전에 시간 조회·보정이 멈췄는지, BEGIN 이후 PART/COMMIT이나 ACK에서 멈췄는지를 구분한다. 현재 26명령 완료 한 건으로 전체 구간을 판단하지 않는다.
2. **채팅 큐 의존 진단에서 벗어나기**: `ffwhere`도 `player.onChat`이다. 추후 MakeCode 외부, 예컨대 일반 게임 명령으로 볼 수 있는 행동팩의 플레이어별 상태(BEGIN·최종 수신 PART·COMMIT·ACK)를 진단할 수 있을지 설계한다. 이 독립 진단은 현재 구현·검증되지 않았다. nonce/요청ID를 보존해야 한다.
3. **예외 안전성은 별도 최소 개선 후보**: `try/finally` 등으로 예외 때 상태가 꼬이는 위험을 줄일 수 있지만, 불확실한 전송 뒤 자동 재송신·중복 실행을 금지한다. 예외 복구가 native 미복귀를 해결하는 것은 아니다.
4. **우회책을 실효성 검증 전 적용하지 않기**: 무조건 추가 pause, ON 강제, TRACE 상시화, PXT timeout 추정 구현, 행동팩 교체를 근본 해결로 표시하지 않는다.
5. **안정화 후 원래 로드맵 복귀**: FunctionFile/`tick.json`, ZERO_RESULT의 일반 mcfunction과의 의미 차이, 실제 파일 Import/Export와 왕복 AST 편집 등을 현재 소스로 감사한다.

## 검증 및 변경 범위

- 수행: 현재 master·pxt.json·핵심 Preview 코드, 기존 실게임 근거와 공개 Microsoft PXT 런타임/문서 **정적 대조**.
- 미수행: Education 내장 비동기 shim 직접 판독, 게임/행동팩 수정, 컴파일·모의 테스트·실게임 재시험, 지연 해결 검증.
- 변경: **이 문서 한 파일만 추가**. Extension TS 신설 없음, `pxt.json.files` 추가 없음, `pxt.json.version=0.0.24` 그대로. 행동팩 소스/리소스는 GitHub에 추가하지 않음.
