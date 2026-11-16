/** 사용자 JavaScript 전체 교체. Extension main.ts에 덮어쓰지 않는다.
 * 진단 출력 OFF. 기존 ON 조회 6회 유지. 추가 대기만 0/1/100ms 비교.
 * 권장: ffgap 100 -> 완료 -> ffgap 1 -> 완료 -> ffgap 0.
 * 각 새 요청의 STEP_26 / DONE / ACK_DONE / FF_GAP_RETURN 확인.
 * 60초 무응답이면 반복 입력하지 않고 종료. 시험 중 C 금지.
 * 대기는 명령 문자열이 고정된 후 전송/시간 조회 전후에만 적용.
 */
MCFunctionOrderedPreview.setTraceEnabled(false)
let ffGapBusy = false
player.onChat("ffgap", function (milliseconds) {
    if (ffGapBusy) return
    if (milliseconds != 0 && milliseconds != 1 && milliseconds != 100) {
        player.say("FF_GAP_USE: ffgap 0 / ffgap 1 / ffgap 100")
        return
    }
    ffGapBusy = true
    MCFunctionOrderedPreview.setChunkPauseMilliseconds(milliseconds)
    let used = MCFunctionOrderedPreview.chunkPauseMilliseconds()
    let found = FunctionFile.runPreview("ff26")
    let ack = MCFunctionOrderedPreview.lastAckStatus()
    let id = MCFunctionOrderedPreview.lastRequestId()
    ffGapBusy = false
    player.say("FF_GAP_RETURN ms=" + used + " found=" + found + " ack=" + ack + " id=" + id)
})
FunctionFile.define("ff26", function () {
    Command.say("FF26_STEP_01")
    Command.say("FF26_STEP_02")
    Command.say("FF26_STEP_03")
    Command.say("FF26_STEP_04")
    Command.say("FF26_STEP_05")
    Command.say("FF26_STEP_06")
    Command.say("FF26_STEP_07")
    Command.say("FF26_STEP_08")
    Command.say("FF26_STEP_09")
    Command.say("FF26_STEP_10")
    Command.say("FF26_STEP_11")
    Command.say("FF26_STEP_12")
    Command.say("FF26_STEP_13")
    Command.say("FF26_STEP_14")
    Command.say("FF26_STEP_15")
    Command.say("FF26_STEP_16")
    Command.say("FF26_STEP_17")
    Command.say("FF26_STEP_18")
    Command.say("FF26_STEP_19")
    Command.say("FF26_STEP_20")
    Command.say("FF26_STEP_21")
    Command.say("FF26_STEP_22")
    Command.say("FF26_STEP_23")
    Command.say("FF26_STEP_24")
    Command.say("FF26_STEP_25")
    Command.say("FF26_STEP_26")
})
