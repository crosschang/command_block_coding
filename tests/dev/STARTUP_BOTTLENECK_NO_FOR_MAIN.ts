/**
 * STARTUP NO FOR — MakeCode 사용자 JavaScript 전체 시험 코드.
 * 최신 master 확장 유지. Extension main.ts에 덮어쓰지 않는다.
 * 현재 저장소 PXT 0.0.19를 확인했으며 이 작업에서 버전을 바꾸지 않는다.
 *
 * 기존 STARTUP_BOTTLENECK_MAIN.ts와 같은 함수 9개/명령 내용/정의 순서를 유지한다.
 * fflarge 본문만 반복문 대신 개별 SCOREBOARD action 64개로 펼쳤다.
 * helper 함수/Raw 명령/텍스트 배열로 대신 실행하지 않는다.
 * 사용자 프로그램의 실행 반복문은 없으며 Core 내부의 일반 처리 루프는 변경하지 않는다.
 *
 * StartupProbe.begin(0)은 그대로 둔다. 3번 출력 제거는 해결 적용 후보에서 제외한다.
 * 같은 mode0에서 기존 반복문판과 이 개별 블록판을 비교한다.
 * 추천 녹화: 기존 반복문판0 -> 개별 블록판0 -> 기존 반복문판0.
 * 각 프로그램 전체 교체/새로 실행 후 게임으로 복귀. BENCH_READY/SKIP까지 기다린다.
 * 수치는 UNIT=CALLS이며 ms가 아니다. 편집 시간은 비교에서 제외한다.
 * 오래 응답이 없으면 기존 ?를 한 번만 입력해 BENCH_STATE/COUNTS도 녹화한다.
 *
 * 목표 생성/행동팩 교체/채팅 실행 명령 입력은 필요 없다.
 * 이 계측 시험은 실제 함수 실행을 차단한다. 점수 결과/ACK PASS 시험이 아니다.
 * 판별 시 정의 순서에 주의: fflarge는8번째이며, 앞선 CHAT_WAIT는4번째 정의 중 관측됐다.
 * 따라서 앞선 대기 한 건을 반복문 탓으로 확정하지 않는다.
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
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#r"), "cbx_ff1", 1))
    Command.say("FF_LARGE_END")
})
FunctionFile.define("fflargecheck", function () {
    Command.scoreboard(Command.scoreboardPlayersTest(Command.scoreboardFakePlayer("#r"), "cbx_ff1", "81", "81"))
    Command.say("FF_SCORE81_OK")
})

StartupProbe.finish()
