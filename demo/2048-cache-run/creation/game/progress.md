Original prompt: Create a minimal deterministic 2048 project (4x4 board, 90/10 spawn, keyboard arrows + WASD, window.advanceTime, window.render_game_to_text, deterministic helpers, Playwright tests)

Progress:
- Implemented minimal deterministic 2048 game under `src/` with `Game` class.
- Exposed `window.setSeed`, `window.setBoard`, `window.render_game_to_text`, `window.advanceTime`.
- Scheduler used so tests can deterministically advance spawn steps.
- Tests added under `tests/playwright.spec.ts` for merge correctness, score increase, and loss detection.

Notes / TODOs:
- This repo includes TypeScript sources; to run tests, install deps with `npm install` inside `game/`.
- Browser cannot execute `.ts` files directly; in a real run you may compile TS to JS (or run tests with Playwright + ts-node support).
- The scheduler runs scheduled tasks when `advanceTime` is called; typical usage is calling it from Playwright to flush spawns.
