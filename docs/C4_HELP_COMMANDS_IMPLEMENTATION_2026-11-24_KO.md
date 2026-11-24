# C4 잔여 명령어 5종 1차 소스 구현 (2026-11-24)

## 구현
- TITLE: title/subtitle/actionbar 일반 문자열, clear/reset/times. TITLERAW의 RawText와 별개.
- REPLACEITEM: block slot.container / entity 14종 SlotLocation, 처리 방식 keep/destroy 선택 입력, 수량·data·components. 공유 ItemStack/ItemCommandComponents/Position/PlayerTarget 재사용.
- ABILITY (Education): 플레이어 지정, mayfly/mute/worldbuilder 등 직접 입력 ID로 설정·조회. 미확인 ID는 WARNING.
- WORLDBUILDER (Education): 실행자 상태 토글. 다른 사람에게 임의 적용하지 않으며 행동팩 실행 주체는 WARNING.
- IMMUTABLEWORLD (Education): 선택 Boolean 설정 또는 조회. 월드 전체에 영향을 주므로 WARNING.

기존 AST CommandKind 0~40 값은 유지하고 41~45를 새로 할당했다. 기존 블록 ID와 runtime bridge는 변경하지 않았다. Blocks → Block Adapter → AST → Validator → Compiler → FunctionFile capture/Preview 순서를 그대로 사용한다.

## 검증
- 준비된 변경 트리의 실제 C4 Compiler 함수 본문을 추출하여 19개 명령 직렬화 사례를 모의 실행: **19/19 일치**.
- 실제 C4 Validator 함수 본문을 추출해 공통 검사를 모의 대체하여 16개 입력·오류/경고 사례 확인: **16/16 예상 ERROR 여부 일치**.
- 저장소 내 회귀 검사 추가: node tests/C4_HELP_COMMANDS_REGRESSION.cjs. 이 파일의 실제 Node 실행은 **아직 미실행**이며 PASS로 표시하지 않는다.
- MakeCode PXT 전체 빌드, 블록 UI, 게임 직접 명령, 브리지 Preview, 실제 .mcfunction 실행은 **미검증**.

## 미완료·주의
- C4 RawText TELLRAW/TITLERAW와 LANG/Dialogue 전용 정의 블록은 **별도 작업**.
- 기존 보수적 mcfunction Parser는 새 다섯 명령을 Raw로 보존하며 AST 자동 역변환은 **미구현**.
- REPLACEITEM의 인식하지 못하는 Item components JSON 속성은 아직 구조화하지 않으며, Raw Import 시 텍스트를 보존한다.
- ABILITY/IMMUTABLEWORLD 조회 결과를 Preview가 읽어오는 기능은 아직 구현하지 않았다.
- 교육 월드와 운영 월드가 아닌 복제 월드에서 월드·권한 설정 명령을 검증한다.
- 새 파일: commands/c4_help_commands.ts, src/blocks/c4_help_blocks.ts, tests/C4_HELP_COMMANDS_REGRESSION.cjs, 본 문서.
- pxt.json.files 등록 두 건. **pxt.json.version 0.0.25 보존**.

## 공식 문법 출처
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/title?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/replaceitem?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/enums/entityequipmentslot?view=minecraft-bedrock-stable
- https://edusupport.minecraft.net/hc/en-us/articles/360047555451-Essential-Commands
- https://edusupport.minecraft.net/hc/en-us/articles/360047117072-Profile-Types-and-Permissions
