#!/usr/bin/env python3
"""Generate token and cost report for the exact demo prompt."""

import argparse
import datetime as dt
import json
import os
import time
import sys
import urllib.error
import urllib.request
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--prompt-file", default="demo/prompt.md")
    parser.add_argument("--base-url", default=os.environ.get("DEMO_BASE_URL", "http://localhost:28789/v1"))
    parser.add_argument("--model", default=os.environ.get("DEMO_MODEL", "default"))
    parser.add_argument("--api-key", default=os.environ.get("CUSTOM_LLM_API_KEY", "dummy"))
    parser.add_argument("--input-cost-per-1m", type=float, default=float(os.environ.get("INPUT_COST_PER_1M", "0")))
    parser.add_argument("--output-cost-per-1m", type=float, default=float(os.environ.get("OUTPUT_COST_PER_1M", "0")))
    parser.add_argument("--scenarios", default=os.environ.get("OUTPUT_TOKEN_SCENARIOS", "256,512,1024"))
    parser.add_argument("--probe-max-tokens", type=int, default=64)
    parser.add_argument("--write-md", default="demo/REPORT.md")
    return parser.parse_args()


def parse_scenarios(raw: str) -> list[int]:
    vals: list[int] = []
    for part in raw.split(","):
        token_count = int(part.strip())
        if token_count < 0:
            raise ValueError("Scenario token counts must be >= 0")
        vals.append(token_count)
    if not vals:
        raise ValueError("At least one scenario is required")
    return vals


def chat_probe(base_url: str, model: str, api_key: str, prompt: str, probe_max_tokens: int) -> tuple[int, int]:
    url = base_url.rstrip("/") + "/chat/completions"
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": probe_max_tokens,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    body = ""
    last_exc: Exception | None = None
    for _ in range(8):
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                body = resp.read().decode("utf-8")
            last_exc = None
            break
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"HTTP {exc.code} from provider: {detail}") from exc
        except (urllib.error.URLError, ConnectionError, OSError) as exc:
            last_exc = exc
            time.sleep(1)
    if last_exc is not None:
        raise RuntimeError(f"Provider connection failed after retries: {last_exc}") from last_exc

    parsed = json.loads(body)
    usage = parsed.get("usage", {})
    prompt_tokens = usage.get("prompt_tokens")
    completion_tokens = usage.get("completion_tokens")
    if prompt_tokens is None or completion_tokens is None:
        raise RuntimeError(f"Provider response missing usage tokens: {body}")
    return int(prompt_tokens), int(completion_tokens)


def cost_usd(tokens: int, usd_per_1m: float) -> float:
    return (tokens / 1_000_000.0) * usd_per_1m


def render_report(
    *,
    now_utc: str,
    prompt_path: Path,
    prompt_text: str,
    base_url: str,
    model: str,
    input_cost_per_1m: float,
    output_cost_per_1m: float,
    prompt_tokens: int,
    probe_completion_tokens: int,
    scenarios: list[int],
    probe_max_tokens: int,
) -> str:
    lines: list[str] = []
    lines.append("# Codex Game Lab Demo: Prompt, Tokens, and Cost")
    lines.append("")
    lines.append(f"- Generated (UTC): `{now_utc}`")
    lines.append(f"- Prompt file: `{prompt_path.as_posix()}`")
    lines.append(f"- Provider URL: `{base_url}`")
    lines.append(f"- Model alias: `{model}`")
    lines.append(f"- Input cost / 1M tokens: `${input_cost_per_1m:.6f}`")
    lines.append(f"- Output cost / 1M tokens: `${output_cost_per_1m:.6f}`")
    lines.append("")
    lines.append("## Exact Prompt")
    lines.append("")
    lines.append("```md")
    lines.append(prompt_text.rstrip("\n"))
    lines.append("```")
    lines.append("")
    lines.append("## Measured Tokens (provider usage)")
    lines.append("")
    lines.append(f"- Prompt tokens: `{prompt_tokens}`")
    lines.append(f"- Probe completion tokens (`max_tokens={probe_max_tokens}`): `{probe_completion_tokens}`")
    lines.append("")
    lines.append("## Estimated Cost by Output Scenario")
    lines.append("")
    lines.append("| Output tokens | Input cost (USD) | Output cost (USD) | Total (USD) |")
    lines.append("|---:|---:|---:|---:|")
    for output_tokens in scenarios:
        in_cost = cost_usd(prompt_tokens, input_cost_per_1m)
        out_cost = cost_usd(output_tokens, output_cost_per_1m)
        total = in_cost + out_cost
        lines.append(f"| {output_tokens} | ${in_cost:.6f} | ${out_cost:.6f} | ${total:.6f} |")
    lines.append("")
    lines.append("## Probe Request Cost")
    probe_input_cost = cost_usd(prompt_tokens, input_cost_per_1m)
    probe_output_cost = cost_usd(probe_completion_tokens, output_cost_per_1m)
    probe_total = probe_input_cost + probe_output_cost
    lines.append("")
    lines.append(f"- Probe input cost: `${probe_input_cost:.6f}`")
    lines.append(f"- Probe output cost: `${probe_output_cost:.6f}`")
    lines.append(f"- Probe total: `${probe_total:.6f}`")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    args = parse_args()
    prompt_path = Path(args.prompt_file)
    prompt_text = prompt_path.read_text(encoding="utf-8")
    scenarios = parse_scenarios(args.scenarios)
    prompt_tokens, probe_completion_tokens = chat_probe(
        args.base_url, args.model, args.api_key, prompt_text, args.probe_max_tokens
    )
    now_utc = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    report = render_report(
        now_utc=now_utc,
        prompt_path=prompt_path,
        prompt_text=prompt_text,
        base_url=args.base_url,
        model=args.model,
        input_cost_per_1m=args.input_cost_per_1m,
        output_cost_per_1m=args.output_cost_per_1m,
        prompt_tokens=prompt_tokens,
        probe_completion_tokens=probe_completion_tokens,
        scenarios=scenarios,
        probe_max_tokens=args.probe_max_tokens,
    )
    out_path = Path(args.write_md)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(report, encoding="utf-8")
    print(f"Wrote {out_path}")
    print(f"Prompt tokens: {prompt_tokens}")
    print(f"Probe completion tokens: {probe_completion_tokens}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pylint: disable=broad-except
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
