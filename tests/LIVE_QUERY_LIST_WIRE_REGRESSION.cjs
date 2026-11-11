// Real V4 list decoder and typed response; native tag transport is a fixture.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.join(__dirname,'..');const code=['src/preview/cbx_live_query.ts','src/preview/query_result.ts'].map(p=>fs.readFileSync(path.join(root,p),'utf8')).join('\n');
const js=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2017}}).outputText;
const alphabet='abcdefghijklmnopqrstuvwxyz0123456789_-ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function fixture(kind=3,page=0){const tags=new Set(),sent=[];const c=vm.createContext({Math,TimeQuery:{GameTime:0},gameplay:{timeQuery:()=>100},player:{execute(line){if(line==='testfor @s')return true;const m=/^testfor @s\[tag=(.*)\]$/.exec(line);if(m)return tags.has(m[1]);if(line.startsWith('scriptevent ')){sent.push(line);return true;}throw Error(line);}}});vm.runInContext(js,c);const L=c.MCFunctionLiveQuery,Q=c.QueryReadback;assert(L.calibrate());const ticket=L.request(kind,page);return {tags,sent,L,Q,ticket};}
function bits(h,prefix,n,width){for(let i=0;i<width;i++)if(Math.floor(n/2**i)%2)h.tags.add(prefix+i);}
function hash(items,total,page){let v=(total+page*17+items.length*19)%256;for(const s of items){v=(v*31+s.length)%256;for(let i=0;i<s.length;i++)v=(v*31+s.charCodeAt(i))%256;}return v;}
function packet(h,items,total=items.length,mode=0,options={}){const b=h.ticket.token+'_';bits(h,b+'n',items.length,2);bits(h,b+'t',total,12);
 for(let i=0;i<items.length;i++){const s=items[i];bits(h,b+'l'+i+'x',s.length,6);bits(h,b+'m'+i+'x',mode,2);const w=mode===0?6:mode===1?7:16;
 for(let j=0;j<s.length;j++)bits(h,b+'c'+i+'x'+j+'x',mode===0?alphabet.indexOf(s[j]):s.charCodeAt(j),w);}
 bits(h,b+'h',options.badHash?0:hash(items,total,h.ticket.page),8);
 if(options.range)h.tags.add(b+'o');h.tags.add(b+'r');}
let count=0;function test(name,fn){fn();count++;console.log('LOCAL PASS',name);}
for(const kind of [0,1,2,3])test('List kind '+kind+' reaches TextList and page count',()=>{const h=fixture(kind);packet(h,['alpha','beta'],7);const r=h.Q.readLive(h.ticket);assert(h.Q.hasTextList(r));assert.equal(h.Q.pageCountOr(r,-1),2);assert.equal(h.Q.totalOr(r,-1),7);assert.equal(h.Q.textOr(r,1,''),'beta');assert(h.ticket.closed);});
test('Final odd page contains exactly one item',()=>{const h=fixture(3,1);packet(h,['last'],3);const r=h.Q.readLive(h.ticket);assert(h.Q.hasTextList(r));assert.equal(h.Q.pageCountOr(r,-1),1);assert.equal(h.Q.totalOr(r,-1),3);});
test('Empty result is valid zero count, not absent data',()=>{const h=fixture();packet(h,[],0);const r=h.Q.readLive(h.ticket);assert(h.Q.hasTextList(r));assert.equal(h.Q.pageCountOr(r,-1),0);assert.equal(h.Q.totalOr(r,-1),0);});
test('ASCII7 preserves punctuation and spaces',()=>{const h=fixture();packet(h,['#counter: a'],1,1);assert.equal(h.Q.textOr(h.Q.readLive(h.ticket),0,''),'#counter: a');});
test('UTF16 preserves Korean, emoji and a full 32-unit item',()=>{for(const s of ['제주😀','한'.repeat(32)]){const h=fixture();packet(h,[s],1,2);assert.equal(h.Q.textOr(h.Q.readLive(h.ticket),0,''),s);}});
test('Duplicate display names are preserved as separate items',()=>{const h=fixture();packet(h,['same','same']);const r=h.Q.readLive(h.ticket);assert.equal(h.Q.pageCountOr(r,-1),2);assert.equal(h.Q.textOr(r,0,''),h.Q.textOr(r,1,''));});
test('Out of range is explicit, never successful empty list',()=>{const h=fixture(3,2);packet(h,[],3,0,{range:true});const r=h.Q.readLive(h.ticket);assert.equal(r.reason,'PAGE_OUT_OF_RANGE');assert(!h.Q.hasTextList(r));});
test('Missing range marker is invalid',()=>{const h=fixture(3,2);packet(h,[],3);assert.equal(h.Q.readLive(h.ticket).reason,'INVALID_PACKET_RANGE');});
test('Spurious range marker on empty snapshot is invalid',()=>{const h=fixture();packet(h,[],0,0,{range:true});assert.equal(h.Q.readLive(h.ticket).reason,'INVALID_PACKET_RANGE');});
test('Wrong page item count cannot silently truncate the result',()=>{const h=fixture(3,1);packet(h,['a','b'],3);assert.equal(h.Q.readLive(h.ticket).reason,'INVALID_PACKET_COUNT');});
test('Short page before the final page is invalid',()=>{const h=fixture();packet(h,['a'],3);assert.equal(h.Q.readLive(h.ticket).reason,'INVALID_PACKET_COUNT');});
test('Oversized item format is rejected without truncation',()=>{const h=fixture();packet(h,['a'.repeat(33)],1);assert.equal(h.Q.readLive(h.ticket).reason,'INVALID_PACKET_FORMAT');});
test('Checksum mismatch blocks list use',()=>{const h=fixture();packet(h,['alpha'],1,0,{badHash:true});assert.equal(h.Q.readLive(h.ticket).reason,'INVALID_PACKET_CHECKSUM');});
test('Pending is not an empty list',()=>{const h=fixture(),r=h.Q.readLive(h.ticket);assert(!h.Q.hasTextList(r));assert.equal(h.Q.pageCountOr(r,-1),-1);});
test('Scalar responses do not expose a page count',()=>{const h=fixture();assert.equal(h.Q.pageCountOr(h.Q.numberResponse('n',0),-1),-1);});
// Build independent prefix codes from the canonical decoder tree, not receiver code.
const decoder=fs.readFileSync(path.join(root,'src/preview/cbx_live_query.ts'),'utf8');
const tree={};for(const n of ['HUFF_TOKENS','HUFF_ZERO','HUFF_ONE','HUFF_SYMBOL'])tree[n]=JSON.parse(decoder.match(new RegExp('const '+n+': (?:string|number)\\[\\] = (\\[[^;]*\\]);'))[1]);
const codes={};function walk(node,code){const v=tree.HUFF_SYMBOL[node];if(v>=0)codes[tree.HUFF_TOKENS[v]]=code;else{walk(tree.HUFF_ZERO[node],code+'0');walk(tree.HUFF_ONE[node],code+'1');}}walk(0,'');
function literalHuff(text){let stream='';for(let i=0;i<text.length;i++){const s=text.charAt(i);if(codes[s])stream+=codes[s];else{stream+=codes['<ESC>'];const unit=text.charCodeAt(i);for(let b=0;b<16;b++)stream+=Math.floor(unit/2**b)%2?'1':'0';}}return stream;}
function huffPacket(h,text,stream=literalHuff(text)){
 const b=h.ticket.token+'_';bits(h,b+'n',1,2);bits(h,b+'t',1,12);bits(h,b+'l0x',text.length,6);bits(h,b+'m0x',3,2);
 for(let i=0;i<stream.length;i++)if(stream[i]==='1')h.tags.add(b+'c0x'+i+'x');bits(h,b+'h',hash([text],1,h.ticket.page),8);h.tags.add(b+'r');
}
for(const text of ['minecraft:','000_cbxql_a','000_제주','😀',String.fromCharCode(65535),String.fromCharCode(65535).repeat(32)])test('Existing Huffman mode restores '+JSON.stringify(text),()=>{const h=fixture();huffPacket(h,text,text==='minecraft:'?codes['minecraft:']:literalHuff(text));const r=h.Q.readLive(h.ticket);assert(h.Q.hasTextList(r));assert.equal(h.Q.textOr(r,0,''),text);assert(h.Q.readProbesOr(r,-1)>0);});
test('Huffman token overshoot cannot become a truncated string',()=>{const h=fixture();huffPacket(h,'a',codes['minecraft:']);assert.equal(h.Q.readLive(h.ticket).reason,'INVALID_HUFF_LENGTH');});
test('Transport metrics are distinct from query values',()=>{const h=fixture();packet(h,['alpha'],1);const r=h.Q.readLive(h.ticket);assert(r.hasReadMetrics);assert.equal(h.Q.readTicksOr(r,-1),0);assert(h.Q.readProbesOr(r,-1)>0);assert.equal(h.Q.readProbesOr(h.Q.numberResponse('fake',0),-1),-1);const closed=h.Q.readLive(h.ticket);assert(!closed.hasReadMetrics);assert.equal(h.Q.readProbesOr(closed,-1),-1);});
console.log('TOTAL',count,'LOCAL PASS; tag fixtures, GAME PENDING');
