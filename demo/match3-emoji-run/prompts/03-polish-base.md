# Codex Game Lab Demo Prompt: Emoji Match-3 (Polish Pass)

Take the existing Emoji Match-3 game in `game/` and add lightweight polish.
Requirements:

- Keep gameplay balance unchanged.
- Add clear visual feedback for selected tile, swap animation, and match pop animation.
- Add subtle screen shake and score popups for 4+ matches.
- Add clean start and game-over overlays with restart button.
- Ensure keyboard accessibility:
  - arrow keys move board cursor
  - enter selects/swaps
- Preserve deterministic hooks: `window.advanceTime(ms)` and `window.render_game_to_text()`.
- Add Playwright checks for overlay flow and keyboard input path.
- Keep art/code minimal and fast-loading; no external emoji sprite atlas.
