# Codex Game Lab Demo Prompt: Gravity Sushi (Polish Pass)

Take the existing Gravity Sushi game in `game/` and add lightweight polish.
Requirements:

- Keep gameplay balance unchanged.
- Add subtle drop trail, landing squish, and plate wobble feedback.
- Add clean start and game-over overlays with restart button.
- Add touch input for mobile alongside keyboard controls.
- Add accessibility options:
  - reduced-motion toggle
  - high-contrast mode toggle
- Preserve deterministic hooks: `window.advanceTime(ms)` and `window.render_game_to_text()`.
- Add Playwright checks for overlay flow and touch controls.
- Keep visuals minimal and code fast-loading.
