# Dinosaur Jump Integration Prompt - Stage 1: Creation

Use this as an end-to-end integration run inside Codex.

Working directory is the stage folder root. Build everything in the current directory.

Tasks:

1. Create a complete Dinosaur Jump web game prototype under `game/` using Vite + TypeScript.
2. Add deterministic hooks:
   - `window.advanceTime(ms)`
   - `window.render_game_to_text()`
3. Include one obstacle type (cactus), distance score, and `game_over` state.
4. Add Playwright tests for:
   - score increases after 10 seconds of deterministic simulation
   - forced collision sets `game_over`
5. Run tests and fix failures.
6. Keep a short `progress.md`.

Important constraints:

- Keep changes scoped to this stage directory.
- Keep implementation small and readable.
