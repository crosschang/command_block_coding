# C3 EXECUTE Phase 1 정적 검증

- 기준: 로컬에 복원된 `0.0.77 + C1 + C2 (10/24 DIRECT 안내 포함)` 전체 소스.
- TypeScript 정적 검사 (`tsc --noEmit --target ES5 --module none`, 총 기존 등록 TS 109개 + PXT 검사 환경 타입 스텁 + MakeCode 테스트 코드): **0 오류**.
- 실제 소스 전체를 ES5 JavaScript로 변환하여 Node VM에서: 표준 Bedrock EXECUTE 구문 12개 사례와 Validator 통과, 오류 3건 검출, Preview 조건의 참/거짓/unless/복합 조건 및 미지원 절 안전 차단, `Command.execute` 블록 경유 명령 실행 모의시험 PASS.
- `pxt.json.version`: **0.0.77 불변**. `pxt.json.files` 신규 3개 TS 포함 확인.
- 변경 파일 9개 + 테스트/문서만 배포. C2 Preview `query_adapter.ts`, `world_state.ts`는 수정하지 않음.
- **MakeCode 웹 실제 컴파일, JavaScript→Blocks 화면, Minecraft Education 실게임: 아직 미검증.**
- 제한: `blocks.blockByName`의 ID별 매핑/조건 반환은 교육용 클라이언트에서 실게임 확인 필요. `if/unless` 미지원 조합은 아예 실행하지 않도록 설계.

## Selector-style Compact UI 추가 검증

- 공개 통합 블록 2개 (`as/at` 공통 대상, `positioned/facing position` 공통 위치).
- 기존 4개 함수 및 blockId는 유지하고 Toolbox에서만 숨김.
- 기존/신규 블록 호출의 AST 동등성 4개 PASS (격리 VM 테스트).
- 실제 0.0.77+C2 전체 TypeScript ES5 검사: 오류 0건 (MakeCode ambient 모의 선언 사용).
- C3 공개 블록 전용 테스트 JS 포함; hidden 함수 호출 없음.
- PXT 웹 실제 블록 렌더링 및 게임 실행은 아직 미검증.
