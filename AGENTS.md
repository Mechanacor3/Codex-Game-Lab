# AGENTS.md

## Purpose

Operational notes for agents working in **Codex Game Lab**.
Use this as the default runbook for reliable local integration runs.

## Repo Defaults (Canonical)

- Codex provider is repo-local LiteLLM: `http://litellm:4000/v1`
- Model alias: `gpt-5-nano` (LiteLLM still routes to `LITELLM_UPSTREAM_MODEL`)
- Codex config: `.codex/config.toml`
- Compose project: `codex-game-lab`
- Branding in docs: **Codex Game Lab**

## Network + Sandbox Safety Model

- `codex` service is attached only to `llm_internal` (internal Docker network).
- `litellm` bridges `llm_internal` and `litellm_egress`.
- Result: Codex can reach LiteLLM, but has no direct internet/DNS egress.
- Codex sandbox is `workspace-write`; writes outside `/workspace` should fail.
- Container includes baked global skills at `/home/node/.codex/skills`.

## Known-Good Bringup

```bash
docker compose up -d litellm
docker compose build codex
docker compose run --rm codex
```

## Fast Safety Verification (before integration runs)

```bash
docker network inspect codex-game-lab_llm_internal --format '{{json .Internal}} {{json .Name}}'
docker compose run --rm --no-deps codex sh -lc "curl -sS http://litellm:4000/health/liveliness"
docker compose run --rm --no-deps codex sh -lc "curl -I -m 8 https://example.com || true"
```

Expected:

- network reports `true`
- liveliness returns `"I'm alive!"`
- public URL fails to resolve

## Codex Exec: Lessons Learned

1. Use explicit command form in compose runs:
   - `docker compose run --rm codex codex ...`
   - Avoid relying on `docker compose run SERVICE --help` behavior.
2. For deterministic provider selection in `codex exec`, pass config overrides:
   - `-c model_provider='"'"'local_litellm'"'"'`
   - `-c model='"'"'gpt-5-nano'"'"'`
   - `-c 'model_providers.local_litellm={name="Codex Game Lab LiteLLM",base_url="http://litellm:4000/v1",env_key="CUSTOM_LLM_API_KEY"}'`
3. Use `--full-auto` for execution-heavy runs so agent command flow is not blocked.
4. Run tests inside the codex container (host may not have Node/Playwright installed).

## Integration Demo Convention

For staged game demos, keep this structure:

- `demo/<game>/creation`
- `demo/<game>/balance`
- `demo/<game>/polish`
- `demo/<game>/prompts`
- `demo/<game>/logs`
- `demo/<game>/README.md`
- `demo/<game>/REPORT.md`

Also store:

- exact prompts used per stage (`*-used.md`)
- base prompt copies (`*-base.md`)
- codex JSON logs per stage (`NN-stage.jsonl`)

## Usage/Cost Reporting Convention

- Source of truth is `turn.completed.usage` in `codex exec --json` logs.
- Track at minimum:
  - `input_tokens`
  - `cached_input_tokens`
  - `output_tokens`
- Report two cost views:
  1. raw input billed (all input)
  2. non-cached input billed (`input - cached_input`)

## Naming + Docs Hygiene

1. Keep directory names consistent across root docs and demo docs.
2. Prefer one canonical path per demo; avoid creating similarly named duplicates.
3. If commands are meant for copy/paste, keep quoting simple and shell-safe.
4. If behavior differs from docs, update docs in the same change.

## Current Known Gap

- Dinosaur demo naming is split between `demo/dinosaur-jump` and `demo/dnosaur-jump`.
  - Do not introduce additional variants.
  - Consolidate to one canonical folder name when touching that area.

## Root Cause Notes (from integration logs)

1. Repeated model metadata warning came from using alias `default` in Codex.
   - Use `gpt-5-nano` alias in Codex config to avoid fallback metadata path.
2. Runtime npm install failures were due to isolated network egress + missing cache.
   - Image now pre-seeds npm cache and common JS toolchain.
3. Some runs saw npm permissions on `/root/.npm*` when shell user differed.
   - Container now runs as `node` with home at `/home/node`.
