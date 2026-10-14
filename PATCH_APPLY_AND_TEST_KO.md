# Minecraft MakeCode Command IDE — 첫 묶음 7종 통합 패치

- 기준 파일: `command_block_coding(20261014-052934).zip` (사용자 제공)
- 기준 `pxt.json.version`: **0.0.48** (변경하지 않음)
- 날짜: 2026-10-14
- 작업 방식: 기존 전체 코드가 아닌 **수정/추가 파일만 패치**
- 상태: 일반 TypeScript 정적 검사/로컬 Preview 시뮬레이션 PASS, **MakeCode 실제 편집기 및 Education 26.32 게임 검증은 사용자 실행 대기**

## 1. 패치 적용

1. 최신 전체 프로젝트 폴더를 별도 백업합니다.
2. 패치 ZIP 파일을 **`pxt.json`이 위치한 프로젝트 최상위 폴더**에 압축 해제합니다.
3. ZIP 안의 `src/ast/...`, `src/compiler/...`, `src/validator/...`, `src/blocks/...`, `commands/...` 경로 그대로 덮어씁니다. `src/` 없이 `compiler/`에 복사하면 안 됩니다.
4. `pxt.json.version`은 **0.0.48 유지**입니다. 임의 버전 변경하지 않습니다.
5. `main.ts` / `test.ts`는 패치 ZIP에 포함하지 않았습니다. 테스트할 때만 `tests/SIMPLE_BATCH_0.0.48_PUBLIC_API_MAIN.ts`의 내용을 임시 `main.ts`로 복사합니다.
6. MakeCode 확장 소스를 다시 불러오고 컴파일 후 **JavaScript → Blocks** 전환이 정상인지 확인합니다.
7. 테스트가 끝나면 `main.ts`를 원래대로 복원합니다.

## 2. 추가한 명령

| 블록 API | 출력 예 | 검증 범위 |
|---|---|---|
| `Command.tell()` | `tell @s Hello!` | 플레이어 대상, 비어 있는 메시지 ERROR |
| `Command.timeSetPreset()` | `time set noon` | day/sunrise/noon/sunset/night/midnight |
| `Command.timeSetTicks()` | `time set 6000` | 정수만 |
| `Command.timeAddTicks()` | `time add 1000` | 정수만 |
| `Command.weatherSet()` | `weather rain 300` | clear/rain/thunder, 선택 지속시간(초) |
| `Command.difficultySet()` | `difficulty normal` | peaceful/easy/normal/hard |
| `Command.cameraShakeAdd()` | `camerashake add @s 0.5 2 positional` | 강도/지속시간/종류 |
| `Command.cameraShakeStop()` | `camerashake stop @s` | 대상 지정 혹은 생략 |
| `Command.hudSet()` | `hud @s hide hotbar` | hide/reset, 선택 HUD 요소 |
| `Command.inputPermissionSet()` | `inputpermission set @s camera disabled` | permission / enabled/disabled |

`time query`, `weather query`, `inputpermission query`는 이번 1차 범위에서 제외했습니다. 실제 Query 결과가 Preview에서 보장된다고 주장하지 않습니다.

## 3. Minecraft Education 26.32 순차 테스트

**게임 테스트 전에 반드시 MakeCode JavaScript ↔ Blocks 변환부터 확인하세요.** 게임 채팅에서 아래 함수 이름을 **슬래시 없이** 실행합니다.

| 순서 | 함수 이름 | 예상 관찰 | 상태 |
|---|---|---|---|
| 1 | `sb48_tell` | 자신에게 메시지 | USER RUNTIME PENDING |
| 2 | `sb48_day` | 낮 | USER RUNTIME PENDING |
| 3 | `sb48_noon` | 정오 | USER RUNTIME PENDING |
| 4 | `sb48_set6000` | 6000틱으로 시간 설정 | USER RUNTIME PENDING |
| 5 | `sb48_add1000` | 1000틱 추가 | USER RUNTIME PENDING |
| 6 | `sb48_rain` | 비/눈 (생물군계 의존) | USER RUNTIME PENDING |
| 7 | `sb48_clear` | 맑아짐 | USER RUNTIME PENDING |
| 8 | `sb48_normal` | 월드 난이도 보통 | USER RUNTIME PENDING |
| 9 | `sb48_cs_pos` | 2초 화면 위치 흔들림 | USER RUNTIME PENDING |
| 10 | `sb48_cs_rot` | 2초 화면 회전 흔들림 | USER RUNTIME PENDING |
| 11 | `sb48_cs_stop` | 흔들림 즉시 중지 | USER RUNTIME PENDING |
| 12 | `sb48_hud_hide` | 핫바 숨김 | USER RUNTIME PENDING |
| 13 | `sb48_hud_reset` | 핫바 복원 | USER RUNTIME PENDING |
| 14 | `sb48_input_off` | 시점 조작 제한 | USER RUNTIME PENDING |
| 15 | `sb48_input_on` | 시점 조작 복원 | USER RUNTIME PENDING |
| 오류 | `sb48_bad_shake` | ERROR, 함수 미등록 | USER RUNTIME PENDING |
| 오류 | `sb48_bad_weather` | ERROR, 함수 미등록 | USER RUNTIME PENDING |

- CAMERASHAKE는 **설정 → Allow Camera Shake**를 켜야 보입니다.
- HUD·INPUTPERMISSION은 **Bedrock 공식 명령 참조 기준 코드**이며 Minecraft Education 26.32의 세부 요소별 지원은 테스트로 확인해야 합니다.
- 입력 제어를 제한하면 게임 진행이 어려워질 수 있습니다. 테스트용 월드를 권장합니다. `sb48_input_on`을 먼저 확보하고, 만일 블록으로 복구되지 않으면 게임 채팅에서 직접 `/inputpermission set @s camera enabled`로 복구합니다. **이동 제한 기능은 이번 기본 테스트에 넣지 않았습니다.**
- `sb48_hud_hide` 후 문제가 있으면 `/hud @s reset hotbar`로 복원할 수 있습니다.
- 난이도/시간/날씨 명령은 월드 설정을 바꿉니다. 테스트 전 원래 값을 확인하고 나중에 복원하세요.

## 4. 테스트 증거 수준

- ZIP 검사: 파일 누락 없음, 무결성 PASS (릴리스 패키징 시 검증)
- TypeScript 정적 검사: `tsc --target ES5 --noImplicitAny true`, PXT 런타임 이름에 대해 테스트 전용 스텁 사용. **실제 PXT 컴파일 PASS 아님**
- 명령 문자열/Validation/Adapter 로컬 시뮬레이션: 35 cases PASS
- FunctionFile 등록/ERROR 게이트 시뮬레이션: 유효 15개 등록, 무효 2개 차단, 대표 Preview 9개 명령 일치
- 실제 MakeCode JS→Blocks 및 Education 26.32 Runtime: **미실행**

## 5. 소스 보존

- 기존 Selector/SCORES/multi-HASITEM 구현 파일 `src/ast/selector.ts`, `src/fields/selector_field.ts` 수정 없음.
- 기존 Registry Generator / generated 파일 수정 없음.
- 기존 `main.ts`, `main.blocks`, `test.ts` 수정 없음.
- 기존 AST 0~19 번호 유지, 20~26 추가.
- `RawCommand` fallback 보존. 양방향 .mcfunction Parser는 이후 작업.
- 단일 `camerashake` 구버전 패치는 **추가 적용하지 마세요**. 이 통합 ZIP이 해당 기능을 포함합니다.

## 공식 Bedrock 참조

- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/tell?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/time?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/weather?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/difficulty?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/camerashake?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/hud?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/inputpermission?view=minecraft-bedrock-stable
