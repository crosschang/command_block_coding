/** Temporary MakeCode main.ts fixture. Do not commit as active main.ts.
 * Test with appropriate held items. Compiler/Definition results are not runtime enchant PASS.
 * For enchant target, the main hand must hold an appropriate unenchanted item.
 */
FunctionFile.define("e43_sharp5", function () {
    Command.enchant(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionEnchantmentLibrary.sharpness(),
        Command.enchantLevel(5)
    );
});
FunctionFile.define("e43_silk1", function () {
    Command.enchant(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionEnchantmentLibrary.silkTouch(),
        Command.enchantLevel(1)
    );
});
FunctionFile.define("e43_silk_bad", function () {
    Command.enchant(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionEnchantmentLibrary.silkTouch(),
        Command.enchantLevel(2)
    );
});
FunctionFile.define("e43_level_zero", function () {
    Command.enchant(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionEnchantmentLibrary.sharpness(),
        Command.enchantLevel(0)
    );
});
FunctionFile.define("e43_level_omit", function () {
    Command.enchant(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionEnchantmentLibrary.unbreaking()
    );
});
FunctionFile.define("e43_numeric", function () {
    Command.enchant(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionEnchantmentLibrary.numeric(9),
        Command.enchantLevel(1)
    );
});
FunctionFile.define("e43_num_bad", function () {
    Command.enchant(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionEnchantmentLibrary.numeric(-1)
    );
});
FunctionFile.define("e43_unknown", function () {
    Command.enchant(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionEnchantmentLibrary.custom("future_enchantment"),
        Command.enchantLevel(1)
    );
});
FunctionFile.define("e43_id_bad", function () {
    Command.enchant(
        MCFunctionFields.self(MCFunctionFields.noSelectorCondition()),
        MCFunctionEnchantmentLibrary.custom("broken id"),
        Command.enchantLevel(1)
    );
});
