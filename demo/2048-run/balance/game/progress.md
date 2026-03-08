Progress notes for minimal deterministic 2048 demo

- Implemented core game logic in `src/game.ts` with deterministic RNG (xorshift32).
- Exposed test helper APIs on `window`: `setGameSeed`, `setBoard`, `move`, `render_game_to_text`, `advanceTime`.
- Render function returns formatted board rows, score, moves, and state.
- Keyboard controls support Arrow keys and WASD.
- Playwright tests verify merge behavior, score, deterministic spawn, and loss detection.

Balance & UX pass (2026-03-06):

- Added difficulty presets: `casual` (default) and `spicy`.
  - `spicy` increases chance of spawning `4` (25% vs 10%) and reduces `max_undos` to 1.
- Implemented limited undo system: `max_undos` default 3; `undos_left` tracked and exposed in renderer.
- Exposed deterministic seed API: `window.setBoardSeed(seed)` (alias to `setGameSeed`).
- Ensured deterministic `window.advanceTime(ms)` hook exists and is a no-op so tests can call it without affecting state.
- Extended `render_game_to_text()` to include `preset`, `undos_left`, and `best` tile.
- Playwright tests added/updated to cover undo, preset spawn differences, and win detection.
