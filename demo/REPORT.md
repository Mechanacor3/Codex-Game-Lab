# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T01:05:34+00:00`
- Prompt file: `demo/prompt.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
# Codex Game Lab Demo Prompt

Build me a small web game in `game/` using Vite + TypeScript.
Theme: **neon cave spelunker** (simple but juicy).
Requirements:

- Use a single `<canvas>` for rendering.
- Add deterministic stepping hooks: `window.advanceTime(ms)` and `window.render_game_to_text()` so automated tests can read state.
- Create a Playwright test that launches the dev server, starts the game, simulates 10 seconds of play via `advanceTime`, and asserts the player score increases from 0.
- Keep it tiny: one player, one enemy type, one collectible, one level.
- After each change: run tests; if failing, fix; keep a short `progress.md` log of what you did.
- Use the Playwright skill for browser automation and the develop-web-game skill for the overall workflow.
```

## Measured Tokens (provider usage)

- Prompt tokens: `187`
- Probe completion tokens (`max_tokens=64`): `64`

## Estimated Cost by Output Scenario

| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |
|---:|---:|---:|---:|
| 256 | $0.000047 | $0.000512 | $0.000559 |
| 512 | $0.000047 | $0.001024 | $0.001071 |
| 1024 | $0.000047 | $0.002048 | $0.002095 |

## Probe Request Cost

- Probe input cost: `$0.000047`
- Probe output cost: `$0.000128`
- Probe total: `$0.000175`
