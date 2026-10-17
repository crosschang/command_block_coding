# 0.0.62: 진단 출력 문자 검사 최소 수정안 (2026-10-17)

## 변경 대상
`src/preview/diagnostic_store.ts` 파일 하나만 교체하세요. 이 파일은 이전에 배포한 **0.0.62 REAL CACHE LOOP PROBES** 버전을 기준으로 만들었습니다. 기존 probe API도 보존했습니다.

## 변경 내용
`needsLiteralOutput(line)`의 1글자씩 `charAt()` + 7조건 검사 루프를 7개의 `String.indexOf()` 검색으로 교체했습니다. 검사 대상 7문자 `@ [ ] { } " \`는 변경하지 않았습니다. `player.say()`/`previewSay()` 분기, 100/145 글자 분할 정책, 캐시/레코드, 함수명 조회, `?`, `cbi_diag`, 검사 API 및 모든 AST/Compiler 코드는 그대로입니다.

Microsoft Minecraft MakeCode 공식 지원: https://minecraft.makecode.com/reference/text/index-of

## 주의
- `pxt.json.version`은 변경하지 않았습니다. MakeCode에 패치를 배포하려면 사용자 환경의 GitHub 태그/릴리스 흐름에 따라 새 버전을 게시해야 합니다. 버전 값은 사용자가 결정합니다.
- 이 파일은 PXT 컴파일 및 Minecraft Education 런타임 미검증 상태입니다. 로컬에서 기존 문자 검사와 결과가 같음을 1,000개 이상의 문자열로 검사했습니다.
- 정확한 속도 향상은 실게임에서만 판정할 수 있습니다. 특수문자 보존 검사는 별도로 수행하세요.

## 실게임 테스트
기존 테스트 `main.ts`를 사용해 다음 순서로 **응답이 나올 때까지 기다리며** 확인합니다.
1. `?`
2. `diag52_warn?`
3. `diag52_info?`
4. `?`
5. `diagping` (main.ts에서 해당 명령이 등록된 경우에만)

이전 `cmp7` 테스트는 실행할 필요가 없습니다. 출력 지연·무응답이 계속되면 MakeCode를 중지/재시작하고, 응답 시간을 기록하세요. 지연 원인 전체가 문자 검사라고 확정한 것은 아닙니다.
