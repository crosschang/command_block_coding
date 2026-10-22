# C1 직접 덮어쓰기 ZIP 검사 결과 (2026-10-22)

- **소스 기준**: GitHub Pages `pages build and deployment` 완료 run 39754460508, 커밋 `fb2f3b7b3f39b76cdf9c39ec8b98195b4ca922c4`, `pxt.json.version=0.0.77`.
- **변경 범위**: 기존 6개 파일(`pxt.json`, `custom.ts`, `src/ast/command.ts`, `src/blocks/command_adapter.ts`, `src/compiler/compiler.ts`, `src/validator/validator.ts`) 수정 + 신규 6개 파일(C1 AST/UI, RIDE·DIALOGUE 테스트 3개, 설명 문서 1개).
- **GitHub 쓰기 작업**: 0건. 버전 변경: 0건. 설치·패치 실행 스크립트: 0개.
- **TypeScript**: `tsc -p tsconfig.a8check.json` 통과. 두 C1 public-API test fixture를 포함한 확장 타입 검사도 통과.
- **Node 회귀**: `node --test tests/C1_RIDE_DIALOGUE_STATIC_REGRESSION.cjs tests/B4_ADVANCED_FOG_COMPAT_STATIC_TEST.cjs tests/CAMERA_PRESET_UI_SAFE_PATCH_TEST.cjs` 총 9/9 통과.
- **미실행**: 실제 MakeCode PXT 서버 컴파일/블록 렌더링, Education 인게임 명령 실행, 행동 팩 연결 및 .mcfunction 파서 왕복.

실제 테스트 결과를 근거로 PASS/WARNING/FAIL을 갱신해야 하며 단순 문법·타입 검사가 런타임 통과를 보장하지 않습니다.
