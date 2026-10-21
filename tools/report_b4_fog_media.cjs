#!/usr/bin/env node
'use strict';
/** Read-only report from the user's installed B4 fog Registry and Mojang metadata. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'registry/derived/bedrock/fog_media.json');
const catalog=path.join(root,'registry/source/bedrock/fogs.json');
if(!fs.existsSync(file)){
 console.error('Missing fog media metadata. Run: node tools/update_b4_registry.cjs --apply');
 process.exit(2);
}
const meta=JSON.parse(fs.readFileSync(file,'utf8'));
const ids=JSON.parse(fs.readFileSync(catalog,'utf8')).items;
if(meta.schemaVersion!==1 || !meta.entries || !Array.isArray(ids))throw Error('Invalid B4 FOG metadata or ID catalog');
const C=['air','weather','water','lava','lava_resistance','powder_snow'];
const counts=Object.fromEntries(C.map(x=>[x,0]));
let unlinked=0;
function names(id){
 const v=meta.entries[id];
 if(!v){unlinked++;return ['','',''];}
 const distance=v.distance||[],density=v.volumetric||[],scattering=v.volumetricScattering||[];
 for(const k of C){if(distance.includes(k)||density.includes(k)||scattering.includes(k))counts[k]++;}
 return [distance.join(' '),density.join(' '),scattering.join(' ')];
}
const rows=ids.map(id=>[id,...names(id)]);
console.log('FOG IDs:',ids.length,'| no official metadata:',unlinked);
console.log('Official definition environment counts (may overlap):',JSON.stringify(counts));
console.log('These are JSON definitions, NOT Education runtime compatibility claims.');
const arg=process.argv.slice(2);
if(!arg.length)process.exit(0);
if(arg.length!==2||arg[0]!=='--csv'||!arg[1]){
 console.error('Usage: node tools/report_b4_fog_media.cjs [--csv output-file.csv]');process.exit(2);
}
const quote=s=>'"'+String(s).replace(/"/g,'""')+'"';
const output=[['fogId','distance','volumetric_density','volumetric_media_coefficients'],...rows]
 .map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
fs.mkdirSync(path.dirname(path.resolve(arg[1])),{recursive:true});
fs.writeFileSync(path.resolve(arg[1]),output,'utf8');
console.log('Wrote',path.resolve(arg[1]));
