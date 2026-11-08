/** Verify old internal chat alias is absent while a user-defined function may reuse its name. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');
const chat = {};
const output = [];
const env = {
  player: {
    onChat: (name, fn) => {
      assert(!Object.prototype.hasOwnProperty.call(chat, name), 'duplicate chat registration ' + name);
      chat[name] = fn;
    },
    say: (msg) => output.push(['say',msg]),
  },
  MCFunctionProject: {createTickFile: ()=>({values:[]})},
  MCFunctionValidator: {ValidationLevel:{Error:0,Warning:1,Info:2}, hasError: (issues)=>issues.some(i=>i.level===0)},
  MCFunctionPreview: {
    previewSay: (msg)=>output.push(['preview',msg]),
    isReservedGameRuleCatalogChatCommand: (name)=>name==='cbi_rules',
    ensureGameRuleCatalogChatRegistered: ()=>{}
  },
  Math, console,
};
vm.createContext(env);
for (const file of ['src/preview/diagnostic_store.ts','function_file.ts']) {
  const source=fs.readFileSync(path.join(__dirname,'../../',file),'utf8');
  const compiled = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES5,module:ts.ModuleKind.None}}).outputText;
  vm.runInContext(compiled,env,{filename:file});
}
assert(!env.MCFunctionDiagnostics.isReservedChatCommand('cbi_diag'));
assert(env.MCFunctionDiagnostics.isReservedChatCommand('?'));
assert(env.MCFunctionDiagnostics.isReservedChatCommand('cbi_page'));
env.MCFunctionDiagnostics.ensureChatRegistered();
assert.deepStrictEqual(Object.keys(chat).sort(), ['?','cbi_page']);
assert.equal(env.MCFunctionDiagnostics.chatCommandName,undefined);
env.FunctionFile.define('cbi_diag', function(){});
assert(Object.prototype.hasOwnProperty.call(chat,'cbi_diag'), 'user-defined function needs a runnable chat handler');
assert(Object.prototype.hasOwnProperty.call(chat,'cbi_diag?'), 'user-defined function needs a detail-only handler');
assert(env.FunctionFile.runPreview('cbi_diag'), 'user-defined function must be in the registry');
assert.equal(env.MCFunctionDiagnostics.countFunctionLevel('cbi_diag',0),0,'name must not have a reserved error');
assert(!output.some(x=>x[1].includes('FUNCTION_NAME_RESERVED') || x[1].includes('reserved for the legacy')));
output.length=0;
chat['cbi_diag?']();
assert(!output.some(x=>x[1]=== 'USER_DEFINED_FUNCTION_OK'));
assert(output.some(x=>String(x[1]).includes('no problems found')));
output.length=0;
chat['?']();
assert(output.some(x=>String(x[1]).includes('no problems found')));
console.log('PASS: internal alias removed; reclaimed user function and query handlers work');
