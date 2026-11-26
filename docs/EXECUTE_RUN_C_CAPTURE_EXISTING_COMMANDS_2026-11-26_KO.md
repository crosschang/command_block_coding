# EXECUTE C자형 RUN 기존 커맨드 블록 수집 — 2026-11-26

## 요청
- EXECUTE C자형의 RUN도 C자형으로 작성하며, SAY·GIVE·SETBLOCK 등 기존 커맨드 문장 블록을 끼운다.
- RUN 기존 값 입력 블록은 함수와 블록 ID를 보존하고 도구상자에서는 숨긴다.

## 핵심 구현
- 신규 `ExecuteC.runC(handler)` / 블록 ID `mcfunction_execute_c_run_container`: `handlerStatement=1`로 RUN C자형 공간 제공.
- 기존 `Command.say/give/setblock/raw/mcFunction` 등은 공통 `Command.executeCommand` → `FunctionFile.capturePreviewAction`으로 명령 AST를 전달한다.
- `ExecuteC.captureRunCommand(issues, command)`는 RUN C 활성 중 실제 실행보다 먼저 AST를 수집한다. RUN 밖에서 일반 Command 블록을 놓은 경우도 실행을 차단하고 오류를 기록한다.
- RUN C가 비었거나 RUN이 중복되거나 RUN 뒤에 Execute 조항이 있다면 실행을 차단한다. 잘못된 개별 명령도 AST 검증에서 차단한다.
- RUN 안에 명령 N개를 두면 명령별로 독립적인 `execute ... run <command>` AST가 N개 생성된다. 여러 RUN 명령을 하나의 잘못된 Minecraft 문법으로 합치지 않는다.
- 모든 결과 Execute AST를 먼저 검사한 뒤, 기존 `Command.execute`를 거쳐 FunctionFile/Preview/Bridge와 연결한다. 명령의 조항 순서는 보존한다.

## 기본 형태
```text
EXECUTE (C자형)
  as @a
  at @s
  if entity @e[type=zombie]
  RUN (C자형)
    SAY Hello
    GIVE @s diamond
```

## JavaScript 작성 예시 (기존 커맨드 블록 재사용)
```typescript
ExecuteC.execute(function () {
    ExecuteC.runC(function () {
        Command.say("Hello");
        Command.raw("say Second message");
    });
});
```

- 위 예시는 EXECUTE 조항이 없는 최소 구조 예시이며, 실제 활용 시 RUN C 앞에 `ExecuteC.asEntity(...)` 등 조항 블록을 연결한다.
- 두 자식은 각각 EXECUTE AST 명령 한 개씩으로 분리된다. `Command.raw`는 원래 미지원 명령의 Raw AST 보존 경로를 재사용한다.

## 호환성과 제약
- 변경: `src/blocks/execute_shape_namespaces.ts`, `function_file.ts`, 신규 회귀 검사와 본 문서.
- 기존 `ExecuteC.run(action)` / `mcfunction_execute_c_run`는 숨김 호환 블록으로 보존. 기존 Execute 조항·RUN ID, AST/Parser/Validator/Compiler, 메인 소스·행동팩 변경 없음.
- 신규 TS 파일이 없으므로 `pxt.json.files` 수정은 불필요. `pxt.json.version=0.0.25` 유지.
- 테스트 범위: 소스 기반 실행 모의 검사. 다중 RUN 명령 수집·조항 순서·RUN 밖 실행 방지·FunctionFile 원본 캡처 함수 통과·오류 차단·기존 원블록 호환.
- **미검증:** 실제 MakeCode/PXT 빌드, C자형 렌더링, Blocks↔JavaScript 왕복, Minecraft Education 실게임 및 Bridge 완료 순서.
- PXT 일반 C자형은 명령 블록 종류를 물리적으로 제한하지 않는다. **공통 캡처 경로를 사용하는 Command.* 블록**에만 안전한 처리를 적용했다. 직접 `player.execute()`나 제3자 확장 명령이 포착된다고 간주하지 않는다.
- Minecraft 명령 AST·컴파일 결과와 Preview 실행 여부를 분리한다. 실행 성공을 정적 검사의 PASS로 대신하지 않는다.

## 공식 자료
- https://github.com/microsoft/pxt/blob/master/docs/defining-blocks.md
- https://github.com/crosschang/command_block_coding/blob/master/custom.ts
- https://github.com/crosschang/command_block_coding/blob/master/function_file.ts
- https://github.com/crosschang/command_block_coding/blob/master/commands/c3_execute.ts
