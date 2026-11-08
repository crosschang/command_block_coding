# CAMERA PRESET 라이브러리 연결 — UI 전용 안전 패치

기준: crosschang/command_block_coding, pxt.json 0.0.75

## 변경 목표

`src/blocks/camera_blocks.ts` 내 CAMERA SET 관련 프리셋 기본 shadow 13곳을 기존 4개 dropdown Reporter (`mcfunction_camera_preset_builtin`)에서 새 7개 Registry Reporter (`mcfunction_camera_library_first_person`)로 연결합니다.

기존 4개 reporter의 함수명 및 blockId는 **삭제하지 않고** `blockHidden=true`로 Toolbox에서만 숨깁니다. 저장한 예전 블록 호환을 위해 API는 유지됩니다.

`commands/camera.ts`, Compiler, Validator, Registry 원본, CAMERA/FOV/FADE/ENTITY 명령, `pxt.json`은 수정하지 않습니다.

## 사용법 (PowerShell, 저장소 루트)

ZIP 파일을 `D:\command_block_coding`에 경로 유지해서 압축 해제 후:

```powershell
node --test tests\CAMERA_PRESET_UI_SAFE_PATCH_TEST.cjs
node tools\patch_camera_preset_ui_0_0_75.cjs --check
node tools\patch_camera_preset_ui_0_0_75.cjs --apply
node tools\patch_camera_preset_ui_0_0_75.cjs --check
git diff -- src\blocks\camera_blocks.ts
git status --short
```

실제 수정되는 소스 파일은 `src/blocks/camera_blocks.ts` 하나뿐입니다. 사용자 PC의 기존 작업을 그대로 살리도록 원문과 동일한 지정문만 변경합니다. 적용 직전에 자동으로 `src/blocks/camera_blocks.ts.before_camera_preset_ui_0_0_75.bak` 백업을 생성합니다.

**새 블록이 연결되지 않거나 13개 입력 위치와 일치하지 않으면**, 파일을 변경하지 않고 중단합니다. 그 경우 로그를 공유하세요. 무리하게 패치하지 마세요.

## UI 검사

- CAMERA 명령 > `set` 액션의 기본 preset이 `camera minecraft:first_person` Reporter로 나오는가?
- preset 소켓에 `camera minecraft:fixed_boom`, `camera minecraft:follow_orbit`, `camera minecraft:control_scheme_camera` Reporter를 끼울 수 있는가?
- `camera custom preset example:my_camera`가 유지되는가?
- 기존 저장 프로젝트 CAMERA 블록이 회색 블록으로 바뀌지 않는가?
- JavaScript → Blocks → JavaScript 전환 시 기존 CAMERA 호출이 유지되는가?

**위 항목은 사용자 PC의 MakeCode 실측이 아직 필요합니다.** 이 패치는 UI 기본 연결만 바꿉니다. 게임 내 CAMERA 동작을 새로운 PASS로 주장하지 않습니다.

## 복구

문제 시 기존 작업물을 보존한 뒤 백업을 `src/blocks/camera_blocks.ts`로 복사해 복구합니다. 예전 프로젝트의 CAMERA API 함수/Block ID를 삭제하지 않았습니다.
