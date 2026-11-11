# 목록 읽기 호출 감소 — DATA_HUFF_V4

## 문제와 변경

V3 영상에서 태그 page 0 읽기 약 3.0~3.5초, page 1 약 3.5~4.0초를 관찰했다.
기능은 대표 PASS지만 지연 WARNING이며, 입력부터 ENTER까지의 지연·일반 로그 출력과
디코더 내부 비용은 구분한다. 세부 근거는 VERIFICATION_LIST_V3_VIDEO_DELAY_2026-11-11_KO.md다.

기존 V4 wire에 이미 존재하는 Huffman mode 3 디코더를 활용해 송신만 적응적으로 선택한다.
문자열마다 Fast64/ASCII7/UTF-16 중 가능한 기존 형식의 bit 수와 Huffman bit 수를 비교해
엄격하게 더 짧을 때만 Huffman을 쓴다. 같거나 더 길면 기존 형식을 유지한다.
따라서 이 선택으로 본문 probe 수가 V3보다 늘어나지 않는다.

Huffman 사전·트리는 Extension의 기존 HUFF_TOKENS/ZERO/ONE/SYMBOL과 동일하다.
새로 학습·변경한 사전을 사용하지 않는다. 겹치는 토큰을 고려해 뒤에서부터 최소 bit
비용을 계산하며, 사전에 없는 UTF-16 단위는 기존 ESC+16bit 형식을 사용한다.
빈 문자열·한글·이모지·정확한 32단위 경계와 기존 비압축 fallback을 보존한다.

원문·페이지·total·checksum·ready-last·만료/취소·소유자 분리·길이 제한은 유지한다.
AST·Validator·Compiler·mcfunction 의미와 scalar/score packet은 변경하지 않는다.
Huffman ESC의 남은 bit 한도도 확인한다. 체크섬은 보안·전수 변조 감지가 아니다.

## 실제 디코더를 통한 로컬 호출 수

| 원문 | V3 probe | V4 probe | 감소 |
|---|---:|---:|---:|
| 000_cbxql_a / 000_cbxql_b | 173 | 142 | 31회, 약 18% |
| 000_cbxql_c / 000_제주 | 203 | 161 | 42회, 약 21% |

단순 추정 문자열 길이만이 아니라 새 수신 스크립트와 실제 Extension 디코더를 연결한
모의 검사에서 원문·probeCalls를 함께 확인했다. API·타이밍은 모의값이다.
이 감소율을 게임 대기시간 감소율로 그대로 옮기지 않는다. 인게임 개선은 PENDING이다.

## 비교용 진단

QueryReadback.Response에 hasReadMetrics/readProbes/readTicks를 추가했다.
기존 tryRead의 실제 probeCalls/readTicks를 그대로 옮기며 새로운 조회를 수행하지 않는다.
공개 readProbesOr/readTicksOr는 계측 정보가 없으면 명시적 fallback을 반환한다.

- PROBES: Boolean 태그 확인 횟수다. ACK·채팅 출력 호출은 포함하지 않는다.
- READ_TICKS: 기존 GameTime 기준 디코더 읽기 구간이다. 실제 벽시계 ms가 아니다.
- 정상 query 값·ACK·측정되지 않은 기본 0과 별개다. factory로 만든 값에는 계측 없음.
- 로그 추가 자체가 게임 스케줄링/표시 타이밍에 영향을 줄 수 있어 영상도 함께 비교한다.

## 적용과 게임 비교

1. 계측 필드/getter가 포함된 Extension 소스를 반영한다.
2. CBX_LIVE_QUERY_DATA_HUFF_V4_DEV.mcpack으로 기존 V3 조회팩을 교체한다.
   같은 UUID의 팩 버전 0.0.4이며 의존 API 2.8.0은 유지한다.
3. P4O2H ZERO ACK 실행팩은 유지한다. cbxq4 수신팩을 중복 활성화하지 않는다.
4. QUERY_HUFF_V4_MAKECODE_MAIN.ts 전체를 사용자 MakeCode JavaScript에 적용한다.
5. qlist 0 → 1 → 2 → 3 → 4 → 8을 한 줄씩 출력 후 실행한다.

팩 ping은 PING_OK DATA_HUFF_V4여야 한다. qlist 2/4 출력의 STATE=1 REASON=OK,
복원 문자열, PAGE_COUNT/TOTAL, PROBES/READ_TICKS 및 화면 대기시간을 확인한다.
동일 원문이 같은 페이지에 있을 때 예상 probe는 위 표와 같다. 다른 태그·페이지라면
고정된 142/161을 기대하지 않는다. qlist 8은 저장 배열을 재사용하므로 새 decode가 아니다.

같은 진단 코드는 V3 팩으로 기준선을 다시 측정할 때도 사용할 수 있다. 이 경우 실제
송신팩은 ping DATA_LIST_V3으로 구분한다. 기존 V3 영상만으로도 근사 비교는 가능하다.
측정 전에 대기 요청은 읽거나 취소하고 원본 태그/페이지 조건을 동일하게 유지한다.
시간·gamerule·점수는 이번 테스트에서 자동 변경하지 않는다. 전용 태그는 qlist 9로 정리한다.

## 검증 범위

- 실제 목록 디코더/wire·진단 26개, 수신기+디코더 모의 연결 60개 LOCAL PASS.
- 기존 scalar/score wire 29개·공통 응답 14개·ACK 9개도 통과: 합계 138 LOCAL PASS.
- 기존 dictionary 일치, 압축/비압축 선택, 실제 원문 복원과 호출 감소, 취소·재접속
  압축 태그 정리 및 scalar/score 회귀를 포함한다.
- API 2.8.0 타입 검사 진단 0. Extension 기존 TypeScript 진단 52개 유지, 추가 0,
  사용자 테스트 진단 0. 전체 PXT/실게임 성공을 뜻하지 않는다.
- V4 실게임·실제 지연 개선은 PENDING, 멀티 실게임은 합의대로 기능 완성 후 통합 단계다.

기존 등록 TS 2개만 수정하고 새 실행용 TS 파일·pxt.json.files 변경은 없다.
사용자 PXT 0.0.10을 보존한다. 행동팩·전용 소스·전용 테스트는 GitHub에서 분리한다.
