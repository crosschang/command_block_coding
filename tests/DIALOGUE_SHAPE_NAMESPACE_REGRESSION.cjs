/** Block-shape namespace regression.
 * Run: node --test tests/DIALOGUE_SHAPE_NAMESPACE_REGRESSION.cjs
 * Structural and wrapper behavior test, not full MakeCode/PXT UI verification.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('src/blocks/dialogue_shape_namespaces.ts');
const facade=read('src/blocks/dialogue_namespaces.ts');
const old=read('src/blocks/resource_blocks.ts');
const pxt=JSON.parse(read('pxt.json'));
const ids=s=>[...s.matchAll(/\/\/% blockId=([a-z0-9_]+)/g)].map(x=>x[1]);
const blockMeta=(s,id)=>{
  const ls=s.split('\n'),i=ls.findIndex(l=>l.trim()==='//% blockId='+id);
  assert.ok(i>=0,'missing block id '+id);
  let j=i;while(j>0&&/^\s*\/\/%/.test(ls[j-1]))j--;
  let k=i;while(k<ls.length&&!ls[k].includes('export function '))k++;
  assert.ok(k<ls.length,'missing declaration '+id);
  return ls.slice(j,k).join('\n');
};
const cIds=['file','scene','button','open_section','close_section'].map(x=>'mcresource_shape_c_'+x);
const oneIds=['scene_choices','scene_typed','button_choice','button_none','open_slot','close_slot','open_none','close_none','button_command','section_command','on_open','on_close'].map(x=>'mcresource_shape_one_'+x);
test('the Dialogue toolbox is split by block shape into exactly two new namespaces',()=>{
  assert.match(source,/namespace DialogueC \{/);
  assert.match(source,/namespace DialogueOne \{/);
  assert.doesNotMatch(source,/namespace Dialogue(?:Scene|Button|Event) \{/);
  assert.ok(source.includes('block="DIALOGUE C자형"'));
  assert.ok(source.includes('block="DIALOGUE 원블록"'));
  assert.equal(ids(source).length,17);
  assert.deepEqual(ids(source).slice(0,5),cIds);
  assert.deepEqual(ids(source).slice(5),oneIds);
});
test('C-shaped blocks have handler callbacks; one-block items never do',()=>{
  for(const id of cIds){
    const metadata=blockMeta(source,id);
    if(id.endsWith('_file'))assert.match(metadata,/topblock=true/);
    else assert.match(metadata,/handlerStatement=1/);
  }
  for(const id of oneIds){
    const metadata=blockMeta(source,id);
    assert.doesNotMatch(metadata,/handlerStatement=1/);
  }
  const all=ids(source).concat(ids(facade)).concat(ids(old));
  assert.equal(all.length,new Set(all).size,'Blockly ids must be globally unique');
});
test('old APIs stay registered, hidden and available for decompilation',()=>{
  const hiddenIds=ids(facade);
  assert.equal(hiddenIds.length,16);
  for(const id of hiddenIds)assert.match(blockMeta(facade,id),/blockHidden=true/);
  assert.match(blockMeta(old,'mcresource_dialogue_file_define'),/blockHidden=true/);
  assert.ok(pxt.files.includes('src/blocks/dialogue_namespaces.ts'));
  assert.ok(pxt.files.includes('src/blocks/dialogue_shape_namespaces.ts'));
  assert.ok(pxt.files.includes('src/blocks/resource_blocks.ts'));
  assert.match(pxt.version,/^\d+\.\d+\.\d+$/);
});
test('all 17 wrappers forward the arguments and return values to DialogueFile only',()=>{
  const rx=/export function (\w+)\(/g;
  let match,count=0;
  while((match=rx.exec(source))!==null){
    let end=rx.lastIndex,depth=1;
    while(depth && end<source.length){
      if(source[end]==='(')depth++;
      else if(source[end]===')')depth--;
      end++;
    }
    const params=source.slice(rx.lastIndex,end-1);
    const ret=source.slice(end).match(/^\s*:\s*(void|DialogueFile\.\w+)\s*\{/);
    assert.ok(ret,'missing return type for '+match[1]);
    const brace=end+ret[0].length-1;
    const bodyEnd=source.indexOf('}',brace);
    const body=source.slice(brace+1,bodyEnd);
    const argNames=[...params.matchAll(/(\w+)\??\s*:/g)].map(x=>x[1]);
    const call=body.match(/(?:return )?DialogueFile\.(\w+)\((.*?)\);/s);
    assert.ok(call,'missing delegation for '+match[1]);
    assert.deepEqual(call[2].replace(/\s/g,'').split(',').filter(Boolean),argNames);
    const hits=[];
    const fake=new Proxy({}, {get:(_,key)=>(...args)=>{hits.push({key,args});return {tag:String(key)};}});
    const f=new Function('DialogueFile','return function('+argNames.join(',')+'){'+body+'}')(fake);
    const input=argNames.map((_,i)=>'arg'+i);
    const value=f(...input);
    assert.equal(hits.length,1,'exactly one core call');
    assert.deepEqual(hits[0].args,input);
    if(ret[1]!=='void')assert.deepEqual(value,{tag:call[1]});
    count++;
    rx.lastIndex=bodyEnd+1;
  }
  assert.equal(count,17);
});
test('all typed shadow blocks resolve to blocks in the single-block category',()=>{
  const allIds=ids(source);
  const shadows=[...source.matchAll(/\.shadow="(mcresource_shape_[a-z0-9_]+)"/g)].map(x=>x[1]);
  assert.ok(shadows.length>=12,'expected typed shadows');
  for(const id of shadows){
    assert.ok(allIds.includes(id),'shadow missing '+id);
    assert.ok(oneIds.includes(id),'typed shadow in wrong category '+id);
  }
});
