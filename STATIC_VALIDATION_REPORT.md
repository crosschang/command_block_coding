# C3 RUN 분리형 UI — 로컬 정적 검증 보고

- 기준: 2026-10-24의 `C3_EXECUTE_RUN_0.0.77_누락25그룹_복원_1파일패치.zip` 소스.
- 변경 파일: `src/blocks/c3_execute_run_blocks.ts` 1개.
- 그룹 39개 유지, RUN reporter 함수 총 57개.
- 기존 간편형 6개를 `blockHidden=true`로 감추되 blockId 및 함수 정의 유지. 표시 대상 reporter 51개.
- 신규 함수 8개, 기존 KILL 입력을 optional expandable로 조정.
- `pxt.json` RUN 파일 등록: 확인됨. pxt.json 자체 수정 없음, 버전 0.0.77 유지.
- 등록된 프로젝트 파일 안 blockId 중복: 0개.
- RUN 소켓 shadow 참조 중 정의되지 않은 blockId: 0개.
- 전체 TS ES5/noEmit 검사: PASS (0건).
- 별도 MakeCode public JavaScript 예제와 전체 소스 TS 검사: PASS (0건).
- RUN → 동일 원본 AST 비교 및 EXECUTE Compiler+Validator: 11/11 PASS.
- MakeCode PXT 실제 블록 렌더·실게임: 미검증.
