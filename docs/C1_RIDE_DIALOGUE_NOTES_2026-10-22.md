# C1 RIDE / DIALOGUE — 0.0.77 직접 덮어쓰기 적용본

기준: `crosschang/command_block_coding` master, 2026-10-22 GitHub Pages 빌드의 커밋 `fb2f3b7b3f39b76cdf9c39ec8b98195b4ca922c4`에 해당하는 소스.

## 적용 방법
1. **실제 작업 폴더의 백업 ZIP을 먼저 보관합니다.** 적용 대상은 프로젝트 루트(`pxt.json`이 있는 곳)입니다.
2. 이 ZIP을 프로젝트 루트에 **폴더 구조 유지 / 덮어쓰기**로 압축 해제합니다. 별도의 CMD, SH, 설치 스크립트는 필요하지 않습니다.
3. 프로젝트 루트의 `pxt.json`이 여전히 `0.0.77`인지 확인합니다.
4. MakeCode Extension 로드/컴파일, 블록 표시, Definition/Preview를 실게임과 분리해서 검사합니다.
5. 실게임 테스트는 `tests/C1_RIDE_ONLY_UNIFIED_PUBLIC_API_MAIN.ts`의 RIDE부터 진행하며 DIALOGUE는 NPC/장면 준비 후 나중에 검증합니다.

**주의**: 이 소스는 2026-10-22 커밋 기준입니다. 그 후 사용자 PC에서 같은 파일에 별도 변경이 있었다면 해당 변경이 덮어써질 수 있습니다. 소스 백업과 비교를 먼저 하세요.

## 신규 구조
`Command.ride`/`Command.dialogue` (대표 MakeCode 블록) → `MCFunctionBlocks` → `MCFunctionAST` → `MCFunctionValidator` → `MCFunctionCompiler`.
RIDE 동작 5개와 DIALOGUE 동작 2개는 각각 Action Reporter로 조립합니다. 기존 분리 API는 숨김 상태로 보존합니다. 대상은 기존 TargetValue(Selector/이름), 소환할 엔티티는 기존 EntityValue/Registry를 사용합니다.

## 표준 명령 순서
- `ride <riders> start_riding <ride> [teleportRules] [howToFill]`
- `ride <riders> stop_riding`
- `ride <rides> evict_riders`
- `ride <rides> summon_rider <entityType> [spawnEvent] [nameTag]`
- `ride <riders> summon_ride <entityType> [rideRules] [spawnEvent] [nameTag]`
- `dialogue open <npc> <player> [sceneName]`
- `dialogue change <npc> <sceneName> [players]`

추가 소환 옵션을 사용할 때 선택 인수의 위치가 건너뛰어지지 않도록 Validator가 검사합니다. `nameTag`는 인용부호 이스케이프를 적용합니다. Registry에 없는 사용자 정의 엔티티/이벤트 ID는 문법이 유효하면 보존합니다.

## 검증 구분
- PASS: Node 정적/AST·Validator·Compiler·MakeCode 래퍼 테스트와 TypeScript 정적 타입 검사.
- **미검증**: 실제 Minecraft MakeCode/PXT 빌드 및 블록 GUI 표시, Minecraft Education 런타임 호환성, 행동 팩으로 연계된 DIALOGUE 장면, .mcfunction 파일 import/export.

공식 Bedrock 문법 참조:
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/ride?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/dialogue?view=minecraft-bedrock-stable

**GitHub 커밋/푸시/태그/버전 증가 작업 없음.**
