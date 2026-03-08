import copy
import json
import os
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, Response, StreamingResponse
from redis.asyncio import Redis

from app.history import (
    build_cacheable_payload,
    build_history_items,
    build_metadata,
    build_request_cache_key,
    extract_completed_response,
    normalize_input_items,
)


REDIS_URL = os.environ["RESPONSES_CACHE_PROXY_REDIS_URL"]
INNER_BASE_URL = os.environ["RESPONSES_CACHE_PROXY_INNER_BASE_URL"].rstrip("/")
INNER_API_KEY = os.environ["RESPONSES_CACHE_PROXY_INNER_API_KEY"]
INNER_MODEL = os.environ["RESPONSES_CACHE_PROXY_INNER_MODEL"]
PROXY_MODEL_NAME = os.environ.get("RESPONSES_CACHE_PROXY_MODEL_NAME", INNER_MODEL)
PROXY_API_KEY = os.environ["RESPONSES_CACHE_PROXY_API_KEY"]
HISTORY_TTL_SECONDS = int(os.environ.get("RESPONSES_CACHE_PROXY_HISTORY_TTL_SECONDS", "604800"))
PROXY_MODE = os.environ.get("RESPONSES_CACHE_PROXY_MODE", "record").strip().lower()

HISTORY_KEY_PREFIX = "responses-cache-proxy:history"
EXACT_KEY_PREFIX = "responses-cache-proxy:exact"
RESPONSE_KEY_PREFIX = "responses-cache-proxy:response"
MISS_KEY_PREFIX = "responses-cache-proxy:miss"

app = FastAPI(title="Responses Cache Proxy")


def _history_key(response_id: str) -> str:
    return f"{HISTORY_KEY_PREFIX}:{response_id}"


def _exact_key(payload: dict[str, Any]) -> str:
    return f"{EXACT_KEY_PREFIX}:{build_request_cache_key(payload)}"


def _response_key(response_id: str) -> str:
    return f"{RESPONSE_KEY_PREFIX}:{response_id}"


def _miss_key() -> str:
    return MISS_KEY_PREFIX


def _require_bearer(request: Request) -> None:
    auth_header = request.headers.get("authorization", "")
    expected = f"Bearer {PROXY_API_KEY}"
    if auth_header != expected:
        raise HTTPException(status_code=401, detail="Invalid proxy API key")


def _mode_allows_upstream() -> bool:
    return PROXY_MODE in {"record", "record_and_replay", "write_through"}


def _cache_headers(hit_type: str, content_type: str) -> dict[str, str]:
    return {
        "content-type": content_type,
        "x-cache-proxy-mode": PROXY_MODE,
        "x-cache-proxy-hit": hit_type,
    }


def _build_forward_payload(payload: dict[str, Any], prior_items: list[Any] | None) -> tuple[dict[str, Any], list[Any]]:
    current_input_items = normalize_input_items(payload)
    forward_payload = copy.deepcopy(payload)
    forward_payload["model"] = INNER_MODEL
    forward_payload["metadata"] = build_metadata(
        forward_payload.get("metadata"),
        payload.get("previous_response_id"),
    )
    forward_payload.pop("previous_response_id", None)
    forward_payload.pop("messages", None)
    if prior_items is not None:
        forward_payload["input"] = copy.deepcopy(prior_items) + copy.deepcopy(current_input_items)
    return forward_payload, current_input_items


async def _load_history(redis: Redis, response_id: str) -> list[Any] | None:
    raw_value = await redis.get(_history_key(response_id))
    if raw_value is None:
        return None
    cached = json.loads(raw_value)
    items = cached.get("items")
    return items if isinstance(items, list) else None


async def _store_history(
    redis: Redis,
    response_id: str,
    prior_items: list[Any],
    current_input_items: list[Any],
    response_body: dict[str, Any],
) -> None:
    output_items = response_body.get("output", [])
    if not isinstance(output_items, list):
        output_items = []
    history_items = build_history_items(prior_items, current_input_items, output_items)
    cache_value = {
        "items": history_items,
        "response_id": response_id,
    }
    await redis.set(_history_key(response_id), json.dumps(cache_value), ex=HISTORY_TTL_SECONDS)


async def _store_response_body(redis: Redis, response_body: dict[str, Any]) -> None:
    response_id = response_body.get("id")
    if not isinstance(response_id, str) or not response_id:
        return
    await redis.set(_response_key(response_id), json.dumps(response_body), ex=HISTORY_TTL_SECONDS)


async def _load_response_body(redis: Redis, response_id: str) -> dict[str, Any] | None:
    raw_value = await redis.get(_response_key(response_id))
    if raw_value is None:
        return None
    cached = json.loads(raw_value)
    return cached if isinstance(cached, dict) else None


async def _store_exact_json(redis: Redis, payload: dict[str, Any], response_body: dict[str, Any]) -> None:
    cache_value = {
        "kind": "json",
        "status_code": 200,
        "content_type": "application/json",
        "body": response_body,
        "response_id": response_body.get("id"),
        "request_payload": payload,
        "request_cache_key": build_request_cache_key(payload),
    }
    await redis.set(_exact_key(payload), json.dumps(cache_value), ex=HISTORY_TTL_SECONDS)


async def _store_exact_stream(
    redis: Redis,
    payload: dict[str, Any],
    stream_text: str,
    completed_response: dict[str, Any] | None,
) -> None:
    cache_value = {
        "kind": "stream",
        "status_code": 200,
        "content_type": "text/event-stream",
        "body": stream_text,
        "response_id": completed_response.get("id") if isinstance(completed_response, dict) else None,
        "request_payload": payload,
        "request_cache_key": build_request_cache_key(payload),
    }
    await redis.set(_exact_key(payload), json.dumps(cache_value), ex=HISTORY_TTL_SECONDS)


async def _load_exact(redis: Redis, payload: dict[str, Any]) -> dict[str, Any] | None:
    raw_value = await redis.get(_exact_key(payload))
    if raw_value is None:
        return None
    cached = json.loads(raw_value)
    return cached if isinstance(cached, dict) else None


async def _store_miss(redis: Redis, payload: dict[str, Any]) -> None:
    miss_value = {
        "raw_payload": payload,
        "cacheable_payload": build_cacheable_payload(payload),
        "cache_key": build_request_cache_key(payload),
    }
    await redis.set(_miss_key(), json.dumps(miss_value), ex=HISTORY_TTL_SECONDS)


def _upstream_headers() -> dict[str, str]:
    return {
        "authorization": f"Bearer {INNER_API_KEY}",
        "content-type": "application/json",
    }


def _proxy_response(upstream: httpx.Response) -> Response:
    content_type = upstream.headers.get("content-type", "application/json")
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers={"content-type": content_type},
    )


def _response_from_exact(cached: dict[str, Any]) -> Response:
    kind = cached.get("kind")
    content_type = str(cached.get("content_type", "application/json"))
    if kind == "json":
        body = cached.get("body")
        if not isinstance(body, dict):
            raise HTTPException(status_code=500, detail="Cached JSON response is malformed")
        return JSONResponse(
            content=body,
            status_code=int(cached.get("status_code", 200)),
            headers=_cache_headers("exact", content_type),
        )
    if kind == "stream":
        stream_text = cached.get("body")
        if not isinstance(stream_text, str):
            raise HTTPException(status_code=500, detail="Cached stream response is malformed")

        async def replay_stream() -> Any:
            yield stream_text.encode("utf-8")

        return StreamingResponse(
            replay_stream(),
            status_code=int(cached.get("status_code", 200)),
            media_type=content_type,
            headers=_cache_headers("exact", content_type),
        )
    raise HTTPException(status_code=500, detail="Unsupported cached response kind")


def _build_synthetic_stream_text(response_body: dict[str, Any]) -> str:
    created_event = json.dumps({"type": "response.created", "response": response_body}, ensure_ascii=False)
    completed_event = json.dumps({"type": "response.completed", "response": response_body}, ensure_ascii=False)
    return f"data: {created_event}\n\ndata: {completed_event}\n\ndata: [DONE]\n\n"


@app.on_event("startup")
async def startup() -> None:
    app.state.redis = Redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
    app.state.client = httpx.AsyncClient(timeout=None)


@app.on_event("shutdown")
async def shutdown() -> None:
    await app.state.client.aclose()
    await app.state.redis.aclose()


@app.get("/health/liveliness")
async def liveliness() -> JSONResponse:
    await app.state.redis.ping()
    return JSONResponse(content={"status": "ok", "mode": PROXY_MODE})


@app.get("/v1/models")
async def list_models(request: Request) -> JSONResponse:
    _require_bearer(request)
    return JSONResponse(
        content={
            "object": "list",
            "data": [
                {
                    "id": PROXY_MODEL_NAME,
                    "object": "model",
                    "owned_by": "responses-cache-proxy",
                }
            ],
        }
    )


@app.post("/v1/responses")
async def create_response(request: Request) -> Response:
    _require_bearer(request)
    payload = await request.json()
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Request body must be a JSON object")

    redis: Redis = app.state.redis
    cached_exact = await _load_exact(redis, payload)
    if cached_exact is not None:
        return _response_from_exact(cached_exact)

    if not _mode_allows_upstream():
        await _store_miss(redis, payload)
        raise HTTPException(status_code=404, detail="No exact cached response found for request in replay-only mode")

    previous_response_id = payload.get("previous_response_id")
    prior_items: list[Any] = []
    if previous_response_id is not None:
        if not isinstance(previous_response_id, str) or not previous_response_id:
            raise HTTPException(status_code=400, detail="previous_response_id must be a non-empty string")
        cached_items = await _load_history(redis, previous_response_id)
        if cached_items is None:
            raise HTTPException(
                status_code=404,
                detail=f"No cached history found for previous_response_id={previous_response_id}",
            )
        prior_items = cached_items

    try:
        forward_payload, current_input_items = _build_forward_payload(payload, prior_items if previous_response_id else None)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    client: httpx.AsyncClient = app.state.client
    if payload.get("stream") is True:
        if payload.get("tools"):
            upstream_request = client.build_request(
                "POST",
                f"{INNER_BASE_URL}/responses",
                headers=_upstream_headers(),
                json=forward_payload,
            )
            upstream = await client.send(upstream_request, stream=True)
            if upstream.status_code >= 400:
                try:
                    error_response = await upstream.aread()
                finally:
                    await upstream.aclose()
                return Response(
                    content=error_response,
                    status_code=upstream.status_code,
                    headers={"content-type": upstream.headers.get("content-type", "application/json")},
                )

            async def stream_events() -> Any:
                completed_response: dict[str, Any] | None = None
                recorded_chunks: list[str] = []
                buffer = ""
                try:
                    async for chunk in upstream.aiter_bytes():
                        text_chunk = chunk.decode("utf-8")
                        recorded_chunks.append(text_chunk)
                        buffer += text_chunk
                        while "\n\n" in buffer:
                            event_block, buffer = buffer.split("\n\n", 1)
                            maybe_response = extract_completed_response(event_block)
                            if maybe_response is not None:
                                completed_response = maybe_response
                            yield (event_block + "\n\n").encode("utf-8")
                    if buffer:
                        recorded_chunks.append(buffer)
                        maybe_response = extract_completed_response(buffer)
                        if maybe_response is not None:
                            completed_response = maybe_response
                        yield buffer.encode("utf-8")
                except httpx.ReadError:
                    if completed_response is None:
                        raise
                finally:
                    await upstream.aclose()
                    if completed_response is not None and isinstance(completed_response.get("id"), str):
                        await _store_history(
                            redis=redis,
                            response_id=completed_response["id"],
                            prior_items=prior_items,
                            current_input_items=current_input_items,
                            response_body=completed_response,
                        )
                        await _store_response_body(redis, completed_response)
                    await _store_exact_stream(
                        redis=redis,
                        payload=payload,
                        stream_text="".join(recorded_chunks),
                        completed_response=completed_response,
                    )

            return StreamingResponse(stream_events(), media_type="text/event-stream")

        non_stream_payload = copy.deepcopy(forward_payload)
        non_stream_payload["stream"] = False
        upstream = await client.post(
            f"{INNER_BASE_URL}/responses",
            headers=_upstream_headers(),
            json=non_stream_payload,
        )
        if upstream.status_code >= 400:
            return _proxy_response(upstream)

        response_body = upstream.json()
        if isinstance(response_body.get("id"), str):
            await _store_history(
                redis=redis,
                response_id=response_body["id"],
                prior_items=prior_items,
                current_input_items=current_input_items,
                response_body=response_body,
            )
            await _store_response_body(redis, response_body)

        stream_text = _build_synthetic_stream_text(response_body)
        await _store_exact_stream(
            redis=redis,
            payload=payload,
            stream_text=stream_text,
            completed_response=response_body,
        )

        async def replay_stream() -> Any:
            yield stream_text.encode("utf-8")

        return StreamingResponse(
            replay_stream(),
            media_type="text/event-stream",
            headers=_cache_headers("synthetic", "text/event-stream"),
        )

    upstream = await client.post(
        f"{INNER_BASE_URL}/responses",
        headers=_upstream_headers(),
        json=forward_payload,
    )
    if upstream.status_code >= 400:
        return _proxy_response(upstream)

    response_body = upstream.json()
    if isinstance(response_body.get("id"), str):
        await _store_history(
            redis=redis,
            response_id=response_body["id"],
            prior_items=prior_items,
            current_input_items=current_input_items,
            response_body=response_body,
        )
        await _store_response_body(redis, response_body)
    await _store_exact_json(redis, payload, response_body)
    return JSONResponse(content=response_body, status_code=upstream.status_code)


async def _passthrough(request: Request, method: str, path: str) -> Response:
    _require_bearer(request)
    client: httpx.AsyncClient = app.state.client
    upstream = await client.request(
        method,
        f"{INNER_BASE_URL}{path}",
        headers={"authorization": f"Bearer {INNER_API_KEY}"},
        params=request.query_params,
    )
    return _proxy_response(upstream)


@app.get("/v1/responses/{response_id}")
async def get_response(response_id: str, request: Request) -> Response:
    _require_bearer(request)
    cached = await _load_response_body(app.state.redis, response_id)
    if cached is not None:
        return JSONResponse(
            content=cached,
            headers=_cache_headers("response-id", "application/json"),
        )
    if not _mode_allows_upstream():
        raise HTTPException(status_code=404, detail=f"No cached response found for response_id={response_id}")
    return await _passthrough(request, "GET", f"/responses/{response_id}")


@app.get("/v1/responses/{response_id}/input_items")
async def get_response_input_items(response_id: str, request: Request) -> Response:
    _require_bearer(request)
    cached_items = await _load_history(app.state.redis, response_id)
    if cached_items is not None:
        return JSONResponse(
            content={"object": "list", "data": cached_items},
            headers=_cache_headers("history", "application/json"),
        )
    if not _mode_allows_upstream():
        raise HTTPException(status_code=404, detail=f"No cached input items found for response_id={response_id}")
    return await _passthrough(request, "GET", f"/responses/{response_id}/input_items")
