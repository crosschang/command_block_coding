# 0.0.18 — FunctionFile / tick.json structure lock

Applied the agreed project-structure rules in one revision.

## Applied

- Project name remains `command_block_coding`.
- `FunctionFile.define()` explicitly remains a top-level project container.
- `FunctionFile.tickJson()` explicitly remains a top-level project container.
- `FunctionFile.define()` inside `tickJson()` is rejected in Runtime Preview.
- `FunctionFile.define()` inside another FunctionFile is rejected in Runtime Preview.
- nested `tickJson()` is rejected.
- `tickJson()` inside an executing FunctionFile is rejected.
- orphan `FunctionFile.tickValue()` is rejected.
- this extension's `Command.*` calls inside `tickJson()` are rejected before execution.
- valid `tickJson()` values remain ordered and duplicates remain preserved.
- `Command.mcFunction()` self/indirect recursion is not structurally rejected.
- structural Preview errors are reported once per error code to avoid 20 TPS chat flooding.
- `pxt.json` version bumped to `0.0.18`.

## Validation performed

- TypeScript static compile with Minecraft MakeCode runtime stubs: PASS.
- Runtime structure guard harness: PASS.
- Valid tick.json Preview dispatch to a referenced FunctionFile: PASS.
- Function-command validation still permits recursive invocation shape: PASS.

## Canonical tick.json

```ts
FunctionFile.tickJson(function () {
    FunctionFile.tickValue("main")
    FunctionFile.tickValue("main2")
    FunctionFile.tickValue("sub/test")
})
```

Future Converter rule: inside the `tickJson()` callback, only `FunctionFile.tickValue()` is accepted as canonical project structure.
