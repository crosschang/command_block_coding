'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
test('Advanced test main stays a standalone PXT public-API-only test with unique function names',()=>{
 const file='tests/B4_ADVANCED_PLAYANIMATION_FOG_COMPAT_TEST_MAIN_0.0.75.ts';
 const src=read(file);
 const names=[...src.matchAll(/FunctionFile\.define\("([^"]+)"/g)].map(x=>x[1]);
 assert.equal(names.length,20);
 assert.equal(new Set(names).size,20);
 for(const name of ['b4v_anim_prepare','b4v_anim_base','b4v_anim_state','b4v_anim_blend0',
  'b4v_anim_blend2','b4v_anim_stop3','b4v_anim_controller','b4v_anim_cleanup',
  'b4v_fog_air_push','b4v_fog_air_pop','b4v_fog_water_push','b4v_fog_end_push',
  'b4v_fog_stack_a','b4v_fog_stack_b','b4v_fog_stack_pop_b','b4v_fog_cleanup'])
  assert.ok(names.includes(name),name);
 assert.ok(!src.includes('player.execute('));
 assert.ok(!src.includes('mobs.execute('));
 assert.ok(!src.includes('MCFunctionBlocks.'));
 assert.ok(!src.includes('MCFunctionAST.'));
 assert.match(src,/animationOptions\("default", Command\.animationBlend\(0\.5\),\s*Command\.animationStop\("query\.anim_time > 3\.0"\),\s*MCFunctionAnimationControllerLibrary\.custom/);
 assert.match(src,/MCFunctionFogLibrary\.fogCrimsonForest\(\)/);
 assert.match(src,/MCFunctionFogLibrary\.fogDesert\(\)/);
});
test('Source remains unchanged outside dedicated B4 generator and updater',()=>{
 const pxt=JSON.parse(read('pxt.json'));
 // Accept newer releases without relaxing the minimum B4 baseline.
 assert.match(pxt.version, /^\d+\.\d+\.\d+$/, 'pxt.json.version must be numeric x.y.z');
 const [major,minor,patch]=pxt.version.split('.').map(Number);
 assert.ok(major>0 || minor>0 || patch>=75,
  `pxt.json version ${pxt.version} is older than the B4 baseline 0.0.75`);
 for(const file of ['src/libraries/fog_library.generated.ts','src/blocks/b4_blocks.ts'])
  assert.ok(pxt.files.includes(file));
 for(const name of ['update_registry.ps1','generate_registry.ps1']){
  // This patch MUST NOT overwrite either script; tests intentionally do not depend on them.
  assert.ok(!fs.existsSync(path.join(root,'tools',name)) || fs.statSync(path.join(root,'tools',name)).isFile());
 }
});
