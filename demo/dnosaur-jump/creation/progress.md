Progress:
- Scaffolded Vite+TypeScript project structure under `game/` (sources + dist)
- Added deterministic hooks `advanceTime(ms)` and `render_game_to_text()`
- Implemented single obstacle type (cactus), distance score, and `game_over` state
- Added a simple static server `serve.js` and Playwright-style tests in `tests/`
- Could not install Playwright due to npm permissions; added a Node-based test `tests/node_tests.js` that runs deterministically using `vm` and passes locally
