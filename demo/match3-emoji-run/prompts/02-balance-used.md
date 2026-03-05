# Match-3 Stage 2 (Minimal deterministic balance)

Edit only these files with complete rewrites using shell heredocs:
- game/src/game.ts
- game/src/main.ts
- game/tests/playwright.spec.ts
- game/progress.md

Required outcomes:
1) 60-second timed mode with milestones 15/30/45/60.
2) deterministic API: `window.setBoardSeed(seed)`.
3) deterministic `window.advanceTime(ms)` updates timer.
4) `window.render_game_to_text()` includes SCORE, COMBO, TIME, MILESTONE, DEAD.
5) dead-board detection + deterministic reshuffle exists.
6) Playwright tests include timer countdown and milestone progression checks.

Hard constraints:
- Do not run git commands.
- Do not run python.
- Do not run npm install.
- Do not use git apply.
- Keep code compact and readable.
When done, print a short summary only.
