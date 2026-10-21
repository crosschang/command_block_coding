#!/usr/bin/env node
'use strict';
/** B4-only registry generation; does not read or write legacy Registry outputs. */
const fs = require('node:fs');
const path = require('node:path');
const args=process.argv.slice(2);
const rootIndex=args.indexOf('--root');
const root = rootIndex>=0 ? path.resolve(args[rootIndex+1]||'') : path.resolve(__dirname, '..');
const source = path.join(root, 'registry/source/bedrock');
const out = path.join(root, 'src/libraries');
const check = args.includes('--check');
const allowed = rootIndex>=0 ? args.filter((_,i)=>i!==rootIndex&&i!==rootIndex+1) : args;
if (allowed.some(a => a!=='--check') || (rootIndex>=0&&!args[rootIndex+1])) {
  console.error('Usage: node tools/generate_b4_registry.cjs [--check]'); process.exit(2);
}
function load(file, kind) {
  const json = JSON.parse(fs.readFileSync(path.join(source, file), 'utf8'));
  if (!Array.isArray(json.items) || json.items.length === 0) throw Error(`${file}: non-empty items required`);
  const seen = new Set();
  for (const item of json.items) {
    if (typeof item !== 'string' || !item.trim() || item !== item.trim()) throw Error(`${file}: invalid entry ${JSON.stringify(item)}`);
    const pattern = kind === 'camera' || kind === 'fog' ? /^[a-z0-9_.-]+:[a-z0-9_.\/-]+$/ : /^[a-zA-Z0-9_.:\/-]+$/;
    if (!pattern.test(item)) throw Error(`${file}: unsupported ID ${item}`);
    if (seen.has(item)) throw Error(`${file}: duplicate ID ${item}`);
    seen.add(item);
  }
  return json.items;
}
function local(id) { return id.includes(':') ? id.split(':').slice(1).join(':') : id; }
function camel(id) {
  const pieces = local(id).split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (!pieces.length) throw Error('Could not derive a function name: '+id);
  let name = pieces[0].toLowerCase() + pieces.slice(1).map(x=>x[0].toUpperCase()+x.slice(1)).join('');
  if (/^[0-9]/.test(name)) name = 'id'+name;
  if (['default','class','function','delete','new','return','constructor','set','get','custom','controller','free'].includes(name)) name += 'Value';
  return name;
}
function token(id) { return local(id).replace(/[^A-Za-z0-9]+/g,'_').replace(/^_+|_+$/g,'').toLowerCase(); }
const cameraLegacy = new Map([
 ['minecraft:first_person','firstPerson'],['minecraft:third_person','thirdPerson'],
 ['minecraft:third_person_front','thirdPersonFront'],['minecraft:free','free'],
 ['minecraft:fixed_boom','fixedBoom'],['minecraft:follow_orbit','followOrbit'],
 ['minecraft:control_scheme_camera','controlSchemeCamera']]);
const fogLegacy = new Map([['minecraft:fog_default','fogDefault'],['minecraft:fog_plains','fogPlains'],['minecraft:fog_desert','fogDesert']]);
const animationLegacy = new Map([['animation.creeper.swelling','creeperSwelling']]);
function validateNames(entries, fn, bid, label) {
  const names = new Set(), ids = new Set();
  for (const entry of entries) {
    const name = fn(entry), blockId = bid(entry);
    if (!/^[a-zA-Z_$][\w$]*$/.test(name)) throw Error(`${label}: invalid function name ${name}`);
    if (names.has(name)) throw Error(`${label}: function collision ${name}`);
    if (ids.has(blockId)) throw Error(`${label}: block ID collision ${blockId}`);
    names.add(name);ids.add(blockId);
  }
}
function camera(entries) {
 const fn = id=>cameraLegacy.get(id)||camel(id);
 const bid = id=>'mcfunction_camera_library_'+token(id);
 validateNames(entries,fn,bid,'camera');
 const lines=['/** AUTO-GENERATED reporters from registry/source/bedrock/camera_presets.json. */','namespace MCFunctionCameraPresetLibrary {'];
 entries.forEach((id,i)=>{
    lines.push(`    //% group="Built-in" weight=${Math.max(50,98-i)}`);
    lines.push(`    //% blockId=${bid(id)}`);
    lines.push(`    //% block="camera ${id}"`);
    lines.push(`    export function ${fn(id)}(): Command.CameraPresetValue {`);
    lines.push(`        return new Command.CameraPresetValue(${JSON.stringify(id)});`);
    lines.push('    }');
 });
 lines.push('}','');return lines.join('\n');
}
/** Official client_entity references are authoring hints, not /playanimation capability claims. */
function ownerCatalog() {
 const file=path.join(root,'registry/derived/bedrock/animation_owner_links.json');
 if(!fs.existsSync(file))return {animations:{},controllers:{}};
 const data=JSON.parse(fs.readFileSync(file,'utf8'));
 if(data.schemaVersion!==1 || !data.animations || !data.controllers) throw Error('Invalid official animation owner link metadata');
 for(const group of [data.animations,data.controllers]) {
   if(typeof group!=='object' || Array.isArray(group))throw Error('Invalid owner ID mapping');
   for(const [id,owners] of Object.entries(group)) {
     if(!/^(animation\.|controller\.animation\.)[a-zA-Z0-9_.:\/-]+$/.test(id) || !Array.isArray(owners) || !owners.length || owners.some(o=>typeof o!=='string'||!/^[a-z0-9_.-]+:[a-z0-9_.-]+$/.test(o)) || new Set(owners).size!==owners.length)
       throw Error('Invalid animation owner mapping for '+id);
   }
 }
 return data;
}
function entityGroup(entityId) {
 return entityId.split(':').slice(1).join(':').split(/[_\-]+/).filter(Boolean).map(s=>s[0].toUpperCase()+s.slice(1)).join(' ');
}
function assignedGroup(id,owners) {
 const set=owners[id]||[];
 return set.length===1?entityGroup(set[0]):set.length>1?'Shared / Common':'Unmapped';
}
function groupList(entries,owners) {
 return ['Direct Input', ...new Set(entries.map(id=>assignedGroup(id,owners)))].filter(g=>g!=='Shared / Common'&&g!=='Unmapped').concat(
  entries.some(id=>assignedGroup(id,owners)==='Shared / Common')?['Shared / Common']:[],
  entries.some(id=>assignedGroup(id,owners)==='Unmapped')?['Unmapped']:[]);
}
function groupMetadata(groups) {return "//% groups='"+JSON.stringify(groups)+"'";}
function ownerChecks(catalog,animations,controllers) {
 // References may include IDs defined in other RP sources or bundled extensions;
 // never mistake missing entries for an error or silently invent a catalog item.
 const knownA=new Set(animations),knownC=new Set(controllers);
 const mappedA=Object.keys(catalog.animations).filter(id=>knownA.has(id)).length;
 const mappedC=Object.keys(catalog.controllers).filter(id=>knownC.has(id)).length;
 if(Object.keys(catalog.animations).length||Object.keys(catalog.controllers).length)
   console.log(`ANIMATION OWNER LINKS: matched animation ${mappedA}/${animations.length}, controller ${mappedC}/${controllers.length}`);
}
function animation(entries, owners) {
 const fn=id=>animationLegacy.get(id)||camel(id);
 const bid=id=>'mcfunction_animation_reference_'+token(id).replace(/^animation_/,'');
 validateNames(entries,fn,bid,'animation');
 const groups=groupList(entries,owners);
 const lines=['/** AUTO-GENERATED: original block IDs preserved; grouping derived from Mojang vanilla client_entity references. */',groupMetadata(groups),'namespace MCFunctionAnimationLibrary {'];
 entries.forEach((id,i)=>{
   lines.push(`    //% group=${JSON.stringify(assignedGroup(id,owners))} weight=${Math.max(50,90-i)}`);
   lines.push(`    //% blockId=${bid(id)}`);
   lines.push(`    //% block="${id}${id==='animation.creeper.swelling'?' (creeper)':''}"`);
   lines.push(`    export function ${fn(id)}(): AnimationValue {`);
   lines.push(`        return new AnimationValue(${JSON.stringify(id)});`);
   lines.push('    }');
 });
 lines.push('}','');return lines.join('\n');
}
function animationControllers(entries,owners) {
 const fn=id=>{const v=camel(id.replace(/^controller\.animation\./,''));return 'animationController'+v[0].toUpperCase()+v.slice(1);};
 const legacyBid=id=>'mcfunction_animation_controller_reference_'+token(id).replace(/^controller_animation_/,'');
 const newBid=id=>'mcfunction_animation_controller_library_'+token(id).replace(/^controller_animation_/,'');
 validateNames(entries,fn,legacyBid,'legacy animation controller');
 validateNames(entries,fn,newBid,'new animation controller');
 const groups=groupList(entries,owners);
 const lines=['/** Backward-compatibility: old controller APIs and block IDs stay callable, but are hidden from the new toolbox. */','namespace MCFunctionAnimationLibrary {'];
 entries.forEach(id=>{
   lines.push(`    //% blockHidden=true`);
   lines.push(`    //% blockId=${legacyBid(id)}`);
   lines.push(`    //% block="${id}"`);
   lines.push(`    export function ${fn(id)}(): ControllerValue {`);
   lines.push(`        return new ControllerValue(${JSON.stringify(id)});`);
   lines.push('    }');
 });
 lines.push('}','');
 lines.push('/** Separate MakeCode category for official animation controllers. */',groupMetadata(groups),'namespace MCFunctionAnimationControllerLibrary {');
 entries.forEach((id,i)=>{
   lines.push(`    //% group=${JSON.stringify(assignedGroup(id,owners))} weight=${Math.max(50,90-i)}`);
   lines.push(`    //% blockId=${newBid(id)}`);
   lines.push(`    //% block="${id}"`);
   lines.push(`    export function ${fn(id)}(): MCFunctionAnimationLibrary.ControllerValue {`);
   lines.push(`        return new MCFunctionAnimationLibrary.ControllerValue(${JSON.stringify(id)});`);
   lines.push('    }');
 });
 lines.push('}','');return lines.join('\n');
}
function fog(entries) {
 const fn=id=>fogLegacy.get(id)||camel(id);
 const bid=id=>'mcfunction_fog_builtin_'+token(id).replace(/^fog_/,'');
 validateNames(entries,fn,bid,'fog');
 const lines=['/** AUTO-GENERATED reporters from registry/source/bedrock/fogs.json. */','namespace MCFunctionFogLibrary {'];
 entries.forEach((id,i)=>{
   lines.push(`    //% group="Built-in" weight=${Math.max(50,90-i)}`);
   lines.push(`    //% blockId=${bid(id)}`);
   lines.push(`    //% block="fog ${id}"`);
   lines.push(`    export function ${fn(id)}(): FogValue { return new FogValue(${JSON.stringify(id)}); }`);
 });
 lines.push('}','');return lines.join('\n');
}
const animations=load('animations.json','animation');
const controllers=load('animation_controllers.json','controller');
const ownerMap=ownerCatalog();
ownerChecks(ownerMap,animations,controllers);
const plans=[
 ['camera_preset_library.generated.ts',camera(load('camera_presets.json','camera'))],
 ['animation_library.generated.ts',animation(animations,ownerMap.animations) + animationControllers(controllers,ownerMap.controllers)],
 ['fog_library.generated.ts',fog(load('fogs.json','fog'))]
];
let changes=0;
for(const [file,expected] of plans){
 const target=path.join(out,file),actual=fs.existsSync(target)?fs.readFileSync(target,'utf8'):null;
 if(actual!==expected){
   changes++; console.log(`${check?'OUTDATED':'GENERATED'} ${path.relative(root,target)}`);
   if(!check) {fs.mkdirSync(out,{recursive:true});fs.writeFileSync(target,expected,'utf8');}
 } else {console.log(`UNCHANGED ${path.relative(root,target)}`);}
}
console.log(`${check?'Check':'Generation'} finished: ${changes} changed; legacy registry outputs untouched.`);
if(check && changes) process.exitCode=1;
