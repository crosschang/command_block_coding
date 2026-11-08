/**
 * SELECTOR named-player reporter reused by SPAWNPOINT and TP.
 * Node/TypeScript static regression only; no MakeCode world execution.
 * Run with NODE_PATH pointed to the local typescript package.
 */
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const ts = require('typescript');

const files = [
    'src/ast/command.ts',
    'src/ast/range.ts',
    'src/ast/slot.ts',
    'src/ast/selector.ts',
    'src/ast/position.ts',
    'src/ast/rotation.ts',
    'src/ast/facing.ts',
    'src/ast/player_target.ts',
    'commands/teleport.ts',
    'commands/spawnpoint.ts',
    'src/blocks/command_adapter.ts',
    'src/compiler/compiler.ts',
    'src/validator/validator.ts',
    'src/fields/value_input.ts',
    'src/fields/selector_field.ts',
    'custom.ts',
    'src/blocks/spawnpoint_blocks.ts'
];
const ctx = vm.createContext({});
for (const file of files) {
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None}
    });
    assert.strictEqual(compiled.diagnostics.length, 0, file + ': transpile diagnostics');
    vm.runInContext(compiled.outputText, ctx, {filename: file});
    if (ctx.MCFunctionAST) {
        for (const name of ['CommandKind', 'PlayerTargetKind', 'SelectorBase',
                'CoordinateMode', 'TeleportDestinationKind', 'TeleportOrientationKind',
                'createSelectorPlayerTarget']) {
            if (ctx.MCFunctionAST[name]) ctx[name] = ctx.MCFunctionAST[name];
        }
    }
    if (ctx.MCFunctionValidator && ctx.MCFunctionValidator.ValidationLevel) {
        ctx.ValidationLevel = ctx.MCFunctionValidator.ValidationLevel;
    }
}

const A = ctx.MCFunctionAST;
const V = ctx.MCFunctionValidator;
const C = ctx.MCFunctionCompiler;
const F = ctx.MCFunctionFields;
const B = ctx.Command;
const self = A.createSelector(A.SelectorBase.Self);
const everyone = A.createSelector(A.SelectorBase.AllEntities);
const pos = A.createAbsolutePosition(10, 64, -20);
const destination = A.createTeleportPositionDestination(pos);
const namedSteve = A.createNamedPlayerTarget('Steve');
const namedAlex = A.createNamedPlayerTarget('Alex Rider');
const selectorSelf = A.createSelectorPlayerTarget(self);

const cases = [
    ['self legacy', A.createTeleportSelfCommand(destination), 'tp 10 64 -20'],
    ['selector legacy', A.createTeleportCommand(self, destination), 'tp @s 10 64 -20'],
    ['literal victim', A.createTeleportReferenceCommand(namedSteve, destination), 'tp Steve 10 64 -20'],
    ['named destination', A.createTeleportReferenceCommand(selectorSelf,
        A.createTeleportTargetDestination(namedAlex)), 'tp @s "Alex Rider"'],
    ['named victim and destination', A.createTeleportReferenceCommand(namedSteve,
        A.createTeleportTargetDestination(namedAlex)), 'tp Steve "Alex Rider"'],
    ['named facing', A.createTeleportReferenceCommand(namedSteve, destination,
        A.createTeleportFacingTargetOrientation(namedAlex)), 'tp Steve 10 64 -20 facing "Alex Rider"'],
    ['entity selector still valid', A.createTeleportReferenceCommand(
        A.createSelectorPlayerTarget(everyone), destination), 'tp @e 10 64 -20'],
    ['old entity destination', A.createTeleportSelfCommand(
        A.createTeleportEntityDestination(self)), 'tp @s'],
    ['old entity facing', A.createTeleportSelfCommand(destination,
        A.createTeleportFacingEntityOrientation(self)), 'tp 10 64 -20 facing @s'],
    ['new selector wrapper', A.createTeleportReferenceCommand(selectorSelf, destination), 'tp @s 10 64 -20']
];
for (const [label, node, expected] of cases) {
    assert.strictEqual(C.compileCommand(node), expected, label);
    const issues = V.validateCommand(node);
    assert.strictEqual(V.hasError(issues), false, label + ': ' + JSON.stringify(issues));
    if (label === 'entity selector still valid') {
        assert.strictEqual(issues.some(issue => issue.code === 'PLAYER_TARGET_SELECTOR_CONTEXT'), false,
            'TP supports @e, without player-only warnings');
    }
}

const broken = [
    ['empty victim', A.createTeleportReferenceCommand(A.createNamedPlayerTarget(' '), destination)],
    ['empty destination', A.createTeleportReferenceCommand(namedSteve,
        A.createTeleportTargetDestination(A.createNamedPlayerTarget(' ')))],
    ['empty facing', A.createTeleportReferenceCommand(namedSteve, destination,
        A.createTeleportFacingTargetOrientation(A.createNamedPlayerTarget(' ')))]
];
for (const [label, node] of broken) {
    assert.ok(V.validateCommand(node).some(issue => issue.code === 'PLAYER_TARGET_NAME_INVALID'), label);
}

const namedReporter = F.namedPlayerTarget('Alex Rider');
const selectorReporter = F.targetSelector({selector: self});
assert.strictEqual(namedReporter.target.kind, A.PlayerTargetKind.Name);
assert.strictEqual(selectorReporter.target.kind, A.PlayerTargetKind.Selector);
const namedDestinationReporter = B.teleportDestinationTarget(namedReporter);
const namedFacingReporter = B.teleportFacingTargetOption(namedReporter);
assert.strictEqual(namedDestinationReporter.destination.entity.name, 'Alex Rider');
assert.strictEqual(namedFacingReporter.orientation.facingEntity.name, 'Alex Rider');

// Run the actual public command entry in a no-world mock to verify block
// routing through validator and compiler without making real player changes.
const executed = [];
ctx.player = {execute: text => { executed.push(text); return true; }};
ctx.FunctionFile = {allowCommandExecution: () => true, capturePreviewAction: () => false};
ctx.MCFunctionPreview = {tryHandleQuery: () => ({handled: false}), observeCommand: () => {}};
ctx.MCFunctionPreviewBlockCommandSerializer = {tryCompile: () => ''};
const falseLiteral = F.BooleanLiteral.False;
B.teleportTargetReference(F.namedPlayerTarget('Steve'), namedDestinationReporter, falseLiteral);
B.teleportTargetReference(F.namedPlayerTarget('Steve'), B.teleportDestinationPosition({position: pos}),
    falseLiteral, namedFacingReporter);
B.teleportTarget({selector: self}, B.teleportDestinationPosition({position: pos}), falseLiteral);
assert.deepStrictEqual(executed, [
    'tp Steve "Alex Rider" false',
    'tp Steve 10 64 -20 facing "Alex Rider" false',
    'tp @s 10 64 -20 false'
], 'New named player and old selector TP block routing');

const selectorSource = fs.readFileSync('src/fields/selector_field.ts', 'utf8');
const spawnSource = fs.readFileSync('src/blocks/spawnpoint_blocks.ts', 'utf8');
const tpSource = fs.readFileSync('custom.ts', 'utf8');
assert.ok(selectorSource.includes('blockId=mcfunction_target_named_player') &&
    selectorSource.includes('group="Selector Targets"'), 'Single name reporter belongs to SELECTOR');
assert.ok(spawnSource.includes('target.shadow="mcfunction_target_selector"'),
    'SPAWNPOINT must use common SELECTOR reporter');
assert.ok(tpSource.includes('victim.shadow="mcfunction_target_selector"') &&
    tpSource.includes('destination.shadow="mcfunction_target_selector"') &&
    tpSource.includes('facingEntity.shadow="mcfunction_target_selector"'),
    'TP victim, destination and facing should all accept the shared target type');
for (const id of ['mcfunction_tp_target', 'mcfunction_tp_destination_entity',
        'mcfunction_tp_orientation_facing_entity']) {
    assert.ok(new RegExp('blockId=' + id + '\\n\\s*//% blockHidden=true').test(tpSource),
        'Old TP block must stay defined and hidden: ' + id);
}
const pxt = JSON.parse(fs.readFileSync('pxt.json', 'utf8'));
assert.strictEqual(pxt.version, '0.0.72');
console.log('PASS: ' + cases.length + ' TP canonical forms, ' + broken.length +
    ' invalid-name cases, common SELECTOR reporter, public TP dispatch and legacy IDs.');
