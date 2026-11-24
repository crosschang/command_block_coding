/** Static regression for PXT Scene -> Button -> buttonCommand nesting connectors.
 * Run: node --test tests/RESOURCE_DIALOGUE_BLOCK_CONNECTION_REGRESSION.cjs
 * Source annotations alone cannot prove the MakeCode graphical editor renders the connector.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('src/blocks/resource_blocks.ts');
const project=read('src/project/resource_project.ts');
const ast=read('src/project/resource_ast.ts');
const pxt=JSON.parse(read('pxt.json'));

function annotationBefore(blockId,signature){
    const first=src.indexOf('//% blockId='+blockId);
    assert.ok(first>=0,'missing block ID '+blockId);
    const start=src.indexOf(signature,first);
    assert.ok(start>first,'missing API function '+signature);
    const attrs=src.slice(first,start);
    assert.ok(start-first<800,'unexpected annotations distance '+blockId);
    return attrs;
}

test('scene and button are nested statement callbacks, not top-level event blocks',()=>{
    for(const [id,func] of [
        ['mcresource_dialogue_scene_define','export function scene('],
        ['mcresource_dialogue_button','export function button(']
    ]){
        const meta=annotationBefore(id,func);
        assert.match(meta,/\/\/% handlerStatement(?:=1|=true)?(?:\r?\n)/);
        const declaration=src.slice(src.indexOf(func),src.indexOf(func)+200);
        assert.match(declaration,/handler: \(\) => void/,'callback handler preserved in '+id);
    }
    assert.equal((src.match(/\/\/% handlerStatement=1/g)||[]).length,2);
    assert.doesNotMatch(annotationBefore('mcresource_dialogue_file_define',
        'export function define('),/handlerStatement/);
});
test('existing AST and runtime validation keep nesting hierarchy and do not execute commands during definition',()=>{
    assert.match(ast,/buttons: DialogueButton\[\]/);
    assert.match(ast,/commands: MCFunctionAST\.CommandNode\[\]/);
    assert.match(project,/if \(!activeScene \|\| activeButton\)/);
    assert.match(project,/activeScene\.buttons\.push\(button\)/);
    assert.match(project,/if \(!activeButton\)/);
    assert.match(project,/activeButton\.commands\.push\(command\(line\)\)/);
});
test('keep current PXT configuration and uniquely registered Block IDs',()=>{
    assert.ok(pxt.files.includes('src/blocks/resource_blocks.ts'));
    assert.match(pxt.version,/^\d+\.\d+\.\d+$/);
    const ids=[...src.matchAll(/blockId=([a-z0-9_]+)/g)].map(a=>a[1]);
    assert.equal(new Set(ids).size,ids.length);
});
