# 문자열 목록 공통 응답 — DATA_LIST_V3

## 구현 범위

기존 cbxq4 Kind 0~3과 목록 디코더를 재사용하고 별도 수신팩에 실제 API 읽기를 연결했다.
숫자·불리언·signed 점수 경로와 명령 AST·Compiler·mcfunction 출력은 유지한다.

| Kind | API 원본 | 항목 의미 |
|---|---|---|
| Players | world.getAllPlayers() | 현재 접속 플레이어 name |
| Objectives | world.scoreboard.getObjectives() | Objective id, displayName 아님 |
| Participants | world.scoreboard.getParticipants() | 월드 전체 점수 참가자의 displayName |
| MyTags | sourceEntity.getTags() | 요청 플레이어의 실제 태그 |

UTF-16 순서로 정렬한 사본을 페이지로 나눈다. 참가자 표시 이름이 같아도 합치지 않는다.
표시 이름만으로 참가자의 identity나 타입을 되돌려 얻는 기능은 아니다.
태그를 임의로 필터링하지 않으므로 다른 활성 요청의 진단/전송 태그가 포함될 수 있다.
해당 요청 자신의 packet 태그는 API 스냅샷을 읽은 뒤 쓰므로 그 스냅샷에 포함되지 않는다.

QueryReadback.hasTextList(response), pageCountOr(response, fallback)를 추가했다.
pageCount는 이번 페이지 개수, totalOr는 그 요청 시점 전체 스냅샷 개수다.
textOr로 문자열을 읽어 변수/배열/조건/반복에 쓸 수 있다. 빈 목록도 유효 데이터이며
Pending/Error를 빈 목록으로 바꾸지 않는다. 읽은 결과는 transport 배열과 공유하지 않는다.

## 기존 wire와 한도

- 페이지 0~99, 페이지당 최대 2개, 항목당 최대 UTF-16 32단위.
- 전체 개수 필드는 0~4095. 4095 초과는 SERVER_ERROR / LIST_SNAPSHOT_UNSUPPORTED.
- 최대 100페이지로 실제 접근 가능한 항목은 200개다. total은 더 클 수 있으나
  전 항목을 읽을 수 있다고 주장하지 않는다. 테스트 코드는 200 초과에 경고한다.
- 요청한 페이지의 항목이 길면 SERVER_ERROR / LIST_ITEM_OVER_32_UTF16.
  줄임표·부분 문자열·조작한 total로 성공 응답을 만들지 않는다.
- Fast64(6비트), ASCII7(7비트), UTF-16(16비트) 모드를 사용한다.
  기존 Huffman mode 3 디코더는 유지하되 V3 팩에서는 송신하지 않는다.
- 개수·길이·mode·원문 체크섬을 기록하고 ready를 마지막에 쓴다.
- 마지막 페이지의 정확한 개수와 범위 표식을 검사한다. nonempty 스냅샷의 범위 밖
  페이지는 PAGE_OUT_OF_RANGE다. empty 스냅샷은 count=0인 유효 empty 결과다.
- 체크섬은 통신 오류 일부를 감지하는 수단이며 인증·암호화가 아니다.

페이지마다 별도 시점의 API 스냅샷이다. 페이지 사이 원본이 바뀌면 항목 중복·누락이나
total 변화가 생길 수 있다. 여러 페이지 전체가 하나의 고정된 조회라고 주장하지 않는다.
한 번의 read도 다수 testfor 호출을 수행한다. 폴링 worker는 없지만 빠르거나 게임이
멈추지 않는다고 미리 보장하지 않는다. 지연·태그 예산·팩 만료 중 읽기의 실제 검증은 대기다.
쓰기 실패는 오류 packet으로 처리하고 성공한 빈 목록으로 위장하지 않는다.

## 적용

1. hasTextList/pageCountOr와 강화된 목록 검사가 포함된 Extension 소스를 반영한다.
2. CBX_LIVE_QUERY_DATA_LIST_V3_DEV.mcpack으로 기존 V1/V2 조회팩을 교체한다.
   같은 UUID의 팩 버전 0.0.3이다. 조회 수신팩을 중복 활성화하지 않는다.
3. 기존 P4O2H ZERO ACK 실행팩은 유지한다. 별도 CBXTB 팩은 이 작업으로 변경하지 않는다.
4. @minecraft/server 2.8.0, min_engine_version 1.21.0 유지.
   cbxq4:ping 출력은 PING_OK DATA_LIST_V3다.
5. QUERY_LIST_V3_MAKECODE_MAIN.ts 전체를 사용자 MakeCode JavaScript에 적용한다.

새 Extension 실행용 TS 파일은 없으며 기존 등록 파일 2개를 수정했다.
pxt.json.files와 사용자 PXT 0.0.9는 유지한다. 행동팩·전용 소스·검사는 GitHub에 넣지 않는다.

## 싱글플레이 테스트

테스트는 시간·gamerule·점수를 자동 변경하지 않는다. qlist 0에서 전용 태그 4개
000_cbxql_a / 000_cbxql_b / 000_cbxql_c / 000_제주만 추가한다. 기존 태그는 보존한다.
원래 태그가 있으므로 전체 개수가 4라고 단정하지 않는다. 정렬상 먼저 오는 다른 태그가
있으면 테스트 태그가 다른 페이지에 있을 수 있다. qlist 9는 위 전용 태그만 제거한다.
한글은 UTF-16 모드를 확인하기 위한 시험 데이터다.

| 채팅 | 동작/확인 |
|---|---|
| qlist 0 | CHANNEL_READY=true, MARKERS_PRESENT=true, PING_OK DATA_LIST_V3 |
| qlist 1 → qlist 2 | 태그 page 0 요청 → 문자열 ITEM·PAGE_COUNT·TOTAL·분기 |
| qlist 3 → qlist 4 | 태그 page 1 요청 → 한글 포함 여부 확인 |
| qlist 5 → qlist 2 | Objective ID page 0 |
| qlist 6 → qlist 2 | 접속 플레이어 이름 page 0 |
| qlist 7 → qlist 2 | 점수 참가자 표시 이름 page 0 |
| qlist 8 | 마지막 유효한 목록을 변수/배열에서 재출력 |
| qlist 9 | 미완료 목록 요청 취소 및 전용 태그 정리 |

각 단계의 출력이 끝난 후 다음 줄을 입력한다. PENDING이면 같은 읽기 단계만 다시
입력한다. 팩 READY 로그가 있어도 MakeCode 목록 수신·사용 전에는 종단 PASS가 아니다.
이 전체 코드에는 이전 qdata/qscore 검사도 유지한다.

## 검증과 후속

대표 V2 게임 PASS는 VERIFICATION_QUERY_SCALAR_INGAME_2026-11-11_KO.md에 보존했다.
V3 목록·새 수신팩의 scalar/score 회귀는 실제 게임 검증 전까지 PENDING이다.
실제 멀티는 사용자 결정에 따라 기능 완성 후 통합 단계로 미루며 현재 개발의 선행
조건으로 삼지 않는다. 소유자 분리와 기존 로컬 회귀 구조는 유지한다.

- 목록 wire 검사 18개, 수신기+실제 디코더 모의 연결 49개,
  기존 scalar/score wire 29개·공통 응답 14개·ACK 9개: 합계 119 LOCAL PASS.
- @minecraft/server 2.8.0 실제 타입 정의 기준 수신 JS 진단 0.
- Extension TypeScript 기존 진단 52개 유지, 추가 진단 0 및 사용자 테스트 진단 0.
  전체 PXT 컴파일·게임 성공을 뜻하지 않는다.

## 공식 근거

- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/world?view=minecraft-bedrock-stable
- https://github.com/MicrosoftDocs/minecraft-creator/blob/main/creator/ScriptAPI/minecraft/server/Scoreboard.md
- https://github.com/MicrosoftDocs/minecraft-creator/blob/main/creator/ScriptAPI/minecraft/server/Entity.md
- @minecraft/server 2.8.0 실제 타입 정의로 수신 코드를 대조한다.
