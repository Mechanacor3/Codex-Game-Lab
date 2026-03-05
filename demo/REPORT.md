# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:19:15+00:00`
- Prompt file: `demo/prompt.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
# Codex Game Lab Demo Prompt: Dinosaur Jump (Core)

Build me a small browser game in `game/` using Vite + TypeScript.
Game concept: **Dinosaur Jump** (endless side-scroller).
Requirements:

- Use a single `<canvas>` for rendering.
- The dinosaur auto-runs to the right; the player controls jump only.
- Add deterministic stepping hooks: `window.advanceTime(ms)` and `window.render_game_to_text()` so automated tests can read state.
- Include exactly one obstacle type (cactus) and one score mechanic (distance score that increases over time).
- On collision, enter `game_over` state and stop score growth.
- Add a Playwright test that launches the dev server, starts the game, simulates 10 seconds via `advanceTime`, and asserts score increased from 0.
- Add a second Playwright test that forces a collision and asserts `game_over`.
- Keep it tiny: one level, no assets pipeline, no sprite sheets.
- After each change: run tests; if failing, fix; keep a short `progress.md` log of what you did.
- Use the Playwright skill for browser automation and the develop-web-game skill for the overall workflow.
```

## Measured Tokens (provider usage)

- Prompt tokens: `257`
- Probe completion tokens (`max_tokens=64`): `64`

## Estimated Cost by Output Scenario

| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |
|---:|---:|---:|---:|
| 256 | $0.000064 | $0.000512 | $0.000576 |
| 512 | $0.000064 | $0.001024 | $0.001088 |
| 1024 | $0.000064 | $0.002048 | $0.002112 |

## Probe Request Cost

- Probe input cost: `$0.000064`
- Probe output cost: `$0.000128`
- Probe total: `$0.000192`
