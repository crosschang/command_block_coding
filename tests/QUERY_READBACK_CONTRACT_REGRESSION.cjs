// Tests the real common response and existing decoder adapter boundary.
// Transport snapshots are fixtures; this is not a live data channel GAME PASS.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.join(__dirname,'..'),pxt=JSON.parse(fs.readFileSync(path.join(root,'pxt.json')));
const code=pxt.files.filter(f=>f.endsWith('.ts')).map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const ctx=vm.createContext({Math,console,player:{onChat(){},say(){},execute(){throw Error('Unexpected world access');}},loops:{forever(){},pause(){throw Error('Unexpected polling');}}});
vm.runInContext(ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2017,module:ts.ModuleKind.None}}).outputText,ctx);
const Q=ctx.QueryReadback,L=ctx.MCFunctionLiveQuery;let passed=0;
function test(name,fn){fn();passed++;console.log('LOCAL PASS',name);}
test('Pending zero/false fields are not data',()=>{
 const r=Q.pending('r1');assert(!Q.success(r));assert(!Q.hasNumber(r));assert(!Q.hasBoolean(r));
 assert.equal(Q.numberOr(r,-99),-99);assert.equal(Q.booleanOr(r,true),true);assert.equal(Q.totalOr(r,-1),-1);
});
test('Actual numeric zero remains valid for arithmetic',()=>{
 const r=Q.numberResponse('r2',0);assert(Q.hasNumber(r));assert.equal(Q.numberOr(r,-1)+10,10);
});
test('Actual false remains valid for a condition',()=>{
 const r=Q.booleanResponse('r3',false);assert(Q.hasBoolean(r));assert.equal(Q.booleanOr(r,true),false);
});
test('Scalar type mismatches cannot be read as another type',()=>{
 const n=Q.numberResponse('r4',5),b=Q.booleanResponse('r5',true);
 assert(!Q.hasBoolean(n));assert(!Q.hasNumber(b));assert.equal(Q.numberOr(b,-1),-1);
});
test('Malformed scalar data is rejected',()=>{
 for(const n of [NaN,Infinity,-Infinity,'12'])assert(!Q.success(Q.numberResponse('r6',n)));
 for(const b of [0,1,'false',undefined])assert(!Q.success(Q.booleanResponse('r7',b)));
});
test('List snapshot is copied and Unicode is preserved',()=>{
 const items=['제주','custom:tag'];const r=Q.listResponse('r8',items,4);items[0]='changed';
 assert(Q.success(r));assert.equal(Q.textOr(r,0,'missing'),'제주');assert.equal(Q.totalOr(r,-1),4);
 assert.equal(Q.textOr(r,2,'missing'),'missing');assert.equal(Q.textOr(r,0.5,'missing'),'missing');
});
test('Empty list is a successful empty result, not unavailable data',()=>{
 const r=Q.listResponse('r9',[],0);assert(Q.success(r));assert.equal(Q.totalOr(r,-1),0);
});
test('Invalid list counts and items are rejected',()=>{
 for(const [items,total] of [[['a'],0],[[],NaN],[[],1.5],[[],Infinity],[[7],1]])assert(!Q.success(Q.listResponse('r10',items,total)));
});
let requested,snapshot,reads=0;
L.tryRead=t=>{reads++;assert.strictEqual(t,requested);return snapshot;};
function read(kind,change={}){
 requested={token:'session_request_42',kind,page:0,sent:true,failure:''};
 snapshot={kind,page:0,status:'OK',ready:true,ok:true,total:1,items:[],numberValue:1000,booleanValue:false,...change};
 const before=reads,r=Q.readLive(requested);assert.equal(reads,before+1);assert.equal(r.requestId,requested.token);return r;
}
test('Read obtains its own ticket snapshot and maps a number',()=>{
 const r=read(L.Kind.Daytime);assert(Q.hasNumber(r));assert.equal(Q.numberOr(r,-1),1000);
});
test('Read maps real false, tags and empty lists',()=>{
 assert(Q.hasBoolean(read(L.Kind.KeepInventory)));assert.equal(Q.booleanOr(read(L.Kind.KeepInventory),true),false);
 assert.equal(Q.textOr(read(L.Kind.MyTags,{items:['lesson'],total:1}),0,''),'lesson');
 assert(Q.success(read(L.Kind.MyTags,{items:[],total:0})));
});
test('Missing ticket never reaches the decoder',()=>{
 const before=reads;assert.equal(Q.reason(Q.readLive(undefined)),'MISSING_TICKET');assert.equal(reads,before);
});
test('Pending, expiry, closure and transport error remain distinct',()=>{
 assert.equal(Q.state(read(L.Kind.Daytime,{status:'PENDING',ready:false,ok:false})),Q.State.Pending);
 assert.equal(Q.state(read(L.Kind.Daytime,{status:'EXPIRED',ready:false,ok:false})),Q.State.Timeout);
 assert.equal(Q.state(read(L.Kind.Daytime,{status:'ALREADY_CLOSED',ready:false,ok:false})),Q.State.Closed);
 assert.equal(Q.state(read(L.Kind.Daytime,{status:'SERVER_ERROR',ready:true,ok:false})),Q.State.Error);
});
test('Kind/page mismatch and contradictory OK flags cannot expose data',()=>{
 assert.equal(Q.reason(read(L.Kind.Daytime,{kind:L.Kind.MyTags})),'QUERY_CONTEXT_MISMATCH');
 assert.equal(Q.reason(read(L.Kind.Daytime,{page:1})),'QUERY_CONTEXT_MISMATCH');
 assert(!Q.success(read(L.Kind.Daytime,{ready:false})));assert(!Q.success(read(L.Kind.Daytime,{ok:false})));
});
test('Execution ACK is not accepted as a query payload',()=>{
 requested={token:'r11',kind:L.Kind.Daytime,page:0,sent:true};snapshot={status:2};
 assert(!Q.success(Q.readLive(requested)));
});
console.log(JSON.stringify({passed,game:'PENDING',receiver:'Existing cbxq4 LAB receiver required; not P4O2H'}));
