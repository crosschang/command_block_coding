const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert'),typescript=require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../../src/preview/diagnostic_store.ts'),'utf8');
const js=typescript.transpileModule(source,{compilerOptions:{target:typescript.ScriptTarget.ES5,module:typescript.ModuleKind.None}}).outputText;
let handlers={},out=[];
const env={
 player:{say:s=>out.push({type:'say',value:s}),onChat:(name,handler)=>{assert(!handlers[name],`duplicate handler ${name}`); handlers[name]=handler;}},
 MCFunctionPreview:{previewSay:s=>out.push({type:'rawtext',value:s})},
 MCFunctionValidator:{ValidationLevel:{Error:0,Warning:1,Info:2}},
 Math,console
};
vm.createContext(env);vm.runInContext(js,env);
const d=env.MCFunctionDiagnostics,L=env.MCFunctionValidator.ValidationLevel,S=d.DiagnosticSource;
let passed=0;
function t(name,fn){out=[];fn();passed++;console.log('PASS',name);}
function texts(){return out.map(x=>x.value).join('\n')}
function issue(level,code,message){return {level,code,message}}
t('initial empty summary O(1) fallback',()=>{d.showAll();assert.match(texts(),/E0 W0 I0/);});
t('chat handlers exactly once',()=>{d.ensureChatRegistered();d.ensureChatRegistered();assert.deepStrictEqual(Object.keys(handlers).sort(),['?','cbi_page']);});
t('no duplicate registration side effects',()=>{d.ensureChatRegistered();assert.equal(Object.keys(handlers).length,2);});
t('issue replacement and multiple levels',()=>{d.replaceDefinitionIssues('err',[issue(L.Error,'E_BAD','invalid parameter')]);d.replaceDefinitionIssues('warn',[issue(L.Warning,'MUSIC_ID_UNKNOWN','teset is custom')]);d.replaceDefinitionIssues('info',[issue(L.Info,'REGISTRY_INFO','custom id allowed')]);assert.equal(d.countLevel(L.Error),1);assert.equal(d.countLevel(L.Warning),1);assert.equal(d.countLevel(L.Info),1);});
t('project summary one short message',()=>{handlers['?']();assert.equal(out.length,1);assert.match(texts(),/E1 W1 I1/);assert.match(texts(),/err E/);assert.match(texts(),/warn W/);assert.match(texts(),/info I/);});
t('legacy alias not registered and not reserved',()=>{assert.equal(handlers['cbi_diag'],undefined);assert.equal(d.chatCommandName,undefined);assert.equal(d.isReservedChatCommand('cbi_diag'),false);assert.equal(d.isReservedChatCommand('?'),true);assert.equal(d.isReservedChatCommand('cbi_page'),true);});
t('cached detail read with level and code',()=>{d.showFunctionDetailsOnly('warn');assert.match(texts(),/MUSIC_ID_UNKNOWN/);assert.match(texts(),/Diagnostic only; not executed/);});
t('error blocked hint no rawtext for ordinary name',()=>{d.showBlockedExecutionHint('err');assert.equal(out.length,1);assert.equal(out[0].type,'say');assert.match(texts(),/blocked/);assert.match(texts(),/err\?/);});
t('special characters preserved via literal-safe adapter',()=>{d.add('err',L.Warning,'SEL','literal @a[tag=test]',S.Runtime);d.showFunctionDetailsOnly('err');assert(out.some(x=>x.type==='rawtext'&&x.value.includes('@a[tag=test]')));});
t('definition replacement purges only definition issues',()=>{d.replaceDefinitionIssues('err',[]);assert.equal(d.countFunctionLevel('err',L.Error),0);assert.equal(d.countFunctionLevel('err',L.Warning),1);});
t('duplicate diagnostic ignored without changing count',()=>{let before=d.countLevel(L.Warning);d.add('err',L.Warning,'SEL','literal @a[tag=test]',S.Runtime);assert.equal(d.countLevel(L.Warning),before);});
t('remove affected function from page summary on definition clear',()=>{d.replaceDefinitionIssues('warn',[]);handlers['?']();assert(!texts().includes('warn W'));});
t('pagination and invalid page',()=>{d.replaceDefinitionIssues('warn',[issue(L.Warning,'WARN','w')]);d.add('f4',L.Warning,'F4','w',S.Preview);d.add('f5',L.Warning,'F5','w',S.Project);handlers['?']();assert.match(texts(),/page 1\/2/);out=[];handlers['cbi_page'](2);assert.match(texts(),/page 2\/2/);out=[];handlers['cbi_page'](3);assert.match(texts(),/Invalid page/);});
t('repeated query output remains stable',()=>{out=[];d.showFunctionDetailsOnly('info');const orig=texts();out=[];d.showFunctionDetailsOnly('info');assert.equal(texts(),orig);});
t('unknown details direct helper stays benign',()=>{d.showFunctionDetailsOnly('unknown');assert.match(texts(),/no problems found/);});
t('no probe API remains',()=>{assert.equal(d.probeFindDetailIndex,undefined);assert.equal(d.probeWalkDetailCharsAt,undefined);assert.equal(d.probeEmitDetailAt,undefined);});
console.log('Local mocked diagnostic regression PASS',passed);
