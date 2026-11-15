# 등록 후 스모크 무응답 진단

## 관측

사용자: smping은 응답, cbx_ff1 목표 생성 완료, smoke 실행은 무응답. image(20261115-125557).png에서 smcalc OK, smnest1warning Execution allowed, smoke1info Execution allowed 및 smoke? → DIAG smoke E0 W0 I1, Diagnostic only:not executed 확인. 등록 완료 후 smoke를 다시 입력해도 응답이 없다고 보고했다. 실제 실행/ACK 스모크는 미통과이며 지연 위치는 아직 미확인이다.

## 진단용 전체 사용자 코드

tests/CHUNK_FUNCTIONFILES_SMOKE_DIAG_MAIN.ts 전체로 사용자 JavaScript를 교체한다. Extension main.ts에 덮어쓰지 않는다. 교체로 실행이 새로 시작되므로 기존 요청의 상태를 복구하는 진단은 아니다. 같은 증상 재현 시의 저장 상태를 읽는다. 진단 전용이며 JavaScript로 유지한다. 내부 상태 API가 있어 블록 전환 대상으로 안내하지 않는다.

함수 정의 안내 후 smgo를 한 번 입력한다. 이는 FunctionFile.runPreview("smoke")를 호출해 기존 실행 경로로 진입하며, 진입 전 게임 출력이나 GameTime 요청을 추가하지 않는다. 호출 직전에 로컬 phase=CALL, 반환 후 RETURN을 저장하고 반환 메시지에 found 값을 표시한다. CALL 상태에서 다시 smgo를 입력하면 추가 실행을 차단한다.

아무 결과가 없으면 smstate를 한 번 입력해 화면을 보존한다. 원래 smoke를 추가 입력하지 않는다. smstate는 기존 getter로 phase/lastClockStage/lastOrderedAck/lastOrderedRequestId를 읽어 snapshot을 한 줄로 player.say한다. 실제 GameTime 재조회나 player.execute를 하지 않는다. 이벤트 처리와 최종 채팅 전달 자체는 지연될 수 있으므로 무응답만으로 단계 판정하지 않는다. snapshot은 진단 이벤트가 처리된 시점의 상태다.

- phase=CALL, clock=ENTER_CLOCK_WAIT: 실행 전송 함수의 첫 GameTime 조회가 아직 반환하지 않은 순간.
- clock=PLAN_READY_CLOCK_WAIT 등: 해당 지점 GameTime 조회 반환 대기.
- clock=PREPARED: nonce 준비가 끝난 뒤이며 첫 begin/part/commit 전송부터 TRANSFER_RETURN 시계 표시 전까지의 구간을 포함. 이 값만으로 수신기 수신 완료를 단정하지 않는다.
- clock=VERIFY_ENTER: ACK 확인이 진행 중인 구간일 수 있음. 시계 조회 전후 WAIT 접미사와 구분한다.
- clock=VERIFY_EXIT, phase=RETURN, ack=2: 호출 반환 및 DONE 상태 확인. 실제 BEGIN/NEST/PASS 출력·점수 검사 결과도 함께 본다.
- clock=NOT_ENTERED는 마지막 저장 시계가 진입하지 않았다는 뜻이며 handler 미실행/초기화/컴파일 전 대기 등을 단독 구분하지 못한다.
- found=false는 이 실행 시점에 지역 함수 이름을 찾지 못했다는 뜻이다.

기존26명령·지역 함수·중첩 execute·점수17/33·실행ON6회는 유지한다. 상태 이벤트 등록 두 개가 추가되므로 원래 스모크의 성능 대조 자료로 사용하지 않는다.

## 변경과 검증

현재 master3ff7fe5c8aa4c14fae3da0f4933f5dfd5b9b4f81은 앞선c01b721의 PXT 버전만0.0.22로 사용자가 변경한 커밋임을 확인했다. pxt.json은 이번 변경에 포함하지 않는다. 런타임/행동팩 수정·릴리즈 생성 없음. 시험TS/Node 검사/이 문서만 추가하므로 pxt.json.files 추가도 필요 없다.

TypeScript ES5+실제 FunctionFile/Compiler/로컬 수신기 모의 실행 통과: 같은26명령, 점수33, ACK2, ON6회, CALL 및 ENTER_CLOCK_WAIT 스냅샷, RETURN 및 VERIFY_EXIT 스냅샷 확인. smstate가 추가 시계/native 실행을 하지 않음 확인. Minecraft PXT target2.2.10/core13.2.19 컴파일 diagnostics0. 실게임에서 대기 중 smstate 이벤트가 처리될지는 미검증이다.
