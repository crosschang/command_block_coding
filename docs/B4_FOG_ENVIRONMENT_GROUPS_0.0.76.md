# B4 FOG ID 환경별 소제목 — 안전 적용 패치

대상: `crosschang/command_block_coding`, MakeCode/PXT `0.0.76` 작업본. **버전 변경 없음.**

## 목적

기존 FOG ID Toolbox의 긴 `Built-in` 그룹을 공식 Mojang fog JSON에서 확인된 환경으로 분류합니다.

- `Direct Input`: Custom ID 직접 입력. 블록 ID `mcfunction_fog_custom_id` 유지
- `Air`, `Water`, `Weather`, `Lava / Lava Resistance`, `Powder Snow`: 해당 환경만 정의된 Fog ID
- `Mixed`: 두 개 이상 환경에 정의된 Fog ID
- `Other / Unknown`: 환경 정보가 없거나 아직 수집되지 않은 Fog ID

`distance`, `volumetric`, `volumetricScattering`의 환경을 모두 합쳐 판정합니다. `lava`와 `lava_resistance`는 같은 표시 그룹에 둡니다. Fog ID 하나에는 Reporter 블록 하나만 생성합니다. 생성 헤더의 소제목 목록은 실제 사용되는 그룹만 출력합니다.

이 분류는 **공식 JSON 정의의 메타데이터**입니다. Minecraft Education 실행 지원이나 어떤 바이옴에서 실제 안개가 표시될지 보장하지 않습니다. 예: `minecraft:fog_desert`는 `water` 설정만 확인됨.

## 적용 범위

적용 스크립트가 로컬에서 다음 **2개 파일만 텍스트 수정**합니다.

- `tools/generate_b4_registry.cjs` — FOG Reporter의 그룹 자동 배정
- `src/libraries/fog_library.ts` — MakeCode FOG 네임스페이스 소제목 및 Custom Reporter 그룹

스크립트에는 수동 수정 내용을 보호하는 검사와 원본의 임시 폴더 백업이 포함됩니다. 기존 생성 코드가 예상과 다르면 거부합니다. 기존 항목 ID, 함수명, 블록 ID, Registry JSON, FOG 메타데이터, CAMERA, ANIMATION, PXT 버전, 기존 `update_b4_registry.cjs`는 수정하지 않습니다.

파일 자동 생성 단계에서 `src/libraries/fog_library.generated.ts`만 소제목 정보에 따라 다시 생성됩니다. 새 TypeScript 파일을 추가하지 않으므로 `pxt.json.files` 편집은 필요 없습니다.

## Windows PowerShell 실행

ZIP 압축의 상대경로를 그대로 `D:\command_block_coding`에 복사한 뒤:

```powershell
node tools\patch_b4_fog_environment_groups.cjs --check
node tools\patch_b4_fog_environment_groups.cjs --apply
node tools\generate_b4_registry.cjs
node tools\generate_b4_registry.cjs --check
node --test tests\B4_FOG_ENVIRONMENT_GROUPS_TEST.cjs
node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs
git status --short
git diff --check
```

스크립트는 재실행해도 중복 수정하지 않습니다. `--check`는 변경 없이 적용 가능 여부만 검사합니다. **생성기 검사(`--check`)는 실제 생성 명령을 먼저 실행해야 정상적으로 0 changed가 됩니다.** 기존 Registry 자동 업데이트를 재실행할 필요는 없습니다.

## 예상 Toolbox

`FOG ID`에 `Direct Input`과 환경별 그룹이 나타납니다. 실제 FOG ID가 없는 그룹은 generated Reporter의 그룹 목록에서 생략됩니다. 현재 공식 80개 원본의 분류 예시는 Water 24, Powder Snow 1, Mixed 55입니다(2026-10-21 GitHub 원본을 기준으로 계산). 이 개수는 Registry 업데이트에 따라 달라질 수 있습니다.

`fog_desert`는 Water로, `fog_crimson_forest`는 Mixed로 예상됩니다. 각 Reporter에 등록된 ID와 함수명은 그대로입니다. MakeCode 실제 화면 구성과 JavaScript → Blocks 왕복은 사용자 PC에서 확인해야 합니다.

## 검증 범위

Node.js 오프라인 재현 환경에서 **기존 B4 안전성 테스트 15/15 + 환경별 신규 테스트 4/4 = 19/19 PASS**, 생성기 `--check` 0 changed를 확인했습니다. Windows 실제 MakeCode UI 및 Minecraft Education 실게임은 이 패치 이후 별도 확인 대상입니다.

GitHub 커밋이나 버전 업데이트는 수행하지 않았습니다.
