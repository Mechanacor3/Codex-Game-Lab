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
