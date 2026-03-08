# Codex Game Lab Demo Prompt: Dinosaur Jump (Core)

Build me a small browser game in `game/` using Vite + TypeScript.
Game concept: **Dinosaur Jump** (endless side-scroller).
Requirements:

- Use a single `<canvas>` for rendering.
- The dinosaur auto-runs to the right; the player controls jump only.
- Add deterministic stepping hooks: `window.advanceTime(ms)` and `window.render_game_to_text()` so automated tests can read state.
- Include exactly one obstacle type (cactus) and one score mechanic (distance score that increases over time).
- On collision, enter `game_over` state and stop score growth.
- Add a Playwright test that launches the dev server, starts the game, simulates 10 seconds via `advanceTime`, and asserts score increased from 0.
- Add a second Playwright test that forces a collision and asserts `game_over`.
- Keep it tiny: one level, no assets pipeline, no sprite sheets.
- After each change: run tests; if failing, fix; keep a short `progress.md` log of what you did.
- Use the Playwright skill for browser automation and the develop-web-game skill for the overall workflow.
