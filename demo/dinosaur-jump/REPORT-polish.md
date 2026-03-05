# Codex Game Lab Demo: Prompt, Tokens, and Cost

- Generated (UTC): `2026-03-05T02:19:15+00:00`
- Prompt file: `demo/dinosaur-jump/prompt-polish.md`
- Provider URL: `http://localhost:28789/v1`
- Model alias: `default`
- Input cost / 1M tokens: `$0.250000`
- Output cost / 1M tokens: `$2.000000`

## Exact Prompt

```md
# Codex Game Lab Demo Prompt: Dinosaur Jump (Polish Pass)

Take the existing Dinosaur Jump game in `game/` and add lightweight polish.
Requirements:

- Keep mechanics exactly the same (no gameplay rebalance).
- Add tiny juice effects: jump squash/stretch, landing dust puff, and subtle camera shake on collision.
- Add a clean start overlay and game-over overlay with restart prompt.
- Add keyboard + touch input for jump (desktop and mobile).
- Preserve deterministic stepping for tests: `window.advanceTime(ms)` and `window.render_game_to_text()`.
- Add Playwright checks that verify overlays and restart flow.
- Keep art/code minimal and fast to load.
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
