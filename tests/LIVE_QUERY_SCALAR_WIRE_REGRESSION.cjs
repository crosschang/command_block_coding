// Real V4 request/decoder + common response. Wire tags/API timing are fixtures.
// No behavior-pack source is included or required in the repository.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.join(__dirname,'..');
const code=['src/preview/cbx_live_query.ts','src/preview/query_result.ts'].map(p=>fs.readFileSync(path.join(root,p),'utf8')).join('\n');
const js=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2017}}).outputText;
function harness(){
 const tags=new Set(),sent=[];let tick=100,fail=false,calls=0;
 const ctx=vm.createContext({Math,TimeQuery:{GameTime:0},gameplay:{timeQuery(){return tick;}},player:{execute(line){
  calls++; if(line==='testfor @s')return true;
  const m=/^testfor @s\[tag=(.*)\]$/.exec(line);if(m)return tags.has(m[1]);
  if(line.startsWith('scriptevent ')){sent.push(line);return !fail;}throw Error('Unexpected world mutation: '+line);
 }}});vm.runInContext(js,ctx);
 const L=ctx.MCFunctionLiveQuery,Q=ctx.QueryReadback;assert(L.calibrate());
 return {L,Q,tags,sent,setTick:n=>tick=n,setFail:v=>fail=v,calls:()=>calls};
}
function bits(h,prefix,n,width){for(let i=0;i<width;i++)if(Math.floor(n/2**i)%2)h.tags.add(prefix+i);}
function timePacket(h,t,n,checksum=(n*31+73)%256){bits(h,t.token+'_v',n,15);bits(h,t.token+'_h',checksum,8);h.tags.add(t.token+'_r');}
let passed=0;function test(name,fn){fn();passed++;console.log('LOCAL PASS',name);}
test('Request is one event and pending is not numeric zero',()=>{
 const h=harness(),t=h.L.request(h.L.Kind.Daytime,0);assert(t.sent);assert.equal(h.sent.length,1);
 assert.match(h.sent[0],/^scriptevent cbxq4:req cbxq4\d+x\d+x\d{6}\|time_daytime\|0$/);
 const r=h.Q.readLive(t);assert.equal(r.state,h.Q.State.Pending);assert(!h.Q.hasNumber(r));assert.equal(h.Q.numberOr(r,-1),-1);assert.equal(h.sent.length,1);
});
for(const n of [0,1,6000,23999])test('Daytime '+n+' survives actual decoder into calculation',()=>{
 const h=harness(),t=h.L.request(h.L.Kind.Daytime,0);timePacket(h,t,n);const r=h.Q.readLive(t);
 assert(h.Q.hasNumber(r));assert.equal(h.Q.numberOr(r,-1)+100,n+100);assert.equal(h.sent.length,2);assert(h.sent[1].startsWith('scriptevent cbxq4:ack '));
 assert(t.closed);assert.equal(h.Q.readLive(t).state,h.Q.State.Closed);
});
for(const value of [false,true])test('Boolean '+value+' survives decoder into condition',()=>{
 const h=harness(),t=h.L.request(h.L.Kind.KeepInventory,0);h.tags.add(t.token+(value?'_v':'_z'));h.tags.add(t.token+'_r');
 const r=h.Q.readLive(t);assert(h.Q.hasBoolean(r));assert.equal(h.Q.booleanOr(r,!value),value);assert.equal(h.Q.booleanOr(r,!value)?'enabled':'disabled',value?'enabled':'disabled');
});
test('Invalid numeric checksum cannot become data',()=>{
 const h=harness(),t=h.L.request(h.L.Kind.Daytime,0);timePacket(h,t,1000,0);
 const r=h.Q.readLive(t);assert(!h.Q.hasNumber(r));assert.equal(r.reason,'INVALID_TIME_PACKET');
});
test('Out-of-range numeric value cannot become data',()=>{
 const h=harness(),t=h.L.request(h.L.Kind.Daytime,0);timePacket(h,t,30000);
 assert(!h.Q.hasNumber(h.Q.readLive(t)));
});
test('Absent or contradictory Boolean bits cannot become false',()=>{
 for(const both of [false,true]){const h=harness(),t=h.L.request(h.L.Kind.KeepInventory,0);h.tags.add(t.token+'_r');
 if(both){h.tags.add(t.token+'_v');h.tags.add(t.token+'_z');}
 const r=h.Q.readLive(t);assert(!h.Q.hasBoolean(r));assert.equal(r.reason,'INVALID_BOOLEAN_PACKET');}
});
test('Receiver error packet cannot become zero or false',()=>{
 const h=harness(),t=h.L.request(h.L.Kind.Daytime,0);h.tags.add(t.token+'_e');h.tags.add(t.token+'_r');
 const r=h.Q.readLive(t);assert.equal(r.reason,'SERVER_ERROR');assert(!h.Q.success(r));
});
test('Another token cannot satisfy this ticket',()=>{
 const h=harness(),a=h.L.request(h.L.Kind.Daytime,0),b=h.L.request(h.L.Kind.Daytime,0);timePacket(h,b,6000);
 assert.equal(h.Q.readLive(a).state,h.Q.State.Pending);assert.equal(h.Q.numberOr(h.Q.readLive(b),-1),6000);
});
test('Expiry cancels instead of returning numeric zero',()=>{
 const h=harness(),t=h.L.request(h.L.Kind.Daytime,0);h.setTick(1301);const r=h.Q.readLive(t);
 assert.equal(r.state,h.Q.State.Timeout);assert(!h.Q.hasNumber(r));assert(t.closed);assert(h.sent[1].startsWith('scriptevent cbxq4:cancel '));
});
test('Explicit cancel closes without exposing data',()=>{
 const h=harness(),t=h.L.request(h.L.Kind.Daytime,0);h.L.cancel(t);assert.equal(h.Q.readLive(t).state,h.Q.State.Closed);
});
test('Failed send and invalid scalar page never become pending measurements',()=>{
 const h=harness();h.setFail(true);const t=h.L.request(h.L.Kind.Daytime,0);assert.equal(h.Q.readLive(t).reason,'SEND_FAILED');
 const before=h.sent.length,bad=h.L.request(h.L.Kind.KeepInventory,1);assert(!bad.sent);assert.equal(h.sent.length,before);
});
console.log('TOTAL',passed,'LOCAL PASS; native receiver and GAME remain separate gates');
