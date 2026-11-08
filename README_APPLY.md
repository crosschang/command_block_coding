# B4 FOG ID — Mixed 그룹을 다섯 환경 조합으로 분리 (0.0.76)

이 패치는 **이전에 `B4_FOG_ENVIRONMENT_GROUPS_SAFE_DELTA_0.0.76_2026-10-21.zip`을 적용한 PC**에서 사용하는 작은 후속 패치입니다.

FOG ID의 `Mixed` 분류를 없애고 공식 리소스 JSON의 `distance`·`volumetric`·`volumetricScattering` 환경 종류를 합쳐 정확한 조합으로 분류합니다.

## 실제 80개 데이터 기준 예상 그룹

- Direct Input: 사용자가 직접 입력하는 Custom Fog ID
- Air + Water: 42개
- Water Only: 24개
- Air + Water + Weather: 7개
- Lava Included: 6개 (용암/용암 저항 포함)
- Powder Snow: 1개
- Other / Unknown: 현재 0개, 누락/새로운 조합이 등장하면 원본 보존

※ 이것은 Mojang 공식 Vanilla RP의 *정의된 JSON 필드 조합*이며, 개별 Education 버전의 렌더링 보장이나 지역 제한을 뜻하지 않습니다. 향후 Registry 업데이트 시 개수는 달라질 수 있습니다.

## 정확한 적용 방법

1. ZIP을 `D:\command_block_coding`에 폴더 구조대로 압축 해제합니다. 이전 소스나 Registry를 다시 덮어쓰지 마세요.
2. 프로젝트 루트 PowerShell에서 다음 순서대로 실행합니다.

```powershell
node tools\patch_b4_fog_five_groups.cjs --check
node tools\patch_b4_fog_five_groups.cjs --apply
node tools\generate_b4_registry.cjs
node tools\generate_b4_registry.cjs --check
node --test tests\B4_FOG_ENVIRONMENT_GROUPS_TEST.cjs
node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs
git status --short
git diff --check
```

- 적용 도구는 먼저 **현재 v1 생성기·FOG 카테고리·기존 테스트 파일의 내용이 예상과 일치하는지 모두 검사**합니다. 알 수 없는 변경이 발견되면 수정 없이 중단합니다.
- 백업은 `%TEMP%` 아래 임시 폴더로 저장하며 콘솔에 위치가 표시됩니다.
- `--check`는 파일을 수정하지 않습니다. `--apply`는 반복 실행해도 같은 내용을 중복 적용하지 않습니다.
- 기존 FOG 라이브러리 Reporter ID·함수명·블록 ID와 80개 ID 목록은 변경하지 않습니다.
- 적용 도구는 `tools/generate_b4_registry.cjs`, `src/libraries/fog_library.ts`, `tests/B4_FOG_ENVIRONMENT_GROUPS_TEST.cjs` 3곳만 편집합니다. 생성 시 `src/libraries/fog_library.generated.ts`의 **그룹 정보**가 갱신됩니다.
- `update_b4_registry.cjs`, 구형 `update_registry.ps1`, `generate_registry.ps1`, CAMERA/ANIMATION, `pxt.json`은 수정하지 않습니다. 버전은 0.0.76 유지.
- 이 패치는 새로운 명령 실행 코드를 변경하지 않으며 Minecraft Education 실게임 호환성 재검증을 요구하지 않습니다. 단 MakeCode UI 그룹 표시는 재확인해야 합니다.

## 검사 결과 (제작 환경)

- 5개 FOG 환경 그룹 테스트: 5/5 PASS
- 기존 B4 Registry 안전성 테스트: 15/15 PASS
- 80개 모의 공식 메타데이터에서 42/24/7/6/1 분류 확인
- 이전 v1 분류와 v2 분류의 Reporter 함수명·반환 ID·블록 ID 동일 확인
- CAMERA/ANIMATION 생성물 및 원본 Registry JSON 불변 확인
- 정적 Node.js 검사이며 Windows/MakeCode UI에 대한 실제 판정은 사용자 환경 실행 필요

## 문제가 발생하면

`REFUSED`는 알 수 없는 소스 변경을 발견하여 작업을 중단했다는 뜻입니다. 이전 패치를 다시 덮어쓰거나 버전을 되돌리지 말고 `--check` 출력과 `git diff -- tools/generate_b4_registry.cjs src/libraries/fog_library.ts`를 공유해 주세요.
