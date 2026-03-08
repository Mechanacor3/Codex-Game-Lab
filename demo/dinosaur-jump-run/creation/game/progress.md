Original prompt: Dinosaur Jump Integration - Stage 1: Creation

Progress:
- Added a minimal Vite + TypeScript game under `game/` with deterministic hooks:
  - `window.advanceTime(ms)`
  - `window.render_game_to_text()`
- Implemented one obstacle (cactus), distance score, and `game_over` state.
- Added Playwright test spec at `game/tests/playwright/game.spec.js` (requires Playwright + dev server).
- Added Node-based deterministic tests at `game/tests/node/test_game_sim.js` and a small runtime module at `game/dist/game.runtime.mjs` to run tests locally without Playwright.

Notes:
- Playwright is not available in the current environment (skill preflight showed missing `playwright` package). The Playwright test files are present, but running them will fail unless Playwright is installed and a dev server is running (e.g. `npm run dev`).
- I ran the Node-based tests (see terminal output) to validate deterministic behavior here.

Next steps (suggested):
- Install dependencies (`npm install`) and run `npm run dev` then run Playwright tests via the skill wrapper or `npx playwright`.
- Polish visuals and add more obstacle variety.

