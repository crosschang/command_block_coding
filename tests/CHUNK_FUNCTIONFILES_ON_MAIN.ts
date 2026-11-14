/**
 * 실제 FunctionFile 통합 시험 — MakeCode 사용자 JavaScript 전체 코드.
 * Extension main.ts에 덮어쓰지 않는다. 먼저 이번 통합 커밋으로 Extension을 업데이트한다.
 * pxt.json.version 0.0.16 유지. 릴리즈 생성 없음. 새 통합 행동팩 0.0.6만 활성화 (0.0.5 교체).
 * 목표가 없으면 직접: /scoreboard objectives add cbx_ff1 dummy
 * C에서 코드 전체 적용/실행 후 게임으로 복귀. 시험 중 C를 열지 않는다.
 *
 * 순서 (각 ACK 결과 출력 후 다음 입력):
 * ffready -> 수동 PREVIEW READY 및 ACK_DONE
 * ffreset -> ffsetup 3단계 DONE, #i=7 #t=10 #r=0
 * ffflow  -> BEGIN / 계산 / 3중 execute로 태그 / END, steps=5 DONE
 * ffcheck -> result17=true goodTag=true badTag=false ack=2
 * fffalse -> 예상 ZERO_RESULT (거짓 조건이 마지막 명령)
 * ffcheck -> result17=true goodTag=true badTag=false ack=9
 * fflarge -> BEGIN / 64회 +1 / END, steps=66 DONE (기존 12개/1400자 초과)
 * fflargecheck -> result81=true ack=2 (#r=17이었던 상태에서 실행해야 함)
 * 120초 이상 게임 안에서 대기 -> ffreset -> ffflow -> ffcheck (ack=2)
 * 일반 채팅 CHECK_END와 /tp @s ~ ~3 ~ 도 확인.
 *
 * ffstate는 저장된 ACK/ID/clockStage만 출력한다. 시간 재조회 없음.
 * ffcalc/ffnest/ffsetup도 각각 독립 FunctionFile로 직접 실행 가능.
 * 모든 정의는 공개 블록 API를 사용한다. 사전 HEX, 사용자 전송 함수, Raw 우회 없음.
 * #i/#t/#r는 Fake Player 이름이다. 주석으로 잘라서는 안 된다.
 * ffflow는 지역 함수 참조를 기존 방식으로 펼쳐 실제 하나의 요청으로 전송한다.
 * PREVIEW READY 블록은 ffready에 그대로 유지한다. 자동 ON 설정 블록은 추가하지 않는다.
 *
 * 이번 chunk 경로에서 기존 12명령/인코딩1400자 제한을 제거했다.
 * 조각 데이터는96자, native 명령은200자 이내 유지. 엔진/메모리/시간의 실제 한계는 별도다.
 * 기존 수신기는 successCount=0이면 해당 요청의 이후 명령을 중단한다.
 * 그래서 fffalse는 거짓 조건이 마지막인 독립 파일이다. 일반 mcfunction의
 * 거짓 조건 뒤 계속 실행하는 의미까지 동등하다고 이 시험으로 주장하지 않는다.
 * SUBMITTED/ACK_DONE/실제 점수·태그 확인은 별개다. 재전송/재접속으로 PASS 처리하지 않는다.
 * tick.json은 변경하지 않으며 이번에는 반복 실행 시험을 포함하지 않는다.
 */

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
player.onChat("fflargecheck", function () {
    let ack = RuntimeBridge.lastOrderedAck()
    let id = RuntimeBridge.lastOrderedRequestId()
    let result = player.execute("scoreboard players test #r cbx_ff1 81 81")
    player.say("FF_LARGE_CHECK result81=" + result + " ack=" + ack + " id=" + id)
})

player.onChat("ffreset", function () {
    // Test fixture cleanup only, outside FunctionFile content; remove may validly return false.
    player.execute("tag @s remove cbx_ff_ok")
    player.execute("tag @s remove cbx_ff_bad")
    FunctionFile.runPreview("ffsetup")
})
player.onChat("ffcheck", function () {
    let ack = RuntimeBridge.lastOrderedAck()
    let id = RuntimeBridge.lastOrderedRequestId()
    let result = player.execute("scoreboard players test #r cbx_ff1 17 17")
    let good = player.execute("testfor @s[tag=cbx_ff_ok]")
    let bad = player.execute("testfor @s[tag=cbx_ff_bad]")
    player.say("FF_CHECK result17=" + result + " goodTag=" + good + " badTag=" + bad + " ack=" + ack + " id=" + id)
})
player.onChat("ffstate", function () {
    let ack = RuntimeBridge.lastOrderedAck()
    let id = RuntimeBridge.lastOrderedRequestId()
    let stage = MCFunctionOrderedPreview.lastClockStage()
    let tick = MCFunctionOrderedPreview.lastClockTick()
    player.say("FF_STATE ack=" + ack + " id=" + id + " stage=" + stage + " tick=" + tick)
})
