/**
 * Temporary 0.0.68 MakeCode main.ts for combined Preview/page tests.
 * Replace root main.ts only for testing; restore project main.ts afterward.
 * Synthetic diagnostics are PREVIEW-only and do not change the command AST.
 */
player.onChat("pv68_short", function () {
    MCFunctionPreview.previewSay("PREVIEW_SHORT_OK");
});
player.onChat("pv68_special", function () {
    MCFunctionPreview.previewSay("Quote \" slash \\ bracket [Preview] selector @s");
});
player.onChat("pv68_multiline", function () {
    MCFunctionPreview.previewSay("LINE1\nLINE2\nLINE3");
});
player.onChat("pv68_korean", function () {
    MCFunctionPreview.previewSay("한글 메시지: 카메라, 태그, 규칙");
});

// 7 affected functions -> 3 diagnostic pages (3 + 3 + 1).
FunctionFile.define("page_a", function () { Command.say("A_EXEC"); });
FunctionFile.define("page_b", function () { Command.say("B_EXEC"); });
FunctionFile.define("page_c", function () { Command.say("C_EXEC"); });
FunctionFile.define("page_d", function () { Command.say("D_EXEC"); });
FunctionFile.define("page_e", function () { Command.say("E_EXEC"); });
FunctionFile.define("page_f", function () { Command.say("F_EXEC"); });
FunctionFile.define("page_g", function () { Command.say("G_EXEC"); });

MCFunctionDiagnostics.add("page_a", MCFunctionValidator.ValidationLevel.Warning, "PAGE_TEST_A", "Page one test A", MCFunctionDiagnostics.DiagnosticSource.Preview);
MCFunctionDiagnostics.add("page_b", MCFunctionValidator.ValidationLevel.Warning, "PAGE_TEST_B", "Page one test B", MCFunctionDiagnostics.DiagnosticSource.Preview);
MCFunctionDiagnostics.add("page_c", MCFunctionValidator.ValidationLevel.Info, "PAGE_TEST_C", "Page one test C", MCFunctionDiagnostics.DiagnosticSource.Preview);
MCFunctionDiagnostics.add("page_d", MCFunctionValidator.ValidationLevel.Warning, "PAGE_TEST_D", "Page two test D", MCFunctionDiagnostics.DiagnosticSource.Preview);
MCFunctionDiagnostics.add("page_e", MCFunctionValidator.ValidationLevel.Warning, "PAGE_TEST_E", "Page two test E", MCFunctionDiagnostics.DiagnosticSource.Preview);
MCFunctionDiagnostics.add("page_f", MCFunctionValidator.ValidationLevel.Info, "PAGE_TEST_F", "Page two test F", MCFunctionDiagnostics.DiagnosticSource.Preview);
MCFunctionDiagnostics.add("page_g", MCFunctionValidator.ValidationLevel.Warning, "PAGE_TEST_G", "Page three test G", MCFunctionDiagnostics.DiagnosticSource.Preview);

// Former internal page command is now a valid ordinary user function name.
FunctionFile.define("cbi_page", function () { Command.say("USER_PAGE_NAME_OK"); });

// Gamerule & TAG query smoke tests (use a disposable test world).
FunctionFile.define("pv68_gamerules", function () {
    Command.gamerule(Command.gameruleListAction());
});
FunctionFile.define("pv68_tag_add", function () {
    Command.tag(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()), Command.tagAdd("pv68_one"));
    Command.tag(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()), Command.tagAdd("pv68_two"));
});
FunctionFile.define("pv68_tag_list", function () {
    Command.tag(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()), Command.tagList());
});
FunctionFile.define("pv68_tag_remove", function () {
    Command.tag(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()), Command.tagRemove("pv68_one"));
    Command.tag(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()), Command.tagRemove("pv68_two"));
});
Preview.ready();
