# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:19:14+00:00`
- Prompt file: `demo/dinosaur-jump/prompt-balance.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
# Codex Game Lab Demo Prompt: Dinosaur Jump (Balance Pass)

Take the existing Dinosaur Jump game in `game/` and do a balance pass.
Requirements:

- Keep core controls unchanged: jump only.
- Add three difficulty phases by elapsed time: easy (0-20s), medium (20-45s), hard (45s+).
- Increase obstacle speed and spawn frequency per phase.
- Ensure deterministic behavior under `window.advanceTime(ms)`.
- Expose `window.render_game_to_text()` with at least: current phase, score, obstacle count, game state.
- Add Playwright coverage for phase transitions using deterministic stepping.
- Keep implementation compact and readable; avoid over-engineering.
```

## Measured Tokens (provider usage)

- Prompt tokens: `148`
- Probe completion tokens (`max_tokens=64`): `64`

## Estimated Cost by Output Scenario

| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |
|---:|---:|---:|---:|
| 256 | $0.000037 | $0.000512 | $0.000549 |
| 512 | $0.000037 | $0.001024 | $0.001061 |
| 1024 | $0.000037 | $0.002048 | $0.002085 |

## Probe Request Cost

- Probe input cost: `$0.000037`
- Probe output cost: `$0.000128`
- Probe total: `$0.000165`
