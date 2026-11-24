const assert = require('node:assert/strict');
const cp = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

// Compiles the real parser against minimal AST/Compiler contracts.
// This does not constitute a full PXT or Minecraft Education test.
test('mcfunction parser preserves raw, trivia, EOL and AST edits', () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'mcfunction-parser-'));
    const parser = path.resolve(__dirname, '../src/parser/mcfunction_parser.ts');
    try {
        const stubs = [
            'namespace MCFunctionAST {',
            ' export enum CommandKind { Raw=0, Say=1, McFunction=2 }',
            ' export interface CommandNode { kind:CommandKind }',
            ' export interface RawCommand extends CommandNode { raw:string }',
            ' export interface SayCommand extends CommandNode { message:string }',
            ' export interface McFunctionCommand extends CommandNode { functionId:string }',
            ' export function createRawCommand(raw:string):RawCommand { return {kind:CommandKind.Raw,raw:raw}; }',
            ' export function createSayCommand(message:string):SayCommand { return {kind:CommandKind.Say,message:message}; }',
            ' export function createMcFunctionCommand(functionId:string):McFunctionCommand { return {kind:CommandKind.McFunction,functionId:functionId}; }',
            '}',
            'namespace MCFunctionCompiler {',
            ' export function compileCommand(c:MCFunctionAST.CommandNode):string {',
            '  if(c.kind==MCFunctionAST.CommandKind.Raw)return (<MCFunctionAST.RawCommand>c).raw;',
            '  if(c.kind==MCFunctionAST.CommandKind.Say)return "say "+(<MCFunctionAST.SayCommand>c).message;',
            '  if(c.kind==MCFunctionAST.CommandKind.McFunction)return "function "+(<MCFunctionAST.McFunctionCommand>c).functionId;',
            '  return "";',
            ' }',
            '}'
        ].join('\n');
        const cases = [
            'function check(ok:boolean,msg:string):void { if(!ok)throw new Error(msg); }',
            'let samples=["","\\ufeff","say Hello","\\ufeff# comment\\r\\nsay   Hi # retained\\n\\t\\rfunction ns:path/test\\r","execute as @s run say Hi\\n/say foo\\n","say \\nfunction Name\\n  say indented\\n","say original\\n# comment\\nunknown @s\\n"];',
            'for(let i=0;i<samples.length;i++)check(MCFunctionParser.serializeFile(MCFunctionParser.parseFile(samples[i]))==samples[i],"roundtrip "+i);',
            'let file=MCFunctionParser.parseFile("say original\\n# keep\\nunknown @s\\n");',
            'check(file.lines[0].command.kind==MCFunctionAST.CommandKind.Say,"typed say");',
            'check(file.lines[1].kind==MCFunctionParser.LineKind.Comment,"comment");',
            'check(file.lines[2].command.kind==MCFunctionAST.CommandKind.Raw,"raw");',
            '(<MCFunctionAST.SayCommand>file.lines[0].command).message="edited";',
            'check(MCFunctionParser.serializeFile(file)=="say edited\\n# keep\\nunknown @s\\n","AST edit");',
            'file.lines[0].command=({kind:999} as MCFunctionAST.CommandNode);',
            'let rejected=false;try{MCFunctionParser.serializeFile(file);}catch(e){rejected=true;}check(rejected,"compiler refused");',
            'file.lines[0].command=undefined;',
            'let refused=false;try{MCFunctionParser.serializeFile(file);}catch(e){refused=true;}check(refused,"fail closed");'
        ].join('\n');
        fs.writeFileSync(path.join(temp, 'stubs.ts'), stubs, 'utf8');
        fs.writeFileSync(path.join(temp, 'cases.ts'), cases, 'utf8');
        cp.execFileSync('tsc', ['--target', 'es5', '--module', 'none', '--outFile', path.join(temp,'compiled.js'), path.join(temp,'stubs.ts'), parser, path.join(temp,'cases.ts')], {stdio:'pipe'});
        cp.execFileSync(process.execPath, [path.join(temp,'compiled.js')], {stdio:'pipe'});
        assert.ok(true);
    } finally {
        fs.rmSync(temp, {recursive:true,force:true});
    }
});

// MakeCode Static TypeScript does not expose JavaScript's full string and Error APIs.
test('parser avoids unsupported PXT substring and Error constructor', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../src/parser/mcfunction_parser.ts'), 'utf8');
    assert.doesNotMatch(source, /\.substring\s*\(/);
    assert.doesNotMatch(source, /\bnew\s+Error\s*\(/);
    assert.match(source, /text\.substr\(start, end - start\)/);
    assert.match(source, /throw "Missing command AST at line "/);
    assert.match(source, /throw "Compiler rejected command AST at line "/);
});
