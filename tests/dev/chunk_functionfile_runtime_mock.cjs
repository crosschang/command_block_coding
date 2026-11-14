/* Local semantic test only. No PXT or real Minecraft execution is claimed.
 * Run: NODE_PATH=<typescript installation>/node_modules node tests/dev/chunk_functionfile_runtime_mock.cjs
 * The optional receiver argument is a local-only BP execution.js; BP code is never committed.
 */
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path'),os=require('os'),ts=require('typescript');
const root=path.resolve(__dirname,'../..'),config=JSON.parse(fs.readFileSync(path.join(root,'pxt.json')));
const files=config.files.filter(f=>f.endsWith('.ts')&&f!=='main.ts').map(f=>path.join(root,f));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cbx-chunk-'));let compiled='';
const program=ts.createProgram([...files,path.join(__dirname,'chunk_preview_api.d.ts'),path.join(root,'tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts')],{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None,outFile:path.join(temp,'all.js'),skipLibCheck:true});
const errors=ts.getPreEmitDiagnostics(program).filter(d=>d.category===ts.DiagnosticCategory.Error);
assert.equal(errors.length,0,ts.formatDiagnosticsWithColorAndContext(errors,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));
program.emit(undefined,(file,data)=>{if(file.endsWith('.js'))compiled=data});assert(compiled);
const receiverPath=process.argv[2];assert(receiverPath,'Pass local BP execution.js path (not included in git)');
const receiver=fs.readFileSync(receiverPath,'utf8').replace(/^import .*?;\s*$/m,'');
function fixture(options={}){
 const chats={},out=[],native=[],executed=[],jobs=[],events=[],objectives=new Map(),clockStages=[];
 const world={scoreboard:{getObjective:id=>objectives.get(id),addObjective:id=>{const scores=new Map();const o={getScore:p=>scores.get(p.id||p),setScore:(p,n)=>scores.set(p.id||p,n),removeParticipant:p=>scores.delete(p.id||p)};objectives.set(id,o);return o}}};
 const system={currentTick:100,run:f=>jobs.push(f),runTimeout:()=>{},afterEvents:{scriptEventReceive:{subscribe:f=>events.push(f)}}};
 const p={id:'owner',typeId:'minecraft:player',tags:new Set(),sendMessage:s=>out.push(s),hasTag:t=>p.tags.has(t),addTag:t=>p.tags.add(t),removeTag:t=>p.tags.delete(t),runCommand:line=>{executed.push(line);return {successCount:command(line,true)?1:0}}};
 const score=(obj,who)=>objectives.get(obj)?.getScore(who==='@s'?p:who);
 function command(line,fromReceiver=false){
  if(!fromReceiver){native.push(line);assert(line.length<=200,'all submitted native commands <=200 chars');}
  let m=/^scriptevent (\S+) (.*)$/.exec(line);
  if(m){if(options.failPart&&m[1].endsWith(':part'))return false;events.forEach(f=>f({id:m[1],message:m[2],sourceEntity:p}));assert.equal(executed.length,options.executedBefore||0,'no partial execution');return true;}
  if(line.startsWith('tellraw ')){out.push(line);return true}
  if(line.startsWith('say ')){out.push(line);return true}
  m=/^scoreboard players (set|add|test|reset) (\S+) (\S+)(?: (-?\d+)(?: (-?\d+))?)?$/.exec(line);
  if(m){const o=objectives.get(m[3]);if(!o)return false;const who=m[2]==='@s'?p:m[2];if(m[1]==='set'){o.setScore(who,+m[4]);return true}if(m[1]==='add'){o.setScore(who,(o.getScore(who)||0)+Number(m[4]));return true}if(m[1]==='reset'){o.removeParticipant(who);return true}const n=o.getScore(who);return n!==undefined&&n>=+m[4]&&n<=+m[5];}
  m=/^scoreboard players operation (\S+) (\S+) (=|\+=) (\S+) (\S+)$/.exec(line);
  if(m){let n=score(m[2],m[1]),r=score(m[5],m[4]);if(r===undefined)return false;objectives.get(m[2]).setScore(m[1],m[3]==='='?r:n+r);return true}
  m=/^tag @s (add|remove) (\S+)$/.exec(line);if(m){if(m[1]==='add')p.tags.add(m[2]);else p.tags.delete(m[2]);return true}
  m=/^testfor @s\[tag=(\S+)\]$/.exec(line);if(m)return p.tags.has(m[1]);
  if(line.startsWith('execute ')){
   let t=line.split(' '),pass=true;
   while(t[0]==='execute'){
    t.shift();while(t[0]==='if'||t[0]==='unless'){const mode=t.shift();assert.equal(t.shift(),'score');const who=t.shift(),obj=t.shift();assert.equal(t.shift(),'matches');const value=t.shift();const equal=score(obj,who)===Number(value);pass=pass&&(mode==='if'?equal:!equal)}assert.equal(t.shift(),'run');
   }
   return pass&&command(t.join(' '),true);
  }
  throw Error('unexpected command '+line);
 }
 function flush(){while(jobs.length){system.currentTick++;jobs.shift()()}}
 const ctx=vm.createContext({console,Math,Number,Set,Map,system,world,TimeQuery:{GameTime:1},gameplay:{timeQuery:()=>{clockStages.push(ctx.MCFunctionOrderedPreview.lastClockStage());if(options.onClock)options.onClock(ctx,native);return system.currentTick}},loops:{pause:()=>flush(),forever:()=>{throw Error('unexpected background worker')}},player:{onChat:(n,f)=>chats[n]=f,say:s=>out.push(s),execute:command}});
 vm.runInContext(receiver,ctx);flush();world.scoreboard.addObjective('cbx_ff1');
 vm.runInContext(compiled,ctx);assert.equal(executed.length,0,'definition capture never executes authored commands');
 return{ctx,chats,out,native,executed,clockStages,p,objectives,flush,run(name){options.executedBefore=executed.length;chats[name]();flush();return ctx.MCFunctionOrderedPreview.lastAckStatus()}};
}
const f=fixture();assert.equal(f.run('ffready'),2);assert.equal(f.run('ffreset'),2);assert.equal(f.executed.length,4);
const before=f.executed.length;assert.equal(f.run('ffflow'),2,f.out.join('\n'));
assert.equal(f.executed.length-before,5,'five ordered batch commands');
assert.equal(f.objectives.get('cbx_ff1').getScore('#r'),17);assert(f.p.tags.has('cbx_ff_ok'));
f.run('ffcheck');assert(f.out.some(s=>s.includes('result17=true goodTag=true badTag=false ack=2')));
assert.equal(f.run('fffalse'),9);assert(!f.p.tags.has('cbx_ff_bad'));f.run('ffcheck');assert(f.out.some(s=>s.includes('ack=9')));
const clocks=f.clockStages.length;f.run('ffstate');assert.equal(f.clockStages.length,clocks,'status must not query clock');
assert(f.native.some(s=>s.startsWith('scriptevent cbxp4o2h:begin ')));assert(!f.native.some(s=>s.includes(':batch ')));
assert.equal(f.clockStages.length,24,'four completed actual requests, six clock points each');
// Freeze/re-entry at the first native clock yield: original AST and extra submit must not affect current plan.
let node,entered=false;const frozen=fixture({onClock:(ctx,native)=>{if(!node||entered)return;entered=true;node.message='MUTATED';const n=native.length;ctx.MCFunctionOrderedPreview.submit('reentrant',[ctx.MCFunctionAST.createSayCommand('BAD')]);assert(native.length>=n);}});
node=frozen.ctx.MCFunctionAST.createSayCommand('ORIGINAL');frozen.ctx.RuntimeBridge.initializePreview();frozen.ctx.MCFunctionOrderedPreview.submit('snapshot',[node]);assert(frozen.executed.includes('say ORIGINAL'));assert(!frozen.executed.includes('say MUTATED'));assert(!frozen.executed.includes('say BAD'));
const fail=fixture({failPart:true});assert.equal(fail.run('ffsetup'),6);assert.equal(fail.executed.length,0,'failed incomplete request not executed');
const largeBefore=f.executed.length;assert.equal(f.run('fflarge'),2);assert.equal(f.executed.length-largeBefore,66);assert.equal(f.objectives.get('cbx_ff1').getScore('#r'),81);f.run('fflargecheck');assert(f.out.some(s=>s.includes('result81=true ack=2')));
const largeBegin=f.native.filter(s=>s.startsWith('scriptevent cbxp4o2h:begin ')).at(-1).split(' ');assert(Number(largeBegin[4])>1400);assert(Number(largeBegin[3])>15);
const cap=fixture();cap.ctx.RuntimeBridge.initializePreview();cap.ctx.MCFunctionOrderedPreview.submit('long_line',[cap.ctx.MCFunctionAST.createSayCommand('x'.repeat(360))]);assert.equal(cap.ctx.MCFunctionOrderedPreview.lastAckStatus(),2);assert.equal(cap.executed.length,1,'single command encoded >1400 accepted');
const comments=fixture();comments.ctx.RuntimeBridge.initializePreview();comments.ctx.MCFunctionOrderedPreview.submit('comments',[comments.ctx.MCFunctionAST.createRawCommand('# full line comment'),comments.ctx.MCFunctionAST.createSayCommand('HASH # preserved')]);assert.equal(comments.ctx.MCFunctionOrderedPreview.lastAckStatus(),2);assert.deepEqual(comments.executed,['say HASH # preserved']);
const integrity=fixture();integrity.ctx.RuntimeBridge.initializePreview();integrity.ctx.MCFunctionOrderedPreview.submit('bad_line',[integrity.ctx.MCFunctionAST.createRawCommand('say a\nb')]);assert.equal(integrity.ctx.MCFunctionOrderedPreview.lastAckStatus(),7);assert.equal(integrity.executed.length,0);
fs.rmSync(temp,{recursive:true,force:true});
console.log('PASS TypeScript 5.9 ES5 compile + full public FunctionFile/Command path + real local BP receiver/mock Minecraft: definition capture, local call flattening, five-command flow, # fake scores=17, three-level execute, ACK2/9, six ON points/request, query-free status, frozen inputs/re-entry, incomplete-send failure, 66-command >1400 plan, one long command, full-line comment/embedded # preservation, malformed line rejection. max native chars='+Math.max(...f.native.map(s=>s.length))+'; large frames='+largeBegin[3]+' encoded='+largeBegin[4]+'. PXT and in-game integration pending.');
