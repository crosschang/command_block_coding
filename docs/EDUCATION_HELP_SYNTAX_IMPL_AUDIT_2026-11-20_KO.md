# Education 실게임 도움말 7명령 ↔ 실제 GitHub 구현 감사 (2026-11-20)

## 근거·판정의 범위
- 사용자 제공 게임 내 `/help` 사용법 스크린샷 7장(2026-11-20): dialogue, tellraw, titleraw, execute, teleport(tp), summon, setblock.
- 화면에는 게임/MakeCode 정확한 버전 정보가 나오지 않는다. 사용법 표시 **확인**과 실게임 실행 성공(PASS)은 다르다.
- 저장소: `crosschang/command_block_coding`; 감사 시작 HEAD `a751e04ca20a8429125b7c2ee2ad7f222862ea8e`, `pxt.json.version=0.0.25`.
- 본 문서는 현존 코드의 정적 검사 및 스크린샷 문법 대조다. 게임에서 41개 분기를 실행해 확인한 테스트가 아니다.
- 문법 표기: `< >` 필수 인수, `[ ]` 선택 인수, 게임 UI의 `Option_If_Unless`/내부 타입명은 사용자에게 입력하는 토큰이 아님.

## 실게임 /help 화면별 구현 현황

| 화면 | 사용법 분기 | 기존 구현 근거 | 현재 판정 | 남은 점 |
|---|---:|---|---|---|
| `dialogue` | 2 | `commands/c1_ride_dialogue.ts`, `src/blocks/c1_ride_dialogue_blocks.ts`, `src/compiler/compiler.ts:compileDialogue`, `src/validator/validator.ts:validateDialogueCommand` | OPEN/CHANGE 구조 있음 | `dialogue/*.json` 실제 장면 정의·입출력·장면 연결 없음 |
| `tellraw` | 1 | `src/ast/command.ts`에 TellRaw 종류 없음. `src/preview/output_adapter.ts`가 진단 출력으로 tellraw 문자열 사용 | 사용자용 구조화 AST/블록 미구현 | RawText `text/translate/selector/score/with`, JSON 직렬화·검증·역변환 |
| `titleraw` | 4 | `src/ast/command.ts`에 TitleRaw 종류 없음. `pxt.json.files`에 전용 구현 없음 | 사용자용 구조화 AST/블록 미구현 | `set`·`clear`·`reset`·`times` 네 분기 |
| `execute` | 18 | `commands/c3_execute.ts`의 ClauseKind 21종(0~20), `src/blocks/c3_execute_blocks.ts`, `compileExecute`, `validateExecuteCommand` | 분기 구조 존재 | if/unless blockStates 포함, 중첩 RUN 및 Preview 차이·게임 호환성 검증 |
| `tp` | 10 | `commands/teleport.ts`의 대상 생략/지정, 위치/엔티티 목적지, rotation/facing position/facing entity, checkForBlocks; `compileTeleport` 및 Validator | 주요 구조 존재 | 각도 선택 인수 조합·입력 보존 점검 |
| `summon` | 4 | `commands/summon.ts` Simple/Advanced, Orientation None/Rotation/Facing; `compileSummon` 및 Validator | 주요 구조 존재 | nameTag/좌표/spawnEvent/방향 선택 조합 대조 |
| `setblock` | 2 | `commands/setblock.ts`, `compileSetBlock`, `compileBlockStates`, `validateSetBlockCommand` | 두 갈래 구조 존재 | 게임/`.mcfunction`의 `=` 블록 상태와 MakeCode Preview `:` 변환 경계 유지 |
| **총계** | **41** | 정적 코드 대조 | 기능 수준 혼재 | **실행 PASS가 아닌 문법 목록 개수** |

## 사진별 구체 문법 항목

### 1. dialogue: 2개
- `/dialogue change <npc: target> <sceneName: string> [players: target]`
- `/dialogue open <npc: target> <player: target> [sceneName: string]`
- `change`의 `sceneName` 필수, `open`의 `sceneName` 선택은 기존 Validator/Compiler와 대응한다.
- `dialogue.json` Scene/Buttons/RawText/LANG 참조 정의는 **별도 미구현**.

### 2. tellraw: 1개
- `/tellraw <target: target> <raw json message: json>`
- 일반 `Command.tell`은 RAW JSON 입력이 아니며 `tellraw`로 오인하지 않는다.
- `Command.raw`의 우회 사용 가능성과 구조화 구현 완료는 다른 상태다.

### 3. titleraw: 4개
- `/titleraw <player: target> <titleLocation: TitleRawSet> <raw json titleText: json>`
- `/titleraw <player: target> clear`
- `/titleraw <player: target> reset`
- `/titleraw <player: target> times <fadeIn: int> <stay: int> <fadeOut: int>`

### 4. execute: 18개
- `if/unless block` (blockStates 입력 형태와 미입력 형태), `if/unless blocks`, `if/unless entity`, `if/unless score` (비교 연산 또는 matches): **6행**.
- `align`, `anchored`, `as`, `at`, `facing position`, `facing entity`, `in`, `positioned`, `positioned as`, `rotated`, `rotated as`, `run`: **12행**.
- 기존 ClauseKind는 조건의 if/unless를 서로 다른 AST 종류로 보유한다. 도움말 18행과 AST ClauseKind 개수는 1:1 수량 비교 대상이 아니다.
- `compileExecute`는 clause 순서를 유지하고 `run`을 연결한다. 일부 Preview 의미·중첩 실행의 경고와 실제 게임 실행은 따로 판단한다.

### 5. tp: 10개
- 대상 생략: 엔티티 목적지 1, 좌표만 1, 좌표+각도 1, 좌표+facing entity 1, 좌표+facing position 1.
- 대상 명시: 위 다섯 형태를 그대로 사용한 총 5개. 모든 행에 `checkForBlocks` 선택 표기(단, 엔티티 목적지의 단순 형태는 tail 없음).
- **세부 감사 후보:** 도움말 각도에는 `[yRot: value] [xRot: value]` 두 개가 각각 선택으로 표시되나 현재 `MCFunctionAST.Rotation`은 yaw/pitch 쌍이 필수다. 실제 허용되는 각도 생략 조합을 확인하기 전 문법 불일치/버그로 확정하지 않는다.

### 6. summon: 4개
- 이름표 필수인 단순 오버로드 `<entityType> <nameTag> [spawnPos]`.
- 그 외 좌표+각도, 좌표+facing entity, 좌표+facing position의 3종 오버로드. spawnEvent/nameTag 선택 인수는 분기별 다르다.
- 현재 Simple/Advanced 구현은 해당 형태들을 표현하며, 모든 인수 조합의 성공 여부는 미검증이다.

### 7. setblock: 2개
- `/setblock <position: x y z> <tileName: Block> <blockStates: block states> [replace|destroy|keep]`
- `/setblock <position: x y z> <tileName: Block> [replace|destroy|keep]`
- 기존 `BlockStates`와 `SetBlockMode` 재사용. canon `.mcfunction` 컴파일은 `["key"="value"]` 형태 사용. Preview의 별도 `:` 변형을 Export 문법으로 사용하지 않는다.

## 큰 미완성 영역 — 별도로 판정
- **Import/Converter:** `src/parser/mcfunction_parser.ts` 1차는 `say`, `function`만 구조화한다. 이 문서의 7명령은 가져오면 모두 Raw Command로 보존되고, 아직 자동 블록 분해되지 않는다.
- **리소스 파일:** `dialogue/*.json`, `texts/*.lang`, `texts/languages.json`의 사용자 파일 입출력/생성 기능은 미구현. 명령 `dialogue` 실행 AST가 있다고 이 파일들이 자동 생성되는 것은 아니다.
- **C4:** `tellraw`와 `titleraw` 사용자용 RawText 구현이 먼저 필요하다.
- **검증:** 정적 소스 확인만 수행. 전체 MakeCode PXT 빌드, 모의 회귀 재실행, 실게임 41분기 실행, 멀티플레이, 파일 Export/Import 수행하지 않음.

## 후속 구현 우선순위
1. 기존 `execute/tp/summon/setblock/dialogue` AST·Validator·Compiler 보존. 명확한 불일치가 증명되기 전 중복 구현 금지.
2. 공통 RawText 타입과 `tellraw`/`titleraw` 4개 분기 구조 추가.
3. `.mcfunction` Parser의 7명령 역방향 변환 확대, 불명확한 입력은 Raw 보존.
4. Dialogue JSON / LANG 프로젝트 리소스 정의 및 블록 연결.
5. 실제 파일 Export/Import 및 양방향 블록 변환. 최종 성능 최적화는 그 뒤.
6. Minecraft Education 해당 버전 화면/실행으로 확정 가능한 차이만 검증 원장에 승격.

## 보호
- 기존 0.0.7 행동팩/전용 소스·기존 실행 브리지와 ACK/nonce는 변경하지 않는다.
- `pxt.json.files` 및 `pxt.json.version=0.0.25` 변경 없음.
- 모든 PASS 표기는 검증 방법과 범위가 확인되었을 때만 사용한다.
