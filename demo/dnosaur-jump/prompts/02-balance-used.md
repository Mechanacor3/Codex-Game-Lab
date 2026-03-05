# Dinosaur Jump Integration Prompt - Stage 2: Balance

Use this as an integration run inside Codex.

You are given an existing Dinosaur Jump prototype in the current directory.
Apply a balance pass only.

Tasks:

1. Add three difficulty phases:
   - easy: 0-20s
   - medium: 20-45s
   - hard: 45s+
2. Increase obstacle speed and spawn frequency per phase.
3. Preserve deterministic behavior for:
   - `window.advanceTime(ms)`
   - `window.render_game_to_text()`
4. Ensure `render_game_to_text()` includes phase, score, obstacle count, and game state.
5. Add/adjust Playwright tests for phase transitions and deterministic checks.
6. Run tests and fix failures.
7. Update `progress.md` with this stage’s changes.

Important constraints:

- Keep existing game structure; do not rewrite from scratch.
- Keep changes scoped to this stage directory.
