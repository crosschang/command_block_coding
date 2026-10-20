/**
 * Run in repo root:
 *   NODE_PATH=<typescript module directory> node tests/B3_C1_STRUCTURED_COMMANDS_REGRESSION.cjs
 * Isolated canonical AST/Validator/Compiler and block wrapper regression.
 * Does not invoke Minecraft or establish in-game command compatibility.
 */
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const ts = require('typescript');

const files = [
    'src/ast/command.ts', 'src/ast/range.ts', 'src/ast/slot.ts',
    'src/ast/selector.ts', 'src/ast/position.ts', 'src/ast/player_target.ts',
    'commands/b3c1_actions.ts', 'src/registry/entity_event_registry.generated.ts',
    'src/blocks/command_adapter.ts', 'src/compiler/compiler.ts',
    'src/validator/validator.ts'
];
const ctx = vm.createContext({});
for (const file of files) {
    const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None}
    }).outputText;
    vm.runInContext(js, ctx, {filename: file});
    if (ctx.MCFunctionAST) {
        for (const name of ['CommandKind', 'PlayerTargetKind', 'SelectorBase', 'CoordinateMode',
                'DamageAction', 'ControlSchemeAction', 'ControlSchemeType',
                'AimAssistAction', 'AimAssistTargetMode']) {
            if (ctx.MCFunctionAST[name]) ctx[name] = ctx.MCFunctionAST[name];
        }
    }
    if (ctx.MCFunctionValidator) ctx.ValidationLevel = ctx.MCFunctionValidator.ValidationLevel;
}
const A = ctx.MCFunctionAST;
const B = ctx.MCFunctionBlocks;
const C = ctx.MCFunctionCompiler;
const V = ctx.MCFunctionValidator;
const self = A.createSelectorPlayerTarget(A.createSelector(A.SelectorBase.Self));
const entity = A.createSelectorPlayerTarget(A.createSelector(A.SelectorBase.AllEntities));
const named = A.createNamedPlayerTarget('Alex Rider');
const cases = [
    ['damage no cause', B.createDamageCommand(self, 0), 'damage @s 0'],
    ['damage cause', B.createDamageCommand(entity, 3, 'fire'), 'damage @e 3 fire'],
    ['damage source', B.createDamageCommand(named, 2, 'entity_attack', self),
        'damage "Alex Rider" 2 entity_attack entity @s'],
    ['event custom', B.createEventCommand(entity, 'sample:grow'), 'event entity @e sample:grow'],
    ['event cow', B.createEventCommand(entity, 'minecraft:entity_spawned', 'minecraft:cow'),
        'event entity @e minecraft:entity_spawned'],
    ['controls set camera', B.createControlSchemeCommand(self, A.ControlSchemeAction.Set,
        A.ControlSchemeType.CameraRelative), 'controlscheme @s set camera_relative'],
    ['controls clear named', B.createControlSchemeCommand(named, A.ControlSchemeAction.Clear),
        'controlscheme "Alex Rider" clear'],
    ['aim default', B.createAimAssistCommand(self, A.AimAssistAction.Set), 'aimassist @s set'],
    ['aim full', B.createAimAssistCommand(self, A.AimAssistAction.Set, 45, 60, 16,
        A.AimAssistTargetMode.Angle, 'sample:basic'), 'aimassist @s set 45 60 16 angle sample:basic'],
    ['aim preset only', B.createAimAssistCommand(self, A.AimAssistAction.Set,
        undefined, undefined, undefined, undefined, 'sample:basic'),
        'aimassist @s set sample:basic'],
    ['aim clear', B.createAimAssistCommand(self, A.AimAssistAction.Clear), 'aimassist @s clear']
];
for (const [label, ast, expected] of cases) {
    assert.strictEqual(C.compileCommand(ast), expected, label);
    assert.strictEqual(V.hasError(V.validateCommand(ast)), false, label);
}

const invalid = [
    ['damage float', B.createDamageCommand(self, 1.5), 'DAMAGE_AMOUNT_INVALID'],
    ['damage negative', B.createDamageCommand(self, -1), 'DAMAGE_AMOUNT_INVALID'],
    ['damage unknown cause', B.createDamageCommand(self, 1, 'not_a_cause'), 'DAMAGE_CAUSE_INVALID'],
    ['damage missing target', B.createDamageCommand(undefined, 2), 'PLAYER_TARGET_MISSING'],
    ['damage source missing actor', B.createDamageCommand(self, 1, 'entity_attack',
        undefined, A.DamageAction.FromEntity), 'PLAYER_TARGET_MISSING'],
    ['damage source missing cause', B.createDamageCommand(self, 1, undefined, self),
        'DAMAGE_SOURCE_CAUSE_REQUIRED'],
    ['event missing ID', B.createEventCommand(entity, ''), 'EVENT_ID_INVALID'],
    ['event injection', B.createEventCommand(entity, 'sample:ok\nsay hi'), 'EVENT_ID_INVALID'],
    ['event invalid hint', B.createEventCommand(entity, 'grow', 'type name'), 'EVENT_OWNER_HINT_INVALID'],
    ['controls invalid type', B.createControlSchemeCommand(self, A.ControlSchemeAction.Set, 123),
        'CONTROLSCHEME_SCHEME_INVALID'],
    ['controls clear extra', B.createControlSchemeCommand(self, A.ControlSchemeAction.Clear,
        A.ControlSchemeType.PlayerRelative), 'CONTROLSCHEME_CLEAR_EXTRA'],
    ['aim incomplete', B.createAimAssistCommand(self, A.AimAssistAction.Set, 45),
        'AIMASSIST_SETTINGS_INCOMPLETE'],
    ['aim X too narrow', B.createAimAssistCommand(self, A.AimAssistAction.Set, 9, 45, 8,
        A.AimAssistTargetMode.Distance), 'AIMASSIST_X_ANGLE_RANGE'],
    ['aim Y too wide', B.createAimAssistCommand(self, A.AimAssistAction.Set, 45, 91, 8,
        A.AimAssistTargetMode.Distance), 'AIMASSIST_Y_ANGLE_RANGE'],
    ['aim distance too large', B.createAimAssistCommand(self, A.AimAssistAction.Set, 45, 45, 17,
        A.AimAssistTargetMode.Distance), 'AIMASSIST_DISTANCE_RANGE'],
    ['aim invalid preset', B.createAimAssistCommand(self, A.AimAssistAction.Set,
        undefined, undefined, undefined, undefined, 'bad preset'), 'AIMASSIST_PRESET_ID_INVALID'],
    ['aim clear extra', B.createAimAssistCommand(self, A.AimAssistAction.Clear, 45),
        'AIMASSIST_CLEAR_EXTRA']
];
for (const [label, ast, expectedCode] of invalid) {
    const issues = V.validateCommand(ast);
    assert.ok(issues.some(x => x.level === V.ValidationLevel.Error && x.code === expectedCode),
        label + ': expected ' + expectedCode + ' but saw ' + JSON.stringify(issues));
}
assert.ok(V.validateCommand(B.createDamageCommand(self, 1, 'entity_attack', self))
    .some(x => x.level === V.ValidationLevel.Info &&
        x.code === 'DAMAGE_SOURCE_EDUCATION_SYNTAX_UNVERIFIED'),
    'Do not claim source attribution form is Education-verified');
assert.ok(V.validateCommand(B.createEventCommand(entity, 'unknown:event', 'minecraft:cow'))
    .some(x => x.code === 'EVENT_OWNER_EVENT_UNLISTED' && x.level === V.ValidationLevel.Warning),
    'Owner-specific Registry is advisory for custom events');

const pxt = JSON.parse(fs.readFileSync('pxt.json', 'utf8'));
assert.strictEqual(pxt.version, '0.0.72');
for (const path of ['commands/b3c1_actions.ts', 'src/blocks/b3c1_blocks.ts']) {
    assert.ok(pxt.files.includes(path), path + ' must be included in extension');
}
assert.ok(pxt.files.indexOf('commands/b3c1_actions.ts') <
    pxt.files.indexOf('src/blocks/command_adapter.ts'),
    'AST must load before its adapter');
const blockSource = fs.readFileSync('src/blocks/b3c1_blocks.ts', 'utf8');
for (const id of ['command_damage_apply', 'command_damage_from_entity', 'command_event_entity',
    'command_controlscheme_set', 'command_controlscheme_clear', 'command_aimassist_set',
    'command_aimassist_set_preset', 'command_aimassist_clear']) {
    assert.ok(blockSource.includes('blockId=' + id), id + ' missing');
}
const publicJs = ts.transpileModule(blockSource, {
    compilerOptions: {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None}
}).outputText;
vm.runInContext(publicJs, ctx, {filename: 'src/blocks/b3c1_blocks.ts'});
ctx.DamageCauseChoice = ctx.Command.DamageCauseChoice;
ctx.ControlSchemeChoice = ctx.Command.ControlSchemeChoice;
ctx.AimAssistModeChoice = ctx.Command.AimAssistModeChoice;
let dispatched;
ctx.executeAudioCommand = ast => { dispatched = ast; };
const publicCases = [
    ['DAMAGE simple', () => ctx.Command.damageApply({target: self}, 0), 'damage @s 0'],
    ['DAMAGE with cause', () => ctx.Command.damageApply({target: self}, 1,
        ctx.Command.damageCauseChoice(ctx.Command.DamageCauseChoice.Fire)), 'damage @s 1 fire'],
    ['DAMAGE default cause', () => ctx.Command.damageApply({target: self}, 1,
        ctx.Command.damageCauseChoice(ctx.Command.DamageCauseChoice.None)), 'damage @s 1 none'],
    ['DAMAGE entity', () => ctx.Command.damageFromEntity({target: entity}, 1,
        ctx.Command.damageCauseChoice(ctx.Command.DamageCauseChoice.EntityAttack), {target: self}),
        'damage @e 1 entity_attack entity @s'],
    ['EVENT', () => ctx.Command.eventEntity({target: entity}, 'minecraft:entity_spawned',
        'minecraft:cow'), 'event entity @e minecraft:entity_spawned'],
    ['CONTROL set', () => ctx.Command.controlSchemeSet({target: self},
        ctx.Command.ControlSchemeChoice.PlayerRelative), 'controlscheme @s set player_relative'],
    ['CONTROL clear', () => ctx.Command.controlSchemeClear({target: self}), 'controlscheme @s clear'],
    ['AIM default', () => ctx.Command.aimAssistSet({target: self}), 'aimassist @s set'],
    ['AIM full', () => ctx.Command.aimAssistSet({target: self},
        ctx.Command.aimAssistOptions(45, 45, 8, ctx.Command.AimAssistModeChoice.Distance)),
        'aimassist @s set 45 45 8 distance'],
    ['AIM preset', () => ctx.Command.aimAssistSetPreset({target: self}, 'sample:test'),
        'aimassist @s set sample:test'],
    ['AIM clear', () => ctx.Command.aimAssistClear({target: self}), 'aimassist @s clear']
];
for (const [label, run, expected] of publicCases) {
    dispatched = undefined;
    run();
    assert.ok(dispatched, label + ' must dispatch AST');
    assert.strictEqual(C.compileCommand(dispatched), expected, label);
    assert.strictEqual(V.hasError(V.validateCommand(dispatched)), false, label);
}
ctx.Command.damageFromEntity({target: self}, 1,
    ctx.Command.damageCauseChoice(ctx.Command.DamageCauseChoice.Fire), undefined);
assert.ok(V.validateCommand(dispatched).some(x => x.code === 'PLAYER_TARGET_MISSING'),
    'Omitted damager must not silently degrade into basic DAMAGE');

// Fixture-only coverage: paired CAMERA must precede CONTROLSCHEME and both
// must be reset in reverse order. Registration must never execute commands.
const definitions = {};
const emitted = [];
ctx.MCFunctionFields = {
    noSelectorCondition: () => undefined,
    self: () => ({selector: A.createSelector(A.SelectorBase.Self)}),
    targetSelector: v => ({target: A.createSelectorPlayerTarget(v.selector)}),
    namedPlayerTarget: name => ({target: A.createNamedPlayerTarget(name)})
};
ctx.MCFunctionEntityEventLibrary = {cowEntitySpawned: () => 'minecraft:entity_spawned'};
ctx.Command.CameraPresetChoice = {Free: 3};
ctx.Command.cameraPresetBuiltin = choice => {
    assert.strictEqual(choice, 3, 'Fixture must use free camera');
    return {presetId: 'minecraft:free'};
};
ctx.Command.cameraSet = (target, preset) => {
    assert.strictEqual(target.selector.base, A.SelectorBase.Self);
    emitted.push('camera @s set ' + preset.presetId);
};
ctx.Command.cameraClear = target => {
    assert.strictEqual(target.selector.base, A.SelectorBase.Self);
    emitted.push('camera @s clear');
};
ctx.executeAudioCommand = ast => emitted.push(C.compileCommand(ast));
ctx.FunctionFile = {define: (name, fn) => {
    assert.ok(!definitions[name], name + ' duplicate fixture registration');
    definitions[name] = fn;
}};
ctx.Preview = {ready: () => {}};
const fixture = fs.readFileSync('tests/B3_C1_0.0.72_PUBLIC_API_MAIN.ts', 'utf8');
vm.runInContext(ts.transpileModule(fixture, {
    compilerOptions: {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None}
}).outputText, ctx, {filename: 'tests/B3_C1_0.0.72_PUBLIC_API_MAIN.ts'});
assert.strictEqual(Object.keys(definitions).length, 9, 'Expected nine FunctionFile definitions');
assert.deepStrictEqual(emitted, [], 'FunctionFile registration must be capture-only');
const pairedControls = [
    ['c1_controls_set', ['camera @s set minecraft:free',
        'controlscheme @s set player_relative']],
    ['c1_controls_camera_relative', ['camera @s set minecraft:free',
        'controlscheme @s set camera_relative']],
    ['c1_controls_clear', ['controlscheme @s clear', 'camera @s clear']]
];
for (const [name, expected] of pairedControls) {
    emitted.length = 0;
    definitions[name]();
    assert.deepStrictEqual(emitted, expected, name + ' ordering');
}

console.log('PASS: ' + cases.length + ' canonical variants, ' + invalid.length +
    ' validator negatives, owner Registry hints, ' + publicCases.length +
    ' MakeCode block wrappers, three paired CAMERA/CONTROLSCHEME fixtures; ' +
    '0.0.72 unchanged. In-game tests remain pending.');
