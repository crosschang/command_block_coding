# Minecraft Education EXECUTE E5 — Selector-gated Pose/Eye 통합 수정

적용 기준: `crosschang/command_block_coding` **0.0.86**, 이전 `C3_E356_E5_POSE_COMBINED_0.0.86`의 통합 수정본을 **이 패키지로 대체**. 실제 GitHub 커밋/버전 변경 없음.

## 무엇을 수정했나?

`src/preview/execute_interpreter.ts` **한 파일만 수정**했습니다. E1~E6의 기존 Interpreter, E3 점수 비교, E5 facing/anchored 제약, E6 안전 차단을 보존했습니다. 원래 `player.execute("testfor @s[y=...]")`의 boolean을 TS에서 읽어 자세를 정하던 코드를 제거했습니다. 2026-10-26 Education 녹화에서 천장 안과 밖이 모두 `SNEAK`로 나타나, 이 boolean 경로가 정확하다는 보장이 없었기 때문입니다.

대신 `tag @s[y=~... ,dy=0] add <임시태그>`를 게임에서 수행합니다(공백 없이 `y=~...`). 실제 **게임 선택자 자체가 참인 경우에만 태그를 부여**합니다. HIGH/MID/LOW 태그 세 개의 **서로 배타적인 조합**을 대상으로 `tellraw @s[tag=...]` 메시지를 보냅니다.

| 게임 내부 태그 결과 | 출력 |
|---|---|
| HIGH + MID + LOW | `STANDING eye +1.62 ...` |
| !HIGH + MID + LOW | `SNEAK eye +1.27 ...` |
| !HIGH + !MID + LOW | `LOW eye +0.4 ...` |
| 불일치 / 미검출 | `EXECUTE_POSE_UNKNOWN` |

모든 태그는 기존 `MCFunctionPreview.createInternalTagScopeToken()`, `createInternalTagName()`, `cleanupInternalTag()`로 관리합니다. **`player.execute()` 반환 boolean은 자세 판정에 사용하지 않습니다.** 임시 태그만 붙였다가 제거하므로 테스트 블록을 추가로 만들지 않습니다.

**중요한 제한:** 이 방식은 **게임이 선택자로 나눈 결과를 게임 채팅에 직접 출력**합니다. TypeScript가 동기적으로 `pose=STANDING` 같은 검증된 값을 읽는 방식이 아닙니다. 그러므로 눈높이를 적용한 실제 `RUN SETBLOCK`는 아직 차단하며, Eye Height는 `1.62/1.27/0.4`라는 **교정 전 후보값**입니다. 특히 LOW는 수영/기어가기/활공을 구분하지 못합니다.

## 적용

1. 이전 E3·E5·E6 zip과 Pose 통합본을 **추가로 덧씌우지 마세요.** 이번 패키지 안의 `src/preview/execute_interpreter.ts`를 시험용 Extension에 **하나만 교체**합니다.
2. `pxt.json`에 해당 파일이 이미 있는지 확인합니다. 현재 0.0.86에는 포함되어 있으므로 **새 파일 등록이 필요 없습니다.**
3. MakeCode Extension 변경을 적용하고 **새 Code Builder 프로젝트에** `tests/C3_E5_Pose_Gate_Education_Test.ts`를 입력해 JavaScript → Blocks 변환, 컴파일 후 접속합니다. 게임 최초 실행이 안 되면 이전처럼 월드 재입장과 코드 연결 상태를 확인합니다.
4. 기존 반복 커맨드 블록의 Native STANDING/SNEAK/LOW 출력을 **같이 켜 둡니다**. 테스트 월드와 자세 강제 시설을 그대로 사용하세요.
5. **서 있는 평지 → 1.5블록 천장 아래 강제 웅크리기 → 1블록 통로의 낮은 자세** 순으로 `g5pose`를 각각 한 번 실행합니다. `g5pose` 명령을 입력하는 동안 자세가 풀리면 낮은 천장으로 강제 유지합니다.
6. Native 반복 명령의 POSE_* 분류와 새 `[Preview] INFO [EXECUTE_EYE_HEIGHT_CANDIDATE] ...` 분류가 정확히 일치하는지 3상태를 한 번에 기록합니다.

### 기대 출력 (좌표는 플레이어 위치마다 달라짐)

```text
[Preview] INFO [EXECUTE_EYE_HEIGHT_CANDIDATE] STANDING eye +1.62 block X Y Z; CALIBRATION ONLY. No RUN executed.
[Preview] INFO [EXECUTE_EYE_HEIGHT_CANDIDATE] SNEAK eye +1.27 block X Y Z; CALIBRATION ONLY. No RUN executed.
[Preview] INFO [EXECUTE_EYE_HEIGHT_CANDIDATE] LOW eye +0.4 block X Y Z; CALIBRATION ONLY. No RUN executed.
```

`EXECUTE_POSE_UNKNOWN`은 **정상 판별 성공이 아니라 안전한 분류 실패**를 의미합니다. 메시지가 전혀 없으면 `tellraw` 자체의 Selector 처리나 명령 등록을 조사해야 합니다.

### 실패 시 첫 진단

- Native `POSE_STANDING`인데 TS에서 `SNEAK`라면 `tag @s[y=~1.5,dy=0]`의 MakeCode 실행 문맥/선택자 해석이 다르거나 명령이 실패했을 수 있습니다. 먼저 이 명령을 MakeCode `player.execute`로 호출했을 때 실제 태그가 부여되는지 독립 확인해야 합니다.
- Native가 `POSE_LOW`이고 TS도 LOW면 분류가 **일치한 것**이지 0.4블록 눈높이가 증명된 것은 아닙니다.
- 이번 버전은 Name/Tag Selector·좌표 계산과 `g5pose` 진단만 수정하므로 실제 `anchored eyes` SETBLOCK/네더 RUN 확대는 **미실행** 상태입니다.

## 코드/테스트 검증 기록

- `tsc --target es5 --module none --noEmit` (프로젝트 형식 스텁 + 수정 소스 + 테스트): PASS
- Node 기반 모의 게임 API 테스트: **41/41 PASS**. 모의 게임 태그 판별 및 반환 boolean 왜곡 시나리오 포함
- MakeCode/PXT 실제 빌드: 아직 검증 전
- Minecraft Education STANDING/SNEAK/LOW 선택자 게이트: **게임 테스트 대기**
- `.mcfunction` AST·Compiler·블록 ID·`main.ts`·`pxt.json`: **변경 없음**

자료: [MakeCode player.execute](https://minecraft.makecode.com/reference/player/execute) · [Bedrock Wiki 동작 감지](https://wiki.bedrock.dev/commands/detect-movements.html)
