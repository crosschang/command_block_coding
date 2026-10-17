/** CAMERA SET Selector-style option-chain regression.
 * Run: node tests/CAMERA_0.0.68_SET_CHAIN_REGRESSION.cjs
 * Tests AST construction, order validation and command generation, not PXT UI.
 */
const fs=require('fs'), vm=require('vm'),assert=require('assert'),ts=require('typescript');
const ctx=vm.createContext({});
for(const filename of [
 'src/ast/command.ts','src/ast/selector.ts','src/ast/position.ts',
 'src/ast/rotation.ts','src/ast/facing.ts','commands/camera.ts',
 'src/fields/position_field.ts','src/fields/rotation_field.ts',
 'src/blocks/camera_blocks.ts','src/blocks/command_adapter.ts',
 'src/compiler/compiler.ts','src/validator/validator.ts']){
 const result=ts.transpileModule(fs.readFileSync(filename,'utf8'),{
  compilerOptions:{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None},
 });
 vm.runInContext(result.outputText,ctx,{filename});
 if(filename==='src/ast/command.ts')ctx.CommandKind=ctx.MCFunctionAST.CommandKind;
}
const {Command:C,MCFunctionAST:A,MCFunctionBlocks:B,
 MCFunctionCompiler:Compiler, MCFunctionValidator:V,
 MCFunctionPositionFields:P, MCFunctionRotationFields:R}=ctx;
const self=A.createSelector(A.SelectorBase.Self), preset=C.cameraPresetBuiltin(C.CameraPresetChoice.Free),
 ease=C.cameraEase(2,A.CameraEaseType.Linear),p=P.absolute(10,70,10),r=R.absolute(180,0),
 facePos=C.cameraFacingPosition(P.absolute(0,64,0)),faceEnt=C.cameraFacingEntity({selector:self}),
 view=C.cameraViewOffset(1,2),entity=C.cameraEntityOffset(3,4,5);
const end=()=>C.cameraSetChainEnd();
const branchCases=[
 ['default',()=>C.cameraSetChainDefault(),'default'],
 ['pos',()=>C.cameraSetChainPos(p,end()),'pos 10 70 10'],
 ['rot',()=>C.cameraSetChainRot(r,end()),'rot 0 180'],
 ['facing entity',()=>C.cameraSetChainFacingEntity(faceEnt),'facing @s'],
 ['facing position',()=>C.cameraSetChainFacingPosition(facePos),'facing 0 64 0'],
 ['pos rot',()=>C.cameraSetChainPos(p,C.cameraSetChainRot(r,end())),'pos 10 70 10 rot 0 180'],
 ['pos facing entity',()=>C.cameraSetChainPos(p,C.cameraSetChainFacingEntity(faceEnt)),'pos 10 70 10 facing @s'],
 ['pos facing position',()=>C.cameraSetChainPos(p,C.cameraSetChainFacingPosition(facePos)),'pos 10 70 10 facing 0 64 0'],
 ['view',()=>C.cameraSetChainView(view,end()),'view_offset 1 2'],
 ['entity',()=>C.cameraSetChainEntity(entity),'entity_offset 3 4 5'],
 ['view entity',()=>C.cameraSetChainView(view,C.cameraSetChainEntity(entity)),'view_offset 1 2 entity_offset 3 4 5'],
 ['rot view',()=>C.cameraSetChainRot(r,C.cameraSetChainView(view,end())),'rot 0 180 view_offset 1 2'],
 ['rot entity',()=>C.cameraSetChainRot(r,C.cameraSetChainEntity(entity)),'rot 0 180 entity_offset 3 4 5'],
 ['rot view entity',()=>C.cameraSetChainRot(r,C.cameraSetChainView(view,C.cameraSetChainEntity(entity))),'rot 0 180 view_offset 1 2 entity_offset 3 4 5'],
];
function node(options,presetValue=preset){return B.createCameraFromAction(self,C.cameraActionSetChain(presetValue,options).command);}
function errors(n){return V.validateCameraCommand(n).filter(x=>x.level===V.ValidationLevel.Error);}
let checks=0;
for(const [name,branch,suffix] of branchCases){
 for(const useEase of [false,true]){
  const options=useEase?C.cameraSetChainEase(ease,branch()):branch();
  const n=node(options);
  assert.strictEqual(Compiler.compileCommand(n),'camera @s set minecraft:free '+(useEase?'ease 2 linear ':'')+suffix,name+' eased '+useEase);
  assert.strictEqual(errors(n).length,0,name+' eased '+useEase+': '+JSON.stringify(errors(n)));
  checks++;
 }
}
assert.strictEqual(checks,28);
assert.strictEqual(Compiler.compileCommand(node(end())),'camera @s set minecraft:free');
const custom=node(C.cameraSetChainPos(p,end()),C.cameraPresetCustom('example:sky'));
assert.strictEqual(Compiler.compileCommand(custom),'camera @s set example:sky pos 10 70 10');
assert.ok(V.validateCameraCommand(custom).some(x=>x.code==='CAMERA_PRESET_CUSTOM'));
const invalid=[
 ['pos plus offset',C.cameraSetChainPos(p,C.cameraSetChainView(view,end()))],
 ['facing then rot (unsupported)',C.cameraSetChainRot(r,C.cameraSetChainFacingEntity(faceEnt))],
 ['reverse order',C.cameraSetChainView(view,C.cameraSetChainRot(r,end()))],
 ['duplicate rotation',C.cameraSetChainRot(r,C.cameraSetChainRot(r,end()))],
 ['duplicate ease',C.cameraSetChainEase(ease,C.cameraSetChainEase(ease,C.cameraSetChainDefault()))],
 ['ease only',C.cameraSetChainEase(ease,end())],
 ['missing position',C.cameraSetChainPos(undefined,end())],
 ['invalid default with rot',C.cameraSetChainRot(r,C.cameraSetChainDefault())],
];
for(const [label,opts] of invalid) {
 const codes=errors(node(opts)).map(x=>x.code);
 assert.ok(codes.length>0,label+' must fail');
 assert.ok(codes.some(x=>x==='CAMERA_SET_CHAIN_ORDER'||x==='CAMERA_SET_BRANCH_CONFLICT'||x==='CAMERA_DEFAULT_CONFLICT'||x==='CAMERA_SET_CHAIN_EASE_ONLY'),label+' '+codes);
}
// A damaged cyclic reporter must not hang the MakeCode runtime.
const cyclic=C.cameraSetChainPos(p,end());cyclic.next=cyclic;
assert.ok(errors(node(cyclic)).some(x=>x.code==='CAMERA_SET_CHAIN_ORDER'));
const text=fs.readFileSync('src/blocks/camera_blocks.ts','utf8');
const ids=[...text.matchAll(/\/\/% blockId=(\S+)/g)].map(x=>x[1]);
assert.strictEqual(new Set(ids).size,ids.length,'unique MakeCode IDs');
assert.ok(text.includes('action.shadow="mcfunction_camera_action_set_chain"'));
assert.ok(text.includes('options.shadow="mcfunction_camera_set_chain_end"'));
assert.ok(/blockId=mcfunction_camera_action_set_grammar\s+\/\/% blockHidden=true/.test(text));
console.log(`PASS: SET chain ${checks}/28 official grammar variants, preset-only, custom ID, 9 invalid cases, block ID compatibility`);
