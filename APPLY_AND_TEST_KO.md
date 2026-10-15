# 0.0.49 FunctionFile 함수명별 오류 안내 패치

## 목적
`cbi_diag`을 입력하지 않아도, 정의 단계에서 ERROR가 발견된 `FunctionFile.define("foo", ...)`를 채팅에서 `foo`라고 입력하면 정확한 오류 코드/메시지를 출력합니다.

- 정상 함수: 기존대로 실제 실행
- ERROR 함수: **명령 실행 차단 유지**, 동일한 채팅 이름은 **진단 전용**으로 등록
- WARNING/INFO만 있는 함수: 기존처럼 실행 가능
- `cbi_diag`: 전체 원장 조회 도구로 유지
- `cbi_rules`: 정상적인 GAMERULE LIST 정의가 있을 때만 등록
- 내부 FunctionFile/tick 경유 오류: 기존 1회 출력 제한 유지
- `.mcfunction` Compiler, AST, Registry, Selector/HASITEM/SCORES, CAMERA, TIME QUERY 미수정

## 버전과 적용 경로
기준: 사용자가 제공한 `command_block_coding(20261014-062303).zip`의 **0.0.49**. 2026-10-15 CAMERA+TIME QUERY 통합 패치 파일 목록과 비교하여 두 수정 대상과 겹치지 않는 것을 확인했습니다.

패치 ZIP은 프로젝트 루트(`pxt.json`이 있는 위치)에 압축 해제합니다. **아래 두 파일만 덮어씁니다.**

- `function_file.ts`
- `src/preview/diagnostic_store.ts`

`pxt.json`은 수정하지 않습니다. 적용 전 위 두 파일을 백업하세요.

## 사용자 환경 테스트
기존 CAMERA + TIME QUERY 통합 테스트용 `main.ts` 코드를 그대로 사용할 수 있습니다.

1. MakeCode에서 오류 0건으로 컴파일되는지, JavaScript → Blocks 변환이 되는지 확인
2. 게임에서 `cam49_bad_id`를 슬래시 없이 실행
3. `[Preview] mcfunction cam49_bad_id: execution blocked...` 다음 줄에 `CAMERA_PRESET_ID_INVALID`와 상세 메시지가 표시되는지 확인
4. 동일한 `cam49_bad_id`를 다시 입력해도 원인이 재출력되는지 확인
5. 정상 함수인 `cam49_third`를 실행해 3인칭 후방 카메라가 적용되는지 확인; 이후 `cam49_clear`로 초기화
6. `cbi_diag`를 입력해 전체 오류가 계속 표시되는지 확인

예상 화면 (정확한 영어 메시지는 Validator 구현값에 따름):

```text
<nl15> cam49_bad_id
[Preview] mcfunction cam49_bad_id: execution blocked; 1 error(s), 0 warning(s), 0 info.
[Preview] ERROR CAMERA_PRESET_ID_INVALID DEFINITION: CAMERA preset must be one safe lowercase namespaced ID ...
```

**주의:** `[Preview]`는 출력 포맷 예시이며, 실제 코드는 기존 `MCFunctionPreview.previewSay()` → `tellraw` 출력을 재사용합니다.

예외: 예약된 `cbi_diag` / `cbi_rules`를 함수 이름으로 정의하면 예약 이름 자체에는 새로운 핸들러를 등록할 수 없으며, 기존 `cbi_diag`에서 오류를 확인합니다.

## 검증 경계
- 로컬 TS 컴파일(대체 MakeCode API 선언 사용): PASS
- 모의 채팅 등록, 오류 출력, 오류 시 실행 차단, 정상 실행, 중복 등록, 예약어, 내부 호출 오류 반복 제한: **14/14 PASS**
- Minecraft MakeCode/PXT 빌드: 미실행
- Minecraft Education 26.32 실제 채팅 실행: 미실행
- Behavior Pack `.mcfunction` 실행/왕복: 미실행

버전 번호를 임의로 변경하지 않았습니다.
