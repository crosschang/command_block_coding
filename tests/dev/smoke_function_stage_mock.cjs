// Local semantic checks; asynchronous Minecraft scheduling is not simulated.
const fs=require('fs'),path=require('path'),vm=require('vm');
let h=fs.readFileSync(path.join(__dirname,'chunk_functionfile_runtime_mock.cjs'),'utf8').split('const f=fixture();')[0];
h=h.replace('tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts','tests/SMOKE_FUNCTION_STAGE_MAIN.ts');
const checks=`
const f=fixture();
for(const n of [2,13,26]){
 const start=f.executed.length,clocks=f.clockStages.length;
 assert.equal(f.run('ff'+n),2);
 assert.deepEqual(f.executed.slice(start),Array.from({length:n},(_,i)=>'say FF'+n+'_STEP_'+String(i+1).padStart(2,'0')));
 assert.equal(f.clockStages.length-clocks,6);
 assert.equal(f.ctx.MCFunctionOrderedPreview.lastExecutionStage(),'FINISHED');
}
for(const step of ['CHAT_ENTER ff26','RESOLVE ff26','FLATTEN_BEGIN ff26','FLATTEN_RETURN steps=26','COMPILE_BEGIN ff26','COMPILE_RETURN steps=26','ENTER_CLOCK_BEFORE','ENTER_CLOCK_RETURN','ENCODE_RETURN chars=1689','BEGIN_BEFORE parts=18','PART_BEFORE 18/18','COMMIT_BEFORE','ACK_RETURN status=2','FINISHED'])assert(f.out.some(s=>s.includes(step)),step);
const clocks=f.clockStages.length,natives=f.native.length;
f.chats.ffwhere();assert.equal(f.clockStages.length,clocks);assert.equal(f.native.length,natives);assert(f.out.some(s=>s.includes('FF_WHERE stage=FINISHED')));
f.chats.traceoff();const at=f.out.length;assert.equal(f.run('ff26'),2);assert(!f.out.slice(at).some(s=>s.includes('NATIVE_TRACE')));
let paused=false;
const stalled=fixture({onClock:(ctx)=>{if(paused)return;paused=true;assert.equal(ctx.MCFunctionOrderedPreview.lastExecutionStage(),'ENTER_CLOCK_WAIT');assert.equal(ctx.MCFunctionOrderedPreview.lastClockStage(),'ENTER_CLOCK_WAIT');throw Error('injected clock wait');}});
assert.throws(()=>stalled.run('ff26'),/injected clock wait/);assert.equal(stalled.executed.length,0);assert.equal(stalled.ctx.MCFunctionOrderedPreview.lastExecutionStage(),'ENTER_CLOCK_WAIT');
fs.rmSync(temp,{recursive:true,force:true});console.log('PASS stage trace: exact 2/13/26 command plans, ACK2 and six ON calls each, stage coverage, query-free snapshot, trace OFF quiet, injected first-clock stop retained. Real-game scheduling pending.');
`;
vm.runInNewContext(h+checks,{require,process,console,__dirname,Buffer},{filename:__filename});
