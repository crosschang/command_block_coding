/** Regression for Dialogue toolbox namespace separation. 
 * Run: node --test tests/DIALOGUE_NAMESPACE_REGRESSION.cjs
 * Tests code metadata and adapter delegation with stubs, not the full MakeCode UI.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const facade=read('src/blocks/dialogue_namespaces.ts');
const legacyPaths=[
 'src/blocks/resource_blocks.ts',
 'src/blocks/dialogue_scene_choices_blocks.ts',
 'src/blocks/dialogue_scene_sections_blocks.ts',
 'src/blocks/dialogue_typed_scene_blocks.ts'
];
const legacy=legacyPaths.map(read).join('\n');
const pxt=JSON.parse(read('pxt.json'));

const blockIds=s=>[...s.matchAll(/\/\/% blockId=([a-z0-9_]+)/g)].map(x=>x[1]);
const extractMeta=(src,id)=>{
    const lines=src.split('\n');
    const i=lines.findIndex(l=>l.trim()==='//% blockId='+id);
    assert.ok(i>=0,'Block ID missing: '+id);
    let first=i;while(first>0&&/^\s*\/\/%/.test(lines[first-1]))first--;
    let last=i;while(last<lines.length&&!lines[last].includes('export function '))last++;
    assert.ok(last<lines.length,'block definition missing: '+id);
    return lines.slice(first,last).join('\n');
};
test('three real TypeScript namespaces and C-shaped blocks are toolbox defaults',()=>{
    for(const n of ['DialogueScene','DialogueButton','DialogueEvent'])
        assert.match(facade,new RegExp('namespace '+n+' \\{'));
    assert.match(facade,/groups='\["C-shaped","Alternatives"\]'/);
    assert.match(facade,/groups='\["C-shaped","Commands","Alternatives"\]'/);
    for(const id of ['mcresource_ns_dialogue_scene_define',
         'mcresource_ns_dialogue_button',
         'mcresource_ns_dialogue_scene_open_section',
         'mcresource_ns_dialogue_scene_close_section']){
        const meta=extractMeta(facade,id);
        assert.match(meta,/group="C-shaped"/);
        assert.match(meta,/handlerStatement=1/);
    }
    for(const id of ['mcresource_ns_dialogue_typed_scene','mcresource_ns_dialogue_scene_choices'])
        assert.match(extractMeta(facade,id),/group="Alternatives"/);
});
test('old Blockly IDs and TypeScript APIs remain hidden for compatibility',()=>{
    const ids=blockIds(facade);
    const old=blockIds(legacy);
    assert.equal(ids.length,16);
    assert.equal(new Set(ids).size,ids.length);
    assert.equal(new Set(old.concat(ids)).size,old.length+ids.length);
    const hidden=[
      'scene_define','scene_choices','typed_scene','button','button_choice',
      'typed_button_none','button_command',
      'scene_open_section','scene_close_section','scene_section_command',
      'typed_open_slot','typed_close_slot','typed_open_none','typed_close_none',
      'on_open_command','on_close_command'
    ];
    for(const item of hidden){
      const id='mcresource_dialogue_'+item;
      assert.match(extractMeta(legacy,id),/blockHidden=true/,'not hidden: '+id);
    }
    assert.doesNotMatch(extractMeta(legacy,'mcresource_dialogue_file_define'),/blockHidden=true/);
    assert.ok(pxt.files.includes('src/blocks/dialogue_namespaces.ts'));
    for(const file of legacyPaths) assert.ok(pxt.files.includes(file));
    assert.match(pxt.version,/^\d+\.\d+\.\d+$/);
});
test('all visible facades preserve argument order and delegate exactly once',()=>{
    const rx=/export function (\w+)\(/g;
    let found;
    let count=0;
    while((found=rx.exec(facade))!==null){
        const name=found[1];
        let p=rx.lastIndex,depth=1;
        while(p<facade.length&&depth>0){
            if(facade[p]==='(')depth++;
            else if(facade[p]===')')depth--;
            p++;
        }
        const params=facade.slice(rx.lastIndex,p-1);
        const types=facade.slice(p).match(/^\s*:\s*(void|DialogueFile\.\w+)\s*\{/);
        assert.ok(types,'return type missing for '+name);
        const bodyStart=p+types[0].length;
        const bodyEnd=facade.indexOf('}',bodyStart);
        const body=facade.slice(bodyStart,bodyEnd);
        const args=[...params.matchAll(/(\w+)\??\s*:/g)].map(x=>x[1]);
        const inv=body.match(/(?:return )?DialogueFile\.(\w+)\((.*?)\);/s);
        assert.ok(inv,'wrapper missing delegate: '+name);
        assert.deepEqual(inv[2].replace(/\s/g,'').split(',').filter(Boolean),args);
        let calls=[];
        const fake=new Proxy({}, {get(_,method){
            return (...values)=>{
                calls.push({method,values});
                return {marker:String(method)};
            };
        }});
        const invoke=new Function('DialogueFile',
            'return function('+args.join(',')+'){'+body+'}')(fake);
        const values=args.map((_,i)=>i+1);
        const result=invoke(...values);
        assert.equal(calls.length,1);
        assert.deepEqual(calls[0].values,values);
        if(types[1]!=='void')assert.deepEqual(result,{marker:inv[1]});
        count++;
        rx.lastIndex=bodyEnd+1;
    }
    assert.equal(count,16);
});
test('typed alternatives still connect only to corresponding typed shadow blocks',()=>{
    const typed=extractMeta(facade,'mcresource_ns_dialogue_typed_scene');
    const allIds=blockIds(facade);
    for(const id of ['mcresource_ns_dialogue_typed_open_none',
          'mcresource_ns_dialogue_typed_close_none',
          'mcresource_ns_dialogue_typed_button_none']){
        assert.ok(typed.includes(id));
        assert.ok(allIds.includes(id));
    }
    const shadows=[...facade.matchAll(/\.shadow="(mcresource_ns_dialogue_[a-z0-9_]+)"/g)].map(x=>x[1]);
    assert.ok(shadows.every(x=>allIds.includes(x)));
});
