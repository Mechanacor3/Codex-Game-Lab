# Codex Game Lab 2048: Cached Integration Report

- Model alias used for both passes: `gpt-5-nano-cached`
- Record mode: exact cache write-through + history cache
- Replay mode: exact cache only (`RESPONSES_CACHE_PROXY_MODE=replay_only`)
- Logs:
  - `demo/2048-cache-run/logs/01-core-record.jsonl`
  - `demo/2048-cache-run/logs/02-balance-record.jsonl`
  - `demo/2048-cache-run/logs/03-polish-record.jsonl`
  - `demo/2048-cache-run/logs/11-core-replay.jsonl`
  - `demo/2048-cache-run/logs/12-balance-replay.jsonl`
  - `demo/2048-cache-run/logs/13-polish-replay.jsonl`

## Inner Model Calls

- `gpt-5-nano` rows before record: 152
- `gpt-5-nano` rows after record: 182
- `gpt-5-nano` rows after replay: 183
- Inner rows added during record: 30
- Inner rows added during replay: 1

## Usage

| Stage | Pass | Input Tokens | Cached Input Tokens | Output Tokens |
| --- | --- | ---: | ---: | ---: |
| core | record | 54382 | 32896 | 7218 |
| balance | record | 325564 | 296448 | 9785 |
| polish | record | 282124 | 252928 | 7587 |
| core | replay | 54382 | 32896 | 7218 |
| balance | replay | 325564 | 296448 | 9785 |
| polish | replay | 282124 | 252928 | 7587 |

