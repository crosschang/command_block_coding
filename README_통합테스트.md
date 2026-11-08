# C3 EXECUTE E1~E6 TypeScript Preview 통합 검증 (0.0.85 소스 기준)

## 목표

학생/제작자가 MakeCode Extension 블록을 작성한 뒤 **행동팩이나 Function Bridge 없이** Minecraft Education에서 즉시 Preview 실행할 수 있도록 기존 `src/preview/execute_interpreter.ts`만 통합 수정. 원본 EXECUTE AST, `Command.execute()` 블록 API, Parser/Compiler/Validator, E1 파일 구조를 변경하지 않는다.

**완료 구분:** 소스/로컬 TypeScript 정적 검사 PASS · 모의 게임 API 기반 단위 테스트 22 PASS · MakeCode PXT 실제 빌드 미실시 · Minecraft Education 실게임 미검증. E2~E6의 모든 Bedrock EXECUTE 의미를 재현했다는 뜻은 아니다.

## 적용

1. 기존 GitHub `crosschang/command_block_coding`의 v0.0.85 기준 작업 브랜치를 준비한다.
2. ZIP의 `src/preview/execute_interpreter.ts`를 동일 경로에 덮어쓴다. 다른 파일을 덮지 않는다.
3. `pxt.json`에 이 파일이 **이미 등록**되어 있으므로 추가 등록은 불필요하다.
4. GitHub에 커밋 후 테스트용 버전을 릴리스하고 해당 버전을 불러온다. **이번 패키지는 GitHub에 자동 적용되지 않았다.**
5. ZIP의 `tests/C3_E1_E6_Education_INTEGRATED_Test.ts`를 MakeCode JavaScript 편집기에 넣고 Blocks 변환을 확인한다.
6. **월드 복제본**에서 맨 아래의 `e16all` **한 개** 채팅 명령을 실행한다. 여러 함수를 순서대로 호출하도록 구성했다.
7. 메시지가 아예 뜨지 않으면 MakeCode Play 상태와 TypeScript 오류/Extension 버전을 먼저 확인한다. 이전에는 월드 재접속으로 일시 문제를 해결한 사례가 있으나, 원인은 확정되지 않았다.

## `e16all` 1회 통합 테스트의 기대 관찰

| 범위 | 화면에서 보이면 좋은 결과 | 의미 |
|--|--|--|
| E1 | `E1 PASS glass at 31 -60 -70` | positioned + IF block + RUN SETBLOCK |
| E2 | `E2 PASS diamond at 32 -60 -70` | as @s / at @s / positioned |
| E2 다중 | `E2 MULTI PLAYER SAY` | 다중 실행자 구형 EXECUTE의 제한적 호환 Preview (플레이어 수만큼 가능) |
| E3 entity | `E3 ENTITY TRUE` + `E3 FALSE PASS stone unchanged` | IF/UNLESS entity가 증명 가능한 상황 |
| E3 score | `E3 SCORE TRUE - selector query supported` **또는** `INFO [EXECUTE_PREVIEW_UNKNOWN]` | 실제 `testfor` selector PXT 호환성이 아직 미확인. 실패를 PASS로 판정하지 않음 |
| E4 | `E4 PASS emerald at 33 -60 -69` | 명시적 rotated 0 0 + ^ ^ ^1 |
| E5 | `E5 PASS diamond at 34 -60 -69` | facing position + 로컬좌표 |
| E5 eyes | `INFO [EXECUTE_RUN_POSITION_UNKNOWN]` (또는 유사 명확한 미지원 진단) | PXT API가 정확한 눈 위치를 제공하지 않음. 잘못된 블록 설치 금지 |
| E6 | `E6 SAFE SAY` | 차원과 무관한 SAY 의미 보존 |
| E6 guard | `INFO [EXECUTE_DIMENSION_UNSUPPORTED]`, `E6 GUARD PASS - overworld stone unchanged` | Nether 문맥 요청을 오버월드 SETBLOCK으로 오실행 금지 |

## 구현 세부 범위 (안전한 부분집합)

| 단계 | 실제 TS 구현 | 정확한 지원을 보류한 것 |
|--|--|--|
| E1 | 절대/~ 위치 누적, align, 지원되는 블록 확인, SAY/SETBLOCK | 커스텀 블록 상태의 게임 내 완전한 조회 |
| E2 | @s 문맥, 제한된 `as @a at @s` 다중 SAY 및 일부 대상 명령, 기존 E1 연계 | 여러 선택자 분기/교차, 임의 엔티티 좌표/회전 조회 |
| E3 | 무조건 존재가 증명되는 entity IF/UNLESS, `@s` 점수 matches에 대한 읽기 전용 selector 증명(성공/보완범위 조회) | 임의 필터, fake-player·2항 score 비교, API false를 실제 FALSE라고 단정하는 것 |
| E4 | 명시적인 yaw/pitch 회전 및 ^좌표 삼각함수, 로컬 PXT 좌표 | 현재 플레이어 pitch를 직접 읽기(현재 PXT API는 yaw만 제공) |
| E5 | facing position, 자기 자신 feet 기준 일부 facing entity, anchored feet | eyes 높이가 달라지는 자세, 복수 엔티티 facing 위치와 정확한 눈 좌표 |
| E6 | `in` 문맥이 있어도 효과가 같은 SAY의 제한적 실행 | Nether/End의 실제 블록·엔티티·조건 평가 또는 변경 (차원 이동 API 부재) |

이러한 차단 경로 역시 이번 통합 구현의 대상이며, **지원 안 됨(INFO)을 실동작 PASS로 간주해서는 안 된다.** 정확성이 확인되지 않은 기능은 여전히 Native `.mcfunction`으로 내보내 별도 게임 검증해야 한다. 행동팩 설치를 강요하지 않고 MakeCode 즉시실행과 제작자용 완전한 `.mcfunction` 생성을 구분한다.

## 기술 주의

- 코드의 `execute ...` 문자열은 **오직 Preview 내부의 구형 호환 디스패치에서만** 만들어진다. 최신 EXECUTE AST → Compiler 출력은 절대 변경하지 않는다.
- 성능상의 이유로 분기하지 않는 경우에는 E1 단일 실행 문맥 평가기를 재사용한다.
- nested RUN execute는 최대 16중첩까지 실행 시 임시 병합하되 원본 AST는 건드리지 않는다. 더 깊으면 INFO 차단.
- 기존 PXT 인터프리터가 처리할 수 없는 범위를 'PASS'라고 말하지 않는다.
- 실제 프로젝트의 PXT 컴파일과 JavaScript→Blocks 변환은 **사용자가 릴리스 적용 후 한 번의 통합 테스트로** 확인한다.

## 자동 검증 명령 (개발 PC)

```sh
# TypeScript 소스 문법/타입(간이 PXT 스텁 기준)
tsc --target es5 --module none --noEmit --skipLibCheck --lib es5 tests/pxt_api_stub.d.ts src/preview/execute_interpreter.ts

# JavaScript → Blocks용 테스트 저작 코드 문법 검증
tsc --target es5 --module none --noEmit --skipLibCheck --lib es5 tests/integrated_author_stubs.d.ts tests/C3_E1_E6_Education_INTEGRATED_Test.ts

# 로컬 게임 API 모의 테스트
node tests/integrated_unit_test.js
```

검증 환경은 **Minecraft Education 런타임이 아닌 개발 PC 기반 모의 환경**이므로 위 명령만으로 수업 실행을 인증할 수 없다.

## 공식 API 참고

- https://minecraft.makecode.com/reference/player/get-orientation (yaw 조회)
- https://minecraft.makecode.com/reference/positions/pos-local (로컬좌표, pitch 포함)
- https://minecraft.makecode.com/reference/player/execute (구형 실행기 경로)
- https://minecraft.makecode.com/reference/mobs/execute (선택자 명령 실행)
- https://learn.microsoft.com/en-us/minecraft/creator/documents/commandsnewexecute?view=minecraft-bedrock-stable (최신 EXECUTE 명령)
