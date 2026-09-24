"""Claude Code reader: streams ~/.claude/projects/**.jsonl into Thread records.

Layout (see ../transcript-formats.md):
  <projects>/<slug>/<session>.jsonl                                  main session
  <projects>/<slug>/<session>/subagents/agent-<id>.jsonl (+ .meta.json)  direct subagent
  <projects>/<slug>/<session>/subagents/workflows/<run>/agent-<id>.jsonl workflow agent
"""

import json
import os
import re

from common import CLAUDE_HOME, DEF_PATH_RE, PLUGIN_PATH_RE, Thread, local_scope, ts_of

SKILL_BASE = "Base directory for this skill:"
COORDINATOR = "The coordinator sent a message"
CMD_RE = re.compile(r"<command-name>/?([^<]+)</command-name>")
REJECT_RE = re.compile(r"doesn't want to proceed|tool use was rejected", re.I)
NOT_HUMAN_PREFIXES = ("<task-notification", "<local-command", "Caveat:", "<command-", "<system-reminder")


def _text(content):
    if isinstance(content, str):
        return content
    return "\n".join(b.get("text", "") for b in content or [] if isinstance(b, dict) and b.get("type") == "text")


def _result_text(block):
    c = block.get("content")
    if isinstance(c, str):
        return c
    return "\n".join(x.get("text", "") for x in c or [] if isinstance(x, dict))


def transcript_files(window):
    """Yield (path, origin, session_id, workflow_run) for files touched since the window start."""
    root = os.path.join(CLAUDE_HOME, "projects")
    if not os.path.isdir(root):
        return
    for slug in sorted(os.listdir(root)):
        pdir = os.path.join(root, slug)
        if not os.path.isdir(pdir):
            continue
        for entry in sorted(os.listdir(pdir)):
            path = os.path.join(pdir, entry)
            if entry.endswith(".jsonl") and os.path.getmtime(path) >= window.start:
                yield path, "main", entry[:-6], None
            sub = os.path.join(path, "subagents")
            if not os.path.isdir(sub):
                continue
            for base, _, files in os.walk(sub):
                rel = os.path.relpath(base, sub).split(os.sep)
                run = rel[1] if len(rel) > 1 and rel[0] == "workflows" else None
                for f in files:
                    fp = os.path.join(base, f)
                    if f.startswith("agent-") and f.endswith(".jsonl") and os.path.getmtime(fp) >= window.start:
                        yield fp, "workflow" if run else "sub", entry, run


def scan(window, keep_text=False):
    threads = []
    for path, origin, session, run in transcript_files(window):
        tid = session if origin == "main" else os.path.basename(path)[:-6]
        th = Thread("claude", tid, origin)
        if origin != "main":
            th.parent, th.workflow = session, run
            try:
                with open(path[:-6] + ".meta.json") as fh:
                    meta = json.load(fh)
                th.agent_type = meta.get("agentType") if isinstance(meta, dict) else None
            except (OSError, ValueError):
                pass
        _scan_file(th, path, window, keep_text)
        if th.first is not None:
            threads.append(th)
    return threads


def _scan_file(th, path, window, keep_text):
    seen_requests = set()
    last_slash = (None, 0.0)
    with open(path, "rb") as fh:
        for raw in fh:
            try:
                d = json.loads(raw)
            except ValueError:
                continue  # includes a last line a live session is still writing
            if not isinstance(d, dict):
                continue
            ts = ts_of(d.get("timestamp"))
            if ts not in window:
                continue
            if th.cwd is None and d.get("cwd"):
                th.cwd = d["cwd"]
            if d.get("entrypoint") == "sdk-cli":
                th.automated = True
            kind = d.get("type")
            if kind == "assistant":
                _assistant(th, d, ts, seen_requests)
            elif kind == "user":
                last_slash = _user(th, d, ts, last_slash, keep_text)
            th.touch(ts)


def _assistant(th, d, ts, seen_requests):
    msg = d.get("message") or {}
    rid = d.get("requestId") or msg.get("id")
    usage = msg.get("usage")
    if usage and rid and rid not in seen_requests:
        seen_requests.add(rid)
        th.tokens["input"] += usage.get("input_tokens") or 0
        th.tokens["cache_read"] += usage.get("cache_read_input_tokens") or 0
        th.tokens["cache_write"] += usage.get("cache_creation_input_tokens") or 0
        th.tokens["output"] += usage.get("output_tokens") or 0
        if msg.get("model") and msg["model"] != "<synthetic>":
            th.models[msg["model"]] += 1
    for b in msg.get("content") or []:
        if not isinstance(b, dict) or b.get("type") != "tool_use":
            continue
        inp = b.get("input") or {}
        if b.get("name") == "Read":
            th.note_definition(str(inp.get("file_path") or ""), ts)
        elif b.get("name") == "Bash":
            for p in DEF_PATH_RE.findall(str(inp.get("command") or "")):
                th.note_definition(p, ts)


def _user(th, d, ts, last_slash, keep_text):
    content = (d.get("message") or {}).get("content")
    if isinstance(content, list) and any(isinstance(b, dict) and b.get("type") == "tool_result" for b in content):
        for b in content:
            if isinstance(b, dict) and b.get("is_error") and REJECT_RE.search(_result_text(b)[:400]):
                th.rejections.append(ts)
        return last_slash
    text = _text(content)
    if not text.strip():
        return last_slash
    origin_kind = (d.get("origin") or {}).get("kind")
    if d.get("isMeta") or origin_kind == "coordinator":
        if text.startswith(SKILL_BASE):
            _skill_load(th, text, ts, last_slash)
        elif th.origin != "main" and (origin_kind == "coordinator" or text.startswith(COORDINATOR)):
            th.start_round(ts, "followup")
        return last_slash
    if text.startswith("[Request interrupted by user"):
        th.interrupts.append(ts)
        return last_slash
    m = CMD_RE.search(text[:300])
    if m:
        return (m.group(1).strip(), ts)
    if th.origin != "main":
        if not th.rounds:
            th.first_prompt = text[:900]
            th.start_round(ts, "initial")
        elif not text.startswith("[Workflow harness") and not text.lstrip().startswith("<task-notification"):
            th.start_round(ts, "other")
        return last_slash
    if text.lstrip().startswith(NOT_HUMAN_PREFIXES) or origin_kind not in (None, "human"):
        return last_slash
    if d.get("promptSource") in ("system", "sdk"):
        return last_slash
    th.note_prompt(ts, text, keep_text)
    return last_slash


def _skill_load(th, text, ts, last_slash):
    path = text[len(SKILL_BASE):].split("\n", 1)[0].strip()
    m = PLUGIN_PATH_RE.search(path)
    if m:
        plugin, ver, _, name = m.groups()
        th.versions.append((ts, plugin, ver, "skills", name))
        qualified = f"{plugin}:{name}"
    else:
        name = os.path.basename(path.rstrip("/"))
        qualified = f"{local_scope(path)}:{name}"
    slash, slash_ts = last_slash
    by_user = slash is not None and slash.split(":")[-1] == name and ts - slash_ts < 120
    th.skills.append((ts, qualified, "user" if by_user else "model"))
