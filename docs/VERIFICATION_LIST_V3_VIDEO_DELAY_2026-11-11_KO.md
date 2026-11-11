# V3 태그 목록 영상 결과와 읽기 지연

근거: 사용자 영상 2026-11-11 20-30-48.mp4, 약 42.03초, 1920×1080/60fps.
DATA_LIST_V3 시작·핑과 사용자 QUERY_LIST_V3_MAKECODE_MAIN.ts를 대조했다.
Education/PXT 정확한 빌드 및 실제 로드된 Extension 커밋은 미확인이다.
사용자는 일부 결과가 뒤늦게 나온다고 보고했다.

## 기능 판정

| 항목 | 실제 관찰 | 판정 |
|---|---|---|
| 준비 | MARKERS_PRESENT=true, CHANNEL_READY=true, DATA_LIST_V3 ping | 대표 PASS |
| 태그 page 0 | count=2 total=22, STATE=1 REASON=OK, 000_cbxql_a / 000_cbxql_b, COUNT_PLUS_1=3, NONEMPTY | 목록 수신·반복·계산·조건 대표 GAME PASS |
| 태그 page 1 | count=2 total=22, STATE=1 REASON=OK, 000_cbxql_c / 000_제주 | 다음 페이지·한글 대표 GAME PASS |
| qlist 8 | STORED_COUNT=2 STORED_TOTAL=22, page 1의 두 문자열 재출력 | 저장 배열 재사용 대표 GAME PASS |

total=22는 전체 개수다. 실제로 읽은 것은 두 페이지 네 항목이며, 저장 배열은 마지막
페이지 두 항목이다. 22개 전부를 전송·검증했다고 확대하지 않는다.
Objective/Participants/Players, empty/범위 밖/긴 문자열/만료·취소, 부하와 멀티 실게임은 대기다.
기능 대표 PASS와 지연 WARNING을 함께 보존하며 성능 안정화 완료로 처리하지 않는다.

## 영상 시간 판독

0.25초 간격으로 프레임을 추출하고 ENTER/STATE가 처음 보이는 경계 프레임을
직접 확인했다. OCR은 보조로만 사용했다. 아래는 화면 표시의 근사 구간이며
원래 녹화 파일의 ms 단위 정밀 측정·서버 API 소요 시간과 동일하지 않다.

| 구간 | ENTER 최초 관찰 구간 | 결과 STATE 최초 관찰 구간 | 표시 간격 |
|---|---|---|---|
| qlist 2 (page 0 읽기) | 12.75~13.00초 사이 | 16.00~16.25초 사이 | 약 3.0~3.5초 |
| qlist 4 (page 1 읽기) | 29.25~29.50초 사이 | 33.00~33.25초 사이 | 약 3.5~4.0초 |

수신팩 READY는 두 경우 모두 읽기 단계 전에 표시됐다. 따라서 이번 기다림을 전부
요청 전송·팩 스냅샷 준비의 지연으로 설명할 수 없다. 입력부터 ENTER까지의 구간,
MakeCode 스케줄링·왕복 전송·화면 갱신은 위 측정과 별개다.

## 실제 소스가 수행하는 확인 횟수

V3 tryRead는 태그 존재 여부의 Boolean을 얻기 위해 player.execute(testfor)를
여러 차례 호출한다. 이 영상의 page 0 두 문자열은 Fast64, page 1은 Fast64+UTF-16이다.

| 항목 | page 0 | page 1 |
|---|---:|---:|
| 문자 비트 확인 | 132 | 162 |
| ready/error·count/total·길이/mode·checksum·range | 41 | 41 |
| probe 합계 | 173 | 203 |

이는 현재 코드와 확인된 문자열로 계산한 호출 수이며 실제 프레임에 probe 계측값을
추가해 측정한 것은 아니다. ACK 1회와 로그 출력은 probe 합계에 포함하지 않는다.
여러 확인 호출이 읽기 비용의 원인 후보지만, 모든 지연을 한 원인으로 확정하거나
예열 효과·한글 자체의 오류·행동팩 실행 실패라고 해석하지 않는다.

## 다음 개선 방향 (미적용)

기존 V4에 이미 있는 Huffman mode 3을 이용해 짧게 표현할 수 있는 문자열만 압축하면
호출 수를 줄일 여지가 있다. 원본 문자열·개수·페이지·checksum·검증은 보존해야 한다.
호출 수 감소를 실제 대기시간 감소와 동일시하지 않고, 변경 후 별도 실게임으로 확인한다.
이번 기록만으로 새 압축 송신 구현·지연 개선 완료를 주장하지 않는다.

명령의 AST·Compiler·mcfunction 의미를 바꾸거나 전송 성공을 데이터 성공으로 바꾸는
방법은 사용하지 않는다. 멀티 실게임은 기능 완성 후 통합 단계라는 사용자 결정을 유지한다.
