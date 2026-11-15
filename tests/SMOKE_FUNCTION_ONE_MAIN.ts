// 사용자 JavaScript 전체 교체용. 확장 main.ts에 덮어쓰지 않는다.
// 같은 월드에서 재접속 없이 새 실행. [Preview] ffone: OK. 뒤 게임 채팅에 ffone 한 번.
// FF_ONE_OK + steps=1 DONE/ACK_DONE 확인. 기존 실행 ON6회 유지. 목표 생성 불필요.
FunctionFile.define("ffone", function () {
    Command.say("FF_ONE_OK")
})
