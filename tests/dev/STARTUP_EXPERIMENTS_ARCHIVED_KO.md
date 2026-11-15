# 시작 병목 시험 보관

2026-11-15 사용자 지시로 성능 최적화를 보류하고 통합 커밋54293003의 런타임으로 복원했다. 이 폴더의 STARTUP_BOTTLENECK_MAIN.ts, STARTUP_BOTTLENECK_NO_FOR_MAIN.ts, STARTUP_SCALE_MAIN.ts와 대응 startup_*_mock.cjs는 당시 구현·관측을 보존하는 자료다. 현재 Extension에는 StartupProbe API/후킹을 포함하지 않으므로 이 시험들은 현재 런타임용이 아니며 컴파일/실행하지 않는다.

필요하면 병목 시험 통합 a7ad001, 상태68607fe, 반복문 비교8dadd03, 크기 시험c255fba, ON 시험eb2f963의 정확한 소스에서 재현한다. 제품 기능 시험에 병목 API를 추가하지 않는다. 현재 통합 회귀 검사는 chunk_functionfile_runtime_mock.cjs와 tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts를 사용한다.

자료나 Git 기록을 삭제하지 않았으며 당시 미검증·지연·무응답을 PASS로 바꾸지 않는다.
