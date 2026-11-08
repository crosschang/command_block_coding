# Preview Output rawtext Policy — 2026-10-08

## Purpose

Runtime Preview UI messages may contain punctuation such as `[Preview]`.
In Minecraft Education Preview, routing that text through `player.say()` can be
parsed as command text and punctuation such as `[` may produce a syntax error.

Preview UI text therefore uses `tellraw` + RawText instead of plain `say`.

## Canonical policy

```text
Preview UI message
→ JSON escape
→ tellraw @s {"rawtext":[{"text":"..."}]}
```

- `[Preview]` is allowed and remains the standard Preview prefix.
- Do not ban square brackets merely to work around the runtime parser.
- Dynamic Preview text must pass through `previewEscapeJsonText()` before being
  inserted into a RawText `text` component.
- `previewSay()` remains the shared helper name for compatibility, but its
  implementation is now `tellraw`/RawText.
- `previewTellFromExecutors()` continues to use `tellraw` RawText for per-entity
  output.
- Preview-only display commands are never emitted by the `.mcfunction` Compiler.

## Why this is separate from Command SAY

`Command.say(...)` represents the user's real Minecraft `say` command and must
continue to compile to `say ...`.

`MCFunctionPreview.previewSay(...)` is editor/runtime UI and is not Minecraft
program output authored by the user. Its transport may therefore use `tellraw`
without changing the user's AST or Compiler grammar.

## Verification

After loading this source in Minecraft Education, verify at minimum:

```text
1. TAG list Preview output shows `[Preview]` without a syntax error.
2. previewSay text containing `[` and `]` renders literally.
3. text containing quotes/backslashes still renders after JSON escaping.
4. normal Command.say remains unchanged.
```

`test.ts` remains empty; runtime verification is performed from `main.ts` only
when requested.
