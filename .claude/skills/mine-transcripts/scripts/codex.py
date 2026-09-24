"""Codex reader: streams ~/.codex/sessions/YYYY/MM/DD/*.jsonl (and archived_sessions) into Thread records.

Every line starts {"timestamp":..,"ordinal":..,"type":..,"payload":{"type":..}, so the head
is matched with a regex and only the few line types the reports need are JSON-parsed.
Tool outputs, reasoning and compaction lines (most of the bytes) are never parsed.
"""

import json
import os
import re
from collections import Counter

from common import CODEX_HOME, DEF_PATH_RE, PLUGIN_PATH_RE, Thread, local_scope, ts_of

HEAD_RE = re.compile(rb'\{"timestamp":"([^"]+)",(?:"ordinal":(\d+),)?"type":"(\w+)"(?:,"payload":\{"type":"(\w+)")?')
NAME_RE = re.compile(r"<name>([^<]+)</name>")
# The desktop app wraps a typed prompt in ambient UI state; the prompt follows "## My request:".
AMBIENT_RE = re.compile(r"<in-app-browser-context\b.*?</in-app-browser-context>\s*(?:## My request:\s*)?", re.S)
PATH_RE = re.compile(r"<path>([^<]+)</path>")
# From workbench 0.42.0 a workbench agent's spawn message opens with this header (using-workbench,
# "Workbench agents on Codex"), which names the agent exactly.
CONTRACT_RE = re.compile(r"\s*You are the (?:[\w.-]+:)?([\w.-]+?)\. Your contract:")


def _load(raw):
    """Parse one line; a line still being written by a live session parses as empty."""
    try:
        d = json.loads(raw)
    except ValueError:
        return {}
    return d if isinstance(d, dict) else {}


def transcript_files(window):
    seen = set()
    for base in (os.path.join(CODEX_HOME, "sessions"), os.path.join(CODEX_HOME, "archived_sessions")):
        for d, _, files in os.walk(base):
            for f in sorted(files):
                fp = os.path.join(d, f)
                if f.endswith(".jsonl") and f not in seen and os.path.getmtime(fp) >= window.start:
                    seen.add(f)
                    yield fp


def scan(window, keep_text=False):
    threads = []
    for path in transcript_files(window):
        th = _scan_file(path, window, keep_text)
        if th is not None and th.first is not None:
            threads.append(th)
    return threads


def _origin(source):
    if isinstance(source, str):
        return "main"
    sub = (source or {}).get("subagent") if isinstance(source, dict) else None
    if isinstance(sub, dict) and sub.get("other") == "guardian":
        return "guardian"
    return "sub"


def _scan_file(path, window, keep_text):
    with open(path, "rb") as fh:
        meta = _load(fh.readline())
        if meta.get("type") != "session_meta":
            return None
        p = meta.get("payload") or {}
        th = Thread("codex", p.get("id") or os.path.basename(path), _origin(p.get("source")))
        th.parent = p.get("parent_thread_id")
        th.cwd = p.get("cwd")
        th.name = (p.get("agent_path") or "").rsplit("/", 1)[-1]
        th.automated = p.get("source") == "exec"
        start_ordinal = p.get("subagent_history_start_ordinal")
        tokens_before = tokens_last = None
        for i, raw in enumerate(fh, 1):
            m = HEAD_RE.match(raw, 0, 300)
            if not m:
                continue
            ordinal = int(m.group(2)) if m.group(2) else i
            if start_ordinal is not None and ordinal < start_ordinal:
                continue  # history copied from the parent into a forked subagent
            ts = ts_of(m.group(1).decode())
            kind, ptype = m.group(3), m.group(4)
            if kind == b"event_msg" and ptype == b"token_count":
                if ts is not None and ts < window.start:
                    tokens_before = raw
                elif ts in window:
                    tokens_last = raw
                continue
            if ts not in window:
                continue
            if kind == b"event_msg":
                if ptype == b"task_started" and th.origin != "main":
                    th.start_round(ts, "initial" if not th.rounds else "followup")
                elif ptype in (b"task_complete", b"turn_aborted"):
                    th.touch(ts)
                    th.round_open = False
                    if ptype == b"turn_aborted" and b'"interrupted"' in raw:
                        th.interrupts.append(ts)
                    continue
            elif kind == b"response_item":
                if ptype in (b"function_call", b"custom_tool_call") and (b"SKILL.md" in raw or b"/agents/" in raw):
                    _tool_call(th, raw, ts)
                elif ptype == b"message" and b'"role":"user"' in raw[:400]:
                    _user_message(th, raw, ts, keep_text)
            elif kind == b"turn_context":
                model = (_load(raw).get("payload") or {}).get("model")
                if model:
                    th.models[model] += 1
            th.touch(ts)
        th.tokens = _token_delta(tokens_before, tokens_last)
    return th


def _tool_call(th, raw, ts):
    p = _load(raw).get("payload") or {}
    args = p.get("arguments") or p.get("input") or ""
    if not isinstance(args, str):
        args = json.dumps(args)
    for path in DEF_PATH_RE.findall(args):
        th.note_definition(path, ts, th.cwd)


def _user_message(th, raw, ts, keep_text):
    p = _load(raw).get("payload") or {}
    kinds = (p.get("internal_chat_message_metadata_passthrough") or {}).get("content_item_kinds") or []
    texts = [c.get("text", "") for c in p.get("content") or [] if isinstance(c, dict)]
    if "skills.selected_skill_instructions" in kinds:
        for t in texts:
            name, path = NAME_RE.search(t), PATH_RE.search(t)
            if not name:
                continue
            name, path = name.group(1).strip(), path.group(1).strip() if path else ""
            m = PLUGIN_PATH_RE.search(path)
            if m:
                th.versions.append((ts, m.group(1), m.group(2), "skills", m.group(4)))
            qualified = name if ":" in name else f"{local_scope(path, th.cwd) if path else 'project'}:{name}"
            th.skills.append((ts, qualified, "user"))
        return
    if th.origin != "main":
        if th.contract is None:
            m = CONTRACT_RE.match("\n".join(texts))
            th.contract = m.group(1) if m else None
        return
    text = AMBIENT_RE.sub("", "\n".join(texts)).strip()
    human = kinds and all(k == "user.text" for k in kinds)
    legacy = not kinds and texts and not texts[0].startswith("# AGENTS.md")
    # A text that still opens with a tag is machine-sent: <heartbeat> automations, picker replies.
    if (human or legacy) and text and not text.startswith("<"):
        th.note_prompt(ts, text, keep_text)


def _token_delta(before, last):
    def total(raw):
        if raw is None:
            return {}
        info = (_load(raw).get("payload") or {}).get("info") or {}
        return info.get("total_token_usage") or {}

    a, b = total(before), total(last)
    u = {k: (b.get(k) or 0) - (a.get(k) or 0) for k in b}  # counts are cumulative per thread
    cached = u.get("cached_input_tokens") or 0
    return Counter({
        "input": max(0, (u.get("input_tokens") or 0) - cached),
        "cache_read": cached,
        "cache_write": u.get("cache_write_input_tokens") or 0,
        "output": u.get("output_tokens") or 0,
    })
