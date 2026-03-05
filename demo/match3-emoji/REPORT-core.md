# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:20:36+00:00`
- Prompt file: `demo/match3-emoji/prompt-core.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
# Codex Game Lab Demo Prompt: Emoji Match-3 (Core)

Build me a small browser game in `game/` using Vite + TypeScript.
Game concept: **Emoji Match-3**.
Requirements:

- Use a single `<canvas>` for rendering.
- Board size: 8x8 grid with exactly 6 emoji tile types.
- Implement swap of adjacent tiles only (mouse/touch).
- A move is valid only if it creates at least one 3+ match.
- Resolve matches by clearing tiles, applying gravity, and refilling from top.
- Add combo scoring: base points per tile + multiplier for chain cascades.
- Add deterministic stepping hooks: `window.advanceTime(ms)` and `window.render_game_to_text()`.
- `render_game_to_text()` must include board rows, score, and combo state.
- Add Playwright tests:
  - valid swap increases score after resolution
  - invalid swap reverts board state
  - cascade can happen and increases combo multiplier
- Keep it tiny: no backend, no asset pipeline, no frameworks beyond Vite + TS.
- After each change: run tests; if failing, fix; keep a short `progress.md` log.
- Use Playwright skill for automation and develop-web-game skill for workflow.
```

## Measured Tokens (provider usage)

- Prompt tokens: `269`
- Probe completion tokens (`max_tokens=64`): `64`

## Estimated Cost by Output Scenario

| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |
|---:|---:|---:|---:|
| 256 | $0.000067 | $0.000512 | $0.000579 |
| 512 | $0.000067 | $0.001024 | $0.001091 |
| 1024 | $0.000067 | $0.002048 | $0.002115 |

## Probe Request Cost

- Probe input cost: `$0.000067`
- Probe output cost: `$0.000128`
- Probe total: `$0.000195`
