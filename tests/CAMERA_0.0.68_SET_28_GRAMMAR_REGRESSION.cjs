/** CAMERA official SET 28 grammar variants regression (AST -> Validator -> Compiler).
 * Run from the project root: node tests/CAMERA_0.0.68_SET_28_GRAMMAR_REGRESSION.cjs
 * Does not require Minecraft or change production files.
 */
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const ts = require('typescript');
const context = vm.createContext({});
const sources = [
  'src/ast/command.ts', 'src/ast/selector.ts', 'src/ast/position.ts',
  'src/ast/rotation.ts', 'src/ast/facing.ts', 'commands/camera.ts',
  'src/fields/position_field.ts', 'src/fields/rotation_field.ts',
  'src/blocks/camera_blocks.ts', 'src/blocks/command_adapter.ts',
  'src/compiler/compiler.ts', 'src/validator/validator.ts'
];
for (const file of sources) {
  const transpiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None},
  });
  vm.runInContext(transpiled.outputText, context, {filename: file});
  if (file === "src/ast/command.ts") context.CommandKind = context.MCFunctionAST.CommandKind;
}
const {Command: C, MCFunctionAST: A, MCFunctionBlocks: B,
  MCFunctionCompiler: Compiler, MCFunctionValidator: V,
  MCFunctionPositionFields: P, MCFunctionRotationFields: R} = context;
const self = A.createSelector(A.SelectorBase.Self);
const preset = C.cameraPresetBuiltin(C.CameraPresetChoice.Free);
const ease = C.cameraEase(2,A.CameraEaseType.Linear);
const position = P.absolute(10,70,10);
const rotation = R.absolute(180,0);
const facingPosition = C.cameraFacingPosition(P.absolute(0,64,0));
const entitySelector = A.createSelector(A.SelectorBase.Self);
const selectedEntity = { selector: entitySelector };
const targetFace = C.cameraFacingEntity(selectedEntity);
const view = C.cameraViewOffset(1,2);
const entity = C.cameraEntityOffset(3,4,5);
const patterns = [
  ['default', C.cameraSetBranchDefault(), 'default'],
  ['pos', C.cameraSetBranchPos(position), 'pos 10 70 10'],
  ['rot', C.cameraSetBranchRot(rotation), 'rot 0 180'],
  ['facing entity', C.cameraSetBranchFacingEntity(targetFace), 'facing @s'],
  ['facing position', C.cameraSetBranchFacingPosition(facingPosition), 'facing 0 64 0'],
  ['pos rot', C.cameraSetBranchPosRot(position,rotation), 'pos 10 70 10 rot 0 180'],
  ['pos facing entity', C.cameraSetBranchPosFacingEntity(position,targetFace), 'pos 10 70 10 facing @s'],
  ['pos facing position', C.cameraSetBranchPosFacingPosition(position,facingPosition), 'pos 10 70 10 facing 0 64 0'],
  ['view_offset', C.cameraSetBranchView(view), 'view_offset 1 2'],
  ['entity_offset', C.cameraSetBranchEntity(entity), 'entity_offset 3 4 5'],
  ['view + entity', C.cameraSetBranchViewEntity(view,entity), 'view_offset 1 2 entity_offset 3 4 5'],
  ['rot + view', C.cameraSetBranchRotView(rotation,view), 'rot 0 180 view_offset 1 2'],
  ['rot + entity', C.cameraSetBranchRotEntity(rotation,entity), 'rot 0 180 entity_offset 3 4 5'],
  ['rot + view + entity', C.cameraSetBranchRotViewEntity(rotation,view,entity), 'rot 0 180 view_offset 1 2 entity_offset 3 4 5']
];
let executed=0;
for (const [name, settings, suffix] of patterns) {
  for (const eased of [false,true]) {
    const report=eased ? C.cameraSetBranchEase(ease,settings) : settings;
    const action=C.cameraActionSetGrammar(preset,report);
    const ast=B.createCameraFromAction(self, action.command);
    const result=Compiler.compileCommand(ast);
    const expected='camera @s set minecraft:free '+(eased?'ease 2 linear ':'')+suffix;
    assert.strictEqual(result, expected, `${name}, eased=${eased}`);
    const errors=V.validateCameraCommand(ast).filter(i=>i.level===V.ValidationLevel.Error);
    assert.strictEqual(errors.length,0,`${name}, eased=${eased}, ${JSON.stringify(errors)}`);
    executed++;
  }
}
assert.strictEqual(executed,28);
// Empty setting is the historic preset-only case (no surprise pos/rot/ease output).
const basic=B.createCameraFromAction(self,C.cameraActionSetGrammar(preset).command);
assert.strictEqual(Compiler.compileCommand(basic),'camera @s set minecraft:free');
// Direct custom namespaced preset survives intact; only an informational diagnostic.
const custom=B.createCameraFromAction(self,C.cameraActionSetGrammar(C.cameraPresetCustom('example:sky'),C.cameraSetBranchPos(position)).command);
assert.strictEqual(Compiler.compileCommand(custom),'camera @s set example:sky pos 10 70 10');
assert.ok(V.validateCameraCommand(custom).some(x=>x.code==='CAMERA_PRESET_CUSTOM'));
// Illegal grammar combinations remain rejected by the existing validator.
const invalid=A.createCameraSetUnifiedCommand(self,'minecraft:free',undefined,
  position.position, undefined, undefined, false, view.value, undefined);
assert.ok(V.validateCameraCommand(invalid).some(x=>x.code==='CAMERA_SET_BRANCH_CONFLICT'));
const filesrc=fs.readFileSync('src/blocks/camera_blocks.ts','utf8');
const allBlockIds=[...filesrc.matchAll(/\/\/% blockId=(\S+)/g)].map(x=>x[1]);
assert.strictEqual(new Set(allBlockIds).size,allBlockIds.length,'CAMERA block IDs must be unique');
assert.ok(filesrc.includes('action.shadow="mcfunction_camera_action_set_grammar"'));
assert.ok(/blockId=mcfunction_camera_action_set_composed\s+\/\/% blockHidden=true/.test(filesrc));
assert.ok(/blockId=mcfunction_camera_set_options\s+\/\/% blockHidden=true/.test(filesrc));
console.log(`PASS: ${executed}/28 official CAMERA SET variants; preset-only/custom/invalid/legacy ID checks.`);
