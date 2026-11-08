#!/usr/bin/env node
'use strict';
/** Safe, idempotent FOG group patch. Rejects unknown edits rather than overwriting them. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const args=process.argv.slice(2),apply=args.includes('--apply'),check=args.includes('--check');
const rootIndex=args.indexOf('--root');
if (apply===check || (rootIndex>=0&&!args[rootIndex+1]) || args.some((a,i)=>
  !['--apply','--check','--root'].includes(a) && i!==rootIndex+1)) {
 console.error('Usage: node tools/patch_b4_fog_environment_groups.cjs (--check|--apply) [--root path]');process.exit(2);
}
const root=rootIndex>=0?path.resolve(args[rootIndex+1]):path.resolve(__dirname,'..');
const paths={generator:path.join(root,'tools/generate_b4_registry.cjs'),
  library:path.join(root,'src/libraries/fog_library.ts')};
const old={},next={};
const groupNames=['Direct Input','Air','Water','Weather','Lava / Lava Resistance','Powder Snow','Mixed','Other / Unknown'];
const groupMeta=`//% groups='${JSON.stringify(groupNames)}'`;
function changeGenerator(content){
 const marker='/* B4 FOG ENVIRONMENT GROUPS v1';
 if(content.includes(marker)){
   if(!content.includes('const FOG_ENVIRONMENT_GROUPS') || !content.includes('fogEnvironmentGroup(id,media)'))
     throw Error('FOG generator marker exists but is incomplete');
   return content;
 }
 const start=content.indexOf('function fog(entries) {');
 const end=content.indexOf('\nconst animations=load(',start);
 if(start<0||end<=start)throw Error('Expected fog generator section not found');
 const part=content.slice(start,end);
 const needles=["validateNames(entries,fn,bid,'fog')",'const media=fogMediaCatalog()',
  '//% group="Built-in" weight=','fogTooltip(id,media)','mcfunction_fog_builtin_'];
 if(needles.some(s=>!part.includes(s))) throw Error('Unknown fog generator modifications detected; no files changed');
 const replacement=fs.readFileSync(path.join(__dirname,'patch_assets/fog_environment_group_generator_section.txt'),'utf8').replace(/\r\n/g,'\n').trimEnd();
 if(!replacement.includes('const FOG_ENVIRONMENT_GROUPS'))throw Error('Patch asset missing');
 return content.slice(0,start)+replacement+content.slice(end);
}
function changeLibrary(content){
 if(content.includes(groupMeta)&&content.includes('//% group="Direct Input" weight=99'))return content;
 const oldGroups=`//% groups='["Built-in", "Custom"]'`;
 if(!content.includes(oldGroups)||!content.includes('//% group="Custom" weight=99')||
  !content.includes('blockId=mcfunction_fog_custom_id'))
   throw Error('Unknown fog library modifications detected; no files changed');
 return content.replace(oldGroups,groupMeta).replace('//% group="Custom" weight=99',
  '//% group="Direct Input" weight=99');
}
try{
 for(const [key,file] of Object.entries(paths))old[key]=fs.readFileSync(file,'utf8');
 next.generator=changeGenerator(old.generator);
 next.library=changeLibrary(old.library);
 const changed=Object.keys(paths).filter(k=>old[k]!==next[k]);
 if(check){console.log(changed.length?'SAFE TO APPLY: '+changed.join(', '):'ALREADY APPLIED');console.log('No files modified.');process.exit(0);}
 if(!changed.length){console.log('ALREADY APPLIED: nothing to change.');process.exit(0);}
 const backup=fs.mkdtempSync(path.join(os.tmpdir(),'cbc-fog-groups-'));
 fs.writeFileSync(path.join(backup,'generate_b4_registry.cjs'),old.generator);
 fs.writeFileSync(path.join(backup,'fog_library.ts'),old.library);
 try{
  for(const key of changed){
   if(fs.readFileSync(paths[key],'utf8')!==old[key])throw Error('File changed during patch: '+paths[key]);
   fs.writeFileSync(paths[key],next[key],'utf8');
   console.log('UPDATED '+path.relative(root,paths[key]));
  }
 }catch(e){for(const key of changed){if(fs.readFileSync(paths[key],'utf8')===next[key])fs.writeFileSync(paths[key],old[key]);}throw e;}
 console.log('Original files backed up to: '+backup);
 console.log('Now run: node tools/generate_b4_registry.cjs');
}catch(e){console.error('REFUSED: '+e.message);process.exit(1);}
