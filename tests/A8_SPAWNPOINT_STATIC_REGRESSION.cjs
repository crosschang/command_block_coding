/**
 * AST -> adapter -> validator -> canonical compiler static regression.
 * Run: node tests/A8_SPAWNPOINT_STATIC_REGRESSION.cjs
 * Requires the "typescript" npm module, as do existing CAMERA regression tests.
 * Does not invoke Minecraft or change a world.
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
    'src/ast/player_target.ts',
    'commands/spawnpoint.ts',
    'src/blocks/command_adapter.ts',
    'src/compiler/compiler.ts',
    'src/validator/validator.ts'
];
const ctx = vm.createContext({});
for (const file of files) {
    const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None}
    }).outputText;
    vm.runInContext(js, ctx, {filename: file});
    // Isolated TypeScript transpilation does not resolve cross-file namespace
    // enum references. PXT resolves these during a full-project build.
    if (ctx.MCFunctionAST) {
        for (const name of ['CommandKind', 'PlayerTargetKind', 'SelectorBase', 'CoordinateMode']) {
            if (ctx.MCFunctionAST[name]) ctx[name] = ctx.MCFunctionAST[name];
        }
    }
    if (ctx.MCFunctionValidator && ctx.MCFunctionValidator.ValidationLevel) {
        ctx.ValidationLevel = ctx.MCFunctionValidator.ValidationLevel;
    }
}
const A = ctx.MCFunctionAST;
const adapter = ctx.MCFunctionBlocks;
const compiler = ctx.MCFunctionCompiler;
const validator = ctx.MCFunctionValidator;
const self = A.createSelectorPlayerTarget(A.createSelector(A.SelectorBase.Self));
const everyone = A.createSelectorPlayerTarget(A.createSelector(A.SelectorBase.AllPlayers));
const steve = A.createNamedPlayerTarget('Steve');
const spaced = A.createNamedPlayerTarget('Alex Rider');
const absolute = A.createAbsolutePosition(10, 64, -20);
const origin = A.createAbsolutePosition(0, 0, 0);
const relative = A.createRelativePosition(0, 1, 0);
const local = A.createLocalPosition(0, 0, 3);
const SP = A.SpawnPointMode;
const WS = A.SetWorldSpawnMode;

const valid = [
    ['default player', adapter.createSpawnPointCommand(SP.Default), 'spawnpoint'],
    ['selector current', adapter.createSpawnPointCommand(SP.TargetCurrent, self), 'spawnpoint @s'],
    ['all players absolute', adapter.createSpawnPointCommand(SP.TargetAt, everyone, absolute), 'spawnpoint @a 10 64 -20'],
    ['all zeros preserved', adapter.createSpawnPointCommand(SP.TargetAt, self, origin), 'spawnpoint @s 0 0 0'],
    ['self relative', adapter.createSpawnPointCommand(SP.TargetAt, self, relative), 'spawnpoint @s ~ ~1 ~'],
    ['self local', adapter.createSpawnPointCommand(SP.TargetAt, self, local), 'spawnpoint @s ^ ^ ^3'],
    ['named player', adapter.createSpawnPointCommand(SP.TargetCurrent, steve), 'spawnpoint Steve'],
    ['spaced player', adapter.createSpawnPointCommand(SP.TargetAt, spaced, absolute), 'spawnpoint "Alex Rider" 10 64 -20'],
    ['world current', adapter.createSetWorldSpawnCommand(WS.Current), 'setworldspawn'],
    ['world absolute', adapter.createSetWorldSpawnCommand(WS.At, absolute), 'setworldspawn 10 64 -20'],
    ['world all zeros preserved', adapter.createSetWorldSpawnCommand(WS.At, origin), 'setworldspawn 0 0 0'],
    ['world relative', adapter.createSetWorldSpawnCommand(WS.At, relative), 'setworldspawn ~ ~1 ~'],
];
for (const [label, node, expected] of valid) {
    assert.strictEqual(compiler.compileCommand(node), expected, label);
    assert.strictEqual(validator.hasError(validator.validateCommand(node)), false, label);
}

const invalid = [
    ['target missing', adapter.createSpawnPointCommand(SP.TargetAt, undefined, absolute), 'PLAYER_TARGET_MISSING'],
    ['position missing', adapter.createSpawnPointCommand(SP.TargetAt, self), 'SPAWNPOINT_POSITION_REQUIRED'],
    ['unexpected position', adapter.createSpawnPointCommand(SP.TargetCurrent, self, absolute), 'SPAWNPOINT_UNEXPECTED_POSITION'],
    ['default extra', adapter.createSpawnPointCommand(SP.Default, self), 'SPAWNPOINT_DEFAULT_EXTRA'],
    ['named target empty', adapter.createSpawnPointCommand(SP.TargetCurrent, A.createNamedPlayerTarget(' ')), 'PLAYER_TARGET_NAME_INVALID'],
    ['named target selector text', adapter.createSpawnPointCommand(SP.TargetCurrent, A.createNamedPlayerTarget('@a')), 'PLAYER_TARGET_USE_SELECTOR'],
    ['named target newline', adapter.createSpawnPointCommand(SP.TargetCurrent, A.createNamedPlayerTarget('A\nB')), 'PLAYER_TARGET_NAME_LINE_BREAK'],
    ['invalid player target', adapter.createSpawnPointCommand(SP.TargetCurrent, {kind: 999}), 'PLAYER_TARGET_KIND_INVALID'],
    ['world position missing', adapter.createSetWorldSpawnCommand(WS.At), 'SETWORLDSPAWN_POSITION_REQUIRED'],
    ['world invalid form', adapter.createSetWorldSpawnCommand(999), 'SETWORLDSPAWN_MODE_INVALID'],
    ['mixed local coordinates', adapter.createSetWorldSpawnCommand(WS.At,
        A.createPosition(A.createCoordinate(A.CoordinateMode.Local, 0),
            A.createCoordinate(A.CoordinateMode.Relative, 0),
            A.createCoordinate(A.CoordinateMode.Local, 0))), 'POSITION_LOCAL_MIXED'],
];
for (const [label, node, errorCode] of invalid) {
    const issues = validator.validateCommand(node);
    assert.ok(issues.some(issue => issue.level === validator.ValidationLevel.Error && issue.code === errorCode),
        label + ': expected ' + errorCode + ', actual ' + JSON.stringify(issues));
}

const pxt = JSON.parse(fs.readFileSync('pxt.json', 'utf8'));
assert.strictEqual(pxt.version, '0.0.72', 'Do not change version before release');
for (const path of ['src/ast/player_target.ts', 'commands/spawnpoint.ts', 'src/blocks/spawnpoint_blocks.ts']) {
    assert.ok(pxt.files.includes(path), path + ' missing in pxt.json');
}
const blocks = fs.readFileSync('src/blocks/spawnpoint_blocks.ts', 'utf8');
assert.strictEqual((blocks.match(/\/\/% blockId=command_(spawnpoint|setworldspawn)/g) || []).length, 7,
    'A8 public block IDs changed unexpectedly');
console.log('PASS: ' + valid.length + ' canonical commands, ' + invalid.length + ' validator negatives, 7 public block IDs, pxt.json registration and version.');
