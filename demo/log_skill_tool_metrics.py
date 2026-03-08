#!/usr/bin/env python3
"""Gross metrics for Codex JSONL logs: tool usage + skill usage signals."""

from __future__ import annotations

import argparse
import glob
import json
import re
import shlex
import sys
from collections import Counter
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Iterable


DEFAULT_GLOBS = [
    "demo/*-run/logs/*.jsonl",
    "runtime-logs/*.jsonl",
]

SKILL_KEYWORDS = [
    "skill",
    "playwright skill",
    "develop-web-game",
    "skill-installer",
    "skill-creator",
]

SKILL_PATH_RE = re.compile(
    r"(\.agents/skills|/\.codex/skills|/home/(user|node)/\.codex/skills|codex-skills|\$CODEX_HOME/skills|\$\{CODEX_HOME\}/skills|~/.codex/skills)"
)
SKILL_MD_RE = re.compile(r"SKILL\.md")
SKILL_SCRIPTS_RE = re.compile(r"(/|\\)scripts(/|\\)|\bscripts/")
SKILL_REFS_RE = re.compile(r"(/|\\)references(/|\\)|\breferences/")
SKILL_ASSETS_RE = re.compile(r"(/|\\)assets(/|\\)|\bassets/")

KNOWN_TOOLS = [
    "rg",
    "sed",
    "ls",
    "cat",
    "git",
    "npm",
    "node",
    "npx",
    "python",
    "python3",
    "curl",
    "find",
    "cp",
    "mv",
    "mkdir",
    "echo",
    "awk",
    "grep",
    "playwright",
    "codex",
    "jq",
]


@dataclass
class FileMetrics:
    path: str
    lines_total: int = 0
    lines_json_ok: int = 0
    lines_json_bad: int = 0
    command_items: int = 0
    event_types: Counter = field(default_factory=Counter)
    item_types: Counter = field(default_factory=Counter)
    tool_hits: Counter = field(default_factory=Counter)
    skill_keyword_hits: int = 0
    cmd_skill_path: int = 0
    out_skill_path: int = 0
    cmd_skill_md: int = 0
    out_skill_md: int = 0
    cmd_skill_scripts: int = 0
    cmd_skill_refs: int = 0
    cmd_skill_assets: int = 0

    def rule_read_skill_md(self) -> bool:
        return (self.cmd_skill_md + self.out_skill_md) > 0

    def rule_relative_paths(self) -> bool:
        return (self.cmd_skill_scripts + self.cmd_skill_refs + self.cmd_skill_assets) > 0

    def rule_refs_loaded(self) -> bool:
        return self.cmd_skill_refs > 0

    def rule_scripts_used(self) -> bool:
        return self.cmd_skill_scripts > 0

    def rule_assets_reused(self) -> bool:
        return self.cmd_skill_assets > 0

    def rule_any_skill_access(self) -> bool:
        return (self.cmd_skill_path + self.out_skill_path) > 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Summarize Codex JSONL log metrics for tools + skill usage."
    )
    parser.add_argument(
        "--glob",
        dest="globs",
        action="append",
        help="Glob pattern(s) for JSONL logs. Repeatable.",
    )
    parser.add_argument(
        "--json-out",
        default="",
        help="Optional path to write machine-readable JSON summary.",
    )
    return parser.parse_args()


def iter_files(globs: Iterable[str]) -> list[Path]:
    seen: set[str] = set()
    out: list[Path] = []
    for pattern in globs:
        for match in sorted(glob.glob(pattern)):
            if match not in seen:
                seen.add(match)
                out.append(Path(match))
    return out


def fields_from_obj(obj: dict) -> list[str]:
    fields: list[str] = []
    if isinstance(obj.get("message"), str):
        fields.append(obj["message"])
    item = obj.get("item")
    if isinstance(item, dict):
        for key in ("text", "command", "aggregated_output"):
            if isinstance(item.get(key), str):
                fields.append(item[key])
    err = obj.get("error")
    if isinstance(err, dict) and isinstance(err.get("message"), str):
        fields.append(err["message"])
    return fields


def extract_shell_body(command: str) -> str:
    # Many entries are "/bin/bash -lc '...'" ; extract inner script when possible.
    try:
        parts = shlex.split(command)
    except ValueError:
        return command
    for idx, token in enumerate(parts):
        if token in ("-lc", "-c") and idx + 1 < len(parts):
            return parts[idx + 1]
    return command


def count_tool_hits(script_text: str) -> Counter:
    hits: Counter = Counter()
    for tool in KNOWN_TOOLS:
        if re.search(rf"(?<![\w./-]){re.escape(tool)}(?![\w.-])", script_text):
            hits[tool] += 1
    return hits


def analyze_file(path: Path) -> FileMetrics:
    metrics = FileMetrics(path=str(path))
    with path.open("r", encoding="utf-8", errors="replace") as fh:
        for raw_line in fh:
            metrics.lines_total += 1
            line = raw_line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                metrics.lines_json_bad += 1
                continue
            metrics.lines_json_ok += 1

            evt_type = obj.get("type")
            if isinstance(evt_type, str):
                metrics.event_types[evt_type] += 1

            item = obj.get("item")
            if isinstance(item, dict) and isinstance(item.get("type"), str):
                metrics.item_types[item["type"]] += 1

            joined = "\n".join(fields_from_obj(obj))
            lowered = joined.lower()
            if any(keyword in lowered for keyword in SKILL_KEYWORDS):
                metrics.skill_keyword_hits += 1

            if SKILL_PATH_RE.search(joined):
                # Split path evidence into command/output buckets when possible.
                command = item.get("command") if isinstance(item, dict) else None
                output = item.get("aggregated_output") if isinstance(item, dict) else None
                if isinstance(command, str) and SKILL_PATH_RE.search(command):
                    metrics.cmd_skill_path += 1
                if isinstance(output, str) and SKILL_PATH_RE.search(output):
                    metrics.out_skill_path += 1

            command = item.get("command") if isinstance(item, dict) else None
            output = item.get("aggregated_output") if isinstance(item, dict) else None
            if isinstance(command, str):
                if SKILL_MD_RE.search(command):
                    metrics.cmd_skill_md += 1
                if SKILL_PATH_RE.search(command) and SKILL_SCRIPTS_RE.search(command):
                    metrics.cmd_skill_scripts += 1
                if SKILL_PATH_RE.search(command) and SKILL_REFS_RE.search(command):
                    metrics.cmd_skill_refs += 1
                if SKILL_PATH_RE.search(command) and SKILL_ASSETS_RE.search(command):
                    metrics.cmd_skill_assets += 1

            if isinstance(output, str) and SKILL_MD_RE.search(output):
                metrics.out_skill_md += 1

            if (
                evt_type == "item.completed"
                and isinstance(item, dict)
                and item.get("type") == "command_execution"
            ):
                metrics.command_items += 1
                cmd_text = item.get("command", "")
                if isinstance(cmd_text, str):
                    script_body = extract_shell_body(cmd_text)
                    metrics.tool_hits.update(count_tool_hits(script_body))
    return metrics


def bool_to_mark(value: bool) -> str:
    return "yes" if value else "no"


def print_report(files: list[FileMetrics]) -> None:
    total_events = Counter()
    total_item_types = Counter()
    total_tools = Counter()
    total_commands = 0
    total_skill_kw = 0
    total_cmd_skill_path = 0
    total_out_skill_path = 0
    total_skill_md = 0
    total_skill_scripts = 0
    total_skill_refs = 0
    total_skill_assets = 0

    for m in files:
        total_events.update(m.event_types)
        total_item_types.update(m.item_types)
        total_tools.update(m.tool_hits)
        total_commands += m.command_items
        total_skill_kw += m.skill_keyword_hits
        total_cmd_skill_path += m.cmd_skill_path
        total_out_skill_path += m.out_skill_path
        total_skill_md += m.cmd_skill_md + m.out_skill_md
        total_skill_scripts += m.cmd_skill_scripts
        total_skill_refs += m.cmd_skill_refs
        total_skill_assets += m.cmd_skill_assets

    print("== Codex Log Skill/Tool Metrics ==")
    print(f"logs_scanned: {len(files)}")
    print(f"command_items: {total_commands}")
    print("")
    print("Overall skill evidence")
    print(f"- skill_keyword_hits: {total_skill_kw}")
    print(f"- direct_skill_path_in_commands: {total_cmd_skill_path}")
    print(f"- direct_skill_path_in_outputs: {total_out_skill_path}")
    print(f"- skill_md_reads (cmd+output): {total_skill_md}")
    print(f"- skill_scripts_used: {total_skill_scripts}")
    print(f"- skill_references_used: {total_skill_refs}")
    print(f"- skill_assets_used: {total_skill_assets}")
    print("")
    print("Top tools (from command bodies)")
    for tool, count in total_tools.most_common(20):
        print(f"- {tool}: {count}")
    print("")
    print("Event types")
    for name, count in total_events.most_common():
        print(f"- {name}: {count}")
    print("")
    print("Item types")
    for name, count in total_item_types.most_common():
        print(f"- {name}: {count}")
    print("")
    print(
        "Per-log progressive-disclosure signals "
        "(read_skill_md, relative_paths, refs, scripts, assets, any_skill_path)"
    )
    for m in files:
        print(
            f"- {m.path}: "
            f"read_skill_md={bool_to_mark(m.rule_read_skill_md())}, "
            f"relative_paths={bool_to_mark(m.rule_relative_paths())}, "
            f"refs={bool_to_mark(m.rule_refs_loaded())}, "
            f"scripts={bool_to_mark(m.rule_scripts_used())}, "
            f"assets={bool_to_mark(m.rule_assets_reused())}, "
            f"any_skill_path={bool_to_mark(m.rule_any_skill_access())}, "
            f"command_items={m.command_items}"
        )


def to_json_dict(files: list[FileMetrics]) -> dict:
    return {
        "logs_scanned": len(files),
        "files": [
            {
                **asdict(m),
                "event_types": dict(m.event_types),
                "item_types": dict(m.item_types),
                "tool_hits": dict(m.tool_hits),
                "progressive_disclosure": {
                    "read_skill_md": m.rule_read_skill_md(),
                    "relative_paths": m.rule_relative_paths(),
                    "refs_loaded": m.rule_refs_loaded(),
                    "scripts_used": m.rule_scripts_used(),
                    "assets_reused": m.rule_assets_reused(),
                    "any_skill_path": m.rule_any_skill_access(),
                },
            }
            for m in files
        ],
    }


def main() -> int:
    args = parse_args()
    globs = args.globs or DEFAULT_GLOBS
    paths = iter_files(globs)
    if not paths:
        print("error: no JSONL files matched the provided globs", file=sys.stderr)
        return 1

    metrics = [analyze_file(path) for path in paths]
    print_report(metrics)

    if args.json_out:
        out = Path(args.json_out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(to_json_dict(metrics), indent=2), encoding="utf-8")
        print("")
        print(f"wrote_json: {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
