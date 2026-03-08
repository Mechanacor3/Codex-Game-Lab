Create a tiny deterministic Gravity Sushi game in this directory.
Create files under game/ only:
- index.html
- package.json
- tsconfig.json
- playwright.config.ts
- src/game.ts
- src/main.ts
- tests/playwright.spec.ts
- progress.md

Requirements:
- single canvas renderer
- moving plate, left/right controls, drop action
- piece weights affect stability, unstable stack can topple
- 60s timer and game_over
- score grows on stable drops
- deterministic API:
  - window.advanceTime(ms)
  - window.render_game_to_text()
  - window.setDropSeed(seed)
  - window.setStateForTest(...)
- render_game_to_text includes: score,timer,stack_height,stability,state
- tests cover:
  - stable drop increases score
  - unstable stack can topple
  - timer reaches game_over

Do not run git.
Do not run npm install.
Do not run tests.
Do not use python.
Write files directly and finish with a short summary.

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
