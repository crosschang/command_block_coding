# STATIC VALIDATION — Command 그룹 일치

- `custom.ts`의 실제 `Command` 그룹 선언을 기준으로 동일한 그룹명 14개 및 상대 순서 일치
- `MCFunctionExecuteRun` 함수 14개, `blockId` 14개 불변
- 함수 본문과 시그니처 동일, 주석 그룹 메타데이터 외 변경 없음
- 이전 `Command.executeRun*` 숨김 호환 API 보존 (핫픽스 변경 없음)
- 버전 0.0.77 유지, 32절 제한 해제 보존 (핫픽스 변경 없음)
- 프로젝트 TypeScript 정적 컴파일: PASS (로컬 MakeCode 스텁 기반)
- 실제 PXT 블록 렌더링 및 Education 인게임 결과는 미검증
