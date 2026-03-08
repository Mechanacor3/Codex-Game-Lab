import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.history import (
    build_history_items,
    build_metadata,
    build_request_cache_key,
    canonical_json,
    extract_completed_response,
    normalize_cacheable_input_items,
    normalize_input_items,
    normalize_tool_output_text,
)


class HistoryHelpersTest(unittest.TestCase):
    def test_normalize_string_input(self) -> None:
        self.assertEqual(
            normalize_input_items({"input": "secret"}),
            [{"role": "user", "content": "secret"}],
        )

    def test_normalize_list_input(self) -> None:
        payload = {"input": [{"role": "user", "content": "hello"}]}
        self.assertEqual(normalize_input_items(payload), payload["input"])

    def test_build_history_items(self) -> None:
        history = build_history_items(
            prior_items=[{"role": "user", "content": "old"}],
            current_input_items=[{"role": "user", "content": "new"}],
            response_output_items=[{"type": "message", "role": "assistant", "content": [{"type": "output_text", "text": "done"}]}],
        )
        self.assertEqual(len(history), 3)
        self.assertEqual(history[2]["role"], "assistant")

    def test_build_metadata(self) -> None:
        metadata = build_metadata({"owner": 7}, "resp_123")
        self.assertEqual(metadata["owner"], "7")
        self.assertEqual(metadata["cache_proxy"], "redis-history")
        self.assertEqual(metadata["cache_proxy_original_previous_response_id"], "resp_123")

    def test_extract_completed_response(self) -> None:
        event_block = 'data: {"type":"response.completed","response":{"id":"resp_123","output":[]}}\n\n'
        response = extract_completed_response(event_block)
        self.assertIsNotNone(response)
        self.assertEqual(response["id"], "resp_123")

    def test_canonical_json_sorts_dict_keys(self) -> None:
        payload = {"b": 2, "a": {"d": 4, "c": 3}}
        self.assertEqual(canonical_json(payload), '{"a":{"c":3,"d":4},"b":2}')

    def test_build_request_cache_key_ignores_dict_order(self) -> None:
        payload_a = {
            "model": "gpt-5-nano-cached",
            "input": [{"role": "user", "content": "hi"}],
            "stream": True,
            "prompt_cache_key": "abc",
        }
        payload_b = {
            "stream": True,
            "input": [{"content": "hi", "role": "user"}],
            "model": "gpt-5-nano-cached-only",
            "prompt_cache_key": "xyz",
            "previous_response_id": "resp_456",
        }
        payload_a["previous_response_id"] = "resp_123"
        self.assertEqual(build_request_cache_key(payload_a), build_request_cache_key(payload_b))

    def test_normalize_tool_output_text_strips_exec_metadata(self) -> None:
        output = "\n".join(
            [
                "Chunk ID: abc123",
                "Wall time: 0.1234 seconds",
                "Process exited with code 0",
                "Original token count: 50",
                "Output:",
                "",
                "hello",
                "",
                "",
                "world",
            ]
        )
        self.assertEqual(normalize_tool_output_text(output), "Output:\n\nhello\n\nworld")

    def test_normalize_cacheable_input_items_drops_transient_codex_items(self) -> None:
        items = [
            {"type": "message", "role": "developer", "content": [{"type": "input_text", "text": "sys"}]},
            {"type": "reasoning", "summary": [{"type": "summary_text", "text": "thinking"}], "encrypted_content": "blob"},
            {"type": "message", "role": "assistant", "content": [{"type": "output_text", "text": "planning"}]},
            {"type": "function_call", "name": "exec_command", "arguments": "{\"cmd\":\"echo hi\"}", "call_id": "call_1"},
            {"type": "function_call_output", "call_id": "call_1", "output": "Chunk ID: x\nOutput:\n\nhi\n"},
        ]
        self.assertEqual(
            normalize_cacheable_input_items(items),
            [
                {"type": "message", "role": "developer", "content": [{"type": "input_text", "text": "sys"}]},
                {"type": "function_call_output"},
            ],
        )


if __name__ == "__main__":
    unittest.main()
