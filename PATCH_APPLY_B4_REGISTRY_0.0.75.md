# B4 Registry Safe Update — 적용 안내

1. 현재 `command_block_coding` 0.0.75 프로젝트를 백업하고 최신 B4 패치가 적용된 작업 폴더인지 확인한다.
2. 압축 파일을 프로젝트 루트에 **상대 경로를 유지해** 덮어쓴다.
3. 이 ZIP에는 앞서 전달한 B4 CAMERA/PLAYANIMATION/FOG 기본 패치도 포함되어 있다. 기존 B4 패치를 다시 적용할 필요 없다.
4. 현재 사용 중인 Windows 터미널에서 `node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs`로 테스트한다.
5. `node tools\generate_b4_registry.cjs --check`로 재생성 데이터가 맞는지 확인한다.
6. 전체 갱신은 `tools\update_all_registries_safe.cmd`(검토) → `tools\update_all_registries_safe.cmd --apply`(실제 변경) 순서로 실행한다.
7. 기존 ITEM/BLOCK/ENTITY 등은 Git diff로 기존 결과를 확인하고, **커밋은 사용자가 직접 진행한다.** `pxt.json.version`은 0.0.75로 유지한다.
8. 상세 운영법은 `docs/B4_REGISTRY_SAFE_UPDATE_0.0.75_2026-10-21.md` 참고.

주의: `update_registry.ps1` / `generate_registry.ps1`을 수정하지 않았으며, 애니메이션을 무조건 자동 크롤링하지 않는다. Windows PowerShell 실실행과 공식 온라인 갱신은 사용자 PC에서 확인한다.
