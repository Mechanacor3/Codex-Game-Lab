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
