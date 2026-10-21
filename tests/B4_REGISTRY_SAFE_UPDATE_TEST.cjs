'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const sourceRoot=path.resolve(__dirname,'..');
const fixture=path.join(__dirname,'fixtures');
const jsons=['camera_presets','animations','fogs'];
const generated=['camera_preset','animation','fog'];
function hash(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
function fresh(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'b4-reg-'));
 for(const part of ['tools','src/libraries','registry/source/bedrock'])fs.mkdirSync(path.join(dir,part),{recursive:true});
 for(const name of ['generate_b4_registry.cjs','update_b4_registry.cjs'])fs.copyFileSync(path.join(sourceRoot,'tools',name),path.join(dir,'tools',name));
 for(const name of jsons)fs.copyFileSync(path.join(sourceRoot,'registry/source/bedrock',name+'.json'),path.join(dir,'registry/source/bedrock',name+'.json'));
 for(const name of generated)fs.copyFileSync(path.join(sourceRoot,'src/libraries',name+'_library.generated.ts'),path.join(dir,'src/libraries',name+'_library.generated.ts'));
 fs.writeFileSync(path.join(dir,'src/libraries','legacy_library.generated.ts'),'// LEGACY SENTINEL\n');
 return dir;
}
function run(dir,script,args=[]){return spawnSync(process.execPath,[path.join(dir,'tools',script),...args],{encoding:'utf8',timeout:15000});}
function cleanup(dir){fs.rmSync(dir,{recursive:true,force:true});}
test('B4 generator reproduces current reporters byte for byte and never alters legacy output',()=>{
 const dir=fresh();try{
  const before=generated.map(n=>hash(path.join(dir,'src/libraries',n+'_library.generated.ts')));
  const p=run(dir,'generate_b4_registry.cjs',['--check']);assert.equal(p.status,0,p.stderr+p.stdout);
  const gen=run(dir,'generate_b4_registry.cjs');assert.equal(gen.status,0,gen.stderr+p.stdout);
  assert.deepEqual(generated.map(n=>hash(path.join(dir,'src/libraries',n+'_library.generated.ts'))),before);
  assert.equal(fs.readFileSync(path.join(dir,'src/libraries','legacy_library.generated.ts'),'utf8'),'// LEGACY SENTINEL\n');
 }finally{cleanup(dir);}
});
test('dry run makes no changes and staged update adds fog and optional pack animation without changing existing block IDs',()=>{
 const dir=fresh();try{
  const files=[...jsons.map(x=>path.join(dir,'registry/source/bedrock',x+'.json')),...generated.map(x=>path.join(dir,'src/libraries',x+'_library.generated.ts'))];
  const before=files.map(hash);
  let p=run(dir,'update_b4_registry.cjs',['--fixtures',fixture,'--animation-source',path.join(fixture,'animation-pack.json')]);
  assert.equal(p.status,0,p.stderr+p.stdout);assert.deepEqual(files.map(hash),before);
  p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',fixture,'--animation-source',path.join(fixture,'animation-pack.json')]);
  assert.equal(p.status,0,p.stderr+p.stdout);
  const fog=JSON.parse(fs.readFileSync(path.join(dir,'registry/source/bedrock/fogs.json'),'utf8'));
  assert.equal(fog.items.at(-1),'minecraft:fog_forest');
  const animations=JSON.parse(fs.readFileSync(path.join(dir,'registry/source/bedrock/animations.json'),'utf8'));
  assert.equal(animations.items.at(-1),'animation.test.wave');
  const cam=fs.readFileSync(path.join(dir,'src/libraries/camera_preset_library.generated.ts'),'utf8');
  assert.match(cam,/mcfunction_camera_library_control_scheme_camera/);
  const fogSource=fs.readFileSync(path.join(dir,'src/libraries/fog_library.generated.ts'),'utf8');
  assert.match(fogSource,/mcfunction_fog_builtin_default/);assert.match(fogSource,/mcfunction_fog_builtin_forest/);
  const generatedAnim=fs.readFileSync(path.join(dir,'src/libraries/animation_library.generated.ts'),'utf8');
  assert.match(generatedAnim,/mcfunction_animation_reference_creeper_swelling/);
  assert.match(generatedAnim,/animation\.test\.wave/);
  assert.equal(fs.readFileSync(path.join(dir,'src/libraries/legacy_library.generated.ts'),'utf8'),'// LEGACY SENTINEL\n');
  p=run(dir,'generate_b4_registry.cjs',['--check']); assert.equal(p.status,0,p.stdout+p.stderr);
  const saved=files.map(hash);
  p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',fixture,'--animation-source',path.join(fixture,'animation-pack.json')]);
  assert.equal(p.status,0,p.stdout+p.stderr);
  assert.deepEqual(files.map(hash),saved,'Updating with unchanged sources must be idempotent');
 }finally{cleanup(dir);}
});
test('invalid official response causes nonzero exit with no file changes',()=>{
 const dir=fresh(),bad=fs.mkdtempSync(path.join(os.tmpdir(),'b4-invalid-'));
 try{
  fs.writeFileSync(path.join(bad,'camera.md'),'### CameraPresets\n#### Values\n- `minecraft:fake`\n');
  fs.copyFileSync(path.join(fixture,'fogs.json'),path.join(bad,'fogs.json'));
  const camera=path.join(dir,'registry/source/bedrock/camera_presets.json');const h=hash(camera);
  const p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',bad]);
  assert.notEqual(p.status,0);assert.equal(hash(camera),h);
 }finally{cleanup(dir);cleanup(bad);}
});
test('generator rejects duplicate values and invalid names without overwriting generated files',()=>{
 const dir=fresh();try{
  const fog=path.join(dir,'registry/source/bedrock/fogs.json'),out=path.join(dir,'src/libraries/fog_library.generated.ts');
  const original=hash(out),data=JSON.parse(fs.readFileSync(fog,'utf8'));
  data.items.push(data.items[0]);fs.writeFileSync(fog,JSON.stringify(data));
  const p=run(dir,'generate_b4_registry.cjs');assert.notEqual(p.status,0);
  assert.equal(hash(out),original);
 }finally{cleanup(dir);}
});
test('collision during B4 upstream update is rejected before any snapshot write',()=>{
 const dir=fresh(),bad=fs.mkdtempSync(path.join(os.tmpdir(),'b4-collision-'));
 try{
  fs.copyFileSync(path.join(fixture,'camera.md'),path.join(bad,'camera.md'));
  const fogs=JSON.parse(fs.readFileSync(path.join(fixture,'fogs.json'),'utf8'));
  for(const id of ['minecraft:fog_new-test','minecraft:fog_new_test']){
    fogs.push({'minecraft:fog_settings':{description:{identifier:id}}});
  }
  fs.writeFileSync(path.join(bad,'fogs.json'),JSON.stringify(fogs));
  const first=['camera_presets','animations','fogs'].map(n=>hash(path.join(dir,'registry/source/bedrock',n+'.json')));
  const p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',bad]);
  assert.notEqual(p.status,0);
  assert.deepEqual(['camera_presets','animations','fogs'].map(n=>hash(path.join(dir,'registry/source/bedrock',n+'.json'))),first);
 }finally{cleanup(dir);cleanup(bad);}
});
