/** Scene + button choices test. Run: node --test tests/DIALOGUE_SCENE_CHOICES_REGRESSION.cjs
 * This checks the TypeScript source and AST behavior with stubs, NOT actual PXT UI rendering.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const ui = read('src/blocks/dialogue_scene_choices_blocks.ts');
const core = read('src/project/resource_project.ts');
const oldUI = read('src/blocks/resource_blocks.ts');

const stripTypes = code => code
    .replace(/\bexport (function|class)\b/g, '$1')
    .replace(/(\w+)\s*:\s*(?:MCFunctionResource\.\w+|MCFunctionAST\.\w+|string)\[\]/g, '$1')
    .replace(/(\w+)\??\s*:\s*(MCFunctionResource\.\w+|ResourceText\.\w+|ChoiceValue|string|number|void)\b/g, '$1')
    .replace(/\)\s*:\s*(MCFunctionResource\.\w+|ChoiceValue|void)\b/g, ')');

function loadCore(state, errors) {
    const begin = core.indexOf('    export function createButtonChoice(');
    const end = core.indexOf('    /** Parse known command syntax', begin);
    assert.ok(begin > 0 && end > begin, 'resource AST builder functions missing');
    const js = stripTypes(core.slice(begin, end))
        .replace(/\bactiveDialogue\b/g, 'state.activeDialogue')
        .replace(/\bactiveScene\b/g, 'state.activeScene')
        .replace(/\bactiveButton\b/g, 'state.activeButton')
        .replace(/\bactiveLanguage\b/g, 'state.activeLanguage');
    const run = new Function('MCFunctionResource', 'command', 'state', 'record',
        js + '\nreturn {createButtonChoice,addSceneChoices};');
    return run({
        scene: (tag, name, body) => ({
            sceneTag: tag, npcName: name, text: body, buttons: [],
            onOpenCommands: [], onCloseCommands: []
        })
    }, source => ({kind: 0, raw: source}), state, message => errors.push(message));
}

function loadUI(coreFns) {
    const begin = ui.indexOf('namespace DialogueFile {');
    const js = stripTypes(ui.slice(begin + 'namespace DialogueFile {'.length,
        ui.lastIndexOf('}')))
        .replace(/^\s*button:\s*MCFunctionResource\.DialogueButton;\s*$/m, '');
    return new Function('MCFunctionResourceProject',
        js + '\nreturn {buttonChoice,sceneChoices};')(coreFns);
}

test('PXT exposes one + / - choice input at a time up to six, with unique block IDs', () => {
    const pxt = JSON.parse(read('pxt.json'));
    assert.ok(pxt.files.includes('src/blocks/dialogue_scene_choices_blocks.ts'));
    const meta = ui.slice(ui.indexOf('//% blockId=mcresource_dialogue_scene_choices'),
        ui.indexOf('export function sceneChoices('));
    assert.match(meta, /expandableArgumentMode=enabled/);
    assert.match(meta, /\|\| button 2 \$choice2/);
    for (let i = 1; i <= 6; i++) {
        assert.ok(meta.includes('$choice' + i), 'missing choice input ' + i);
    }
    assert.match(meta, /inlineInputMode=external/);
    const ids = [...(oldUI + '\n' + ui).matchAll(/blockId=([a-z0-9_]+)/g)].map(m => m[1]);
    assert.equal(ids.length, new Set(ids).size, 'Duplicate block IDs');
    assert.match(pxt.version, /^\d+\.\d+\.\d+$/);
    assert.ok(pxt.files.includes('src/blocks/resource_blocks.ts'));
});

test('six buttons are stored in Dialogue AST in exact order, without game execution', () => {
    const state = {activeDialogue: {scenes: []}};
    const problems = [];
    const blocks = loadUI(loadCore(state, problems));
    const names = ['one', 'two', 'three', 'four', 'five', 'six'];
    const buttons = names.map(n => blocks.buttonChoice({text: {plain: n}}, 'say ' + n));
    blocks.sceneChoices('intro', {text: {plain: 'Guide'}},
        {text: {plain: 'Welcome'}}, ...buttons);
    assert.equal(problems.length, 0);
    assert.equal(state.activeDialogue.scenes.length, 1);
    assert.deepEqual(state.activeDialogue.scenes[0].buttons.map(b => b.name.plain), names);
    assert.deepEqual(state.activeDialogue.scenes[0].buttons.map(b => b.commands[0].raw),
        names.map(n => 'say ' + n));
});

test('optional slots and commands are not silently replaced or reordered', () => {
    const state = {activeDialogue: {scenes: []}};
    const problems = [];
    const blocks = loadUI(loadCore(state, problems));
    const one = blocks.buttonChoice({text: {plain: 'First'}}, 'say A', 'say B', 'say C');
    assert.deepEqual(one.button.commands.map(c => c.raw), ['say A', 'say B', 'say C']);
    const three = blocks.buttonChoice({text: {plain: 'Third'}}, 'say last');
    blocks.sceneChoices('intro', {text: {plain: 'NPC'}},
        {text: {plain: 'Text'}}, one, undefined, three);
    assert.equal(state.activeDialogue.scenes[0].buttons.length, 2);
    assert.deepEqual(state.activeDialogue.scenes[0].buttons.map(b => b.name.plain),
        ['First', 'Third']);
});

test('scene definition outside DialogueFile is rejected, legacy C-shaped blocks remain', () => {
    const state = {activeDialogue: undefined};
    const problems = [];
    const blocks = loadUI(loadCore(state, problems));
    const b = blocks.buttonChoice({text: {plain: 'First'}}, '/say hello');
    blocks.sceneChoices('invalid', undefined, undefined, b);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /DIALOGUE_SCENE_CONTEXT/);
    assert.match(oldUI, /blockId=mcresource_dialogue_scene_define/);
    assert.match(oldUI, /blockId=mcresource_dialogue_button/);
    assert.match(oldUI, /handlerStatement=1/);
});
