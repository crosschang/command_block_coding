// Extension request + real decoder/typed response. Native transport is mocked.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
const code=['src/preview/cbx_live_query.ts','src/preview/query_result.ts'].map(p=>fs.readFileSync(path.join(root,p),'utf8')).join('\n');
const js=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2017}}).outputText;
function fixture(sent=true){const tags=new Set(),calls=[],ctx=vm.createContext({Math,TimeQuery:{GameTime:0},gameplay:{timeQuery:()=>100},player:{execute(line){calls.push(line);if(line==='testfor @s')return true;const m=/^testfor @s\[tag=(.*)\]$/.exec(line);if(m)return tags.has(m[1]);if(line.startsWith('scriptevent '))return sent;throw Error(line);}}});vm.runInContext(js,ctx);assert(ctx.MCFunctionLiveQuery.calibrate());return {L:ctx.MCFunctionLiveQuery,Q:ctx.QueryReadback,tags,calls};}
let count=0;function test(n,f){f();count++;console.log('LOCAL PASS '+n);}
for(const text of ['lesson_done','제주😀','name with spaces','x'.repeat(64)])test('Exact request metadata '+JSON.stringify(text),()=>{
 const h=fixture(),t=h.L.requestOwnTag(text),line=h.calls[h.calls.length-1];assert(t.sent);assert.equal(t.kind,h.L.Kind.OwnTagPresent);assert.equal(t.page,0);
 let hex='';for(let i=0;i<text.length;i++)hex+=text.charCodeAt(i).toString(16).padStart(4,'0');assert(line.endsWith('|tag_self|0|'+hex));
});
for(const value of ['', 'x'.repeat(65), 'a\nb', 'a\x7fb', undefined, null, 123])test('Invalid input is rejected without send '+JSON.stringify(value),()=>{
 const h=fixture(),before=h.calls.length,t=h.L.requestOwnTag(value);assert(!t.sent);assert.equal(t.failure,'INVALID_TAG_NAME');assert.equal(h.calls.length,before);
});
test('Generic request cannot omit the tag',()=>{const h=fixture(),n=h.calls.length,t=h.L.request(h.L.Kind.OwnTagPresent,0);assert(!t.sent);assert.equal(t.failure,'USE_REQUEST_OWN_TAG_BLOCK');assert.equal(h.calls.length,n);});
for(const value of [true,false])test('Boolean '+value+' uses four probes and common branch data',()=>{
 const h=fixture(),t=h.L.requestOwnTag('lesson_done'),b=t.token+'_';h.tags.add(b+'r');h.tags.add(b+(value?'v':'z'));
 const r=h.Q.readLive(t);assert(h.Q.hasBoolean(r));assert.equal(h.Q.booleanOr(r,!value),value);assert.equal(h.Q.readProbesOr(r,-1),4);assert.equal(r.total,1);assert(t.closed);
 assert(!h.Q.hasTextList(r));assert(!h.Q.hasNumber(r));
});
for(const suffixes of [[],['v','z']])test('Incomplete or conflicting Boolean is rejected '+suffixes,()=>{
 const h=fixture(),t=h.L.requestOwnTag('x'),b=t.token+'_';h.tags.add(b+'r');for(const s of suffixes)h.tags.add(b+s);const r=h.Q.readLive(t);assert.equal(r.reason,'INVALID_BOOLEAN_PACKET');assert(!h.Q.hasBoolean(r));
});
test('Pending does not become false or send ACK',()=>{const h=fixture(),t=h.L.requestOwnTag('x'),r=h.Q.readLive(t);assert.equal(r.state,h.Q.State.Pending);assert(!h.Q.hasBoolean(r));assert.equal(h.Q.booleanOr(r,true),true);assert(!t.closed);assert(!h.calls.some(x=>x.includes('cbxq4:ack')));});
test('Receiver error is not Boolean false',()=>{const h=fixture(),t=h.L.requestOwnTag('x');h.tags.add(t.token+'_e');h.tags.add(t.token+'_r');const r=h.Q.readLive(t);assert.equal(r.reason,'SERVER_ERROR');assert(!h.Q.hasBoolean(r));});
test('Repeated stored getters do not probe or send requests',()=>{const h=fixture(),t=h.L.requestOwnTag('x');h.tags.add(t.token+'_r');h.tags.add(t.token+'_z');const r=h.Q.readLive(t),n=h.calls.length;for(let i=0;i<100;i++)assert.equal(h.Q.booleanOr(r,true),false);assert.equal(h.calls.length,n);});
test('Closed ticket does not re-read a value',()=>{const h=fixture(),t=h.L.requestOwnTag('x');h.tags.add(t.token+'_r');h.tags.add(t.token+'_v');h.Q.readLive(t);const n=h.calls.length,r=h.Q.readLive(t);assert.equal(r.state,h.Q.State.Closed);assert(!h.Q.hasBoolean(r));assert.equal(h.calls.length,n);assert.equal(h.Q.readProbesOr(r,-1),-1);});
test('Failed send is explicit',()=>{const h=fixture(false),t=h.L.requestOwnTag('x');assert(!t.sent);assert.equal(t.failure,'SEND_FAILED');assert(!h.Q.hasBoolean(h.Q.readLive(t)));});
console.log('TOTAL '+count+' LOCAL PASS; native transport mocked, GAME PENDING');
