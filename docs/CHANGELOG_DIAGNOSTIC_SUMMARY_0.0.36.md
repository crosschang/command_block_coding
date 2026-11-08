# 0.0.36 Diagnostic Summary UX

- Keeps the 0.0.35 `cbi_diag` Diagnostic Store design.
- Shortens automatic per-function Preview output.
- Detailed issue code/source/message remains available only through `cbi_diag`.
- No Minecraft Command AST, Compiler, Block State Registry, or serializer behavior changed.

Examples:

```text
diag_ok: OK.
diag_warning: 1 warning. Details: cbi_diag
diag_error: 1 error. Not registered. Details: cbi_diag
diag_info: 1 info. Details: cbi_diag
```
