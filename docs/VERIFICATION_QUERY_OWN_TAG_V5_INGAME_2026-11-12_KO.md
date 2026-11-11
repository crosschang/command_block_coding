# V5 태그 보유 여부 대표 실게임 검증

근거: 사용자 영상 `2026-11-12 07-46-27.mp4`, 약 35.58초.
QUERY_OWN_TAG_V5_MAKECODE_MAIN.ts와 DATA_TAG_V5 핑·응답 출력을 대조했다.
연속 프레임 요약과 개별 프레임을 직접 확인했다.
정확한 Education/PXT 게임 빌드·실제 로드된 Extension 커밋은 미확인이다.

## 실제 결과

| 단계 | 화면 관찰 | 판정 |
|---|---|---|
| qtag 0 | READY=true, PING_OK DATA_TAG_V5 scalar/score/lists/own_tag, 한글 LAB_TAG | 준비 대표 GAME PASS |
| qtag 1→2 | READY kind=tag_self value=true, STATE=1 REASON=OK, BOOLEAN=true MATCH_EXPECTED=true, BRANCH=HAS_TAG | 있음 조회·조건 사용 대표 GAME PASS |
| qtag 3→4 | READY kind=tag_self value=false, STATE=1 REASON=OK, BOOLEAN=false MATCH_EXPECTED=true, BRANCH=NO_TAG | 없음 조회·조건 사용 대표 GAME PASS |
| 두 읽기 | PROBES=4 READ_TICKS=2 | 이 입력·환경에서의 실측 |
| qtag 5 | STORED_BOOLEAN=false, STORED_REUSE=100 TRUE_BRANCHES=0 FALSE_BRANCHES=100 | 저장된 실제 false 재사용 대표 GAME PASS |
| qtag 6 | CLEANUP_DONE (stored data remains a previous snapshot) | 예제의 정리 완료 표시 확인 |
| qtag 7 | stages 0 1 2 3 4 5 6 | 정의되지 않은 단계의 안내, 실행 오류가 아님 |

실험 태그는 cbxq_제주_14415555_1이었다.
있음 요청 token=cbxq414415653x1x801169,
없음 요청 token=cbxq414415800x2x568211을 각각 응답과 대조했다.
정상 false가 조회 실패·기본값 0·대기 상태로 처리되지 않고 조건문으로 연결됐다.

## 계측과 지연 판정의 범위

PROBES=4는 ready/error/true/false 확인 수다. 요청·ACK·계측·로그 호출은 포함하지 않는다.
READ_TICKS=2는 기존 디코더의 GameTime 차이이며 정확한 벽시계 ms 측정이 아니다.
이를 임의로 고정된 100ms 실행 보장으로 환산하지 않는다.

V4 목록 영상의 142/161probe와 이번 4probe는 서로 다른 조회 내용이다.
태그 한 개의 유무만 필요할 때 목록 전체를 복원하지 않는 좁은 조회의 실용성을 확인했지만,
목록 자체의 2~3초 복원 시간이 이번에 해소됐다고 주장하지 않는다.
현재 두 값의 읽기 결과이며 반복 부하·다른 이름·다른 환경으로 성능을 일반화하지 않는다.

저장값 재사용 단계에는 source상 새 요청·readLive가 없고 화면의 100회 분기도 일치했다.
문구만으로 네트워크 패킷 전체를 별도 추적해 검증했다고 보지 않는다.
정리 완료는 사용자 예제의 출력 확인이며 팩 내부 태그 전체를 게임에서 직접 열거한 검증은 아니다.

## 남은 범위와 운영

- 대표 PASS: 요청 플레이어의 한글 태그 있음·없음, Boolean 조건문, 저장 false 재사용.
- 64단위 이름·특수 기호·예외·만료·취소·소유자 격리는 기존 로컬 검증과 구분한다.
- 임의 엔티티·다른 플레이어 선택자 조회로 확대하지 않는다.
- V5의 시간·규칙·점수·압축 목록 유지 여부는 로컬 회귀 검증이다. 이 영상으로 V5 팩의
  해당 모든 기능을 실게임 재검증했다고 표시하지 않는다.
- 메인 P4 ORDER2H ZERO RESULT ACK 실행팩은 유지, V5는 조회팩이다. 이 영상에 새 P4 실행
  명령 시험이 포함된 것은 아니므로 실행팩 전체의 통합 검증으로 보지 않는다.
- 멀티 실게임은 기능 완성 후 최종 통합 단계라는 사용자 결정을 유지한다.

기록 작성 시 원격 HEAD는 566e7236a4b9ac1f35d3e940faf1c4d7191d784b,
pxt.json.version은 사용자가 변경한 0.0.13이다. 이를 실제 로드 버전으로 단정하지 않는다.
이번 작업은 검증 문서 추가·구현 문서의 현재 상태 갱신만 수행했다.
실행 소스·행동팩·PXT 버전 변경이 없으며 새 Extension 실행 TS·pxt.json.files 등록도 없다.
