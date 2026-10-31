# P1b AUTO 명령 라우팅 요약

이 표는 코드 정책으로, 신규 실게임 PASS 보고서가 아니다.

| 명령 유형 | P0 확인 | AUTO 분류 | 현재 실행 | 검증 요청 |
|---|---|---|---|---|
| SAY, GIVE, TP, KILL 등 직접 명령 | 대표 변형 DIRECT | Direct | MakeCode | 회귀 1회 |
| SETBLOCK/FILL 블록 상태 | Preview 전용 직렬화 필요 | Direct | MakeCode 기존 Serializer | 블록 상태 1회 |
| Modern EXECUTE (구조화 블록) | player.execute FAIL, 브리지 시험 사례 | BridgeRequired | CBXCORE SELECTIVE | 명령 효과 직접 확인 |
| SUMMON Rotation/Facing | EMULATED PASS | MakeCodeAdapter | 기존 TP 보완 | 변경 없음 |
| SPAWNPOINT 생략/상대 | MakeCode 지원 실패 기록 | BridgeCandidate | CBXCORE SELECTIVE | 브리지 실제 스폰 변경 미검증 |
| Raw Command | 원본 보존·다양한 사례 혼재 | BridgeCandidate | CBXCORE SELECTIVE | 개별 명령별 검증 필요 |
| TIME QUERY | 원시 출력 HIDDEN, Preview 보완 | ReadbackPending | 기존 Preview | P2 API 결과 반환 |
| GAMERULE query / 무인수 전체 목록 | OUTPUT_HIDDEN | ReadbackPending | 기존 Preview | P2 실시간 값/목록 반환 |
| SCOREBOARD objectives list, players list, players test | 부분/세션 목록 | ReadbackPending | 기존 Preview | P2 완전 조회 |
| TAG list | SESSION_KNOWN | ReadbackPending | 기존 Preview | P2 전체 태그 조회 |
| 단독 /list (Raw) | Bridge 실행 PASS; 목록 수신 미검증 | BridgeCandidate | 브리지로 명령 요청 | P2 플레이어 배열 수신 |
| FunctionFile 안 혼합 명령 | 순서 보장 설계 미완료 | P3 pending | AUTO 적용 보장 없음 | P3 이후 |
| tick.json | 전용 Worker 미검증 | P4 pending | 변경 없음 | P4 이후 |

## 의도적으로 보류한 사항
- 기존 FunctionFile 함수 등록 및 tick 스케줄러 수정 없음
- 브리지 결과 조회의 ACK 대기 루프 추가 없음
- 행동팩 Script API 수정 없음
- `.mcfunction` export 문법 수정 없음
