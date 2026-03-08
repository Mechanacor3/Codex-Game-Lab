# Match-3 Stage 2 (Minimal deterministic balance)

Edit only these files with complete rewrites using shell heredocs:
- game/src/game.ts
- game/src/main.ts
- game/tests/playwright.spec.ts
- game/progress.md

Required outcomes:
1) 60-second timed mode with milestones 15/30/45/60.
2) deterministic API: `window.setBoardSeed(seed)`.
3) deterministic `window.advanceTime(ms)` updates timer.
4) `window.render_game_to_text()` includes SCORE, COMBO, TIME, MILESTONE, DEAD.
5) dead-board detection + deterministic reshuffle exists.
6) Playwright tests include timer countdown and milestone progression checks.

Hard constraints:
- Do not run git commands.
- Do not run python.
- Do not run npm install.
- Do not use git apply.
- Keep code compact and readable.
When done, print a short summary only.

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
