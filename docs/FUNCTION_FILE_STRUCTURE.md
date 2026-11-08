# FunctionFile / tick.json structural rules

## Canonical workspace structure

`FunctionFile.define()` and `FunctionFile.tickJson()` represent project files. They are top-level containers, not Minecraft commands.

```text
Workspace
├─ mcfunction file "main"
│  ├─ SAY
│  ├─ GIVE
│  ├─ TP
│  ├─ MCFUNCTION
│  └─ PREVIEW READY (preview metadata only)
│
├─ mcfunction file "sub/test"
│  └─ SAY
│
└─ tick.json
   ├─ function "main"
   └─ function "sub/test"
```

## Rules

### `FunctionFile.define()`

- Top-level project container.
- Multiple mcfunction files are allowed.
- A `FunctionFile.define()` inside another `FunctionFile.define()` is invalid.
- A `FunctionFile.define()` inside `tickJson()` is invalid.
- Function calls using `Command.mcFunction()` are different from file definitions and remain allowed.

### `FunctionFile.tickJson()`

- Top-level project container representing `functions/tick.json`.
- Its canonical body contains only `FunctionFile.tickValue()` entries.
- `Command.*`, nested `FunctionFile.define()`, and nested `tickJson()` are invalid inside the canonical tick.json body.
- Entry order is preserved exactly.
- Duplicate function IDs are preserved because the JSON array is authored data.

### Recursive function calls

Function definition nesting and function invocation recursion are different concepts.

This is invalid project structure:

```ts
FunctionFile.define("main", function () {
    FunctionFile.define("sub/test", function () {
    })
})
```

This is a valid function invocation shape and is not rejected by the project structure rules:

```ts
FunctionFile.define("loop/test", function () {
    Command.mcFunction("loop/test")
})
```

Conditional recursion will become especially useful after modern `execute if/unless ... run function ...` support is added. The IDE may later provide warnings for suspicious unconditional cycles, but recursion is not a structural ERROR.

## MakeCode Blocks and JavaScript

The standard PXT callback block generated for `tickJson(function () { ... })` does not expose a custom statement-connection type through normal GitHub Extension annotations. Therefore this revision enforces the rule in three layers:

1. `define()` and `tickJson()` are explicitly top-level blocks.
2. Runtime Preview rejects this project's `Command.*` and project-container APIs when they are used in the wrong context.
3. The future JavaScript/Project Converter must accept only `FunctionFile.tickValue()` statements in a `FunctionFile.tickJson()` callback and report every other statement as a project-structure ERROR.

The canonical Blocks/JavaScript representation remains stable even though MakeCode core blocks outside this extension cannot all be physically prevented from being dragged into a callback mouth without a custom editor/Blockly layer.

## Runtime structural error codes

Current Preview guards use the following codes:

```text
FUNCTION_FILE_IN_TICK_JSON
FUNCTION_FILE_NESTED
TICK_JSON_NESTED
TICK_JSON_IN_FUNCTION_FILE
TICK_VALUE_OUTSIDE_TICK_JSON
COMMAND_IN_TICK_JSON
```

These are project-structure errors, not Minecraft command syntax errors.
