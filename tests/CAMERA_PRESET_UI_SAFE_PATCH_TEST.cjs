'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const patcher = path.resolve(__dirname, '../tools/patch_camera_preset_ui_0_0_75.cjs');
const old = 'preset.shadow="mcfunction_camera_preset_builtin"';
const current = 'preset.shadow="mcfunction_camera_library_first_person"';
function makeFixture({slots=13,version='0.0.75'}={}) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'camera-preset-ui-'));
  fs.mkdirSync(path.join(root,'src','blocks'),{recursive:true});
  fs.mkdirSync(path.join(root,'src','libraries'),{recursive:true});
  const block = [
    'namespace Command {',
    '    //% blockId=mcfunction_camera_preset_builtin',
    '    //% group="CAMERA" weight=96',
    '    export function cameraPresetBuiltin(preset: CameraPresetChoice): CameraPresetValue { return new CameraPresetValue("minecraft:free"); }',
    ...Array.from({length:slots},(_,i)=>'    //% '+old+' // slot '+i),
    '    // unrelated CAMERA AST adapter remains unchanged',
    '}'
  ].join('\n')+'\n';
  fs.writeFileSync(path.join(root,'src','blocks','camera_blocks.ts'),block);
  fs.writeFileSync(path.join(root,'src','libraries','camera_preset_library.generated.ts'),'//% blockId=mcfunction_camera_library_first_person\nexport function firstPerson(): Command.CameraPresetValue { return new Command.CameraPresetValue("minecraft:first_person"); }\n');
  fs.writeFileSync(path.join(root,'pxt.json'),JSON.stringify({version,files:['src/blocks/camera_blocks.ts','src/libraries/camera_preset_library.generated.ts']}));
  return {root,file:path.join(root,'src','blocks','camera_blocks.ts'),block};
}
function run(root,option) { return spawnSync(process.execPath,[patcher,option,'--root',root],{encoding:'utf8'}); }
test('dry run is read-only and apply changes 13 shadows while retaining original legacy API and other lines',t=>{
  const f=makeFixture();t.after(()=>fs.rmSync(f.root,{recursive:true,force:true}));
  assert.equal(run(f.root,'--check').status,0);
  assert.equal(fs.readFileSync(f.file,'utf8'),f.block);
  const r=run(f.root,'--apply');assert.equal(r.status,0,r.stderr);
  const text=fs.readFileSync(f.file,'utf8');
  assert.equal(text.split(current).length-1,13);
  assert.equal(text.split(old).length-1,0);
  assert.match(text,/blockId=mcfunction_camera_preset_builtin\n    \/\/% blockHidden=true/);
  assert.match(text,/export function cameraPresetBuiltin/);
  assert.match(text,/unrelated CAMERA AST adapter remains unchanged/);
  assert.equal(fs.readFileSync(f.file+'.before_camera_preset_ui_0_0_75.bak','utf8'),f.block);
  assert.equal(run(f.root,'--apply').status,0);
  assert.equal(fs.readFileSync(f.file,'utf8'),text);
});
test('unrecognized CAMERA slot layout is rejected without writing',t=>{
  const f=makeFixture({slots:12});t.after(()=>fs.rmSync(f.root,{recursive:true,force:true}));
  assert.notEqual(run(f.root,'--apply').status,0);
  assert.equal(fs.readFileSync(f.file,'utf8'),f.block);
});
test('non-0.0.75 workspace is rejected without writing',t=>{
  const f=makeFixture({version:'0.0.76'});t.after(()=>fs.rmSync(f.root,{recursive:true,force:true}));
  assert.notEqual(run(f.root,'--apply').status,0);
  assert.equal(fs.readFileSync(f.file,'utf8'),f.block);
});
