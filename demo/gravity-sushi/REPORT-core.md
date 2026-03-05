# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:22:58+00:00`
- Prompt file: `demo/gravity-sushi/prompt-core.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
# Codex Game Lab Demo Prompt: Gravity Sushi (Core)

Build me a small browser game in `game/` using Vite + TypeScript.
Game concept: **Gravity Sushi** (timed stack-and-balance game).
Requirements:

- Use a single `<canvas>` for rendering.
- Player drops sushi pieces from the top onto a moving plate.
- Controls: move drop position left/right and drop.
- Physics can be simplified, but stacking must feel weight-based and can topple.
- Score increases for stable stacks and combo landings.
- Round length: 60 seconds.
- Add deterministic stepping hooks: `window.advanceTime(ms)` and `window.render_game_to_text()`.
- `render_game_to_text()` must include score, timer, stack height, stability meter, and game state.
- Add Playwright tests:
  - score increases after successful stable drops
  - unstable stack can trigger topple state
  - timer reaches end and game_over state is set
- Keep it tiny: no backend, no extra frameworks beyond Vite + TypeScript.
- After each change: run tests; if failing, fix; keep a short `progress.md` log.
- Use Playwright skill for automation and develop-web-game skill for workflow.
```

## Measured Tokens (provider usage)

- Prompt tokens: `261`
- Probe completion tokens (`max_tokens=64`): `64`

## Estimated Cost by Output Scenario

| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |
|---:|---:|---:|---:|
| 256 | $0.000065 | $0.000512 | $0.000577 |
| 512 | $0.000065 | $0.001024 | $0.001089 |
| 1024 | $0.000065 | $0.002048 | $0.002113 |

## Probe Request Cost

- Probe input cost: `$0.000065`
- Probe output cost: `$0.000128`
- Probe total: `$0.000193`
