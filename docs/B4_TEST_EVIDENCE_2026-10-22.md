# TEST_EVIDENCE_LEDGER — B4 추가 원장 (2026-10-21~22)

> 출처: 사용자 제공 Minecraft Education 26.32 실게임 영상/스크린샷, 사용자 직접 확인, 당시 테스트 `main.ts`, GitHub `master` 소스 구조 대조. **이번 문서 작성 과정에서 실게임을 새로 실행한 것은 아님.** PASS는 해당 대표 경로만을 뜻한다.

## A. 버전과 증거 구분
- 이전 B4 기능 시험 시점: `0.0.75`→`0.0.76`.
- 현재 GitHub `master` 확인: `pxt.json` **0.0.77**; 커밋 `351aae3d3397f2b4f1a5e1ee134cf3ce506c7c5f`은 `pxt.json`만 변경. 기능 소스 동일.
- 현재 GitHub 테스트 파일 구조: `tests/B4_REGISTRY_SAFE_UPDATE_TEST.cjs` **15 test()**, `tests/B4_FOG_ENVIRONMENT_GROUPS_TEST.cjs` **5 test()**, `tests/B4_ADVANCED_FOG_COMPAT_STATIC_TEST.cjs` **2 test()**. 과거 대화에서 15/15+5/5 및 정적 검증 결과를 보고했으나 **0.0.77에서 이 22개를 지금 다시 실행했다고 주장하지 않음**.
- Preview `INFO` / `Execution allowed`는 실행 명령 수용의 필요 정보일 뿐 화면 변화 판정 아님.

## B. B4 PLAYANIMATION 실게임 증거

| 대상/기능 | 대표 증거 | 상태 | 한계 |
|---|---|---|---|
| Allay `animation.allay.dance` | `2026-10-21 14-35-25.mp4`: 이름 지정 Allay 춤, 대상 정리 | **PASS (대표 시각)** | 스니퍼/아머 스탠드와 동등한 고급 인수 증거는 아님 |
| Armor Stand 기본/연속 자세 | `2026-10-22 10-25-18.mp4`: `hero→brandish→zombie→default`; 정면 동영상 | **PASS** | 각 포즈의 원본 본 회전/중첩 정량 분석 별도 |
| `stop_expression="0"` / `"1"` | `2026-10-22 10-33-57.mp4`, `2026-10-22 14-30-41.mp4`: 자세 유지 대 종료 A/B | **PASS (시각)** | 단일 영상에서 controller 겹침의 독립 변수 분리는 주의; A/B에서 보완 |
| `blend_out_time=0` / `2` | `2026-10-22 14-30-41.mp4`: 좌우 아머 스탠드 복귀 동작 속도 차이 | **PASS (시각)** | 정확히 2.000초 정량 계측 미실시 |
| `next_state` | `2026-10-22 16-58-39.mp4` + 사용자 `state_reset→state_seed` 동일 자세 스크린샷/명시적 확인 | **PASS (대표 시각)** | `query.state_time` 시간 임계값 정확성은 별개 |
| `controller` ID 독립 효과 | `2026-10-22` 사용자 `b4f_ctrl_compare` 및 `b4f_ctrl_stop_extra` 2개 스크린샷. 양쪽은 *동일* zombie 애니메이션, controller ID만 다르게 적용 | **PASS (대표 시각)** | 내부 컨트롤러 중첩 우선순위 일반화 금지 |
| Sniffer `animation.sniffer.dig` | `2026-10-22 14-30-41.mp4`: 새끼 스니퍼가 머리를 낮추고 발굴 자세를 유지. 이름 지정 목표 | **PASS (대표 시각)** | 정밀한 8초 타이밍 미측정 |
| Sniffer `search` 및 stop | `2026-10-22 15-42-25.mp4`: 탐색 동작 → 종료 후 자세 변화 → 재실행 | **시각적 재생·종료 관찰, 주기 미검증** | 자연 AI 이동이 계속됨; `loop: true` 공식 정의와 실제 2초 주기 측정은 별개 |

**좌우 좌표 주의:** 초기 A/B 파일에서 Minecraft 로컬 좌표 `^X` 부호에 따라 화면 좌/우가 안내와 반대로 보였던 이력이 있다. *화면상 좌우와 실제 셀렉터 name/tag/Controller ID 대응을 코드와 함께 확인*해야 한다. 최종 PASS는 개체 ID를 추적한 A/B 기준.

**타이밍 주의:** 초기 `query.anim_time > 1.5`를 전환 “속도”라고 설명한 오류를 정정했다. 종료 조건의 임계값이지 `blend_out_time`이 아니다. 이후 `stop_expression="1"`을 써서 `next_state` 시각 차이를 분리했다. `query.state_time > 1.5` 조건으로 시간 경과 후 자세 변화가 보였으나 정확한 1.5초 계측/플랫폼 보증은 **PENDING**.

## C. B4 FOG 실게임 증거

| 기능/조건 | 대표 증거 | 판정 | 주의 |
|---|---|---|---|
| `push`/`pop`/`remove`, crimson forest air fog | `2026-10-21 14-49-42.mp4` (붉은 안개 지상 적용/해제/재적용/제거) | **PASS** | 초기 `minecraft:fog_desert`는 물 전용 정의로 지상에서 변화 없음. Parser/Compiler 실패 근거가 아님 |
| 스택 A → B → pop B → remove A | `2026-10-22 09-02-43.mp4` / `2026-10-22 09-13-58.mp4` 중 FOG 스택 녹화 | **PASS (대표 시각)** | red → End dark → red → 기본 시야 복구 |
| 수중 water FOG 적용·해제 | 같은 FOG 재테스트 영상 수중 구간 | **PASS** | 물속 시점에서 시야 변화/복구 |
| End fog를 일반 월드 지상 적용·해제 | 같은 FOG 재테스트 지상 구간 | **PASS** | 대표 ID, Education 80개 전체 검증 아님 |
| Fog Library 환경 소제목 | 사용자 FOG Toolbox 분류 정상 확인 (`0.0.76`) | **UI PASS** | ID 80개가 모두 실게임에서 지원되는 것은 아님 |

### FOG Registry 구현/데이터
- Mojang Vanilla RP FOG ID **80개**, 현재 `src/libraries/fog_library.generated.ts`의 소제목: `Air + Water` 42 / `Water Only` 24 / `Air + Water + Weather` 7 / `Lava Included` 6 / `Powder Snow` 1. `Direct Input` 별도.
- 초기 `Mixed=55`는 현재 **해당하지 않는 과거 단계**. 기존 `docs/B4_FOG_ENVIRONMENT_GROUPS_0.0.76.md`는 1차 패치 역사 문서로 보존하되 현재 분류는 5개 세부 그룹을 우선한다.
- 공식 FOG JSON `distance`, `volumetric`, `volumetricScattering` 환경 합집합을 사용. 리소스 팩 메타데이터이며 실게임 가시성은 별도 검증.
- 기존 Fog ID, Reporter 함수명 및 Block ID 보존. 타입 직접 입력도 유지.

## D. B4 CAMERA / ANIMATION 라이브러리
- CAMERA preset Library **7개**와 MakeCode 연결 블록 UI 사용자가 사진으로 확인. 이전 CAMERA basic/clear/fade/fov/entity/target 등 대표 실게임 PASS 유지. CAMERA 모든 preset/특수 spline 전체 PASS는 아님.
- 공식 Animation ID **536개**, Animation Controller ID **179개**. Mojang `bedrock-samples` Vanilla RP 참고; owner grouping은 `client_entity`의 참조 관계 기반; Event처럼 엔티티별 소제목과 Direct Input 지원.
- `ANIMATION`과 `ANIMATION CONTROLLER`는 별도 Toolbox 카테고리이며 호환 Legacy Reporter는 숨겨 유지. 분류만으로 모든 Education 버전의 animation 실행 보장 없음.

## E. 아직 남은 확인 / 금지된 과잉 판정
- PLAYANIMATION `controller` 명칭 충돌·여러 동시 애니메이션의 내부 우선순위, `next_state` 모든 상태 문자열, Molang `query.state_time` 정확한 경과시간, sniffer `search` 정확한 2초 주기.
- CAMERA 특수/고급 전체 구문, Registry 80 Fog/536 Animation/179 Controller의 전수 호환성, Bedrock 다른 버전 교차 테스트.
- 실제 `functions/*.mcfunction` Behavior Pack 내보내기·설치·실행 및 `.mcfunction → AST → Blocks → .mcfunction` Round-trip은 **전적으로 별도 구현/검증 단계**.

## F. 증거 파일 참고
- 원본 영상은 사용자 대화에 첨부되어 있으며, 이 문서 ZIP에는 용량 때문에 동봉하지 않는다. 아래 INDEX에 파일명/크기/체크섬을 기록한다.
- 추가 비교 스틸: `evidence/screenshots/b4_armor_stop_blend.jpg`, `b4_sniffer_baby_dig.jpg`, `b4_next_state_key_stages.jpg`, `b4_controller_stages.jpg`.
