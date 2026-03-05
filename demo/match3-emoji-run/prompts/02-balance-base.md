# Codex Game Lab Demo Prompt: Emoji Match-3 (Balance Pass)

Take the existing Emoji Match-3 game in `game/` and do a balance pass.
Requirements:

- Keep mechanics unchanged (swap, match, gravity, refill).
- Add a 60-second timed mode with target score milestones at 15s, 30s, 45s, 60s.
- Tune spawn distribution to reduce dead-board frequency without making easy cascades constant.
- Add a deterministic board-seed option exposed at `window.setBoardSeed(seed)`.
- Ensure deterministic behavior under `window.advanceTime(ms)`.
- Extend `window.render_game_to_text()` with timer, target milestone, and dead-board flag.
- Add Playwright coverage for:
  - timer countdown behavior
  - milestone progression
  - dead-board detection + reshuffle path
- Keep implementation compact and readable.
