# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:21:44+00:00`
- Prompt file: `demo/2048/prompt-polish.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
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
```

## Measured Tokens (provider usage)

- Prompt tokens: `153`
- Probe completion tokens (`max_tokens=64`): `64`

## Estimated Cost by Output Scenario

| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |
|---:|---:|---:|---:|
| 256 | $0.000038 | $0.000512 | $0.000550 |
| 512 | $0.000038 | $0.001024 | $0.001062 |
| 1024 | $0.000038 | $0.002048 | $0.002086 |

## Probe Request Cost

- Probe input cost: `$0.000038`
- Probe output cost: `$0.000128`
- Probe total: `$0.000166`
