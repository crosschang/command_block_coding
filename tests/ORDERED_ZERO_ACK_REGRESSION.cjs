// Real receipt decoder/calibration/submit, fixture transport only. Not GAME PASS.
const fs = require('fs'), path = require('path'), vm = require('vm');
const assert = require('node:assert/strict'), ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/preview/ordered_preview.ts'), 'utf8');
let passed = 0;
function harness(receipt, opts = {}) {
    const scores = new Map(), messages = [], sent = [];
    let sentAlready = false;
    const execute = line => {
        if (line.startsWith('scoreboard players ')) {
            const t = line.split(' '), action = t[2], key = t[3] + '/' + t[4];
            if (opts.lies) return true;
            if (action == 'reset') {
                if (sentAlready && opts.cleanupFails) return false;
                return scores.delete(key);
            }
            if (action == 'set') { scores.set(key, +t[5]); return true; }
            if (action == 'test') return scores.has(key) && scores.get(key) >= +t[5] && scores.get(key) <= +t[6];
        }
        if (line.startsWith('scriptevent ')) {
            sentAlready = true; sent.push(line);
            if (opts.transportFail) return false;
            scores.set('@s/cbxo2h', receipt);
            if (opts.stale) scores.set('@s/cbxo2hn', -1);
            return true;
        }
        throw new Error('Unexpected command: ' + line);
    };
    const ctx = vm.createContext({Math, player: { execute }, loops: { pause() {} },
        MCFunctionPreview: { previewSay(s) { messages.push(s); } },
        MCFunctionValidator: { validateCommand() { return []; }, hasError() { return false; } },
        MCFunctionCompiler: { compileCommand(node) { return node.line; } }
    });
    vm.runInContext(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2017 } }).outputText, ctx);
    const api = ctx.MCFunctionOrderedPreview;
    api.setAckTransport(api.AckTransport.PlayerScoreboard); api.setReceiptMode(true);
    const calibrated = api.probeReadback();
    api.submit('fixture', [{ line: 'execute if score @s cbxc3lab matches 8 run tag @s add cbxc3_hit' }]);
    return { api, scores, messages, sent, calibrated };
}
function test(name, fn) { fn(); passed++; console.log('LOCAL PASS', name); }
test('Zero count is terminal 9 and warning, never DONE/ERROR/timeout', () => {
    const h = harness(9); assert(h.calibrated); assert.equal(h.sent.length, 1);
    assert.equal(h.api.lastAckStatus(), h.api.AckStatus.ZeroResult);
    assert(h.messages.some(s => s.startsWith('WARNING [P4O2H_ACK_ZERO_RESULT]')));
    assert(!h.messages.some(s => /ACK_DONE|ACK_ERROR|ACK_TIMEOUT/.test(s)));
    assert(!h.scores.has('@s/cbxo2h')); assert(!h.scores.has('@s/cbxo2hn'));
});
test('DONE remains 2', () => assert.equal(harness(2).api.lastAckStatus(), 2));
test('Receiver exception receipt remains ERROR 3', () => assert.equal(harness(3).api.lastAckStatus(), 3));
test('PENDING remains timeout 4 rather than zero', () => assert.equal(harness(0).api.lastAckStatus(), 4));
test('Nonce mismatch cannot accept zero', () => assert.equal(harness(9, { stale: true }).api.lastAckStatus(), 3));
test('Unknown score cannot become zero or DONE', () => assert.equal(harness(10).api.lastAckStatus(), 3));
test('Cleanup failure remains ERROR', () => assert.equal(harness(9, { cleanupFails: true }).api.lastAckStatus(), 3));
test('Submission failure remains SendFailed', () => assert.equal(harness(9, { transportFail: true }).api.lastAckStatus(), 6));
test('Submission-only boolean cannot calibrate or send', () => {
    const h = harness(9, { lies: true }); assert(!h.calibrated); assert.equal(h.sent.length, 0);
    assert.equal(h.api.lastAckStatus(), 5);
});
console.log('TOTAL', passed, 'LOCAL PASS; transport is mocked, GAME PENDING');
