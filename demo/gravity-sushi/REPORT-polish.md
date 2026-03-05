# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:22:58+00:00`
- Prompt file: `demo/gravity-sushi/prompt-polish.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
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
```

## Measured Tokens (provider usage)

- Prompt tokens: `143`
- Probe completion tokens (`max_tokens=64`): `64`

## Estimated Cost by Output Scenario

| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |
|---:|---:|---:|---:|
| 256 | $0.000036 | $0.000512 | $0.000548 |
| 512 | $0.000036 | $0.001024 | $0.001060 |
| 1024 | $0.000036 | $0.002048 | $0.002084 |

## Probe Request Cost

- Probe input cost: `$0.000036`
- Probe output cost: `$0.000128`
- Probe total: `$0.000164`
