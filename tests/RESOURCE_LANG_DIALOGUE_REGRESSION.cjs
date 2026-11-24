/** Resource AST/Block/Compiler regression.
 * Run: node --test tests/RESOURCE_LANG_DIALOGUE_REGRESSION.cjs
 * A full MakeCode/PXT build and Minecraft Education execution are separate.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const os=require('node:os');
const path=require('node:path');
const {test}=require('node:test');
test('LANG and Dialogue authoring blocks generate valid pack resource text',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mcresource-'));
 try {
 const stubs="namespace MCFunctionAST {\n export enum CommandKind { Raw=0, Say=1, McFunction=2 }\n export interface CommandNode { kind:CommandKind; }\n export interface RawCommand extends CommandNode {raw:string}\n export interface SayCommand extends CommandNode {message:string}\n export interface McFunctionCommand extends CommandNode {functionId:string}\n export function createRawCommand(s:string):CommandNode {return <RawCommand>{kind:CommandKind.Raw,raw:s}}\n export function createSayCommand(s:string):CommandNode {return <SayCommand>{kind:CommandKind.Say,message:s}}\n export function createMcFunctionCommand(s:string):CommandNode {return <McFunctionCommand>{kind:CommandKind.McFunction,functionId:s}}\n}\nnamespace MCFunctionCompiler {\n export function compileCommand(c:MCFunctionAST.CommandNode):string {\n  if(c.kind==MCFunctionAST.CommandKind.Raw)return (<MCFunctionAST.RawCommand>c).raw;\n  if(c.kind==MCFunctionAST.CommandKind.Say)return \"say \"+(<MCFunctionAST.SayCommand>c).message;\n  if(c.kind==MCFunctionAST.CommandKind.McFunction)return \"function \"+(<MCFunctionAST.McFunctionCommand>c).functionId;\n  return \"\";\n }\n}\nnamespace MCFunctionParser {\n export enum LineKind { Blank=0,Comment=1,Command=2 }\n export interface ParsedLine {kind:LineKind;command?:MCFunctionAST.CommandNode}\n export function parseLine(s:string):ParsedLine {\n  if(s.length==0)return {kind:LineKind.Blank};\n  if(s.substr(0,4)==\"say \")return {kind:LineKind.Command,command:MCFunctionAST.createSayCommand(s.substr(4))};\n  if(s.substr(0,9)==\"function \")return {kind:LineKind.Command,command:MCFunctionAST.createMcFunctionCommand(s.substr(9))};\n  return {kind:LineKind.Command,command:MCFunctionAST.createRawCommand(s)};\n }\n}\nnamespace MCFunctionValidator {\n export enum ValidationLevel {Error=0,Warning=1,Info=2}\n export interface ValidationIssue {level:ValidationLevel;code:string;message:string;}\n export function hasError(a:ValidationIssue[]):boolean {\n  for(let i=0;i<a.length;i++)if(a[i].level==ValidationLevel.Error)return true;\n  return false;\n }\n}\nnamespace FunctionFile { export function allowBridgeConfiguration():boolean{return true;} }\n";
 const cases="function check(ok:boolean,msg:string):void {if(!ok)throw \"Assertion: \"+msg;}\nfunction hasCode(code:string):boolean {\n let issues=MCFunctionResourceProject.validate();\n for(let i=0;i<issues.length;i++)if(issues[i].code==code)return true;\n return false;\n}\nLanguageFile.define(\"en_US\",function(){\n LanguageFile.entry(\"dialogue.greeting\",\"Welcome!\");\n LanguageFile.entry(\"dialogue.start\",\"Start\");\n LanguageFile.entry(\"dialogue.personal\",\"Hello %%1\");\n});\nLanguageFile.define(\"ko_KR\",function(){\n LanguageFile.entry(\"dialogue.greeting\",\"환영합니다!\");\n LanguageFile.entry(\"dialogue.start\",\"시작\");\n LanguageFile.entry(\"dialogue.personal\",\"안녕하세요 %%1\");\n});\nDialogueFile.define(\"npc/intro\",\"1.20.80\",function(){\n DialogueFile.scene(\"intro\",ResourceText.plain(\"Guide\"),\n  ResourceText.join(ResourceText.translate(\"dialogue.greeting\"),ResourceText.text(\"!\")),\n  function(){\n   DialogueFile.onOpen(\"say opened\");\n   DialogueFile.button(ResourceText.translate(\"dialogue.start\"),function(){\n     DialogueFile.buttonCommand(\"/give @initiator minecraft:gold_ingot\");\n   });\n  });\n DialogueFile.scene(\"score_test\",ResourceText.plain(\"Guide\"),\n  ResourceText.join(ResourceText.score(\"@s\",\"points\"),ResourceText.selector(\"@p\")),\n  function(){\n   DialogueFile.onClose(\"execute if entity @s[tag=computer1] run tag @initiator add tried\");\n   DialogueFile.button(ResourceText.translateWith(\"dialogue.personal\",\"Steve\"),function(){\n      DialogueFile.buttonCommand(\"/tag @initiator[tag=tried] add seen\");\n   });\n  });\n});\nlet plan=ResourceFiles.outputs();\ncheck(plan.length==4,\"two .lang, catalog and dialogue JSON\");\ncheck(plan[0].path==\"texts/languages.json\",\"catalog path\");\ncheck(plan[1].path==\"texts/en_US.lang\",\"en file\");\ncheck(plan[2].path==\"texts/ko_KR.lang\",\"ko file\");\ncheck(plan[3].path==\"dialogue/npc/intro.json\",\"dialogue path\");\ncheck(plan[0].pack==MCFunctionResource.PackKind.Resource,\"language is resource pack\");\ncheck(plan[3].pack==MCFunctionResource.PackKind.Behavior,\"dialogue is behavior pack\");\ncheck(LanguageFile.languagesJson()=='[\"en_US\",\"ko_KR\"]\\n',\"catalog content\");\ncheck(LanguageFile.output(\"en_US\").indexOf(\"dialogue.greeting=Welcome!\\t###\")>=0,\"lang delimiter\");\ncheck(LanguageFile.output(\"ko_KR\").indexOf(\"dialogue.greeting=환영합니다!\")>=0,\"UTF8 content\");\ncheck(LanguageFile.output(\"en_US\").charCodeAt(0)!=65279,\"no BOM\");\nlet json=DialogueFile.output(\"npc/intro\");\ncheck(json.indexOf('\"format_version\":\"1.20.80\"')>=0,\"format\");\ncheck(json.indexOf('\"scene_tag\":\"intro\"')>=0,\"scene\");\ncheck(json.indexOf('\"translate\":\"dialogue.greeting\"')>=0,\"translate\");\ncheck(json.indexOf('\"commands\":[\"/give @initiator minecraft:gold_ingot\"]')>=0,\"slash command\");\ncheck(json.indexOf('\"with\":[\"Steve\"]')>=0,\"with placeholder\");\ncheck(json.indexOf('\"score\":{\"name\":\"@s\",\"objective\":\"points\"}')>=0,\"score\");\ncheck(json.indexOf('\"selector\":\"@p\"')>=0,\"selector\");\ncheck(hasCode(\"DIALOGUE_DYNAMIC_SCORE_RENDER\"),\"dynamic score warning\");\ncheck(hasCode(\"DIALOGUE_DYNAMIC_SELECTOR_RENDER\"),\"dynamic selector warning\");\ncheck(hasCode(\"DIALOGUE_INITIATOR_FILTER_CONTEXT\"),\"initiator filter warning\");\ncheck(hasCode(\"DIALOGUE_EXECUTE_INITIATOR_NESTED\"),\"nested initiator warning\");\ncheck(!MCFunctionValidator.hasError(MCFunctionResourceProject.validate()),\"warnings do not block export\");\ncheck(MCFunctionResourceCodec.quote(\"\\u0001\")=='\"\\\\u0001\"',\"escape control\");\nlet onlyKo:MCFunctionResource.LanguageDocument[]=[MCFunctionResource.language(\"ko_KR\")];\nlet koIssue=MCFunctionResourceValidator.validateProject(onlyKo,[]);\ncheck(koIssue.length>0 && koIssue[0].code==\"LANG_EN_US_REQUIRED\",\"English fallback required\");\nlet traversal=MCFunctionResource.dialogue(\"../unsafe\",\"1.20.80\");\ntraversal.scenes.push(MCFunctionResource.scene(\"ok\"));\ncheck(MCFunctionResourceValidator.validateDialogue(traversal,[])[0].code==\"DIALOGUE_FILE_ID_INVALID\",\"path traversal\");\nLanguageFile.define(\"en_US\",function(){LanguageFile.entry(\"x\",\"duplicate\");});\ncheck(hasCode(\"LANG_LOCALE_DUPLICATE\"),\"duplicate locale detected\");\ncheck(ResourceFiles.outputs().length==0,\"fail-closed for invalid resources\");\nLanguageFile.entry(\"invalid\",\"outside\");\ncheck(hasCode(\"RESOURCE_DEFINITION_CONTEXT\"),\"out-of-container detected\");\n";
 const sources=[
  'src/project/resource_ast.ts',
  'src/project/resource_codec.ts',
  'src/project/resource_validator.ts',
  'src/project/resource_project.ts',
  'src/blocks/resource_blocks.ts'
 ];
 fs.writeFileSync(path.join(tmp,'stubs.ts'),stubs);
 fs.writeFileSync(path.join(tmp,'cases.ts'),cases);
 const args=['--target','es5','--module','none','--outFile',path.join(tmp,'out.js'),
  path.join(tmp,'stubs.ts'),...sources.map(s=>path.resolve(s)),path.join(tmp,'cases.ts')];
 try { cp.execFileSync('tsc',args,{stdio:'pipe',encoding:'utf8'}); }
 catch(e) { assert.fail('TypeScript check: '+(e.stdout||e.stderr||e.message)); }
 try { cp.execFileSync(process.execPath,[path.join(tmp,'out.js')],{stdio:'pipe',encoding:'utf8'}); }
 catch(e) { assert.fail('Runtime check: '+(e.stdout||e.stderr||e.message)); }
 const pxt=JSON.parse(fs.readFileSync('pxt.json','utf8'));
 assert.match(pxt.version,/^\d+\.\d+\.\d+$/);
 for(const s of sources){
  assert.ok(pxt.files.includes(s),'not registered: '+s);
  const code=fs.readFileSync(s,'utf8');
  assert.doesNotMatch(code,/\.substring\s*\(/);
  assert.doesNotMatch(code,/\bnew\s+Error\s*\(/);
 }
 const ui=fs.readFileSync('src/blocks/resource_blocks.ts','utf8');
 const ids=[...ui.matchAll(/blockId=([a-z0-9_]+)/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size,'duplicate block IDs');
 } finally {
  fs.rmSync(tmp,{recursive:true,force:true});
 }
});
