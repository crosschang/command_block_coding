# FunctionFile 분할 전송·ON 통합 — 2026-11-14

## 적용 대상과 현재 상태

- 대상 저장소: crosschang/command_block_coding, 기준 master 55ea44c2c145362eac6bfa7a54ab2aa274eac404.
- 실제 pxt.json.version: 0.0.16. 버전/파일 등록을 변경하지 않았다.
- 기존 Preview의 AST → Validator → Compiler를 유지하고, 기본 NativePlayerAck 경로에 begin/part/commit 전송을 연결했다.
- FunctionFile 기본 경로는 지역 함수 호출을 기존 방식으로 펼쳐 하나의 요청으로 전송한다. 직접 Command 실행도 같은 송신기를 사용한다.
- 여러 명령이 전송 중 변경되지 않도록 첫 시간 조회/게임 호출 전에 명령 문자열 전체를 확정한다. 월드의 점수·선택자는 실제 실행 시 평가한다.
- 실행 잠금은 컴파일 전부터 결과 확인까지 유지한다. 재진입은 거절하며 자동 재전송/우회 실행은 없다.
- 단계별 GameTime 조회 ON을 내부 적용한다. ENTER/PLAN_READY/PREPARED/TRANSFER_RETURN/VERIFY_ENTER/VERIFY_EXIT 6지점이며, 상시 heartbeat와 별도 100ms 시작 대기는 없다. 기존 ACK 대기 폴링의 1ms/100ms는 유지한다.
- 수동 Preview.ready() 블록과 tick.json 정의/반복 구조를 제거하지 않았다. 이번 시험은 tick 반복을 포함하지 않는다.
- Core 수정·TypeScript 정적 검사·수신기 모의 검사는 완료했다. Education PXT 컴파일과 새 통합본 실게임 검증은 아직 미검증이다.

## 한도 해제 범위

사용자 요청에 따라 새 chunk 경로에서 기존 12명령/인코딩 1,400자 제한과 그로부터 계산되던 조각 수 제한을 제거했다. FunctionFile 계획을 펼치는 부분도 같은 경로에서 명령 수를 제한하지 않는다. 무한 재귀 방지(기존 함수 깊이 8), 요청 큐 32, 조립 시간 2,400틱 등 서로 다른 보호 조건은 유지한다.

조각 데이터 96자와 native 명령 200자 이내는 유지한다. 큰 명령 문자열을 한 번의 player.execute()로 보내지 않는다. 헤더는 안전한 정수인지, 조각 수·길이가 일치하는지 검사하며, 전체 재조립·길이·해시·nonce 확인 후에만 실행한다. 누락·충돌·잘못된 형식은 실행하지 않는다. 이 해시는 보안 인증이 아니다.

레거시 단일 batch 진단 경로는 기존 제한을 유지하며, 송신 측에서도 긴 단일 frame을 차단한다. 새 기본 경로에는 옛 12/1400 제한이 적용되지 않는다. 메모리·엔진 명령량·watchdog·전송/실행 시간의 실제 한계가 사라졌다는 뜻은 아니다. 큰 파일 성능과 장시간 조립은 실게임 검증이 필요하다.

## 행동팩

- 새 파일: CBX_RUNTIME_UNIFIED_DEV_0.0.6_CHUNK_FUNCTIONFILES.mcpack.
- CBX Runtime Unified DEV 0.0.5를 같은 UUID의 0.0.6으로 교체한다. 구버전과 함께 활성화하지 않는다.
- 분리 CBX 실행 수신기/조회 팩을 함께 활성화하지 않는다. LIVE QUERY/DATA RULE 기능은 통합팩에 유지된다.
- 의존: @minecraft/server 2.8.0, manifest 최소 엔진 1.21.0. 실제 시험 환경의 해당 API 지원이 필요하다.
- 이벤트: cbxp4o2h:begin / part / commit, ACK 목표 cbxo2h, nonce 목표 cbxo2hn.
- 0.0.5 대비 manifest.json과 scripts/execution.js만 변경했다. query 모듈과 functions 리소스는 그대로 보존했다.
- 행동팩 소스·리소스·mcpack은 GitHub에 포함하지 않는다. PXT 버전과 행동팩 버전은 별개다.

## 실게임 시험 순서

Extension을 이번 master 변경으로 업데이트한 다음 CHUNK_FUNCTIONFILES_ON_MAIN.ts 전체를 MakeCode **사용자 JavaScript**에 넣는다. Extension의 main.ts를 대체하지 않는다. 새 런타임 TS 파일은 없으며, tests/ 아래 파일은 pxt.json.files에 등록하지 않는다.

목표가 없을 때만 직접 생성한다:

```text
/scoreboard objectives add cbx_ff1 dummy
```

게임으로 돌아온 뒤 / 없이 일반 채팅으로 아래를 차례로 입력한다. 각 요청 결과를 확인한 후 다음으로 진행한다.

| 입력 | 예상 결과 |
| --- | --- |
| ffready | 수동 PREVIEW READY와 ACK_DONE |
| ffreset | 태그 시험 상태 정리 후 ffsetup 3단계 DONE; #i=7, #t=10, #r=0 |
| ffflow | FF_BEGIN → 지역 ffcalc/ffnest → FF_END; steps=5, ACK_DONE |
| ffcheck | result17=true goodTag=true badTag=false ack=2 |
| fffalse | 거짓 조건으로 ZERO_RESULT, ACK=9 |
| ffcheck | result17=true goodTag=true badTag=false ack=9 |
| fflarge | FF_LARGE_BEGIN → #r 64회 +1 → FF_LARGE_END; steps=66 DONE |
| fflargecheck | result81=true ack=2 (앞서 #r=17이었던 경우) |
| 120초 이상 유휴 | 게임 안에서 기다리며 C를 열지 않음 |
| ffreset → ffflow → ffcheck | 각 실행 후 결과 확인; result17=true, ack=2 |
| 일반 채팅 CHECK_END, /tp @s ~ ~3 ~ | 채팅 표시와 순간이동 확인 |

ffstate는 저장된 ACK/요청ID/clockStage/tick만 출력한다. 시간 재조회는 없지만 출력 자체의 지연은 가능하다. ffcalc/ffnest/ffsetup도 각각 독립 FunctionFile이다. fflarge는 정의 안의 반복문으로 실제 66개의 명령을 캡처하며, 큐에 66개 요청을 넣는 시험이 아니다.

무응답이면 입력을 반복하지 말고 녹화 상태를 보존한다. 구버전 코드/팩을 섞거나 재접속 후의 성공을 동일 시험의 PASS로 바꾸지 않는다.

## ZERO_RESULT의 기존 제약

현재 수신기는 successCount=0이면 같은 요청의 후속 명령을 중단한다. 따라서 이번 fffalse는 거짓 조건이 마지막인 독립 함수다. 임의의 일반 mcfunction에서 거짓 조건 뒤 계속 실행하는 의미까지 일치한다고 주장하지 않는다. ZERO_RESULT 단독으로 조건 거짓을 증명하지 않으며, 알려진 점수·양성대조·태그 부재·ACK를 함께 확인한다.

## 검증 기록

사용자 제공 REG_ON 시험 영상(2026-11-14 22-03-41.mp4): 세 시험/6사례 PASS, frozen7/live9 후 다음 요청9, autoRejected=2, busyRejected=2, idleTicks=2556, 최종 일반 채팅/순간이동 확인. 이는 이전 시험본 0.0.5의 실게임 기록이며 새 통합본 0.0.6의 실게임 PASS로 확대하지 않는다.

신규 tests/dev/chunk_functionfile_runtime_mock.cjs:

- TypeScript 5.9.3 / ES5로 pxt.json의 전체 확장 TS 및 실제 사용자 시험본을 타입 검사·컴파일: PASS. PXT 컴파일은 아니다.
- 실제 FunctionFile 캡처·공개 Command 블록 API·지역 함수 펼치기·AST 검증·컴파일·실제 로컬 수신기 + 모의 Minecraft: PASS.
- 정의 중 작성 명령 실행 없음, 5단계 ffflow, # Fake Player 점수 17, 3중 execute, ACK2/9와 태그, 요청당 ON 6회, 조회 없는 상태 출력: PASS.
- 실행 중 원본 AST 변경/재진입, 실패한 불완전 전송 실행 금지, 잘못된 줄 차단: PASS.
- 66명령/인코딩9,161자/96조각의 하나의 FunctionFile, 실행 후 #r=81: PASS. native 명령 최대135자.
- 단일 명령도 인코딩1,400자를 넘겨 전송·실행: PASS(모의). 실제 게임의 명령별 길이 제한을 보증하지 않는다.
- 전체 줄 # 주석 제외, 명령 중간 # 문자열 보존: PASS.
- 새 수신기 JavaScript 구문, mcpack 루트 manifest/리소스 보존, git diff --check: 확인.

기존 diagnostic_store_runtime_mock.cjs와 removed_alias_runtime_mock.cjs는 cbi_page를 기대하지만 현재 소스는 ?1 방식이어서 실패한다. 변경 전 기준 HEAD를 별도 추출해 실행해도 동일하게 실패함을 확인했다. 이 작업에서 진단 UI나 해당 기존 테스트를 바꾸지 않았다. 해당 실패를 PASS로 기록하지 않는다.

로컬 실행에는 TypeScript 모듈과 별도로 받은 실제 행동팩 execution.js 경로가 필요하다. 행동팩 소스는 저장소에 넣지 않는다.

```text
NODE_PATH=<TypeScript 설치의 node_modules> node tests/dev/chunk_functionfile_runtime_mock.cjs <로컬 행동팩 scripts/execution.js>
```
