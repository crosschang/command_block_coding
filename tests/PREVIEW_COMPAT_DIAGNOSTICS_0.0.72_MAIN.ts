/**
 * Temporary Minecraft Education MakeCode main.ts for Preview diagnostic UI.
 * Definition only: all commands are captured and do not modify the world.
 * Use a disposable test world before explicitly invoking any function.
 * Do NOT add this fixture to pxt.json files or replace shipped main.ts.
 */
FunctionFile.define("pc72_spawnpoint", function () {
    Command.spawnpointShared();
});

FunctionFile.define("pc72_tag_list", function () {
    Command.tag(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        Command.tagList()
    );
});

FunctionFile.define("pc72_rule_query", function () {
    Command.gamerule(Command.gameruleQueryAction(
        MCFunctionGameruleLibrary.keepinventory()
    ));
});

FunctionFile.define("pc72_rule_list", function () {
    Command.gamerule(Command.gameruleListAction());
});

FunctionFile.define("pc72_rule_enum", function () {
    Command.gamerule(Command.gameruleEnumAction(
        MCFunctionGameruleLibrary.playerwaypoints(), "off"
    ));
});

FunctionFile.define("pc72_normal", function () {
    Command.say("PC72_NORMAL_OK");
});

Preview.ready();
