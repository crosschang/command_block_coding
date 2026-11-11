# V2 결과 기록과 V4 개발 재개 기준

## V2 실게임 결과

근거: 사용자 제공 `image(20261111-221248).png`.
이미지 파일명은 시험 환경·게임 빌드의 증거로 사용하지 않는다.
TRANSPORT_CORE_PROBE_V2_MAKECODE_MAIN.ts의 출력 형식과 대조했다.

| 확인 항목 | 실제 화면 | 판정 |
|---|---|---|
| 내부 원문 접근 | LOCAL_CORE_HITS=2 ARGS_OK=true, ARGS=-7 및 000_제주 | 내부 문자열 인수 접근 대표 GAME PASS |
| 내부 message | RAW=빈 값 | message 원문 조회 성공으로 확대하지 않음 |
| 팩 전송 | REQUEST_SENT=true, CBXLAT SENT mode=3 | 전송 반환·표시와 수신을 구분 |
| tell 이벤트 | CALLBACK=TELL, STATUS MODE=3 CHAT=0 TELL=1 | 이벤트 도착 대표 GAME PASS |
| 전달 데이터 | ARGS=빈 값, RAW=빈 값, MATCH_ARGS=false MATCH_MESSAGE=false | 팩 데이터 복원 미성공 |
| 저장 | STORED_TEXT=빈 값, STORED_NUMBER=0 | 초기값이며 데이터 수신 성공이 아님 |
| 오류 | 0개 인수가 필요한데 1개를 받았다는 인수 오류 | 기존 오류 보존, 원인 미확정 |

mode 3 토큰은 lat14401222x1이었다. 내부 이벤트 횟수 2는 화면 누적값이며 두 번의 모든
입력·실행 과정을 이 한 장으로 검증했다고 해석하지 않는다. 환경의 정확한 Education/PXT
게임 빌드와 실제 로드된 Extension 커밋은 미확인이다.

V1 내부 시험은 빈 인수였지만 V2에서는 -7과 한글을 읽었다. V2에서 래퍼 우회와 읽기 순서를
함께 바꿨으므로, 어느 변경만이 원인인지 또는 getChatArgs가 반드시 소비형인지 확정하지 않는다.
MakeCode가 문자열 인수를 전혀 읽을 수 없다는 주장은 이번 결과와 맞지 않는다.
동시에 팩→tell 이벤트의 데이터 전달은 성공하지 않아 정식 반환 계층으로 채택할 수 없다.

## 사용자와 합의한 결정

2026-11-12 사용자 승인: 기존 V4를 유지하고 필요한 데이터만 조회·받은 값 재사용을 우선한다.
동일한 채팅 원문 수신 실험은 여기서 멈추고 다른 반환 경로는 별도 연구 과제로 보류한다.
V1·V2의 실패·부분 성공과 기존 V4 지연 기록을 보존한다.

## 실제 구현에서 이미 가능한 범위

현재 소스의 pxt.json과 아래 API를 확인했다.

| 사용 목적 | 기존 구현 | 적용 범위와 제한 |
|---|---|---|
| 시간 또는 게임 규칙 한 값 | MCFunctionLiveQuery.request(kind, 0) | 현재 지원하는 Daytime / KeepInventory 각각 요청 |
| 점수 한 값 | MCFunctionLiveQuery.requestScore(target, objective) | 무필터 @s 또는 정확한 이름, objective 명시. 다른 선택자를 임의 축소하지 않음 |
| 필요한 목록 페이지 | MCFunctionLiveQuery.request(kind, page) | V4는 페이지당 두 항목. 전체를 자동 순회하지 않음 |
| 결과 읽기 | QueryReadback.readLive(ticket) | 기존 bounded decoder를 실제 호출. 전송 요청만으로 데이터를 얻은 것으로 처리하지 않음 |
| 수신값의 반복 사용 | 저장한 QueryReadback.Response와 numberOr / booleanOr / textOr / pageCountOr / totalOr | 이 getter들은 player.execute나 tryRead를 호출하지 않음 |

목록에는 임의 이름 검색·서버 측 조건 필터를 새로 구현한 상태가 아니다. '필요한 데이터만'은
현재 API가 실제 지원하는 종류·정확한 점수 대상·페이지 선택 범위를 뜻한다.
총 개수와 이번 페이지 항목 수를 구분하며, 서로 다른 페이지는 각각 새 스냅샷이다.
200개 접근 제한 등 기존 V4 범위를 확대했다고 주장하지 않는다.

## 반복 사용의 실행 규칙

1. 현재 게임 상태가 필요할 때 명시적으로 새 요청을 보낸다.
2. 준비된 결과를 readLive로 읽고 hasNumber / hasBoolean / hasTextList로 성공·타입을 확인한다.
3. 성공한 Response 또는 값을 사용자 변수에 저장한다.
4. 같은 계산·조건·목록 반복에서는 저장값을 사용한다. 매번 readLive를 호출하지 않는다.
5. 게임 상태를 다시 확인할 필요가 생기면 새 요청을 보내고 새 결과가 성공했을 때만 갱신한다.

Response 재사용 시 새 확인 호출이 없다는 것은 소스 경로로 확인했다. 로그 출력 등 호출자가
추가한 동작까지 실행 시간이 0이라는 뜻은 아니다. 저장값은 과거 스냅샷이며 자동 최신값이 아니다.
실패·대기·누락을 0·false·빈 목록으로 바꾸지 않는다. 이전 성공값을 보관했다면 새 조회 실패와
구분해 '이전 수신값'으로만 사용한다. 저장값으로 갈음한 것을 새 조회 성공으로 표시하지 않는다.

기존 사용자 V4 예제의 qdata 6 / qscore 7 / qlist 8은 저장값을 재출력하는 단계다.
이 동작은 앞선 대표 실게임 검증에서도 확인했다. 이번 이미지를 그 기능의 재검증으로
중복 계산하지 않으며 새로운 자동 캐시·조회 프로토콜을 구현한 것으로도 표시하지 않는다.

## 팩 운영과 후속 범위

- V4 조회팩 DATA_HUFF_V4와 실행팩 P4O2H ZERO ACK를 유지한다.
- 반환 경로 실험이 끝났으므로 CBX TRANSPORT PROBE V1 DEV만 비활성화하고 기존 V4 사용자
  프로그램으로 돌아간다. 기존 조회팩을 실험팩으로 교체하지 않는다.
- 다른 목록 종류·빈 목록·범위 밖·긴 문자열·만료/취소는 해당 미검증 범위를 유지한다.
- 멀티 실게임은 기존 결정대로 기능 완성 후 최종 통합 단계에서 수행한다.
- Dialogue/lang은 기존 정의 블록·팩 리소스 방향을 유지하며 현재 수신 연구로 완료 처리하지 않는다.

이번 변경은 검증·개발 기준 문서 추가다. 실행 소스·행동팩·pxt.json 변경은 없으며
새 Extension 실행 TS 파일과 pxt.json.files 등록도 필요하지 않다.
문서의 재사용 동작은 소스 확인이며 새로운 실게임 성능 개선 PASS가 아니다.

관련 기록:
- VERIFICATION_TRANSPORT_WIRE_V1_VIDEO_2026-11-11_KO.md
- VERIFICATION_TRANSPORT_PROBE_V1_VIDEO_2026-11-11_KO.md
- VERIFICATION_LIST_HUFF_V4_VIDEO_2026-11-11_KO.md
