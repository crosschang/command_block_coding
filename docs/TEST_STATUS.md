# C3 E1/E2A 검증 추적 (2026-10-26)

| 항목 | 상태 | 근거 |
|---|---|---|
| E1 ABS positioned SETBLOCK | PASS | Education 사용자 스크린샷 및 블록 상태 |
| E1 relative chaining | PASS | Education 사용자 스크린샷 |
| E1 negative align | PASS | Education 사용자 스크린샷 |
| E1 false conditional | PASS | Education 사용자 스크린샷 |
| E1 B04 relative positioned SAY | PASS | Education 채팅 |
| E1 B09 align xyz SAY | PASS | Education 채팅 |
| E2A TS syntax with mock PXT types | PASS | `tsc` (mock, not actual PXT build) |
| E2A Node + E1 regression | 22/22 PASS | `tests/e2a_unit_test.js` |
| E2A user TS syntax with mock Extension | PASS | `tsc` |
| E2A MakeCode/PXT build, Blocks | PENDING | 실환경 미검증 |
| E2A Education as/at @s runtime | PENDING | 실환경 미검증 |
| E2B multi-entity as/at | NOT IMPLEMENTED | 위험한 false-positive 방지 |
| Native EXECUTE equivalence | PENDING | Preview와 별도 테스트 |
| .mcfunction ↔ Blocks roundtrip | PENDING | Converter 작업은 별도 |

프로젝트 버전 근거: GitHub `pxt.json`에 `0.0.85`, E1 Preview 소스가 확인됨. E2A는 로컬 후보 패치이며 GitHub 커밋 없음.
