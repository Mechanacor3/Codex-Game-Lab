# Match-3 Stage 3 One-Shot Polish

Overwrite exactly these files using shell heredocs, then stop:
- game/src/main.ts
- game/tests/playwright.spec.ts
- game/progress.md

Add polish markers without changing balance core game.ts:
- selected tile marker state
- swap animation marker state
- match pop marker state
- score popup marker for 4+ clears
- start overlay + game-over overlay + restart state
- keyboard path: arrow keys move cursor, Enter select/swap
- keep deterministic APIs from balance working
- extend Playwright tests for overlay flow + keyboard path

Constraints:
- no git commands
- no python
- no npm install
- no git apply
- short summary at end

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
