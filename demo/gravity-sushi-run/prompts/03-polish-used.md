Take the existing Gravity Sushi game in game/ and add lightweight polish.
Requirements:
- keep gameplay and balance unchanged
- add subtle drop trail, landing squish, and plate wobble feedback
- add clean start/game-over overlays with restart button
- add touch input alongside keyboard controls
- add reduced-motion and high-contrast toggles
- preserve deterministic hooks window.advanceTime(ms) and window.render_game_to_text()
- add Playwright checks for overlay flow and touch controls
- keep visuals minimal and fast-loading

Do not run git, npm install, npm test, python, apt, or git apply.
Prefer direct edits and finish with a short summary.

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
