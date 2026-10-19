# 0.0.68 진단 페이지 채팅 명령 통일: `?`, `?1`, `?2`, `?10`...

## 기준/안전

- 기준: `command_block_coding_0.0.68_PREVIEW_PAGES_OPTIONAL_FIXED_2026-10-19.zip` (기존 Preview JSON 최적화 포함)
- 버전: `pxt.json.version = 0.0.68` **변경 없음**
- 수정: `src/preview/diagnostic_store.ts`, `function_file.ts` **2개만**
- 기존 CAMERA, AST, Compiler, Validator, TAG, GAMERULE, 빠른 Preview JSON escape 변경 없음
- 로컬 테스트 통과와 Minecraft Education 실게임 검증은 별개입니다.

## 사용 방식

- `?`: 1페이지, 인수 없음
- `?1`: 1페이지, 인수 없음
- `?2`: 2페이지, 인수 없음
- `?10`, `?11` 등: 10/11페이지, **해당 페이지가 존재하는 경우 자동 등록**
- `함수명?`: 개별 함수 상세 진단
- `? 2`, `cbi_page 2`: 더 이상 페이지 명령이 아닙니다.
- `cbi_page`: 일반 사용자 함수명으로 재사용 가능

동작: 진단 캐시 재생성 후 실제 존재하는 페이지의 `?N` 명령을 한 번만 등록합니다. 페이지 수가 줄어도 이미 등록된 `?N`은 남으며, 존재하지 않는 페이지로 접근 시 안내를 출력합니다. 아직 등록되지 않은 **미래 페이지**에 대한 `?N`은 MakeCode에서 인식되지 않을 수 있습니다. 페이지가 수백 개 이상이면 채팅 이벤트 등록 비용과 플랫폼 한계를 검증해야 합니다.

## 적용

1. GitHub 작업 트리/릴리스 백업. 다른 채팅에서 CAMERA 작업 중이면 최신 Git 상태를 우선.
2. 패치 ZIP 안의 실제 소스 파일 `src/preview/diagnostic_store.ts`, `function_file.ts` **두 개만** 복사. 전체 ZIP으로 작업 트리를 일괄 덮어쓰지 마세요.
3. MakeCode에서 새 테스트 릴리스를 인식하도록 배포. 기존 버전 표기 `0.0.68` 유지.
4. `tests/QUESTION_NO_SPACE_0.0.68_MAIN.ts`를 임시 `main.ts`로 교체해 검증. 테스트 이후 본래 `main.ts` 복구. `test.ts`, `pxt.json` 수정 없음.

## Education 테스트

다음 순서로 실행:

```
?
?1
?2
?3
?10
?11
?9
question_smoke?
cbi_page
?
```

기대:
- 총 11페이지: `?`/`?1`은 1/11, `?10`은 10/11, `?11`은 11/11
- 페이지 안내 `Next: ?2`, `Next: ?11` 형태로 공백 없이 표시
- 물음표 뒤 숫자 **인수 오류 없음**
- `question_smoke?`는 진단 조회이며 함수는 실행하지 않음
- `cbi_page`는 `USER_CBI_PAGE_OK`를 실행
- 연속 조회 중 지연 누적 여부 확인

주의: `?12`는 해당 페이지가 생성되지 않았으므로 이벤트가 등록되지 않습니다. `? 2`는 예전처럼 숫자 인수를 받아 처리하지 않습니다.

## 검증 범위

- 로컬 ES5 transpilation, 이벤트 등록/중복 방지 및 페이지 1·2·3·10·11 조회 모의 검사
- 실제 PXT 빌드 및 Minecraft Education 런타임 PASS는 **사용자 재검증 전**
