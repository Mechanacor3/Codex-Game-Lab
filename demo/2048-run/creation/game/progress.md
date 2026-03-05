Progress notes for minimal deterministic 2048 demo

- Implemented core game logic in `src/game.ts` with deterministic RNG (xorshift32).
- Exposed test helper APIs on `window`: `setGameSeed`, `setBoard`, `move`, `render_game_to_text`, `advanceTime`.
- Render function returns formatted board rows, score, moves, and state.
- Keyboard controls support Arrow keys and WASD.
- Playwright tests verify merge behavior, score, deterministic spawn, and loss detection.
