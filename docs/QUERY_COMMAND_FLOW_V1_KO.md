# 조회 결과 → 명령 실행 → 재조회 통합 테스트 V1

## 적용

- 사용자 MakeCode JavaScript에 `QUERY_COMMAND_FLOW_MAKECODE_MAIN.ts`를 붙여 넣습니다. Extension의 main.ts를 교체하지 않습니다.
- 기존 **CBX P4 ORDER2H ZERO RESULT ACK Receiver DEV**와 **CBX LIVE QUERY DATA RULE V6 DEV**를 함께 유지합니다. 새로운 mcpack 설치는 없습니다.
- 예전 V4/V5 조회팩이나 전송 실험팩은 함께 켜지 않습니다. cbxq4 수신기는 하나만 활성화합니다.
- 단일 플레이어, 한 단계씩 실행하는 테스트입니다. 실행 중 같은 번호를 연타하지 마세요.
- Extension PXT 버전은 0.0.14 그대로이며 새 Extension TypeScript 파일이나 pxt.json 등록 변경은 없습니다.

## 채팅 순서

아래 내용을 한 줄씩 입력하세요. 여러 줄을 한꺼번에 채팅에 붙여 넣지 않습니다.

```text
qflow 0
qflow 1
qflow 2
qflow 3
qflow 4
qflow 5
qflow 6
qflow 7
qflow 8
qflow 9
qflow 10
```

| 번호 | 동작 / 확인할 결과 |
| --- | --- |
| 0 | 두 채널 교정, V6 PING, 전용 objective와 태그 준비. READY 확인 |
| 1 | 입력 태그 존재 여부 요청 |
| 2 | true 결과로 TRUE 분기 태그 추가, 해당 태그 재조회 요청 |
| 3 | VERIFIED BRANCH=TRUE 확인, 입력 태그 제거 후 재조회 |
| 4 | false 결과로 FALSE 분기 태그 추가, 해당 태그 재조회 요청 |
| 5 | VERIFIED BRANCH=FALSE 확인, 테스트 입력 점수 7 조회 |
| 6 | 7 + 10 계산, 테스트 결과 점수에 17 기록 후 재조회 |
| 7 | VERIFIED RESULT=17 확인, 없는 테스트 점수 조회 |
| 8 | Missing 결과로 쓰기 차단: VERIFIED MISSING_BLOCKED writes=0. 결과 점수 재조회 |
| 9 | 결과가 계속 17인지 확인. FLOW_VERIFIED 출력 |
| 10 | 이번 실행에서 만든 태그와 objective 정리. CLEAN=true 확인 |

STATE=0 / Pending이면 **그 번호만 나중에 다시 입력**합니다. 다음 번호로 넘어가지 않습니다. 완료한 단계의 재입력은 막습니다. 새 요청 전송이 false라면 이후 읽기에서 오류를 확인하고 정리합니다.

ACK=2만으로 분기/계산 결과 검증을 마치지 않습니다. 재조회 결과까지 맞아야 합니다. ACK=3/4/9 등 또는 이전 요청 ID 재사용은 STOP 처리합니다. STOP 이후에는 qflow 10으로 정리하고 원인을 확인합니다. 중간 중단에도 qflow 10을 사용할 수 있습니다.

## 변경 범위와 제한

태그는 qflow_ 접두사의 실행별 이름, 점수판은 qf 접두사의 실행별 이름을 사용합니다. #input, #result, #missing은 해당 전용 objective 안에서만 사용합니다. 월드 시간, 게임 규칙, 기존 수업 점수는 수정하지 않습니다.

objective 생성의 새 ACK=2를 확인한 경우에만 자동 삭제합니다. 생성 결과가 불확실하면 이름을 출력하고 자동 삭제하지 않습니다. 프로그램을 정지하거나 월드를 나가면 메모리의 소유 정보가 사라질 수 있으므로, 먼저 qflow 10으로 정리하고 표시된 objective 이름을 기록하세요. 오류에 대한 자동 롤백 기능은 없습니다.

통합용 새 공통 API를 추가한 것이 아니라 기존 QueryReadback → 공개 Command API → AST → Validator/Compiler → P4 실행을 연결한 예제입니다. 단순 testfor 태그 검사는 준비 충돌 확인/정리 대상을 찾는 용도로만 사용합니다. 실제 분기 판정과 결과 확인은 V6 조회를 사용합니다.

## 로컬 검증

- 통합 9건 PASS: 실제 등록된 Extension 소스, 공개 Command API, 정확한 P4/V6 수신기 소스로 실행했습니다. Minecraft 네이티브 API와 스케줄러는 모의 환경입니다.
- TRUE/FALSE 분기, 7→17 기록/재조회, Missing 쓰기 차단, Pending 재시도, 완료 단계 중복 차단, 오류/0건/응답 유실 중단, 이전 DONE 차단, 범위 초과 차단, 기존 자료 보존을 검사했습니다.
- 기존 V6 수신기 전체 회귀 120건 PASS, 공개 회귀 6종 124건 PASS. 합계 253건 로컬 PASS.
- 사용자 예제 TypeScript 진단 0건, 같은 임시 API 선언 기준 전체 소스 진단은 전후 27건으로 신규 진단 없음. 이는 MakeCode 편집기 전체 빌드 성공을 뜻하지 않습니다.
- **이 통합 흐름의 실게임 검증은 대기 중입니다.** 이전 V6 개별 조회 실게임 결과와 구분합니다. 멀티플레이 실게임 검증도 미수행입니다.

비공개 검증 ZIP에는 두 수신기 소스와 검사 도구를 포함합니다. 이 파일들은 GitHub에 올리지 않습니다. Node와 TypeScript가 있는 환경에서 CBX_EXTENSION_ROOT를 Extension 루트로 지정하고 query_command_flow.cjs를 실행할 수 있습니다.
