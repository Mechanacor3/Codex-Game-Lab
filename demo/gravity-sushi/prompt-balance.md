# Codex Game Lab Demo Prompt: Gravity Sushi (Balance Pass)

Take the existing Gravity Sushi game in `game/` and do a balance pass.
Requirements:

- Keep controls and core objective unchanged.
- Add three sushi piece weights (light, medium, heavy) with distinct stability impact.
- Tune spawn distribution to avoid impossible streaks.
- Add difficulty phases at 20s and 40s where plate speed increases.
- Ensure deterministic behavior under `window.advanceTime(ms)`.
- Add `window.setDropSeed(seed)` to make piece sequence reproducible.
- Extend `window.render_game_to_text()` with phase, current piece weight, and plate speed.
- Add Playwright coverage for:
  - phase transitions affect speed
  - deterministic seed reproduces piece sequence
  - heavy-piece streak increases topple risk measurably
- Keep implementation compact and readable.
