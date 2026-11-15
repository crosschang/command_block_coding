/**
 * 복원 통합본 스모크 시험: MakeCode 사용자 JavaScript 전체 교체용.
 * Extension main.ts에 덮어쓰지 않는다. StartupProbe 호출 없음.
 * 기존 통합 행동팩0.0.6과 확장 복원본을 사용. PXT 버전/설정 변경 없음.
 * cbx_ff1 목표가 없을 때만 사용자가 직접 /scoreboard objectives add cbx_ff1 dummy
 * 정의 안내 후: smping -> SMOKE_CHAT_OK, smoke -> BEGIN/NEST_OK/PASS_33 및 steps26 DONE.
 * 소요 시간 비교/최적화 시험 아님. 각 결과 확인 후 다음 입력. 실패하면 반복 입력 중단.
 * 3개 지역 FunctionFile을 펼쳐 단일 요청26명령으로 전송한다.
 * #sm_i/#sm_t/#sm_r만 사용하며 매번 초기화. 기존 #i/#t/#r는 변경하지 않는다.
 */
player.onChat("smping", function () {
    player.say("SMOKE_CHAT_OK")
})
FunctionFile.define("smcalc", function () {
    Command.scoreboard(Command.scoreboardPlayersOperation(Command.scoreboardFakePlayer("#sm_r"),
        "cbx_ff1", Command.ScoreboardOperatorChoice.Assign, Command.scoreboardFakePlayer("#sm_i"), "cbx_ff1"))
    Command.scoreboard(Command.scoreboardPlayersOperation(Command.scoreboardFakePlayer("#sm_r"),
        "cbx_ff1", Command.ScoreboardOperatorChoice.Add, Command.scoreboardFakePlayer("#sm_t"), "cbx_ff1"))
})
FunctionFile.define("smnest", function () {
    Command.execute(Command.executeIfScore(Command.ExecutePolarity.If,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", MCFunctionFields.rangeMinMax(17, 17), Command.executeEnd()),
        MCFunctionExecuteRun.nestedExecute(Command.executeIfScore(Command.ExecutePolarity.Unless,
            Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", MCFunctionFields.rangeMinMax(18, 18), Command.executeEnd()),
            MCFunctionExecuteRun.nestedExecute(Command.executeIfScore(Command.ExecutePolarity.If,
                Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", MCFunctionFields.rangeMinMax(17, 17), Command.executeEnd()),
                MCFunctionExecuteRun.say("SMOKE_NEST_OK"))))
})
FunctionFile.define("smoke", function () {
    Command.say("SMOKE_BEGIN")
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("#sm_i"), "cbx_ff1", 7))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("#sm_t"), "cbx_ff1", 10))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Set,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 0))
    Command.mcFunction("smcalc")
    Command.mcFunction("smnest")
    Command.scoreboard(Command.scoreboardPlayersTest(Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", "17", "17"))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersScore(Command.ScoreboardNumberMode.Add,
        Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", 1))
    Command.scoreboard(Command.scoreboardPlayersTest(Command.scoreboardFakePlayer("#sm_r"), "cbx_ff1", "33", "33"))
    Command.say("SMOKE_PASS_33")
})
