# V6 게임 규칙 데이터 조회 대표 실게임 검증

근거: 사용자 영상 `2026-11-12 14-19-23.mp4`, 약 44.18초.
QUERY_GAMERULE_V6_MAKECODE_MAIN.ts와 기본 /gamerule 출력·V6 핑·응답을 대조했다.
프레임 요약 및 개별 프레임을 직접 확인했다. 정확한 Education/PXT 게임 빌드와
실제 로드된 Extension 커밋은 미확인이다.

## 실제 관찰

| 단계 | 기본 명령/화면 결과 | 판정 |
|---|---|---|
| 기본 조회 | dodaylightcycle=false, randomtickspeed=1 | 이번 영상의 원래 값 기준 확인 |
| qrule 0 | PING_OK DATA_RULE_V6 scalar/score/lists/own_tag/gamerule, READY=true READ_ONLY | 준비·V6 응답 대표 GAME PASS |
| qrule 1→2 | kind=rule_boolean value=false, STATE=1 REASON=OK, BOOLEAN=false BRANCH=CYCLE_OFF | 기본값과 일치·Boolean 조건 사용 대표 GAME PASS |
| qrule 3→4 | kind=rule_integer value=1, STATE=1 REASON=OK, NUMBER=1 ADD_10=11 BRANCH=NONZERO | 기본값과 일치·숫자 계산 대표 GAME PASS |
| Boolean 읽기 | PROBES=4 READ_TICKS=4 | 이 입력·환경의 실측 |
| 정수 읽기 | PROBES=42 READ_TICKS=20 | 이 입력·환경의 실측 |
| qrule 5 | STORED_BOOLEAN=false TRUE_BRANCHES=0 FALSE_BRANCHES=100 | 저장 Boolean 100회 재사용 대표 GAME PASS |
| qrule 5 | STORED_NUMBER=1 SUM_100=100 | 저장 숫자 100회 계산 대표 GAME PASS |
| qrule 6 | CANCEL_DONE; world rules were not changed | 종료 단계 표시 확인 |

Boolean 토큰 cbxq414505147x1x660508과 정수 토큰 cbxq414505265x2x573527을
각 요청·응답과 대조했다. false가 실패 기본값이 아니라 Ready 상태의 실제 데이터로
조건문에 연결됐고, 정수도 채팅 문자열 추출 없이 공통 응답으로 계산에 사용됐다.

## 계측과 검증 범위

PROBES는 Boolean 태그 확인 횟수이며 요청·ACK·계측·로그 호출은 포함하지 않는다.
READ_TICKS는 디코더의 GameTime 차이이며 정확한 벽시계 ms나 API 내부만의 실행 시간이 아니다.
4/20틱을 고정된 지연 보장이나 모든 게임 규칙의 속도로 일반화하지 않는다.

이번 대표 PASS는 Boolean dodaylightcycle=false와 Integer randomtickspeed=1이다.
다른 35개 규칙, 정수 0·경계값, Boolean true, 미지원/예외·만료/취소·부하의 실게임 결과는
이 영상에서 확인한 것이 아니다. 해당 기존 로컬 검사와 실제 게임 검증을 구분한다.
V6 팩의 이전 태그·점수·압축 목록 기능 전체를 재검증한 영상도 아니다.

저장값 재사용 단계의 소스에는 새 요청·readLive 호출이 없고 화면의 분기·합계도 일치했다.
문구만으로 네트워크 패킷 전체를 별도 추적했다고 표시하지 않는다.
기본 /gamerule 두 명령과 테스트 프로그램 모두 조회만 수행한다. 이 테스트에서 규칙을
복원하기 위해 임의의 설정 명령을 넣을 필요는 없으며, 다른 월드 코드의 동작까지 검증한 것은 아니다.

## 앞선 시도 보존

| 근거 | 관찰 | 해석 |
|---|---|---|
| 2026-11-12 08-54-41.mp4 | V6 사용자 코드 시작, PING_OK DATA_TAG_V5, REJECT invalid query metadata, Pending·후속 요청 차단 | 당시 응답한 조회팩은 V5. 새 규칙 조회 실게임 성공이 아닌 호환 구성 차단 |
| image(20261112-051725).png | qrule 0 없이 1부터 실행, run qrule 0 first, request kind missing or mismatch, 저장값 없음 | 준비 단계 미수행. 데이터 조회 성공으로 보지 않음 |
| 2026-11-12 14-19-23.mp4 | 기본값 확인·qrule 0·V6 핑 후 정상 반환 | 이번 대표 PASS 근거 |

앞선 차단·무응답을 예열 효과나 서버 API 실패로 바꾸지 않는다. 이번 성공으로 이전
관찰을 삭제하거나 모든 설치 구성에서 정상 동작한다고 확대하지 않는다.

## 운영과 소스 기준

메인 CBX P4 ORDER2H ZERO RESULT ACK Receiver DEV는 유지하고 조회팩은 V6로 사용한다.
이 영상에 별도의 P4 명령 실행 검증이 포함된 것은 아니므로 전체 통합 PASS로 보지 않는다.
멀티 실게임은 기능 완성 후 최종 통합 단계라는 사용자 결정을 유지한다.

기록 작성 시 원격 HEAD는 b4d8ca39effb26383cb41f74e4726c62c117bc06,
pxt.json.version은 사용자 변경값 0.0.14다. 이를 실제 로드 버전으로 단정하지 않는다.
이번 작업은 검증 문서 추가와 구현 문서의 상태 갱신만 수행했다.
실행 소스·행동팩·PXT 버전 변경이 없고 새 Extension 실행 TS·pxt.json.files 등록도 없다.
