# B4 공식 Vanilla ANIMATION / CONTROLLER Registry 추가 — 2026-10-21

## 목표와 출처

- Mojang 공식 저장소: https://github.com/Mojang/bedrock-samples
- 실제로 제공되는 `resource_pack/animations/*.json`의 최상위 `animations` 키를 수집합니다.
- 별도로 `resource_pack/animation_controllers/*.json`의 최상위 `animation_controllers` 키를 수집합니다.
- 2026-10-21 GitHub 공식 디렉터리 확인: 애니메이션 JSON 143개, 컨트롤러 JSON 73개. 이는 **정의 파일 수**이며 최종 ID 수는 실행 결과에 따라 결정됩니다.
- 자료의 `animation.*`와 `controller.animation.*`는 **서로 다른 ID 종류**입니다. 파일명이나 `scripts/animate`의 별칭을 새 animation ID로 추측하지 않습니다.
- 공식 Vanilla 정의라는 사실은 `/playanimation`이 모든 엔티티에서 실행되거나 Minecraft Education에 같은 버전으로 제공된다는 보장이 아닙니다.

## 이번 패치의 구성

- `tools/update_b4_registry.cjs`: **기존 B4 업데이트 구조에만** Mojang 공식 애니메이션/컨트롤러 수집 기능 추가. 공식 디렉터리 안의 JSON 모두 다운로드·검증 완료 후에만 스냅샷 갱신. 오프라인 Fixture/skip 옵션도 지원.
- `tools/generate_b4_registry.cjs`: 기존 `animations.json`과 새 `animation_controllers.json`을 각각 읽어 동일한 `animation_library.generated.ts`에 MakeCode Reporter 생성. 기존 `creeperSwelling()` 및 Block ID 유지.
- `src/libraries/animation_library.ts`: 기존 API를 유지하고 `Controllers` 그룹만 추가.
- `registry/source/bedrock/animation_controllers.json`: 공식 Mojang의 creeper 컨트롤러 ID 1개를 초기값으로 제공. 전체 목록은 업데이트 실행 후 생성됩니다.
- `src/libraries/animation_library.generated.ts`: 새 컨트롤러 Reporter 초기값 포함. **FOG·CAMERA generated 파일은 패치에 포함되지 않음**.
- `tests/B4_REGISTRY_SAFE_UPDATE_TEST.cjs`: 기존 5개 테스트 유지 + 공식 애니메이션 모의 자료·기존 FOG 80개 보존 등 추가 검증.

## 적용 방법 — 반드시 현재 PC의 0.0.75 프로젝트에 덮어쓰기

현재 최신 `command_block_coding` 저장소를 백업하고 PATCH ZIP을 **저장소 루트에 상대경로를 유지**하며 적용하세요. 이전 B4 전체 ZIP을 다시 적용하지 마세요. 기존 FOG 80개와 생성된 파일을 덮어쓸 위험이 있습니다.

이 PATCH에는 **기존 FOG Registry / FOG 생성 파일, ITEM 등 기존 Registry, `pxt.json`이 없습니다.**

PowerShell(`D:\command_block_coding` 등)에서 먼저 테스트:

```powershell
node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs
node tools\generate_b4_registry.cjs --check
```

그다음 전체 Registry 확인(다운로드만 수행하고 쓰지 않음):

```powershell
tools\update_all_registries_safe.cmd
```

변경 내용을 적용:

```powershell
tools\update_all_registries_safe.cmd --apply
```

또는 **B4 Registry만** 갱신하려면:

```powershell
node tools\update_b4_registry.cjs --apply
```

실행 후 자동으로 `registry/source/bedrock/animations.json`, `animation_controllers.json` 및 `src/libraries/animation_library.generated.ts`가 확장됩니다. 기존 `camera_presets.json`, `fogs.json`은 중복 없이 유지·추가되는 방식이고, 예전 Registry 스크립트(`update_registry.ps1`, `generate_registry.ps1`)는 변경하지 않았습니다.

검증:

```powershell
node tools\generate_b4_registry.cjs --check
node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs
git status --short
git diff --stat
```

정상 결과 로그의 `ANIMATION (Mojang Vanilla RP): ... discovered=N`, `ANIMATION CONTROLLERS (Mojang Vanilla RP): ...`를 확인하세요. 그 숫자가 실제 수집된 **ID 수**입니다.

### 오프라인/수동 팩 경로

- 외부 다운로드 없이 현재 자료로 B4 생성만 수행: `node tools\generate_b4_registry.cjs`
- 공식 Animation 수집을 일시 생략: `node tools\update_b4_registry.cjs --apply --skip-official-animations`
- 팩의 별도 animation JSON을 추가: `node tools\update_b4_registry.cjs --apply --animation-source 경로\파일.json`
- 공식 자료 검증 예시는 `tests/fixtures/official_animation/` 아래 **Mojang에서 실제 확인된 ID를 발췌한 최소 Fixture** 입니다. 전체 원본이 아닙니다.

## 실행상 주의

1. 새 Reporter가 많이 생길 수 있습니다. 실제 MakeCode/PXT 컴파일·Toolbox 검색 성능은 **검증 전**입니다.
2. `/playanimation`은 대상 엔티티의 모델 뼈대/활성 Resource Pack과 호환될 때 시각적으로 보입니다. Registry에 있다고 해서 전부 실게임 PASS가 아닙니다.
3. 사용자 정의 Animation과 Controller ID 직접 입력은 계속 허용합니다. 공식 Registry를 화이트리스트로 사용하지 않습니다.
4. Minecraft Education 버전별 지원 여부는 Bedrock Vanilla 기준과 분리해 기록합니다.
5. GitHub 커밋/푸시 및 `pxt.json` 버전 변경은 수행하지 않았습니다.
