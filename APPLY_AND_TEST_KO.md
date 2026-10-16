# 0.0.62 실제 진단 캐시 `for` 검색·출력 분리 검사

## 범위 및 원칙
- 기반: `command_block_coding(20261016-083348).zip`, `pxt.json.version = 0.0.62`
- **오직** `src/preview/diagnostic_store.ts`에 세 개의 임시 `probe*` 조회 함수를 추가했습니다.
- 원래 `?` / `cbi_diag` / `함수명?` 코드·채팅 등록·캐시 갱신·출력 어댑터·AST·Compiler·Validator는 변경하지 않았습니다.
- `pxt.json`을 바꾸지 않습니다. 기존 `pxt.json.files`에 `src/preview/diagnostic_store.ts`가 이미 등록되어 있습니다.
- 프로브는 모두 저장된 진단 데이터를 **읽기만** 합니다. 원본 진단 및 `.mcfunction` 생성에는 영향을 주지 않습니다.

## 적용
1. 현재 소스 **전체를 백업**합니다.
2. ZIP의 `src/preview/diagnostic_store.ts` **1개만** 저장소 같은 위치에 덮어씁니다.
3. MakeCode가 수정된 GitHub Extension을 읽도록, 별도 테스트 릴리스를 발행하고 새 버전이 로드됐는지 확인합니다. 본 패치에서 `pxt.json.version`은 변경하지 않았습니다.
4. 지금 실험에 쓰는 `main.ts`에 `MAIN_TS_APPEND_REAL_CACHE_PROBES.ts`의 코드를 **기존 함수 정의 끝부분에 추가**합니다. 이미 같은 이름으로 이벤트를 등록한 코드는 중복시키지 않습니다.
5. 기존 테스트의 `diag52_warn` 함수 정의가 있어야 합니다. 없다면 `cacheinit`이 `CACHE INDEX -1`을 표시하며, 이 경우 실험이 성립하지 않습니다.

## 테스트 (MakeCode를 시작하고 초기 Preview 출력이 끝난 뒤)
```
cacheinit
cachefind
cachewalk
cacheemit
cachefull
diag52_warn?
cachefind
cacheemit
```
- `cacheinit`은 실제 진단 캐시의 함수 인덱스를 한 번 찾아 변수에 저장합니다.
- `cachefind`: 실제 `cachedDetailNames`의 `for` 검색만 실행, `FIND N` 한 줄만 출력.
- `cachewalk`: 실제 `cachedDetailLines[N]`의 문자열 길이를 `for`로 합산, `WALK CHARS N` 한 줄 출력. 상세 메시지 출력은 없습니다.
- `cacheemit`: 검색 없이 미리 기억한 인덱스로 실제 상세 문구를 **기존 출력 어댑터 그대로** 출력.
- `cachefull`: 원래 `showFunctionDetailsOnly`로 검색 + 출력, 단 `main.ts`에서 직접 등록한 이벤트.
- `diag52_warn?`: Extension 내부에서 등록한 원래 이벤트까지 포함한 전체 경로.

가능하면 각각 명령 **전송 직후부터 응답까지 녹화**하고, 답변을 확인한 뒤 다음 명령을 입력합니다. 반복 호출 시 지연이 누적되는지도 비교합니다. 느리거나 무응답이면 다른 명령으로 연달아 밀어넣기보다 10초 정도의 무응답 여부도 별도로 기록합니다.

## 결과 판정
- `cachefind`만 지연: 실제 함수명 배열 검색 또는 이벤트 실행 경로를 추가 조사.
- `cachefind` 빠름, `cachewalk`만 지연: 실제 캐시 문자열 순회/접근 조사.
- 둘 다 빠름, `cacheemit` 지연: 출력 어댑터/메시지 처리 쪽이 유력.
- `cacheemit`은 빠름, `cachefull` 지연: 이름 검색과 출력 결합의 영향, 간헐성 또는 스케줄링 조사.
- `cachefull` 빠름, `diag52_warn?`만 지연: 등록 시점·이벤트 스케줄링 등 진입 경로 조사.
- 결과마다 빠르기/느리기가 바뀜: 런타임의 간헐적 상태·출력 지연 가능성 조사.

**중요:** 게임에서 보이는 채팅 응답 시간은 내부 `for` 처리 시간 자체를 직접 측정하는 것이 아닙니다. 모든 결론은 반복 측정 후 내려야 합니다. 현재는 실게임 검증 전이며 `Runtime PASS`가 아닙니다.

## 정리
원인이 규명되면 추가한 세 `probe*` 함수를 제거하십시오. 이 테스트 API는 장기 공개 기능이 아닙니다.
