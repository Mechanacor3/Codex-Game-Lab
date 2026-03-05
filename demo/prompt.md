# Codex Game Lab Demo Prompt

Build me a small web game in `game/` using Vite + TypeScript.
Theme: **neon cave spelunker** (simple but juicy).
Requirements:

- Use a single `<canvas>` for rendering.
- Add deterministic stepping hooks: `window.advanceTime(ms)` and `window.render_game_to_text()` so automated tests can read state.
- Create a Playwright test that launches the dev server, starts the game, simulates 10 seconds of play via `advanceTime`, and asserts the player score increases from 0.
- Keep it tiny: one player, one enemy type, one collectible, one level.
- After each change: run tests; if failing, fix; keep a short `progress.md` log of what you did.
- Use the Playwright skill for browser automation and the develop-web-game skill for the overall workflow.
