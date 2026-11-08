# Validation Gate / SUMMON Orientation / Block State Library — 2026-10-08

- FunctionFile Runtime Preview now collects and validates Command actions before world changes.
- Any ERROR blocks the whole current FunctionFile Preview run; WARNING/INFO do not.
- SUMMON ADVANCED Orientation is a required visible reporter. `no orientation` is the explicit valid None choice.
- A disconnected/missing Orientation produces `SUMMON_ORIENTATION_MISSING`.
- Added reusable Block State Library entry reporters and a common state-chain adapter.
- Added initial official-doc-backed block-state registry snapshots for representative states/blocks.
- Corrected block_state_array compiler separator from `:` to ` = ` for the current source snapshot.
- `test.ts` remains empty.
