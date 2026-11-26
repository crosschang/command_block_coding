# EXECUTE C자형·원블록 분리와 Dialogue RUN AST 공유 — 2026-11-26

## 목적
- EXECUTE의 블록을 **C자형**과 **원블록** 네임스페이스로 정리한다.
- 단순 네임스페이스 표시뿐 아니라, **실제 C자형 Execute 본문에 조항 명령을 순서대로 끼우는 방식**을 제공한다.
- 기존 `EXECUTE RUN` 값 블록(`Command.ExecuteRunValue`)을 Dialogue **원블록**의 버튼/OPEN/CLOSE 명령 입력에서도 재사용한다.
- AST(명령 구조·의미)가 Source of Truth다. 블록 함수에서 명령 문자열을 직접 조립하지 않는다.

## MakeCode 블록 구조
| 도구상자 | 작성 내용 | 상태 |
| --- | --- | --- |
| `EXECUTE C자형` / `ExecuteC` | `EXECUTE (C자형)` 안에 `as`, `at`, `in`, `positioned`, `rotated`, `facing`, `align`, `anchored`, `if/unless`, `RUN`을 이어 배치 | 신규 C 콜백 구현 |
| `EXECUTE 원블록` / `ExecuteOne` | 기존 조항 체인과 RUN을 연결하는 `execute`, Execute AST 값을 만드는 `command`, 기존 타입 조항 및 RUN 리포터 | 기존 65개 표시 블록의 툴박스 소속 이동 |
| `DIALOGUE 원블록` / `DialogueOne` | `buttonRun`, `openRun`, `closeRun` 등에서 `ExecuteRunValue`를 직접 사용 | 신규 AST 공유 |

- C자형 내부 블록은 **MakeCode의 문장 연결**이며, 잘못된 종류를 물리적으로 끼우는 것은 여전히 가능하다. 콜백 실행 중 오류 검사와 기존 Validator로 잘못된 상태의 실행을 차단한다.
- C자형이 `RUN`을 빼먹거나 두 번 쓰거나 RUN 뒤에 조항을 놓거나, 중첩한 EXECUTE C를 실행하려 하면 오류를 보고하고 실제 실행을 차단한다.
- `Execute 원블록 연결용` 블록으로 기존 `ExecuteClauseValue` 체인을 C자형 안에 한 번에 넣을 수 있다. 순서를 유지하고 순환 연결은 차단한다.
- C자형 Execute의 명령 실행은 기존 `Command.execute`를 호출하므로, `FunctionFile` 캡처, Validator, Preview/Bridge 경로를 재사용한다.
- 사용자 프로그램에서 C자형 Execute를 정의하면 실제 실행 계층에 전달된다. **Dialogue 안의 명령을 정의하려면 ExecuteOne.command 값을 사용해야 하며 ExecuteC.execute로 정의를 대체하면 안 된다.**

## 원블록 Dialogue 예시
```typescript
DialogueC.file("npc/intro", "1.20.80", function () {
    DialogueOne.typed(
        "intro",
        ResourceText.plain("Guide"),
        ResourceText.plain("Welcome"),
        DialogueOne.openRun(MCFunctionExecuteRun.say("opened")),
        DialogueOne.closeRun(MCFunctionExecuteRun.say("closed")),
        DialogueOne.buttonRun(
            ResourceText.plain("Start"),
            MCFunctionExecuteRun.say("clicked")
        )
    );
});
```

위 예시는 RUN 블록을 버튼·이벤트에 연결하는 코드 수준 예시다. 현대 Execute 문장 전체를 저장하려면 `ExecuteOne.command(clauses, MCFunctionExecuteRun.say("clicked"))` 값을 `DialogueOne.buttonRun` 등에 연결한다. 이때 `clauses`는 기존 MakeCode Execute 조항 블록으로 만들어진 `Command.ExecuteClauseValue`이며, 예시에서 임의 API로 생성하지 않는다.

- `ExecuteOne.command(clauses,run)`은 기존 `MCFunctionExecuteRun.nestedExecute`에 위임해 Execute AST를 **만들기만** 한다. Preview나 실제 게임에 실행 명령을 전송하지 않는다.
- `DialogueOne.buttonRun/openRun/closeRun`은 이를 기존 Resource AST의 `buttons[].commands`, `onOpenCommands`, `onCloseCommands`에 넣는다.
- Dialogue C자형에서도 `DialogueOne.buttonCommandRun` / `sectionCommandRun` / `onOpenRun` / `onCloseRun`으로 같은 RUN 값을 정의할 수 있다.
- Resource Codec에서 `MCFunctionCompiler.compileCommand`를 사용하여 최종 Dialogue JSON 명령 문자열을 생성한다. 문자열 직렬화는 Core가 담당한다.
- 존재하지 않거나 순환 구조인 RUN Execute AST는 ResourceProject에서 진단하고 출력 계획에서 차단한다.
- `@initiator`가 포함된 중첩 execute의 Education 지원은 **기존 Warning 유지 / 실게임 검증 필요**. 이 작업이 실게임 지원을 증명하지 않는다.

## 코드와 보존
- 신규 `src/blocks/execute_shape_namespaces.ts`: ExecuteC, ExecuteOne UI.
- 신규 `src/blocks/dialogue_execute_run_blocks.ts`: DialogueOne RUN 연결.
- 변경 `src/project/resource_project.ts`: 공통 Resource AST RUN 수집과 명령 문맥 검사.
- 변경 `src/blocks/c3_execute_blocks.ts` / `src/blocks/c3_execute_run_blocks.ts`: 기존 블록 ID·API 변경 없이 65개 표시 블록에 `blockNamespace=ExecuteOne` 설정. 중복 Execute 루트/중첩 실행 루트 두 개는 숨김 호환 블록으로 보존.
- 변경 `pxt.json.files`: 신규 TypeScript 파일 2건 등록. `pxt.json.version=0.0.25`, target `2.2.14` 보존.
- 신규 `tests/EXECUTE_SHAPES_DIALOGUE_RUN_REGRESSION.cjs`.
- 기존 AST/Parser/Compiler/Validator, main.ts, main.blocks, 행동팩은 수정하지 않는다.

## 검증 및 남은 작업
- 소스 기반/격리 모의 검사: 실제 변경 Git Blob 함수 본문에 대한 JavaScript 런타임 테스트.
- 판정 범위: Execute C 조항 순서, 40조항 이상 보존, RUN 필수/중복/조항 위치 차단, 순환 방지, DialogueOne의 AST 무실행 보존/문맥 검사.
- 이전 Dialogue 회귀 테스트 역시 유지된다. 별도 수행 결과를 보고서와 함께 기록한다.
- **미검증:** 실제 PXT 컴파일, Blockly 사용자 화면에서 C자형 생성 및 블록 연결, Blocks↔JavaScript 왕복, Education 행동팩을 통한 실제 execute 실행과 Dialogue JSON 게임 적용.
- 실행 성공 / 전송 성공 / Preview 성공 / JSON 생성 성공은 구분한다.
- 실행 중의 `EXECUTE C` 중첩 대신 기존 `MCFunctionExecuteRun.nestedExecute` 리포터를 사용한다.

## 공식 구현 참고
- https://github.com/microsoft/pxt/blob/master/docs/defining-blocks.md
- https://github.com/microsoft/pxt/blob/master/pxtblocks/loader.ts
- https://github.com/crosschang/command_block_coding/blob/master/commands/c3_execute.ts
