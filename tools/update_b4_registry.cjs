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
let apply=false,skipGenerate=false,fixtures=null,animationSource=null,skipOfficialAnimations=false;
for(let i=0;i<argv.length;i++){
  const a=argv[i];
  if(a==='--apply')apply=true;
  else if(a==='--skip-generate')skipGenerate=true;
  else if(a==='--fixtures')fixtures=path.resolve(argv[++i]||'');
  else if(a==='--animation-source')animationSource=path.resolve(argv[++i]||'');
  else if(a==='--skip-official-animations')skipOfficialAnimations=true;
  else {console.error('Usage: node tools/update_b4_registry.cjs [--apply] [--skip-generate] [--animation-source path] [--skip-official-animations] [--fixtures directory]');process.exit(2);}
}
const SOURCE_URL={
  camera:'https://raw.githubusercontent.com/MicrosoftDocs/minecraft-creator/main/creator/Commands/commands/camera.md',
  fogList:'https://api.github.com/repos/Mojang/bedrock-samples/contents/resource_pack/fogs?ref=main',
  animationsList:'https://api.github.com/repos/Mojang/bedrock-samples/contents/resource_pack/animations?ref=main',
  controllersList:'https://api.github.com/repos/Mojang/bedrock-samples/contents/resource_pack/animation_controllers?ref=main',
  clientEntitiesList:'https://api.github.com/repos/Mojang/bedrock-samples/contents/resource_pack/entity?ref=main'
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
/** Keep the official fog media fields as authoring metadata, not a claim that the
 *  resource pack is installed or that a given Education version renders it. */
const FOG_MEDIA_FIELDS=['air','weather','water','lava','lava_resistance','powder_snow'];
function parseFogDoc(doc){
  const parsed=JSON.parse(stripJsonComments(doc));
  const entry=parsed['minecraft:fog_settings'];
  const id=entry?.description?.identifier;
  if(typeof id!=='string' || !/^[a-z0-9_.-]+:[a-z0-9_.\/-]+$/.test(id))
    throw Error('Missing valid fog description.identifier');
  function mediaTypes(obj,label){
    if(obj===undefined)return [];
    if(!obj || typeof obj!=='object' || Array.isArray(obj)) throw Error(`Invalid fog ${label} for ${id}`);
    const known=FOG_MEDIA_FIELDS.filter(key=>obj[key]!==undefined && obj[key]!==null);
    for(const key of known){if(typeof obj[key]!=='object' || Array.isArray(obj[key]))
      throw Error(`Invalid fog ${label}.${key} for ${id}`);}
    return known;
  }
  const distance=mediaTypes(entry?.distance,'distance');
  const volumetric=mediaTypes(entry?.volumetric?.density,'volumetric.density');
  const volumetricScattering=mediaTypes(entry?.volumetric?.media_coefficients,'volumetric.media_coefficients');
  return {id,distance,volumetric,volumetricScattering};
}
function mergeFogMedia(previous,found){
  const metadata={...(previous?.entries||{})};
  for(const row of found){
    if(metadata[row.id] && JSON.stringify(metadata[row.id])===JSON.stringify(row))continue;
    metadata[row.id]=row;
  }
  return {schemaVersion:1,
    source:'https://github.com/Mojang/bedrock-samples/tree/main/resource_pack/fogs',
    note:'Vanilla fog definition fields only; NOT proof the ID is active in Minecraft Education. Missing fields can inherit lower-priority fog settings.',
    entries:Object.fromEntries(Object.entries(metadata).sort(([a],[b])=>a.localeCompare(b)))};
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
/** Mojang Vanilla RP: an animation and an animation controller are separate IDs. */
function parseOfficialDefinition(text, kind){
  const doc=JSON.parse(stripJsonComments(text));
  const key=kind==='animation'?'animations':'animation_controllers';
  const prefix=kind==='animation'?'animation.':'controller.animation.';
  const values=doc[key];
  if(!values || typeof values!=='object' || Array.isArray(values))throw Error(`Mojang ${kind}: missing ${key} map`);
  const ids=Object.keys(values);
  if(!ids.length)throw Error(`Mojang ${kind}: empty ${key} map`);
  for(const id of ids){
    if(!id.startsWith(prefix) || !/^[a-zA-Z0-9_.:\/-]+$/.test(id))throw Error(`Mojang ${kind}: invalid ID ${id}`);
    if(!values[id] || typeof values[id]!=='object' || Array.isArray(values[id]))throw Error(`Mojang ${kind}: invalid definition ${id}`);
  }
  return ids;
}
function listJsonFiles(list,subdir,min){
  if(!Array.isArray(list))throw Error(`Mojang ${subdir}: invalid directory listing`);
  const base=`https://raw.githubusercontent.com/Mojang/bedrock-samples/`;
  const files=list.filter(x=>x.type==='file' && /^[\w.-]+\.json$/.test(x.name) &&
    typeof x.download_url==='string' && x.download_url.startsWith(base) &&
    x.download_url.includes(`/resource_pack/${subdir}/`)).sort((a,b)=>a.name.localeCompare(b.name));
  if(files.length<min)throw Error(`Mojang ${subdir}: only ${files.length} files (minimum ${min}); refusing incomplete update`);
  return files;
}
async function getOfficialAnimationIds(subdir,kind,minFiles){
  // Offline fixtures must be explicitly populated. Legacy fixture tests intentionally
  // omit them and retain their previous behavior.
  if(fixtures){
    const folder=path.join(fixtures,subdir);
    if(!fs.existsSync(folder))return null;
    const paths=fs.readdirSync(folder).filter(n=>n.endsWith('.json')).sort();
    if(!paths.length)throw Error(`Empty official ${kind} fixture folder`);
    let ids=[];
    for(const name of paths)ids.push(...parseOfficialDefinition(fs.readFileSync(path.join(folder,name),'utf8'),kind));
    return Array.from(new Set(ids));
  }
  const url=kind==='animation'?SOURCE_URL.animationsList:SOURCE_URL.controllersList;
  const files=listJsonFiles(JSON.parse(await fetchText(url)),subdir,minFiles);
  const ids=[];
  // Entire official directory fetched BEFORE writing registry snapshots. Any failed
  // source request aborts the update rather than silently creating a partial list.
  for(let start=0;start<files.length;start+=8){
    const batch=files.slice(start,start+8);
    const docs=await Promise.all(batch.map(f=>fetchText(f.download_url)));
    for(const doc of docs)ids.push(...parseOfficialDefinition(doc,kind));
    if((start+8)%40===0 || start+8>=files.length)
      console.log(`  Mojang ${subdir}: parsed ${Math.min(start+8,files.length)} / ${files.length} JSON files`);
  }
  const result=Array.from(new Set(ids));
  if(result.length<files.length/2)throw Error(`Mojang ${subdir}: suspiciously few IDs`);
  return result;
}
/** Client-side entity definitions provide evidence of which IDs an entity references. */
function parseClientEntity(text){
 const data=JSON.parse(stripJsonComments(text));
 const desc=data['minecraft:client_entity']?.description;
 if(!desc || typeof desc!=='object' || !/^[a-z0-9_.-]+:[a-z0-9_.-]+$/.test(desc.identifier))
   throw Error('Mojang client_entity description/identifier missing or invalid');
 const animations=new Set(),controllers=new Set();
 const add=id=>{
   if(typeof id!=='string')return;
   if(/^animation\.[a-zA-Z0-9_.:\/-]+$/.test(id))animations.add(id);
   else if(/^controller\.animation\.[a-zA-Z0-9_.:\/-]+$/.test(id))controllers.add(id);
 };
 const entries=desc.animations;
 if(entries!==undefined && (typeof entries!=='object'||!entries||Array.isArray(entries))) throw Error('client_entity animations map invalid for '+desc.identifier);
 if(entries)for(const val of Object.values(entries))add(val);
 const legacy=desc.animation_controllers;
 if(legacy!==undefined && !Array.isArray(legacy) && (typeof legacy!=='object'||!legacy))throw Error('client_entity animation_controllers invalid for '+desc.identifier);
 function scanControllers(value){
   if(typeof value==='string'){if(value.startsWith('controller.animation.'))add(value);return;}
   if(Array.isArray(value)){value.forEach(scanControllers);return;}
   if(value&&typeof value==='object')Object.values(value).forEach(scanControllers);
 }
 if(legacy)scanControllers(legacy);
 return {entityId:desc.identifier,animations:[...animations],controllers:[...controllers]};
}
async function getOfficialOwnerLinks(){
 let contents=[];
 if(fixtures){
   const folder=path.join(fixtures,'entity');
   if(!fs.existsSync(folder))throw Error('Official animation fixtures must include client entity reference folder: entity/');
   const names=fs.readdirSync(folder).filter(n=>n.endsWith('.json')).sort();
   if(!names.length)throw Error('Empty official entity fixture folder');
   contents=names.map(n=>fs.readFileSync(path.join(folder,n),'utf8'));
 }else{
   const files=listJsonFiles(JSON.parse(await fetchText(SOURCE_URL.clientEntitiesList)),'entity',100);
   for(let start=0;start<files.length;start+=8){
     contents.push(...await Promise.all(files.slice(start,start+8).map(f=>fetchText(f.download_url))));
     if((start+8)%40===0 || start+8>=files.length)
       console.log(`  Mojang entity links: parsed ${Math.min(start+8,files.length)} / ${files.length} JSON files`);
   }
 }
 const a=new Map(),c=new Map();
 for(const text of contents){
   const row=parseClientEntity(text);
   for(const id of row.animations){if(!a.has(id))a.set(id,new Set());a.get(id).add(row.entityId);}
   for(const id of row.controllers){if(!c.has(id))c.set(id,new Set());c.get(id).add(row.entityId);}
 }
 function sorted(map){return Object.fromEntries([...map].sort(([a],[b])=>a.localeCompare(b))
   .map(([id,owners])=>[id,[...owners].sort()]));}
 if(!a.size || !c.size)throw Error('Official client entity mapping is suspiciously empty');
 console.log(`ANIMATION OWNER LINKS: ${contents.length} client entities; ${a.size} animation IDs; ${c.size} controller IDs referenced`);
 return {schemaVersion:1,source:'https://github.com/Mojang/bedrock-samples/tree/main/resource_pack/entity',
   note:'Vanilla client_entity references only, not proof that /playanimation runs or is visible in Minecraft Education.',
   animations:sorted(a),controllers:sorted(c)};
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
    const entries=docs.map(d=>parseFogDoc(JSON.stringify(d)));
    if(entries.length<3)throw Error('Fog fixture under minimum confidence threshold (3)');
    return entries;
  }
  const listing=JSON.parse(await fetchText(SOURCE_URL.fogList));
  if(!Array.isArray(listing))throw Error('Mojang fog directory listing not an array');
  const files=listing.filter(x=>x.type==='file' && /^[-\w.]+\.json$/.test(x.name) && x.download_url?.startsWith('https://raw.githubusercontent.com/Mojang/bedrock-samples/'));
  if(files.length<3)throw Error('Mojang fog listing is incomplete or absent');
  // Fetch all before any write; an API outage cannot leave partial local updates.
  const entries=[];
  for(let index=0;index<files.length;index+=6){
    const batch=files.slice(index,index+6);
    const docs=await Promise.all(batch.map(f=>fetchText(f.download_url)));
    for(const doc of docs)entries.push(parseFogDoc(doc));
  }
  if(new Set(entries.map(x=>x.id)).size<3)throw Error('Too few valid fog IDs from Mojang; refusing update');
  if(new Set(entries.map(x=>x.id)).size!==entries.length)throw Error('Duplicate fog identifier in official source');
  return entries;
}
async function main(){
 const oldCamera=read('camera_presets.json'),oldFog=read('fogs.json');
 const cameraText=fixtures?fs.readFileSync(path.join(fixtures,'camera.md'),'utf8'):await fetchText(SOURCE_URL.camera);
 const cameraIds=parseCamera(cameraText);
 const fogEntries=await getFogIds();
 const fogMediaTarget=path.join(root,'registry/derived/bedrock/fog_media.json');
 const previousFogMedia=fs.existsSync(fogMediaTarget)?JSON.parse(fs.readFileSync(fogMediaTarget,'utf8')):null;
 const nextFogMedia=mergeFogMedia(previousFogMedia,fogEntries);
 const next=[['camera_presets.json',merge(oldCamera,cameraIds,'CAMERA')],
   ['fogs.json',merge(oldFog,fogEntries.map(x=>x.id),'FOG')],['@fogMedia',nextFogMedia]];
 const oldAnimation=read('animations.json');
 let nextAnimation=oldAnimation;
 if(!skipOfficialAnimations){
   const officialAnimations=await getOfficialAnimationIds('animations','animation',100);
   const officialControllers=await getOfficialAnimationIds('animation_controllers','controller',40);
   if(officialAnimations && officialControllers){
     nextAnimation=merge(nextAnimation,officialAnimations,'ANIMATION (Mojang Vanilla RP)');
     nextAnimation.source='https://github.com/Mojang/bedrock-samples/tree/main/resource_pack/animations';
     nextAnimation.note='Discovered animation definition IDs; presence does not guarantee /playanimation succeeds for every entity or Education version.';
     const controller=merge(read('animation_controllers.json'),officialControllers,'ANIMATION CONTROLLERS (Mojang Vanilla RP)');
     next.push(['animation_controllers.json',controller]);
     const ownerLinks=await getOfficialOwnerLinks();
     next.push(['@ownerLinks',ownerLinks]);
   }else if(officialAnimations || officialControllers){
     throw Error('Both animation and controller fixture directories must be provided');
   }else{
     console.log('ANIMATION: no official animation fixture present; retaining existing catalog');
   }
 }else console.log('ANIMATION: official harvesting disabled by --skip-official-animations');
 if(animationSource){
   const animationIds=parseAnimationPack(fs.readFileSync(animationSource,'utf8'));
   nextAnimation=merge(nextAnimation,animationIds,'ANIMATION (explicit local source)');
 }
 if(nextAnimation!==oldAnimation)next.push(['animations.json',nextAnimation]);
 // Verify all next registries before writing; generation checks duplicate IDs and output naming.
 for(const [file,json] of next){
   if(file==='@ownerLinks'||file==='@fogMedia')continue;
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
   for(const file of ['camera_presets.json','animations.json','animation_controllers.json','fogs.json']){
     const changed=next.find(([name])=>name===file);
     const payload=changed?JSON.stringify(changed[1],null,2)+'\n':fs.readFileSync(path.join(sourceDir,file),'utf8');
     fs.writeFileSync(path.join(stageSources,file),payload,'utf8');
   }
   const ownerChanged=next.find(([name])=>name==='@ownerLinks');
   const ownerTarget=path.join(root,'registry/derived/bedrock/animation_owner_links.json');
   const stageOwner=path.join(stagingRoot,'registry/derived/bedrock/animation_owner_links.json');
   fs.mkdirSync(path.dirname(stageOwner),{recursive:true});
   if(ownerChanged)fs.writeFileSync(stageOwner,JSON.stringify(ownerChanged[1],null,2)+'\n','utf8');
   else if(fs.existsSync(ownerTarget))fs.copyFileSync(ownerTarget,stageOwner);
   const fogMediaChanged=next.find(([name])=>name==='@fogMedia');
   const stageFogMedia=path.join(stagingRoot,'registry/derived/bedrock/fog_media.json');
   fs.mkdirSync(path.dirname(stageFogMedia),{recursive:true});
   if(fogMediaChanged)fs.writeFileSync(stageFogMedia,JSON.stringify(fogMediaChanged[1],null,2)+'\n','utf8');
   else if(fs.existsSync(fogMediaTarget))fs.copyFileSync(fogMediaTarget,stageFogMedia);
   const validate=spawnSync(process.execPath,[path.join(__dirname,'generate_b4_registry.cjs'),'--root',stagingRoot],{encoding:'utf8'});
   if(validate.status!==0)throw Error('Generated reporter validation failed: '+(validate.stderr||validate.stdout));
   for(const [file,json] of next){
     if(file==='@ownerLinks'||file==='@fogMedia'){
       const target=file==='@ownerLinks'?ownerTarget:fogMediaTarget;
       const from=file==='@ownerLinks'?stageOwner:stageFogMedia;
       const expected=fs.readFileSync(from);
       if(fs.existsSync(target)&&fs.readFileSync(target).equals(expected))console.log('UNCHANGED '+path.relative(root,target));
       else {fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(from,target);console.log('UPDATED '+path.relative(root,target));}
       continue;
     }
     const target=path.join(sourceDir,file);
     const current=JSON.parse(fs.readFileSync(target,'utf8'));
     if(JSON.stringify(current)===JSON.stringify(json)){
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
