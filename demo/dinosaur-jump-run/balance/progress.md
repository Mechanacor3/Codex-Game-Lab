Progress:
- Scaffolded Vite+TypeScript project structure under `game/` (sources + dist)
- Added deterministic hooks `advanceTime(ms)` and `render_game_to_text()`
- Implemented single obstacle type (cactus), distance score, and `game_over` state
- Added a simple static server `serve.js` and Playwright-style tests in `tests/`

Stage 2 - Balance (2026-03-06):
- Added three difficulty phases (easy 0-20s, medium 20-45s, hard 45s+). (game/dist/main.js)
- Increased obstacle speed and spawn frequency per phase using multipliers per phase (easy 1.0, medium 1.4/1.3, hard 1.9/1.6).
- Preserved deterministic hooks `advanceTime(ms)` and `render_game_to_text()`.
- `render_game_to_text()` includes `phase`, `score`, obstacle count, and `game_over` state.
- Tests:
  - Added/updated Playwright tests in `tests/playwright.spec.ts` to validate phase transitions and determinism.
  - Kept a Node-based deterministic test `tests/node_tests.js` for environments without Playwright.
  - Added `npm run test` fallback to run the Node deterministic tests when Playwright is not available.
- Test results (local): Node deterministic tests passed. Playwright tests require Playwright to be installed and were not run in this environment.

