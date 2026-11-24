/** Dialogue Scene OPEN/CLOSE C-shaped group blocks regression.
 * Run: node --test tests/DIALOGUE_SCENE_SECTION_REGRESSION.cjs
 * This tests source structure and AST routing with stubs, NOT the MakeCode renderer.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const core=read('src/project/resource_project.ts');
const ui=read('src/blocks/dialogue_scene_sections_blocks.ts');
const legacy=read('src/blocks/resource_blocks.ts');
const pxt=JSON.parse(read('pxt.json'));

function loadCore(state,errors) {
    const start=core.indexOf('    export function sceneSection(');
    const end=core.indexOf('    export function onOpen(',start);
    assert.ok(start>=0 && end>start,'section functions missing');
    const js=core.slice(start,end)
        .replace(/\bexport function\b/g,'function')
        .replace(/(\w+):\s*(?:number|string|void)/g,'$1')
        .replace(/(\w+):\s*\(\)\s*=>\s*void/g,'$1')
        .replace(/\)\s*:\s*void/g,')')
        .replace(/\b(activeScene|activeButton|activeSceneSection)\b/g,'state.$1');
    return new Function('state','command','record',
        js+'\nreturn {sceneSection,sectionCommand};')(
        state,line=>({kind:0,raw:line}),message=>errors.push(message));
}
function loadUI(coreAPI) {
    let js=ui.slice(ui.indexOf('namespace DialogueFile {')+'namespace DialogueFile {'.length,
        ui.lastIndexOf('}'))
        .replace(/\bexport function\b/g,'function')
        .replace(/(\w+):\s*\(\)\s*=>\s*void/g,'$1')
        .replace(/(\w+):\s*(?:string|void)/g,'$1')
        .replace(/\)\s*:\s*void/g,')');
    return new Function('MCFunctionResourceProject',
        js+'\nreturn {openSection,closeSection,sectionCommand};')(coreAPI);
}

test('OPEN and CLOSE are statement handlers nested into existing Scene, with unique IDs',()=>{
    assert.ok(pxt.files.includes('src/blocks/dialogue_scene_sections_blocks.ts'));
    const ids=['mcresource_dialogue_scene_open_section',
        'mcresource_dialogue_scene_close_section'];
    for(const id of ids) {
        const start=ui.indexOf('//% blockId='+id);
        assert.ok(start>=0,'missing '+id);
        const end=ui.indexOf('export function ',start);
        const meta=ui.slice(start,end);
        assert.match(meta,/handlerStatement=1/);
    }
    assert.match(legacy,/blockId=mcresource_dialogue_scene_define/);
    assert.match(legacy,/blockId=mcresource_dialogue_button/);
    assert.match(legacy,/handlerStatement=1/);
    const allIds=[...(ui+'\n'+legacy).matchAll(/blockId=([a-z0-9_]+)/g)].map(x=>x[1]);
    assert.equal(allIds.length,new Set(allIds).size,'duplicate IDs');
    assert.match(pxt.version,/^\d+\.\d+\.\d+$/);
});

test('two OPEN and one CLOSE commands are preserved in their respective AST arrays',()=>{
    const state={activeScene:{onOpenCommands:[],onCloseCommands:[],buttons:[]},
        activeButton:undefined,activeSceneSection:0};
    const errors=[];
    const ui=loadUI(loadCore(state,errors));
    ui.openSection(()=>{
        ui.sectionCommand('say arrived');
        ui.sectionCommand('tag @initiator add visited');
    });
    ui.closeSection(()=>ui.sectionCommand('say goodbye'));
    assert.equal(state.activeScene.onOpenCommands.length,2);
    assert.equal(state.activeScene.onCloseCommands.length,1);
    assert.deepEqual(state.activeScene.onOpenCommands.map(x=>x.raw),
        ['say arrived','tag @initiator add visited']);
    assert.deepEqual(state.activeScene.onCloseCommands.map(x=>x.raw),['say goodbye']);
    assert.equal(state.activeSceneSection,0,'section state must be closed');
    assert.deepEqual(errors,[]);
});

test('misplaced, nested and button-context OPEN/CLOSE blocks are rejected without lost commands',()=>{
    const state={activeScene:undefined,activeButton:undefined,activeSceneSection:0};
    const errors=[];
    const blocks=loadUI(loadCore(state,errors));
    let ran=false;
    blocks.openSection(()=>{ran=true});
    assert.equal(ran,false);
    blocks.sectionCommand('say outside');
    assert.equal(errors.length,2);
    state.activeScene={onOpenCommands:[],onCloseCommands:[],buttons:[]};
    blocks.openSection(()=>{
        blocks.closeSection(()=>{ran=true});
        blocks.sectionCommand('say inside');
    });
    assert.equal(ran,false);
    assert.equal(state.activeScene.onOpenCommands.length,1);
    assert.equal(state.activeScene.onCloseCommands.length,0);
    assert.equal(state.activeSceneSection,0);
    state.activeButton={name:{plain:'A'},commands:[]};
    blocks.closeSection(()=>{ran=true});
    assert.equal(ran,false);
    assert.equal(errors.length,4);
    assert.match(core,/if \(!activeScene \|\| activeButton \|\| activeSceneSection != 0\)/,
        'regular Button must not be allowed inside OPEN/CLOSE');
});
