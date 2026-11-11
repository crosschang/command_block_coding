# Player ACK 결과 0 분리

## 상태

| 값 | 의미 | 완료 성공으로 사용 |
|---|---|---|
| 0 | 수신 대기용 scoreboard 값 | 불가 |
| 2 | 기존 DONE 조건 충족 | 가능, 실제 월드 결과 별도 확인 |
| 3 | API 예외·잘못된 반환·상태 검증 실패 | 불가 |
| 9 | API가 예외 없이 유효한 successCount=0 반환 | 불가, 사유 미확정 |

Extension의 AckStatus/OrderedAckResult.ZeroResult=9는 기존 Timeout=4와 겹치지 않는다.
MakeCode에는 WARNING [P4O2H_ACK_ZERO_RESULT]가 출력된다. 9를 Done이나 조회값으로
취급하지 않는다. 기존 조회 QueryReadback 상태에도 자동 변환하지 않는다.

공식 CommandResult 문서는 successCount를 명령의 성공 적용 횟수로 설명한다.
이 숫자에 조건 불충족의 상세 사유는 없다. 따라서 zero → conditionFalse=true,
zero → DONE 같은 추론을 구현하지 않는다. API 예외를 문자열로 추정해 무시하지 않는다.

## 실행 보존

- 원본 AST → Validator → Compiler 결과를 그대로 한 번 실행한다.
- 조건을 따로 실행해 탐색하거나 임시 명령으로 바꾸지 않는다.
- ACK 9에서는 같은 배치의 후속 명령을 보류한다. 조건 불충족을 자동으로 건너뛰며
  FunctionFile을 끝까지 실행하는 기능은 아직 구현되지 않았다.
- 이전 단계의 효과를 되돌리지 않으며 자동 재시도하지 않는다.
- 준비/정리 및 요청 nonce 검사를 유지하고 9의 잔여값도 정리한다.
- 구형 수신팩은 계속 3을 반환한다. 새 Extension만으로 기존 팩의 동작이 바뀌지 않는다.
- 구형 Extension은 9를 모른다. 새 팩과 새 Extension을 함께 적용한다.
- 별도 legacy cbxp4o2c TAG / cbxp4o2f fake-player 경로는 기존 zero 오류 정책을 유지한다.

## 별도 제공 행동팩

CBX_P4O2H_ZERO_RESULT_ACK_DEV.mcpack은 기존 P4O2H 팩을 교체한다.
header UUID 및 모듈 UUID는 유지하고 팩 자체 버전만 0.0.2 → 0.0.3으로 올린다.
이는 Extension의 pxt.json.version과 별개이며 PXT 버전은 수정하지 않는다.

- 의존: @minecraft/server 2.8.0, min_engine_version 1.21.0 유지.
- 이벤트: cbxp4o2h:batch / cbxp4o2h:ping 및 기존 legacy 이벤트 유지.
- cbxp4o2h:ping 출력에 ZERO_ACK_V1이 포함된다.
- 동일 이벤트를 수신하는 구형 P4O2H/2F/TAG 실행 수신팩은 동시에 활성화하지 않는다.
- 별도 CBXTB 태그 목록팩은 이번 팩에 포함되지 않는다. 기존 별도 사용 여부를 유지한다.
- cbxq4 조회 수신기도 포함되지 않는다. 조회 반환의 실게임 검증을 대신하지 않는다.
- 행동팩 파일·소스·전용 테스트는 GitHub에 넣지 않는다.

## 로컬 검증 및 제한

- 실제 Extension ordered_preview.ts의 준비·전송·ACK 수신 경로: 9개 LOCAL PASS.
- 별도 실제 수신 스크립트의 이벤트·실행·ACK 경로: 16개 LOCAL PASS.
- API 반환/예외는 모의값이다. 실제 게임에서 모든 문법 오류가 어떻게 반환되는지,
  successCount=0의 구체 사유를 확정하는 시험이 아니다.
- 기존 C3 33개, 공통 조회 14개 회귀 검사도 LOCAL PASS. 합계 72개다.
- TypeScript 진단은 기준 52개 → 변경 후 52개, 추가 0개다. 전체 컴파일 성공이 아니다.
- 원격의 사용자 변경 PXT 0.0.6을 보존한다. 새 실행용 TS 파일·pxt.json.files 수정은 없다.

## 공식 근거

- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/commandresult?view=minecraft-bedrock-stable
- https://github.com/MicrosoftDocs/minecraft-creator/blob/main/creator/ScriptAPI/minecraft/server/Entity.md
