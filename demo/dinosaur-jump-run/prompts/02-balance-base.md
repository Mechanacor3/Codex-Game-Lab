# Codex Game Lab Demo Prompt: Dinosaur Jump (Balance Pass)

Take the existing Dinosaur Jump game in `game/` and do a balance pass.
Requirements:

- Keep core controls unchanged: jump only.
- Add three difficulty phases by elapsed time: easy (0-20s), medium (20-45s), hard (45s+).
- Increase obstacle speed and spawn frequency per phase.
- Ensure deterministic behavior under `window.advanceTime(ms)`.
- Expose `window.render_game_to_text()` with at least: current phase, score, obstacle count, game state.
- Add Playwright coverage for phase transitions using deterministic stepping.
- Keep implementation compact and readable; avoid over-engineering.
