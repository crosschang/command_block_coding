/**
 * MakeCode/행동팩 연결 단계 분리 — 사용자 JavaScript 전체 교체용.
 * Extension main.ts에 덮어쓰지 않는다. 진단 중 JavaScript 상태 유지.
 * FunctionFile/반복문/자동 전송/시작 출력 없음. 채팅 이벤트는 linkprobe 하나만 등록.
 * 게임에서 linkprobe 0 -> 1 -> 2 -> 3 -> 4. 각 결과가 나왔을 때만 다음 단계.
 * 무응답이면 추가 실행 중단. linkprobe 9는 저장 상태 조회이며 응답 보장 없음.
 * 3번은 전용 bridge ACK목표 cbxo2h/cbxo2hn의 @s 점수를 보정 후 정리한다.
 * 4번은 SAY1개를 기존 AST→검사→컴파일→분할→ACK 경로로 보내며 ON6회 유지.
 */
let linkProbeBusy = false
let linkProbeStage = "IDLE"
player.onChat("linkprobe", function (step: number) {
    if (step == 9) {
        let stage = linkProbeStage
        let clock = MCFunctionOrderedPreview.lastClockStage()
        let ack = RuntimeBridge.lastOrderedAck()
        let id = RuntimeBridge.lastOrderedRequestId()
        player.say("LINK_STATE stage=" + stage + " clock=" + clock + " ack=" + ack + " id=" + id)
        return
    }
    if (step < 0 || step > 4 || step % 1 != 0) {
        player.say("LINK_HELP steps=0,1,2,3,4 status=9")
        return
    }
    if (linkProbeBusy) {
        player.say("LINK_BUSY stage=" + linkProbeStage)
        return
    }
    if (step == 0) {
        player.say("LINK_CHAT_OK")
        return
    }
    linkProbeBusy = true
    if (step == 1) {
        linkProbeStage = "EVENT_WAIT"
        let returned = player.execute("scriptevent cbxp4o2h:begin probe")
        linkProbeStage = "EVENT_RETURN"
        linkProbeBusy = false
        player.say("LINK_EVENT_RETURN result=" + returned)
        return
    }
    if (step == 2) {
        linkProbeStage = "TIME_WAIT"
        let tick = gameplay.timeQuery(TimeQuery.GameTime)
        linkProbeStage = "TIME_RETURN"
        linkProbeBusy = false
        player.say("LINK_TIME_RETURN tick=" + tick)
        return
    }
    RuntimeBridge.initializePreview()
    if (step == 3) {
        linkProbeStage = "ACK_WAIT"
        let ready = MCFunctionOrderedPreview.probeReadback()
        linkProbeStage = "ACK_RETURN"
        linkProbeBusy = false
        player.say("LINK_ACK_RETURN ready=" + ready)
        return
    }
    linkProbeStage = "SUBMIT_WAIT"
    MCFunctionOrderedPreview.submit("linkone", [MCFunctionAST.createSayCommand("LINK_ONE_OK")])
    linkProbeStage = "SUBMIT_RETURN"
    linkProbeBusy = false
    player.say("LINK_SUBMIT_RETURN ack=" + RuntimeBridge.lastOrderedAck() + " id=" + RuntimeBridge.lastOrderedRequestId())
})
