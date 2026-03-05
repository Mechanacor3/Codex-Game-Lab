# Codex Game Lab Demo Prompt: Emoji Match-3 (Core)

Build me a small browser game in `game/` using Vite + TypeScript.
Game concept: **Emoji Match-3**.
Requirements:

- Use a single `<canvas>` for rendering.
- Board size: 8x8 grid with exactly 6 emoji tile types.
- Implement swap of adjacent tiles only (mouse/touch).
- A move is valid only if it creates at least one 3+ match.
- Resolve matches by clearing tiles, applying gravity, and refilling from top.
- Add combo scoring: base points per tile + multiplier for chain cascades.
- Add deterministic stepping hooks: `window.advanceTime(ms)` and `window.render_game_to_text()`.
- `render_game_to_text()` must include board rows, score, and combo state.
- Add Playwright tests:
  - valid swap increases score after resolution
  - invalid swap reverts board state
  - cascade can happen and increases combo multiplier
- Keep it tiny: no backend, no asset pipeline, no frameworks beyond Vite + TS.
- After each change: run tests; if failing, fix; keep a short `progress.md` log.
- Use Playwright skill for automation and develop-web-game skill for workflow.
