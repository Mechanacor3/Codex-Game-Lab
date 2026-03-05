# progress

- created Vite+TS scaffold in `game/`
- implemented game logic in `src/game.ts` with deterministic RNG and test hooks
- exposed `window.advanceTime(ms)` and `window.render_game_to_text()` and `window.test_api`
- added Playwright tests under `game/tests`

Notes:
- I could not run `npm install` or `playwright` in this environment because package installation requires network access. To run tests locally:
  - cd game && npm install
  - npm run dev (to open the app) or run `npx playwright test` with a running dev server

