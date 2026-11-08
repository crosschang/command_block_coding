# B4 / CAMERA LIBRARY 패치 적용 안내

대상: `crosschang/command_block_coding` (Github master pxt.json version 0.0.75)

압축을 해제한 상대 경로 그대로 현재 프로젝트 루트에 복사하세요. 이 패치에는 구버전 0.0.72 전체 프로젝트를 넣지 않았습니다. `pxt.json`의 버전은 0.0.75 그대로입니다. GitHub 커밋·릴리즈는 사용자가 수행합니다.

- 신규: `commands/b4_actions.ts`, `src/blocks/b4_blocks.ts`
- 신규: `src/libraries/camera_preset_library*.ts`, `animation_library*.ts`, `fog_library*.ts`
- Registry 원본: `registry/source/bedrock/{camera_presets,animations,fogs}.json`
- 수정: `pxt.json`, `custom.ts`, `src/ast/command.ts`, `src/blocks/command_adapter.ts`, `src/compiler/compiler.ts`, `src/validator/validator.ts`
- 테스트/안내: `tests/B4_CAMERA_LIBRARY_0.0.75_MAIN.ts`, `tests/B4_CAMERA_LIBRARY_STATIC_REGRESSION.cjs`, `docs/B4_CAMERA_LIBRARY_0.0.75_2026-10-21.md`

자세한 테스트 순서는 docs 파일을 참조하세요.
