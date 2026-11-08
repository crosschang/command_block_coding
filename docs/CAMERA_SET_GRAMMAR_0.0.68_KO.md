# CAMERA SET 공식 문법 조립식 Reporter — 0.0.68

## 기준
- Microsoft Bedrock Stable `/camera` SET 명령 공식 28구문, 2026-10-17 조회.
- 원본: `command_block_coding_0.0.68_CAMERA_SET_COMPACT_FULL.zip` (누적 FADE/FOV/ENTITY 변경 포함).
- **Minecraft Education 실게임 검증 전**. 이 문서는 정적 AST·Validator·Compiler 회귀 검증 결과다.
- 버전 `0.0.68`, PXT/MakeCode, 공통 AST, 기존 진단 시스템 유지. `.mcfunction` 파일 생성 기능은 개발 범위에서 제외.

## MakeCode 연결법

```text
CAMERA target [Selector] command [SET]
  SET preset [Builtin Preset or Custom Preset ID]
      (+) option [SET 문법 Reporter]
            - default
            - pos
            - rot
            - facing entity
            - facing position
            - pos + rot
            - pos + facing entity
            - pos + facing position
            - view_offset
            - entity_offset
            - view_offset + entity_offset
            - rot + view_offset
            - rot + entity_offset
            - rot + view_offset + entity_offset

  (필요할 때) option [SET ease] -> [위 14개 Reporter 가운데 하나]
```

**참고:** `SET ease`는 14개 옵션을 감싸고, `ease`가 붙은 명령은 컴파일러가 `set <preset> ease <시간> <타입> <설정>` 순서로 출력한다. Ease만 넣고 뒤의 설정을 비우는 형태는 공식 28구문 중 하나가 아니므로 피해야 한다. 기존 호환 API의 동작은 변경하지 않았다.

## 14개 기본형과 동일한 14개 Ease형

| 설정 Reporter | 기본형 뒤에 붙는 키워드 |
|---|---|
| Default | `default` |
| Pos | `pos x y z` |
| Rot | `rot pitch yaw` |
| Facing Entity | `facing <selector>` |
| Facing Position | `facing x y z` |
| Pos + Rot | `pos x y z rot pitch yaw` |
| Pos + Facing Entity | `pos x y z facing <selector>` |
| Pos + Facing Position | `pos x y z facing x y z` |
| View Offset | `view_offset x y` |
| Entity Offset | `entity_offset x y z` |
| View + Entity Offset | `view_offset x y entity_offset x y z` |
| Rot + View Offset | `rot pitch yaw view_offset x y` |
| Rot + Entity Offset | `rot pitch yaw entity_offset x y z` |
| Rot + View + Entity Offset | `rot pitch yaw view_offset x y entity_offset x y z` |

위 각 경우에 `ease <초> <Easing>`을 앞에 붙인 14가지가 존재한다. 프리셋만 지정하는 레거시 기본형 `camera @s set minecraft:free`도 유지한다.

## 호환성 및 변경 경계
- 신규 대표 Action 블록 ID: `mcfunction_camera_action_set_grammar`.
- 기존 Action 블록 ID (`mcfunction_camera_action_set_composed`, `mcfunction_camera_action_set_compact`)와 기존 옵션 Reporter ID는 코드에서 **삭제하지 않고 `blockHidden=true`**로 보존했다.
- 옛 블록이 저장된 작업공간에는 옛 블록이 그대로 보일 수 있다. 새 CAMERA 메인 블록을 꺼내면 신규 기본 Action을 쓴다.
- Camera AST, Command Adapter, Compiler, Validator, `pxt.json`, 진단 시스템, FADE/FOV/ENTITY 관련 함수는 변경하지 않았다.
- 기본 Preset Registry 선택과 Custom Preset ID 입력은 그대로 유지한다.

## 테스트
```sh
node tests/CAMERA_0.0.68_SET_28_GRAMMAR_REGRESSION.cjs
node tests/CAMERA_0.0.68_SET_COMPOSITION_REGRESSION.cjs
node tests/CAMERA_0.0.68_FOV_ENTITY_FADE_REGRESSION.cjs
```
- 공식 SET 28종 AST→Validator→Compiler 테스트 PASS.
- 기존 SET 13종 및 CAMERA FADE/FOV/ENTITY 16종, 오류 6종 회귀 테스트 PASS.
- 일반 TypeScript `tsc --noEmit`의 전체 프로젝트 진단은 MakeCode/PXT 의존 및 중복 test 소스로 인해 통과하지 않는다. 수정 전과 비교할 때 **신규 오류 패턴 0건**.
- MakeCode 실제 블록 렌더링 및 JS↔Blocks, PREVIEW, 게임 실행은 미검증이다.

## 다음 수동 점검
1. `src/blocks/camera_blocks.ts`만 먼저 교체하고 PXT에서 컴파일 결과 확인.
2. 새 CAMERA 메인 SET을 꺼내 `+`를 누르면 한 개의 `option` 입력만 나오는지 확인.
3. `SET pos`, `SET rot`, `SET facing`, `SET view + entity` 각각 연결과 블록↔JavaScript 왕복 확인.
4. SET Ease Reporter로 각 경우를 감쌌을 때 PREVIEW 순서 확인.
5. 기존 블록 작업공간에서 Legacy Action Reporter가 깨지지 않았는지 확인.
6. 전체 CAMERA 개발 종료 이후 Bedrock/Education 실게임 통합 테스트 실시.

공식 문법: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/camera?view=minecraft-bedrock-stable
