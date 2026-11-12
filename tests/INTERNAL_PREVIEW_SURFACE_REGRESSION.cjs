// Public surface contract. Game execution is tested separately with private pack fixtures.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),ts=require('typescript'),vm=require('vm');
const root=path.resolve(__dirname,'..');let count=0;function test(name,fn){fn();count++;console.log('LOCAL PASS',name);}
for(const file of ['src/blocks/runtime_bridge_blocks.ts','src/preview/cbx_live_query.ts','src/preview/query_result.ts'])test(file+' hides all callable development blocks',()=>{
 const source=fs.readFileSync(path.join(root,file),'utf8'),tree=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);let found=0;
 function visit(node){if(ts.isFunctionDeclaration(node)){const meta=source.slice(node.getFullStart(),node.getStart());if(/\/\/%[^\n]*\bblock(?:Id)?=/.test(meta)){found++;assert(meta.includes('//% blockHidden=true'),node.name.text);assert(meta.includes('//% hidden=true'),node.name.text);}}ts.forEachChild(node,visit);}visit(tree);assert(found>0);
});
test('File, tick and command authoring blocks stay visible',()=>{
 for(const [file,names] of [['function_file.ts',['define','tickJson','tickValue']],['custom.ts',['tag']],['src/blocks/c2_scoreboard_blocks.ts',['scoreboard']]]){
  const source=fs.readFileSync(path.join(root,file),'utf8'),tree=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true),seen=[];
  function visit(node){if(ts.isFunctionDeclaration(node)&&names.includes(node.name?.text)){seen.push(node.name.text);assert(!source.slice(node.getFullStart(),node.getStart()).includes('blockHidden=true'));}ts.forEachChild(node,visit);}visit(tree);assert.equal(seen.length,names.length);
 }
});
test('Preview readiness manual block stays visible',()=>{const s=fs.readFileSync(path.join(root,'function_file.ts'),'utf8');const t=ts.createSourceFile('function_file.ts',s,ts.ScriptTarget.Latest,true);let found=false;function visit(n){if(ts.isFunctionDeclaration(n)&&n.name?.text==='ready'){found=true;assert(!s.slice(n.getFullStart(),n.getStart()).includes('blockHidden=true'));assert(!s.slice(n.getFullStart(),n.getStart()).includes('//% hidden=true'));}ts.forEachChild(n,visit);}visit(t);assert(found);});
const pxt=JSON.parse(fs.readFileSync(path.join(root,'pxt.json'))),source=pxt.files.filter(f=>f.endsWith('.ts')).map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2017,module:ts.ModuleKind.None}}).outputText;
function context(){const c=vm.createContext({Math,player:{onChat(){},say(){},execute(){throw Error('Unexpected world access');}},loops:{forever(){},pause(){throw Error('Unexpected polling');}}});vm.runInContext(js,c);return c;}
test('Internal default configuration has no world effects',()=>{const c=context();assert(!c.MCFunctionCBX12Bridge.isEnabled());c.RuntimeBridge.initializePreview();assert(c.MCFunctionCBX12Bridge.isPlayerScoped());assert(!c.MCFunctionOrderedPreview.isEnabled());assert(c.MCFunctionOrderedPreview.isReceiptMode());});
test('Explicit Original diagnostics are not overwritten',()=>{const c=context();c.RuntimeBridge.select(c.RuntimeBridge.Transport.Original);c.RuntimeBridge.initializePreview();assert(!c.MCFunctionCBX12Bridge.isEnabled());});
test('Invalid command never dispatches to bridge',()=>{const c=context();let calls=0;c.MCFunctionCBX12Bridge.execute=()=>calls++;c.MCFunctionPreview.previewSay=()=>{};c.Command.raw('');assert.equal(calls,0);});
console.log('TOTAL',count,'LOCAL PASS; toolbox rendering and Minecraft execution are separate checks');
