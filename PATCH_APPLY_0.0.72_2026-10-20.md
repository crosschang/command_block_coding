# command_block_coding — A8 + Preview INFO 통합 패치

- 기준 플러그인 버전: **0.0.72 (변경 없음)**
- 내용: 2026-10-19 A8 SPAWNPOINT/CLEARSPAWNPOINT/SETWORLDSPAWN 및
  공통 플레이어 이름 입력 변경 **포함**, 2026-10-20 Preview INFO 통합 변경 포함
- Git commit/push/tag/release 작업 **하지 않음** — 사용자가 직접 수행

## 적용

1. 현재 `command_block_coding` 저장소를 백업합니다.
2. 이 ZIP의 파일들을 **저장소 최상위 폴더**에 경로 유지하여 덮어씁니다.
   이전 A8 패치를 따로 다시 적용할 필요는 없습니다.
3. ZIP에는 기존 `main.ts`, `test.ts` 교체본이 없습니다.
4. `tests/PREVIEW_COMPAT_DIAGNOSTICS_0.0.72_MAIN.ts`는 **테스트 전용**입니다.
   시험할 때만 임시로 MakeCode `main.ts`에 복사하고 원본을 복구합니다.
5. 사용자 환경에서 MakeCode JS↔Blocks 컴파일 및 Minecraft Education
   실제 프리뷰 안내 출력은 별도로 확인해야 합니다.

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

## 로컬 검사 결과

- TypeScript 프로젝트 검사: PASS (`tsconfig.a8check.json` 사용)
- 신규 `PREVIEW_COMPAT_DIAGNOSTICS_REGRESSION.cjs`: PASS
- SPAWNPOINT/선택자/CAMERA 회귀 테스트: PASS
- 구형 `tests/dev/diagnostic_store_runtime_mock.cjs` 및
  `tests/dev/removed_alias_runtime_mock.cjs`: 이전에 제거된 `cbi_page`
  이름을 기대하여 **FAIL**. 이번 코드 변경과 무관한 테스트 기대값 차이이며
  삭제하거나 임의 수정하지 않았음.
- 실제 Minecraft Education에서 **이번 변경 버전**의 안내 출력 확인: PENDING

중요: `player.execute()` 또는 `mobs.execute()`의 `true`는
SPAWNPOINT 실제 적용을 증명하지 않습니다. 직접 채팅은 PASS였으나
실제 Behavior Pack `.mcfunction` 실행 여부는 여전히 미검증입니다.
