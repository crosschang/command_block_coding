/* Local stage isolation through existing full sender/receiver harness, not in-game timing. */
const fs=require('fs'),path=require('path'),vm=require('vm');
let h=fs.readFileSync(path.join(__dirname,'chunk_functionfile_runtime_mock.cjs'),'utf8').split('const f=fixture();')[0];
if(!h.includes('tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts'))throw Error('integration harness changed');
h=h.replace('tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts','tests/MAKECODE_LINK_PROBE_MAIN.ts').replace('sourceEntity:p','sourceEntity:options.noSource?undefined:p');
const checks=`
const opts={},f=fixture(opts);assert.deepEqual(Object.keys(f.chats),['linkprobe']);assert.equal(f.native.length,0);assert.equal(f.clockStages.length,0);assert.equal(f.out.length,0);
const call=step=>{opts.executedBefore=f.executed.length;f.chats.linkprobe(step);f.flush()};
call(0);assert.equal(f.out.at(-1),'LINK_CHAT_OK');assert.equal(f.native.length,0);
call(1);assert(f.out.includes('P4O2H CHUNK_REJECT reason=FRAME_FORMAT'));assert.equal(f.out.at(-1),'LINK_EVENT_RETURN result=true');assert.equal(f.native.length,1);assert.equal(f.executed.length,0);
call(2);assert(f.out.at(-1).startsWith('LINK_TIME_RETURN tick='));assert.equal(f.clockStages.length,1);
const a=f.native.length;call(3);assert.equal(f.native.length-a,20);assert.equal(f.out.at(-1),'LINK_ACK_RETURN ready=true');assert.equal(f.executed.length,0);assert.equal(f.clockStages.length,1);
call(4);assert.equal(f.executed.length,1);assert.equal(f.executed[0],'say LINK_ONE_OK');assert.equal(f.ctx.MCFunctionOrderedPreview.lastAckStatus(),2);assert(f.out.at(-1).startsWith('LINK_SUBMIT_RETURN ack=2 id='));assert.equal(f.clockStages.length,7);
const before=[f.native.length,f.clockStages.length,f.executed.length];call(9);assert(f.out.at(-1).startsWith('LINK_STATE stage=SUBMIT_RETURN clock=VERIFY_EXIT ack=2'));assert.deepEqual([f.native.length,f.clockStages.length,f.executed.length],before);
const missing=fixture();missing.objectives.delete('cbxo2h');missing.chats.linkprobe(3);assert.equal(missing.out.at(-1),'LINK_ACK_RETURN ready=false');assert.equal(missing.executed.length,0);
const server=fixture({noSource:true});server.chats.linkprobe(1);assert.equal(server.out.at(-1),'LINK_EVENT_RETURN result=true');assert(!server.out.some(s=>s.includes('CHUNK_REJECT')));
let wait;wait=fixture({onClock:()=>{throw Error('INJECTED_TIME_ERROR')}});let err='';try{wait.chats.linkprobe(2)}catch(e){err=e.message};assert.equal(err,'INJECTED_TIME_ERROR');const q=wait.clockStages.length;wait.chats.linkprobe(9);assert(wait.out.at(-1).startsWith('LINK_STATE stage=TIME_WAIT'));assert.equal(wait.clockStages.length,q);
fs.rmSync(temp,{recursive:true,force:true});console.log('PASS local: one chat registration and zero startup work, stages0..4 isolated, receiver probe and native return distinguished, one GameTime query, calibration19+output1 calls, one AST command/ACK2/six transport ON points, query-free status, missing objective false, absent source no receiver response, injected wait-stage snapshot. Real MakeCode event delivery/latency unverified.');
`;
vm.runInNewContext(h+checks,{require,process,console,__dirname,Buffer},{filename:__filename});
