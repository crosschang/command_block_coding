'use strict';
/** Run from the generated overlay root: node tests/C1_RIDE_DIALOGUE_STATIC_REGRESSION.cjs
 * Uses REAL C1 additions from this overlay in an isolated TypeScript transpile harness.
 * No Minecraft runtime, GitHub write, or version bump.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const A=read('commands/c1_ride_dialogue.ts');
const comp=read('src/compiler/compiler.ts');
const val=read('src/validator/validator.ts');
const methods=comp.slice(comp.indexOf('    /** Official Bedrock /ride'), comp.indexOf('    function compileB4String'));
const validators=val.slice(val.indexOf('    /** One command token;'),val.indexOf('    export function validateCommand(command:'));
const PXT=JSON.parse(read('pxt.json'));
const ctx=vm.createContext({});
const emit=src=>vm.runInContext(ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None}}).outputText,ctx);
// The base AST constants come from the actual overlay (no copy of C1 enum values).
const core=read('src/ast/command.ts');
emit(core);
emit(`namespace MCFunctionAST {
 export enum PlayerTargetKind { Selector=0, Name=1 }
 export enum SelectorBase { AllPlayers=0, AllEntities=1, NearestPlayer=2, RandomPlayer=3, Self=4, Initiator=5 }
 export interface PlayerTarget {kind:PlayerTargetKind; selector?:{base:SelectorBase}; name?:string;}
 export function createSelectorPlayerTarget(sel:{base:SelectorBase}):PlayerTarget{return {kind:PlayerTargetKind.Selector,selector:sel};}
 export function createNamedPlayerTarget(name:string):PlayerTarget{return {kind:PlayerTargetKind.Name,name:name};}
}`);
emit(A);
ctx.CommandKind=ctx.MCFunctionAST.CommandKind;
const miniCompiler=`namespace MCFunctionCompiler {
 function compilePlayerTarget(t: MCFunctionAST.PlayerTarget):string {
  if(!t)return "";
  if(t.kind==MCFunctionAST.PlayerTargetKind.Name){return t.name.indexOf(' ')>=0?'"'+t.name+'"':t.name;}
  return ["@a","@e","@p","@r","@s","@initiator"][<number>t.selector.base];
 }
 function quoteCommandString(s:string):string {return '"'+s.replace(/\\\\/g,'\\\\\\\\').replace(/"/g,'\\\\"')+'"';}
 ${methods}
 export function c1Compile(c:MCFunctionAST.CommandNode):string {
  if(c.kind==MCFunctionAST.CommandKind.Ride)return compileRide(<MCFunctionAST.RideCommand>c);
  return compileDialogue(<MCFunctionAST.DialogueCommand>c);
 }
}`;
emit(miniCompiler);
const miniValidator=`namespace MCFunctionValidator {
 export enum ValidationLevel {Error=0,Warning=1,Info=2}
 export interface ValidationIssue{level:ValidationLevel;code:string;message:string;}
 function addIssue(issues:ValidationIssue[],level:ValidationLevel,code:string,message:string){issues.push({level,code,message});}
 function appendIssues(out:ValidationIssue[],xs:ValidationIssue[]){for(let x of xs)out.push(x);}
 function isSafeCommandId(s:string):boolean{return !!s && /^[a-zA-Z0-9_:.-]+$/.test(s);}
 function validatePlayerReference(target:MCFunctionAST.PlayerTarget, allowEntitySelectors?:boolean):ValidationIssue[]{
  let out:ValidationIssue[]=[];
  if(!target) addIssue(out,ValidationLevel.Error,"PLAYER_TARGET_MISSING","Target required");
  else if(target.kind==MCFunctionAST.PlayerTargetKind.Selector && !target.selector) addIssue(out,ValidationLevel.Error,"PLAYER_TARGET_SELECTOR_INVALID","Selector missing");
  else if(target.kind==MCFunctionAST.PlayerTargetKind.Name && !target.name) addIssue(out,ValidationLevel.Error,"PLAYER_TARGET_NAME_INVALID","Name missing");
  return out;
 }
 ${validators}
}`;
emit(miniValidator);
const ast=ctx.MCFunctionAST,cmp=ctx.MCFunctionCompiler,chk=ctx.MCFunctionValidator;
const self=ast.createSelectorPlayerTarget({base:ast.SelectorBase.Self});
const entity=ast.createSelectorPlayerTarget({base:ast.SelectorBase.AllEntities});
const player=ast.createSelectorPlayerTarget({base:ast.SelectorBase.NearestPlayer});
const named=ast.createNamedPlayerTarget('Alex Rider');
const rc=(action, actor, mount, type, teleport, fill, rule, event, name)=>
 ast.createRideCommand(action, actor, mount, type, teleport, fill, rule, event, name);
const dc=(action,npc,p,scene)=>ast.createDialogueCommand(action,npc,p,scene);
const positives=[
 ['start bare',rc(ast.RideAction.StartRiding,entity,self),'ride @e start_riding @s'],
 ['start all',rc(ast.RideAction.StartRiding,entity,self,undefined,ast.RideTeleportRule.TeleportRide,ast.RideFillType.IfGroupFits),'ride @e start_riding @s teleport_ride if_group_fits'],
 ['stop',rc(ast.RideAction.StopRiding,self),'ride @s stop_riding'],
 ['evict',rc(ast.RideAction.EvictRiders,entity),'ride @e evict_riders'],
 ['summon rider bare',rc(ast.RideAction.SummonRider,entity,undefined,'minecraft:zombie'),'ride @e summon_rider minecraft:zombie'],
 ['summon rider named',rc(ast.RideAction.SummonRider,entity,undefined,'minecraft:zombie',undefined,undefined,undefined,'minecraft:as_baby','Rider One'),'ride @e summon_rider minecraft:zombie minecraft:as_baby "Rider One"'],
 ['summon ride bare',rc(ast.RideAction.SummonRide,named,undefined,'minecraft:chicken'),'ride "Alex Rider" summon_ride minecraft:chicken'],
 ['summon ride full',rc(ast.RideAction.SummonRide,self,undefined,'custom:mount',undefined,undefined,ast.RideSummonRule.SkipRiders,'custom:event','Chicken 1'),'ride @s summon_ride custom:mount skip_riders custom:event "Chicken 1"'],
 ['open',dc(ast.DialogueAction.Open,entity,player),'dialogue open @e @p'],
 ['open with scene',dc(ast.DialogueAction.Open,entity,player,'example_intro'),'dialogue open @e @p example_intro'],
 ['change',dc(ast.DialogueAction.Change,entity,undefined,'example_2'),'dialogue change @e example_2'],
 ['change player',dc(ast.DialogueAction.Change,entity,player,'example_2'),'dialogue change @e example_2 @p']
];
const negatives=[
 ['missing rider',rc(ast.RideAction.StopRiding), 'PLAYER_TARGET_MISSING'],
 ['missing mount',rc(ast.RideAction.StartRiding,self), 'PLAYER_TARGET_MISSING'],
 ['fill missing teleport',rc(ast.RideAction.StartRiding,entity,self,undefined,undefined,ast.RideFillType.UntilFull),'RIDE_FILL_REQUIRES_TELEPORT_RULE'],
 ['unknown teleport',rc(ast.RideAction.StartRiding,entity,self,undefined,5), 'RIDE_TELEPORT_RULE_INVALID'],
 ['fractional teleport enum',rc(ast.RideAction.StartRiding,entity,self,undefined,0.5), 'RIDE_TELEPORT_RULE_INVALID'],
 ['fractional fill enum',rc(ast.RideAction.StartRiding,entity,self,undefined,0,0.5), 'RIDE_FILL_RULE_INVALID'],
 ['extra stop',rc(ast.RideAction.StopRiding,self,entity), 'RIDE_NO_ARGUMENT_ACTION_EXTRA'],
 ['invalid entity',rc(ast.RideAction.SummonRide,self,undefined,'bad entity'), 'RIDE_ENTITY_ID_INVALID'],
 ['name skipped event',rc(ast.RideAction.SummonRider,self,undefined,'minecraft:zombie',undefined,undefined,undefined,undefined,'No Event'),'RIDE_NAME_REQUIRES_EVENT'],
 ['event skipped rule',rc(ast.RideAction.SummonRide,self,undefined,'minecraft:chicken',undefined,undefined,undefined,'event'),'RIDE_EVENT_REQUIRES_RULE'],
 ['rider rule extra',rc(ast.RideAction.SummonRider,self,undefined,'minecraft:zombie',undefined,undefined,ast.RideSummonRule.SkipRiders),'RIDE_RIDER_RULE_UNEXPECTED'],
 ['fractional summon rule',rc(ast.RideAction.SummonRide,self,undefined,'minecraft:chicken',undefined,undefined,1.5),'RIDE_SUMMON_RULE_INVALID'],
 ['event injection',rc(ast.RideAction.SummonRide,self,undefined,'minecraft:chicken',undefined,undefined,ast.RideSummonRule.NoRideChange,'event\nsay'),'RIDE_SPAWN_EVENT_INVALID'],
 ['invalid action',rc(55,self),'RIDE_ACTION_INVALID'],
 ['open no player',dc(ast.DialogueAction.Open,entity),'PLAYER_TARGET_MISSING'],
 ['change no scene',dc(ast.DialogueAction.Change,entity),'DIALOGUE_SCENE_REQUIRED'],
 ['scene injection',dc(ast.DialogueAction.Open,entity,player,'scene\nsay hello'),'DIALOGUE_SCENE_INVALID'],
 ['npc player selector',dc(ast.DialogueAction.Open,player,player),'DIALOGUE_NPC_PLAYER_SELECTOR'],
 ['npc named player',dc(ast.DialogueAction.Open,named,player),'DIALOGUE_NPC_SELECTOR_REQUIRED'],
 ['invalid dialogue action',dc(42,entity,player,'scene'),'DIALOGUE_ACTION_INVALID']
];
test('Canonical C1 command variants and negative validation',()=>{
 assert.equal(positives.length,12);
 for(const [label,node,expected] of positives){
  assert.equal(cmp.c1Compile(node),expected,label);
  let issues=node.kind===ast.CommandKind.Ride?chk.validateRideCommand(node):chk.validateDialogueCommand(node);
  assert.equal(issues.filter(x=>x.level===chk.ValidationLevel.Error).length,0,label+JSON.stringify(issues));
 }
 for(const [label,node,code] of negatives){
  const issues=node.kind===ast.CommandKind.Ride?chk.validateRideCommand(node):chk.validateDialogueCommand(node);
  assert.ok(issues.some(x=>x.level===chk.ValidationLevel.Error&&x.code===code),label+': '+JSON.stringify(issues));
 }
});
test('PXT registrations and source routing without changing version',()=>{
 assert.equal(PXT.version,'0.0.77');
 const af=PXT.files.indexOf('commands/c1_ride_dialogue.ts');
 const bf=PXT.files.indexOf('src/blocks/c1_ride_dialogue_blocks.ts');
 assert.ok(af>=0 && af<PXT.files.indexOf('src/blocks/command_adapter.ts'));
 assert.ok(bf>=0);
 assert.match(comp,/case MCFunctionAST\.CommandKind\.Ride:/);
 assert.match(comp,/case MCFunctionAST\.CommandKind\.Dialogue:/);
 assert.match(val,/validateRideCommand\(<MCFunctionAST\.RideCommand>command\)/);
 assert.match(val,/validateDialogueCommand\(<MCFunctionAST\.DialogueCommand>command\)/);
 const src=read('src/blocks/c1_ride_dialogue_blocks.ts');
 for(const name of ['command_ride_unified','mcfunction_ride_action_start','mcfunction_ride_action_stop','mcfunction_ride_action_evict','mcfunction_ride_action_summon_rider','mcfunction_ride_action_summon_ride','command_dialogue_unified','mcfunction_dialogue_action_open','mcfunction_dialogue_action_change', 'command_ride_start','command_ride_stop','command_ride_evict',
  'command_ride_summon_rider','command_ride_summon_ride',
  'command_dialogue_open','command_dialogue_change'])assert.ok(src.includes('blockId='+name),name);
 assert.match(read('custom.ts'),/"RIDE", "DIALOGUE"/);
 const unchanged=JSON.parse(read('pxt.json')); assert.equal(unchanged.version,'0.0.77');
});
test('MakeCode public wrappers dispatch typed AST through existing adapter',()=>{
 const adapter=read('src/blocks/command_adapter.ts'), block=read('src/blocks/c1_ride_dialogue_blocks.ts');
 emit(adapter);
 emit(block);
 let captured;
 ctx.executeAudioCommand=(c)=>captured=c;
 const run=(label,fn,expected)=>{captured=undefined;fn();assert.ok(captured,label);assert.equal(cmp.c1Compile(captured),expected,label)};
 const wrap=x=>({target:x});
 run('ride start',()=>ctx.Command.rideStart(wrap(entity),wrap(self)),'ride @e start_riding @s');
 run('ride stop',()=>ctx.Command.rideStop(wrap(entity)),'ride @e stop_riding');
 run('ride evict',()=>ctx.Command.rideEvict(wrap(entity)),'ride @e evict_riders');
 run('summon rider',()=>ctx.Command.rideSummonRider(wrap(entity),'minecraft:zombie'),'ride @e summon_rider minecraft:zombie');
 run('summon ride',()=>ctx.Command.rideSummonRide(wrap(entity),'minecraft:chicken'),'ride @e summon_ride minecraft:chicken');
 run('dialogue open',()=>ctx.Command.dialogueOpen(wrap(entity),wrap(player)),'dialogue open @e @p');
 run('dialogue change',()=>ctx.Command.dialogueChange(wrap(entity),'scene'),'dialogue change @e scene');
 run('unified ride start',()=>ctx.Command.ride(wrap(entity),ctx.Command.rideActionStart(wrap(self))),'ride @e start_riding @s');
 run('unified ride stop',()=>ctx.Command.ride(wrap(entity),ctx.Command.rideActionStop()),'ride @e stop_riding');
 run('unified ride evict',()=>ctx.Command.ride(wrap(entity),ctx.Command.rideActionEvict()),'ride @e evict_riders');
 run('unified ride summon rider',()=>ctx.Command.ride(wrap(entity),ctx.Command.rideActionSummonRider({entityId:'minecraft:zombie'})),'ride @e summon_rider minecraft:zombie');
 run('unified ride summon mount',()=>ctx.Command.ride(wrap(entity),ctx.Command.rideActionSummonRide({entityId:'minecraft:chicken'})),'ride @e summon_ride minecraft:chicken');
 run('unified dialogue open',()=>ctx.Command.dialogue(wrap(entity),ctx.Command.dialogueActionOpen(wrap(player))),'dialogue open @e @p');
 run('unified dialogue change',()=>ctx.Command.dialogue(wrap(entity),ctx.Command.dialogueActionChange('scene')),'dialogue change @e scene');
 run('unified ride full',()=>ctx.Command.ride(wrap(entity),ctx.Command.rideActionStart(wrap(self),ctx.Command.rideStartOptions(ctx.Command.RideTeleportChoice.Ride,ctx.Command.RideFillChoice.IfGroupFits))),'ride @e start_riding @s teleport_ride if_group_fits');
 run('unified ride full summon',()=>ctx.Command.ride(wrap(entity),ctx.Command.rideActionSummonRide({entityId:'minecraft:chicken'},ctx.Command.rideSummonRideOptions(ctx.Command.RideSummonRuleChoice.SkipRiders, 'custom:test','Rider One'))),'ride @e summon_ride minecraft:chicken skip_riders custom:test "Rider One"');
 run('unified dialogue change player',()=>ctx.Command.dialogue(wrap(entity),ctx.Command.dialogueActionChange('scene',wrap(player))),'dialogue change @e scene @p');

});

test('Unified MakeCode toolbox is compact; old APIs remain hidden-compatible',()=>{
 const b=read('src/blocks/c1_ride_dialogue_blocks.ts');
 for (const id of ['command_ride_start','command_ride_stop','command_ride_evict',
   'command_ride_summon_rider','command_ride_summon_ride',
   'command_dialogue_open','command_dialogue_change']) {
  assert.match(b,new RegExp('blockId='+id+'\\n\\s*//% blockHidden=true'));
 }
 assert.equal((b.match(/blockId=command_ride_unified/g)||[]).length,1);
 assert.equal((b.match(/blockId=command_dialogue_unified/g)||[]).length,1);
 assert.match(b,/entity\.shadow="mcfunction_entity_custom_id"/);
 const rideOnly=read('tests/C1_RIDE_ONLY_UNIFIED_PUBLIC_API_MAIN.ts');
 assert.equal((rideOnly.match(/FunctionFile\.define\("c1ride/g)||[]).length,9);
 assert.equal((rideOnly.match(/Command\.ride\(/g)||[]).length,9);
 assert.ok(!rideOnly.includes('Command.dialogue('));
});
