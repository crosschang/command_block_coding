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
function animation(entries) {
 const fn=id=>animationLegacy.get(id)||camel(id);
 const bid=id=>'mcfunction_animation_reference_'+token(id).replace(/^animation_/,'');
 validateNames(entries,fn,bid,'animation');
 const lines=['/** AUTO-GENERATED reference reporter; see registry/source/bedrock/animations.json. */','namespace MCFunctionAnimationLibrary {'];
 entries.forEach((id,i)=>{
   lines.push(`    //% group="Reference" weight=${Math.max(50,90-i)}`);
   lines.push(`    //% blockId=${bid(id)}`);
   lines.push(`    //% block="${id}${id==='animation.creeper.swelling'?' (creeper)':''}"`);
   lines.push(`    export function ${fn(id)}(): AnimationValue {`);
   lines.push(`        return new AnimationValue(${JSON.stringify(id)});`);
   lines.push('    }');
 });
 lines.push('}','');return lines.join('\n');
}
function animationControllers(entries) {
 const fn=id=>{const v=camel(id.replace(/^controller\.animation\./,''));return 'animationController'+v[0].toUpperCase()+v.slice(1);};
 const bid=id=>'mcfunction_animation_controller_reference_'+token(id).replace(/^controller_animation_/,'');
 validateNames(entries,fn,bid,'animation controller');
 const lines=['/** AUTO-GENERATED official Mojang animation controller IDs. */','namespace MCFunctionAnimationLibrary {'];
 entries.forEach((id,i)=>{
   lines.push(`    //% group="Controllers" weight=${Math.max(50,90-i)}`);
   lines.push(`    //% blockId=${bid(id)}`);
   lines.push(`    //% block="${id}"`);
   lines.push(`    export function ${fn(id)}(): ControllerValue {`);
   lines.push(`        return new ControllerValue(${JSON.stringify(id)});`);
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
const plans=[
 ['camera_preset_library.generated.ts',camera(load('camera_presets.json','camera'))],
 ['animation_library.generated.ts',animation(load('animations.json','animation')) + animationControllers(load('animation_controllers.json','controller'))],
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
