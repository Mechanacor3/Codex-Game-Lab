# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:20:36+00:00`
- Prompt file: `demo/match3-emoji/prompt-polish.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
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
```

## Measured Tokens (provider usage)

- Prompt tokens: `161`
- Probe completion tokens (`max_tokens=64`): `64`

## Estimated Cost by Output Scenario

| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |
|---:|---:|---:|---:|
| 256 | $0.000040 | $0.000512 | $0.000552 |
| 512 | $0.000040 | $0.001024 | $0.001064 |
| 1024 | $0.000040 | $0.002048 | $0.002088 |

## Probe Request Cost

- Probe input cost: `$0.000040`
- Probe output cost: `$0.000128`
- Probe total: `$0.000168`
