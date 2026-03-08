from __future__ import annotations

import copy
import hashlib
import json
import re
from typing import TypeAlias, TypedDict, cast


JsonScalar: TypeAlias = str | int | float | bool | None
JsonValue: TypeAlias = JsonScalar | list["JsonValue"] | dict[str, "JsonValue"]
JsonObject: TypeAlias = dict[str, JsonValue]
JsonArray: TypeAlias = list[JsonValue]
InputItem: TypeAlias = JsonObject
ResponseOutputItem: TypeAlias = JsonObject


class CompletedResponseEvent(TypedDict):
    type: str
    response: JsonObject


def normalize_input_items(payload: JsonObject) -> list[InputItem]:
    raw_input = payload.get("input", payload.get("messages"))
    if raw_input is None:
        return []
    if isinstance(raw_input, str):
        return [{"role": "user", "content": raw_input}]
    if isinstance(raw_input, list):
        return cast(list[InputItem], copy.deepcopy(raw_input))
    if isinstance(raw_input, dict):
        return [cast(InputItem, copy.deepcopy(raw_input))]
    raise ValueError(f"Unsupported input payload type: {type(raw_input).__name__}")


def build_history_items(
    prior_items: list[InputItem],
    current_input_items: list[InputItem],
    response_output_items: list[ResponseOutputItem],
) -> list[JsonObject]:
    return cast(
        list[JsonObject],
        copy.deepcopy(prior_items) + copy.deepcopy(current_input_items) + copy.deepcopy(response_output_items),
    )


def build_metadata(existing: JsonValue, original_previous_response_id: str | None) -> dict[str, str]:
    metadata: dict[str, str] = {}
    if isinstance(existing, dict):
        for key, value in existing.items():
            if isinstance(key, str):
                metadata[key] = str(value)
    metadata["cache_proxy"] = "redis-history"
    if original_previous_response_id:
        metadata["cache_proxy_original_previous_response_id"] = original_previous_response_id
    return metadata


def canonical_json(value: JsonValue) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def normalize_tool_output_text(text: str) -> str:
    lines: list[str] = []
    for line in text.splitlines():
        if re.match(r"^(Chunk ID:|Wall time:|Process exited with code|Original token count:|Total output lines:)", line):
            continue
        lines.append(line.rstrip())
    normalized = "\n".join(lines)
    normalized = re.sub(r"\n{3,}", "\n\n", normalized)
    return normalized.strip()


def normalize_cacheable_input_items(items: list[JsonValue]) -> list[JsonValue]:
    normalized_items: list[JsonValue] = []
    for item in items:
        if not isinstance(item, dict):
            normalized_items.append(copy.deepcopy(item))
            continue

        item_type = item.get("type")
        role = item.get("role")

        # Codex includes transient internal planning items that change between identical reruns.
        if item_type == "reasoning":
            continue
        if item_type == "message" and role == "assistant":
            continue
        if item_type == "function_call":
            continue

        normalized = copy.deepcopy(item)
        if item_type == "function_call_output":
            normalized = {"type": "function_call_output"}
        normalized_items.append(normalized)
    return normalized_items


def build_cacheable_payload(payload: JsonObject) -> JsonObject:
    cacheable_payload = copy.deepcopy(payload)
    cacheable_payload.pop("model", None)
    cacheable_payload.pop("prompt_cache_key", None)
    cacheable_payload.pop("previous_response_id", None)
    raw_input = cacheable_payload.get("input")
    if isinstance(raw_input, list):
        cacheable_payload["input"] = normalize_cacheable_input_items(raw_input)
    return cacheable_payload


def build_request_cache_key(payload: JsonObject) -> str:
    cacheable_payload = build_cacheable_payload(payload)
    digest = hashlib.sha256(canonical_json(cacheable_payload).encode("utf-8")).hexdigest()
    return digest


def extract_completed_response(event_block: str) -> JsonObject | None:
    data_lines = [line[5:].strip() for line in event_block.splitlines() if line.startswith("data:")]
    if not data_lines:
        return None
    data = "\n".join(data_lines)
    if data == "[DONE]":
        return None
    event = cast(CompletedResponseEvent, json.loads(data))
    if event.get("type") != "response.completed":
        return None
    response = event.get("response")
    return response if isinstance(response, dict) else None
