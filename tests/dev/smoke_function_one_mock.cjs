const fs=require('fs'),path=require('path'),vm=require('vm');
let h=fs.readFileSync(path.join(__dirname,'chunk_functionfile_runtime_mock.cjs'),'utf8').split('const f=fixture();')[0];
if(!h.includes('tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts'))throw Error('integration harness changed');
h=h.replace('tests/CHUNK_FUNCTIONFILES_ON_MAIN.ts','tests/SMOKE_FUNCTION_ONE_MAIN.ts');
const checks=`
const f=fixture();assert.equal(f.executed.length,0);assert.equal(f.run('ffone'),2);assert.deepEqual(f.executed,['say FF_ONE_OK']);assert.equal(f.clockStages.length,6);assert(f.native.some(s=>s.startsWith('scriptevent cbxp4o2h:begin ')));assert(f.out.includes('say FF_ONE_OK'));
fs.rmSync(temp,{recursive:true,force:true});console.log('PASS local single FunctionFile: full TS ES5, definition capture only, one SAY via normal FunctionFile/native chunk path, ACK2/six ON queries. Real-game FunctionFile case pending.');
`;
vm.runInNewContext(h+checks,{require,process,console,__dirname,Buffer},{filename:__filename});
