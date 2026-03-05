# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:22:56+00:00`
- Prompt file: `demo/gravity-sushi/prompt-balance.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
# Codex Game Lab Demo Prompt: Gravity Sushi (Balance Pass)

Take the existing Gravity Sushi game in `game/` and do a balance pass.
Requirements:

- Keep controls and core objective unchanged.
- Add three sushi piece weights (light, medium, heavy) with distinct stability impact.
- Tune spawn distribution to avoid impossible streaks.
- Add difficulty phases at 20s and 40s where plate speed increases.
- Ensure deterministic behavior under `window.advanceTime(ms)`.
- Add `window.setDropSeed(seed)` to make piece sequence reproducible.
- Extend `window.render_game_to_text()` with phase, current piece weight, and plate speed.
- Add Playwright coverage for:
  - phase transitions affect speed
  - deterministic seed reproduces piece sequence
  - heavy-piece streak increases topple risk measurably
- Keep implementation compact and readable.
```

## Measured Tokens (provider usage)

- Prompt tokens: `183`
- Probe completion tokens (`max_tokens=64`): `64`

## Estimated Cost by Output Scenario

| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |
|---:|---:|---:|---:|
| 256 | $0.000046 | $0.000512 | $0.000558 |
| 512 | $0.000046 | $0.001024 | $0.001070 |
| 1024 | $0.000046 | $0.002048 | $0.002094 |

## Probe Request Cost

- Probe input cost: `$0.000046`
- Probe output cost: `$0.000128`
- Probe total: `$0.000174`
