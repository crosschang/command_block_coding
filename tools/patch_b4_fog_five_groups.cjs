#!/usr/bin/env node
'use strict';
/** Safe v1 -> v2 FOG media-group patch; no changes to registries, command AST or legacy generators. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const argv=process.argv.slice(2);
const mode=argv[0];
if (!['--check','--apply'].includes(mode)||argv.length!==1){
  console.error('Usage: node tools/patch_b4_fog_five_groups.cjs --check|--apply');process.exit(2);
}
const root=path.resolve(__dirname,'..');
const files={
  generator:path.join(root,'tools/generate_b4_registry.cjs'),
  library:path.join(root,'src/libraries/fog_library.ts'),
  test:path.join(root,'tests/B4_FOG_ENVIRONMENT_GROUPS_TEST.cjs')
};
const assets=path.join(__dirname,'patch_assets');
const v1Header=fs.readFileSync(path.join(assets,'fog_group_v1_header.txt'),'utf8').trimEnd();
const v2Header=fs.readFileSync(path.join(assets,'fog_group_v2_header.txt'),'utf8').trimEnd();
const oldTest=fs.readFileSync(path.join(assets,'fog_group_v1_test.cjs'),'utf8');
const newTest=fs.readFileSync(path.join(assets,'fog_group_v2_test.cjs'),'utf8');
const oldGroups='["Direct Input","Air","Water","Weather","Lava / Lava Resistance","Powder Snow","Mixed","Other / Unknown"]';
const newGroups='["Direct Input","Air + Water","Water Only","Air + Water + Weather","Lava Included","Powder Snow","Other / Unknown"]';
function normalize(s){return s.replace(/\r\n/g,'\n')}
function eolLike(data,normalized){return data.includes('\r\n')?normalized.replace(/\n/g,'\r\n'):normalized}
function replaceHeader(text){
  const v1pos=text.indexOf('/* B4 FOG ENVIRONMENT GROUPS v1');
  const v2pos=text.indexOf('/* B4 FOG ENVIRONMENT GROUPS v2');
  if(v1pos>=0 && v2pos>=0)throw Error('Conflicting v1/v2 marker: generator');
  const pos=v1pos>=0?v1pos:v2pos;
  const end=text.indexOf('function fog(entries)',pos);
  if(pos<0||end<0)throw Error('Previous environment grouping patch not found; apply v1 patch first');
  const current=text.slice(pos,end).trimEnd();
  if(current===v2Header)return text;
  if(current!==v1Header)throw Error('Unknown FOG grouping logic; refusing to overwrite user changes');
  return text.slice(0,pos)+v2Header+'\n'+text.slice(end);
}
function replaceLibrary(text){
  const oldLine=`//% groups='${oldGroups}'`;
  const newLine=`//% groups='${newGroups}'`;
  if(text.includes(newLine)){
    if(text.includes(oldLine))throw Error('Conflicting group metadata in fog_library.ts');
    return text;
  }
  if(!text.includes(oldLine)||!text.includes('blockId=mcfunction_fog_custom_id')||
      !text.includes('//% group="Direct Input" weight=99'))
    throw Error('Unexpected fog_library.ts category or custom block; refusing patch');
  return text.replace(oldLine,newLine);
}
function replaceTest(text){
  if(text===newTest)return text;
  if(text!==oldTest)throw Error('Existing FOG group test differs from shipped v1 test; refusing replacement');
  return newTest;
}
try{
 const original={},modified={};
 for(const [key,file] of Object.entries(files)){
   original[key]=fs.readFileSync(file,'utf8');
   const data=normalize(original[key]);
   modified[key]=eolLike(original[key],key==='generator'?replaceHeader(data):
      key==='library'?replaceLibrary(data):replaceTest(data));
 }
 const changes=Object.keys(files).filter(key=>original[key]!==modified[key]);
 if(mode==='--check'){
   console.log(changes.length?`SAFE TO APPLY: ${changes.join(', ')}`:'ALREADY APPLIED');
   console.log('No files modified.');process.exit(0);
 }
 if(!changes.length){console.log('ALREADY APPLIED: nothing changed.');process.exit(0)}
 const backup=fs.mkdtempSync(path.join(os.tmpdir(),'cbc-fog-five-groups-'));
 for(const key of changes)fs.writeFileSync(path.join(backup,path.basename(files[key])),original[key]);
 const written=[];
 try{
   for(const key of changes){
     if(fs.readFileSync(files[key],'utf8')!==original[key])throw Error('Changed during patch: '+files[key]);
     fs.writeFileSync(files[key],modified[key],'utf8');written.push(key);
     console.log('UPDATED '+path.relative(root,files[key]));
   }
 }catch(e){for(const key of written)fs.writeFileSync(files[key],original[key]);throw e}
 console.log('Backup: '+backup);
 console.log('Run: node tools/generate_b4_registry.cjs');
}catch(e){console.error('REFUSED: '+e.message);process.exit(1)}
