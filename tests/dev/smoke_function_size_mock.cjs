const fs=require('fs'),path=require('path'),vm=require('vm');
let h=fs.readFileSync(path.join(__dirname,'chunk_functionfile_runtime_mock.cjs'),'utf8').split('const f=fixture();')[0];
if(!h.includes('tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts'))throw Error('integration harness changed');
h=h.replace('tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts','tests/SMOKE_FUNCTION_SIZE_MAIN.ts');
const checks=`
const f=fixture(),rows=[],ids=[];assert.equal(f.executed.length,0);
for(const [count,length,parts]of [[2,121,2],[13,844,9],[26,1689,18]]){
 const before=f.executed.length,frames=f.native.length,clocks=f.clockStages.length;
 assert.equal(f.run('ff'+count),2);const expected=Array.from({length:count},(_,i)=>'say FF'+count+'_STEP_'+String(i+1).padStart(2,'0'));
 assert.deepEqual(f.executed.slice(before),expected);assert.equal(f.clockStages.length-clocks,6);
 const begin=f.native.slice(frames).find(s=>s.startsWith('scriptevent cbxp4o2h:begin ')).split(' ');ids.push(begin[2]);assert.equal(Number(begin[3]),parts);assert.equal(Number(begin[4]),length);
 rows.push({commands:count,encoded:length,parts,ack:f.ctx.MCFunctionOrderedPreview.lastAckStatus()});
}
assert.equal(new Set(ids).size,3);assert.equal(f.executed.length,41);assert.equal(f.clockStages.length,18);assert(Math.max(...f.native.map(s=>s.length))<=200);
fs.rmSync(temp,{recursive:true,force:true});console.log('PASS local size smoke: full TS ES5, exact ordered SAY plans, three independent FunctionFile requests, ACK2/six ON queries each, 12-command and 1400 encoded-character configured caps exceeded. '+JSON.stringify(rows)+'. Real-game size cases pending.');
`;
vm.runInNewContext(h+checks,{require,process,console,__dirname,Buffer},{filename:__filename});
