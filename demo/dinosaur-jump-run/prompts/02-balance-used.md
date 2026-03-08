# Dinosaur Jump Integration Prompt - Stage 2: Balance

Use this as an integration run inside Codex.

You are given an existing Dinosaur Jump prototype in the current directory.
Apply a balance pass only.

Tasks:

1. Add three difficulty phases:
   - easy: 0-20s
   - medium: 20-45s
   - hard: 45s+
2. Increase obstacle speed and spawn frequency per phase.
3. Preserve deterministic behavior for:
   - `window.advanceTime(ms)`
   - `window.render_game_to_text()`
4. Ensure `render_game_to_text()` includes phase, score, obstacle count, and game state.
5. Add/adjust Playwright tests for phase transitions and deterministic checks.
6. Run tests and fix failures.
7. Update `progress.md` with this stage’s changes.

Important constraints:

- Keep existing game structure; do not rewrite from scratch.
- Keep changes scoped to this stage directory.

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
