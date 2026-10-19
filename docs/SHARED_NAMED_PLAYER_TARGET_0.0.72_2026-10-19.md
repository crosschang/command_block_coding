# SELECTOR 공통 named player target — SPAWNPOINT / TP

작업 기준: `crosschang/command_block_coding` master, `0.0.72` 유지  
작업일: 2026-10-19  
상태: AST·컴파일러·검증기·로컬 정적 테스트 통과 / 실제 MakeCode 편집기·실게임 테스트 대기

## 사용자 UX 결정

이름 전용 블록은 `Command` / SPAWNPOINT 내부에 별도로 표시하지 않고 **`MCFunctionFields` (`SELECTOR`) 네임스페이스의 `Selector Targets` 그룹**에 배치한다.

- `named player $playerName` → `MCFunctionFields.namedPlayerTarget(name)` / blockId `mcfunction_target_named_player`
- `target selector $selector` → `MCFunctionFields.targetSelector(selector)` / blockId `mcfunction_target_selector`

두 reporter 모두 동일한 `MCFunctionFields.TargetValue`를 반환한다. 내부에는 selector 또는 literal name을 구분하는 `MCFunctionAST.PlayerTarget`이 들어간다. `name`은 플레이어를 직접 지정하는 문자열이며, 이름 붙인 일반 엔티티/몹은 `@e[name=...]` 등의 기존 Selector AST를 사용한다.

새 Toolbox 명령은 아래만 사용한다.

- `Command.spawnpointShared(target?, position?)`: SPAWNPOINT 한 개의 접고 펼치는 명령 블록
- `Command.setWorldSpawnCompact(position?)`: 기존 SETWORLDSPAWN 한 개
- `Command.teleportSelf(...)`: TP SELF 한 개 유지
- `Command.teleportTargetReference(victim, destination, checkForBlocks, orientation?)`: TP TARGET 공통 대상 입력
- `Command.teleportDestinationTarget(target)`: TP 엔티티 목적지에 공통 대상 입력
- `Command.teleportFacingTargetOption(target)`: TP facing 엔티티에 공통 대상 입력

## AST / 출력 예

| 입력 | Canonical `.mcfunction` 출력 |
|---|---|
| SPAWNPOINT default | `spawnpoint` |
| SPAWNPOINT named player Steve | `spawnpoint Steve` |
| SPAWNPOINT named player Steve + position | `spawnpoint Steve 10 64 -20` |
| TP TARGET Steve → 10 64 -20 | `tp Steve 10 64 -20` |
| TP @s → named Alex Rider | `tp @s "Alex Rider"` |
| TP Steve → 10 64 -20 facing Alex Rider | `tp Steve 10 64 -20 facing "Alex Rider"` |
| Legacy TP SELF → entity @s | `tp @s` |
| TP 대상 선택자 @e | `tp @e 10 64 -20` |

TP AST의 victim·entity destination·facing entity 모두 `PlayerTarget` 래퍼를 사용한다. **기존 `Selector` 타입 생성자 및 블록을 유지**하며 내부에서 새로운 래퍼로 변환하므로 예전 JS 호출/Toolbox blockId가 삭제되지 않는다. 새 블록 입력은 해당 래퍼를 전달한다. Validator는 플레이어 이름 유효성 검증과 @e 허용 여부를 사용 위치에 맞게 검사한다. 컴파일러는 기존 `compilePlayerTarget()`의 MakeCode 친화적 `quoteCommandString()`을 재사용한다.

## 저장 프로젝트 호환성

기존 `command_spawnpoint_compact`, `mcfunction_spawnpoint_target_selector`, `mcfunction_spawnpoint_target_named`, `mcfunction_tp_target`, `mcfunction_tp_destination_entity`, `mcfunction_tp_orientation_facing_entity` 등의 blockId와 함수는 **그대로** 유지하고 `blockHidden=true`만 붙였다. 최초 A8의 SPAWNPOINT 5종 / SETWORLDSPAWN 2종 blockId도 유지한다.

주의: 숨김 처리가 저장된 프로그램의 회색 블록 발생을 완전히 배제한다고 단정할 수 없다. 실제 MakeCode Blocks ↔ JavaScript 왕복 검증을 진행해야 한다. 기존 코드의 물리적 일괄 마이그레이션은 하지 않는다.

## 검증

- `tests/A8_SPAWNPOINT_STATIC_REGRESSION.cjs`: AST canonical/validator, 기존 A8 API 회귀 및 새 SPAWNPOINT 블록 호출
- `tests/TARGET_NAMED_PLAYER_SHARED_REGRESSION.cjs`: TP canonical 10종, 부적합 이름 3종, 신규 reporter, 구 TP 블록 AST 실행 mock
- `tests/A8_SPAWNPOINT_PUBLIC_API_MAIN.ts`: SPAWNPOINT 인게임 수동 검증 예제
- `tests/TARGET_NAMED_PLAYER_PUBLIC_API_MAIN.ts`: TP 이름 대상·목적지·facing 수동 검증 예제
- TypeScript ES5 로컬 ambient 타입 검사 및 기존 CAMERA 회귀 테스트 4종

실제 Minecraft Education에서 TP와 SPAWNPOINT를 실행하면 월드의 위치/스폰을 변경한다. 기존 수업 월드 대신 **복제한 테스트 월드**에서 예제별로 개별 실행한다. 이름 예제는 실제 접속 중인 플레이어 이름으로 바꿔야 한다.

## 배포 경계

`pxt.json.version`은 `0.0.72` 그대로다. 릴리즈가 아니므로 버전업하지 않는다. GitHub 커밋/푸시하지 않는다. 변경 파일은 패치 ZIP으로 사용자에게 전달한다.
