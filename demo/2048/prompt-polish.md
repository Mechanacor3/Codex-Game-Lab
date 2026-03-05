# Codex Game Lab Demo Prompt: 2048 (Polish Pass)

Take the existing 2048 game in `game/` and add lightweight polish.
Requirements:

- Keep gameplay and balance unchanged.
- Add smooth slide/merge animation and subtle pop effect on merge.
- Add clean overlays for start, win, and game over with restart action.
- Add touch swipe controls for mobile in addition to keyboard controls.
- Add accessibility touches:
  - high-contrast mode toggle
  - reduced-motion mode toggle
- Preserve deterministic hooks: `window.advanceTime(ms)` and `window.render_game_to_text()`.
- Add Playwright checks for overlay flow and touch swipe input path.
- Keep implementation minimal and fast-loading.
