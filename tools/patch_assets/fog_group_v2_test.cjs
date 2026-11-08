'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const groups=['Direct Input','Air + Water','Water Only','Air + Water + Weather',
  'Lava Included','Powder Snow','Other / Unknown'];
const generator=path.join(root,'tools/generate_b4_registry.cjs');
const idsRel='registry/source/bedrock/fogs.json';
function run(file,args=[]){return spawnSync(process.execPath,[file,...args],{encoding:'utf8',cwd:root});}
function copyWorkspace(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cbc-fog-5-groups-'));
 for(const rel of ['tools/generate_b4_registry.cjs','src/libraries/fog_library.ts',
   'registry/source/bedrock/camera_presets.json','registry/source/bedrock/animations.json',
   'registry/source/bedrock/animation_controllers.json',idsRel]){
   const dest=path.join(dir,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,rel),dest);
 }
 for(const rel of ['registry/derived/bedrock/fog_media.json','registry/derived/bedrock/animation_owner_links.json']){
   if(fs.existsSync(path.join(root,rel))){const dst=path.join(dir,rel);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(root,rel),dst)}
 }
 return dir;
}
function generate(dir){return run(generator,['--root',dir])}
function fogOut(dir){return fs.readFileSync(path.join(dir,'src/libraries/fog_library.generated.ts'),'utf8')}
function getGroupForId(data,id){
 const escaped=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const re=new RegExp('//% group="([^"\\n]+)" weight=\\d+\\s+//% blockId=(mcfunction_fog_builtin_[^\\s]+)\\s+//% block="fog '+escaped+'"');
 const match=data.match(re);assert.ok(match,'Missing FOG reporter '+id);return {group:match[1],blockId:match[2]};
}
function config(dir,combos){
 const fogFile=path.join(dir,idsRel);let data=JSON.parse(fs.readFileSync(fogFile,'utf8'));
 const entries={};const ids=[];
 for(const [suffix,media] of combos){const id='minecraft:fog_test_'+suffix;ids.push(id);
   if(media!==null)entries[id]={id,distance:media[0],volumetric:media[1]||[],volumetricScattering:media[2]||[]};
 }
 data.items=ids;fs.writeFileSync(fogFile,JSON.stringify(data,null,2)+'\n');
 const meta=path.join(dir,'registry/derived/bedrock/fog_media.json');
 fs.mkdirSync(path.dirname(meta),{recursive:true});fs.writeFileSync(meta,JSON.stringify({schemaVersion:1,entries}));
 return ids;
}
test('FOG namespaces declare five media combination groups, with original Custom ID preserved',()=>{
 const s=fs.readFileSync(path.join(root,'src/libraries/fog_library.ts'),'utf8');
 const g=fs.readFileSync(generator,'utf8');
 assert.ok(s.includes(`//% groups='${JSON.stringify(groups)}'`));
 assert.match(s,/blockId=mcfunction_fog_custom_id/);
 assert.match(s,/\/\/% group="Direct Input" weight=99/);
 assert.match(g,/B4 FOG ENVIRONMENT GROUPS v2/);
 assert.ok(!g.includes("return 'Mixed'"));
});
test('FOG group matches exact official media combinations and sends future combinations to Other',()=>{
 const dir=copyWorkspace();
 try{
   const cases=[
      ['air_water',[['air','water']],'Air + Water'],
      ['water',[['water']],'Water Only'],
      ['air_water_weather',[['air','water','weather']],'Air + Water + Weather'],
      ['lava',[['air','water','weather','lava','lava_resistance']],'Lava Included'],
      ['lava_resistance',[['lava_resistance']],'Lava Included'],
      ['powder_snow',[['powder_snow']],'Powder Snow'],
      ['air_only',[['air']],'Other / Unknown'],
      ['weather_only',[['weather']],'Other / Unknown'],
      ['odd_mix',[['air','powder_snow']],'Other / Unknown'],
      ['missing',null,'Other / Unknown'],
      ['distributed',[['water'],['air'],[]],'Air + Water'],
      ['distributed_weather',[['water'],['weather'],['air']],'Air + Water + Weather']
   ];
   const ids=config(dir,cases.map(([n,m])=>[n,m]));const r=generate(dir);assert.equal(r.status,0,r.stdout+r.stderr);
   const data=fogOut(dir);
   assert.equal((data.match(/\/\/% blockId=mcfunction_fog_builtin_/g)||[]).length,ids.length);
   for(let i=0;i<cases.length;i++){
      const {group,blockId}=getGroupForId(data,ids[i]);assert.equal(group,cases[i][2],ids[i]);
      assert.equal(blockId,'mcfunction_fog_builtin_'+ids[i].split(':')[1].replace(/^fog_/,'').replace(/[^a-z0-9]+/g,'_'));
   }
   assert.ok(data.includes('"Air + Water"'));
   assert.ok(data.includes('"Water Only"'));
   assert.equal(run(generator,['--root',dir,'--check']).status,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('80-item regression distribution 42/24/7/6/1; reporter IDs unique',()=>{
 const dir=copyWorkspace();
 try{
   const cases=[];
   for(const [label,n,media] of [
     ['aw',42,[['air','water']]],['w',24,[['water']]],
     ['aww',7,[['air','water','weather']]],
     ['lava',6,[['air','water','weather','lava','lava_resistance']]],
     ['snow',1,[['powder_snow']]]]){
       for(let i=0;i<n;i++)cases.push([label+'_'+String(i).padStart(2,'0'),media]);
   }
   const ids=config(dir,cases);
   const genFile=path.join(dir,'tools/generate_b4_registry.cjs');
   const currentGen=fs.readFileSync(genFile,'utf8').replace(/\r\n/g,'\n');
   const assets=path.join(root,'tools/patch_assets');
   const v1Header=fs.readFileSync(path.join(assets,'fog_group_v1_header.txt'),'utf8').trimEnd();
   const v2Header=fs.readFileSync(path.join(assets,'fog_group_v2_header.txt'),'utf8').trimEnd();
   assert.ok(currentGen.includes(v2Header));
   fs.writeFileSync(genFile,currentGen.replace(v2Header,v1Header));
   const old=generate(dir);assert.equal(old.status,0,old.stdout+old.stderr);
   const oldData=fogOut(dir);
   fs.writeFileSync(genFile,currentGen);
   const r=generate(dir);assert.equal(r.status,0,r.stdout+r.stderr);
   const data=fogOut(dir);const counts={};const blockIds=[];
   const reporterSignature=content=>[...content.matchAll(/export function ([A-Za-z0-9_$]+)\(\): FogValue \{ return new FogValue\("([^"]+)"\); \}/g)]
      .map(m=>m[1]+':'+m[2]).sort();
   assert.deepEqual(reporterSignature(data),reporterSignature(oldData),'Reporter functions and returned IDs must remain unchanged');
   for(const id of ids)assert.equal(getGroupForId(oldData,id).blockId,getGroupForId(data,id).blockId);
   for(const id of ids){const row=getGroupForId(data,id);counts[row.group]=(counts[row.group]||0)+1;blockIds.push(row.blockId)}
   assert.deepEqual(counts,{'Air + Water':42,'Water Only':24,'Air + Water + Weather':7,'Lava Included':6,'Powder Snow':1});
   assert.equal(new Set(blockIds).size,80);
   assert.ok(!data.includes('//% group="Mixed"'));
   assert.equal(run(generator,['--root',dir,'--check']).status,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('FOG generation preserves CAMERA/ANIMATION generated bytes, all Registry JSON, and is repeatable',()=>{
 const dir=copyWorkspace();
 try{
   const ids=config(dir,[['basic',[['air','water']]],['water',[['water']]]]);
   const sources=['camera_presets','animations','animation_controllers','fogs'].map(name=>fs.readFileSync(path.join(dir,'registry/source/bedrock',name+'.json'),'utf8'));
   const first=generate(dir);assert.equal(first.status,0,first.stdout+first.stderr);
   const lib=path.join(dir,'src/libraries');
   const files=['camera_preset_library.generated.ts','animation_library.generated.ts','fog_library.generated.ts'];
   const before=files.map(f=>fs.readFileSync(path.join(lib,f),'utf8'));
   const second=generate(dir);assert.equal(second.status,0,second.stdout+second.stderr);
   const after=files.map(f=>fs.readFileSync(path.join(lib,f),'utf8'));
   assert.deepEqual(after,before);
   for(let i=0;i<sources.length;i++)assert.equal(fs.readFileSync(path.join(dir,'registry/source/bedrock',['camera_presets','animations','animation_controllers','fogs'][i]+'.json'),'utf8'),sources[i]);
   assert.equal(run(generator,['--root',dir,'--check']).status,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('patch --check is read-only and --apply is idempotent on updated source',()=>{
 const files=['tools/generate_b4_registry.cjs','src/libraries/fog_library.ts','tests/B4_FOG_ENVIRONMENT_GROUPS_TEST.cjs'];
 const before=files.map(rel=>fs.readFileSync(path.join(root,rel),'utf8'));
 const tool=path.join(root,'tools/patch_b4_fog_five_groups.cjs');
 const c=run(tool,['--check']);assert.equal(c.status,0,c.stdout+c.stderr);
 const a=run(tool,['--apply']);assert.equal(a.status,0,a.stdout+a.stderr);
 assert.deepEqual(files.map(rel=>fs.readFileSync(path.join(root,rel),'utf8')),before);
});
