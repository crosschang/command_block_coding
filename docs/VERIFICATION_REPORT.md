# P0/P1a 검증 기록

2026-10-31, 로컬 도구 측 확인.

| 검사 | 판정 | 범위 |
|---|---|---|
| GitHub master HEAD | VERIFIED | fa9884e6 / pxt.json 0.0.93 (커넥터 조회) |
| P0 2026-10-07 변형 기록 | EXTRACTED | 120행; 과거 증거의 범위 그대로 |
| P0 2026-10-30 CBX 매트릭스 | EXTRACTED | 23행; PASS/MOCK/NOT TESTED 구분 그대로 |
| P0 v2 capability seed | COPIED | 17행; 신규 PASS 증명 아님 |
| P1a patch apply | PASS IN FIXTURE | 실제 원격 저장소 파일 전체가 아닌 원본 컨텍스트 재현용 fixture |
| P1a TypeScript ES5 | PASS MOCK | 신규 TS 및 테스트 스텁 컴파일 |
| P1a route mode mock | PASS MOCK | 4가지 모드 + 설정 가드 + 복귀 |
| P1a new background scheduler | NO | 새 큐/Worker/폴링 없음 |
| Full PXT build | NOT RUN | MakeCode target 빌드 검증 필요 |
| Minecraft Education game | NOT RUN | 게임 검증 필요 |
| Round-trip export/import | NOT COMPLETED | 기존 인수인계와 일치 |

**정확성 경계:** 이 결과만으로 P1 전체, CBX 설치 감지, 기능별 AUTO 선택, 출력 역전송, 틱 동등성, 0틱 실행 지연을 PASS라고 할 수 없습니다.
