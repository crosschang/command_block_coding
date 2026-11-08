/** Local Node regression checks for CAMERA reporter -> canonical AST -> compiler.
 * Usage from repo root: node tests/CAMERA_0.0.68_FOV_ENTITY_FADE_REGRESSION.cjs
 * Needs TypeScript available to Node (same TypeScript CLI used for local checks).
 * This script is NOT included in pxt.json and makes no changes to the MakeCode runtime.
 */
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const ts = require('typescript');
const modules = [
    'src/ast/command.ts',
    'src/ast/selector.ts',
    'commands/camera.ts',
    'src/blocks/camera_blocks.ts',
    'src/blocks/command_adapter.ts',
    'src/compiler/compiler.ts',
    'src/validator/validator.ts'
];
const context = vm.createContext({});
for (const file of modules) {
    const text = fs.readFileSync(file, 'utf8');
    const compiled = ts.transpileModule(text, {
        compilerOptions: {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.None}
    }).outputText;
    vm.runInContext(compiled, context, {filename: file});
    if (file === "src/ast/command.ts") context.CommandKind = context.MCFunctionAST.CommandKind;
}
const {Command, MCFunctionAST: AST, MCFunctionBlocks: adapter,
       MCFunctionCompiler: compiler, MCFunctionValidator: validator} = context;
const self = AST.createSelector(AST.SelectorBase.Self);
const entity = AST.createSelector(AST.SelectorBase.AllEntities);
// Single-target filter counts are intentionally not asserted in this test.
const val = selector => ({selector});
const seconds = Command.cameraEase(2, AST.CameraEaseType.Linear);
const fadeTime = Command.cameraFadeTime(0.5, 1, 0.5);
const fadeColor = Command.cameraFadeColor(0, 0, 0);
const cases = [
    ['fade bare', Command.cameraActionFadeCompact(), 'camera @s fade'],
    ['fade color', Command.cameraActionFadeCompact(Command.cameraFadeColorOnly(fadeColor)), 'camera @s fade color 0 0 0'],
    ['fade time', Command.cameraActionFadeCompact(Command.cameraFadeTimeOnly(fadeTime)), 'camera @s fade time 0.5 1 0.5'],
    ['fade time color', Command.cameraActionFadeCompact(Command.cameraFadeTimeColor(fadeTime,fadeColor)), 'camera @s fade time 0.5 1 0.5 color 0 0 0'],
    ['fov set', Command.cameraActionFovCompact(Command.cameraFovSetDirect(70)), 'camera @s fov_set 70'],
    ['fov set easing', Command.cameraActionFovCompact(Command.cameraFovSetEased(30,seconds)), 'camera @s fov_set 30 2 linear'],
    ['fov clear', Command.cameraActionFovCompact(Command.cameraFovClearDirect()), 'camera @s fov_clear'],
    ['fov clear easing', Command.cameraActionFovCompact(Command.cameraFovClearEased(seconds)), 'camera @s fov_clear 2 linear'],
    ['attach', Command.cameraActionEntityCompact(Command.cameraEntityAttachOption(val(entity))), 'camera @s attach_to_entity @e'],
    ['detach', Command.cameraActionEntityCompact(Command.cameraEntityDetachOption()), 'camera @s detach_from_entity'],
    ['target', Command.cameraActionEntityCompact(Command.cameraEntityTrackDirect(val(entity))), 'camera @s target_entity @e'],
    ['target offset', Command.cameraActionEntityCompact(Command.cameraEntityTrackOffset(val(entity),Command.cameraTargetCenterOffset(0,1,0))), 'camera @s target_entity @e target_center_offset 0 1 0'],
    ['remove target', Command.cameraActionEntityCompact(Command.cameraEntityRemoveOption()), 'camera @s remove_target'],
    // Ensure legacy reporters retained for old MakeCode workspaces.
    ['legacy fov set', Command.cameraActionFovCompact(Command.cameraFovSetOption(70,seconds)), 'camera @s fov_set 70 2 linear'],
    ['legacy entity track', Command.cameraActionEntityCompact(Command.cameraEntityTrackOption(val(entity), Command.cameraEntityOffset(0,1,0))), 'camera @s target_entity @e target_center_offset 0 1 0'],
    ['legacy fade', Command.cameraActionFadeCompact(Command.cameraFadeOptions(fadeTime,fadeColor)), 'camera @s fade time 0.5 1 0.5 color 0 0 0'],
];
for (const [title, report, expected] of cases) {
    const node = adapter.createCameraFromAction(self, report.command);
    assert.strictEqual(compiler.compileCommand(node), expected, title);
    const issues = validator.validateCameraCommand(node);
    assert.strictEqual(issues.some(i => i.level === validator.ValidationLevel.Error),false, title + ': validation errors ' + JSON.stringify(issues));
}
// Negative tests for validators, preserve existing error handling.
const invalid = [
    ['fov missing', AST.createCameraFovCommand(AST.CameraAction.FovSet,self,undefined), 'CAMERA_FOV_INVALID'],
    ['fov clear with value', AST.createCameraFovCommand(AST.CameraAction.FovClear,self,70), 'CAMERA_FOV_UNEXPECTED'],
    ['target missing entity', AST.createCameraEntityCommand(AST.CameraAction.TargetEntity,self), 'CAMERA_ENTITY_REQUIRED'],
    ['attach offset illegal', AST.createCameraEntityCommand(AST.CameraAction.Attach,self,entity,{x:0,y:1,z:0}), 'CAMERA_TARGET_OFFSET_UNEXPECTED'],
    ['bad easing', AST.createCameraFovCommand(AST.CameraAction.FovSet,self,70,{seconds:-1,type:AST.CameraEaseType.Linear}), 'CAMERA_EASE_INVALID'],
    ['bad fade RGB', AST.createCameraFadeCommand(self,undefined,{red:256,green:0,blue:0}), 'CAMERA_FADE_COLOR_INVALID'],
];
for (const [title, node, code] of invalid) {
    const issues = validator.validateCameraCommand(node);
    assert.ok(issues.some(i => i.level === validator.ValidationLevel.Error && i.code === code), title + ' missing '+code+': '+JSON.stringify(issues));
}
console.log('PASS: ' + cases.length + ' valid CAMERA command variants and ' + invalid.length + ' validator negatives.');
