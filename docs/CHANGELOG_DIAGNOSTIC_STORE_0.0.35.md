# 0.0.35 — Diagnostic Store / `cbi_diag`

## Purpose

Definition Validation details are now stored instead of flooding normal Preview chat.
The normal screen shows one compact result line per `FunctionFile.define()`.

## Human-facing viewer

No additional MakeCode block is required.

Typing this in Minecraft chat opens the detailed list:

```text
cbi_diag
```

`FunctionFile.define()` may appear many times. The diagnostic chat handler is registered
only once per MakeCode program run.

## Storage behavior

Diagnostics are kept per mcfunction name.
Redefining the same name replaces that function's current Definition diagnostics rather
than appending stale duplicates.

Current stored fields:

```text
functionName
severity: ERROR / WARNING / INFO
code
message
source: DEFINITION / PROJECT / PREVIEW / RUNTIME
```

Only Definition diagnostics are populated by this revision. Preview/Runtime sources are
reserved for later adapters such as hidden runtime-error output tracking.

## Normal Preview output

No issue:

```text
mcfunction main: OK.
```

Issues:

```text
mcfunction example: errors 1 warnings 0 info 0. Not registered. Details: cbi_diag
```

Long diagnostic messages are shown only when the user types `cbi_diag`.

## Reserved name

`cbi_diag` is the one human-facing internal chat command reserved by the editor Preview.
A user `FunctionFile.define("cbi_diag", ...)` receives `FUNCTION_NAME_RESERVED` and is not
registered as a function Preview command.

This does not reserve the whole `cbi_` prefix.

## Scope

DiagnosticStore is Preview/editor derived state. It is not Minecraft Command AST data and
must not be emitted into `.mcfunction` files.
