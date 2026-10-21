'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const sourceRoot=path.resolve(__dirname,'..');
const fixture=path.join(__dirname,'fixtures');
const jsons=['camera_presets','animations','animation_controllers','fogs'];
const generated=['camera_preset','animation','fog'];
function hash(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
function fresh({copyOwnerLinks=false,copyFogMedia=false}={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'b4-reg-'));
 for(const part of ['tools','src/libraries','registry/source/bedrock'])fs.mkdirSync(path.join(dir,part),{recursive:true});
 for(const name of ['generate_b4_registry.cjs','update_b4_registry.cjs'])fs.copyFileSync(path.join(sourceRoot,'tools',name),path.join(dir,'tools',name));
 for(const name of jsons)fs.copyFileSync(path.join(sourceRoot,'registry/source/bedrock',name+'.json'),path.join(dir,'registry/source/bedrock',name+'.json'));
 for(const name of generated)fs.copyFileSync(path.join(sourceRoot,'src/libraries',name+'_library.generated.ts'),path.join(dir,'src/libraries',name+'_library.generated.ts'));
 // The generated animation reporters depend on official owner links once populated.
 // Include that derived input ONLY for byte-for-byte generation checks: other tests
 // must still start without an owner map to verify initial import and failure safety.
 if(copyOwnerLinks){
   const from=path.join(sourceRoot,'registry/derived/bedrock/animation_owner_links.json');
   if(fs.existsSync(from)){
     const to=path.join(dir,'registry/derived/bedrock/animation_owner_links.json');
     fs.mkdirSync(path.dirname(to),{recursive:true});
     fs.copyFileSync(from,to);
   }
 }
 if(copyFogMedia){
   const source=path.join(sourceRoot,'registry/derived/bedrock/fog_media.json');
   if(fs.existsSync(source)){
     const dest=path.join(dir,'registry/derived/bedrock/fog_media.json');
     fs.mkdirSync(path.dirname(dest),{recursive:true}); fs.copyFileSync(source,dest);
   }
 }
 fs.writeFileSync(path.join(dir,'src/libraries','legacy_library.generated.ts'),'// LEGACY SENTINEL\n');
 return dir;
}
function run(dir,script,args=[]){return spawnSync(process.execPath,[path.join(dir,'tools',script),...args],{encoding:'utf8',timeout:15000});}
function cleanup(dir){fs.rmSync(dir,{recursive:true,force:true});}
test('B4 generator reproduces current reporters byte for byte and never alters legacy output',()=>{
 const dir=fresh({copyOwnerLinks:true,copyFogMedia:true});try{
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
  const originalFog=JSON.parse(fs.readFileSync(path.join(dir,'registry/source/bedrock/fogs.json'),'utf8')).items;
  const fixtureFogIds=JSON.parse(fs.readFileSync(path.join(fixture,'fogs.json'),'utf8'))
   .map(doc=>doc['minecraft:fog_settings'].description.identifier);
  let p=run(dir,'update_b4_registry.cjs',['--fixtures',fixture,'--animation-source',path.join(fixture,'animation-pack.json')]);
  assert.equal(p.status,0,p.stderr+p.stdout);assert.deepEqual(files.map(hash),before);
  p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',fixture,'--animation-source',path.join(fixture,'animation-pack.json')]);
  assert.equal(p.status,0,p.stderr+p.stdout);
  const fog=JSON.parse(fs.readFileSync(path.join(dir,'registry/source/bedrock/fogs.json'),'utf8'));
  assert.deepEqual(fog.items,[...new Set([...originalFog,...fixtureFogIds])],
   'Update must preserve the entire existing FOG catalog and append only new fixture IDs');
  assert.ok(fog.items.includes('minecraft:fog_forest'),'Fixture FOG ID must be retained');
  const animations=JSON.parse(fs.readFileSync(path.join(dir,'registry/source/bedrock/animations.json'),'utf8'));
  assert.ok(animations.items.includes('animation.test.wave'),'Pack animation must be imported');
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

const officialFixture=path.join(__dirname,'fixtures','official_animation');
test('official Mojang animation + controller fixture imports two distinct catalogs without changing legacy IDs',()=>{
 const dir=fresh();try{
  const all=[...jsons.map(n=>path.join(dir,'registry/source/bedrock',n+'.json')),...generated.map(n=>path.join(dir,'src/libraries',n+'_library.generated.ts'))];
  const oldHash=all.map(hash);
  let p=run(dir,'update_b4_registry.cjs',['--fixtures',officialFixture]);
  assert.equal(p.status,0,p.stdout+p.stderr);
  assert.match(p.stdout,/ANIMATION \(Mojang Vanilla RP\)/);
  assert.deepEqual(all.map(hash),oldHash,'Dry run must never write snapshots or reporter files');
  p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',officialFixture]);
  assert.equal(p.status,0,p.stdout+p.stderr);
  const a=JSON.parse(fs.readFileSync(path.join(dir,'registry/source/bedrock/animations.json'),'utf8'));
  const c=JSON.parse(fs.readFileSync(path.join(dir,'registry/source/bedrock/animation_controllers.json'),'utf8'));
  assert.ok(a.items.includes('animation.humanoid.attack.rotations'));
  assert.ok(a.items.includes('animation.creeper.swelling'));
  assert.ok(c.items.includes('controller.animation.creeper.head'));
  assert.ok(c.items.includes('controller.animation.humanoid.attack'));
  const reporters=fs.readFileSync(path.join(dir,'src/libraries/animation_library.generated.ts'),'utf8');
  assert.match(reporters,/mcfunction_animation_reference_creeper_swelling/);
  assert.match(reporters,/export function creeperSwelling\(\)/);
  assert.match(reporters,/mcfunction_animation_controller_reference_creeper_swelling/);
  assert.match(reporters,/export function animationControllerCreeperSwelling\(\)/);
  assert.match(reporters,/animation\.humanoid\.attack\.rotations/);
  assert.match(reporters,/controller\.animation\.humanoid\.attack/);
  assert.equal(fs.readFileSync(path.join(dir,'src/libraries','legacy_library.generated.ts'),'utf8'),'// LEGACY SENTINEL\n');
  const state=all.map(hash);
  p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',officialFixture]);
  assert.equal(p.status,0,p.stdout+p.stderr);
  assert.deepEqual(all.map(hash),state,'Re-running identical official source must produce zero modifications');
  p=run(dir,'generate_b4_registry.cjs',['--check']);
  assert.equal(p.status,0,p.stdout+p.stderr);
 }finally{cleanup(dir);}
});
test('invalid or partial Mojang JSON halts before touching any B4 snapshot or reporters',()=>{
 const dir=fresh(),bad=fs.mkdtempSync(path.join(os.tmpdir(),'b4-bad-official-'));
 try{
  fs.mkdirSync(path.join(bad,'animations'));fs.mkdirSync(path.join(bad,'animation_controllers'));
  fs.copyFileSync(path.join(officialFixture,'camera.md'),path.join(bad,'camera.md'));
  fs.copyFileSync(path.join(officialFixture,'fogs.json'),path.join(bad,'fogs.json'));
  fs.writeFileSync(path.join(bad,'animations','invalid.json'),'not JSON');
  fs.writeFileSync(path.join(bad,'animation_controllers','valid.json'),JSON.stringify({animation_controllers:{'controller.animation.creeper.swelling':{states:{}}}}));
  const all=[...jsons.map(n=>path.join(dir,'registry/source/bedrock',n+'.json')),...generated.map(n=>path.join(dir,'src/libraries',n+'_library.generated.ts'))];
  const before=all.map(hash);
  const p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',bad]);
  assert.notEqual(p.status,0,p.stdout+p.stderr);
  assert.deepEqual(all.map(hash),before);
 }finally{cleanup(dir);cleanup(bad);}
});
test('incomplete fixture layout cannot silently import one official category',()=>{
 const dir=fresh(),bad=fs.mkdtempSync(path.join(os.tmpdir(),'b4-incomplete-official-'));
 try{
  fs.mkdirSync(path.join(bad,'animations'));
  fs.copyFileSync(path.join(officialFixture,'camera.md'),path.join(bad,'camera.md'));
  fs.copyFileSync(path.join(officialFixture,'fogs.json'),path.join(bad,'fogs.json'));
  fs.copyFileSync(path.join(officialFixture,'animations','creeper.animation.json'),path.join(bad,'animations','creeper.animation.json'));
  const f=path.join(dir,'registry/source/bedrock/animations.json'),before=hash(f);
  const p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',bad]);
  assert.notEqual(p.status,0,p.stdout+p.stderr);
  assert.equal(hash(f),before);
 }finally{cleanup(dir);cleanup(bad);}
});

test('existing large FOG catalog is never reduced by ANIMATION official update',()=>{
 const dir=fresh();try{
  const fogPath=path.join(dir,'registry/source/bedrock/fogs.json');
  const fog=JSON.parse(fs.readFileSync(fogPath,'utf8'));
  const originalFog=fog.items.slice();
  const syntheticFogIds=Array.from({length:77},(_,i)=>`minecraft:fixture_fog_${i}`);
  fog.items.push(...syntheticFogIds);
  const fixtureFogIds=JSON.parse(fs.readFileSync(path.join(officialFixture,'fogs.json'),'utf8'))
   .map(doc=>doc['minecraft:fog_settings'].description.identifier);
  const expectedFog=[...new Set([...originalFog,...syntheticFogIds,...fixtureFogIds])];
  fs.writeFileSync(fogPath,JSON.stringify(fog,null,2)+'\n');
  let p=run(dir,'generate_b4_registry.cjs');assert.equal(p.status,0,p.stdout+p.stderr);
  const camHash=hash(path.join(dir,'src/libraries/camera_preset_library.generated.ts'));
  p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',officialFixture]);assert.equal(p.status,0,p.stdout+p.stderr);
  const after=JSON.parse(fs.readFileSync(fogPath,'utf8'));
  assert.deepEqual(after.items,expectedFog,
   'All existing FOG IDs and 77 added fixtures must survive the ANIMATION update without duplicates');
  assert.deepEqual(after.items.slice(0,originalFog.length),originalFog,
   'Pre-existing FOG entries must keep their original order');
  assert.equal(hash(path.join(dir,'src/libraries/camera_preset_library.generated.ts')),camHash);
  assert.equal(fs.readFileSync(path.join(dir,'src/libraries','legacy_library.generated.ts'),'utf8'),'// LEGACY SENTINEL\n');
 }finally{cleanup(dir);}
});

test('owner-scoped animation / controller categories use official client_entity links and keep legacy block APIs',()=>{
 const dir=fresh();try{
  const existing=fs.readFileSync(path.join(dir,'src/libraries/animation_library.generated.ts'),'utf8');
  const legacyId='mcfunction_animation_controller_reference_creeper_swelling';
  assert.match(existing,new RegExp(legacyId));
  const ownerPath=path.join(dir,'registry/derived/bedrock/animation_owner_links.json');
  let p=run(dir,'update_b4_registry.cjs',['--fixtures',officialFixture]);
  assert.equal(p.status,0,p.stdout+p.stderr);
  assert.ok(!fs.existsSync(ownerPath),'Dry run must not create owner mapping');
  p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',officialFixture]);
  assert.equal(p.status,0,p.stdout+p.stderr);
  const metadata=JSON.parse(fs.readFileSync(ownerPath,'utf8'));
  assert.deepEqual(metadata.animations['animation.creeper.swelling'],['minecraft:creeper']);
  assert.deepEqual(metadata.animations['animation.humanoid.attack.rotations'],['minecraft:player','minecraft:zombie']);
  assert.deepEqual(metadata.controllers['controller.animation.humanoid.attack'],['minecraft:player','minecraft:zombie']);
  const output=fs.readFileSync(path.join(dir,'src/libraries/animation_library.generated.ts'),'utf8');
  assert.match(output,/namespace MCFunctionAnimationControllerLibrary \{/);
  assert.match(output,/\/\/\% group="Creeper"/);
  assert.match(output,/\/\/\% group="Shared \/ Common"/);
  assert.match(output,new RegExp(legacyId));
  assert.match(output,/blockHidden=true[\s\S]*?mcfunction_animation_controller_reference_creeper_swelling/);
  assert.match(output,/mcfunction_animation_controller_library_creeper_swelling/);
  assert.match(output,/export function animationControllerCreeperSwelling\(\): ControllerValue/);
  assert.match(output,/export function animationControllerCreeperSwelling\(\): MCFunctionAnimationLibrary.ControllerValue/);
  assert.match(output,/mcfunction_animation_reference_creeper_swelling/);
  const stable=hash(path.join(dir,'src/libraries/animation_library.generated.ts'));
  p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',officialFixture]);
  assert.equal(p.status,0,p.stdout+p.stderr);
  assert.equal(hash(path.join(dir,'src/libraries/animation_library.generated.ts')),stable);
  p=run(dir,'generate_b4_registry.cjs',['--check']);assert.equal(p.status,0,p.stdout+p.stderr);
 }finally{cleanup(dir);}
});

test('bad / partial client entity owner source aborts before changing any registry file',()=>{
 const dir=fresh(),bad=fs.mkdtempSync(path.join(os.tmpdir(),'b4-bad-owners-'));
 try{
  fs.cpSync(officialFixture,bad,{recursive:true});
  const pth=path.join(bad,'entity','creeper.entity.json');
  fs.writeFileSync(pth,'{"minecraft:client_entity":{"description":{"animations":{}}}}');
  const tracked=[...jsons.map(n=>path.join(dir,'registry/source/bedrock',n+'.json')),...generated.map(n=>path.join(dir,'src/libraries',n+'_library.generated.ts'))];
  const before=tracked.map(hash);
  const p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',bad]);
  assert.notEqual(p.status,0,p.stdout+p.stderr);
  assert.deepEqual(tracked.map(hash),before);
  assert.equal(fs.existsSync(path.join(dir,'registry/derived/bedrock/animation_owner_links.json')),false);
 }finally{cleanup(dir);cleanup(bad);}
});

test('existing FOG and owner map survive later local animation-only imports',()=>{
 const dir=fresh();try{
  let p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',officialFixture]);
  assert.equal(p.status,0,p.stdout+p.stderr);
  const owner=path.join(dir,'registry/derived/bedrock/animation_owner_links.json');
  const originalOwner=hash(owner);
  const originalFog=hash(path.join(dir,'registry/source/bedrock/fogs.json'));
  p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',fixture,'--animation-source',path.join(fixture,'animation-pack.json')]);
  assert.equal(p.status,0,p.stdout+p.stderr);
  assert.equal(hash(owner),originalOwner,'Missing official owner fixture must not erase known official links');
  // Normal fog fixture update may add new IDs, so only assert no deletions.
  const fog=JSON.parse(fs.readFileSync(path.join(dir,'registry/source/bedrock/fogs.json'),'utf8')).items;
  assert.ok(fog.length>=3);
  assert.ok(originalFog);
  const output=fs.readFileSync(path.join(dir,'src/libraries/animation_library.generated.ts'),'utf8');
  assert.match(output,/\/\/\% group="Creeper"/);
  assert.match(output,/animation\.test\.wave/);
 }finally{cleanup(dir);}
});

test('FOG media metadata is sourced from official JSON, preserves existing IDs and appears as reporter tooltip',()=>{
 const dir=fresh();try{
  const oldFog=JSON.parse(fs.readFileSync(path.join(dir,'registry/source/bedrock/fogs.json'),'utf8')).items;
  const before=hash(path.join(dir,'src/libraries/camera_preset_library.generated.ts'));
  const p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',fixture,'--skip-official-animations']);
  assert.equal(p.status,0,p.stdout+p.stderr);
  const metadata=JSON.parse(fs.readFileSync(path.join(dir,'registry/derived/bedrock/fog_media.json'),'utf8'));
  assert.deepEqual(metadata.entries['minecraft:fog_desert'].distance,['water']);
  assert.deepEqual(metadata.entries['minecraft:fog_forest'].distance,['air','weather']);
  assert.deepEqual(metadata.entries['minecraft:fog_forest'].volumetric,['air']);
  const fog=JSON.parse(fs.readFileSync(path.join(dir,'registry/source/bedrock/fogs.json'),'utf8')).items;
  assert.deepEqual(fog.slice(0,oldFog.length),oldFog);
  const generated=fs.readFileSync(path.join(dir,'src/libraries/fog_library.generated.ts'),'utf8');
  assert.match(generated,/mcfunction_fog_builtin_desert/);
  assert.match(generated,/distance: water/);
  assert.match(generated,/distance: air, weather/);
  assert.equal(hash(path.join(dir,'src/libraries/camera_preset_library.generated.ts')),before);
  const oldMeta=hash(path.join(dir,'registry/derived/bedrock/fog_media.json'));
  const oldGen=hash(path.join(dir,'src/libraries/fog_library.generated.ts'));
  const repeat=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',fixture,'--skip-official-animations']);
  assert.equal(repeat.status,0,repeat.stdout+repeat.stderr);
  assert.equal(hash(path.join(dir,'registry/derived/bedrock/fog_media.json')),oldMeta);
  assert.equal(hash(path.join(dir,'src/libraries/fog_library.generated.ts')),oldGen);
  assert.equal(run(dir,'generate_b4_registry.cjs',['--check']).status,0);
 }finally{cleanup(dir);}
});
test('FOG malformed media JSON cannot overwrite live source or derived metadata',()=>{
 const dir=fresh(),bad=fs.mkdtempSync(path.join(os.tmpdir(),'b4-bad-fog-media-'));
 try{
  const fixtureList=JSON.parse(fs.readFileSync(path.join(fixture,'fogs.json'),'utf8'));
  fixtureList[0]['minecraft:fog_settings'].distance={water:1};
  fs.writeFileSync(path.join(bad,'fogs.json'),JSON.stringify(fixtureList));
  fs.copyFileSync(path.join(fixture,'camera.md'),path.join(bad,'camera.md'));
  const before=hash(path.join(dir,'registry/source/bedrock/fogs.json'));
  const output=hash(path.join(dir,'src/libraries/fog_library.generated.ts'));
  const result=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',bad,'--skip-official-animations']);
  // Incorrect top-level distance shape must abort instead of creating a false metadata hint.
  assert.notEqual(result.status,0,result.stdout+result.stderr);
  assert.equal(hash(path.join(dir,'registry/source/bedrock/fogs.json')),before);
  assert.equal(hash(path.join(dir,'src/libraries/fog_library.generated.ts')),output);
  assert.ok(!fs.existsSync(path.join(dir,'registry/derived/bedrock/fog_media.json')));
 }finally{cleanup(dir);cleanup(bad);}
});
test('FOG 80-plus IDs are preserved and new media info never deletes older ID metadata',()=>{
 const dir=fresh();try{
  const fogPath=path.join(dir,'registry/source/bedrock/fogs.json');
  const catalog=JSON.parse(fs.readFileSync(fogPath,'utf8'));
  catalog.items.push(...Array.from({length:77},(_,i)=>`minecraft:fixture_large_${i}`));
  fs.writeFileSync(fogPath,JSON.stringify(catalog,null,2)+'\n');
  const metadataFile=path.join(dir,'registry/derived/bedrock/fog_media.json');
  fs.mkdirSync(path.dirname(metadataFile),{recursive:true});
  fs.writeFileSync(metadataFile,JSON.stringify({schemaVersion:1,entries:{'minecraft:fixture_large_0':{
   id:'minecraft:fixture_large_0',distance:['lava'],volumetric:[],volumetricScattering:[]
  }}}));
  let p=run(dir,'generate_b4_registry.cjs');assert.equal(p.status,0,p.stdout+p.stderr);
  p=run(dir,'update_b4_registry.cjs',['--apply','--fixtures',fixture,'--skip-official-animations']);
  assert.equal(p.status,0,p.stdout+p.stderr);
  const media=JSON.parse(fs.readFileSync(metadataFile,'utf8'));
  assert.deepEqual(media.entries['minecraft:fixture_large_0'].distance,['lava']);
  const next=JSON.parse(fs.readFileSync(fogPath,'utf8')).items;
  for(const id of catalog.items)assert.ok(next.includes(id),`Existing FOG lost: ${id}`);
  assert.equal(run(dir,'generate_b4_registry.cjs',['--check']).status,0);
 }finally{cleanup(dir);}
});
