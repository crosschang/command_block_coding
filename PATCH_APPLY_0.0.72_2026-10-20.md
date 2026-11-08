# command_block_coding — A8 + Preview INFO + B3/C1 통합 패치

- 기준 플러그인 버전: **0.0.72 (변경 없음)**
- 내용: 2026-10-19 A8 SPAWNPOINT/CLEARSPAWNPOINT/SETWORLDSPAWN 및
  공통 플레이어 이름 입력 변경 **포함**, 2026-10-20 Preview INFO 통합 변경,
  B3 `damage`/`event`, C1 `controlscheme`/`aimassist` 구현 **모두 포함**
- Git commit/push/tag/release 작업 **하지 않음** — 사용자가 직접 수행

## 적용

1. 현재 `command_block_coding` 저장소를 백업합니다.
2. 이 ZIP의 파일들을 **저장소 최상위 폴더**에 경로 유지하여 덮어씁니다.
   이전 A8 패치를 따로 다시 적용할 필요는 없습니다. 이미 적용했더라도
   소스가 수정된 부분은 덮어쓰기 전에 비교해 주세요.
3. ZIP에는 기존 `main.ts`, `test.ts` 교체본이 없습니다.
4. `tests/PREVIEW_COMPAT_DIAGNOSTICS_0.0.72_MAIN.ts`는 **테스트 전용**입니다.
   시험할 때만 임시로 MakeCode `main.ts`에 복사하고 원본을 복구합니다.
5. 사용자 환경에서 MakeCode JS↔Blocks 컴파일 및 Minecraft Education
   실제 프리뷰 안내 출력은 별도로 확인해야 합니다.
6. 신규 명령 테스트는 `tests/B3_C1_0.0.72_PUBLIC_API_MAIN.ts`를 동일하게
   임시 `main.ts`로 활용하세요. `pxt.json`에는 추가하지 않습니다.
   실게임에서 효과가 있는 명령이므로 복제한 테스트 월드를 사용합니다.

## 새 진단

- SPAWNPOINT: FunctionFile 정의 INFO, 실행 시 WARNING 한 세션 한 번
- TAG LIST: 세션에서 알려진 태그 이름 기준 `INFO [SESSION_KNOWN]`
- GAMERULE QUERY: 세션 기록 또는 조회 불가 안내
- GAMERULE LIST: 실제 월드 설정값이 아닌 Registry 정보 `INFO [PARTIAL]`
- GAMERULE playerwaypoints: 알려진 MakeCode 경로 실패 `WARNING`
- `QueryConfidence` 4단계 유지, AST/Compiler/Registry 문법 변경 없음
- CLEARSPAWNPOINT/SETWORLDSPAWN은 이번 SPAWNPOINT 제한을 일반화하지 않음

세부 근거/실게임 점검 절차:
`docs/PREVIEW_COMPATIBILITY_INFO_0.0.72_2026-10-20.md`

## B3 + C1 신규 명령어

- `damage`: 대상/피해량/원인(36종)/가해자, 가해자 지정형은 Education 문법
  충돌 때문에 INFO로 실게임 확인 요청
- `event`: 엔티티 이벤트 실행, 기존 이벤트 라이브러리 및 Owner Registry 재사용
- `controlscheme`: set(5종) / clear, 현재 카메라 프리셋과의 적합성 INFO.
  테스트 fixture에서 `minecraft:free` 카메라 설정 → `player_relative` 또는
  `camera_relative` 설정 → 조작 비교 → `controlscheme`/`camera` 동시 복구
- `aimassist`: set(기본/각도·거리·모드/프리셋 단독) / clear, 각도·거리 범위 검증
- 4개 명령 모두 AST, Adapter, Validator, Compiler, MakeCode API/블록 연결
- 공식 문법, 미검증 경로 및 안전한 게임 테스트 절차:
  `docs/B3_C1_DAMAGE_EVENT_CONTROLSCHEME_AIMASSIST_0.0.72_2026-10-20.md`

## 로컬 검사 결과

- TypeScript 프로젝트 검사: PASS (`tsconfig.a8check.json` 사용)
- 신규 `PREVIEW_COMPAT_DIAGNOSTICS_REGRESSION.cjs`: PASS
- SPAWNPOINT/선택자/CAMERA 회귀 테스트: PASS
- 신규 `B3_C1_STRUCTURED_COMMANDS_REGRESSION.cjs`: PASS
- C1 CAMERA/CONTROLSCHEME 연동 fixture 3종: 정적 명령 순서/등록 시 미실행 검사 PASS
- 구형 `tests/dev/diagnostic_store_runtime_mock.cjs` 및
  `tests/dev/removed_alias_runtime_mock.cjs`: 이전에 제거된 `cbi_page`
  이름을 기대하여 **FAIL**. 이번 코드 변경과 무관한 테스트 기대값 차이이며
  삭제하거나 임의 수정하지 않았음.
- A8/Preview INFO는 2026-10-20 Minecraft Education 26.32 실게임에서
  등록/진단/조회 대표 경로 PASS (상세 표는 Preview 문서의 Addendum 참조)
- 신규 B3/C1 네 명령은 **아직 인게임 테스트하지 않았음**

중요: `player.execute()` 또는 `mobs.execute()`의 `true`는
SPAWNPOINT 실제 적용을 증명하지 않습니다. 직접 채팅은 PASS였으나
실제 Behavior Pack `.mcfunction` 실행 여부는 여전히 미검증입니다.
