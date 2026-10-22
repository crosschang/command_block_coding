# FOG ID 환경 그룹 — 현재 상태 2026-10-22

과거 `docs/B4_FOG_ENVIRONMENT_GROUPS_0.0.76.md`의 `Mixed` 55개 분류는 **1차 패치 시점의 역사적 기록**이며 현재 Toolbox와 다르다. 현재 `src/libraries/fog_library.generated.ts`의 그룹은 다음 다섯 가지이다.

| 그룹 | 개수 |
|---|---:|
| Air + Water | 42 |
| Water Only | 24 |
| Air + Water + Weather | 7 |
| Lava Included | 6 |
| Powder Snow | 1 |

직접 입력 별도, 총 FOG ID 80개. 각각 유일한 reporter/blockId를 유지. 수집된 JSON의 media 조건을 분류한 것이지 Minecraft Education 지원 전수 확인이 아니다. 사용자 MakeCode 소제목 UI 정상 확인. 테스트 `tests/B4_FOG_ENVIRONMENT_GROUPS_TEST.cjs`에 5개 test() 존재. 과거 문서는 삭제하지 않는다.
