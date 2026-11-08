# Preview Query Adapter + TAG list — 2026-10-08

## 목적

`player.execute()`에서 실제 명령은 동작하지만 결과 문자열이 화면에 노출되지 않는 OUTPUT_HIDDEN 계열을 공통 Preview 계층으로 처리하기 위한 첫 구현이다.

이번 단계의 첫 적용 대상은 `TAG list`다.

## 원칙

- AST / Compiler는 실제 Minecraft 문법을 유지한다.
- `.mcfunction` export는 계속 `tag <target> list`를 출력한다.
- Preview 전용 출력이나 임시 tag는 export하지 않는다.
- Minecraft 실제 상태를 JavaScript가 Source of Truth처럼 대체하지 않는다.
- 현재 Preview 세션에서 커스텀 TAG add/remove 블록이 참조한 tag 이름을 `known tag vocabulary`로 추적한다.
- 실제 대상 선택과 실제 tag 보유 여부 판정은 Minecraft selector가 수행한다.

## 추가 구조

```text
src/preview/query_result.ts
src/preview/world_state.ts
src/preview/output_adapter.ts
src/preview/query_adapter.ts
```

### QueryConfidence

```text
EXACT
SESSION_KNOWN
PARTIAL
UNAVAILABLE
```

현재 `TAG list`는 `SESSION_KNOWN`이다.

## TAG list Preview 알고리즘

1. 현재 MakeCode 실행 플레이어를 Preview viewer 임시 tag로 표시한다.
2. 원래 TAG list selector를 한 번만 평가하여 선택된 모든 entity/player에 Preview target 임시 tag를 붙인다.
3. 현재 세션에서 알려진 tag 이름마다 Minecraft selector로 실제 tag 보유 여부를 검사한다.
4. legacy execute + tellraw rawtext를 사용해 플레이어/엔티티 이름과 확인된 tag를 viewer에게 표시한다.
5. Preview 임시 tag를 모두 제거한다.

원래 selector를 먼저 snapshot하므로 `@p`, `@r`, `c=` 등의 선택 결과가 tag별 재평가 때문에 바뀌는 문제를 피한다.

## 제한

- Preview 시작 전 외부 명령/NPC/Command Block/Behavior Pack에서만 사용된 tag 이름은 known tag vocabulary에 없을 수 있다.
- 따라서 출력은 Minecraft 전체 tag universe가 아니라 **현재 커스텀 블록 Preview 세션에서 알려진 tag 이름**을 대상으로 한다.
- 실제 `.mcfunction` 명령 의미에는 이 제한이 없다.

## 다음 확장 후보

같은 Query Adapter를 재사용하여 다음을 명령별 실측 후 추가한다.

```text
gamerule query
time query
testfor
testforblock
testforblocks
tickingarea list
inputpermission query
```
