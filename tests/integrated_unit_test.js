// Minecraft Education PXT is not run in this test: this is an isolated TS
// semantics test with explicit simulated APIs; native game test remains pending.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const cp = require('node:child_process');
const path=require('node:path');
const home=path.join(__dirname,'..');
const src=path.join(home,'src/preview/execute_interpreter.ts');
const jsFile=path.join(__dirname,'execute_interpreter.unit.generated.js');
cp.execFileSync('tsc',['--target','es5','--module','none','--outFile',jsFile,'--skipLibCheck','--lib','es5',path.join(__dirname,'pxt_api_stub.d.ts'),src]);
const code=fs.readFileSync(jsFile,'utf-8');
const k={As:0,At:1,In:2,Positioned:3,Rotated:4,FacingPosition:5,FacingEntity:6,Align:7,Anchored:8,IfEntity:9,UnlessEntity:10,IfBlock:11,UnlessBlock:12,IfBlocks:13,UnlessBlocks:14,IfScoreMatches:15,UnlessScoreMatches:16,PositionedAs:17,RotatedAs:18,IfScoreCompare:19,UnlessScoreCompare:20};
const kind={Raw:0,Say:1,Give:3,Effect:6,Tag:7,SetBlock:11,Execute:40,Other:99};
const mode={Absolute:0,Relative:1,Local:2};
const blocksStore=new Map(), commands=[], warnings=[];let scoreTestMode='unknown';let here={x:4,y:-60,z:-76}, yaw=0;
const point=(p)=>[p.x,p.y,p.z].map(Math.floor).join(':');
const mkPos=(m,x,y,z)=>({x:{mode:m,value:x},y:{mode:m,value:y},z:{mode:m,value:z}});
const abs=(x,y,z)=>mkPos(0,x,y,z),rel=(x,y,z)=>mkPos(1,x,y,z),local=(x,y,z)=>mkPos(2,x,y,z);
const clause=(kind,ex={})=>({kind,...ex});
const run=(run,clauses)=>({kind:kind.Execute,run,clauses});
const set=(p,blockId)=>({kind:kind.SetBlock,position:p,blockId});
const say=(message)=>({kind:kind.Say,message});
const self={kind:0,selector:{base:4,filters:[],scores:[],hasItems:[]}};
const everyone={kind:0,selector:{base:0,filters:[],scores:[],hasItems:[]}};
const entityUnknown={kind:0,selector:{base:1,filters:[{key:'type',value:'cow'}],scores:[],hasItems:[]}};
const makePosition=(x,y,z)=>({x,y,z,getValue:(axis)=>[x,y,z][axis],toWorld:()=>makePosition(x,y,z)});
const ctx={Math,Axis:{X:0,Y:1,Z:2},TestForBlocksMask:{All:0,Masked:1},world:makePosition,
  posLocal:(x,y,z)=>({toWorld:()=>{ // yaw=0,pitch=0 unit harness
    return makePosition(here.x+x,here.y+y,here.z+z);
  }}),
  MCFunctionAST:{CoordinateMode:mode,CommandKind:kind,ExecuteClauseKind:k,ExecuteScan:{All:0,Masked:1},
   RotationMode:{Absolute:0,Relative:1},EntityAnchor:{Eyes:0,Feet:1},
   PlayerTargetKind:{Selector:0,Name:1},SelectorBase:{AllPlayers:0,AllEntities:1,NearestPlayer:2,RandomPlayer:3,Self:4,Initiator:5},
   createAbsolutePosition:(x,y,z)=>abs(x,y,z),createSetBlockCommand:(position,blockId,blockStates,mode)=>({kind:kind.SetBlock,position,blockId,blockStates,mode}),
   createExecuteCommand:(clauses,runCmd)=>({kind:kind.Execute,clauses,run:runCmd}),
   createSelector:(base)=>({base,filters:[],scores:[],hasItems:[]}),
   createSelectorScoreCondition:(objective,range,inverted)=>({objective,range,inverted}),
   addSelectorScoreCondition:(selector,cond)=>selector.scores.push(cond),
   createMaxRange:(max)=>({hasMin:false,min:0,hasMax:true,max}),
   createMinRange:(min)=>({hasMin:true,min,hasMax:false,max:0})},
  player:{position:()=>makePosition(here.x,here.y,here.z),getOrientation:()=>yaw,execute:(str)=>{
      commands.push(str);
      if(str.startsWith('testfor ')) {
          if(scoreTestMode==='matching')return str.includes('e16score=3');
          if(scoreTestMode==='complement')return str.includes('..3');
          return false;
      }
      if(str.startsWith('setblock ')){
        const w=str.split(' ');blocksStore.set([+w[1],+w[2],+w[3]].map(Math.floor).join(':'),w[4]);
      }
      return true;
  }},
  blocks:{blockByName:(n)=>n,testForBlock:(id,p)=>blocksStore.get(point(p))===(id.startsWith('minecraft:')?id:'minecraft:'+id),testForBlocks:()=>true},
  MCFunctionPreview:{previewSay:(w)=>warnings.push(w),tryHandleQuery:()=>({handled:false}),observeCommand:()=>{}},
  MCFunctionPreviewBlockCommandSerializer:{tryCompile:()=>''},
  MCFunctionCompiler:{compileSelector:(selector)=>{
      const range=selector.scores[0].range;
      const part=range.hasMin?(String(range.min)+(range.hasMax?('..'+range.max):'..')):('..'+range.max);
      return '@s[scores={'+selector.scores[0].objective+'='+part+'}]';
  },compilePlayerTarget:(target)=>target.kind===1?target.name:({0:'@a',1:'@e',2:'@p',3:'@r',4:'@s'}[target.selector.base]),
   compileCommand:(c)=>c.kind===kind.Say?'say '+c.message:c.kind===kind.SetBlock?`setblock ${c.position.x.value} ${c.position.y.value} ${c.position.z.value} ${c.blockId}`:'other'}
};
vm.createContext(ctx);vm.runInContext(code,ctx);
const exe=ctx.MCFunctionExecutePreview.execute;
let passed=0;
function test(name,fn){commands.length=0;warnings.length=0;scoreTestMode='unknown';blocksStore.clear();here={x:4,y:-60,z:-76};yaw=0;blocksStore.set('5:-60:-76','minecraft:gold_block');fn();passed++;console.log('PASS',name);}
function expectCmd(v){assert(commands.some(x=>x.includes(v)),`Expected '${v}' in ${commands}`);}
function blocked(){assert.equal(commands.length,0);assert(warnings.length>0,'expected diagnostic');}
test('E1 absolute positioned relative SETBLOCK',()=>{
 exe(run(set(rel(1,0,0),'minecraft:glass'),[clause(k.Positioned,{position:abs(5,-60,-76)})]));
 assert.equal(blocksStore.get('6:-60:-76'),'minecraft:glass');});
test('E1 negative align floor',()=>{
 exe(run(set(rel(0,0,0),'minecraft:glass'),[clause(k.Positioned,{position:abs(-2.4,-59.1,-74.8)}),clause(k.Align,{axes:'xyz'})]));
 assert.equal(blocksStore.get('-3:-60:-75'),'minecraft:glass');});
test('E2 self as+at SETBLOCK',()=>{
 exe(run(set(rel(2,0,0),'minecraft:glass'),[clause(k.As,{target:self}),clause(k.At,{target:self})]));
 assert.equal(blocksStore.get('6:-60:-76'),'minecraft:glass');});
test('E2 multiple @a as @s legacy dispatch',()=>{
 exe(run(say('multi'),[clause(k.As,{target:everyone}),clause(k.At,{target:self})]));expectCmd('execute @a ~ ~ ~ say multi');});
test('E2 no cross-product guess',()=>{
 exe(run(say('never'),[clause(k.As,{target:everyone}),clause(k.At,{target:everyone})]));blocked();});
test('E3 if entity @s proven true',()=>{
 exe(run(say('exists'),[clause(k.IfEntity,{target:self})]));expectCmd('say exists');});
test('E3 unless entity @a proven false',()=>{
 exe(run(say('no'),[clause(k.UnlessEntity,{target:everyone})]));assert.equal(commands.length,0);assert.equal(warnings.length,0);});
test('E3 filtered unknown blocked',()=>{
 exe(run(say('no'),[clause(k.IfEntity,{target:entityUnknown})]));blocked();});
test('E3 if score PXT unknown API safely blocks RUN',()=>{
 exe(run(say('no'),[clause(k.IfScoreMatches,{target:self,objective:'score',scoreRange:{hasMin:true,min:1,hasMax:true,max:10}})]));
 assert(!commands.includes('say no'));assert(warnings.some(w=>w.includes('UNKNOWN')));});
test('E3 if score matches confirmed live query',()=>{
 scoreTestMode='matching';
 exe(run(say('yes'),[clause(k.IfScoreMatches,{target:self,objective:'e16score',scoreRange:{hasMin:true,min:3,hasMax:true,max:3}})]));
 expectCmd('say yes');});
test('E3 unless score matches after complement proof',()=>{
 scoreTestMode='complement';
 exe(run(say('outside'),[clause(k.UnlessScoreMatches,{target:self,objective:'e16score',scoreRange:{hasMin:true,min:4,hasMax:true,max:4}})]));
 expectCmd('say outside');});
test('E4 explicit yaw=0 pitch=0 local forward',()=>{
 exe(run(set(local(0,0,1),'minecraft:glass'),[clause(k.Positioned,{position:abs(5,-60,-76)}),clause(k.Rotated,{rotation:{yaw:{mode:0,value:0},pitch:{mode:0,value:0}}})]));
 assert.equal(blocksStore.get('5:-60:-75'),'minecraft:glass');});
test('E4 yaw 90 forward points west',()=>{
 exe(run(set(local(0,0,1),'minecraft:glass'),[clause(k.Positioned,{position:abs(5,-60,-76)}),clause(k.Rotated,{rotation:{yaw:{mode:0,value:90},pitch:{mode:0,value:0}}})]));
 assert.equal(blocksStore.get('4:-60:-76'),'minecraft:glass');});
test('E4 initial player camera local',()=>{
 exe(run(set(local(0,0,1),'minecraft:glass'),[clause(k.Positioned,{position:abs(5,-60,-76)})]));
 assert.equal(blocksStore.get('5:-60:-75'),'minecraft:glass');});
test('E4 unsupported relative pitch after yaw absolute',()=>{
 exe(run(set(local(0,0,1),'minecraft:glass'),[clause(k.Rotated,{rotation:{yaw:{mode:0,value:40},pitch:{mode:1,value:10}}})]));blocked();});
test('E5 facing fixed point + local forward',()=>{
 exe(run(set(local(0,0,1),'minecraft:glass'),[clause(k.Positioned,{position:abs(5,-60,-76)}),
  clause(k.FacingPosition,{facing:{position:abs(5,-60,-66)}})]));
 assert.equal(blocksStore.get('5:-60:-75'),'minecraft:glass');});
test('E5 facing entity self FEET',()=>{
 exe(run(set(local(0,0,1),'minecraft:glass'),[clause(k.Positioned,{position:abs(4,-60,-78)}),
  clause(k.FacingEntity,{facing:{entitySelector:self.selector,anchor:1}})]));
 assert.equal(blocksStore.get('4:-60:-77'),'minecraft:glass');});
test('E5 anchored eyes + facing does not approximate',()=>{
 exe(run(set(local(0,0,1),'minecraft:glass'),[clause(k.Anchored,{anchor:0}),clause(k.FacingPosition,{facing:{position:abs(10,-60,-76)}})]));blocked();});
test('E6 in nether + SAY dimension neutral',()=>{
 exe(run(say('hello'),[clause(k.In,{dimension:1})]));expectCmd('say hello');});
test('E6 in nether + SETBLOCK must not leak overworld',()=>{
 exe(run(set(abs(5,-60,-76),'minecraft:glass'),[clause(k.In,{dimension:1})]));blocked();});
test('E6 in nether + IF ENTITY must not pretend to query dimension',()=>{
 exe(run(say('bad'),[clause(k.In,{dimension:1}),clause(k.IfEntity,{target:self})]));blocked();});
test('Nested EXECUTE flatten preserves sequential position',()=>{
 const nested=run(set(rel(1,0,0),'minecraft:glass'),[clause(k.IfBlock,{position:rel(0,0,0),blockId:'minecraft:gold_block'})]);
 exe(run(nested,[clause(k.Positioned,{position:abs(5,-60,-76)})]));
 assert.equal(blocksStore.get('6:-60:-76'),'minecraft:glass');});
console.log(`ALL ${passed} INTEGRATED E1..E6 semantic safety unit tests PASS`);
