# B4 FOG Registry 적용 환경 메타데이터 + PLAYANIMATION 고급 인수 검증

- 기준: `crosschang/command_block_coding` / `0.0.75` (버전 변경 없음)
- 범위: **B4 전용** Registry 업데이트·생성 스크립트, 테스트 스크립트, 임시 MakeCode 테스트 파일
- **기존** `tools/update_registry.ps1`, `tools/generate_registry.ps1`, CAMERA/ANIMATION AST·Compiler·Validator/블록은 수정하지 않음
- 다른 Registry 및 현재 PC의 CAMERA 7개, FOG 80개, ANIMATION 536개, CONTROLLER 179개 목록을 ZIP 파일로 덮어쓰지 않음
- GitHub 커밋/푸시 없음

## 1. 안전 적용

ZIP 내용을 `D:\command_block_coding`에 상대경로대로 덮어쓸 것. 이 패치는 기존 B4 전체 ZIP이 아니다.

```powershell
node --test tests\B4_REGISTRY_SAFE_UPDATE_TEST.cjs
node --test tests\B4_ADVANCED_FOG_COMPAT_STATIC_TEST.cjs
node tools\update_b4_registry.cjs --apply --skip-official-animations
node tools\generate_b4_registry.cjs --check
node tools\report_b4_fog_media.cjs
node tools\report_b4_fog_media.cjs --csv tests\B4_FOG_MEDIA_REVIEW.csv
git status --short
git diff --check
```

`--skip-official-animations`은 **이번 실행에서** Mojang의 애니메이션 143개·컨트롤러 73개·엔티티 정의 180개를 다시 다운로드하지 않도록 한다. 기존 목록이나 매핑을 삭제하지 않는다. CAMERA 및 FOG의 공식 소스는 갱신하여 기존 ID는 유지한다.

기존 80개 FOG Registry를 대상으로 `registry/derived/bedrock/fog_media.json`을 생성하고, `src/libraries/fog_library.generated.ts`의 기존 Reporter에 `tooltip`만 덧붙인다. Reporter 함수명·블록 ID·반환하는 FogValue는 그대로다. `generate_b4_registry.cjs --check`의 `0 changed`를 확인한다.

### 적용 환경 정보의 의미

공식 Mojang Vanilla Resource Pack `resource_pack/fogs/*.json`의 `minecraft:fog_settings.distance`, `volumetric.density`, `volumetric.media_coefficients` 안에 **실제로 등장하는 필드만** 표시한다.

- `air`: 카메라가 공기 중일 때 적용되는 설정
- `weather`: 비/눈 등 날씨가 활성화된 상태의 공기 중 카메라
- `water`: 카메라가 물속일 때
- `lava` / `lava_resistance`: 용암 및 용암 저항 효과 조건
- `powder_snow`: 가루눈 안에 카메라가 있을 때(리소스/버전에 따라 다름)

예: `minecraft:fog_desert`는 Mojang 공식 원본에서 `distance.water`가 정의되어 있으므로 **지상에서 변화가 없다**는 이유만으로 명령이 실패했다고 할 수 없다. 반면 `minecraft:fog_crimson_forest`는 `distance.air` 정의가 있어 시각 테스트에 적합하다.

**주의:** JSON에 해당 필드가 있는 것과 Minecraft Education 26.32에서 현재 월드에 해당 리소스가 실제 로딩·표시되는 것은 별개의 문제다. 설정이 없으면 하위 우선순위의 안개 설정을 상속할 수도 있다. 메타데이터는 실행 가능성 화이트리스트가 아니다.

CSV는 수집 정보 전체를 검토하기 위한 로컬 보고서로 생성된다. **80개 개별 실게임 PASS를 의미하지 않는다.**

## 2. 임시 MakeCode 테스트 프로그램

파일: `tests/B4_ADVANCED_PLAYANIMATION_FOG_COMPAT_TEST_MAIN_0.0.75.ts`

**Extension 루트 `main.ts`를 덮어쓰지 말 것!** 새 임시 MakeCode 테스트 프로젝트의 `main.ts`에 이 파일 전체 내용을 붙여넣는다. 실제 .mcfunction 직접 내보내기 테스트가 아니라 기존 `FunctionFile.define → Adapter → AST → Validator → Compiler → Preview` 경로의 인게임 테스트다.

크리에이티브 테스트 서버, 개활지, 몹이 보일 정도의 고정 카메라 권장. FunctionFile 진단 `?`와 `이름?`에서 ERROR=0인지 먼저 확인한다. `INFO PLAYANIMATION_RESOURCE_DEPENDENT`, `INFO FOG_RESOURCE_DEPENDENT`는 명령 허용 안내일 뿐 시각적 PASS 증거가 아니다.

### PLAYANIMATION: 1차 고급 인수 호환성

아래 순서는 **채팅창에 `/` 없이** 입력한다. 1개 실행 후 3~5초 관찰하고 다음 테스트로 넘어간다. 기존 테스트로 알레이 춤의 기본 동작은 이미 PASS, 이번에는 선택 인수를 검증한다.

| 순서 | 채팅 함수 | 인수 차이 / 판정 기준 |
|---|---|---|
| 1 | `b4v_anim_prepare` | 이름이 다른 알레이 2마리 생성, 대조군 확보 |
| 2 | `b4v_anim_base` | 기준 춤 동작, 몸·날개 회전 |
| 3 | `b4v_anim_state` | `next_state=default` 컴파일·실행 허용 확인 |
| 4 | `b4v_anim_blend0` | `blend_out_time=0` 확인 |
| 5 | `b4v_anim_blend2` | `blend_out_time=2` 확인, 시각적 차이 없더라도 문법과 실제 효과 구분 |
| 6 | `b4v_anim_stop3` | `stop_expression="query.anim_time > 3.0"`으로 약 3초 뒤 종료되는지 관찰 |
| 7 | `b4v_anim_controller` | 공식 `controller.animation.allay.dancing` ID를 인수로 지정, 실제 지원/거부 분리 기록 |
| 8 | `b4v_anim_cleanup` | 테스트 알레이 2마리만 제거 |

**판정 항목을 분리:** (a) AST/Validator/컴파일 정상, (b) Preview 명령 실행 허용, (c) 눈에 보이는 춤 동작, (d) `next_state` 및 `controller`의 상태 효과, (e) `stop_expression` 시점과 `blend_out_time` 효과. 공식 Vanilla ID가 존재한다는 것만으로 이 컨트롤러 인수가 해당 명령에서 동작한다고 단정하지 않는다. 명확한 고급 옵션 문제는 코드/실게임 경로로 재현 뒤 수정한다.

### FOG: 매체별·스택 호환성

1. **공기/지상**: `b4v_fog_cleanup` → `b4v_fog_air_push` → 5초 관찰 → `b4v_fog_air_pop`
2. **수중**: 큰 물웅덩이에 완전히 잠수 → `b4v_fog_water_push` → 시각 효과 관찰 → `b4v_fog_water_remove`; 지상과 수중을 가능하면 둘 다 촬영
3. **서로 다른 공식 ID**: 개활지 → `b4v_fog_end_push` → 관찰 → `b4v_fog_end_remove`; Education에서 지원하지 않는다면 별도로 **호환성 미확인/리소스 미사용**으로 기록
4. **스택 우선순위**: `b4v_fog_stack_a` → `b4v_fog_stack_b` → `b4v_fog_stack_pop_b` → `b4v_fog_stack_remove_a`; 단계별 지평선 안개 색상 비교
5. 마지막에 반드시 `b4v_fog_cleanup` 실행

날씨별 검증은 `minecraft:fog_crimson_forest` 적용 상태에서 `/weather rain` 또는 `/weather thunder`를 별도로 비교할 수 있으나 날씨 자체의 시야 변화와 구별해야 한다. 자동으로 월드 날씨를 바꾸는 테스트 함수는 제공하지 않는다.

## 3. 검증 완료/미완료 구분

- B4 Registry 정적 안전성 검사: 15/15 PASS (초기 원본 + 80개 이상을 가정한 보존 테스트)
- 고급 테스트 코드: TypeScript **구문** 검사 및 공개 API 참조 정적 점검 PASS
- 실제 Windows 원격 소스 다운로드 및 MakeCode 블록 전환: **사용자 PC에서 검증 전**
- PLAYANIMATION 고급 옵션 / FOG 호환성: **실게임 결과 대기**
- CAMERA 기존 기능 및 기본 PLAYANIMATION/FOG PASS 판정은 그대로 유지

## 공식 근거

- [Microsoft PLAYANIMATION command](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/playanimation?view=minecraft-bedrock-stable)
- [Microsoft fog in resource packs](https://learn.microsoft.com/en-us/minecraft/creator/documents/foginresourcepacks?view=minecraft-bedrock-stable)
- [Mojang bedrock-samples: fogs](https://github.com/Mojang/bedrock-samples/tree/main/resource_pack/fogs)
