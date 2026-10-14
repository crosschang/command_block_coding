# 0.0.48 First simple-command batch (2026-10-14)

- Added structured TELL, TIME SET/ADD, WEATHER SET, DIFFICULTY, CAMERASHAKE ADD/STOP, HUD HIDE/RESET, INPUTPERMISSION SET.
- AST / Adapter / Compiler / Validator / public MakeCode API; one canonical compiler shared with Runtime Preview except preexisting compatibility adapter.
- TIME/WEATHER/INPUTPERMISSION QUERY are deferred; do not claim query output through `player.execute` works.
- HUD/INPUTPERMISSION details are based on Bedrock docs. Test per-feature support in Minecraft Education 26.32 before marking runtime PASS.
- `pxt.json.version` preserved **0.0.48**. Existing multi-HASITEM and SCORES source paths unchanged.
- Do not merge tests into production main.ts. Re-enable input movement permission after experimentation.
