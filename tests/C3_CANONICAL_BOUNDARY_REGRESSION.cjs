// Canonical source tests only: no PXT Editor or Minecraft execution.
const fs = require('fs'), path = require('path'), vm = require('vm');
const assert = require('node:assert/strict'), ts = require('typescript');
const root = path.join(__dirname, '..');
const pxt = JSON.parse(fs.readFileSync(path.join(root, 'pxt.json'), 'utf8'));
const source = pxt.files.filter(f => f.endsWith('.ts')).map(f => fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const compiled=ts.transpileModule(source,{reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2017,module:ts.ModuleKind.None}});
assert.equal((compiled.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const ctx=vm.createContext({Math,console,player:{onChat(){},say(){},execute(){throw Error('Unexpected world execution');}},loops:{forever(){},pause(){throw Error('Unexpected wait');}}});
vm.runInContext(compiled.outputText,ctx);
const A=ctx.MCFunctionAST,V=ctx.MCFunctionValidator,C=ctx.MCFunctionCompiler;
const K=A.ExecuteClauseKind,self=A.createSelectorPlayerTarget(A.createSelector(A.SelectorBase.Self));
const fake=A.createNamedPlayerTarget('C3Left'),other=A.createNamedPlayerTarget('C3Right');
const pos=A.createRelativePosition(0,1,0),end=A.createRelativePosition(1,1,1);
const command=c=>A.createExecuteCommand([c],A.createSayCommand('ok'));
let passed=0;
function test(n,f){f();passed++;console.log('LOCAL PASS',n);}
const cases=[
 [K.As,{target:self},'as @s'],[K.At,{target:self},'at @s'],
 [K.In,{dimension:A.ExecuteDimension.Nether},'in nether'],
 [K.Positioned,{position:pos},'positioned ~ ~1 ~'],
 [K.Rotated,{rotation:A.createRelativeRotation(10,0)},'rotated ~10 ~'],
 [K.FacingPosition,{facing:A.createFacingPosition(pos)},'facing ~ ~1 ~'],
 [K.FacingEntity,{facing:A.createFacingEntity(self.selector,A.EntityAnchor.Eyes)},'facing entity @s eyes'],
 [K.Align,{axes:'xz'},'align xz'],[K.Anchored,{anchor:A.EntityAnchor.Eyes},'anchored eyes'],
 [K.IfEntity,{target:self},'if entity @s'],[K.UnlessEntity,{target:self},'unless entity @s'],
 [K.IfBlock,{position:pos,blockId:'minecraft:stone'},'if block ~ ~1 ~ minecraft:stone'],
 [K.UnlessBlock,{position:pos,blockId:'minecraft:stone'},'unless block ~ ~1 ~ minecraft:stone'],
 [K.IfBlocks,{begin:pos,end,destination:pos,scan:A.ExecuteScan.All},'if blocks ~ ~1 ~ ~1 ~1 ~1 ~ ~1 ~ all'],
 [K.UnlessBlocks,{begin:pos,end,destination:pos,scan:A.ExecuteScan.Masked},'unless blocks ~ ~1 ~ ~1 ~1 ~1 ~ ~1 ~ masked'],
 [K.IfScoreMatches,{target:fake,objective:'custom_score',scoreRange:A.createMinMaxRange(-2,10)},'if score C3Left custom_score matches -2..10'],
 [K.UnlessScoreMatches,{target:fake,objective:'custom_score',scoreRange:A.createMinRange(-2)},'unless score C3Left custom_score matches -2..'],
 [K.PositionedAs,{target:self},'positioned as @s'],[K.RotatedAs,{target:self},'rotated as @s'],
 [K.IfScoreCompare,{target:fake,objective:'a',sourceTarget:other,sourceObjective:'b',scoreComparison:A.ExecuteScoreComparison.LessOrEqual},'if score C3Left a <= C3Right b'],
 [K.UnlessScoreCompare,{target:fake,objective:'a',sourceTarget:other,sourceObjective:'b',scoreComparison:A.ExecuteScoreComparison.Greater},'unless score C3Left a > C3Right b']
];
for(const [kind,data,line] of cases)test(A.ExecuteClauseKind[kind],()=>{
 const node=command({kind,...data}),before=JSON.stringify(node);
 assert.equal(V.hasError(V.validateCommand(node)),false);
 assert.equal(C.compileCommand(node),'execute '+line+' run say ok');
 assert.equal(JSON.stringify(node),before);
});
test('Ordered mixed clauses survive nested RUN',()=>{
 const nested=A.createExecuteCommand([{kind:K.IfScoreMatches,target:fake,objective:'p',scoreRange:A.createMaxRange(0)}],A.createSayCommand('nested'));
 const node=A.createExecuteCommand([{kind:K.As,target:self},{kind:K.At,target:self},{kind:K.Rotated,rotation:A.createAbsoluteRotation(90,0)}],nested);
 assert(!V.hasError(V.validateCommand(node)));
 assert.equal(C.compileCommand(node),'execute as @s at @s rotated 90 0 run execute if score C3Left p matches ..0 run say nested');
});
for(const value of [0.5,NaN,Infinity,-Infinity,2147483648,-2147483649])test('Reject invalid score bound '+value,()=>{
 const node=command({kind:K.IfScoreMatches,target:fake,objective:'p',scoreRange:A.createMinRange(value)});
 assert(V.validateCommand(node).some(i=>i.code==='EXECUTE_SCORE_RANGE'));
 const selector=A.createSelector(A.SelectorBase.Self);
 A.addSelectorScoreCondition(selector,A.createSelectorScoreCondition('p',A.createMinRange(value),false));
 assert(V.validateSelector(selector).some(i=>i.code==='SELECTOR_SCORE_RANGE'));
});
test('Integer boundaries and open ranges remain valid',()=>{
 for(const range of [A.createMinRange(-2147483648),A.createMaxRange(2147483647),A.createMinMaxRange(0,0)])assert(V.isValidScoreRange(range));
 assert(!V.isValidScoreRange(A.createMinMaxRange(5,2)));
 assert(!V.isValidScoreRange(A.createRange(false,0,false,0)));
});
test('Invalid enum numbers cannot bypass validation',()=>{
 for(const kind of [NaN,0.5,-1,21])assert(V.hasError(V.validateCommand(command({kind}))));
 for(const dimension of [NaN,0.5,-1,3])assert(V.hasError(V.validateCommand(command({kind:K.In,dimension}))));
});
test('Facing kind mismatch and missing anchor cannot silently compile as feet',()=>{
 assert(V.hasError(V.validateCommand(command({kind:K.FacingPosition,facing:{kind:A.FacingKind.Entity,position:pos}}))));
 assert(V.validateCommand(command({kind:K.FacingEntity,facing:A.createFacingEntityNoAnchor(self.selector)})).some(i=>i.code==='EXECUTE_FACING_ANCHOR'));
});
test('Self-cycle and multi-node RUN cycle return errors without recursive overflow',()=>{
 const a=A.createExecuteCommand([],undefined),b=A.createExecuteCommand([],a);a.run=a;
 assert(V.validateCommand(a).some(i=>i.code==='EXECUTE_RUN_CYCLE'));
 a.run=b;assert(V.validateCommand(a).some(i=>i.code==='EXECUTE_RUN_CYCLE'));
});
test('Clauses after index 32 are still validated',()=>{
 const clauses=Array.from({length:40},()=>({kind:K.As,target:self}));clauses.push({kind:K.In,dimension:NaN});
 assert(V.hasError(V.validateCommand(A.createExecuteCommand(clauses,A.createSayCommand('blocked')))));
});
console.log(JSON.stringify({passed,game:'PENDING',pxtVersion:pxt.version}));
