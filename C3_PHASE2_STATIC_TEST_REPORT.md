# C3 Phase2 정적 검증 결과

검증 기준 소스: GitHub 0.0.77 전체 소스 + C1 통합 + C2 압축/MakeCode 호환 + C2 Education Preview 출력 + C3 Selector 통합 + EXECUTE 32절 제한 해제 + 본 Phase2 5개 파일.

| 검사 | 결과 |
|---|---|
| 기존 PXT 버전 변경 | 없음 (`0.0.77`) |
| `pxt.json` 등록 파일 경로 존재 | 모든 등록 경로 존재 |
| TypeScript 통합 정적 검사 | 오류 0건 (PXT 외부 API 정적 shim 포함) |
| 신문법 컴파일 | `positioned as`, `rotated as`, block states, `if/unless score` 5가지 비교 연산자 PASS |
| 새 Block States 없는 경우 문법 | 불필요한 `[]` 출력 없음 |
| RUN AST 연결 | 주요 타입 10종 VM 회귀 PASS (추가 Dialogue RUN은 타입 검사) |
| Validator 부정 사례 | 비교 연산자/Objective/블록 ID 4사례 PASS |
| 32절 초과 체인 | 256개 절 AST→Compiler→Validator 전달 PASS |
| Preview 미지원 절 | 안내만 내보내고 RUN 미실행 PASS |
| Preview blockStates UNKNOWN | 상태 검사 미지원에서 잘못된 RUN 미실행 PASS |
| Preview 기존 SETBLOCK RUN | `if block` 통과 시 typed SETBLOCK AST 실행 PASS |
| 실제 MakeCode 블록 전환·Education 게임 | 아직 미검증 |

주의: 이 정적 검사는 실제 PXT 실행이나 실게임 검증의 대체가 아닙니다. 명령 문법은 Microsoft 공식 Bedrock EXECUTE 명령을 참조했습니다.
