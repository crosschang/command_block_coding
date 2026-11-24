# Education 실게임 /help 명령 문법 2차 감사 — TITLE / REPLACEITEM / ABILITY / WORLDBUILDER / IMMUTABLEWORLD

- 기록일: 2026-11-24
- 기준 소스: `crosschang/command_block_coding` master `447da7efb8bb2ee4a4c2398ddbb37f4f76bc97b1`; `pxt.json.version = 0.0.25`
- 원본 증거: 사용자가 2026-11-24 제공한 게임 내 도움말 스크린샷 두 장
  - `image(20261124-101723).png` (1920×568, SHA-256 `ac9ae96391aaef19b84a4fa5d560205519b1abbcffce13fa73cc7d80b16a2df1`)
  - `image(20261124-101828).png` (906×438, SHA-256 `8502de74ecc3aa600a1b5f1a2068361bfdae2e8bdb75aa6414f127d135530b2f`)
- **증거 수준:** 인게임 `/help` 화면의 사용법 표시만 확인. 각 명령 실행, 권한 조건, MakeCode Preview, Script API 또는 행동팩 실행은 이번에 테스트하지 않음. 사진에 게임 빌드 번호가 없어 정확한 Education 버전은 미확인.
- 앞선 2026-11-20 일곱 명령 감사 `docs/EDUCATION_HELP_SYNTAX_IMPL_AUDIT_2026-11-20_KO.md`의 도움말 41행 + 이번 12행 = **12개 명령, 도움말 표기 53행**. 이는 가능한 인수 조합 전체 개수나 게임 실행 PASS 수가 아님.

## A. 사진의 원문 사용법

### `title` — 4행

```text
/title <player: target> <title|subtitle|actionbar> <titleText: message>
/title <player: target> clear
/title <player: target> reset
/title <player: target> times <fadeIn: int> <stay: int> <fadeOut: int>
```

- 게임 UI는 두 번째 필드를 `title|subtitle|actionbar`로 한 묶음 표시. Title은 **일반 메시지**이며 이전에 확인한 `titleraw`의 JSON RawText 인수와 구별.
- `clear`/ `reset`/ `times`는 텍스트 표시와는 별도 명령 동작. 타이밍 단위는 Microsoft 공식 문서상 게임틱.

### `replaceitem` — 4행

```text
/replaceitem block <position: x y z> slot.container <slotId: int> <itemName: Item> [amount: int] [data: int] [components: json]
/replaceitem block <position: x y z> slot.container <slotId: int> <oldItemHandling: ReplaceMode> <itemName: Item> [amount: int] [data: int] [components: json]
/replaceitem entity <target: target> <slotType: EntityEquipmentSlot> <slotId: int> <itemName: Item> [amount: int] [data: int] [components: json]
/replaceitem entity <target: target> <slotType: EntityEquipmentSlot> <slotId: int> <oldItemHandling: ReplaceMode> <itemName: Item> [amount: int] [data: int] [components: json]
```

- `block`은 좌표와 문자 그대로의 `slot.container`, `entity`는 선택자/이름 및 장비 슬롯 종류를 입력한다.
- 각 대상마다 기존 슬롯 아이템 처리 방식 `oldItemHandling`이 **있는/없는 두 문법**으로 구분된다. Microsoft 공식 문서는 `keep`·`destroy`를 ReplaceMode 값으로 설명한다.
- `amount`, `data`, `components`는 선택 인수지만 위치 인수이므로 AST의 생략 여부를 보존하고, 뒤 인수만 사용한 경우 기본값 직렬화는 공식 규칙에 따라 따로 검증한다.
- `components: json`은 기존 `ItemCommandComponents`를 가능한 한 재사용하되 **미인식 JSON 필드를 삭제하지 않는 Raw 보존**이 필요하다.

### `ability` — 2행

```text
/ability <player: target> <ability: Ability> <value: Boolean>
/ability <player: target> [ability: Ability]
```

- 첫 번째는 설정, 두 번째는 `ability` 지정 여부가 선택인 조회 계열 문법으로 보인다. **조회 결과를 Preview에서 읽어오는 기능까지 확인된 것은 아님.**
- Minecraft Education 공식 자료의 능력 종류 예: `mayfly`, `mute`, `worldbuilder`; 실제 현행 버전의 열거형 전체/권한은 별도 확인.
- 사용자별 권한·능력에 영향을 주므로 게임 실행 문맥 및 누가 실행하는지 검증 필요.

### `worldbuilder` — 1행

```text
/worldbuilder
```

- 인수 없는 자기 World Builder 상태 토글로 설명되어 있음. `wb` 별칭은 도움말과 Education 공식 권한 안내에 존재.
- 실행자의 신원과 권한이 핵심이므로 `CommandNode`를 브리지에서 임의 다른 플레이어 대상으로 바꾸지 않음.
- `ability <player> worldbuilder <bool>`와 의미를 무조건 합치지 않음(토글 vs 대상 지정).

### `immutableworld` — 1행

```text
/immutableworld [value: Boolean]
```

- 월드 전체의 변경 제한 설정과 관련. 인수 생략 시 정확한 동작은 게임 도움말 표기만으로 확정 불가.
- 기존 월드 설정에 영향을 주는 명령이므로 제작 중 Preview 자동 실행 금지, 별도 명시 실행·복제 월드 시험 우선.
- Education 공식 자료상 운영자 권한 관련. Bedrock 일반 명령의 전면 지원을 의미하지 않음.

## B. 실제 저장소 구현 대조

현재 `src/ast/command.ts` `CommandKind`는 `Raw(0)`부터 `Execute(40)`까지로 구성되며, **`Title`, `ReplaceItem`, `Ability`, `WorldBuilder`, `ImmutableWorld` 전용 AST 종류가 없음**. 전용 MakeCode 블록/Compiler/Validator 완성으로 표시하지 않는다. 기존 `Raw` 명령으로 원문 보존 가능하나 시각 편집 가능하다는 뜻은 아니다.

### 재사용할 공통 타입
- `title`: 기존 `PlayerTarget` 또는 알맞은 player-target Validator, 명령 위치 `title/subtitle/actionbar`; `titleraw`는 RawText 문자열 형태가 다른 별도 Action AST로 설계.
- `replaceitem`: `src/ast/slot.ts` `SlotLocation`, `src/ast/item.ts` `ItemStack`, `src/ast/item_components.ts` `ItemCommandComponents`, `Position`, `PlayerTarget/Selector`. 현재 `SlotLocation`에 `slot.container` 항목이 없으므로 확장/별도 블록 컨테이너 슬롯 타입의 필요성 검토. `EntityEquipmentSlot`의 실제 허용 범위는 명령·버전별 Registry 검사.
- `ability`: 공통 플레이어 대상, Boolean, Education Capability Registry 및 조회 결과 전달 경로(아직 완성 아님).
- `worldbuilder`·`immutableworld`: 별도 명령 AST, 환경/실행 주체/권한 경고, 게임 환경 프로파일에 따라 Validation.
- 완성 시 `pxt.json.files` 등록 및 `pxt.json.version` 유지. 기존 Block IDs와 AST를 변경·삭제하지 않음.

## C. 검증 및 후속 순서

1. C4: 공통 RawText → `tellraw`, `titleraw`의 JSON 구조.
2. Plain Title: `title` 네 분기. RawText를 일반 `message`에 자동 변환하지 않음.
3. `replaceitem`: 블록·엔티티 × 처리 옵션 2종, Item/Slot/Components 재사용·보존.
4. Education: `ability` 설정/조회, `worldbuilder` 토글, `immutableworld` 선택 Boolean.
5. AST/Validator/Compiler → MakeCode Block Adapter → 보수적 Parser → 파일 왕복.
6. Education 게임 검증: 채팅 직접 실행, MakeCode Preview, 브리지 명령, 실제 `.mcfunction` 실행을 독립 평가. `worldbuilder`·`immutableworld`은 운영/교육 월드가 아닌 복제 월드에서 시험.
7. LANG/Dialogue JSON 전용 블록·출력은 별도 로드맵과 연결하며, 과거 `spawnpoint` 실패 및 `@initiator`/동적 RawText 호환성 이슈를 유지한다.
8. 기능·정확성 통합 검증 뒤 성능 최적화. **이번 단계는 문법 확인·소스 정적 대조뿐이며 빌드/실게임 실행 없음.**

## 공식 출처 (Bedrock과 Education 구분)
- Bedrock TITLE: https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/title?view=minecraft-bedrock-stable
- Bedrock REPLACEITEM: https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/replaceitem?view=minecraft-bedrock-stable
- Education Essential Commands: https://edusupport.minecraft.net/hc/en-us/articles/360047555451-Essential-Commands
- Education Profile Types and Permissions: https://edusupport.minecraft.net/hc/en-us/articles/360047117072-Profile-Types-and-Permissions
