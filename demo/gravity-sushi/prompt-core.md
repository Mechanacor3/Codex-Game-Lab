# Codex Game Lab Demo Prompt: Gravity Sushi (Core)

Build me a small browser game in `game/` using Vite + TypeScript.
Game concept: **Gravity Sushi** (timed stack-and-balance game).
Requirements:

- Use a single `<canvas>` for rendering.
- Player drops sushi pieces from the top onto a moving plate.
- Controls: move drop position left/right and drop.
- Physics can be simplified, but stacking must feel weight-based and can topple.
- Score increases for stable stacks and combo landings.
- Round length: 60 seconds.
- Add deterministic stepping hooks: `window.advanceTime(ms)` and `window.render_game_to_text()`.
- `render_game_to_text()` must include score, timer, stack height, stability meter, and game state.
- Add Playwright tests:
  - score increases after successful stable drops
  - unstable stack can trigger topple state
  - timer reaches end and game_over state is set
- Keep it tiny: no backend, no extra frameworks beyond Vite + TypeScript.
- After each change: run tests; if failing, fix; keep a short `progress.md` log.
- Use Playwright skill for automation and develop-web-game skill for workflow.
