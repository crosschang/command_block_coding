const fs = require('fs');
const vm = require('vm');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
const path = require('path');
const assert = require('assert');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ console, Math });
function load(rel) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  const result = ts.transpileModule(src, {fileName: rel, compilerOptions:{target:ts.ScriptTarget.ES5, module:ts.ModuleKind.None}});
  assert.strictEqual(result.diagnostics?.length || 0, 0, rel+' parse');
  vm.runInContext(result.outputText, context, {filename:rel});
}
vm.runInContext(fs.readFileSync('/mnt/data/b4_full_test.js','utf8'), context, {filename:'b4_full_test.js'});
const A=context.MCFunctionAST, C=context.MCFunctionCompiler, V=context.MCFunctionValidator;
const me=A.createNamedPlayerTarget('TestPlayer');
const cases=[
  [A.createPlayAnimationCommand(me,'animation.creeper.swelling'), 'playanimation TestPlayer animation.creeper.swelling'],
  [A.createPlayAnimationCommand(me,'animation.creeper.swelling','default'), 'playanimation TestPlayer animation.creeper.swelling default'],
  [A.createPlayAnimationCommand(me,'animation.creeper.swelling','default',0), 'playanimation TestPlayer animation.creeper.swelling default 0'],
  [A.createPlayAnimationCommand(me,'animation.creeper.swelling','default',0,'query.is_alive'), 'playanimation TestPlayer animation.creeper.swelling default 0 "query.is_alive"'],
  [A.createPlayAnimationCommand(me,'animation.creeper.swelling','default',0,'query.is_alive','controller.animation.test'), 'playanimation TestPlayer animation.creeper.swelling default 0 "query.is_alive" controller.animation.test'],
  [A.createPlayAnimationCommand(me,'pack:custom_animation'), 'playanimation TestPlayer pack:custom_animation'],
  [A.createPlayAnimationCommand(me,'custom animation'), 'playanimation TestPlayer "custom animation"'],
  [A.createPlayAnimationCommand(me,'animation.good','custom state',0,'q.is_alive','controller.custom entry'),
   'playanimation TestPlayer animation.good "custom state" 0 "q.is_alive" "controller.custom entry"'],
  [A.createFogCommand(me,A.FogAction.Push,'my_fog','minecraft:fog_default'), 'fog TestPlayer push minecraft:fog_default my_fog'],
  [A.createFogCommand(me,A.FogAction.Pop,'my_fog'), 'fog TestPlayer pop my_fog'],
  [A.createFogCommand(me,A.FogAction.Remove,'my_fog'), 'fog TestPlayer remove my_fog'],
  [A.createFogCommand(me,A.FogAction.Push,'my_fog','custom_pack:fog'), 'fog TestPlayer push custom_pack:fog my_fog']
];
for (const [node,expected] of cases){
  assert.strictEqual(C.compileCommand(node),expected);
  assert.strictEqual(V.hasError(V.validateCommand(node)),false,expected);
}
const invalid=[
  A.createPlayAnimationCommand(me,''),
  A.createPlayAnimationCommand(me,'animation.bad\ncomment'),
  A.createPlayAnimationCommand(me,'animation.good',undefined,0),
  A.createPlayAnimationCommand(me,'animation.good','default',-2),
  A.createPlayAnimationCommand(me,'animation.good','default',Infinity),
  A.createPlayAnimationCommand(me,'animation.good','default',1,'bad\nexpr'),
  A.createPlayAnimationCommand(me,'animation.good','default',1,undefined,'controller.test'),
  A.createFogCommand(me,A.FogAction.Push,'stack',undefined),
  A.createFogCommand(me,A.FogAction.Push,'bad stack','minecraft:fog_default'),
  A.createFogCommand(me,A.FogAction.Remove,'my_fog','minecraft:fog_default'),
  A.createFogCommand(me,6,'my_fog'),
  A.createFogCommand(me,A.FogAction.Pop,'')
];
for (const node of invalid) {
  assert.strictEqual(V.hasError(V.validateCommand(node)),true,JSON.stringify(node));
}
// Metadata and UI: new names appear in pxt without modifying released version.
const pxt=JSON.parse(fs.readFileSync(path.join(root,'pxt.json'),'utf8'));
assert.strictEqual(pxt.version,'0.0.75');
for(const file of ['commands/b4_actions.ts','src/blocks/b4_blocks.ts',
  'src/libraries/camera_preset_library.ts','src/libraries/camera_preset_library.generated.ts',
  'src/libraries/animation_library.ts','src/libraries/animation_library.generated.ts',
  'src/libraries/fog_library.ts','src/libraries/fog_library.generated.ts'])
  assert(pxt.files.includes(file),file+' not in pxt');
const ids=[];
for(const file of pxt.files.filter(s=>s.endsWith('.ts'))){
  if(!fs.existsSync(path.join(root,file))) continue;
  for(const m of fs.readFileSync(path.join(root,file),'utf8').matchAll(/blockId=([\w-]+)/g))ids.push(m[1]);
}
const duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i);
assert.deepStrictEqual(duplicates,[],'duplicate MakeCode block ID: '+duplicates.join(','));
const json=JSON.parse(fs.readFileSync(path.join(root,'registry/source/bedrock/camera_presets.json')));
assert.strictEqual(json.items.length,7);
const reporters=fs.readFileSync(path.join(root,'src/libraries/camera_preset_library.generated.ts'),'utf8');
for(const id of json.items) assert(reporters.includes('"'+id+'"'),id);
console.log(`PASS: ${cases.length} canonical compiler/validator cases, ${invalid.length} invalid cases, library+block ID checks`);
