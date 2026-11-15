/* The control changes only the three fake-player names. No game result inferred. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const original=fs.readFileSync(path.join(root,'tests/CHUNK_FUNCTIONFILES_SMOKE_DIAG_MAIN.ts'),'utf8');
const variant=fs.readFileSync(path.join(root,'tests/CHUNK_FUNCTIONFILES_SMOKE_NO_HASH_MAIN.ts'),'utf8');
assert.equal(variant,original.replaceAll('#sm_i','sm_i').replaceAll('#sm_t','sm_t').replaceAll('#sm_r','sm_r'),'only three name substitutions permitted');
assert(!variant.includes('#sm_'));
let mock=fs.readFileSync(path.join(__dirname,'chunk_smoke_diag_mock.cjs'),'utf8');
assert(mock.includes('tests/CHUNK_FUNCTIONFILES_SMOKE_DIAG_MAIN.ts'));assert(mock.includes("getScore('#sm_r')"));
mock=mock.replaceAll('tests/CHUNK_FUNCTIONFILES_SMOKE_DIAG_MAIN.ts','tests/CHUNK_FUNCTIONFILES_SMOKE_NO_HASH_MAIN.ts').replaceAll("getScore('#sm_r')","getScore('sm_r')");
vm.runInNewContext(mock,{require,process,console,__dirname,__filename,Buffer},{filename:__filename});
console.log('PASS no-hash local: exact three-name-only fixture delta; same full TS ES5, 26 steps, nested execute, score33, ACK2, six ON points, getter-only pending/return snapshots. Hash-name baseline retained; real-game cause remains unverified.');
