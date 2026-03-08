Take the existing Gravity Sushi game in game/ and apply a balance pass.
Requirements:
- keep controls and objective unchanged
- add three piece weights: light, medium, heavy with distinct stability impact
- tune piece spawn distribution to avoid impossible heavy streaks
- add difficulty phases at 20s and 40s with faster plate speed
- preserve deterministic behavior under window.advanceTime(ms)
- add window.setDropSeed(seed) for reproducible piece sequence
- extend window.render_game_to_text() with phase, current piece weight, plate speed
- add Playwright tests for phase transition speed change, deterministic seed sequence, and heavy streak risk increase
- keep implementation compact

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
