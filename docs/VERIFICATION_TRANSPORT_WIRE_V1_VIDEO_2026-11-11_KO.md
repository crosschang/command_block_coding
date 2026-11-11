# 메시지 반환 후보 V1 영상 결과와 V2 대조 시험

근거: 사용자 영상 `2026-11-11 22-20-27.mp4`, 약 56.42초.
TRANSPORT_PROBE_V1_MAKECODE_MAIN.ts와 CBX TRANSPORT PROBE V1 DEV의 로그를 대조했다.
영상에서 각 상태를 직접 확인했다. 정확한 Education/PXT 게임 빌드와 실제 로드 커밋은 미확인이다.

## 관찰과 판정

| 시험 | 실제 화면 | 판정 |
|---|---|---|
| qlatlocal | LOCAL_HITS=1, ARGS=빈 값, RAW=빈 값 | 내부 이벤트 대표 PASS, 문자열 접근 실패 관찰 |
| qlatwire 1 / sendMessage | payload 표시, SENT mode=1, CHAT=0 TELL=0 | 송신 표시 확인, 시험 관찰 구간의 수신 이벤트 없음 |
| qlatwire 2 / tellraw | payload 표시, SENT mode=2, CHAT=0 TELL=0 | 송신 표시 확인, 시험 관찰 구간의 수신 이벤트 없음 |
| qlatwire 3 / tell | 귓속말 표시, SENT mode=3, CALLBACK=TELL, CHAT=0 TELL=1 | 이벤트 도착 대표 PASS |
| mode 3 데이터 | ARGS=빈 값, RAW=빈 값, MATCH_ARGS=false MATCH_MESSAGE=false | 원문 복원·변수 저장 미성공 |
| mode 3 오류 | 0개 인수가 필요한데 1개를 받았다는 인수 오류 | 오류 보존, 원인 미확정 |

각 STATUS에서 ARGS_OK=false MESSAGE_OK=false, STORED_TEXT=빈 값 STORED_NUMBER=0이었다.
저장값 0은 초기값이며 성공적으로 수신한 점수 0으로 해석하지 않는다.

요청 토큰은 mode 1 lat14375788x1, mode 2 lat14376084x2, mode 3 lat14376233x3이었다.
전송·표시 성공, 이벤트 실행, 데이터 사용 성공을 분리한다.
이번 세 모드로 문자열 직접 반환을 완성했다고 볼 수 없다. 특히 내부 대조 시험도 빈 값이므로
현재 테스트만으로 행동팩→MakeCode 데이터 수신의 절대적 불가능을 확정하지 않는다.

## 원문 접근 순서의 후보 원인

앞서 확인한 공식 배포 소스(target 2.2.10 / PXT 13.2.19)의 core/ns.ts에서
onChat은 사용자 콜백 전에 getChatArgs(command)를 읽고 parseInt로 숫자 변환한다.
core/sims.d.ts에는 onChatCommandCore(command, handler), getChatArgs(command), message()가 선언돼 있다.

공식 배포 소스:
https://cdn.makecode.com/blob/253ec387ffb1050bd0b6f99e63b1ce7d5a503f7e/target.js

먼저 읽은 인수가 소비되는지, 현재 게임에서 해당 원문 API가 어떤 값을 제공하는지는
실게임으로 검증하지 못했다. 원인 후보일 뿐 빈 값의 확정 원인으로 기록하지 않는다.
배포 소스 버전과 사용자의 실제 로드 버전이 같다고 단정하지 않는다.

## 준비한 V2 시험

별도 사용자 프로그램 TRANSPORT_CORE_PROBE_V2_MAKECODE_MAIN.ts를 준비했다.

- cbxlatlocal과 cbxlatwire만 숫자 변환용 onChat 래퍼 대신 onChatCommandCore로 등록.
- 이벤트에서 getChatArgs를 먼저 읽고 message를 읽은 다음 로그를 출력.
- 내부 대조 결과에 ARGS_OK를 추가하고 정확한 -7 / 000_제주 일치를 확인.
- 정식 QueryReadback·ACK에는 연결하지 않고 V1 실험팩은 그대로 유지.
- 기존 호출 비용 측정을 반복할 필요 없이 qlatlocal → qlatwire 3 → qlatstatus로 확인.
- TELL=1만으로 저장 성공으로 보지 않으며 ARGS_OK와 저장된 문자열·숫자를 함께 확인.

공식 선언에 있는 내부 API를 실험하는 단계이며 정식 공개 블록 API로 채택한 것이 아니다.
새 API 이름이나 지원되지 않는 명령 문법을 만들어 넣지 않았다.

## 검증과 변경 범위

V2 로컬 모의 검사 8개 PASS: 원문 핸들러 등록·인수 먼저 읽기·로그 전 캡처·원문 저장·
TELL 별도 기록·빈 응답과 다른 토큰 거부·잘못된 모드 거부.
모의 검사는 인수를 소비하는 가설 모델을 사용했으며 실제 호스트 구현의 증거가 아니다.
공식 배포 API 일부 선언으로 TypeScript 5.7.3 정적 검사 진단 0개.
전체 PXT 컴파일과 V2 실게임·지연 개선은 미검증이다.

V1 결과는 수정·삭제하지 않고 보존한다. 이번 정식 저장소 변경은 문서뿐이다.
사용자 테스트 코드·전용 모의 검사는 별도로 제공하고 행동팩 소스는 커밋하지 않는다.
새 행동팩·Extension 실행 TS 파일은 없으며 pxt.json.files 수정도 필요 없다.
pxt.json.version은 자동 변경하지 않는다. 멀티 실게임은 기존대로 최종 통합 단계다.
