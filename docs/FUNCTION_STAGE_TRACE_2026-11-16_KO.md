# FunctionFile 분할 전송 단계 진단

## 직전 실게임 기록

영상 `2026-11-16 08-31-49.mp4`(92.45초): 정의 안내 ff2/ff13/ff26 OK가 보인다.
- ff2: q919062_1, parts=2, STEP_01~02, DONE steps=2, ACK_DONE poll=1 확인.
- ff13: q919062_2, parts=9, STEP_01~13, DONE steps=13, ACK_DONE poll=1 확인.
- ff26: 약 41초 입력 후 영상 끝까지 약 50초간 CHUNK_BEGIN/ACCEPT/STEP/DONE 미관찰.
- 12명령 초과 실게임 성공. ff26은 원인 미확정이며 1400자 제한에 걸렸다는 증거가 아니다.

## 변경 범위

기존 MCFunctionOrderedPreview.setTraceEnabled를 분할 전송 경로에도 연결한다. 기본 OFF.
FunctionFile 채팅 진입/검색/로컬 호출 펼침, 컴파일, 인코딩, 기존 ON 시간 조회 전후,
읽기 보정 전후, ACK 준비 네이티브 명령 4회, BEGIN/PART/COMMIT, ACK 대기/복귀를 표시한다.
새 AST/전송 프로토콜/제한/재전송/백그라운드 반복을 추가하지 않는다.
lastExecutionStage는 저장값만 읽는다. 출력 대기 중에는 TRACE_OUTPUT_WAIT, 시간 조회 중에는 *_CLOCK_WAIT,
네이티브 전송 중에는 NATIVE_n_WAIT를 보존한다. 예외 복구 기능을 추가한 것은 아니다.

- 수정: function_file.ts, src/preview/ordered_preview.ts (기존 pxt.json.files 등록됨).
- 추가: 사용자 시험 tests/SMOKE_FUNCTION_STAGE_MAIN.ts, 로컬 검사 tests/dev/smoke_function_stage_mock.cjs, 이 문서.
- 새 Extension TS 파일 없음. pxt.json 수정 없음, 버전 0.0.22 유지.
- 행동팩 0.0.6 유지, 새 팩 및 행동팩 소스 Git 등록 없음.

## 적용과 시험

1. MakeCode에서 확장 소스에 이 커밋의 변경을 적용한다. 확장을 갱신하지 않고 시험 프로그램만 바꾸면 새 API가 없다.
2. 사용자 JavaScript 전체를 tests/SMOKE_FUNCTION_STAGE_MAIN.ts 내용으로 교체한다. Extension main.ts에 덮어쓰지 않는다.
3. JavaScript 상태로 실행한다. 이번 진단은 내부 API를 포함하므로 블록 변환을 하지 않는다.
4. ff2 → 마지막 STEP_02 및 DONE/ACK_DONE → ff13 → STEP_13 및 DONE/ACK_DONE → ff26 순서.
5. 첫 무응답 시 반복 입력하지 말고 마지막 NATIVE_TRACE 줄과 그 뒤 로그를 보존한다. 30~60초 정도가 포함된 영상이면 된다.
6. ffwhere는 저장 stage/clock/id/ack를 출력하고 새 시간 조회를 하지 않는다. 같은 MakeCode 채팅 처리 경로이므로 이것도 응답하지 않을 수 있다. 응답을 필수로 기다리지 않는다.
7. 진단 출력 제어는 traceoff / traceon. 기본 시험은 ON. 출력 OFF에서도 원래 요청당 ON 시간 조회 6회는 유지된다.

C로 MakeCode를 열면 실행이 멈춘다. 이 방법이 멈춘 내부 변수의 직접 열람을 보장하지는 않는다.
출력 자체도 MakeCode에서 기다릴 수 있으므로 마지막 표시만으로 바로 다음 연산이 범인이라고 단정하지 않는다.
진단 ON에서만 성공하면 출력 추가로 실행 간격이 달라졌을 가능성이 있으므로 지연 해결 PASS로 기록하지 않는다.

## 마지막 단계 해석

| 마지막 표시 | 우선 확인할 구간 |
|---|---|
| CHAT_ENTER / RESOLVE | 처리 진입, 함수 검색, 이어지는 진단 출력 |
| FLATTEN_BEGIN | 호출 펼침 또는 이어지는 출력 |
| COMPILE_BEGIN | 검증/명령 컴파일 또는 이어지는 출력 |
| ENTER_CLOCK_BEFORE / PLAN_READY_CLOCK_BEFORE / PREPARED_CLOCK_BEFORE | 해당 ON 조회 또는 그 전 진단 출력 |
| ENCODE_BEGIN | 인코딩/해시/요청 ID 준비 또는 이어지는 출력 |
| READBACK_BEGIN | 최초 ACK 읽기 보정 또는 이어지는 출력 |
| NATIVE_1~4_BEFORE | 수신 시작 이전 ACK 준비 또는 이어지는 출력 |
| BEGIN_BEFORE / PART_BEFORE / COMMIT_BEFORE | 해당 프레임 송신 또는 그 전 진단 출력 |
| ACK_WAIT | 완료 응답 확인 또는 그 전 진단 출력 |
| FINISHED | 송신 함수 복귀. 실제 성공은 ACK/DONE도 함께 확인 |

## 수행한 검증

- 공개 Minecraft target 2.2.10 / PXT 13.2.19: 진단 사용자 프로그램 포함 컴파일 성공, 진단 0. Education 내장 PXT 동일성은 미확인.
- TS 5.9 ES5 및 실제 로컬 수신기+모의 월드: 2/13/26 명령 순서 그대로, ACK2, 각 ON 조회 6회, 단계 출력 포함, ffwhere 새 시간 조회/execute 없음, traceoff 추가 출력 없음.
- 첫 시간 조회에 인위적 중단을 주어 ENTER_CLOCK_WAIT 보존과 실제 명령 실행 0 확인. 실제 게임 원인 재현으로 간주하지 않는다.
- 기존 통합 검사: 로컬 함수 펼침, 점수/중첩 execute, ACK2/9, 입력 고정/재진입, 불완전 전송, 큰 요청/긴 단일 명령 회귀 검사 수행.
- 신규 진단 실게임 시험은 아직 미수행. 시간 비교/최적화/원인 확정은 아님.
