# TIME QUERY 정식 블록 + Preview Live Query Adapter (0.0.49)

기준: 2026-10-14, `command_block_coding(20261014-062303).zip`, version `0.0.49`.
이 통합 패치에는 앞서 제공한 CAMERA BASIC 패치가 함께 포함된다. 둘 중 하나만 적용했거나 아직 둘 다 적용하지 않은 환경에서 동일한 최신 패치를 사용할 수 있도록 파일 충돌을 회피했다.

## 반영 범위

- `MCFunctionAST.TimeAction.Query` 추가. 새 `TimeQueryKind`는 DayTime/GameTime/Day이며 기존 `TimeAction` 번호는 변경하지 않음.
- `Command.timeQuery(...)` MakeCode 문장 블록 추가, 기존 TIME SET/ADD는 보존.
- Compiler는 **표준** `time query daytime` / `time query gametime` / `time query day`를 생성.
- Definition Validator: `TIME_QUERY_KIND_INVALID` ERROR 차단.
- Preview Query Adapter는 `gameplay.timeQuery(TimeQuery.*)`로 실제 수치를 읽고 기존 `previewSay()` / `tellraw`에 연결. 별도의 값 캐시 또는 추정치를 반환하지 않음.
- `pxt.json.version = 0.0.49` 그대로 유지. 테스트 파일은 `pxt.json`에 등록하지 않음.

## 근거와 검증 경계

- 사용자 Minecraft Education 26.32 실측: DayTime 6000 / 직접 `/time query daytime` 6000, GameTime 양쪽 비교 시 약 227틱 차이(시간 경과), Day 0 / 직접 0.
- 이 검증은 **MakeCode 기본 `gameplay.timeQuery()` API**에 대한 기존 사용자 실측이며 이번 **Extension 통합 패치의 신규 실게임 검증은 별도**.
- 로컬 `tsc` 정적 검사에는 Minecraft MakeCode 전용 API를 선언한 테스트 전용 스텁을 사용. 공식 MakeCode/PXT 컴파일과 동등하지 않음.
- 로컬 컴파일러/Validator/Preview 시뮬레이션 26개 PASS. 실제 게임에서는 기존 MakeCode Blocks 변환과 채팅 결과 확인 필요.
- `time query day` / `gametime` 등의 표준 명령은 실제 `.mcfunction` 출력. Preview에서만 `tellraw`가 추가 출력으로 실행된다.
- GAMERULE/TESTFOR 등의 Query Adapter는 변경하지 않음.
