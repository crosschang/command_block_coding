# Fake Player의 # 유무 대조

사용자 제공 image(20261115-223204).png에서는 '#sm_r'에 기록된 점수가 없다는 게임 응답이 확인됐다. 이 응답은 이름의 # 문법 오류나 전송 손상의 증명이 아니다. 초기 set 결과가 해당 점수에 남아 있지 않은 상태로 기록한다. 사용자 가설을 확인하기 위해 기존 진단 시험의 Fake Player 세 이름에서만 #을 제거한다.

## 적용

tests/CHUNK_FUNCTIONFILES_SMOKE_NO_HASH_MAIN.ts 전체를 MakeCode 사용자 JavaScript에 교체하고 JavaScript 상태로 실행한다. 확장 업데이트나 행동팩 교체 없이 현재 복원 런타임과 행동팩0.0.6을 그대로 사용한다. 기존 cbx_ff1 목표도 유지한다. Extension main.ts에 덮어쓰지 않는다. 기존 요청은 교체 시 새 실행이 되므로 그 이전 요청 상태를 보존·조회하는 시험은 아니다.

함수 정의 완료 후 smgo를 한 번 입력한다. 정상 결과는 SMOKE_BEGIN → SMOKE_NEST_OK → SMOKE_PASS_33 및26단계 DONE/ACK2, SMOKE_DIAG_RETURN found=true다. 무응답이면 smstate를 한 번 입력하고 화면을 보존한다. 그것도 무응답이면 반복 입력을 중단한다. 게임 직접 조회를 할 때는 이번 이름을 사용한다.

```text
/scoreboard players test sm_r cbx_ff1 33 33
```

이름만 다음과 같이 바꾼다.

| 원본 | 대조본 |
|---|---|
| #sm_i | sm_i |
| #sm_t | sm_t |
| #sm_r | sm_r |

명령 순서·함수 구성·26단계·입력7/10·결과17/33·지역 함수 펼치기·중첩 execute·실행ON6회·진단 이벤트는 동일하다. 이름 길이가 줄어 인코딩 길이/해시/조각 수는 자연스럽게 달라진다. 원본 # 시험과 기록을 보존한다. 이 대조본이 성공해도 #을 제거하는 것을 제품 수정으로 채택하거나 주석 처리 원인을 확정하지 않는다. 예열·실행 순서·전송 길이 차이를 추가 확인해야 한다.

## 검증

작업 전 실제 master db5400a0a1ba0e0fe819e10284ccc13b6ad9f3bb, pxt.json.version0.0.22, 원본 진단 시험의 Git blob d1ae05af2cc96db0b8b6036ee89b047da43e463a를 확인했다.

chunk_smoke_no_hash_mock.cjs는 원본과 세 이름 치환 외 차이가 없음을 검사하고, 기존 진단용 전체 Extension/FunctionFile/실제 로컬 수신기 모의 환경으로26단계·중첩 execute·점수33·ACK2·ON6회·읽기 전용 상태 스냅샷을 검사한다. TypeScript ES5 및 해당 모의 검사 통과. Minecraft PXT target2.2.10/core13.2.19 컴파일 diagnostics0. 실게임 대조 결과는 미검증이다.

시험TS·Node 검사·문서만 추가한다. 기존 원본·런타임·행동팩·pxt.json은 수정하지 않는다. pxt.json.files 등록 추가도 불필요하며 릴리즈는 생성하지 않는다.
