# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:21:46+00:00`
- Prompt file: `demo/2048/prompt-balance.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
# Codex Game Lab Demo Prompt: 2048 (Balance + UX Pass)

Take the existing 2048 game in `game/` and do a balance + UX pass.
Requirements:

- Keep core mechanics unchanged.
- Add difficulty presets:
  - casual: normal spawn rates
  - spicy: increase `4` spawn chance and lower undo count
- Add a limited undo system (default: 3 undos per run).
- Add a deterministic seed API at `window.setBoardSeed(seed)`.
- Ensure deterministic behavior under `window.advanceTime(ms)`.
- Extend `window.render_game_to_text()` with preset, undos left, and best tile.
- Add Playwright coverage for:
  - undo restores prior board + score
  - preset differences affect observed spawn distribution in deterministic simulation
  - win state still triggers correctly
- Keep code compact and readable.
```

## Measured Tokens (provider usage)

- Prompt tokens: `185`
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
