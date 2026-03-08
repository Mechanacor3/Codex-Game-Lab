#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$ROOT/../.." && pwd)"
TMP_ROOT="${TMPDIR:-/tmp}/codex-game-lab-2048-cache-run"
TMP_LOGS="$TMP_ROOT/logs"
TMP_SNAPSHOTS="$TMP_ROOT/snapshots"

MODEL_ALIAS="gpt-5-nano-cached"
LITELLM_PROVIDER_CONFIG='model_providers.local_litellm={name="Codex Game Lab LiteLLM",base_url="http://litellm:4000/v1",env_key="CUSTOM_LLM_API_KEY"}'

mkdir -p "$ROOT"/{creation,balance,polish,prompts,logs} "$TMP_LOGS" "$TMP_SNAPSHOTS"

copy_prompts() {
  cp "$REPO_ROOT/demo/2048-run/prompts/01-core-used.md" "$ROOT/prompts/01-core-used.md"
  cp "$REPO_ROOT/demo/2048-run/prompts/02-balance-used.md" "$ROOT/prompts/02-balance-used.md"
  cp "$REPO_ROOT/demo/2048-run/prompts/03-polish-used.md" "$ROOT/prompts/03-polish-used.md"
  cp "$REPO_ROOT/demo/2048-run/prompts/01-core-base.md" "$ROOT/prompts/01-core-base.md"
  cp "$REPO_ROOT/demo/2048-run/prompts/02-balance-base.md" "$ROOT/prompts/02-balance-base.md"
  cp "$REPO_ROOT/demo/2048-run/prompts/03-polish-base.md" "$ROOT/prompts/03-polish-base.md"
}

set_proxy_mode() {
  local mode="$1"
  (cd "$REPO_ROOT" && RESPONSES_CACHE_PROXY_MODE="$mode" docker compose up -d --force-recreate responses-cache-proxy >/dev/null)
  for _ in $(seq 1 30); do
    if (cd "$REPO_ROOT" && docker exec -e EXPECTED_MODE="$mode" codex-game-lab-responses-cache-proxy-1 python -c 'import json, os, urllib.request; payload = json.loads(urllib.request.urlopen("http://127.0.0.1:8000/health/liveliness", timeout=2).read().decode("utf-8")); raise SystemExit(0 if payload.get("mode") == os.environ["EXPECTED_MODE"] else 1)' >/dev/null 2>&1); then
      return 0
    fi
    sleep 1
  done
  echo "Timed out waiting for responses-cache-proxy mode=$mode" >&2
  return 1
}

run_stage() {
  local stage="$1"
  local prompt_name="$2"
  local log_name="$3"
  (cd "$REPO_ROOT" && docker compose run --rm --no-deps codex codex exec --full-auto --skip-git-repo-check --json \
    -C "/workspace/demo/2048-cache-run/${stage}" \
    -c model_provider='local_litellm' \
    -c model="$MODEL_ALIAS" \
    -c "$LITELLM_PROVIDER_CONFIG" \
    - < "$ROOT/prompts/${prompt_name}" \
    > "$TMP_LOGS/${log_name}")
}

prepare_stage() {
  local stage="$1"
  local source="$2"
  if [ "$source" = "empty" ]; then
    restore_empty_stage "$stage"
    return 0
  fi
  restore_stage_from_snapshot "$stage" "$source"
}

run_stage_with_retry() {
  local stage="$1"
  local prompt_name="$2"
  local log_name="$3"
  local source="$4"
  local attempts="${5:-3}"

  for attempt in $(seq 1 "$attempts"); do
    prepare_stage "$stage" "$source"
    if run_stage "$stage" "$prompt_name" "$log_name"; then
      return 0
    fi
    if [ "$attempt" -lt "$attempts" ]; then
      echo "Retrying stage=$stage attempt=$((attempt + 1))/$attempts" >&2
    fi
  done

  echo "Stage failed after retries: $stage" >&2
  return 1
}

restore_empty_stage() {
  local stage="$1"
  rm -rf "$ROOT/$stage/game"
  mkdir -p "$ROOT/$stage"
}

restore_stage_from_snapshot() {
  local stage="$1"
  local snapshot_name="$2"
  rm -rf "$ROOT/$stage/game"
  mkdir -p "$ROOT/$stage"
  cp -a "$TMP_SNAPSHOTS/$snapshot_name" "$ROOT/$stage/game"
}

snapshot_stage_game() {
  local stage="$1"
  local snapshot_name="$2"
  rm -rf "$TMP_SNAPSHOTS/$snapshot_name"
  cp -a "$ROOT/$stage/game" "$TMP_SNAPSHOTS/$snapshot_name"
}

usage_field() {
  local log_path="$1"
  local field="$2"
  jq -r "select(.type==\"turn.completed\") | .usage.${field}" "$log_path" | tail -n 1
}

copy_logs_back() {
  cp "$TMP_LOGS"/*.jsonl "$ROOT/logs/"
}

clear_proxy_cache() {
  (cd "$REPO_ROOT" && docker exec codex-game-lab-redis-1 sh -lc "redis-cli --scan --pattern 'responses-cache-proxy:*' | xargs -r redis-cli DEL >/dev/null")
}

write_report() {
  local inner_before="$1"
  local inner_after_record="$2"
  local inner_after_replay="$3"
  cat > "$ROOT/REPORT.md" <<EOF
# Codex Game Lab 2048: Cached Integration Report

- Model alias used for both passes: \`$MODEL_ALIAS\`
- Record mode: exact cache write-through + history cache
- Replay mode: exact cache only (\`RESPONSES_CACHE_PROXY_MODE=replay_only\`)
- Logs:
  - \`demo/2048-cache-run/logs/01-core-record.jsonl\`
  - \`demo/2048-cache-run/logs/02-balance-record.jsonl\`
  - \`demo/2048-cache-run/logs/03-polish-record.jsonl\`
  - \`demo/2048-cache-run/logs/11-core-replay.jsonl\`
  - \`demo/2048-cache-run/logs/12-balance-replay.jsonl\`
  - \`demo/2048-cache-run/logs/13-polish-replay.jsonl\`

## Inner Model Calls

- \`gpt-5-nano\` rows before record: $inner_before
- \`gpt-5-nano\` rows after record: $inner_after_record
- \`gpt-5-nano\` rows after replay: $inner_after_replay
- Inner rows added during record: $((inner_after_record - inner_before))
- Inner rows added during replay: $((inner_after_replay - inner_after_record))

## Usage

| Stage | Pass | Input Tokens | Cached Input Tokens | Output Tokens |
| --- | --- | ---: | ---: | ---: |
| core | record | $(usage_field "$TMP_LOGS/01-core-record.jsonl" input_tokens) | $(usage_field "$TMP_LOGS/01-core-record.jsonl" cached_input_tokens) | $(usage_field "$TMP_LOGS/01-core-record.jsonl" output_tokens) |
| balance | record | $(usage_field "$TMP_LOGS/02-balance-record.jsonl" input_tokens) | $(usage_field "$TMP_LOGS/02-balance-record.jsonl" cached_input_tokens) | $(usage_field "$TMP_LOGS/02-balance-record.jsonl" output_tokens) |
| polish | record | $(usage_field "$TMP_LOGS/03-polish-record.jsonl" input_tokens) | $(usage_field "$TMP_LOGS/03-polish-record.jsonl" cached_input_tokens) | $(usage_field "$TMP_LOGS/03-polish-record.jsonl" output_tokens) |
| core | replay | $(usage_field "$TMP_LOGS/11-core-replay.jsonl" input_tokens) | $(usage_field "$TMP_LOGS/11-core-replay.jsonl" cached_input_tokens) | $(usage_field "$TMP_LOGS/11-core-replay.jsonl" output_tokens) |
| balance | replay | $(usage_field "$TMP_LOGS/12-balance-replay.jsonl" input_tokens) | $(usage_field "$TMP_LOGS/12-balance-replay.jsonl" cached_input_tokens) | $(usage_field "$TMP_LOGS/12-balance-replay.jsonl" output_tokens) |
| polish | replay | $(usage_field "$TMP_LOGS/13-polish-replay.jsonl" input_tokens) | $(usage_field "$TMP_LOGS/13-polish-replay.jsonl" cached_input_tokens) | $(usage_field "$TMP_LOGS/13-polish-replay.jsonl" output_tokens) |

EOF
}

write_readme() {
  cat > "$ROOT/README.md" <<'EOF'
# Codex Game Lab: 2048 Cached Integration Demo

This run demonstrates a two-pass staged Codex flow for 2048 using the Redis-backed responses proxy:

1. Record pass through `gpt-5-nano-cached`
2. Replay-only pass through the same LiteLLM model alias, with the proxy recreated in `replay_only` mode

Stage paths:

1. `demo/2048-cache-run/creation`
2. `demo/2048-cache-run/balance`
3. `demo/2048-cache-run/polish`

Prompts:

1. `demo/2048-cache-run/prompts/01-core-used.md`
2. `demo/2048-cache-run/prompts/02-balance-used.md`
3. `demo/2048-cache-run/prompts/03-polish-used.md`

See `demo/2048-cache-run/REPORT.md` for token usage and inner-model call counts.
EOF
}

copy_prompts
write_readme
rm -rf "$TMP_LOGS" "$TMP_SNAPSHOTS" "$ROOT/logs"
mkdir -p "$TMP_LOGS" "$TMP_SNAPSHOTS" "$ROOT/logs"

(cd "$REPO_ROOT" && docker compose up -d redis litellm responses-cache-proxy >/dev/null)
clear_proxy_cache

INNER_BEFORE=$(cd "$REPO_ROOT" && docker exec codex-game-lab-postgres-1 psql -U litellm -d litellm -At -c "select count(*) from \"LiteLLM_SpendLogs\" where model_group = 'gpt-5-nano';")

set_proxy_mode record
run_stage_with_retry creation 01-core-used.md 01-core-record.jsonl empty
snapshot_stage_game creation creation-game

run_stage_with_retry balance 02-balance-used.md 02-balance-record.jsonl creation-game
snapshot_stage_game balance balance-game

run_stage_with_retry polish 03-polish-used.md 03-polish-record.jsonl balance-game

INNER_AFTER_RECORD=$(cd "$REPO_ROOT" && docker exec codex-game-lab-postgres-1 psql -U litellm -d litellm -At -c "select count(*) from \"LiteLLM_SpendLogs\" where model_group = 'gpt-5-nano';")

set_proxy_mode replay_only
run_stage_with_retry creation 01-core-used.md 11-core-replay.jsonl empty

run_stage_with_retry balance 02-balance-used.md 12-balance-replay.jsonl creation-game

run_stage_with_retry polish 03-polish-used.md 13-polish-replay.jsonl balance-game

INNER_AFTER_REPLAY=$(cd "$REPO_ROOT" && docker exec codex-game-lab-postgres-1 psql -U litellm -d litellm -At -c "select count(*) from \"LiteLLM_SpendLogs\" where model_group = 'gpt-5-nano';")

copy_logs_back
write_report "$INNER_BEFORE" "$INNER_AFTER_RECORD" "$INNER_AFTER_REPLAY"

set_proxy_mode record

printf 'record_inner_added=%s\n' "$((INNER_AFTER_RECORD - INNER_BEFORE))"
printf 'replay_inner_added=%s\n' "$((INNER_AFTER_REPLAY - INNER_AFTER_RECORD))"
