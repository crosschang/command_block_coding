# B4 CAMERA / ANIMATION / FOG Registry 안전 업데이트 — 0.0.75

## 목표와 기존 호환성 원칙

- `tools/update_registry.ps1`, `tools/generate_registry.ps1` **내용 변경 없음**. 기존 ITEM, BLOCK, ENTITY, EFFECT, PARTICLE, FAMILY, ENTITY EVENT, SPAWN EVENT, BLOCK STATE 수집·생성 기능 유지.
- B4만 다루는 `tools/update_b4_registry.cjs`, `tools/generate_b4_registry.cjs` 추가.
- Windows에서 기존 + B4를 순차 실행하는 `tools/update_all_registries_safe.cmd` 추가. 기존 `.cmd` 파일도 **수정하지 않음**.
- B4 데이터만 수정: `registry/source/bedrock/{camera_presets,animations,fogs}.json`, B4 생성물 `src/libraries/{camera_preset,animation,fog}_library.generated.ts`.
- 기존 CAMERA·ANIMATION·FOG reporter의 함수명 및 blockId를 유지. Custom ID 입력 블록 및 AST/Compiler 변경 없음.
- 원격 소스는 Bedrock 공식 자료이지만 **Minecraft Education에서 모든 ID 실행 가능하다는 의미는 아님**.

## 1. 최초 적용

B4 라이브러리 패치를 적용한 **최신 0.0.75 프로젝트** 루트에 이 ZIP의 파일을 덮어쓴다. `pxt.json`의 버전은 변경하지 않는다. 프로젝트 폴더에 `node`가 설치돼 있어야 한다.

## 2. 기존 업데이트 동작 유지

기존 커맨드는 그대로 작동한다.

```bat
call tools\update_registry.cmd
call tools\update_registry.cmd -Apply
call tools\generate_registry.cmd -Check
call tools\generate_registry.cmd
```

B4 Registry만 갱신하려면 다음과 같이 한다.

```bat
node tools\update_b4_registry.cjs
node tools\update_b4_registry.cjs --apply
node tools\generate_b4_registry.cjs --check
node tools\generate_b4_registry.cjs
```

`--apply`가 없으면 네트워크 조회 및 변경 예고만 하고 파일은 수정하지 않는다. 유효하지 않거나 부족한 공식 응답은 반영하지 않는다. B4 생성기는 원본 JSON과 새로 생성할 블록 API의 이름·blockId 충돌을 먼저 검사한다.

기존 + B4를 한 번에 검토하거나 갱신하려면 Windows 명령 프롬프트에서:

```bat
call tools\update_all_registries_safe.cmd
call tools\update_all_registries_safe.cmd --apply
```

`--apply`는 먼저 **기존 업데이트를 실행하고** 이후 B4를 진행한다. 첫 단계가 성공하고 두 번째 단계의 네트워크 다운로드가 실패하면 기존 업데이트까지 자동 롤백되지는 않는다. 반드시 Git으로 차이를 확인한 후 수동 커밋한다.

## 3. 각 Registry의 공식 자료 및 제한

- **CAMERA PRESET**: MicrosoftDocs `minecraft-creator`의 `camera.md` `CameraPresets` enum. ID가 줄어들어도 기존 항목을 자동 삭제하지 않고 새 값만 추가.
- **FOG**: Mojang `bedrock-samples/resource_pack/fogs/*.json`에서 실제 `minecraft:fog_settings.description.identifier`만 가져옴. 공식 샘플에 없는 애드온 ID는 직접 입력.
- **ANIMATION**: `/playanimation`에서 쓸 수 있는 모든 애니메이션 ID의 포괄적인 공식 고정 enum은 없음. 임의로 웹에서 값을 추측하지 않으며 자동 업데이트 시 **기존 자료를 그대로 유지**. 자신이 사용하는 리소스 팩의 애니메이션 JSON에서 ID를 가져올 수 있음:

```bat
node tools\update_b4_registry.cjs --animation-source "C:\path\to\animations\cow.animation.json"
node tools\update_b4_registry.cjs --apply --animation-source "C:\path\to\animations\cow.animation.json"
```

JSON에 `{"animations": {"animation.example.walk": { ... }}}` 형태가 필요하다. 여러 파일을 가져오려면 명령을 반복한다. 패키지에 없는 ID는 계속 Custom ID로 직접 입력 가능하며, **ANIMATION CONTROLLER**도 별도의 Custom 입력 블록이 유지된다.

## 4. 실제 갱신 후 테스트

```bat
node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs
node tools\generate_b4_registry.cjs --check
```

그리고 반드시 MakeCode에서 CAMERA PRESET·ANIMATION ID·FOG ID 블록 검색과 JavaScript ↔ Blocks 전환을 확인한다. 기존 CAMERA/FUNCTIONFILE/Preview 진단 회귀 테스트를 다시 수행하고, 새 ID의 실제 Education 실행 여부는 별도 기록한다.

## 검증 범위 및 미검증

- **완료:** Node.js 22 환경에서 B4 재생성 동일성, 이전 blockId 보존, dry-run 무변경, 안전한 새 ID 추가, 재실행 안정성, 잘못된 원격 자료 거절, 충돌 방지 5개 자동 테스트 PASS.
- **미완료:** 이 작업 환경에서 Windows PowerShell 스크립트와 원격 GitHub/Microsoft URL의 실시간 다운로드는 실행할 수 없었음. 해당 부분은 사용자의 Windows PC에서 `check-only` 실행 필요.
- **미완료:** 추가로 수집한 CAMERA·FOG ID의 모든 Education 버전 실게임 동작. 공식 Bedrock Registry에서 나온 값은 Education 자동 PASS가 아님.

## 소스 변경 범위

추가 파일:
- `tools/update_b4_registry.cjs`
- `tools/generate_b4_registry.cjs`
- `tools/update_all_registries_safe.cmd`
- `tests/B4_REGISTRY_SAFE_UPDATE_TEST.cjs`
- `tests/fixtures/camera.md`, `tests/fixtures/fogs.json`, `tests/fixtures/animation-pack.json`
- 이 안내 문서

기존 `tools/*.ps1`, `pxt.json`, AST, Compiler, Validator, Block Adapter, Legacy generated Registry에는 변경 없음.
