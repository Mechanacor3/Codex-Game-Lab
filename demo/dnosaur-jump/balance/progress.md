Progress:
- Scaffolded Vite+TypeScript project structure under `game/` (sources + dist)
- Added deterministic hooks `advanceTime(ms)` and `render_game_to_text()`
- Implemented single obstacle type (cactus), distance score, and `game_over` state
- Added a simple static server `serve.js` and Playwright-style tests in `tests/`
- Could not install Playwright due to npm permissions; added a Node-based test `tests/node_tests.js` that runs deterministically using `vm` and passes locally
 - Added three difficulty phases (easy 0-20s, medium 20-45s, hard 45s+).
 - Increased obstacle speed and spawn frequency per phase; maintained deterministic hooks `advanceTime(ms)` and `render_game_to_text()`.
 - `render_game_to_text()` now includes `phase`, `score`, obstacle count, and `game_over` state.
 - Updated Playwright and node tests to validate phase transitions and determinism (`tests/playwright.spec.ts`, `tests/node_tests.js`).
