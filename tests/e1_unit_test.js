'use strict';
const vm = require('vm');
const fs = require('fs');
const assert = require('assert');
const js = fs.readFileSync(process.argv[2], 'utf8');
const kind={Raw:0,Say:1,SetBlock:11,Execute:40,Other:99};
const k={As:0,At:1,In:2,Positioned:3,Rotated:4,FacingPosition:5,FacingEntity:6,Align:7,Anchored:8,IfEntity:9,UnlessEntity:10,IfBlock:11,UnlessBlock:12,IfBlocks:13,UnlessBlocks:14};
const mode={Absolute:0,Relative:1,Local:2};
let worldBlocks=new Map(), outputs=[], issues=[], position={x:3.3,y:-60,z:-76};
const key=(x,y,z)=>[Math.floor(x),Math.floor(y),Math.floor(z)].join(',');
const pos=(m,x,y,z)=>({x:{mode:m,value:x},y:{mode:m,value:y},z:{mode:m,value:z}});
const clause=(kind,extra)=>Object.assign({kind},extra||{});
const runner=(run,clauses)=>({kind:kind.Execute,run,clauses});
const ctx={
  NaN, isNaN, Math, console,
  MCFunctionAST:{CoordinateMode:mode,CommandKind:kind,ExecuteClauseKind:k,ExecuteScan:{All:0,Masked:1},
    createAbsolutePosition:(x,y,z)=>pos(mode.Absolute,x,y,z),
    createSetBlockCommand:(p,blockId,blockStates,mode2)=>({kind:kind.SetBlock,position:p,blockId,blockStates,mode:mode2})},
  Axis:{X:0,Y:1,Z:2},TestForBlocksMask:{All:0,Masked:1},
  world:(x,y,z)=>({x,y,z}),
  player:{position:()=>({getValue:(v)=>[position.x,position.y,position.z][v]}),execute:(cmd)=>{
    outputs.push(cmd);
    const t=cmd.split(' ');
    if(t[0]==='setblock')worldBlocks.set(key(Number(t[1]),Number(t[2]),Number(t[3])),t[4]);
    return true;
  }},
  blocks:{blockByName:(id)=>id,testForBlock:(id,p)=>worldBlocks.get(key(p.x,p.y,p.z))===`minecraft:${id}`,
    testForBlocks:()=>true},
  MCFunctionPreview:{previewSay:(v)=>issues.push(v),tryHandleQuery:()=>({handled:false}),observeCommand:()=>{}},
  MCFunctionPreviewBlockCommandSerializer:{tryCompile:()=>''},
  MCFunctionCompiler:{compileCommand:(c)=>c.kind===kind.Say?`say ${c.message}`:
    c.kind===kind.SetBlock?`setblock ${c.position.x.value} ${c.position.y.value} ${c.position.z.value} ${c.blockId}`:'unsupported'}
};
vm.createContext(ctx);vm.runInContext(js,ctx);
const run=ctx.MCFunctionExecutePreview.execute;
const setblock=(p,id)=>({kind:kind.SetBlock,position:p,blockId:id});
const say=(message)=>({kind:kind.Say,message});
const setup=()=>{worldBlocks.clear();outputs.length=0;issues.length=0;position={x:3.3,y:-60,z:-76};worldBlocks.set(key(5,-60,-76),'minecraft:gold_block');worldBlocks.set(key(6,-60,-76),'minecraft:stone');};
const count=()=>outputs.length;
function test(name,cb){setup();cb();console.log('PASS',name);}

test('E1-00 no clauses RUN SAY',()=>{run(runner(say('ok'),[]));assert.equal(outputs[0],'say ok');});
test('E1-01 absolute positioned + relative IF + relative SETBLOCK',()=>{
 const at=pos(mode.Absolute,5,-60,-76), rel=pos(mode.Relative,0,0,0), next=pos(mode.Relative,1,0,0);
 run(runner(setblock(next,'minecraft:glass'),[clause(k.Positioned,{position:at}),clause(k.IfBlock,{position:rel,blockId:'minecraft:gold_block'})]));
 assert.equal(worldBlocks.get(key(6,-60,-76)),'minecraft:glass');assert.equal(at.x.value,5);assert.equal(next.x.mode,mode.Relative);
});
test('E1-02 relative from player world position',()=>{
 run(runner(setblock(pos(mode.Relative,1,0,0),'minecraft:glass'),[
  clause(k.Positioned,{position:pos(mode.Relative,2,0,0)})]));
 assert.equal(worldBlocks.get(key(6,-60,-76)),'minecraft:glass');
});
test('E1-03 ordered double positioned + condition',()=>{
 run(runner(setblock(pos(mode.Relative,0,0,0),'minecraft:diamond_block'),[
  clause(k.Positioned,{position:pos(mode.Absolute,5,-60,-76)}),
  clause(k.Positioned,{position:pos(mode.Relative,2,0,0)}),
  clause(k.IfBlock,{position:pos(mode.Relative,-2,0,0),blockId:'minecraft:gold_block'})]));
 assert.equal(worldBlocks.get(key(7,-60,-76)),'minecraft:diamond_block');
});
test('E1-04 align xz + fraction + negatives uses floor, not truncation',()=>{
 run(runner(setblock(pos(mode.Relative,0,0,0),'minecraft:emerald_block'),[
  clause(k.Positioned,{position:pos(mode.Absolute,-2.4,-59.1,-74.8)}),
  clause(k.Align,{axes:'xz'}),clause(k.Positioned,{position:pos(mode.Relative,.8,0,.8)})]));
 assert.equal(worldBlocks.get(key(-3,-60,-75)),'minecraft:emerald_block');
 assert.equal(worldBlocks.get(key(-2,-60,-74)),undefined);
});
test('E1-05 align xyz including negative y',()=>{
 run(runner(setblock(pos(mode.Relative,0,0,0),'minecraft:emerald_block'),[
  clause(k.Positioned,{position:pos(mode.Absolute,-2.4,-59.1,-74.8)}),
  clause(k.Align,{axes:'xyz'}),clause(k.Positioned,{position:pos(mode.Relative,.8,.8,.8)})]));
 assert.equal(worldBlocks.get(key(-3,-60,-75)),'minecraft:emerald_block');
 assert.equal(worldBlocks.get(key(-2,-59,-74)),undefined);
});
test('E1-06 true vs false before RUN',()=>{
 run(runner(setblock(pos(mode.Relative,1,0,0),'minecraft:glass'),[
  clause(k.Positioned,{position:pos(mode.Absolute,5,-60,-76)}),
  clause(k.UnlessBlock,{position:pos(mode.Relative,0,0,0),blockId:'minecraft:gold_block'})]));
 assert.equal(count(),0);assert.equal(worldBlocks.get(key(6,-60,-76)),'minecraft:stone');
});
test('E1-07 backward compatibility without positioned',()=>{
 run(runner(setblock(pos(mode.Absolute,8,-60,-76),'minecraft:glass'),[
  clause(k.IfBlock,{position:pos(mode.Absolute,5,-60,-76),blockId:'minecraft:gold_block'})]));
 assert.equal(worldBlocks.get(key(8,-60,-76)),'minecraft:glass');
});
test('E1-08 reject local positioned without execution',()=>{
 run(runner(setblock(pos(mode.Relative,0,0,0),'minecraft:glass'),[
  clause(k.Positioned,{position:pos(mode.Local,0,0,1)})]));
 assert.equal(count(),0);assert(issues[0].includes('EXECUTE_PREVIEW_UNSUPPORTED'));
});
test('E1-09 do not fake as/at, preflight before if-false',()=>{
 run(runner(say('should not run'),[
  clause(k.IfBlock,{position:pos(mode.Absolute,1,1,1),blockId:'minecraft:stone'}),
  clause(k.As,{target:'@a'})]));
 assert.equal(count(),0);assert(issues[0].includes('EXECUTE_PREVIEW_UNSUPPORTED'));
});
test('E1-10 blockstate condition unknown',()=>{
 run(runner(say('skip'),[clause(k.IfBlock,{position:pos(mode.Absolute,5,-60,-76),blockId:'minecraft:gold_block',blockStates:{entries:[{}]}})]));
 assert.equal(count(),0);assert(issues[0].includes('EXECUTE_PREVIEW_UNKNOWN'));
});
test('E1-11 unknown RUN not silently reinterpreted',()=>{
 run(runner({kind:kind.Other},[clause(k.Positioned,{position:pos(mode.Absolute,5,-60,-76)})]));
 assert.equal(count(),0);assert(issues[0].includes('EXECUTE_E1_RUN_UNSUPPORTED'));
});
test('E1-12 40-clause chain still evaluated without fixed cap',()=>{
 let clauses=[clause(k.Positioned,{position:pos(mode.Absolute,5,-60,-76)})];
 for(let i=0;i<39;i++)clauses.push(clause(k.IfBlock,{position:pos(mode.Relative,0,0,0),blockId:'minecraft:gold_block'}));
 run(runner(say('40 clauses'),clauses));assert.equal(outputs[0],'say 40 clauses');
});
test('E1-13 all 7 align axis strings mathematical regression',()=>{
 for(const axes of ['x','y','z','xy','xz','yz','xyz']){
  outputs.length=0;
  run(runner(setblock(pos(mode.Relative,.8,.8,.8),'minecraft:glass'),[
   clause(k.Positioned,{position:pos(mode.Absolute,-2.4,-59.1,-74.8)}),clause(k.Align,{axes})]));
  assert.equal(outputs.length,1);
  const t=outputs[0].split(' '), expected=[axes.includes('x')?-3:-2,axes.includes('y')?-60:-59,axes.includes('z')?-75:-74];
  assert(Math.abs(Number(t[1])-expected[0])<1e-9,axes);
  assert(Math.abs(Number(t[2])-expected[1])<1e-9,axes);
  assert(Math.abs(Number(t[3])-expected[2])<1e-9,axes);
 }
});
console.log('ALL 14 E1 JS unit tests PASS');
