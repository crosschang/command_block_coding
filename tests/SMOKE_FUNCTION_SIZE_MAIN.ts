/**
 * FunctionFile 크기 스모크: 사용자 JavaScript 전체 교체. 확장 main.ts에 덮어쓰지 않는다.
 * 같은 월드에서 재접속 없이 새 실행. 정의 안내 후 ff2 -> ff13 -> ff26 순서.
 * 각 마지막 STEP과 해당 요청의 steps=N DONE/ACK_DONE을 확인한 뒤 다음으로 진행.
 * 기존 실행ON6회/요청 유지. 반복문·점수·중첩 execute·사용자 전송 함수 없음.
 * 각각 단일 요청. 13명령은 옛12명령 초과,26명령은 인코딩1400자도 초과.
 * 무응답이면 반복 입력하지 않고 해당 번호와 화면을 보존한다.
 */
FunctionFile.define("ff2", function () {
    Command.say("FF2_STEP_01")
    Command.say("FF2_STEP_02")
})
FunctionFile.define("ff13", function () {
    Command.say("FF13_STEP_01")
    Command.say("FF13_STEP_02")
    Command.say("FF13_STEP_03")
    Command.say("FF13_STEP_04")
    Command.say("FF13_STEP_05")
    Command.say("FF13_STEP_06")
    Command.say("FF13_STEP_07")
    Command.say("FF13_STEP_08")
    Command.say("FF13_STEP_09")
    Command.say("FF13_STEP_10")
    Command.say("FF13_STEP_11")
    Command.say("FF13_STEP_12")
    Command.say("FF13_STEP_13")
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
