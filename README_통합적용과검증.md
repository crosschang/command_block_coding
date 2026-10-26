# C3 0.0.86 — E3·E5·E6 + E5 Pose/Eye Anchor 통합 패키지

2026-10-26 / 기준 저장소 `crosschang/command_block_coding`

## 적용 원칙

- **앞서 제공한 E3·E5·E6 ZIP을 별도로 적용하지 마세요.** 이 ZIP은 그 소스를 출발점으로 하여 자세 판별 및 `anchored eyes` 후보 좌표 진단까지 합친 **교체본 1개**입니다.
- GitHub에서 교체할 파일은 `src/preview/execute_interpreter.ts` **하나뿐**입니다. 변경된 파일은 ZIP의 동일 경로에 있습니다.
- `main.ts`, AST, Compiler, Validator, EXECUTE 블록 연결, `pxt.json` 및 버전 번호는 변경하지 않았습니다. 기존 파일은 `pxt.json`에 이미 등록되어 있습니다.
- GitHub 커밋·릴리스·버전업 **미실행**. 시험용 브랜치/복사본에서 로컬 적용을 권합니다.
- MakeCode Extension을 갱신해 반영되었는지 확인하고, 별도 새 MakeCode 프로젝트에 `tests/C3_E356_Education_Integrated_Test.ts`를 넣어 Blocks 변환과 Education 게임 실행을 검증하세요.

## 기존 E3·E5·E6 기능도 포함됨

1. **E3**: 제한된 범위(-64..63)의 `@s`/Fake Player 점수 비교를 읽기 전용 PXT 검사로 시도. 반환값의 일관성이 없으면 UNKNOWN으로 차단. 점수 수정·임시 점수 생성 없음.
2. **E5 기존**: 눈 높이를 사용하지 않는 `anchored eyes + facing + 절대/상대 SETBLOCK`의 안전한 부분집합 지원. 눈 좌표를 정확히 알아야 하는 `facing + ^`는 차단.
3. **E6**: 점수처럼 전역으로 평가 가능한 조건과 SAY의 차원 중립 부분만 허용. 네더/엔드의 실제 SETBLOCK는 안전 차단.

## 이번에 추가한 E5 Pose Detector / Eye Candidate

- 사용자가 **반복 커맨드 블록으로 확인한** 자세 판별 원리 `@s[y=~1.5,dy=0]`, `@s[y=~0.7,dy=0]`, `@s[y=~0.3,dy=0]`를 현재 MakeCode 플레이어 `@s`에 한하여 TS에서 조회합니다.
- `testfor @s` **양성** / `testfor @s[y=~8,dy=0]` **음성** 대조 검사도 합니다. MakeCode `player.execute()`의 bool이 실제 조건 결과를 반환하는지 **게임에서 다시 확인해야 합니다**. 둘 다 참인 듯한 환경은 차단합니다.
- 가능한 상태 분류: `STANDING`(high/mid/low 모두 일치), `SNEAK`(high 미일치, mid/low 일치), `LOW`(high/mid 미일치, low 일치), `UNKNOWN`(그 밖의 모든 상태).
- **눈높이는 아직 교정 전 후보값**입니다. `STANDING=1.62`, `SNEAK=1.27`, `LOW=0.40` 블록. 이 수치가 Education Preview의 Native eyes 위치와 같다는 검증은 아직 없습니다. 특히 LOW에는 수영/기어가기/활공 등 여러 상태가 포함되므로 한 값으로 정확한 자세를 증명하지 못합니다.
- `execute as @s at @s positioned ~ ~0.45 ~ anchored eyes rotated 0 0 run setblock ^ ^ ^4 ...`처럼 구조가 단순한 명령의 예상 블록 좌표를 TS가 계산합니다.
- **현재는 계산된 블록 좌표를 진단 메시지로만 알려줍니다. RUN SETBLOCK는 실행하지 않습니다.** Native와 좌표가 같은지 보정하기 전에는 월드를 잘못 바꾸지 않기 위한 조치입니다.
- `positioned` 절이 anchor를 FEET로 초기화하는 규칙도 반영했습니다.
- 다른 엔티티, 다중 플레이어, 임의 Selector, facing entity, 자세 불명확, 다른 차원 또는 복잡한 조건에서는 결과를 추측하지 않고 진단/차단합니다.

## 한 번에 통합 실게임 검증

1. 두 ZIP을 따로 적용하지 말고 **본 패키지**의 `src/preview/execute_interpreter.ts`만 시험용 Extension에 적용.
2. 새로운 MakeCode 프로젝트에 `tests/C3_E356_Education_Integrated_Test.ts`를 붙여넣어 Blocks 변환.
3. 플레이어가 **서 있는 상태**에서 채팅에 `gall` 입력. E3 비교 참/거짓, E5 무영향 명령, E6 안전 차단, E5 **눈 좌표 후보 계산**을 연속 확인. `g3range`가 마지막에 점수를 200으로 바꾸므로 이전 조건 재실행 때는 `gsetup`으로 초기화.
4. 웅크린 채 `g5pose` 실행, LOW 자세(실제 낮은 통로·수영 등)에서 `g5pose`를 한 번 더 실행. `g5pose`는 예상 블록 좌표를 출력할 뿐 설치하지 않습니다.
5. 같은 자리/동일 자세에서 **게임 채팅 또는 반복 커맨드 블록으로 Native EXECUTE**를 실행해 좌표를 비교. 채팅 화면을 여는 순간 자세가 풀릴 수 있으므로 자세가 유지되는지 주의.

### Native 동등성 비교 명령

```mcfunction
execute as @s at @s positioned ~ ~0.45 ~ anchored eyes rotated 0 0 run setblock ^ ^ ^4 minecraft:diamond_block
```

- 채팅에는 명령 앞에 `/`를 추가해도 됩니다. 커맨드 블록에는 `/` 없이 입력하세요.
- 이 명령은 **실제 블록을 설치**하므로 반드시 복제한 테스트 월드에서 시험하세요. `g5pose`의 후보 좌표에 다이아몬드 블록이 나타나는지 확인합니다.
- Y를 `~0.45`로 고른 것은 후보 3개 자세가 다른 블록 높이를 갖도록 만든 것입니다. 예를 들어 플레이어 발의 정확한 기준 Y가 -60이라면 standing 약 -58, sneak 약 -59, low 약 -60에 배치될 것으로 **예상**됩니다. 실제 PXT 좌표 반올림 방식에 따라 차이가 있을 수 있습니다.
- 자세마다 **PXT 메시지의 블록 좌표**와 **Native 다이아몬드 블록의 실제 좌표**를 한 쌍으로 촬영해 주세요.

### 예상 메시지

- E3 기능: `E3 COMPARE GT TRUE - 3 greater than 1`, E6 글로벌 조건 성공 시 `E6 GLOBAL SCORE PASS ...`
- E5 `g5pose`: `INFO [EXECUTE_EYE_HEIGHT_CANDIDATE] STANDING eye +1.62 block X Y Z; CALIBRATION ONLY. No RUN executed.` 등
- 감지에 실패하면 `INFO [EXECUTE_POSE_UNKNOWN]`이며 **가짜 PASS가 아니라 미검증 상태**입니다.
- `g5guard`: 아직 검증되지 않은 `anchored eyes + facing + ^` 명령이므로 **기존처럼 차단**해야 합니다.
- E6 `g6guard`: `EXECUTE_DIMENSION_UNSUPPORTED`가 나와야 하며 네더 블록 설치를 주장하지 않습니다.
- `ERROR E3 FALSE BRANCH EXECUTED` 또는 `ERROR OUTSIDE SCORE DOMAIN RAN`이 출력되면 E3 **실패**입니다.

## 현재 검증 기록

- `tsc` 일반 TypeScript 정적 검사: 소스·테스트 PASS.
- Node 기반 분리된 모의 API 테스트: **총 41/41 PASS** (기존 35 + 신규 E5 6). 실제 PXT 실행의 증거는 아닙니다.
- Minecraft Education/PXT Blocks 변환: **미검증**.
- STANDING/SNEAK/LOW 판별: 사용자 영상으로 Native 커맨드 블록 검사 **PASS**, 새 MakeCode bool 검사 **미검증**.
- 눈 높이 후보 계산: **단위 테스트 PASS / Native 동등성 미검증**.
- E3 Scoreboard/E6 글로벌 조건: 이전 패키지 그대로 포함, **실게임 미검증**.

## 참고

- Minecraft MakeCode `player.execute`: https://minecraft.makecode.com/reference/player/execute
- Minecraft MakeCode `posLocal`: https://minecraft.makecode.com/reference/positions/pos-local
- Bedrock Wiki movement detection: https://wiki.bedrock.dev/commands/detect-movements.html
- Bedrock Wiki execute: https://wiki.bedrock.dev/commands/new-execute.html
- Microsoft Bedrock execute: https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/execute?view=minecraft-bedrock-stable
