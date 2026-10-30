# command_block_coding — P0 증거 기준선 + P1a Dispatcher 첫 구현

- 작성: 2026-10-31
- GitHub: `crosschang/command_block_coding`, `master`, 확인된 HEAD `fa9884e6abc32bd7501e99f30c908088b65ec845`, PXT `0.0.93`
- **로컬 검토 패치이며 아직 GitHub/실게임에 적용하지 않았습니다.**
- 기준 문서: `붙여넣은 텍스트(1).txt`와 `CBX_HYBRID_RUNTIME_DEVELOPMENT_PLAN_V2_2026-10-30.md`

## P0 — 증거 보존

- `docs/P0_EVIDENCE_BASELINE.csv`: Education 26.32의 2026-10-07 원본 호환성 표 120개 명령 변형 기록을 원래 상태명 그대로 이관. 이 표의 `DIRECT`는 당시 시험한 형태의 PASS이며 현재 0.0.93 전체 범위의 PASS가 아닙니다.
- `docs/P0_CBXSCHED_GAME_EVIDENCE.csv`: 10월 29~30일 CBX 자료 23행 원본 그대로 보존. 특히 `tick.json` 독립 실험 `NOT TESTED`, Round-trip `NOT COMPLETED` 유지.
- `docs/P0_SEED_V2.csv`: 개정 계획에서 뽑은 초기 우선순위 17행. 이것은 **제안 경로**이지 게임 검증 결과를 대체하지 않습니다.

## P1a — 이번에 실제로 작성한 코드

`CBX_P1A_DISPATCHER_UNAPPLIED_0_0_93.patch`

변경 예정:

1. `src/preview/runtime_dispatcher.ts` 추가: 기존 브리지 설정만 참조하는 공통 `MCFunctionRuntime.resolve()` 도입. **AUTO가 아닙니다.**
2. `custom.ts`: 일반 명령의 브리지 분기를 공통 Resolver 경유로 변경.
3. `src/blocks/c3_execute_blocks.ts`: 기존 C3 EXECUTE 자체 Preview와 활성 브리지 간 연결. **P1a에서 유일하게 기존 브리지 ON 시 실행 경로가 달라지는 주요 부분**입니다. OFF는 이전 C3 그대로 유지.
4. `src/preview/summon_preview.ts`: 기존 SUMMON 직접/보완 실행을 Resolver로 연결. OFF에서는 검증된 회전/Facing 에뮬레이션 유지.
5. `src/blocks/runtime_bridge_blocks.ts` 추가: Preview 전용 브리지 선택 블록. 선택지는 Original OFF, CBX12 HEX, CBXCORE HEX, CBXCORE SELECTIVE. 동작은 기존 브리지 활성화 함수를 호출할 뿐입니다.
6. `function_file.ts`: 브리지 설정 블록의 `FunctionFile` / `tick.json` 내부 사용 방지. **기존 등록·호출·틱 Worker 실행 코드는 변경하지 않았습니다.**
7. `pxt.json`: 새 TS 파일 둘을 `files`에 추가. 버전 변경 없음.

**P1a는 임시 중간 단계입니다.** 모든 명령을 상황별로 AUTO 선택하지 않으며, 브리지 ON인 상태에서 기존 프로젝트와 마찬가지로 명령 대부분이 브리지로 갑니다. FunctionFile 전체 단위 실행 전략·결과 역송신·tick 행동팩 스케줄러는 아직 구현되지 않았습니다.

## 검증 수행 범위

- GitHub 연결을 통해 원본의 파일 존재와 SHA 확인, 위 수정 예정 라인의 원본 코드 대조.
- `git apply --check`: **원본 변경 부분을 복원한 context fixture에서만** PASS. *실제 GitHub 0.0.93 전체 체크아웃에서 수행한 것은 아닙니다.*
- `tsc --target ES5` 로 신규 TypeScript 코드 + 모의 호스트를 컴파일: PASS.
- Node 모의 테스트: 브리지 OFF/CBX12/CBXCORE/SELECTIVE 모드 분기와 설정 가드 PASS.
- 정적 패치 검사: 기존 C3 구문 검증/캡처 훼손 없음, new Worker/pause 없음: PASS.
- **미실시:** `pxt` 프로젝트 전체 컴파일, 실제 Minecraft Education 기능 테스트, 행동팩 브리지 실게임 테스트, 실제 Git checkout 적용 검사, 작업자 지연 재측정.

## 적용 전 주의

- **이전에 제공한 `CBX_0.0.93_TICK_BRIDGE_BLOCKS_INTEGRATED_UNAPPLIED_2026-10-30.zip`의 브리지 패치를 함께 적용하지 마세요.** `runtime_bridge_blocks.ts` 등이 서로 중복됩니다.
- 본 패치는 **tick.json serializer가 없습니다.** 이전 tick 전용 패치는 나중에 최신 통합본에서 병합 검사해야 합니다.
- 실제 로컬 저장소가 깨끗하고 HEAD가 같은지 확인한 후, `git apply --check`와 PXT 컴파일을 먼저 해야 합니다. 이 파일을 **검증 없이 즉시 배포하지 마세요.**
- 브리지 선택 블록은 다른 명령과 FunctionFile을 실행하기 전에 최상위에서 초기화해야 합니다. 실제 블록 UI 초기화 순서/동작은 아직 검증하지 않았습니다.
- 브리지 설치 유무를 동적으로 검증하는 핸드셰이크는 이번 패치 범위 밖입니다. 선택했다고 명령 실행이 성공하는 것은 아닙니다.

## 이어서 할 일 (P1b 이후)

1. **증거 기반 AUTO Resolver**: `DIRECT`, `EMULATED`, `OUTPUT_HIDDEN`, `FUNCTION_BRIDGE` 및 상세 구문 구분. `playerwaypoints` 같은 브리지 실패 사례를 보호.
2. **P2 Query/LIST**: 독립 `/list`와 tag/scoreboard/gamerule 조회. `BP 실행`, `BP 채팅 조회`, `PXT 변수 수신`을 별도 수락 기준으로 둠.
3. **P3 FunctionFile**: 명령열 AST 수집·함수 전체 등록 및 완료 순서/실행 문맥 보장.
4. **P4 tick.json**: 기존 tick 블록 보존, 행동팩 주도 반복 스케줄러 개발. MakeCode Worker 예열 원인 연구는 보류.
5. **P5–P6 파일 Export/Import**: 실제 `functions/*.mcfunction`, `functions/tick.json`, 프로젝트 편집 데이터 분리 및 Round-trip 테스트.

GitHub 커밋/푸시, PXT 버전 증가, 행동팩 수정은 하지 않았습니다.
