# V5: 요청 플레이어의 태그 보유 여부 조회

2026-11-12 실게임 추가: 한글 태그 있음·없음과 Boolean 분기, 저장 false 100회 재사용을
대표 GAME PASS로 확인했다. 두 읽기는 각각 PROBES=4 READ_TICKS=2였다.
상세 범위와 제한은 VERIFICATION_QUERY_OWN_TAG_V5_INGAME_2026-11-12_KO.md를 따른다.

## 목적과 범위

목록 전체를 읽지 않고 특정 태그가 있는지만 참·거짓으로 받는다.
기존 V4의 시간·게임 규칙·점수·압축 목록 조회는 유지한다.
채팅 직접 반환 연구를 재개한 기능이 아니라 기존 cbxq4 데이터 경로의 좁은 조회다.

새 API: `MCFunctionLiveQuery.requestOwnTag(tag: string): Ticket`.
새 Kind.OwnTagPresent=7을 추가했고 기존 Kind 번호 0~6은 유지했다.
기존 등록 파일 cbx_live_query.ts와 query_result.ts에 구현했으며,
새 Extension 실행 TypeScript 파일·pxt.json.files 변경·PXT 버전 변경은 없다.
AST·Compiler·mcfunction 문법·실행 ACK도 변경하지 않았다.

요청 플레이어 자신만 대상으로 한다. 임의 엔티티·다른 플레이어·선택자 필터를 지원한다고
확대하지 않는다. 태그는 직접 문자열로 입력하며 Registry 목록으로 제한하지 않는다.

## 기존 구조 재사용

| 단계 | 처리 |
|---|---|
| 요청 | token\|tag_self\|0\|태그 이름 UTF-16 hex |
| 행동팩 | 요청 sourceEntity의 hasTag(tagName)로 정확한 이름 확인 |
| 응답 | 기존 Boolean one-hot: true는 v, false는 z, 준비 r은 마지막 기록 |
| 읽기 | 기존 ready/error 검사와 Boolean 복원 경로 재사용 |
| 공통 데이터 | QueryReadback.hasBoolean / booleanOr / state / reason |
| 저장 재사용 | 성공한 Response를 보관해 반복 사용. 새 조회는 명시적으로 요청 |

이름은 공통 wireText/wireHex 경로를 재사용한다. 1~64 UTF-16 단위, ASCII 제어 문자와
DEL 제외는 이 전송 형식의 제한이며 Minecraft 태그 자체의 최대 길이 규칙이 아니다.
공백·기호·한글도 원문 그대로 hex로 전송해 선택자나 명령 문자열에 삽입하지 않는다.
generic request(OwnTagPresent, page)는 이름 누락을 막기 위해 USE_REQUEST_OWN_TAG_BLOCK으로 거부한다.

성공 응답은 Boolean 확인 4회(ready/error/true/false)를 사용한다. 요청·ACK·계측·로그 호출은
이 수에 포함되지 않는다. true/false가 둘 다 있거나 둘 다 없으면 INVALID_BOOLEAN_PACKET이다.
hasTag가 예외를 내면 서버 오류이며 false로 변환하지 않는다. 태그가 실제로 없는 정상
false와 대기·오류·닫힘을 구분한다. 기존 수명·소유자별 키·중복 방지·취소·정리를 유지한다.

단순 태그 testfor 자체는 MakeCode에서도 가능하다. 이번 기능은 조회 공통 상태와 정확한
이름 처리·API 예외를 포함하는 행동팩 데이터 경로다. 4회가 가능한 모든 구현 중 최소라는
주장이나 실게임의 즉시 반환 보장은 아니다. 목록 복원 대신 좁은 Boolean을 요청할 수 있게 했다.

## 행동팩 구성

- 새 팩: CBX_LIVE_QUERY_DATA_TAG_V5_DEV.mcpack, 팩 버전 0.0.5.
- 이전 DATA_HUFF_V4와 같은 조회팩 UUID, @minecraft/server 2.8.0 의존성 유지.
- V4 및 이전 cbxq4 조회팩을 V5로 교체한다. cbxq4 수신팩을 중복 활성화하지 않는다.
- P4O2H ZERO ACK 실행팩은 유지한다. TRANSPORT PROBE 실험팩은 비활성화한다.
- 확인 핑: PING_OK DATA_TAG_V5 scalar/score/lists/own_tag.
- 행동팩 원본·전용 테스트는 GitHub에 커밋하지 않고 별도 파일로 제공한다.
- 최소 엔진 매니페스트 1.21.0만으로 Script API 2.8 지원을 보장하지 않는다.

구형 조회팩은 새 tag_self 메타데이터를 처리하지 않는다. 새 Extension만 갱신하고 기존
V4 팩을 그대로 쓰면 새 조회의 준비 응답이 나오지 않을 수 있으므로 팩 핑을 먼저 확인한다.

## 사용자 테스트

QUERY_OWN_TAG_V5_MAKECODE_MAIN.ts는 사용자 프로젝트 JavaScript에 넣는 독립 예제다.
Extension main.ts에 덮어쓰지 않는다. 다음은 각 단계의 END/결과를 확인하며 한 줄씩 입력한다.

```text
qtag 0
qtag 1
qtag 2
qtag 3
qtag 4
qtag 5
qtag 6
```

- 0: 채널 교정·핑 후 이번 실행의 한글 실험 태그만 준비. 이미 같은 태그가 있으면 보존하고 중단.
- 1→2: 태그 있음 요청·읽기. BOOLEAN=true, MATCH_EXPECTED=true, PROBES=4 기대.
- 3→4: 실험 태그만 제거하고 새 요청·읽기. BOOLEAN=false, MATCH_EXPECTED=true, PROBES=4 기대.
- 5: 마지막 성공 응답을 100번 조건문에 사용. 추가 요청·readLive 호출 없음.
- 6: 남은 요청 취소와 이번 실행이 만든 실험 태그 정리.

Pending이면 같은 읽기 단계 2 또는 4를 나중에 다시 입력한다. 응답 전 다음 요청으로 덮어쓰지 않는다.
시간·게임 규칙·점수·블록은 바꾸지 않는다. 프로그램을 강제 중단해 태그가 남으면 화면의
LAB_TAG 이름을 기준으로 확인한다. 새로 시작한 프로그램이 이전 실행의 태그 소유권을 추정해
임의 삭제하지 않는다. 저장값은 이전 스냅샷이며 게임 상태 변화 시 자동 갱신되지 않는다.

## 수행한 검사

| 검사 | 결과 |
|---|---:|
| 새 클라이언트/디코더 회귀 | 21 LOCAL PASS |
| 실제 팩 소스→실제 디코더/공통 응답 (API·스케줄러 모의) | 72 LOCAL PASS |
| 기존 목록 wire 회귀 | 26 LOCAL PASS |
| 기존 숫자/점수 wire 회귀 | 29 LOCAL PASS |
| 공통 응답 회귀 | 14 LOCAL PASS |
| 실행 ZERO ACK 회귀 | 9 LOCAL PASS |
| 위 선택 검사 합계 | 171 LOCAL PASS |

새 검사에는 true/false, 한글·64단위 이름·정확한 대소문자, 목록 API를 부르지 않는 조회,
4 probe, 저장값 무조회 재사용, 새 조회와 과거 스냅샷 구분, 같은 토큰의 다른 소유자 격리,
대기·취소·메타데이터 거부·원래 hasTag 예외를 포함한다. 멀티 항목은 로컬 모의이며
실제 멀티플레이 검증은 사용자 결정대로 최종 통합 단계다.

TypeScript 5.7.3 의미 검사: 기존 진단 52→52, 신규 0. 사용자 예제 진단 0.
실제 @minecraft/server 2.8.0 타입을 사용한 행동팩 JS 검사 진단 0.
전체 PXT 컴파일은 미수행이다. 최초 구현 당시 실게임·성능은 PENDING이었고,
이후 위 추가 기록의 한글 태그 있음·없음·저장 재사용만 대표 GAME PASS로 확인했다.
V4의 기존 대표 GAME PASS나 이번 좁은 조회의 결과를 V5 팩 전체의 GAME PASS로 확대하지 않는다.

공식 API 근거:
https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entity?view=minecraft-bedrock-stable#hastag
구현은 로컬에 설치한 @minecraft/server 2.8.0 선언과도 대조했다.
