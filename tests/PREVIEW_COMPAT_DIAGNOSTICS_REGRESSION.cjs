/**
 * Preview-only diagnostics regression. No Minecraft world / network access.
 * Run: NODE_PATH=<typescript node_modules> node tests/PREVIEW_COMPAT_DIAGNOSTICS_REGRESSION.cjs
 */
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const ts = require('typescript');

const output = [];
const definitions = {};
const chatHandlers = {};
const executed = [];
const Kind = {SpawnPoint: 28, ClearSpawnPoint: 30, SetWorldSpawn: 29, Tag: 20, Gamerule: 13, Time: 17};
const Level = {Error: 0, Warning: 1, Info: 2};
const GameRuleAction = {List: 0, Query: 1, SetBoolean: 2, SetInteger: 3, SetEnum: 4};
const TagActionKind = {Add: 0, Remove: 1, List: 2};
const context = vm.createContext({
    player: {
        onChat(name, handler) { chatHandlers[name] = handler; },
        execute(command) { executed.push(command); return true; }
    },
    loops: {forever() {}, pause() {}},
    MCFunctionAST: {CommandKind: Kind, GameRuleAction, TagActionKind},
    MCFunctionValidator: {ValidationLevel: Level, hasError(issues) {
        return issues.some(issue => issue.level === Level.Error);
    }},
    MCFunctionProject: {createTickFile() { return {values: []}; }},
    MCFunctionGameruleRegistry: {
        knownRuleIds() { return ['showcoordinates', 'keepinventory']; },
        valueKindOf() { return 1; }
    },
    MCFunctionCompiler: {compileSelector() { return '@s'; }},
    MCFunctionDiagnostics: {
        ensureChatRegistered() {},
        isReservedChatCommand() { return false; },
        replaceDefinitionIssues(name, issues) { definitions[name] = issues; },
        showFunctionDetailsOnly() {},
        showBlockedExecutionHint() {}
    }
});
const files = [
    'src/preview/query_result.ts',
    'src/preview/world_state.ts',
    'src/preview/query_adapter.ts',
    'function_file.ts'
];
for (const file of files) {
    const transpiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None}
    }).outputText;
    vm.runInContext(transpiled, context, {filename: file});
    if (context.MCFunctionPreview.QueryConfidence) {
        context.QueryConfidence = context.MCFunctionPreview.QueryConfidence;
    }
}
const preview = context.MCFunctionPreview;
preview.previewSay = message => output.push(message);
preview.previewTellFromExecutors = () => {};
preview.createInternalTagScopeToken = () => 'regression';
preview.createInternalTagName = purpose => '_cbi_' + purpose + '_regression';
preview.cleanupInternalTag = () => {};
preview.previewEscapeJsonText = value => value;
preview.isInternalPreviewTag = value => value.indexOf('_cbi_') === 0;
// transpileModule() processes namespace files individually; the real PXT
// compiler resolves their cross-file unqualified references in one program.
Object.assign(context, preview);
context.CommandKind = Kind;
context.GameRuleAction = GameRuleAction;
context.TagActionKind = TagActionKind;
context.ValidationLevel = Level;
const cmd = (kind, properties = {}) => ({kind, ...properties});
const spawn = cmd(Kind.SpawnPoint);
const tagList = cmd(Kind.Tag, {action: TagActionKind.List, target: {}});
const ruleQuery = cmd(Kind.Gamerule, {action: GameRuleAction.Query, ruleId: 'keepinventory'});
const ruleList = cmd(Kind.Gamerule, {action: GameRuleAction.List});
const ruleEnum = cmd(Kind.Gamerule, {
    action: GameRuleAction.SetEnum, ruleId: 'playerwaypoints', enumValue: 'off'
});

const cases = [
    [spawn, 'SPAWNPOINT_PREVIEW_LIMITATION', Level.Info],
    [tagList, 'TAG_LIST_SESSION_KNOWN', Level.Info],
    [ruleQuery, 'GAMERULE_QUERY_OUTPUT_HIDDEN', Level.Info],
    [ruleList, 'GAMERULE_LIST_REGISTRY_ONLY', Level.Info],
    [ruleEnum, 'GAMERULE_PLAYERWAYPOINTS_PREVIEW_UNSUPPORTED', Level.Warning]
];
for (const [command, code, level] of cases) {
    const issues = preview.previewCompatibilityIssues(command);
    assert.strictEqual(issues.length, 1, code);
    assert.strictEqual(issues[0].code, code);
    assert.strictEqual(issues[0].level, level);
}
for (const command of [
    cmd(Kind.ClearSpawnPoint), cmd(Kind.SetWorldSpawn),
    cmd(Kind.Gamerule, {action: GameRuleAction.SetBoolean, ruleId: 'showcoordinates'})
]) {
    assert.strictEqual(preview.previewCompatibilityIssues(command).length, 0,
        'Do not generalize Preview limitations to untested / previously working commands');
}

context.FunctionFile.define('test_info', function () {
    context.FunctionFile.capturePreviewAction([], () => executed.push('spawn'), spawn);
    context.FunctionFile.capturePreviewAction([], () => executed.push('spawn2'), spawn);
    context.FunctionFile.capturePreviewAction([], () => executed.push('tag'), tagList);
    context.FunctionFile.capturePreviewAction([], () => executed.push('query'), ruleQuery);
});
assert.strictEqual(executed.length, 0, 'Definition must not execute world commands');
assert.strictEqual(definitions.test_info.length, 3, 'Definition issues de-duplicated by kind/code');
assert.ok(output.some(line => line.includes('test_info: 3 info. Execution allowed.')));
assert.strictEqual(typeof chatHandlers['test_info?'], 'function');

output.length = 0;
preview.noticeSpawnPointPreviewOnce(true);
preview.noticeSpawnPointPreviewOnce(false);
assert.strictEqual(output.length, 1, 'Spawnpoint runtime message throttled per Preview session');
assert.ok(output[0].includes('WARNING [SPAWNPOINT_PREVIEW_LIMITATION]'));
assert.ok(output[0].includes('returned true'));

output.length = 0;
let result = preview.tryHandleQuery(ruleQuery);
assert.strictEqual(result.confidence, preview.QueryConfidence.Unavailable);
assert.ok(output[0].includes('INFO [UNAVAILABLE]'));

output.length = 0;
preview.observeCommand(cmd(Kind.Gamerule, {
    action: GameRuleAction.SetBoolean, ruleId: 'keepinventory', booleanValue: true
}), true);
result = preview.tryHandleQuery(ruleQuery);
assert.strictEqual(result.confidence, preview.QueryConfidence.SessionKnown);
assert.ok(output[0].includes('INFO [SESSION_KNOWN]'));
assert.ok(output[0].includes('NOT a live/verified world value'));

output.length = 0;
result = preview.tryHandleQuery(ruleList);
assert.strictEqual(result.confidence, preview.QueryConfidence.Partial);
assert.ok(output[0].includes('INFO [PARTIAL]'));
assert.ok(output.some(line => line.includes('names/types ONLY, NOT live values')));

output.length = 0;
const executedCount = executed.length;
result = preview.tryHandleQuery(ruleEnum);
assert.strictEqual(result.confidence, preview.QueryConfidence.Unavailable);
assert.ok(output[0].includes('WARNING [GAMERULE_PLAYERWAYPOINTS_PREVIEW_UNSUPPORTED]'));
assert.strictEqual(executed.length, executedCount, 'Known-failing enum command is not sent');

output.length = 0;
preview.observeCommand(cmd(Kind.Tag, {action: TagActionKind.Add, name: 'pc_tag'}), true);
result = preview.tryHandleQuery(tagList);
assert.strictEqual(result.confidence, preview.QueryConfidence.SessionKnown);
assert.ok(output.some(line => line.includes('INFO [SESSION_KNOWN] TAG list')));

const pxt = JSON.parse(fs.readFileSync('pxt.json', 'utf8'));
assert.strictEqual(pxt.version, '0.0.72');
assert.strictEqual(pxt.files.includes('tests/PREVIEW_COMPAT_DIAGNOSTICS_0.0.72_MAIN.ts'), false);
console.log('PASS: 5 preview issue classes, 3 unaffected commands, FunctionFile INFO capture/dedup, runtime notice once, TAG/GAMERULE confidence, version and PXT fixture isolation.');
