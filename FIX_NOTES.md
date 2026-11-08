# EFFECT Unified Compile Hotfix — 2026-10-07

## 원인

이번 오류는 EFFECT 통합 패치 자체의 의미 설계보다 **프로젝트 연결 파일 누락**이 원인이었습니다.

1. `commands/effect.ts` 파일은 존재하지만 `pxt.json`의 `files`에 포함되지 않았습니다.
2. `src/ast/command.ts`의 `CommandKind`에 `Effect`가 등록되지 않았습니다.
3. `test.ts`는 통합 전 API인 `effectInfinite`, `effectClear`, `effectClearAll`을 계속 호출하고 있었습니다.

이 조합 때문에 `command_adapter.ts`, `compiler.ts`, `validator.ts`, `custom.ts`에서 EFFECT 타입을 찾지 못해 연쇄 오류가 발생했습니다.

## 수정

- `CommandKind.Effect = 6` 추가
- `pxt.json`에 `commands/effect.ts` 추가
- EFFECT 문서 파일도 프로젝트 목록에 추가
- `test.ts`를 하나의 `Command.effect(...)` API 기준으로 변경

## 적용

프로젝트 루트 기준으로 이 ZIP의 파일을 같은 경로에 덮어씁니다.

```text
pxt.json
src/ast/command.ts
test.ts
```

`commands/effect.ts`는 이미 현재 소스에 존재해야 합니다.

## 확인

일반 TypeScript 정적 검사에서는 수정 이후 EFFECT 관련 타입/심볼 오류가 사라졌고,
남은 오류는 MakeCode 런타임 전용 전역(`player`, `loops`)을 일반 `tsc`가 모르는 것뿐이었습니다.

MakeCode에서 프로젝트를 다시 열거나 Extension을 새로고침한 뒤 오류 카운트를 확인합니다.
