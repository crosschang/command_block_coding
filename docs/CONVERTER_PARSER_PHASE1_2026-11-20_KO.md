# 기능 우선 개발 — Converter Parser 1차 (2026-11-20)

## 개발 순서 결정
- 기능 구현과 의미 보존에 필요한 기본 정적/모의 회귀 검사는 계속 수행한다.
- 실행 지연을 이유로 C4 RawText, Dialogue/lang, FunctionFile/tick.json, Converter 개발을 중지하지 않는다.
- 성능 최적화 및 반복 게임 녹화는 기능 통합 이후로 미룬다. 치명적인 손실·중복 실행 문제는 예외로 즉시 처리한다.

## 이번 변경
- `src/parser/mcfunction_parser.ts`: `parseFile`/`parseLine`/`serializeFile` 추가.
- 명령 의미는 기존 `MCFunctionAST`와 `MCFunctionCompiler.compileCommand` 사용.
- 정확히 구분할 수 있는 `say`와 `function`만 구조화; 기타 명령은 RawCommand로 원문 보존.
- 주석·빈 줄은 비명령 레이아웃으로 보존. BOM, CRLF/LF/CR, 마지막 줄바꿈, 명령 안의 # 문자 유지.
- 미인식 함수 ID와 비정규 공백도 Raw로 보존. 빈 AST/Compiler 빈 결과는 조용히 삭제하지 않고 실패 처리.
- 실행 브리지·행동팩·기존 블록·`main.ts`는 변경하지 않음.

## 검증 및 한계
- TypeScript 5.8.3 ES5 + 최소 AST/Compiler 모의 계약으로 7개 파일 왕복 및 구조화·Raw·편집·누락 방어 검사 PASS.
- **미수행:** 현재 전체 Extension PXT 컴파일, 실제 Education 게임, 실제 파일 저장/불러오기, JS↔Blocks 변환.
- 이 Parser는 메모리 내 텍스트 처리이며 사용자 파일을 직접 읽거나 다운로드하지 않는다.
- 아직 `give`, `execute`, `scoreboard`, `tellraw` 등 전체 명령의 구조화 역변환을 제공하지 않는다. Raw 보존 상태다.
- 기존 `0.0.7 PROGRESS_DIAG` 행동팩은 별도 관리. PXT version 0.0.25는 그대로 보존.

## 다음 기능 개발
1. Parser 구조화 확대 + RawText 공통 AST(공식 Bedrock/Education 문법 확인 후).
2. AST → canonical MakeCode JS 생성; `FunctionFile.define`과 `Command.*` 블록 왕복, 주석 보존 정책 설계.
3. `functions/*.mcfunction` 실제 파일 생성·불러오기 및 `.mcblock/project.json` UI 메타 분리.
4. FunctionFile/tick.json, Dialogue/.lang, ZERO_RESULT 의미 차이와 명령 호환성 잔여 기능 구현.
5. 통합 정적/모의/실게임 의미 검증 후 속도 최적화.

이 문서의 완료 표현은 이번 부분 Parser에 한정된다. 양방향 IDE 완성은 아님.
