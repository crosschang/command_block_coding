#!/usr/bin/env node
'use strict';
/** Isolated B4 registry updater. NEVER writes existing legacy registries. */
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const { spawnSync }=require('node:child_process');
const root=path.resolve(__dirname,'..');
const sourceDir=path.join(root,'registry/source/bedrock');
const argv=process.argv.slice(2);
let apply=false,skipGenerate=false,fixtures=null,animationSource=null;
for(let i=0;i<argv.length;i++){
  const a=argv[i];
  if(a==='--apply')apply=true;
  else if(a==='--skip-generate')skipGenerate=true;
  else if(a==='--fixtures')fixtures=path.resolve(argv[++i]||'');
  else if(a==='--animation-source')animationSource=path.resolve(argv[++i]||'');
  else {console.error('Usage: node tools/update_b4_registry.cjs [--apply] [--skip-generate] [--animation-source path] [--fixtures directory]');process.exit(2);}
}
const SOURCE_URL={
  camera:'https://raw.githubusercontent.com/MicrosoftDocs/minecraft-creator/main/creator/Commands/commands/camera.md',
  fogList:'https://api.github.com/repos/Mojang/bedrock-samples/contents/resource_pack/fogs?ref=main'
};
function read(name){return JSON.parse(fs.readFileSync(path.join(sourceDir,name),'utf8'));}
function stripJsonComments(input){
  let result='',inString=false,escaped=false,line=false,block=false;
  for(let i=0;i<input.length;i++){
    const c=input[i],n=input[i+1];
    if(line){if(c==='\n'){line=false;result+=c;}continue;}
    if(block){if(c==='*'&&n==='/'){block=false;i++;}else if(c==='\n')result+=c;continue;}
    if(inString){result+=c;if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')inString=false;continue;}
    if(c==='"'){inString=true;result+=c;continue;}
    if(c==='/'&&n==='/'){line=true;i++;continue;}
    if(c==='/'&&n==='*'){block=true;i++;continue;}
    result+=c;
  }
  return result;
}
function parseCamera(markdown){
  const heading=markdown.match(/^\s*#{2,4}\s+`?CameraPresets`?\s*$/mi);
  if(!heading)throw Error('CameraPresets heading missing in official document; refusing update');
  const body=markdown.slice(heading.index+heading[0].length).split(/^\s*#{1,3}\s+/m)[0];
  const ids=[...body.matchAll(/^\s*[-*+]\s+`(minecraft:[a-z0-9_]+)`/gm)].map(m=>m[1]);
  if(new Set(ids).size<4)throw Error('Too few official camera preset IDs; refusing update');
  return Array.from(new Set(ids));
}
function parseFogDoc(doc){
  const parsed=JSON.parse(stripJsonComments(doc));
  const id=parsed['minecraft:fog_settings']?.description?.identifier;
  if(typeof id!=='string' || !/^[a-z0-9_.-]+:[a-z0-9_.\/-]+$/.test(id)) throw Error('Missing valid fog description.identifier');
  return id;
}
function parseAnimationPack(text){
  const json=JSON.parse(stripJsonComments(text));
  let ids;
  if(json.animations && typeof json.animations==='object' && !Array.isArray(json.animations)) ids=Object.keys(json.animations);
  else if(Array.isArray(json.items))ids=json.items;
  else throw Error('Animation import requires {"animations":{"animation.*":{...}}} or {"items":[...]}.');
  if(ids.some(s=>typeof s!=='string'|| !/^[A-Za-z0-9_.:\/-]+$/.test(s)))throw Error('Animation source contains unsupported identifiers');
  return Array.from(new Set(ids));
}
function merge(cur,ids,label){
  if(!Array.isArray(cur.items) || cur.items.length===0)throw Error(`${label}: existing registry has no items`);
  const combined=Array.from(new Set([...cur.items,...ids]));
  if(combined.length<cur.items.length)throw Error(`${label}: unexpected deletion`);
  console.log(`${label}: existing=${cur.items.length}, discovered=${ids.length}, added=${combined.length-cur.items.length}`);
  return {...cur,items:combined};
}
async function fetchText(url){
  const ctrl=new AbortController(), t=setTimeout(()=>ctrl.abort(),15000);
  try{
    const r=await fetch(url,{headers:{'User-Agent':'command-block-coding-b4-registry/1.0','Accept':'application/vnd.github+json, text/plain, */*'},signal:ctrl.signal});
    if(!r.ok)throw Error(`HTTP ${r.status} from ${url}`);
    return await r.text();
  }finally{clearTimeout(t);}
}
async function getFogIds(){
  if(fixtures){
    const docs=JSON.parse(fs.readFileSync(path.join(fixtures,'fogs.json'),'utf8'));
    if(!Array.isArray(docs))throw Error('Fixture fogs.json must be an array of fog objects');
    const ids=docs.map(d=>parseFogDoc(JSON.stringify(d)));
    if(ids.length<3)throw Error('Fog fixture under minimum confidence threshold (3)');
    return ids;
  }
  const listing=JSON.parse(await fetchText(SOURCE_URL.fogList));
  if(!Array.isArray(listing))throw Error('Mojang fog directory listing not an array');
  const files=listing.filter(x=>x.type==='file' && /^[-\w.]+\.json$/.test(x.name) && x.download_url?.startsWith('https://raw.githubusercontent.com/Mojang/bedrock-samples/'));
  if(files.length<3)throw Error('Mojang fog listing is incomplete or absent');
  // Fetch all before any write; an API outage cannot leave partial local updates.
  const ids=[];
  for(let index=0;index<files.length;index+=6){
    const batch=files.slice(index,index+6);
    const docs=await Promise.all(batch.map(f=>fetchText(f.download_url)));
    for(const doc of docs) ids.push(parseFogDoc(doc));
  }
  if(new Set(ids).size<3)throw Error('Too few valid fog IDs from Mojang; refusing update');
  return Array.from(new Set(ids));
}
async function main(){
 const oldCamera=read('camera_presets.json'),oldFog=read('fogs.json');
 const cameraText=fixtures?fs.readFileSync(path.join(fixtures,'camera.md'),'utf8'):await fetchText(SOURCE_URL.camera);
 const cameraIds=parseCamera(cameraText);
 const fogIds=await getFogIds();
 const next=[['camera_presets.json',merge(oldCamera,cameraIds,'CAMERA')],['fogs.json',merge(oldFog,fogIds,'FOG')]];
 if(animationSource){
   const oldAnimation=read('animations.json');
   const animationIds=parseAnimationPack(fs.readFileSync(animationSource,'utf8'));
   next.push(['animations.json',merge(oldAnimation,animationIds,'ANIMATION (explicit local source)')]);
 } else {console.log('ANIMATION: unchanged (no complete universal built-in list; pass --animation-source to import local resource-pack IDs)');}
 // Verify all next registries before writing; generation checks duplicate IDs and output naming.
 for(const [file,json] of next){
   if(json.items.length!==new Set(json.items).size)throw Error(`${file}: duplicate values`);
   for(const id of json.items)if(typeof id!=='string' || !id)throw Error(`${file}: invalid id`);
 }
 if(!apply){console.log('DRY RUN: No changes made. Re-run with --apply to write B4 snapshots.');return;}
 // Preflight every candidate in an isolated temporary root. If identifier->reporter
 // conversion would collide or fail, leave ALL live snapshots and reporters unchanged.
 const stagingRoot=fs.mkdtempSync(path.join(os.tmpdir(),'b4-reg-stage-'));
 try{
   const stageSources=path.join(stagingRoot,'registry/source/bedrock');
   const stageOut=path.join(stagingRoot,'src/libraries');
   fs.mkdirSync(stageSources,{recursive:true});fs.mkdirSync(stageOut,{recursive:true});
   for(const file of ['camera_presets.json','animations.json','fogs.json']){
     const changed=next.find(([name])=>name===file);
     const payload=changed?JSON.stringify(changed[1],null,2)+'\n':fs.readFileSync(path.join(sourceDir,file),'utf8');
     fs.writeFileSync(path.join(stageSources,file),payload,'utf8');
   }
   const validate=spawnSync(process.execPath,[path.join(__dirname,'generate_b4_registry.cjs'),'--root',stagingRoot],{encoding:'utf8'});
   if(validate.status!==0)throw Error('Generated reporter validation failed: '+(validate.stderr||validate.stdout));
   for(const [file,json] of next){
     const target=path.join(sourceDir,file);
     const current=JSON.parse(fs.readFileSync(target,'utf8'));
     if(JSON.stringify(current.items)===JSON.stringify(json.items)){
       console.log('UNCHANGED '+path.relative(root,target));continue;
     }
     fs.copyFileSync(path.join(stageSources,file),target);
     console.log('UPDATED '+path.relative(root,target));
   }
   if(!skipGenerate){
     for(const file of ['camera_preset_library.generated.ts','animation_library.generated.ts','fog_library.generated.ts']){
       const target=path.join(root,'src/libraries',file),expected=fs.readFileSync(path.join(stageOut,file));
       if(fs.existsSync(target)&&fs.readFileSync(target).equals(expected))continue;
       fs.copyFileSync(path.join(stageOut,file),target);
       console.log('GENERATED '+path.relative(root,target));
     }
   }
 }finally{fs.rmSync(stagingRoot,{recursive:true,force:true});}
 console.log('B4 update complete; legacy registry sources/scripts were not touched. Review git diff.');
}
main().catch(e=>{console.error('B4 update aborted: '+e.message);process.exitCode=1;});
