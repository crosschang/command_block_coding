/** Execute C/One and Dialogue RUN AST integration regression.
 * node --test tests/EXECUTE_SHAPES_DIALOGUE_RUN_REGRESSION.cjs
 * Runs source-backed function bodies with limited JS TypeScript stripping/mocks.
 * Does NOT constitute MakeCode PXT compilation or real-game testing.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const executeUI=read('src/blocks/execute_shape_namespaces.ts');
const dialogueUI=read('src/blocks/dialogue_execute_run_blocks.ts');
const resource=read('src/project/resource_project.ts');
const codec=read('src/project/resource_codec.ts');
const coreExecute=read('src/blocks/c3_execute_blocks.ts');
const runBlocks=read('src/blocks/c3_execute_run_blocks.ts');
const pxt=JSON.parse(read('pxt.json'));
function names(s){return [...s.matchAll(/\/\/% blockId=([a-z0-9_]+)/g)].map(x=>x[1]);}
function extract(src,start,end) {
 const a=src.indexOf(start);
 assert.ok(a>=0,'Start anchor missing: '+start);
 const b=src.indexOf(end,a+start.length);
 assert.ok(b>a,'End anchor missing: '+end);
 return src.slice(a+start.length,b);
}
function strip(src){
 return src
 .replace(/\bexport function\b/g,'function')
 .replace(/^\s*(?:clauses|run|hasRun|error): [^;\n]+;\s*$/gm,'')
 .replace(/\blet active: Draft\b/g,'let active')
 .replace(/(\w+)\s*:\s*\(\)\s*=>\s*void\b/g,'$1')
 .replace(/(\w+)\??\s*:\s*(?:MCFunctionAST\.\w+|MCFunctionResource\.\w+|Command\.\w+|MCFunctionFields\.\w+|MCFunctionPositionFields\.\w+|MCFunctionRotationFields\.\w+|ResourceText\.\w+|DialogueFile\.\w+|number|string|boolean|void)(?:\[\])?/g,'$1')
 .replace(/\)\s*:\s*(?:MCFunctionAST\.\w+|MCFunctionResource\.\w+|Command\.\w+|DialogueFile\.\w+|void)(?:\[\])?\s*(?=\{)/g,')');
}
function testContext(){
 const errors=[],dispatched=[];
 class ExecuteClauseValue {
     constructor(clause,next){this.clause=clause;this.next=next;}
 }
 class ExecuteRunValue {
     constructor(command){this.command=command;}
 }
 const c={
     ExecuteClauseValue,ExecuteRunValue,
     executeEnd:()=>new ExecuteClauseValue(),
     executeAs:(target,next)=>new ExecuteClauseValue({kind:'as',target},next),
     executeAt:(target,next)=>new ExecuteClauseValue({kind:'at',target},next),
     executeIfEntity:(mode,target,next)=>new ExecuteClauseValue({kind:'ifEntity',mode,target},next),
     execute:(clauses,run)=>dispatched.push({clauses,run})
 };
 const src=extract(executeUI,'namespace ExecuteC {','//% color=#7651A8 weight=101');
 const body=strip(src.slice(0,src.lastIndexOf('}')));
 const C=new Function('Command','MCFunctionPreview',
     body+'\nreturn {execute,asEntity,atEntity,ifEntity,clause,run};')(
     c,{previewSay:message=>errors.push(message)});
 return {C,c,errors,dispatched};
}
function compileResource(state,errors){
 const body=extract(resource,'    export function runCommandNodes(',
     '    /** Project state is kept as AST, not serialized text. */');
 const js=strip('export function runCommandNodes('+body)
    .replace(/\b(activeButton|activeScene|activeSceneSection)\b/g,'state.$1')
    .replace(/\(<MCFunctionAST\.ExecuteCommand>(\w+)\)/g,'$1');
 return new Function('state','record','MCFunctionAST',
    js+'\nreturn {runCommandNodes,buttonRunChoice,addRunCommand};')(
    state,message=>errors.push(message),{CommandKind:{Execute:'Execute'}});
}
function compileDialogue(core){
 const src=extract(dialogueUI,'namespace DialogueOne {','\n}');
 const body=strip(src);
 const D={
    ChoiceValue:class{constructor(button){this.button=button;}},
    OpenSlotValue:class{constructor(commands){this.commands=commands;}},
    CloseSlotValue:class{constructor(commands){this.commands=commands;}}
 };
 return new Function('DialogueFile','MCFunctionResourceProject',
    body+'\nreturn {buttonRun,openRun,closeRun,buttonCommandRun,sectionCommandRun,onOpenRun,onCloseRun};')(
    D,core);
}
test('namespace/toolbox metadata preserves original Execute and RUN IDs',()=>{
 const ids=names(executeUI).concat(names(dialogueUI));
 assert.equal(ids.length,new Set(ids).size);
 assert.match(executeUI,/namespace ExecuteC \{/);
 assert.match(executeUI,/namespace ExecuteOne \{/);
 assert.ok(pxt.files.includes('src/blocks/execute_shape_namespaces.ts'));
 assert.ok(pxt.files.includes('src/blocks/dialogue_execute_run_blocks.ts'));
 assert.equal(pxt.version,'0.0.25');
 assert.match(executeUI,/blockId=mcfunction_execute_c_root/);
 assert.match(executeUI,/handlerStatement=1/);
 assert.match(executeUI,/blockId=mcfunction_execute_one_command/);
 assert.match(coreExecute,/blockId=command_execute_unified[\s\S]*?blockHidden=true/);
 assert.match(runBlocks,/blockId=mcfunction_execute_run_group_nested_execute[\s\S]*?blockHidden=true/);
 assert.ok((runBlocks.match(/blockNamespace=ExecuteOne/g)||[]).length>30);
 assert.match(codec,/MCFunctionCompiler\.compileCommand\(items\[i\]\)/);
});
test('C-shaped Execute preserves AST clause ordering and delegates once',()=>{
 const {C,c,errors,dispatched}=testContext();
 const run=new c.ExecuteRunValue({kind:'say',message:'hello'});
 C.execute(()=>{
   C.asEntity({target:'@a'});
   C.atEntity({target:'@s'});
   C.ifEntity(1,{target:'@e'});
   C.run(run);
 });
 assert.equal(dispatched.length,1);
 const captured=dispatched[0];
 const kinds=[];
 let cursor=captured.clauses;
 while(cursor&&cursor.clause){kinds.push(cursor.clause.kind);cursor=cursor.next;}
 assert.deepEqual(kinds,['as','at','ifEntity']);
 assert.equal(captured.run.command,run.command);
 assert.deepEqual(errors,[]);
});
test('C-shaped Execute blocks missing, duplicate or late RUN without dispatch',()=>{
 const {C,c,errors,dispatched}=testContext();
 C.execute(()=>C.asEntity({target:'@a'}));
 C.execute(()=>{C.run(new c.ExecuteRunValue({kind:'say'}));C.run(new c.ExecuteRunValue({kind:'say'}));});
 C.execute(()=>{C.run(new c.ExecuteRunValue({kind:'say'}));C.atEntity({target:'@s'});});
 assert.equal(dispatched.length,0);
 assert.equal(errors.length,3);
 assert.match(errors[0],/EXECUTE_C_RUN_MISSING/);
 assert.match(errors[1],/Only one RUN/);
 assert.match(errors[2],/cannot follow RUN/);
});
test('C-shaped Execute rejects cyclic chains and nested C without execution',()=>{
 const {C,c,errors,dispatched}=testContext();
 const cycle=new c.ExecuteClauseValue({kind:'as'});
 cycle.next=cycle;
 C.execute(()=>{C.clause(cycle);C.run(new c.ExecuteRunValue({kind:'say'}));});
 C.execute(()=>{C.execute(()=>{});C.run(new c.ExecuteRunValue({kind:'say'}));});
 assert.equal(dispatched.length,0);
 assert.equal(errors.length,2);
 assert.match(errors[0],/Cyclic/);
 assert.match(errors[1],/Nested EXECUTE C/);
});
test('C-shaped Execute preserves more than 32 clauses without truncation',()=>{
 const {C,c,errors,dispatched}=testContext();
 C.execute(()=>{
   for(let i=0;i<40;i++)C.asEntity({target:'@s',index:i});
   C.run(new c.ExecuteRunValue({kind:'say',message:'all'}));
 });
 assert.equal(dispatched.length,1);
 let cur=dispatched[0].clauses,count=0;
 while(cur&&cur.clause){
   assert.equal(cur.clause.target.index,count);
   cur=cur.next;count++;
 }
 assert.equal(count,40);
 assert.deepEqual(errors,[]);
});
test('Dialogue One stores exact RUN AST in Button, OPEN and CLOSE, never dispatches',()=>{
 const state={activeScene:{onOpenCommands:[],onCloseCommands:[],buttons:[]},
   activeButton:undefined,activeSceneSection:0};
 const issues=[];
 const d=compileDialogue(compileResource(state,issues));
 const child={kind:'say',message:'hi'};
 const executeAST={kind:'Execute',clauses:[{kind:'as'}],run:child};
 const wrapped={command:executeAST};
 const button=d.buttonRun({text:{plain:'Start'}},wrapped);
 assert.equal(button.button.commands[0],executeAST);
 assert.deepEqual(d.openRun(wrapped).commands,[executeAST]);
 assert.deepEqual(d.closeRun(wrapped).commands,[executeAST]);
 d.onOpenRun(wrapped);d.onCloseRun(wrapped);
 assert.deepEqual(state.activeScene.onOpenCommands,[executeAST]);
 assert.deepEqual(state.activeScene.onCloseCommands,[executeAST]);
 state.activeButton={name:{plain:'B'},commands:[]};
 d.buttonCommandRun(wrapped);
 assert.deepEqual(state.activeButton.commands,[executeAST]);
 state.activeButton=undefined;state.activeSceneSection=1;
 d.sectionCommandRun(wrapped);
 assert.deepEqual(state.activeScene.onOpenCommands,[executeAST,executeAST]);
 assert.deepEqual(issues,[]);
});
test('Dialogue One rejects missing RUN and out-of-context statement input',()=>{
 const state={activeScene:undefined,activeButton:undefined,activeSceneSection:0};
 const issues=[];
 const d=compileDialogue(compileResource(state,issues));
 d.buttonRun({text:{plain:'Broken'}},undefined);
 d.openRun(undefined);
 d.buttonCommandRun({command:{kind:'say'}});
 assert.equal(issues.length,3);
 assert.match(issues[0],/DIALOGUE_RUN_MISSING/);
 assert.match(issues[1],/DIALOGUE_RUN_MISSING/);
 assert.match(issues[2],/DIALOGUE_BUTTON_COMMAND_CONTEXT/);
});
test('Dialogue One fails closed on structurally invalid or cyclic nested EXECUTE',()=>{
 const state={activeScene:undefined,activeButton:undefined,activeSceneSection:0};
 const issues=[];
 const core=compileResource(state,issues);
 const bad={kind:'Execute',clauses:[],run:undefined};
 assert.deepEqual(core.runCommandNodes(bad),[]);
 const cyc={kind:'Execute',clauses:[]};cyc.run=cyc;
 assert.deepEqual(core.runCommandNodes(cyc),[]);
 assert.equal(issues.length,2);
 assert.match(issues[0],/DIALOGUE_RUN_NESTED_MISSING/);
 assert.match(issues[1],/DIALOGUE_RUN_CYCLE/);
});
test('typed Dialogue RUN buttons accept existing Execute One command output',()=>{
 const src=extract(executeUI,'namespace ExecuteOne {','\n}');
 const body=strip(src);
 const events=[];
 const E=new Function('Command','MCFunctionExecuteRun',body+
  '\nreturn {execute,command};')({
  execute:(clauses,run)=>events.push({clauses,run})
 },{
  nestedExecute:(clauses,run)=>({command:{kind:'Execute',clauses,run:run.command}})
 });
 const single=E.command({clause:{kind:'as'}},{command:{kind:'say'}});
 assert.equal(single.command.kind,'Execute');
 assert.equal(events.length,0,'Reporter must not execute');
 const d=compileDialogue(compileResource({activeScene:undefined,activeButton:undefined,activeSceneSection:0},[]));
 const b=d.buttonRun({text:{plain:'Nested'}},single);
 assert.equal(b.button.commands[0],single.command);
});
