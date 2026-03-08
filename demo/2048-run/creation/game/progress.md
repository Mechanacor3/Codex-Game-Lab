Original prompt: Create a minimal deterministic 2048 project with tests and deterministic helpers.

Progress:
- Created minimal runtime in `index.html` (inline JS) and TypeScript sources in `src/`.
- Exposed deterministic helpers:
  - `window.setSeed(seed)`
  - `window.setBoard(board)`
  - `window.move(dir)` and `window.moveNoSpawn(dir)`
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`
- Tests added in `tests/playwright.spec.ts` for merge rules, scoring, and loss detection.

Notes / TODO:
- This repo includes TypeScript sources but the browser runtime uses the inline JS in `index.html` for simplicity (no bundler).
- To run Playwright tests locally, install dependencies and run `npx playwright test` from `game/`.
