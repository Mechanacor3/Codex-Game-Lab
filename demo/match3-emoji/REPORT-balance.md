# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:20:36+00:00`
- Prompt file: `demo/match3-emoji/prompt-balance.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
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
```

## Measured Tokens (provider usage)

- Prompt tokens: `186`
- Probe completion tokens (`max_tokens=64`): `64`

## Estimated Cost by Output Scenario

| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |
|---:|---:|---:|---:|
| 256 | $0.000046 | $0.000512 | $0.000558 |
| 512 | $0.000046 | $0.001024 | $0.001071 |
| 1024 | $0.000046 | $0.002048 | $0.002095 |

## Probe Request Cost

- Probe input cost: `$0.000046`
- Probe output cost: `$0.000128`
- Probe total: `$0.000174`
