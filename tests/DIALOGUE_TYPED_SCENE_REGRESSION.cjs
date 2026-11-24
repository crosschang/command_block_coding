/** Static PXT typed Scene slot regression. Run:
 * node --test tests/DIALOGUE_TYPED_SCENE_REGRESSION.cjs
 * The actual Blockly rendering and full PXT compile still require MakeCode.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('src/blocks/dialogue_typed_scene_blocks.ts');
const core=read('src/project/resource_project.ts');
const legacy=read('src/blocks/resource_blocks.ts');
const pxt=JSON.parse(read('pxt.json'));

function removeTypes(code) {
    return code
      .replace(/\bexport (function|class)\b/g,'$1')
      .replace(/^\s*(?:openSlotKind|closeSlotKind): boolean;\s*$/gm,'')
      .replace(/^\s*commands: MCFunctionAST\.CommandNode\[\];\s*$/gm,'')
      .replace(/(\w+)\??:\s*(?:MCFunctionAST\.\w+(?:\[\])?|MCFunctionResource\.\w+(?:\[\])?|string\[\]|ResourceText\.Value|OpenSlotValue|CloseSlotValue|ChoiceValue|string|number|boolean|void)/g,'$1')
      .replace(/\)\s*:\s*(?:string\[\]|MCFunctionAST\.\w+\[\]|void|OpenSlotValue|CloseSlotValue|ChoiceValue)/g,')');
}
function compileCore(state,problems) {
    const begin=core.indexOf('    export function createSceneCommandList(');
    const end=core.indexOf('    /** Parse known command syntax',begin);
    assert.ok(begin>=0&&end>begin,'Core functions missing');
    const js=removeTypes(core.slice(begin,end))
      .replace(/\b(activeDialogue|activeScene|activeButton|activeLanguage|activeSceneSection)\b/g,'state.$1');
    return new Function('MCFunctionResource','command','state','record',
        js+'\nreturn {createSceneCommandList,addTypedScene};')(
        {scene:(tag,name,body)=>({
            sceneTag:tag,npcName:name,text:body,
            onOpenCommands:[],onCloseCommands:[],buttons:[]
        })},
        value=>({kind:0,raw:value}),
        state,
        message=>problems.push(message));
}
function compileUI(coreAPI) {
    const start=ui.indexOf('namespace DialogueFile {');
    assert.ok(start>=0);
    const js=removeTypes(ui.slice(start+'namespace DialogueFile {'.length,ui.lastIndexOf('}')));
    class ChoiceValue {
        constructor(button){this.button=button;}
    }
    return new Function('MCFunctionResourceProject','ChoiceValue',
      js+'\nreturn {OpenSlotValue,CloseSlotValue,openSlot,closeSlot,openNone,closeNone,buttonNone,typedScene};')(
        coreAPI,ChoiceValue);
}
test('type-distinct OPEN, CLOSE and BUTTON slots with visible empty reporter blocks',()=>{
    assert.ok(pxt.files.includes('src/blocks/dialogue_typed_scene_blocks.ts'));
    assert.match(pxt.version,/^\d+\.\d+\.\d+$/);
    assert.match(ui,/openSlotKind: boolean;/);
    assert.match(ui,/closeSlotKind: boolean;/);
    for(const block of ['open_none','close_none','button_none']) {
        assert.ok(ui.includes('blockId=mcresource_dialogue_typed_'+block));
    }
    const meta=ui.slice(ui.indexOf('blockId=mcresource_dialogue_typed_scene'),
      ui.indexOf('export function typedScene('));
    assert.match(meta,/OPEN \$open \| CLOSE \$close \| BUTTON 1 \$button1/);
    assert.match(meta,/open\.shadow="mcresource_dialogue_typed_open_none"/);
    assert.match(meta,/close\.shadow="mcresource_dialogue_typed_close_none"/);
    for(let n=1;n<=6;n++)
      assert.ok(meta.includes('button'+n+'.shadow="mcresource_dialogue_typed_button_none"'));
    assert.match(meta,/expandableArgumentMode=enabled/);
    const ids=[...(legacy+'\n'+ui).matchAll(/blockId=([a-z0-9_]+)/g)].map(m=>m[1]);
    assert.equal(ids.length,new Set(ids).size,'Block IDs must be unique');
});
test('all NONE blocks produce a valid scene with no open, close or button entries',()=>{
    const state={activeDialogue:{scenes:[]},activeSceneSection:0};
    const issues=[];
    const ui=compileUI(compileCore(state,issues));
    const open=ui.openNone(),close=ui.closeNone(),button=ui.buttonNone();
    assert.deepEqual(open.commands,[]);
    assert.deepEqual(close.commands,[]);
    assert.equal(button.button,undefined);
    assert.equal(open.openSlotKind,true);
    assert.equal(close.closeSlotKind,true);
    ui.typedScene('empty',{text:{plain:'Guide'}},{text:{plain:'Nothing'}},
      open,close,button);
    assert.equal(state.activeDialogue.scenes.length,1);
    const scene=state.activeDialogue.scenes[0];
    assert.deepEqual(scene.onOpenCommands,[]);
    assert.deepEqual(scene.onCloseCommands,[]);
    assert.deepEqual(scene.buttons,[]);
    assert.deepEqual(issues,[]);
});
test('mixed None and active OPEN/CLOSE/BUTTON slots preserve commands and order',()=>{
    const state={activeDialogue:{scenes:[]},activeSceneSection:0};
    const issues=[];
    const ui=compileUI(compileCore(state,issues));
    const open=ui.openSlot('say hello','tag @initiator add welcome');
    const close=ui.closeNone();
    const unused=ui.buttonNone();
    const first={button:{name:{plain:'Start'},commands:[{raw:'give @initiator stone'}]}};
    const second={button:{name:{plain:'End'},commands:[{raw:'say bye'}]}};
    ui.typedScene('intro',undefined,undefined,open,close,first,unused,second);
    const scene=state.activeDialogue.scenes[0];
    assert.deepEqual(scene.onOpenCommands.map(c=>c.raw),
      ['say hello','tag @initiator add welcome']);
    assert.deepEqual(scene.onCloseCommands,[]);
    assert.deepEqual(scene.buttons.map(b=>b.name.plain),['Start','End']);
    assert.equal(scene.buttons.length,2);
    assert.deepEqual(issues,[]);
});
test('typed Scene is rejected outside a Dialogue file without side effects',()=>{
    const state={activeDialogue:undefined,activeSceneSection:0};
    const issues=[];
    const ui=compileUI(compileCore(state,issues));
    ui.typedScene('wrong',undefined,undefined,ui.openNone(),ui.closeNone(),ui.buttonNone());
    assert.equal(issues.length,1);
    assert.match(issues[0],/DIALOGUE_TYPED_SCENE_CONTEXT/);
});
