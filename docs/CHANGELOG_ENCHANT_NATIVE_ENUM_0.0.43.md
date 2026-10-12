# 0.0.43 — ENCHANT Registry 및 명령 블록 구현

기준 전체 소스: 사용자 `command_block_coding(9).zip` 및 별도 0.0.42 호환성 패치. 기존 PXT version `0.0.40` 유지.

## 소스 구조

- `VERSIONED_NATIVE_ENUM` Enchantment 이름 데이터: `registry/source/bedrock/enchantments.json`, 별도 버전 snapshot 보존
- 레벨 범위는 각 항목의 `minLevel` / `maxLevel`에서 관리. 최대 1레벨인 항목과 다중 레벨 항목을 구별
- `tools/generate_registry.ps1`로 Enchantment reporter 및 Registry lookup 생성. `*.generated.ts` 파일은 재생성 결과이며 수작업 변경 금지
- `Command.enchant(...)` 단일 본체, `MCFunctionEnchantmentLibrary.*()` 이름 및 숫자 ID 입력, `Command.enchantLevel(...)` 선택 리포터
- 이름과 숫자 ID를 AST 분기(`EnchantmentIdKind`)로 분리하고 Validator 및 Compiler 연결
- Selector, FunctionFile Definition Validation, cbi_diag, Preview 기본 실행 경로 재사용

## Canonical 출력 예시

```mcfunction
enchant @s sharpness 5
enchant @s silk_touch 1
enchant @s 9 1
```

- 숫자 ID `9`의 버전별 정확한 의미는 이번 패치에서 확정하지 않았다. 특정 이름으로 변환하지 않고 원문 숫자를 유지한다.
- 마법 부여 대상이 **현재 손에 들고 있는 실제 아이템**인지, 기존 인챈트와 호환되는지는 게임 Runtime에서 확인한다. 정적 문법 검사와 실행 성공은 구분한다.
- 이름형 미등록 값: WARNING + 원문 보존. 숫자 ID: 버전별 매핑 미확정 INFO. 문법 오류/확인된 레벨 범위 초과: ERROR + Function 등록 차단.
- 최대 레벨 자료: Microsoft Creator Docs, Minecraft Bedrock Wiki. 신규 메이스 인챈트(밀도 5, 관통력 감소 4, 윈드 버스트 3)는 Mojang Bedrock 1.21 릴리스 노트로 보강.
- Education 26.32에서 개별 Enchantment 또는 `player.execute()` Preview 가능 여부는 **실게임 미검증**.

## 적용 및 생성기 검사

1. 사용자 최신 전체 소스 백업 후 수정 파일만 상대경로 유지하여 덮어쓴다.
2. Windows PowerShell: `tools\generate_registry.cmd -Check`
3. 최신 생성 확인 실패 시 `tools\generate_registry.cmd` 실행 후 `-Check` 다시 수행
4. `tests/ENCHANT_0.0.43_PUBLIC_API_MAIN.ts`를 임시 `main.ts`에서 실행해 JS↔Blocks, cbi_diag, 아이템 호환성 실측
5. 실측 전에는 Runtime PASS로 표기하지 않는다.

## 미검증·검사 한계

이 작업 환경에는 PowerShell(`pwsh`)과 Minecraft MakeCode 실게임 Runtime이 없어 PowerShell 생성기와 PXT 실제 컴파일은 미실행이다. 일반 TypeScript + 임시 MakeCode API 선언으로 유형 검사를 진행하며, AST/Compiler/Validator 자동 검사는 별도 수행한다. Windows `-Check`는 사용자 환경에서 반드시 확인해야 한다.

기존 `pxt.json.version`, `main.ts`, `test.ts`, 이전 Gamerule/TAG 및 Sound/Music 기능을 유지한다.
