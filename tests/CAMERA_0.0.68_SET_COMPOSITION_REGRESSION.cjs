/** CAMERA SET compact Reporter -> AST -> Validator -> Compiler regression.
 * Run: node tests/CAMERA_0.0.68_SET_COMPOSITION_REGRESSION.cjs
 * No changes to PXT runtime, pxt.json, or other commands.
 */
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const ts = require('typescript');
const modules = [
    'src/ast/command.ts', 'src/ast/selector.ts',
    'src/ast/position.ts', 'src/ast/rotation.ts', 'src/ast/facing.ts',
    'commands/camera.ts', 'src/fields/position_field.ts',
    'src/fields/rotation_field.ts', 'src/blocks/camera_blocks.ts',
    'src/blocks/command_adapter.ts', 'src/compiler/compiler.ts',
    'src/validator/validator.ts'
];
const ctx = vm.createContext({});
for (const file of modules) {
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None}
    });
    assert.deepStrictEqual(compiled.diagnostics || [], [], `${file} TS transpile`);
    vm.runInContext(compiled.outputText, ctx, {filename: file});
    if (file === "src/ast/command.ts") ctx.CommandKind = ctx.MCFunctionAST.CommandKind;
}
const {Command, MCFunctionAST: AST, MCFunctionPositionFields: pos,
       MCFunctionRotationFields: rot, MCFunctionBlocks: adapter,
       MCFunctionCompiler: compiler, MCFunctionValidator: validator} = ctx;
const self = AST.createSelector(AST.SelectorBase.Self);
const preset = Command.cameraPresetBuiltin(Command.CameraPresetChoice.Free);
const ease = Command.cameraEase(2, AST.CameraEaseType.Linear);
const position = pos.absolute(10,70,10);
const rotation = rot.absolute(180,0);
const oriRot = Command.cameraOrientationRotation(rotation);
const facing = Command.cameraFacingPosition(pos.absolute(0,64,0));
const oriFacing = Command.cameraOrientationFacing(facing);
const view = Command.cameraViewOffset(1,2);
const entity = Command.cameraEntityOffset(3,4,5);
const cases = [
    ['preset only', Command.cameraActionSetComposed(preset), 'camera @s set minecraft:free'],
    ['ease only', Command.cameraActionSetComposed(preset,ease), 'camera @s set minecraft:free ease 2 linear'],
    ['default', Command.cameraActionSetComposed(preset,undefined,Command.cameraSetConfigDefault()), 'camera @s set minecraft:free default'],
    ['ease default', Command.cameraActionSetComposed(preset,ease,Command.cameraSetConfigDefault()), 'camera @s set minecraft:free ease 2 linear default'],
    ['pos', Command.cameraActionSetComposed(preset,undefined,Command.cameraSetConfigPosition(position)), 'camera @s set minecraft:free pos 10 70 10'],
    ['pos rot', Command.cameraActionSetComposed(preset,undefined,Command.cameraSetConfigPosition(position,oriRot)), 'camera @s set minecraft:free pos 10 70 10 rot 0 180'],
    ['ease pos facing', Command.cameraActionSetComposed(preset,ease,Command.cameraSetConfigPosition(position,oriFacing)), 'camera @s set minecraft:free ease 2 linear pos 10 70 10 facing 0 64 0'],
    ['orientation', Command.cameraActionSetComposed(preset,undefined,Command.cameraSetConfigOrientation(oriRot)), 'camera @s set minecraft:free rot 0 180'],
    ['view offset', Command.cameraActionSetComposed(preset,undefined,Command.cameraSetConfigViewOffset(view)), 'camera @s set minecraft:free view_offset 1 2'],
    ['entity offset', Command.cameraActionSetComposed(preset,undefined,Command.cameraSetConfigEntityOffset(entity)), 'camera @s set minecraft:free entity_offset 3 4 5'],
    ['combined offsets', Command.cameraActionSetComposed(preset,undefined,Command.cameraSetConfigOffsets(view,entity)), 'camera @s set minecraft:free view_offset 1 2 entity_offset 3 4 5'],
    ['rotation offsets', Command.cameraActionSetComposed(preset,undefined,Command.cameraSetConfigRotationOffsets(rotation,view,entity)), 'camera @s set minecraft:free rot 0 180 view_offset 1 2 entity_offset 3 4 5'],
    ['legacy compact block',Command.cameraActionSetCompact(preset,Command.cameraSetOptions(ease,position,oriRot)), 'camera @s set minecraft:free ease 2 linear pos 10 70 10 rot 0 180']
];
for (const [title, action, expected] of cases) {
    const node = adapter.createCameraFromAction(self, action.command);
    assert.strictEqual(compiler.compileCommand(node), expected, title);
    const issues = validator.validateCameraCommand(node);
    assert.strictEqual(issues.filter(i => i.level===validator.ValidationLevel.Error).length,0,`${title}: ${JSON.stringify(issues)}`);
}
// Ensure custom preset values survive without Registry rejection.
const custom = Command.cameraPresetCustom('example:sky');
const customNode = adapter.createCameraFromAction(self,Command.cameraActionSetComposed(custom).command);
assert.strictEqual(compiler.compileCommand(customNode),'camera @s set example:sky');
assert.ok(validator.validateCameraCommand(customNode).some(i=>i.code==='CAMERA_PRESET_CUSTOM'));
// Check default shadow points to the new block, and old IDs survive hidden.
const source=fs.readFileSync('src/blocks/camera_blocks.ts','utf8');
assert.ok(source.includes('action.shadow="mcfunction_camera_action_set_grammar"'));
assert.ok(/blockId=mcfunction_camera_set_options\s*\n\s*\/\/\% blockHidden=true/.test(source));
assert.ok(/blockId=mcfunction_camera_action_set_compact[\s\S]*?function cameraActionSetCompact/.test(source));
console.log(`PASS: ${cases.length} CAMERA SET variants + custom preset, legacy block, and shadow refs.`);
