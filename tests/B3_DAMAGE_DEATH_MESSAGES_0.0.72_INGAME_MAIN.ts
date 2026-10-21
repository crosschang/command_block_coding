/**
 * B3 DAMAGE cause / damager live test.
 * Minecraft Education 26.32 / command_block_coding 0.0.72.
 * TEST-ONLY: Paste into a temporary MakeCode main.ts; do not add to pxt.json.
 *
 * Run chat functions one at a time (NO slash). There is NO automatic execution.
 * Player tests are intentionally lethal: use a test world, survival mode,
 * keepInventory=true and showDeathMessages=true.
 *
 * Call dmgmsg_setup ONCE, then manually tame the newly spawned wolf with bones
 * and cat with raw cod/salmon. Confirm collars/hearts before pet-death tests.
 * ONLY the exact tagged and uniquely named test pets are ever targeted.
 */

FunctionFile.define("dmgmsg_setup", function () {
    Command.summonSimple(
        MCFunctionEntityLibrary.wolf(),
        "CBI_DMGMSG_WOLF_072", MCFunctionPositionFields.local(-3, 0, 5)
    );
    Command.summonSimple(
        MCFunctionEntityLibrary.cat(),
        "CBI_DMGMSG_CAT_072", MCFunctionPositionFields.local(3, 0, 5)
    );

    Command.tag(
        MCFunctionFields.allEntities(MCFunctionFields.addEntityTypeCondition(
            MCFunctionEntityLibrary.wolf(), MCFunctionFields.BooleanLiteral.False,
            MCFunctionFields.addTextCondition(
                MCFunctionFields.SelectorTextConditionType.Name,
                "CBI_DMGMSG_WOLF_072", MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addRangeCondition(
                    MCFunctionFields.SelectorRangeConditionType.Distance,
                    MCFunctionFields.rangeMax(12), MCFunctionFields.noSelectorCondition()
                )
            )
        )), Command.tagAdd("cbi_dmgmsg_wolf_072")
    );
    Command.tag(
        MCFunctionFields.allEntities(MCFunctionFields.addEntityTypeCondition(
            MCFunctionEntityLibrary.cat(), MCFunctionFields.BooleanLiteral.False,
            MCFunctionFields.addTextCondition(
                MCFunctionFields.SelectorTextConditionType.Name,
                "CBI_DMGMSG_CAT_072", MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addRangeCondition(
                    MCFunctionFields.SelectorRangeConditionType.Distance,
                    MCFunctionFields.rangeMax(12), MCFunctionFields.noSelectorCondition()
                )
            )
        )), Command.tagAdd("cbi_dmgmsg_cat_072")
    );
});

// A: Fatal fire cause; inspect the PLAYER death message after respawn.
FunctionFile.define("dmgmsg_player_fire", function () {
    Command.damageApply(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        100, Command.damageCauseChoice(Command.DamageCauseChoice.Fire)
    );
});

// B: Fatal fall cause without needing actual falling height.
FunctionFile.define("dmgmsg_player_fall", function () {
    Command.damageApply(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        100, Command.damageCauseChoice(Command.DamageCauseChoice.Fall)
    );
});

// C: Wolf is recorded as the source of a fatal entity attack on the player.
FunctionFile.define("dmgmsg_player_wolf", function () {
    Command.damageFromEntity(
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition())),
        100,
        Command.damageCauseChoice(Command.DamageCauseChoice.EntityAttack),
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.wolf(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_DMGMSG_WOLF_072", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addTextCondition(
                        MCFunctionFields.SelectorTextConditionType.Tag,
                        "cbi_dmgmsg_wolf_072", MCFunctionFields.BooleanLiteral.False,
                        MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        ))
    );
});

// D: Negative control. Cats are expected to ignore fall damage.
// Run BEFORE dmgmsg_cat_by_player. Observe no death/damage if immune.
FunctionFile.define("dmgmsg_cat_fall", function () {
    Command.damageApply(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.cat(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_DMGMSG_CAT_072", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addTextCondition(
                        MCFunctionFields.SelectorTextConditionType.Tag,
                        "cbi_dmgmsg_cat_072", MCFunctionFields.BooleanLiteral.False,
                        MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        )),
        5, Command.damageCauseChoice(Command.DamageCauseChoice.Fall)
    );
});

// E: Cat is the assigned attacker; victim is a manually tamed test wolf.
// FATAL: run only AFTER player-fire/fall/wolf tests.
FunctionFile.define("dmgmsg_wolf_by_cat", function () {
    Command.damageFromEntity(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.wolf(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_DMGMSG_WOLF_072", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addTextCondition(
                        MCFunctionFields.SelectorTextConditionType.Tag,
                        "cbi_dmgmsg_wolf_072", MCFunctionFields.BooleanLiteral.False,
                        MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        )),
        100, Command.damageCauseChoice(Command.DamageCauseChoice.EntityAttack),
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.cat(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_DMGMSG_CAT_072", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addTextCondition(
                        MCFunctionFields.SelectorTextConditionType.Tag,
                        "cbi_dmgmsg_cat_072", MCFunctionFields.BooleanLiteral.False,
                        MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        ))
    );
});

// F: Player is assigned as the attacker; victim is a manually tamed test cat.
FunctionFile.define("dmgmsg_cat_by_player", function () {
    Command.damageFromEntity(
        MCFunctionFields.targetSelector(MCFunctionFields.allEntities(
            MCFunctionFields.addEntityTypeCondition(
                MCFunctionEntityLibrary.cat(), MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.addTextCondition(
                    MCFunctionFields.SelectorTextConditionType.Name,
                    "CBI_DMGMSG_CAT_072", MCFunctionFields.BooleanLiteral.False,
                    MCFunctionFields.addTextCondition(
                        MCFunctionFields.SelectorTextConditionType.Tag,
                        "cbi_dmgmsg_cat_072", MCFunctionFields.BooleanLiteral.False,
                        MCFunctionFields.noSelectorCondition()
                    )
                )
            )
        )),
        100, Command.damageCauseChoice(Command.DamageCauseChoice.EntityAttack),
        MCFunctionFields.targetSelector(MCFunctionFields.self(MCFunctionFields.noSelectorCondition()))
    );
});

// Optional cleanup of any surviving test pets; no unrelated mobs are selected.
FunctionFile.define("dmgmsg_cleanup", function () {
    Command.kill(MCFunctionFields.allEntities(MCFunctionFields.addEntityTypeCondition(
        MCFunctionEntityLibrary.wolf(), MCFunctionFields.BooleanLiteral.False,
        MCFunctionFields.addTextCondition(
            MCFunctionFields.SelectorTextConditionType.Name,
            "CBI_DMGMSG_WOLF_072", MCFunctionFields.BooleanLiteral.False,
            MCFunctionFields.addTextCondition(
                MCFunctionFields.SelectorTextConditionType.Tag,
                "cbi_dmgmsg_wolf_072", MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.noSelectorCondition()
            )
        )
    )));
    Command.kill(MCFunctionFields.allEntities(MCFunctionFields.addEntityTypeCondition(
        MCFunctionEntityLibrary.cat(), MCFunctionFields.BooleanLiteral.False,
        MCFunctionFields.addTextCondition(
            MCFunctionFields.SelectorTextConditionType.Name,
            "CBI_DMGMSG_CAT_072", MCFunctionFields.BooleanLiteral.False,
            MCFunctionFields.addTextCondition(
                MCFunctionFields.SelectorTextConditionType.Tag,
                "cbi_dmgmsg_cat_072", MCFunctionFields.BooleanLiteral.False,
                MCFunctionFields.noSelectorCondition()
            )
        )
    )));
});

Preview.ready();
