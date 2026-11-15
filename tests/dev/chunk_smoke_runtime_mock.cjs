/* Smoke fixture through the existing full FunctionFile/receiver VM harness; not real-game PASS. */
const fs=require('fs'),path=require('path'),vm=require('vm');
let harness=fs.readFileSync(path.join(__dirname,'chunk_functionfile_runtime_mock.cjs'),'utf8').split('const f=fixture();')[0];
if(!harness.includes("tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts"))throw Error('integration harness changed');
harness=harness.replace('tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts','tests/CHUNK_FUNCTIONFILES_SMOKE_MAIN.ts');
const checks=`
const f=fixture();f.chats.smping();assert.equal(f.out.at(-1),'SMOKE_CHAT_OK');assert.equal(f.executed.length,0);
assert.equal(f.run('smoke'),2,f.out.join('\\n'));assert.equal(f.executed.length,26);assert.equal(f.objectives.get('cbx_ff1').getScore('#sm_r'),33);
assert.equal(f.clockStages.length,6);assert(f.out.includes('say SMOKE_BEGIN'));assert(f.out.includes('say SMOKE_NEST_OK'));assert(f.out.includes('say SMOKE_PASS_33'));
const begin=f.native.find(s=>s.startsWith('scriptevent cbxp4o2h:begin ')).split(' ');assert(Number(begin[4])>1400);assert.equal(f.executed.filter(s=>s==='scoreboard players add #sm_r cbx_ff1 1').length,16);
assert(!f.executed.some(s=>s.startsWith('function ')),'local references flattened');assert(!f.native.some(s=>s.includes(':batch ')));
const id=f.ctx.MCFunctionOrderedPreview.lastRequestId();assert.equal(f.run('smoke'),2);assert.notEqual(f.ctx.MCFunctionOrderedPreview.lastRequestId(),id);assert.equal(f.objectives.get('cbx_ff1').getScore('#sm_r'),33);
fs.rmSync(temp,{recursive:true,force:true});console.log('PASS smoke local: full TypeScript ES5, chat, 3 definitions, local flatten, 26 ordered steps, nested execute output, scores17/33, 16 literal adds, ACK2, six ON queries, repeat reset and new request ID; encoded='+begin[4]+', chunks='+begin[3]+', max native='+Math.max(...f.native.map(s=>s.length))+'. Real Education smoke pending.');
`;
vm.runInNewContext(harness+checks,{require,process,console,__dirname,Buffer},{filename:__filename});
