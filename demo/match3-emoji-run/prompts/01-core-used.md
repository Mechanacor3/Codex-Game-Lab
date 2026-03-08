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

## Skill Use Requirements (Mandatory)

Before any implementation edits, run and log this exact preflight (inside the current stage directory):

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
export WEB_GAME_CLIENT="$CODEX_HOME/skills/develop-web-game/scripts/web_game_playwright_client.js"
export WEB_GAME_ACTIONS="$CODEX_HOME/skills/develop-web-game/references/action_payloads.json"

sed -n '1,200p' "$CODEX_HOME/skills/playwright/SKILL.md"
sed -n '1,260p' "$CODEX_HOME/skills/develop-web-game/SKILL.md"
sed -n '1,120p' "$CODEX_HOME/skills/playwright/references/cli.md"
sed -n '1,120p' "$CODEX_HOME/skills/develop-web-game/references/action_payloads.json"
"$PWCLI" --help || true
node "$WEB_GAME_CLIENT" --help || true
```

During implementation, keep using skill paths (scripts/references) instead of inventing new workflows where possible.
At the end of your response, include a one-line proof marker:

`SKILL_USAGE_PROOF: <what skill files/scripts were used>`
