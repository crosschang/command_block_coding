// Actual local BP receiver + mock Minecraft; scheduling effectiveness needs game video.
const fs=require('fs'),path=require('path'),vm=require('vm');
let h=fs.readFileSync(path.join(__dirname,'chunk_functionfile_runtime_mock.cjs'),'utf8').split('const f=fixture();')[0];
h=h.replace('tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts','tests/SMOKE_FUNCTION_GAP_MAIN.ts');
h=h.replace('pause:()=>flush()','pause:(ms)=>{if(options.onPause)options.onPause(ctx,ms);flush()}');
h=h.replace('run(name){','run(name,...args){').replace('chats[name]();flush();','chats[name](...args);flush();');
const checks=`
const wires=[];
for(const ms of [100,1,0]){
 const pauses=[];
 const f=fixture({onPause:(ctx,delay)=>{
  const stage=ctx.MCFunctionOrderedPreview.lastExecutionStage();
  if(stage.endsWith('_PAUSE_WAIT')){pauses.push(delay);ctx.MCFunctionOrderedPreview.setChunkPauseMilliseconds(ms===0?100:0);assert.equal(ctx.MCFunctionOrderedPreview.chunkPauseMilliseconds(),ms);}
 }});
 assert.equal(f.run('ffgap',ms),2);
 assert.deepEqual(f.executed,Array.from({length:26},(_,i)=>'say FF26_STEP_'+String(i+1).padStart(2,'0')));
 assert.equal(f.clockStages.length,6);assert.equal(pauses.length,ms===0?0:60);assert(pauses.every(n=>n===ms));
 assert(!f.out.some(s=>s.includes('NATIVE_TRACE')));
 assert(f.out.some(s=>s.includes('FF_GAP_RETURN ms='+ms+' found=true ack=2')));
 const frames=f.native.filter(s=>s.startsWith('scriptevent ')).map(s=>s.replace(/q[1-9][0-9]{5}_[1-9][0-9]*/g,'REQUEST'));
 assert.equal(frames.length,20);wires.push(frames);
}
assert.deepEqual(wires[0],wires[1]);assert.deepEqual(wires[1],wires[2]);
let frozenNode,mutated=false;
const frozen=fixture({onPause:(ctx)=>{if(!frozenNode||mutated)return;mutated=true;frozenNode.message='MUTATED';ctx.MCFunctionOrderedPreview.setChunkPauseMilliseconds(0);}});
frozen.ctx.RuntimeBridge.initializePreview();frozen.ctx.MCFunctionOrderedPreview.setChunkPauseMilliseconds(100);frozenNode=frozen.ctx.MCFunctionAST.createSayCommand('FROZEN');frozen.ctx.MCFunctionOrderedPreview.submit('freeze',[frozenNode]);frozen.flush();assert(mutated);assert.deepEqual(frozen.executed,['say FROZEN']);assert.equal(frozen.ctx.MCFunctionOrderedPreview.lastAckStatus(),2);
const invalid=fixture();invalid.ctx.MCFunctionOrderedPreview.setChunkPauseMilliseconds(100);for(const v of [-1,2,101,NaN]){invalid.ctx.MCFunctionOrderedPreview.setChunkPauseMilliseconds(v);assert.equal(invalid.ctx.MCFunctionOrderedPreview.chunkPauseMilliseconds(),100);}
const failed=fixture({failPart:true});assert.equal(failed.run('ffgap',100),6);assert.equal(failed.executed.length,0);assert(!failed.native.some(s=>s.startsWith('scriptevent cbxp4o2h:commit ')));
fs.rmSync(temp,{recursive:true,force:true});console.log('PASS gap control: 0/1/100ms, exact identical 20 wire frames / 26 commands, six ON queries, 0/60/60 pacing points, no trace, frozen commands/configuration, invalid settings, incomplete-send fail closed. Real-game delay prevention unverified.');
`;
vm.runInNewContext(h+checks,{require,process,console,__dirname,Buffer},{filename:__filename});
