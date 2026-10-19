# A8 — SPAWNPOINT / SETWORLDSPAWN 구현 및 테스트 안내

기준 저장소: `crosschang/command_block_coding` (`master`)  
작업 기준 버전: `0.0.72` (버전 변경 없음)  
작업일: 2026-10-19  
상태: **로컬 AST/Compiler/Validator 및 TypeScript 정적 테스트 PASS, MakeCode UI / Education 실게임 검증 대기**

## 1. 범위

### MakeCode 블록 압축 (2026-10-19)

사용자 UI 확인 결과, 동일 명령의 인수 조합을 SPAWNPOINT 5개 + SETWORLDSPAWN 2개로 나눈 구성이 지나치게 길었다. 기존 7개 블록 ID와 JavaScript API는 삭제하거나 이름을 바꾸지 않고 **Toolbox에서만 숨김** 처리했다. 이후 대상 값 블록은 SPAWNPOINT 전용 그룹에서 SELECTOR 네임스페이스의 `Selector Targets`로 이동한 **공통 2개 reporter**로 승격했다. 신규 기본 UI는 **명령 블록 2개 + SELECTOR 대상 값 블록 2개**이다.

| 보이는 블록 | 접힌 상태 | 펼쳐서 선택하는 항목 |
|---|---|---|
| `SPAWNPOINT` | `spawnpoint` | `target` 공통 SELECTOR 값/이름, `position` 좌표 |
| `SETWORLDSPAWN` | `setworldspawn` | `position` 좌표 |
| `selector` | 대상 선택자 reporter | 기존 공통 Selector 조건 블록 연결 |
| `named player` | 대상 이름 reporter | 자유 입력 플레이어 이름 |

`SPAWNPOINT`에서 `target`만 연결하면 현재 위치, `target + position`을 연결하면 지정 좌표로 컴파일된다. 좌표만 연결하고 대상을 비워 두면 암묵적으로 다른 명령으로 바꾸지 않으며 Validator가 `PLAYER_TARGET_MISSING`을 보고한다. `SETWORLDSPAWN`은 좌표 입력을 펼치면 명시 좌표형이 된다. 기존 저장 블록은 같은 blockId와 함수로 복원 가능해야 하지만 **MakeCode Blocks 실제 전환은 사용자 화면 검증 대기**이다.

새로운 JavaScript API:

```typescript
Command.spawnpointShared();
Command.spawnpointShared(MCFunctionFields.targetSelector(selector));
Command.spawnpointShared(MCFunctionFields.namedPlayerTarget("Steve"), position);
Command.setWorldSpawnCompact();
Command.setWorldSpawnCompact(position);
```

이전 `Command.spawnpointCompact()` 및 `Command.spawnpointTargetNamed()` 등도 기존 프로젝트 호환용으로 계속 지원하지만 새 Toolbox에서는 보이지 않는다. 아래 표의 최초 7개 API 역시 보존한다.

Microsoft 공식 Bedrock 명령 문법:

```text
spawnpoint [player: target] [spawnPos: x y z]
setworldspawn [spawnPoint: x y z]
```

공식 문서:

- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/spawnpoint?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/setworldspawn?view=minecraft-bedrock-stable

다음과 같이 AST를 통해 컴파일한다. 명령문 앞 `/`는 `.mcfunction` 형식에 맞춰 붙이지 않는다.

| MakeCode Public API | Canonical 출력 예 | 의미 |
|---|---|---|
| `Command.spawnpointDefault()` | `spawnpoint` | 실행자의 현재 위치 |
| `Command.spawnpointSelector(selector)` | `spawnpoint @s` | 선택한 대상의 현재 위치 |
| `Command.spawnpointSelectorAt(selector, position)` | `spawnpoint @s 10 80 10` | 선택한 대상과 위치 |
| `Command.spawnpointNamed(name)` | `spawnpoint Steve` | 이름으로 대상 지정 |
| `Command.spawnpointNamedAt(name, position)` | `spawnpoint Steve ~ ~1 ~` | 이름과 위치 지정 |
| `Command.setWorldSpawnDefault()` | `setworldspawn` | 현재 월드 위치 |
| `Command.setWorldSpawnAt(position)` | `setworldspawn 10 80 10` | 월드 위치 지정 |

명령 구조는 다음을 따른다.

```text
MakeCode Block
 -> MCFunctionBlocks Adapter
 -> MCFunctionAST SpawnPoint/SetWorldSpawn
 -> MCFunctionValidator
 -> MCFunctionCompiler (canonical)
 -> existing Preview execution / FunctionFile capture
```

`PlayerTarget` 공통 타입은 기존 Selector AST를 감싸거나 직접 입력한 플레이어 이름을 구조화한다. 기존 Selector의 구현과 Block ID는 변경하지 않았다. 기존 Position의 절대/상대/로컬 좌표 컴파일러를 재사용한다. 두 명령 모두 인수 생략과 0값을 구별하고, 각 블록의 필수 좌표가 빠지면 ERROR가 발생한다.

## 2. 적용 파일 (저장소 루트 기준)

수정:

```text
pxt.json
custom.ts
src/ast/command.ts
src/blocks/command_adapter.ts
src/compiler/compiler.ts
src/validator/validator.ts
```

추가:

```text
src/ast/player_target.ts
commands/spawnpoint.ts
src/blocks/spawnpoint_blocks.ts
tests/A8_SPAWNPOINT_STATIC_REGRESSION.cjs
tests/A8_SPAWNPOINT_PUBLIC_API_MAIN.ts
docs/A8_SPAWNPOINT_SETWORLDSPAWN_0.0.72_KO.md
```

**기존 프로젝트를 백업한 후 패치 ZIP의 파일을 저장소 루트에 상대경로 그대로 반영한다.** ZIP 안에 전체 프로젝트를 넣지 않았다. 다른 기존 파일은 건드리지 않는다. `pxt.json.version`을 변경하지 않는다. GitHub 커밋은 사용자가 직접 수행하고, 버전 변경은 릴리즈 시에만 수행한다.

## 3. 정적 테스트 결과

2026-10-19 로컬 검사:

- `tests/A8_SPAWNPOINT_STATIC_REGRESSION.cjs`: **14개 정상 컴파일, 11개 Validator 음성 테스트 PASS**
- `pxt.json.files`: 3개 신규 TypeScript 파일 등록 확인
- 기존 Public API 블록 ID 7종 유지·Toolbox 숨김 확인, 신규 압축 UI 블록 ID 4종 정의 확인
- 구 압축 UI 7가지 + 새 공통 SELECTOR UI 5가지 AST dispatch / canonical 출력 테스트 **PASS**
- 공통 SELECTOR 대상 입력으로 연결한 SPAWNPOINT 5가지, TP 10가지 canonical 출력 회귀 검사 **PASS**
- `pxt.json.version`: `0.0.72` 그대로 유지
- TypeScript ES5 타입 검사: MakeCode 외부 API에 대한 로컬 임시 선언을 이용한 소스 검사 **PASS** (실제 PXT build 판정은 아님)
- CAMERA 회귀: `SET_28_GRAMMAR`, `SET_COMPOSITION`, `SET_CHAIN`, `FOV_ENTITY_FADE` 4종 **PASS**

기존의 `tests/dev/diagnostic_store_runtime_mock.cjs`와 `tests/dev/removed_alias_runtime_mock.cjs`는 레거시 `cbi_page` 명령을 기대하는 부분이 있어 실패했다. 현행 `?` / `?1` / `functionName?` 정책과 테스트 기대치가 다른 것으로, A8 수정 파일에는 해당 진단 모듈의 변경이 없다. 추후 테스트 자체의 정비가 필요하다.

**미검증:** Minecraft MakeCode 확장 컴파일, JavaScript → Blocks 복원, Minecraft Education 0.0.72 Extension 실게임 Preview, 실제 `.mcfunction` Converter 출력. 이 항목들은 PASS로 기록하지 않는다.

### MakeCode 컴파일 오류 후속 수정 (2026-10-19)

사용자가 MakeCode에서 `src/compiler/compiler.ts` 119행의 `Argument of type 'RegExp' is not assignable to parameter of type 'string'` 오류를 확인했다. 새 `compilePlayerTarget()`이 사용한 `String.replace(RegExp, ...)`가 MakeCode/PXT 타입 정의와 충돌한 것이 원인이다. 동일 파일의 기존 `quoteCommandString()`을 재사용하도록 수정했다. 이 함수는 `charAt()`와 문자열 연결로 따옴표·역슬래시를 처리하며, 신규 플레이어 이름 회귀 사례 두 개도 추가했다. 로컬 TypeScript 타입 검사와 정적 회귀 테스트는 재통과했으며, **MakeCode 화면에서 오류 소거 여부는 사용자 재검증 대기**이다.

## 4. Minecraft Education 테스트 절차

> 주의: `spawnpoint`와 `setworldspawn`은 각각 플레이어/월드 스폰 위치를 실제로 변경한다. 수업용·운영 중인 월드가 아니라 **복제한 테스트 월드에서만 실행**한다. 테스트 종료 후 해당 복제 월드는 필요에 따라 폐기한다.

1. 사용자가 GitHub에 변경 파일을 적용하고 커밋한다. 실게임 Extension 새 버전 로드가 필요할 때만 사용자 판단으로 릴리즈/버전업한다.
2. Minecraft Education에서 Extension을 불러오고 7종 블록을 확인한다. 이름 지정용 블록에서 직접 입력 가능 여부, Position/Selector reporter 연결을 확인한다.
3. `tests/A8_SPAWNPOINT_PUBLIC_API_MAIN.ts`에서 필요한 `FunctionFile.define()`만 `main.ts`에 복사한다. `test.ts`는 비워 둔다.
4. MakeCode JavaScript ↔ Blocks를 왕복하며 회색/미지원 블록이 생기는지 확인한다.
5. 복제 월드에서 `a8_sp_default`, `a8_sp_self`, `a8_sp_abs`를 순서대로 단독 실행한다. 재접속/리스폰 동작을 관찰한다.
6. 같은 월드에서 `a8_sp_rel`을 실행한다. Education 26.32의 과거 기록상 **상대좌표 및 인수 생략 Preview 실패 사례**가 있었다. 동일 명령을 게임 채팅에 직접 입력한 결과와 FUNCTIONFILE Preview를 비교하여 `DIRECT` / `PREVIEW`를 별도로 판정한다. canonical 명령어를 Preview 문제 때문에 임의로 바꾸지 않는다.
7. `a8_sp_named`의 `Steve`를 실제 테스트 플레이어 이름으로 수정한 뒤 확인한다.
8. 월드 스폰 관련 `a8_world_abs`, `a8_world_rel`, `a8_world_default`는 복제 월드에서 개별 테스트한다. 개인 스폰이 설정된 상태는 월드 스폰 검증을 가릴 수 있으므로 주의한다.
9. 기존 CAMERA, FUNCTIONFILE, `?` / `?1` / `name?` 진단 기능을 회귀 확인한다.
10. SPAWNPOINT와 SETWORLDSPAWN 각각 명령 블록 하나가 목록에 표시되는지, + 확장 버튼과 `selector` / `named player` 값을 연결하는지 확인한다. 이전 7개 블록이 저장 프로젝트에서 회색 블록 없이 로드되는지도 별도로 확인한다.
11. `named player` reporter는 SPAWNPOINT 그룹이 아니라 SELECTOR → `Selector Targets` 그룹에 표시되어야 한다. 별도 이름 입력 블록의 중복 노출 여부를 확인한다.

테스트 시 명령별로 블록 표시, JS → Blocks, AST/Compiler, Preview 결과, 게임 화면, 직접 채팅 입력 여부를 구분하여 기록한다. 최종 PASS는 사용자 실제 화면 확인 후 확정한다.
