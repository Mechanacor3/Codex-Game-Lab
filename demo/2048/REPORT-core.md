# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:21:44+00:00`
- Prompt file: `demo/2048/prompt-core.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
# Codex Game Lab Demo Prompt: 2048 (Core)

Build me a small browser game in `game/` using Vite + TypeScript.
Game concept: **2048**.
Requirements:

- Use a single `<canvas>` for rendering.
- Board size: 4x4 grid.
- Tile spawn rules: spawn `2` (90%) or `4` (10%) after each valid move.
- Implement movement + merge rules exactly like 2048:
  - one move direction per input
  - each tile merges at most once per move
  - score increases by merged tile value
- Input support: keyboard arrows + WASD.
- Detect win (`2048` tile reached) and loss (no valid moves).
- Add deterministic stepping hooks: `window.advanceTime(ms)` and `window.render_game_to_text()`.
- `render_game_to_text()` must include board rows, score, move count, and game state.
- Add Playwright tests:
  - a known seeded board + move yields expected merge result
  - score increases after merge
  - loss state is detected on full board with no moves
- Keep it tiny: no backend, no framework beyond Vite + TS.
- After each change: run tests; if failing, fix; keep a short `progress.md` log.
- Use Playwright skill for automation and develop-web-game skill for workflow.
```

## Measured Tokens (provider usage)

- Prompt tokens: `293`
- Probe completion tokens (`max_tokens=64`): `64`

## Estimated Cost by Output Scenario

| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |
|---:|---:|---:|---:|
| 256 | $0.000073 | $0.000512 | $0.000585 |
| 512 | $0.000073 | $0.001024 | $0.001097 |
| 1024 | $0.000073 | $0.002048 | $0.002121 |

## Probe Request Cost

- Probe input cost: `$0.000073`
- Probe output cost: `$0.000128`
- Probe total: `$0.000201`
