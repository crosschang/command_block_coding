# 0.0.68 `?` (optional page) 실게임 수정 패치 — 2026-10-19

## 발생한 현상 / 근거
- Minecraft Education: `?` → **'인수 1개 필요, 0개 입력'** 오류.
- `? 1`, `? 2`, `? 3`, `page_a?`는 실게임 정상.
- 원인: `player.onChat("?", function (page: number) { ... })`는 인수 1개를 필수로 검사합니다. 생략 시 0이 넘어온다는 기존 가정이 틀렸습니다.

## 적용
1. 현재 정상 사용 중인 소스와 `main.ts` 백업.
2. 이 패치 ZIP의 `src/preview/diagnostic_store.ts`만 기존 프로젝트의 동일 경로에 덮어쓰기.
3. 다른 채팅에서 진행하는 CAMERA 파일 / AST / Compiler / Registry / 기존 main.ts / pxt.json은 건드리지 않음.
4. GitHub에 변경 사항 반영 후 새로운 테스트 릴리스 → MakeCode Extension 새로고침.

## 수정 내용
- `player.onChat`의 필수 숫자 인수 등록을 제거.
- 내부 JavaScript API인 `player.onChatCommandCore("?", ...)`로 이벤트 등록하고 `player.getChatArgs("?")`를 통해 실제 인수 확인.
- 인수 없음 → `showAll()` (기존 `?` 복구).
- 숫자 페이지 한 개 → `showPage(N)`; 범위 밖/잘못된 인수 → 기존 오류 메시지.
- 페이지 캐시, DiagnosticRecord, 빠른 Preview JSON escape, ERROR/WARNING/INFO, 함수명? 조회는 변경하지 않음.
- `pxt.json.version` 0.0.68 유지.

## 중요 — 검증 단계
`onChatCommandCore`/`getChatArgs`는 MakeCode Minecraft의 JavaScript용 하위 API로 참조되지만,
이 변경을 **실제 Minecraft Education에서 실행해 본 결과는 아직 없습니다.**
따라서 통합 성공으로 간주하지 말고 새 릴리스에서 먼저 PXT 컴파일과 런타임을 검증하세요.

```text
?          → 1페이지 (필수 복구)
? 1        → 1페이지
? 2        → 2페이지
? 3        → 3페이지
? 0        → 잘못된 페이지
? 4        → 잘못된 페이지 (3페이지 프로젝트인 경우)
page_a?    → 개별 진단
?
```

### 실패 시
만약 `onChatCommandCore` 또는 `getChatArgs`가 현재 MakeCode 빌드에서 인식되지 않거나 페이지 조회가 동작하지 않는다면 이 패치만 되돌리세요.
안정적인 임시 복구는 `player.onChat("?", function () { showAll(); })`와 별도의 페이지 명령을 쓰는 것이지만,
그 경우 `? 2` 지원은 별도 방식 검증이 필요합니다.
