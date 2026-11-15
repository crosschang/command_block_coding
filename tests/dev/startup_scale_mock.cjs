/* Size/registration isolation, local VM only; no elapsed-time claims. */
const fs=require('fs'),path=require('path'),os=require('os'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'../..'),cfg=JSON.parse(fs.readFileSync(path.join(root,'pxt.json'))),temp=fs.mkdtempSync(path.join(os.tmpdir(),'startup-scale-'));
const files=cfg.files.filter(f=>f.endsWith('.ts')&&f!=='main.ts').map(f=>path.join(root,f));let js='';
const p=ts.createProgram([...files,path.join(__dirname,'chunk_preview_api.d.ts'),path.join(__dirname,'STARTUP_SCALE_MAIN.ts')],{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None,skipLibCheck:true,outFile:path.join(temp,'all.js')});
const errors=ts.getPreEmitDiagnostics(p).filter(d=>d.category===ts.DiagnosticCategory.Error);assert.equal(errors.length,0,ts.formatDiagnosticsWithColorAndContext(errors,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));p.emit(undefined,(f,s)=>{if(f.endsWith('.js'))js=s});
const split=js.lastIndexOf('StartupProbe.scale(1)');assert(split>0);const lib=js.slice(0,split);
function run(id){const output=[],chats=[],commands=[],names=[];let name='';
 const ctx=vm.createContext({console,Math,Number,Map,Set,gameplay:{timeQuery:()=>{throw Error('unexpected game clock')}},loops:{pause:()=>{throw Error('unexpected delay')},forever:()=>{throw Error('unexpected worker')}},player:{say:s=>output.push(s),onChat:n=>chats.push(n),execute:()=>{throw Error('unexpected native command/output')}}});
 vm.runInContext(lib,ctx);const def=ctx.FunctionFile.define,cap=ctx.FunctionFile.capturePreviewAction;
 ctx.FunctionFile.define=(n,fn)=>{name=n;names.push(n);return def(n,fn)};
 ctx.FunctionFile.capturePreviewAction=(issues,action,node)=>{let r=cap(issues,action,node);if(r&&node)commands.push({name,line:ctx.MCFunctionCompiler.compileCommand(node)});return r};
 ctx.StartupProbe.scale(id);return{ctx,output,chats,commands,names};
}
const cases=[null];const sizes=[[1,8],[1,64],[1,256],[8,64],[32,64],[1,64],[8,64],[32,64]];
for(let id=1;id<=8;id++){
 const r=run(id);cases.push(r);const [defs,cmds]=sizes[id-1];assert.equal(r.output.length,1);assert(r.output[0].startsWith('SCALE_RESULT case='+id+' defs='+defs+' commands='+cmds));assert.equal(r.names.length,defs);assert.equal(r.commands.length,cmds);assert(r.commands.every(c=>c.line==='scoreboard players add #r cbx_scale 1'));
 assert.equal(r.chats.length,id>=6?0:2+2*defs);for(const key of ['CAPTURE','CHECK','STORE','DIAG','CHAT','OUTPUT']){let m=new RegExp(key+'=(\\d+)/(\\d+)').exec(r.output[0]);assert.equal(m[1],m[2],key+' unfinished')}
 assert.equal(r.ctx.MCFunctionDiagnostics.countLevel(0),0);assert.equal(r.ctx.MCFunctionDiagnostics.countLevel(1),0);assert(r.output[0].includes("DIAG="+defs+"/"+defs));
 assert.equal(r.ctx.FunctionFile.runPreview('scale1'),true);assert.equal(r.output.at(-1),'BENCH_EXECUTION_DISABLED');const n=r.commands.length;r.ctx.StartupProbe.scale(id);assert.equal(r.output.at(-1),'SCALE_RESTART_REQUIRED');assert.equal(r.commands.length,n);console.log(r.output[0]);
}
for(const [a,b]of [[2,6],[4,7],[5,8]]){assert.deepEqual(cases[a].commands,cases[b].commands);assert.deepEqual(cases[a].names,cases[b].names);const strip=s=>s.replace(/case=\d+/,'case=X').replace(/chat=(ON|OFF)/,'chat=X').replace(/CHAT=\d+/g,'CHAT=X');assert.equal(strip(cases[a].output[0]),strip(cases[b].output[0]));}
const bad=run(9);assert.equal(bad.output[0],'SCALE_INVALID case=1..8');assert.equal(bad.commands.length,0);
const off=run(0);assert.equal(off.ctx.StartupProbe.isProbe(),false);assert.equal(off.ctx.StartupProbe.skip('CHAT'),false);assert.equal(off.ctx.StartupProbe.skip('OUTPUT'),false);
fs.rmSync(temp,{recursive:true,force:true});console.log('PASS local: 8 cases, exact canonical AST commands, paired chat-only exclusion, diagnostic storage, balanced counters, one result per case, no native commands/clocks/pause/worker, no repeat contamination; default profiling OFF. Not real-game timing.');
