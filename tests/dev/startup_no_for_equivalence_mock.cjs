/* Node-only semantic equivalence check; not in-game timing. */
const fs=require('fs'),path=require('path'),os=require('os'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'../..'),cfg=JSON.parse(fs.readFileSync(path.join(root,'pxt.json'))),temp=fs.mkdtempSync(path.join(os.tmpdir(),'startup-no-for-'));
const libs=cfg.files.filter(f=>f.endsWith('.ts')&&f!=='main.ts').map(f=>path.join(root,f));
function compile(file){let js='';const program=ts.createProgram([...libs,path.join(__dirname,'chunk_preview_api.d.ts'),path.join(__dirname,file)],{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None,skipLibCheck:true,outFile:path.join(temp,file+'.js')});const errors=ts.getPreEmitDiagnostics(program).filter(d=>d.category===ts.DiagnosticCategory.Error);assert.equal(errors.length,0,ts.formatDiagnosticsWithColorAndContext(errors,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));program.emit(undefined,(f,s)=>{if(f.endsWith('.js'))js=s});return js}
function capture(file){
 const js=compile(file),split=js.lastIndexOf('StartupProbe.begin(0)');assert(split>0);
 const output=[],registration=[],commands=[],names=[];let name='';
 const ctx=vm.createContext({console,Math,Number,Map,Set,gameplay:{timeQuery:()=>{throw Error('unexpected clock query')}},loops:{pause:()=>{throw Error('unexpected pause')},forever:()=>{throw Error('unexpected worker')}},player:{onChat:n=>registration.push(n),say:s=>output.push(s),execute:cmd=>{assert(cmd.startsWith('tellraw '));return true}}});
 vm.runInContext(js.slice(0,split),ctx);
 const originalDefine=ctx.FunctionFile.define,originalCapture=ctx.FunctionFile.capturePreviewAction;
 ctx.FunctionFile.define=(n,fn)=>{name=n;names.push(n);return originalDefine(n,fn)};
 ctx.FunctionFile.capturePreviewAction=(issues,action,node)=>{const result=originalCapture(issues,action,node);if(result&&node)commands.push({name,line:ctx.MCFunctionCompiler.compileCommand(node)});return result};
 vm.runInContext(js.slice(split),ctx);
 return{commands,names,registration,ready:output.find(s=>s.startsWith('BENCH_READY '))};
}
const a=capture('STARTUP_BOTTLENECK_MAIN.ts'),b=capture('STARTUP_BOTTLENECK_NO_FOR_MAIN.ts');
assert.deepEqual(b.commands,a.commands,'canonical per-function order and values must be identical');assert.deepEqual(b.names,a.names);assert.deepEqual(b.registration,a.registration);assert.equal(b.ready,a.ready);
const text=fs.readFileSync(path.join(__dirname,'STARTUP_BOTTLENECK_NO_FOR_MAIN.ts'),'utf8'),tree=ts.createSourceFile('no_for.ts',text,ts.ScriptTarget.Latest,true);let loops=0;
(function walk(n){if(ts.isForStatement(n)||ts.isForOfStatement(n)||ts.isForInStatement(n)||ts.isWhileStatement(n)||ts.isDoStatement(n))loops++;ts.forEachChild(n,walk)})(tree);assert.equal(loops,0,'user fixture must contain no loop statement');
const large=b.commands.filter(x=>x.name==='fflarge');assert.equal(large.length,66);assert.equal(large.filter(x=>x.line==='scoreboard players add #r cbx_ff1 1').length,64);assert.equal(b.names.length,9);assert.equal(b.commands.length,82);
fs.rmSync(temp,{recursive:true,force:true});console.log('PASS local: both full user fixtures typecheck; all 9 function definitions/82 captured canonical commands/order/values/chat registrations/profile counters identical; fflarge 66 commands with 64 individual adds; no user loop statement. No PXT decompile or real-game timing claim.');
