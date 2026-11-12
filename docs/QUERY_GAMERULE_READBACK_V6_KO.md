# V6: Registry를 재사용하는 Boolean·정수 게임 규칙 조회

2026-11-12 실게임 추가: dodaylightcycle=false, randomtickspeed=1이 기본 명령의 조회값과
일치했고 조건 분기·계산·저장값 100회 재사용을 대표 GAME PASS로 확인했다.
Boolean은 PROBES=4 READ_TICKS=4, 정수는 PROBES=42 READ_TICKS=20이었다.
상세 범위와 앞선 구성/준비 차단 기록은 VERIFICATION_QUERY_GAMERULE_V6_INGAME_2026-11-12_KO.md를 따른다.

## 구현 범위

`MCFunctionLiveQuery.requestGamerule(rule: MCFunctionGameruleLibrary.GameRuleRef): Ticket`를 추가했다.
기존 GameRuleRef·자료형 Registry·목록 선택 블록을 재사용한다. 별도 게임 규칙 목록이나
사용자 정의 타입을 Extension에 중복 구현하지 않았다.

기존 Kind 0~7과 기존 요청은 유지하고 GameruleBoolean=8, GameruleInteger=9를 추가했다.
전용 요청 블록이 Registry 자료형에 따라 종류를 정하므로 호출자가 Boolean/숫자를 추측하지 않는다.
generic request에서 두 새 Kind를 직접 선택하면 USE_REQUEST_GAMERULE_BLOCK으로 이름 누락을 거부한다.

| Registry 값 | 조회 데이터 처리 |
|---|---|
| Boolean | 기존 Boolean one-hot 응답·QueryReadback.hasBoolean / booleanOr |
| Integer | 기존 점수의 signed 32bit+checksum 복원·hasNumber / numberOr |
| Enum (playerwaypoints) | UNSUPPORTED_GAMERULE_VALUE_KIND, 값 추측·전송 없음 |
| Registry 미등록 값 | UNKNOWN_GAMERULE, 값 추측·전송 없음 |

지원하지 않는 조회를 거부하는 것으로 기존 GameRuleRef의 ID나 명령 AST를 삭제하지 않는다.
기존 .mcfunction 명령의 Direct Input 보존·Validator 정책·컴파일 결과는 바꾸지 않았다.
현재 조회는 Registry의 소문자 명령 ID를 사용한다. 대소문자·다른 별칭을 임의로 보정하지 않는다.

## 행동팩과 API 이름 연결

메시지는 기존 token|op|0|UTF-16 hex 메타데이터 형식을 사용한다.
op는 rule_boolean / rule_integer다. 행동팩은 공식 @minecraft/server GameRule 열거값으로
소문자 명령 ID를 GameRules의 정확한 속성 이름에 연결하고 world.gameRules[property]를 읽는다.
예: dodaylightcycle → doDayLightCycle, randomtickspeed → randomTickSpeed.
새로운 속성 철자를 추측하거나 비슷한 다른 규칙으로 대체하지 않는다.

로컬 설치된 @minecraft/server 2.8.0 선언에는 37개 속성(Boolean 32개, number 5개)이 있고
현재 Registry의 Boolean/Integer와 일치함을 실제 팩·클라이언트 연결 모의 검사로 확인했다.
이것은 사용자의 Education 게임에서 37개 전부를 실측한 결과가 아니다.
실제 API에 속성이 없거나 getter가 예외를 내거나 자료형이 다르면 서버 오류로 반환한다.
미지원·미수신을 0이나 false로 바꾸지 않는다. API number도 유한 signed 32bit 정수인지 확인한다.
기존 규칙 설정 범위를 적용해 현재 값을 임의로 잘라내거나 보정하지 않는다.

정수 전송은 기존 점수 포맷의 부호 bias·32비트·8비트 checksum을 재사용했다.
숫자 직렬화 함수를 행동팩 내부에서 공유하고, 점수의 missing objective/participant 처리는 유지했다.
Boolean 성공 읽기는 4 probe, 정수 게임 규칙은 42 probe를 사용한다.
정수에는 점수 전용 missing marker 2개를 읽지 않는다. 요청·ACK·계측·로그 호출은 probe에 포함하지 않는다.
이 횟수는 로컬 검사로 확인했으며 실게임 지연이나 가능한 최소 비용을 보장하지 않는다.

## 설치 구성

- 새 조회팩: CBX_LIVE_QUERY_DATA_RULE_V6_DEV.mcpack, 팩 버전 0.0.6.
- V5와 같은 조회팩 UUID와 @minecraft/server 2.8.0 의존성을 유지한다.
- DATA_TAG_V5 및 이전 cbxq4 조회팩을 V6로 교체한다. 조회 수신팩을 중복 활성화하지 않는다.
- 메인 CBX P4 ORDER2H ZERO RESULT ACK Receiver DEV 실행팩은 계속 유지한다.
- TRANSPORT PROBE 실험팩은 비활성화한다.
- V6에는 V5 태그·V4 압축 목록·점수·기존 scalar 조회도 포함한다.
- 핑: PING_OK DATA_RULE_V6 scalar/score/lists/own_tag/gamerule.
- 최소 엔진 매니페스트 1.21.0만으로 API 2.8 지원을 보장하지 않는다.

이번 기능은 기존 등록 TS 파일 두 개를 수정했다. 새 Extension 실행 TS와 pxt.json.files 변경은 없다.
PXT 버전은 사용자의 0.0.13을 보존했다. 행동팩 버전과 구분한다.
행동팩 원본·전용 모의 테스트는 별도 ZIP에 제공하고 GitHub에 커밋하지 않는다.

## 사용자 실게임 테스트

확장 소스를 갱신하고 QUERY_GAMERULE_V6_MAKECODE_MAIN.ts 전체를 사용자 프로젝트의 JavaScript에 넣는다.
Extension main.ts에 덮어쓰지 않는다. 게임 규칙·시간·점수·블록·사용자 태그를 변경하지 않는다.

먼저 원래 게임 조회값을 비교 기준으로 확인한다. 값 설정 인수를 붙이지 않는다.

```text
/gamerule dodaylightcycle
/gamerule randomtickspeed
qrule 0
qrule 1
qrule 2
qrule 3
qrule 4
qrule 5
qrule 6
```

한 줄씩 실행하고 각 단계의 출력을 확인한다.

- 0: 준비·새 V6 핑 확인. 이미 진행 중인 요청이 있으면 취소하고 저장 결과 초기화.
- 1→2: 현재 dodaylightcycle 요청·읽기. Boolean과 CYCLE_ON/OFF 분기, 4 probe 기대.
- 3→4: 현재 randomtickspeed 요청·읽기. 숫자와 ADD_10 계산, 42 probe 기대.
- 5: 두 성공 응답을 각각 100번 재사용. Boolean 분기와 숫자 합계 계산에 새 요청·readLive 없음.
- 6: 남은 요청 취소. 테스트가 게임 규칙을 변경하지 않으므로 복원 명령도 없음.

Pending이면 같은 읽기 단계 2 또는 4를 나중에 다시 입력한다. 이전 요청이 열린 상태에서
새 요청으로 덮어쓰지 않는다. 값이 0·false여도 hasNumber/hasBoolean이 참이면 정상 데이터다.
오류·대기 상태면 저장된 성공값을 덮어쓰지 않고 새 값이 없음을 출력한다.
저장값은 과거 스냅샷이며 최신값이 필요하면 명시적으로 다시 요청한다.
조회 사이에 월드의 다른 코드가 규칙을 바꾸면 서로 다른 시점의 값일 수 있다.
사용자가 앞서 시간을 멈췄다는 이유로 false를 고정 기대값으로 넣거나 현재 규칙을 바꾸지 않았다.

## 검증 결과와 한계

| 선택한 로컬 검사 | PASS 수 |
|---|---:|
| 새 게임 규칙 클라이언트/실제 디코더 | 25 |
| 실제 V6 팩 소스→디코더·공통 응답 (API·스케줄러 모의) | 120 |
| 기존 태그 조회 | 21 |
| 목록 wire | 26 |
| 숫자·점수 wire | 29 |
| 공통 응답 | 14 |
| ZERO ACK | 9 |
| 합계 | 244 |

새 검사는 37개 API 속성 전체의 Registry 타입 연결, true/false와 정수 0·경계값,
정확한 API 철자, 스냅샷·명시적 새 조회·무조회 재사용, getter 예외·속성 없음·자료형 불일치,
잘못된 메타데이터·체크섬·취소·미지원 규칙 거부를 포함한다.
숫자 wire 경계값 모의 검사는 해당 게임 규칙을 그 값으로 설정할 수 있다는 의미가 아니다.

TypeScript 5.7.3 의미 검사: 기존 52→52, 신규 진단 0. 사용자 예제 진단 0.
실제 @minecraft/server 2.8.0 타입을 이용한 행동팩 JS 검사 진단 0.
전체 PXT 컴파일은 미수행이다. 최초 구현 시점의 새 기능 실게임·성능은 미검증이었고,
이후 위 추가 기록의 두 규칙과 조건·계산·저장 재사용만 대표 실게임 PASS로 확인했다.
이전 V5 한글 태그 대표 GAME PASS와 새 V6 팩 전체의 GAME PASS는 구분한다.
멀티 실게임은 기존 사용자 결정대로 기능 완성 후 최종 통합 단계에서 수행한다.

공식 근거와 대조 대상:
- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/gamerules?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/gamerule?view=minecraft-bedrock-stable
- 로컬 @minecraft/server 2.8.0 index.d.ts, 기존 registry/source/bedrock/gamerules.json.

현재 웹 문서에 미리보기 속성이 추가돼 있더라도 설치된 2.8.0과 현재 Registry에 없는
Enum 값을 이번 구현의 지원 범위에 포함하지 않았다.
