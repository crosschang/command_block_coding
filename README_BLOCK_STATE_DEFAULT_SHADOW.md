# 0.0.43 — Block State 선택 입력 기본 Shadow 개선

## 적용 대상
- 최근 0.0.43 패치(Enchantment 및 `cbi_rules` 조건부 활성화)가 적용된 `command_block_coding` 프로젝트
- `pxt.json`의 `version`은 **사용자 프로젝트 값 그대로 보존** (본 패치에는 `pxt.json`이 없음)

## 수정 파일
- `custom.ts` **한 파일**만 프로젝트 최상위 폴더에 덮어쓰기
- 변경 사항은 `states.shadow` 기본 블록 ID **네 줄**뿐

| MakeCode 블록/API | 기존 기본 입력 | 변경 기본 입력 |
| --- | --- | --- |
| `Command.setblock` | `mcfunction_block_states_add` | `mcfunction_block_states_none` |
| `Command.fill` | `mcfunction_block_states_add` | `mcfunction_block_states_none` |
| `Command.fillReplaceOnly` | `mcfunction_block_states_add` | `mcfunction_block_states_none` |
| `Command.cloneFiltered` | `mcfunction_block_states_add` | `mcfunction_block_states_none` |

`MCFunctionBlockStateFields.none()` 및 기존 Block State 연결 API는 그대로 재사용합니다.

## 기대 동작

### 1. 빈 State 사용
블록의 선택 인수 `states`를 열면 새로 꺼낸 블록에서는 **`no more block states`가 기본 Shadow로 표시되도록 지정**했습니다.

`SETBLOCK position ~12 ~2 ~8 block minecraft:emerald_block states [no more block states] mode keep`

다음 명령으로 직렬화되어야 합니다. (빈 `[]` 생성 금지)

```mcfunction
setblock ~12 ~2 ~8 minecraft:emerald_block keep
```

### 2. State 사용
`no more block states` 위에 사용자 정의 State 체인 또는 Registry State를 연결할 수 있어야 합니다.

예시: `pillar_axis = x` → 현재 프로젝트의 Canonical Compiler가 Block State를 포함하는 명령 생성.

### 3. 기존 블록
**이미 배치된 블록의 `undefined` 연결을 자동 수정하는 마이그레이션 기능은 포함하지 않았습니다.** PXT 편집기 캐시 및 기존 Workspace 직렬화 상태에 따라 이전의 `undefined`가 남으면 해당 옵션을 직접 다시 연결하거나 새 블록으로 교체하여 확인하세요.

### 4. 검증 순서
1. 사용자 프로젝트를 백업 후 `custom.ts` 덮어쓰기
2. MakeCode Extension 소스 갱신·편집기 새로고침
3. 새 `SETBLOCK` 블록을 꺼내 `+`로 State 입력 열기 → `no more block states` 표시 확인
4. `FILL`, `FILL replace only`, `CLONE filtered`에도 동일하게 검사
5. State 없음 + 모드/필터 포함 결과가 이전 명령 문자열과 일치하는지 확인
6. State 추가(`pillar_axis = x`)가 정상 작동하는지 확인
7. 기존 SETBLOCK/FILL/CLONE Preview 회귀 검사

## 보존과 검사
- AST / Compiler / Validator / Registry / Generator: 변경하지 않음
- TAG / Gamerule / Enchant / Sound / Particle: 코어 수정 없음
- `pxt.json` 및 `main.ts`, `test.ts`: 변경 없음
- 기존 최신 `custom.ts`에서 수정된 것은 기본 Shadow 메타데이터 네 줄뿐
- 생성 명령어에서 빈 State의 `[]`가 생략되는 Compiler 조건 확인
- MakeCode API 임시 선언을 포함한 일반 TypeScript 검사 통과
- 실제 Minecraft MakeCode JS ↔ Blocks 표시 및 실게임 검증은 사용자 환경에서 확인 필요

`generate_registry` 재실행은 필요하지 않습니다. 생성 파일이나 Registry 데이터를 수정하지 않았습니다.
