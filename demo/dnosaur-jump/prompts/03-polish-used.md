# Dinosaur Jump Integration Prompt - Stage 3: Polish

Use this as an integration run inside Codex.

You are given an existing Dinosaur Jump prototype in the current directory.
Apply a polish pass only.

Tasks:

1. Keep gameplay mechanics and balance unchanged.
2. Add lightweight polish:
   - jump squash/stretch
   - landing dust puff
   - subtle collision shake
3. Add clean start and game-over overlays with restart flow.
4. Add keyboard + touch jump support.
5. Preserve deterministic hooks:
   - `window.advanceTime(ms)`
   - `window.render_game_to_text()`
6. Add/adjust Playwright tests for overlays and restart flow.
7. Run tests and fix failures.
8. Update `progress.md` with this stage’s changes.

Important constraints:

- Keep changes scoped to this stage directory.
- Keep visual polish lightweight and fast.
