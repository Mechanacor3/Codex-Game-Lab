Progress notes for Match3 minimal deterministic balance

- Mode: 60s total time. Milestones at 15/30/45/60 seconds.
- Deterministic API:
  - `window.setBoardSeed(seed)` sets seed, RNG, resets score/time.
  - `window.advanceTime(ms)` advances the timer and triggers milestones.
  - `window.render_game_to_text()` returns text with SCORE, COMBO, TIME, MILESTONE, DEAD and board rows.
  - `window.checkDead()` detects dead boards; `window.reshuffleDeterministic()` reshuffles deterministically using the RNG.
- Playwright tests added to check milestone progression, timer, dead detection and reshuffle determinism.

Notes:
- Files overwritten: `game/src/game.ts`, `game/src/main.ts`, `game/tests/playwright.spec.ts`, `game/progress.md`.
- Keep code compact and readable; deterministic RNG uses LCG.
