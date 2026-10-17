# CAMERA FADE + FOV + ENTITY CONTROL 통합 패치 (0.0.68)

## 기준 및 보호 범위
- 원본: `command_block_coding(20261017-065229).zip` (사용자가 실제로 제공한 0.0.68 원본)
- 포함: 기존 CAMERA ACTION COMPOSITION → FADE VARIANTS → 이번 FOV/ENTITY VARIANTS까지 **모든 누적 변경**
- 버전 `0.0.68` 및 `pxt.json` 유지. 기존 AST·Compiler·Validator·진단 시스템 변경 없음.
- `.mcfunction` 파일 생성 기능은 추가하지 않음. PREVIEW용 command line 컴파일만 사용.
- 기존 공개 함수와 `blockId` 삭제 금지. 이전 FOV/ENTITY 선택형 Reporter는 `blockHidden=true` 호환 유지.

## MakeCode의 최종 연결 형태

```
CAMERA [적용 대상 @s] [command]
    ├─ SET [Preset] [선택 Settings Reporter]
    ├─ CLEAR
    ├─ FADE [선택: Color / Time / Time+Color]
    ├─ ENTITY CONTROL [Attach / Detach / Track / Track+CenterOffset / Remove]
    ├─ FOV [Set / Set+transition / Clear / Clear+transition]
    └─ PLAY SPLINE [ID]
```

### FADE (기존 미적용 변경 포함)
| Reporter | 컴파일 예시 |
|---|---|
| 아무 설정 없음 | `camera @s fade` |
| Color | `camera @s fade color 0 0 0` |
| Time | `camera @s fade time 0.5 1 0.5` |
| Time + Color | `camera @s fade time 0.5 1 0.5 color 0 0 0` |

### FOV (이번 변경)
| Reporter | 컴파일 예시 |
|---|---|
| FOV set | `camera @s fov_set 70` |
| FOV set + transition | `camera @s fov_set 30 2 linear` |
| FOV clear | `camera @s fov_clear` |
| FOV clear + transition | `camera @s fov_clear 2 linear` |

전환 타입의 `ease`는 MakeCode 입력 Reporter 이름일 뿐입니다. 출력 명령은 `ease` 키워드 없이 **숫자 시간 다음 Easing enum**입니다. 표시 초기값 70은 게임 내 기본 FOV 확정값이라는 뜻이 아닙니다.

### ENTITY CONTROL (이번 변경)
| Reporter | 컴파일 예시 |
|---|---|
| Attach | `camera @s attach_to_entity @e` |
| Detach | `camera @s detach_from_entity` |
| Track | `camera @s target_entity @e` |
| Track + Center Offset | `camera @s target_entity @e target_center_offset 0 1 0` |
| Remove target | `camera @s remove_target` |

`target_center_offset`은 `SET entity_offset`과 다른 명령 옵션입니다. UI Reporter는 전용으로 표시하고, 내부 데이터는 기존 `CameraOffset3` 값 구조를 재사용합니다. 실제 엔티티 대상으로 `@e` 전체 선택은 단일 엔티티를 보장하지 않으므로 실사용할 때 `@e[c=1]` 등 구체적 대상을 사용하세요.

## 수정 파일 및 PXT 설정
원본 사용자가 업로드한 0.0.68 소스에 **누적 패치** 적용 시 변경되는 기존 코드 파일은 다음 **두 개**입니다.
- `src/blocks/camera_blocks.ts`: FADE, FOV, ENTITY 하위 문법별 Reporter + 과거 블록 ID 보존
- `src/blocks/command_adapter.ts`: 이전 ACTION COMPOSITION의 대상 바인딩 및 필드 전달 개선 포함

AST, Compiler, Validator, `pxt.json`, 진단 파일, 다른 커맨드 파일 등은 유지합니다. 신규 `.ts` 파일이 없어서 `pxt.json.files` 수정도 없습니다.

## 확인한 테스트 범위
- `node tests/CAMERA_0.0.68_FOV_ENTITY_FADE_REGRESSION.cjs`: 정상 출력 16건, Validator 오류 케이스 6건 PASS
- 원본과 비교한 일반 `tsc` 신규 오류 0건 (기존 MakeCode 전역 의존 오류 27건은 이 검사에 포함)
- CAMERA 블록 ID 중복 없음, 새 Shadow ID 연결 누락 없음
- **미검증**: MakeCode 실환경 빌드, 새 블록 표시·연결, JavaScript↔Blocks 왕복, Minecraft Bedrock/Education 실제 실행

## 적용 및 실제 편집기 확인 순서
1. 기존 MakeCode 프로젝트를 별도로 백업합니다.
2. 전체 소스 ZIP을 적용하거나, **사용자 원본 0.0.68** 프로젝트에는 누적 PATCH ZIP을 적용합니다. 서로 다른 시점의 부분 패치를 섞지 않습니다.
3. MakeCode CAMERA 카테고리에서 메인 CAMERA의 명령 소켓에 FADE/FOV/ENTITY Reporter를 바꿔 연결합니다.
4. FADE는 기본/Color/Time/Time+Color, FOV는 4형태, ENTITY는 5형태 블록이 선택되는지 확인합니다.
5. JavaScript ↔ Blocks 전환 및 PREVIEW 결과를 검사합니다.
6. 실제 Minecraft 게임 실행 테스트는 CAMERA 전체 구현 확정 후 통합 수행합니다.

공식 참고: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/camera?view=minecraft-bedrock-stable
별도 CAMERA System 설명: https://learn.microsoft.com/en-us/minecraft/creator/documents/camerasystem/cameracommandintroduction?view=minecraft-bedrock-stable
