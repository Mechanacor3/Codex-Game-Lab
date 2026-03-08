Original prompt: Create a minimal deterministic 2048 project (4x4 board, 90/10 spawn, keyboard arrows + WASD, window.advanceTime, window.render_game_to_text, deterministic helpers, Playwright tests)

Progress:
- Implemented minimal deterministic 2048 game under `src/` with `Game` class.
- Exposed `window.setSeed`, `window.setBoard`, `window.render_game_to_text`, `window.advanceTime`.
- Added difficulty presets (`casual`, `spicy`) with different 4-tile spawn probability and undo counts.
- Added limited undo system (default 3 undos per run; `spicy` sets to 1).
- Added `window.setBoardSeed` + `window.setPreset` + `window.undo` wrappers.
- Extended `render_game_to_text` to include `Preset`, `Undos left`, and `Best` tile.
- Made `spawnRandomTile` callable so tests can deterministically sample spawn distribution.
- Added Playwright tests in `tests/balance.spec.ts` covering undo, preset distribution, and win detection.

Notes / TODOs:
- This repo includes TypeScript sources; to run tests, install deps with `npm install` inside `game/`.
- Playwright may not be preinstalled in the environment; the skill wrapper tried to run and failed in the preflight due to network restrictions.
- The scheduler runs scheduled tasks when `advanceTime` is called; typical usage is calling it from Playwright to flush spawns.
- If you want I can attempt to run the Playwright client here, but the environment can't fetch npm packages.
