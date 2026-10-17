> **보관된 과거 버전 안내**: 아래 명령 및 동작은 해당 당시 패치 설명입니다. 현재 0.0.65에서는 과거 진단 별칭이 제거되었습니다. 최신 사용법은 `docs/DIAGNOSTIC_LEGACY_ALIAS_REMOVAL_0.0.65_2026-10-17.md`를 참조하세요.

# 0.0.60 진단 표시 문자열 사전 캐시 실험 패치

## 기준 버전 및 적용 전제

- 기준 프로젝트: `command_block_coding(20261016-045742).zip` (`pxt.json.version`: **0.0.60**)
- 기준 ZIP SHA-256: `13abdad0d766f5242591a2d2886405effb09c150a3b92f2d35e03f4103847375`
- **먼저** `PATCH_0.0.60_COMPACT_DIAGNOSTICS_2026-10-16.zip`이 적용된 상태여야 함 (`function_file.ts`의 `cbi_page` 예약 및 `함수명?` 등록 포함).
- 이 ZIP은 전체 저장소가 아닌 **교체 파일 1개**와 안내서만 포함합니다.

## 변경 파일

`src/preview/diagnostic_store.ts` 하나만 교체합니다. `pxt.json` / `main.ts` / `test.ts` / `function_file.ts` / AST / Parser / Compiler / Validator / Registry는 수정하지 않습니다.

## 무엇을 바꾸었는가?

### 기존 방식

1. 함수 정의 시 `records[]`에 진단 레코드 저장.
2. `?` / `cbi_diag` / `cbi_page N` 호출마다 레코드 개수를 세고 함수별 심각도를 계산해 문자열 구성.
3. `함수명?` 호출마다 해당 함수의 레코드를 순회해 오류 메시지 조립.

### 캐시 방식 (이번 패치)

1. `replaceDefinitionIssues(functionName, issues)` 또는 `add(...)`로 기록이 변경될 때에만, 영향받은 함수의 상세 표시 문자열(`cachedDetailLines[]`)을 갱신합니다.
2. 같은 시점에 요약 페이지 문자열(`cachedPageTexts[]`)을 다시 준비합니다.
3. `?` / `cbi_diag` / `cbi_page N`는 **저장된 문자열**을 읽어 기존 출력 어댑터로 전달합니다.
4. `함수명?`도 준비된 상세 메시지 묶음을 읽습니다.
5. 함수의 정의를 수정하거나 같은 함수를 재정의하면 캐시를 교체합니다. `add()`에서 중복 레코드가 무시되면 기존 캐시를 그대로 사용합니다.

**원본 레코드가 Source of Truth**이며 캐시는 Preview UI 파생 데이터입니다. `.mcfunction` 결과에 섞이지 않습니다. WARNING/INFO 실행 허용 및 ERROR 차단은 그대로입니다. 원본 메시지·오류 코드를 삭제하거나 번역하지 않습니다.

향후 다국어 모드를 제공할 때에는 언어가 변경되면 이 표시 캐시도 다시 구성해야 합니다. 본 패치는 언어 전환 기능을 추가하지 않습니다.

## 적용 및 테스트

1. 현재 소스(특히 `src/preview/diagnostic_store.ts`)를 백업합니다.
2. 패치 ZIP 내부의 `src/preview/diagnostic_store.ts`를 GitHub 저장소의 동일 경로에 덮어씁니다.
3. GitHub에 커밋하고 MakeCode에서 갱신된 Extension을 사용하도록 **새 테스트 릴리스/태그**를 발행합니다. 버전 번호 변경 여부는 직접 결정합니다. 이 패치는 `pxt.json.version`을 변경하지 않습니다.
4. 지금 사용 중인 `diag52_error`, `diag52_warn`, `diag52_info` 진단 테스트 `main.ts`는 변경하지 않아도 됩니다. MakeCode ↔ Blocks 컴파일도 확인합니다.
5. 동일 월드·동일한 테스트를 사용하여, 다음 명령을 **먼저 하나씩**, 이어서 **빠르게 연속으로** 실행하여 영상/시간을 비교합니다.

```
?
diag52_warn?
diag52_info?
?
cbi_diag
diagping
```

6. 첫 실행부터 느린지, 여러 번 조회 후 느려지는지, 이전에 입력한 채팅이 한꺼번에 출력되는지를 기록합니다.
7. 성능이 변하지 않거나 악화되면 이 파일만 백업 원본(이전 컴팩트 패치)으로 복원하고 테스트 릴리스를 다시 만들면 됩니다.

## 로컬 검증과 한계

- ES5 TypeScript 정적 검사: 통과(일반 `tsc`, **MakeCode PXT 자체 빌드 아님**).
- 기존 컴팩트 진단 회귀 테스트 23개: 통과.
- 캐시 무효화 추가 검사(재정의·삭제·런타임 이슈 추가·중복·다중 출처 보존): 통과.
- `?` 대표 사례 출력 호출 횟수: 기존 컴팩트 패치와 동일하게 1회. 이번 변경은 **문자열 생성 시점을 옮긴 것**이지, Minecraft의 채팅 시스템을 변경한 것이 아닙니다.
- Education 실게임의 반복 채팅 지연 문제가 이 패치로 해결되는지는 **미검증**입니다. 과거에는 `diagtrace`가 즉시 완료돼도 `cbi_diag` 뒤의 채팅이 지연되는 경우가 있었습니다. 캐시가 이 현상을 해결한다고 약속할 수 없습니다.
