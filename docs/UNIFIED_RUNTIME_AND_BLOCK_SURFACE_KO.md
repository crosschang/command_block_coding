# 통합 행동팩과 제작용 블록 노출 정리 (2026-11-12)

## 목적

제작자의 도구상자는 mcfunction 명령과 파일 정의에 집중한다. 브릿지 선택, ACK, 조회 요청/응답, 진단은 실행 계층의 내부 기능으로 보존한다. API 조회 값을 MakeCode 변수로 돌려주는 실험을 기본 mcfunction 작성 기능으로 확대하지 않는다.

## 행동팩

새 설치 파일: `CBX_RUNTIME_UNIFIED_DEV.mcpack`, 표시명 **CBX Runtime Unified DEV**, 행동팩 버전 0.0.4, `@minecraft/server` 2.8.0 의존.

- P4 ORDER2H ZERO RESULT ACK Receiver DEV의 UUID를 유지하여 업데이트한다.
- P4 실행과 DATA RULE V6 조회 수신기를 별도 ES 모듈로 불러온다. 두 수신기의 바이트와 기존 P4 functions 리소스는 보존했다.
- `cbxp4o2h:batch/ping`, 기존 P4 호환 이벤트와 `cbxq4:req/ack/cancel/ping` 계약을 유지한다.
- 통합팩 활성화 후 별도 V6/V5/V4 조회팩은 비활성화한다. 이전 P4 실행팩과 통합팩을 중복 활성화하지 않는다. 전송 실험팩도 사용하지 않는다.
- cbxcore/cbx12 등 다른 과거 실험 수신기를 새로 포함했다고 주장하지 않는다. 기본 실행은 P4 경로를 사용한다.
- 기존 ping 메시지는 호환성 때문에 P4/V6 이름을 유지한다. 새 별도 프로토콜을 추가하지 않았다.
- 행동팩과 전용 원본/테스트는 GitHub에 저장하지 않고 별도 제공한다.

## Extension

확인한 기준 소스: `5fd2a69899747e29101d95ce77a7316e29c19426`, 사용자가 변경한 pxt.json.version **0.0.15** 유지.

기존 블록 ID와 TypeScript 함수는 삭제하지 않고 공식 PXT `blockHidden=true`, `hidden=true` 속성으로 노출만 정리했다.

| 내부 영역 | 숨긴 블록 수 |
| --- | ---: |
| RuntimeBridge: 실행 경로·묶음·ACK·TAG LIST 진단 설정 | 8 |
| MCFunctionLiveQuery: 요청·교정·읽기·응답 | 14 |
| QueryReadback: 공통 결과 상태·값·측정 | 14 |
| Preview.ready: 준비 진단 | 1 |
| 합계 | 37 |

명령 블록과 FunctionFile/tick.json 블록은 유지한다. 숨긴 API는 이전 테스트 JavaScript에서 계속 호출할 수 있다. 기존 작업 공간에 이미 놓인 블록을 삭제하거나 변환했다고 주장하지 않는다.

공식 근거: https://makecode.com/defining-blocks (`blockHidden`, `hidden` 설명).

### 기본 Preview 실행

검증된 명령을 실제 실행하는 지점과 FunctionFile.runPreview에서 내부 초기화를 호출한다. 기본값은 P4 플레이어별 ACK 확인 경로다. 사용자는 브릿지 설정 블록을 둘 필요가 없다.

- Extension 로딩, 내부 설정 자체, FunctionFile 정의 수집 단계에서는 게임 명령을 전송하지 않는다.
- 기존 AST → Validator → Compiler 경로를 유지한다. mcfunction 출력 문법에 내부 전송 설정을 넣지 않는다.
- 일반 FunctionFile은 기본적으로 기존 준비 핸들러를 실행하며 각 명령이 P4를 사용한다. 실험용 12개 명령 묶음 실행을 기본으로 켜지 않는다.
- 과거 테스트가 JavaScript에서 명시적으로 RuntimeBridge.select를 호출하면 그 선택을 유지한다. 실험용 orderedMode도 내부 API로 남긴다.
- 실행 확인에 실패하면 다른 전송으로 자동 재시도하지 않는다. 행동팩 미설치 상태를 지원하는 것으로 표시하지 않는다.
- 기존 P4의 패킷/명령 길이, ACK 대기, zero-result 및 실험용 묶음 제한은 유지한다. 일반 명령 전체의 실게임 지원을 새로 보장하는 변경은 아니다.

새 Extension TypeScript 파일과 pxt.json.files 변경은 없다. 새 회귀 검사 cjs는 개발용이며 PXT 등록 대상이 아니다. PXT 버전 변경·릴리즈 생성은 하지 않는다.

## 검증

- 통합 행동팩 엔트리에서 실제 두 모듈을 로드하여 구독자가 각각 하나인지 확인했다.
- 실제 등록 Extension + 두 수신기 기반 통합 14건 로컬 PASS. TRUE/FALSE, 숫자 7→17, Missing/Pending 차단, 오류/0건/응답 유실, 이전 ACK, 정리, 기본 명령 실행, FunctionFile 수집과 실행, 14개 명령, 설정 없는 모던 execute 예제를 포함한다.
- 공개 블록/내부 기본 경로 계약 8건 로컬 PASS.
- 기존 V6 수신기 120건, 공개 조회/ACK 회귀 124건 로컬 PASS. 총 266건.
- 동일한 임시 API 선언 기준 TypeScript 진단은 수정 전후 27건으로 같으며 신규 진단은 없다. 사용자용 간단 확인 예제의 진단은 0건이다. 전체 PXT 편집기 빌드는 수행하지 않았다.
- 네이티브 API와 스케줄러는 모의 환경이다. MakeCode 도구상자 렌더링, 통합팩 설치/업데이트 및 실게임은 검증 대기다.
- 통합 전 두 팩 구성에서의 대표 실게임 통과는 별도 검증 원장에 기록한다. 이를 새 통합팩 GAME PASS로 옮겨 적지 않는다.

## 사용자 확인 순서

1. 통합팩을 가져오고 월드에서 활성화한다. 별도 조회팩과 예전 실행팩의 중복 활성화를 해제한다.
2. Extension을 최신 소스로 갱신하고, RUNTIME BRIDGE / LIVE QUERY / QUERY RESULT / PREVIEW 진단 블록이 신규 도구상자에서 숨겨졌는지 확인한다. 캐시된 이전 Extension은 자동 반영되지 않을 수 있다.
3. 사용자 MakeCode 프로그램 `UNIFIED_PREVIEW_MAKECODE_MAIN.ts`를 실행한다. Extension main.ts에 덮어쓰지 않는다.
4. 채팅에 `unified_preview` 입력. `UNIFIED_BEGIN`, `UNIFIED_MODERN_EXECUTE`, `UNIFIED_END`와 실행 ACK를 확인한다.
5. 조회 수신기 호환 재검증이 필요하면 기존 qflow 예제를 그대로 사용한다. 일반 제작자는 조회 블록을 구성할 필요가 없다.
