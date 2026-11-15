/* Opt-in startup exclusion experiment: counts only, never Minecraft timing or PXT PASS. */
const fs=require('fs'),path=require('path'),os=require('os'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'../..'),config=JSON.parse(fs.readFileSync(path.join(root,'pxt.json')));
const sources=config.files.filter(f=>f.endsWith('.ts')&&f!=='main.ts').map(f=>path.join(root,f));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'startup-probe-'));let compiled='';
const program=ts.createProgram([...sources,path.join(__dirname,'chunk_preview_api.d.ts'),path.join(__dirname,'STARTUP_BOTTLENECK_MAIN.ts')],{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None,skipLibCheck:true,outFile:path.join(temp,'all.js')});
const errors=ts.getPreEmitDiagnostics(program).filter(d=>d.category===ts.DiagnosticCategory.Error);assert.equal(errors.length,0,ts.formatDiagnosticsWithColorAndContext(errors,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));
program.emit(undefined,(f,data)=>{if(f.endsWith('.js'))compiled=data});assert(compiled.includes('StartupProbe.begin(0)'));
function fixture(mode,options={}){
 const registrations=[],native=[],output=[],chat={};
 const ctx=vm.createContext({console,Math,Number,Map,Set,gameplay:{timeQuery:()=>{throw Error('No profiling GameTime query permitted')}},loops:{pause:()=>{throw Error('No added pause permitted')},forever:()=>{throw Error('No background worker permitted')}},player:{
 onChat:(name,fn)=>{assert(!chat[name],'duplicate chat '+name);registrations.push(name);chat[name]=fn;if(options.queryAtChat&&name==='ffsetup')chat['?']()},
 say:msg=>{output.push(msg);if(options.queryAtReady&&msg.startsWith('BENCH_READY '))chat['?']()},
 execute:cmd=>{assert(cmd.startsWith('tellraw '),'authored/transport command executed during startup: '+cmd);native.push(cmd);return true}
 }});
 vm.runInContext(compiled.replace('StartupProbe.begin(0)','StartupProbe.begin('+mode+')'),ctx);
 const ready=output.find(s=>s.startsWith('BENCH_READY ')),skip=output.find(s=>s.startsWith('BENCH_SKIP '));assert(ready&&skip,output.join('\n'));assert(ready.includes('defs=9 UNIT=CALLS'));
 for(const name of ['CAPTURE','CHECK','STORE','DIAG','CHAT','OUTPUT']){const m=new RegExp(name+'=(\\d+)/(\\d+)').exec(ready);assert(m,name+' count missing');assert.equal(m[1],m[2],name+' enter/return mismatch');}
 const n=native.length;assert(ctx.FunctionFile.runPreview('ffflow'));assert.equal(native.length,n,'test functions must remain disabled in every mode');assert.equal(output.at(-1),'BENCH_EXECUTION_DISABLED');
 return{mode,registrations,native,output,ready,skip,ctx};
}
const cases=[0,1,2,3,4,5].map(fixture),base=cases[0];
assert(base.registrations.length>0);assert(base.native.length>0,'baseline restores pre-removal output');assert(base.output.some(s=>s.startsWith('DIAG ')),'baseline restores original captured READY guide');
assert.equal(cases[1].registrations.length,0);assert.equal(cases[4].registrations.length,0);assert.equal(cases[5].registrations.length,0);
assert.equal(cases[1].native.length,base.native.length,'no-chat keeps original output work');
assert.equal(cases[2].native.length,base.native.length,'no-store keeps original output work');
assert.equal(cases[3].native.length,0);assert.equal(cases[3].output.length,3,'only common finish lines plus test execution-block notification');
assert.equal(base.ctx.MCFunctionDiagnostics.countFunctionLevel('ffcheck',2),1,'baseline INFO preserved');
assert.equal(cases[1].ctx.MCFunctionDiagnostics.countFunctionLevel('ffcheck',2),1,'no-chat INFO preserved');
assert.equal(cases[2].ctx.MCFunctionDiagnostics.countFunctionLevel('ffcheck',2),1,'no-store INFO preserved');
assert.equal(cases[3].ctx.MCFunctionDiagnostics.countFunctionLevel('ffcheck',2),1,'no-output INFO preserved');
assert.equal(cases[4].ctx.MCFunctionDiagnostics.countFunctionLevel('ffcheck',2),0,'no-diag explicitly omits diagnostic store');
assert.match(cases[5].skip,/CHECK=[1-9]/,'no-checks must visibly mark bypass');
const finished=cases[3];const countsBefore=finished.ctx.StartupProbe.counts();finished.ctx.MCFunctionDiagnostics.showAll();assert.equal(finished.ctx.StartupProbe.counts(),countsBefore,'report must not alter counters');assert(finished.output.some(s=>s.includes('BENCH_STATE mode=3 defs=9 finish=FINISHED')));
const pending=fixture(3,{queryAtChat:true});const snap=pending.output.find(s=>s.startsWith('BENCH_COUNTS '));const cm=/CHAT=(\d+)\/(\d+)/.exec(snap);assert.equal(Number(cm[2])-Number(cm[1]),1,'pending native chat registration visible');assert(pending.output.some(s=>s.includes('finish=DEFINITIONS last=CHAT_WAIT')));
const reporting=fixture(3,{queryAtReady:true});assert(reporting.output.some(s=>s.includes('finish=READY_SAY_WAIT')),'final report call wait visible');
for(const c of cases){console.log(c.ready);console.log(c.skip)}
fs.rmSync(temp,{recursive:true,force:true});
console.log('PASS local: TypeScript ES5, six modes, original baseline outputs/guide, paired exclusions, 9 same definitions, balanced call counters, zero timing-query/pause/background work, INFO retained where intended, authored execution disabled in all modes; query-free existing ? snapshots, pending CHAT, final report wait and completed state. No milliseconds, PXT or in-game bottleneck result claimed.');
