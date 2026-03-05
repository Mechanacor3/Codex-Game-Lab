# Codex Game Lab Demo Prompt: 2048 (Balance + UX Pass)

Take the existing 2048 game in `game/` and do a balance + UX pass.
Requirements:

- Keep core mechanics unchanged.
- Add difficulty presets:
  - casual: normal spawn rates
  - spicy: increase `4` spawn chance and lower undo count
- Add a limited undo system (default: 3 undos per run).
- Add a deterministic seed API at `window.setBoardSeed(seed)`.
- Ensure deterministic behavior under `window.advanceTime(ms)`.
- Extend `window.render_game_to_text()` with preset, undos left, and best tile.
- Add Playwright coverage for:
  - undo restores prior board + score
  - preset differences affect observed spawn distribution in deterministic simulation
  - win state still triggers correctly
- Keep code compact and readable.
