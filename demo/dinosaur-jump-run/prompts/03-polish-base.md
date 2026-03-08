# Codex Game Lab Demo Prompt: Dinosaur Jump (Polish Pass)

Take the existing Dinosaur Jump game in `game/` and add lightweight polish.
Requirements:

- Keep mechanics exactly the same (no gameplay rebalance).
- Add tiny juice effects: jump squash/stretch, landing dust puff, and subtle camera shake on collision.
- Add a clean start overlay and game-over overlay with restart prompt.
- Add keyboard + touch input for jump (desktop and mobile).
- Preserve deterministic stepping for tests: `window.advanceTime(ms)` and `window.render_game_to_text()`.
- Add Playwright checks that verify overlays and restart flow.
- Keep art/code minimal and fast to load.
