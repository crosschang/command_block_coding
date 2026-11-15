/**
 * STARTUP BOTTLENECK MASTER — MakeCode 사용자 JavaScript 전체 코드.
 * master 통합 계측 기능을 이 시험 파일에서만 명시적으로 켠다. 별도 브랜치 불필요.
 * 아까의 정상 출력 제거 수정 이전 edcb16c / PXT 0.0.17 기준. 버전 변경 없음.
 * 행동팩 교체/목표 생성/실제 명령 실행이 필요 없는 시작 병목 시험이다.
 * 이 프로그램은 FunctionFile 실행을 차단한다. PASS/ACK 시험 코드가 아니다.
 *
 * 아래 mode 숫자만 바꿔 매번 같은 파일 전체를 새로 실행하고 녹화한다.
 * 0=원래 경로 모두 수행 (비교 기준)
 * 1=채팅 이벤트 실제 등록만 생략
 * 2=함수/명령 내부 배열 저장만 생략
 * 3=정의별 자동 안내 출력만 생략 (비교용이며 정식 수정 아님)
 * 4=진단 정리 + 채팅 등록 생략
 * 5=검사 + 진단 정리 + 채팅 등록 생략
 *
 * 비교쌍: 0/1=채팅등록, 0/2=내부저장, 0/3=출력, 1/4=진단정리, 4/5=검사.
 * 먼저 0과1을 비교하고, 필요시4와5까지 진행한다.
 * 검사 단계에는 Core Validator와 Preview compatibility 검사가 포함된다.
 * 마지막 BENCH_READY / BENCH_SKIP는 호출 횟수(UNIT=CALLS)이며 ms가 아니다.
 * 영상에서 같은 게임 복귀 지점부터 BENCH_READY 첫 표시까지 비교한다.
 * 출력 자체의 지연/이벤트 등록의 후속 영향이 섞일 수 있으므로 한 번으로 원인 확정 금지.
 * 같은 파일/순서/블록/함수수/실행 환경 유지. 시험 중 C를 다시 열지 않는다.
 * 모드 변경 후 프로그램을 새로 실행해야 함. 실행 중 채팅으로 모드를 바꾸지 않는다.
 * 월드 재접속으로 좋아진 결과를 동일 비교의 해결 판정으로 기록하지 않는다.
 * 0→1→0, 1→4→1, 4→5→4처럼 순서를 되돌려 예열 영향을 확인한다.
 *
 * 계측용 게임 시간 조회/추가 pause/heartbeat 없음. 수신기 실행 ON 코드는 변경하지 않음.
 * WARNING/INFO 보존은 mode0/1/2/3에서 확인. mode4/5는 의도적으로 진단도 생략한 비교본.
 * mode5는 검사를 하지 않은 시험이며 정상/안전 판정으로 쓰면 안 된다.
 * 로컬 타입/모의 검사와 PXT·실게임 검증은 구분한다.
 */

StartupProbe.begin(0)

FunctionFile.define("ffcheck", function () {
    Command.scoreboard(Command.scoreboardPlayersTest(Command.scoreboardFakePlayer("#r"), "cbx_ff1", "17", "17"))
    Command.say("FF_SCORE17_OK")
})
FunctionFile.define("ffready", function () {
    Preview.ready()
})
FunctionFile.define("ffsetup", function () {
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("#i"), "cbx_ff1", 7))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("#t"), "cbx_ff1", 10))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 0))
})
FunctionFile.define("ffcalc", function () {
    Command.scoreboard(Command.scoreboardPlayersOperation(Command.scoreboardFakePlayer("#r"),
        "cbx_ff1", Command.ScoreboardOperatorChoice.Assign, Command.scoreboardFakePlayer("#i"), "cbx_ff1"))
    Command.scoreboard(Command.scoreboardPlayersOperation(Command.scoreboardFakePlayer("#r"),
        "cbx_ff1", Command.ScoreboardOperatorChoice.Add, Command.scoreboardFakePlayer("#t"), "cbx_ff1"))
})
FunctionFile.define("ffnest", function () {
    Command.execute(Command.executeIfScore(Command.ExecutePolarity.If,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", MCFunctionFields.rangeMinMax(17, 17), Command.executeEnd()),
        MCFunctionExecuteRun.nestedExecute(Command.executeIfScore(Command.ExecutePolarity.Unless,
            Command.scoreboardFakePlayer("#r"), "cbx_ff1", MCFunctionFields.rangeMinMax(18, 18), Command.executeEnd()),
            MCFunctionExecuteRun.nestedExecute(Command.executeIfScore(Command.ExecutePolarity.If,
                Command.scoreboardFakePlayer("#r"), "cbx_ff1", MCFunctionFields.rangeMinMax(17, 17), Command.executeEnd()),
                MCFunctionExecuteRun.tag(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()), "cbx_ff_ok"))))
})
FunctionFile.define("ffflow", function () {
    Command.say("FF_BEGIN")
    Command.mcFunction("ffcalc")
    Command.mcFunction("ffnest")
    Command.say("FF_END")
})
FunctionFile.define("fffalse", function () {
    Command.execute(Command.executeIfScore(Command.ExecutePolarity.If,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", MCFunctionFields.rangeMinMax(99, 99), Command.executeEnd()),
        MCFunctionExecuteRun.tag(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()), "cbx_ff_bad"))
})

FunctionFile.define("fflarge", function () {
    Command.say("FF_LARGE_BEGIN")
    for (let i = 0; i < 64; i++) {
        Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
            Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    }
    Command.say("FF_LARGE_END")
})
FunctionFile.define("fflargecheck", function () {
    Command.scoreboard(Command.scoreboardPlayersTest(Command.scoreboardFakePlayer("#r"), "cbx_ff1", "81", "81"))
    Command.say("FF_SCORE81_OK")
})

StartupProbe.finish()
