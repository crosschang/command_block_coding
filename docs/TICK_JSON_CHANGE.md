# tick.json container change

This revision replaces the previous single-entry API:

```ts
FunctionFile.tick("tick/main")
```

with a file-shaped container API:

```ts
FunctionFile.tickJson(function () {
    FunctionFile.tickValue("tick/main")
    FunctionFile.tickValue("debug/test")
})
```

Reason: Minecraft stores tick functions in one independent `functions/tick.json` file whose `values` field is an ordered array. The MakeCode block model now mirrors that file structure directly.

Toolbox target:

```text
FunctionFile
├─ FUNCTION FILE
│  └─ mcfunction file [...]
└─ TICK.JSON
   └─ tick.json
      ├─ function [...]
      └─ function [...]
```

The old `FunctionFile.tick()` API is removed from this revision.

## Structural lock (0.0.18)

The project now treats `FunctionFile.define()` and `FunctionFile.tickJson()` as explicit top-level project containers.

Canonical rule:

```text
tick.json
├─ FunctionFile.tickValue(...)
├─ FunctionFile.tickValue(...)
└─ ...
```

`Command.*`, nested `FunctionFile.define()`, and nested `FunctionFile.tickJson()` are not part of the canonical tick.json body. Runtime Preview guards reject this extension's invalid APIs in that context, and the future Converter must enforce the same rule when parsing JavaScript.

Function invocation recursion through `Command.mcFunction()` remains allowed and is separate from illegal nested file definitions.
