# B4 ANIMATION·ANIMATION CONTROLLER 분리 및 엔티티별 라이브러리 (0.0.75)

## 변경 목적

- 기존 `ANIMATION ID` 카테고리의 Animation과 Controller를 별도 `ANIMATION ID` / `ANIMATION CONTROLLER` MakeCode 네임스페이스로 분리.
- Mojang `bedrock-samples/resource_pack/entity/*.json`의 `minecraft:client_entity.description`에서 실제 참조 관계를 추출해 EVENT처럼 엔티티별 그룹 생성.
- `Shared / Common`: 하나의 ID를 공식 엔티티 정의 2종 이상이 참조함. `Unmapped`: 공식 참조 관계를 찾지 못함. 분류는 **실게임 명령 사용 가능 여부를 보증하지 않음**.
- 기존 ANIMATION 536 ID와 CONTROLLER 179 ID를 **유지**하며, 기존 ANIMATION 블록 ID 및 기존 Controller 블록/API 이름을 삭제하지 않음.

## ZIP에서 변경/추가되는 파일

- `tools/update_b4_registry.cjs` — 기존 B4 공식 다운로드 후 Vanilla RP 엔티티 정의도 수집. 공식 애니메이션+컨트롤러+클라이언트 엔티티 파일을 전부 읽은 후에만 적용, 실패 시 사전 검사 중단.
- `tools/generate_b4_registry.cjs` — 엔티티별 그룹 생성, 기존 컨트롤러 reporter는 `blockHidden=true`로 호환 유지, 새 컨트롤러 reporter는 새 네임스페이스/블록 ID로 생성.
- `src/libraries/animation_library.ts` — 기존 `AnimationValue`/`ControllerValue`/직접 입력 API 유지. 컨트롤러 직접 입력은 새 카테고리로 옮기고 기존 입력 블록 ID는 숨김 보존.
- `src/blocks/b4_blocks.ts` — PLAYANIMATION의 컨트롤러 기본 Shadow 블록을 새 컨트롤러 카테고리로 지정. AST/Compiler/Validator 변경 없음.
- `tests/B4_REGISTRY_SAFE_UPDATE_TEST.cjs` 및 `tests/fixtures/official_animation/entity/*.json` — 분리·그룹·호환성·오류 방어 회귀 테스트.

이번 ZIP에는 `registry/source/bedrock/animations.json`, `animation_controllers.json`, `fogs.json`, `src/libraries/animation_library.generated.ts`를 **일절 포함하지 않음**. 기존에 로컬 업데이트한 536/179/80개를 롤백하지 않기 위함.

## 실제 PC 적용 (PowerShell)

ZIP을 **D:\command_block_coding**에 상대 경로를 유지해 풀어 덮어쓰기 합니다. `pxt.json.version`과 GitHub 커밋은 변경하지 않습니다.

```powershell
# 신규 분류 반영 + Mojang RP client entity 링크 자동 수집 (약 180개 정의 파일이 추가로 다운로드됨)
node tools\update_b4_registry.cjs --apply

# 회귀 테스트 및 재생성 무변경 여부 검사
node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs
node tools\generate_b4_registry.cjs --check

git status --short
git diff --check
```

실행하면 새 파일 `registry/derived/bedrock/animation_owner_links.json`이 생성됩니다. 이는 Minecraft 실행 파일이 아니라 생성용 참조 메타데이터이므로 `pxt.json.files`에 등록할 필요가 없습니다. JS→Blocks 및 실제 Minecraft Education 26.32 인게임 테스트는 별도 확인해야 합니다.

명령을 `--apply` 없이 실행하면 드라이런이며 파일을 변경하지 않습니다. 네트워크나 Mojang JSON에 문제가 있으면 생성·적용 전 실패합니다.

**대안 (네트워크 다운로드 전 단순 생성):** `node tools\generate_b4_registry.cjs` 실행 시 아직 owner_links가 없으면 그룹은 일단 `Unmapped`에 놓입니다. **소속 이름만 보고 임의 연결을 만들지 않습니다.** 공식 데이터를 받아오면 그룹이 갱신됩니다.

## 원본/호환성

- 기존 `MCFunctionAnimationLibrary.creeperSwelling()` 및 모든 기존 ANIMATION generated reporter: 함수명, 블록 ID 유지.
- 기존 `MCFunctionAnimationLibrary.animationControllerCreeperSwelling()` 등 기존 CONTROLLER generated reporter: 함수명/블록 ID 유지, Toolbox 표시만 숨김.
- 새 `MCFunctionAnimationControllerLibrary.animationControllerCreeperSwelling()` 등: 새 표시용 블록 ID.
- 기존 `MCFunctionAnimationLibrary.controller(id)` 직접 입력 및 `mcfunction_animation_controller_id`: 숨김 호환 유지.
- 새 `MCFunctionAnimationControllerLibrary.custom(id)` 및 `mcfunction_animation_controller_custom_id`: Toolbox 표시용.
- ID당 실제 ANIMATION reporter 하나 및 신규 CONTROLLER reporter 하나. 엔티티별 복제로 부풀리지 않음.
- 공식 `description.animations`·`description.animation_controllers`의 직접 참조만 그룹 근거로 사용. 공식 파일에 없는 IDs는 `Unmapped`로 남김.

## 검증 내용과 한계

- 로컬 Node 안전성 테스트 12/12 PASS.
- B4 Compiler+Validator 정적 회귀 12개 정상 및 12개 비정상 입력 PASS.
- TypeScript 네임스페이스 단독 `tsc --noEmit` PASS.
- 합성 데이터 536 Animation ID + 179 Controller ID → 894개 고유 블록 ID(536 표시 애니메이션, 179 표시 컨트롤러, 179 숨김 호환 컨트롤러) 생성 PASS.
- Windows PowerShell 온라인 전체 180개 entity 연결 수집 및 MakeCode UI 동작은 사용자 PC에서 추가 확인 필요.

## 절대 변경하지 않은 기존 기능

`tools/update_registry.ps1`, `tools/generate_registry.ps1`, ITEM/BLOCK/ENTITY Registry, 기존 CAMERA/FOG 파일, `.mcfunction` Compiler/Validator, MakeCode 블록 ID 삭제, `pxt.json` 버전/파일 목록, GitHub 커밋.
