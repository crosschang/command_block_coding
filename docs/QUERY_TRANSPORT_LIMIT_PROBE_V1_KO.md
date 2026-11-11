# Boolean 읽기 비용과 직접 문자열 수신 후보 조사

## 출발점과 현재 판정

V4 태그 두 페이지는 원문·한글·계산·조건·저장 대표 실게임 PASS지만 표시 대기는 약
2.25~2.75초 / 2.5~3.0초다. PROBES 실측은 142/161, READ_TICKS는 48/55였다.
근거는 `VERIFICATION_LIST_HUFF_V4_VIDEO_2026-11-11_KO.md`다.

현재 경로는 player.execute(testfor)의 Boolean 결과로 비트를 복원한다. 많은 호출이
주요 비용 후보지만, 아직 Minecraft/Script API 전체의 성능 한계로 단정하지 않는다.
압축을 더 복잡하게 만들기 전에 호출 수 변화와 반환 경로를 분리해 실험한다.

## 공식 자료 조사

조사일: 2026-11-11. 공식 사이트의 HTML이 참조한 배포 target.js를 확인했다.

- 사이트: https://minecraft.makecode.com/
- 배포 소스: https://cdn.makecode.com/blob/253ec387ffb1050bd0b6f99e63b1ce7d5a503f7e/target.js
- 배포 메타데이터: target 2.2.10, PXT 13.2.19,
  소스 커밋 590bd3592b079417d991a0e3d2aeb17a53402808.
- 공식 문서: https://minecraft.makecode.com/reference/player/on-chat-command
- 공식 문서: https://minecraft.makecode.com/reference/player/on-tell-command
- 공식 문서: https://minecraft.makecode.com/reference/player/execute

공식 문서의 GitHub 편집 링크는 조회 당시 404였다. 위 공식 배포 소스로 선언과
공개 래퍼를 확인했으며 사용자의 실제 게임 로드 버전이 같다고 단정하지 않는다.

| 확인한 경로 | 배포 소스의 내용 | 판정 범위 |
|---|---|---|
| player.execute | boolean 반환, executeAsync shim | 이 경로로 임의 명령 결과 문자열을 직접 반환하는 API는 아님 |
| player.onChat | getChatArgs(command)의 문자열을 parseInt 후 공개 콜백으로 전달 | 공개 숫자 인수와 내부 문자열 인수를 구분 |
| player.getChatArgs | string[] 반환 선언 | 행동팩 메시지가 해당 이벤트로 들어오는지는 미검증 |
| player.message | 마지막 메시지 string 반환 선언 | 임의 Script API 메시지가 잡히는지는 미검증 |
| player.onTellCommand | 인수 없는 콜백 | 메시지 상태를 별도 읽을 수 있는지 실험 필요 |

확인한 bundled core TypeScript에는 scoreboard/getTags/scriptevent를 직접 읽는
반환 API가 발견되지 않았다. 검색 범위의 결과이며 모든 런타임 기능의 부재 증명은 아니다.
문자열 수신 후보가 있으므로 'MakeCode는 무조건 1비트만 받을 수 있다'로 일반화하지 않는다.

## 분리된 실험 준비

정식 Extension 실행 소스·V4 조회팩은 수정하지 않았다. 사용자 MakeCode 프로그램과
별도 실험팩은 저장소 외부 파일로 제공한다. 행동팩 소스·전용 테스트는 커밋하지 않는다.

### 호출 비용

- qlatinit으로 참/거짓 반환을 검증.
- qlat N: N=0,1,32,64,128만 허용. 태그의 존재/부재 조건을 교대로 읽고 각 값도 검증.
- 0/32/64/128은 순서를 바꿔 각 3회 측정하도록 안내.
- BEGIN/END 영상 표시 간격과 GameTime 틱 차이를 기록. N=0은 계측의 공통 비용 기준.
- 시간·규칙·점수·태그·블록을 변경하지 않으며 자동 Worker·재시도 없음.
- 단순 확인 호출 실험이므로 목록 디코더 전체 비용까지 측정했다고 해석하지 않음.

### 문자열 후보

- MakeCode 내부 runChatCommandWithArguments로 문자열 접근 기준을 먼저 확인.
- 별도 cbxlat:req 실험팩이 요청 플레이어에게 고정 토큰·-7·000_제주를 전송.
- sendMessage / tellraw @s / tell @s 세 경로를 각각 시험.
- 메시지 표시, 송신 반환, 이벤트 실행, 원문 일치, 변수 저장을 각각 보고.
- 로그 전에 원문·인수를 캡처하며 다음 모드 시작 시 카운터와 값 초기화.
- 실험 데이터는 정식 QueryReadback/ACK에 연결하지 않음. 채팅의 인증·소유자 격리가
  검증됐다고 가정하지 않으며 현재 토큰 일치만으로 신뢰 가능한 프로토콜이라고 보지 않음.

## 팩 구성과 적용 범위

실험팩 CBX TRANSPORT PROBE V1 DEV는 독립 UUID, 팩 버전 0.0.1,
@minecraft/server 2.8.0 의존성이다. 기존 DATA_HUFF_V4와 P4O2H ZERO ACK는 유지하고
실험팩만 추가한다. 종료 시 실험팩만 비활성화한다. 기존 cbxq4 수신팩을 교체하지 않는다.
최소 엔진 매니페스트 1.21.0만으로 Script API 2.8 지원을 보장하지 않는다.

사용자 프로그램은 사용자 MakeCode JavaScript에 적용하며 Extension main.ts에 덮어쓰지 않는다.
새 Extension 실행 TS 파일 없음, pxt.json.files 변경 불필요, 사용자 버전 0.0.11 보존.

## 수행한 검사와 남은 검증

- 로컬 모의 검사 18개 PASS: 정확한 호출 수·참/거짓 확인·교정 실패 차단·잘못된 입력 거부·
  로그 전 캡처·토큰 불일치·카운터 초기화·고정 송신 경로·예외 처리.
- TypeScript 5.7.3 + 공식 배포 소스에서 추출한 API 일부 선언 검사: 진단 0개.
- 실제 @minecraft/server 2.8.0 타입을 이용한 행동팩 JS 검사: 진단 0개.
- 전체 PXT 컴파일: 미수행. 실제 Minecraft 호출 비용·메시지 이벤트 전달: 미검증.
- 멀티 실게임: 사용자 결정대로 기능 완성 후 통합 단계.

N에 따라 대기가 비례하면 확인 호출 비용의 근거로 삼는다. 후보 메시지가 변수로
수신되면 정식 교체 전에 소유자·토큰·오래된 응답·길이·변조·다중 메시지를 검증한다.
세 후보가 실패해도 모든 수신 방법의 불가능으로 확대하지 않으며, 기존 V4와 검증을
보존하고 필요한 데이터만 조회·수신값 재사용을 우선한다.
