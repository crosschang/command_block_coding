/** C4 static regression. Run from repository root: node tests/C4_HELP_COMMANDS_REGRESSION.cjs */
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const ts = require('typescript');
const files = [
  'src/ast/command.ts','src/ast/slot.ts','src/ast/selector.ts',
  'src/ast/player_target.ts','src/ast/position.ts',
  'src/ast/item_components.ts','src/ast/item.ts',
  'commands/c4_help_commands.ts','src/compiler/compiler.ts','src/validator/validator.ts'
];
const ctx=vm.createContext({MCFunctionRegistryLookup:{
  isCustomNamespace:()=>false,
  isKnownItem:()=>true
}});
for(const file of files){
  const source=fs.readFileSync(file,'utf8');
  const js=ts.transpileModule(source,{compilerOptions:{
    target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None
  }}).outputText;
  vm.runInContext(js,ctx,{filename:file});
  if(ctx.MCFunctionAST){
    for(const key of ['CommandKind','PlayerTargetKind','SelectorBase','CoordinateMode']){
      if(ctx.MCFunctionAST[key])ctx[key]=ctx.MCFunctionAST[key];
    }
  }
  if(ctx.MCFunctionValidator && ctx.MCFunctionValidator.ValidationLevel)
    ctx.ValidationLevel=ctx.MCFunctionValidator.ValidationLevel;
}
const A=ctx.MCFunctionAST,C=ctx.MCFunctionCompiler,V=ctx.MCFunctionValidator;
const target=A.createNamedPlayerTarget('Alex');
const pos=A.createAbsolutePosition(10,64,-20);
const item=A.createItemStack('minecraft:stone');
const cases=[
  [A.createTitleCommand(target,A.TitleAction.Show,A.TitleLocation.Title,'Hello'), 'title Alex title Hello'],
  [A.createTitleCommand(target,A.TitleAction.Show,A.TitleLocation.Subtitle,'Hi'), 'title Alex subtitle Hi'],
  [A.createTitleCommand(target,A.TitleAction.Show,A.TitleLocation.Actionbar,'Ready'), 'title Alex actionbar Ready'],
  [A.createTitleCommand(target,A.TitleAction.Clear),'title Alex clear'],
  [A.createTitleCommand(target,A.TitleAction.Reset),'title Alex reset'],
  [A.createTitleCommand(target,A.TitleAction.Times,undefined,undefined,10,70,20),'title Alex times 10 70 20'],
  [A.createReplaceItemBlockCommand(pos,0,item),'replaceitem block 10 64 -20 slot.container 0 minecraft:stone'],
  [A.createReplaceItemBlockCommand(pos,2,item,A.ReplaceItemHandling.Keep),'replaceitem block 10 64 -20 slot.container 2 keep minecraft:stone'],
  [A.createReplaceItemEntityCommand(target,A.SlotLocation.ArmorHead,0,item),'replaceitem entity Alex slot.armor.head 0 minecraft:stone'],
  [A.createReplaceItemEntityCommand(target,A.SlotLocation.WeaponMainhand,0,item,A.ReplaceItemHandling.Destroy),'replaceitem entity Alex slot.weapon.mainhand 0 destroy minecraft:stone'],
  [A.createReplaceItemEntityCommand(target,A.SlotLocation.Hotbar,1,A.createItemStack('minecraft:stone',undefined,5)),'replaceitem entity Alex slot.hotbar 1 minecraft:stone 1 5'],
  [A.createAbilityCommand(target,A.AbilityAction.Set,'mayfly',true),'ability Alex mayfly true'],
  [A.createAbilityCommand(target,A.AbilityAction.Set,'worldbuilder',false),'ability Alex worldbuilder false'],
  [A.createAbilityCommand(target,A.AbilityAction.Query),'ability Alex'],
  [A.createAbilityCommand(target,A.AbilityAction.Query,'mute'),'ability Alex mute'],
  [A.createWorldBuilderCommand(),'worldbuilder'],
  [A.createImmutableWorldCommand(),'immutableworld'],
  [A.createImmutableWorldCommand(true),'immutableworld true'],
  [A.createImmutableWorldCommand(false),'immutableworld false']
];
for(const [node,expected] of cases){
  const actual=C.compileCommand(node);
  assert.strictEqual(actual,expected,JSON.stringify(node));
  const issues=V.validateCommand(node);
  assert.ok(!V.hasError(issues),expected+' '+JSON.stringify(issues));
}
const negatives=[
  [A.createTitleCommand(target,A.TitleAction.Show,A.TitleLocation.Title,''),'TITLE_TEXT_INVALID'],
  [A.createTitleCommand(target,A.TitleAction.Times,undefined,undefined,-1,70,20),'TITLE_TIMES_INVALID'],
  [A.createReplaceItemEntityCommand(target,25,0,item),'REPLACEITEM_EQUIPMENT_SLOT'],
  [A.createReplaceItemBlockCommand(pos,-1,item),'REPLACEITEM_SLOT_ID'],
  [A.createAbilityCommand(target,A.AbilityAction.Set,'mayfly'),'ABILITY_SET_INVALID'],
  [A.createImmutableWorldCommand('invalid'),'IMMUTABLEWORLD_BOOL']
];
for(const [node,code] of negatives){
  const issues=V.validateCommand(node);
  assert.ok(V.hasError(issues),'expected error: '+code);
  assert.ok(issues.some(x=>x.code===code),'expected code: '+code);
}
const pxt=JSON.parse(fs.readFileSync('pxt.json','utf8'));
assert.ok(typeof pxt.version==='string' && /^\d+\.\d+\.\d+$/.test(pxt.version));
assert.ok(pxt.files.includes('commands/c4_help_commands.ts'));
assert.ok(pxt.files.includes('src/blocks/c4_help_blocks.ts'));
const ui=fs.readFileSync('src/blocks/c4_help_blocks.ts','utf8');
const ids=[...ui.matchAll(/blockId=([a-z0-9_]+)/g)].map(x=>x[1]);
assert.strictEqual(ids.length,new Set(ids).size);
console.log('PASS C4 static: '+cases.length+' compiler/validator positives, '+
  negatives.length+' negatives, PXT registration and unique C4 block IDs.');
