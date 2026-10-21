# 적용 지침 — B4 공식 애니메이션 수집 확장 (0.0.75)

이 ZIP은 **변경 파일만 포함한 델타 패치**입니다. 앞서 적용한 전체 B4 Registry 패치와 실제 PC에서 갱신한 FOG 80개는 그대로 두세요.

1. 현재 `command_block_coding` (0.0.75)을 백업합니다.
2. 이 ZIP을 프로젝트 루트에 폴더 상대경로 유지하여 덮어씁니다.
3. `node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs`를 실행합니다.
4. `tools\update_all_registries_safe.cmd`로 먼저 변경 예정 항목을 확인합니다.
5. `tools\update_all_registries_safe.cmd --apply`로 Mojang Vanilla 애니메이션과 컨트롤러 ID를 실제 수집·생성합니다.
6. `node tools\generate_b4_registry.cjs --check` 및 `git diff --stat`으로 검사합니다.
7. MakeCode에서 ANIMATION ID → Reference/Controllers 그룹과 회색 블록 유무를 확인합니다.

기존 item/block/entity/fog 레지스트리와 해당 generated 파일, `pxt.json`은 이번 ZIP에 포함되지 않습니다.
공식 GitHub의 `animations` 143개/`animation_controllers` 73개는 **파일 수**로, Registry ID 수는 실제 실행 로그를 확인해야 합니다.

자세한 자료: `docs/B4_OFFICIAL_VANILLA_ANIMATION_REGISTRY_0.0.75_2026-10-21.md`
