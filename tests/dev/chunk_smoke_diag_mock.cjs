/* Local-only pending-state observation; not proof the game schedules this event while waiting. */
const fs=require('fs'),path=require('path'),vm=require('vm');
let harness=fs.readFileSync(path.join(__dirname,'chunk_functionfile_runtime_mock.cjs'),'utf8').split('const f=fixture();')[0];
if(!harness.includes('tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts'))throw Error('integration harness changed');
harness=harness.replace('tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts','tests/CHUNK_FUNCTIONFILES_SMOKE_DIAG_MAIN.ts');
const checks=`
let pending=false,f;
f=fixture({onClock:(ctx,native)=>{if(!pending&&ctx.MCFunctionOrderedPreview.lastClockStage()==='ENTER_CLOCK_WAIT'){
 pending=true;const n=native.length,q=f.clockStages.length;f.chats.smstate();assert.equal(native.length,n);assert.equal(f.clockStages.length,q);
 assert(f.out.at(-1).startsWith('SMOKE_STATE phase=CALL clock=ENTER_CLOCK_WAIT ack=7 id='));
}}});
assert.equal(f.run('smgo'),2);assert(pending);assert.equal(f.executed.length,26);assert.equal(f.clockStages.length,6);assert(f.out.includes('SMOKE_DIAG_RETURN found=true'));
assert.equal(f.objectives.get('cbx_ff1').getScore('#sm_r'),33);const n=f.native.length,q=f.clockStages.length;f.chats.smstate();assert.equal(f.native.length,n);assert.equal(f.clockStages.length,q);assert(f.out.at(-1).startsWith('SMOKE_STATE phase=RETURN clock=VERIFY_EXIT ack=2 id='));
fs.rmSync(temp,{recursive:true,force:true});console.log('PASS smoke diagnostic local: full TypeScript ES5, same 26-command execution/score33/ACK2/six ON points, CALL snapshot at clock wait and RETURN snapshot, getter-only state adds no game clock/native execute. Real-game pending event delivery remains unverified.');
`;
vm.runInNewContext(harness+checks,{require,process,console,__dirname,Buffer},{filename:__filename});
