"""mine.py over a synthetic transcript tree laid out per ../transcript-formats.md.

Run from the repo root:
    python3 -B -m unittest discover -s .claude/skills/mine-transcripts/tests

common.py reads HOME, CLAUDE_CONFIG_DIR and CODEX_HOME at import, so every command runs
mine.py in a subprocess pointed at a temporary tree. Only the regex tables import common.
"""

import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

try:
    from compression import zstd  # Python 3.14+, as in codex.py
except ImportError:
    zstd = None

sys.dont_write_bytecode = True  # keep the skill folder free of __pycache__

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts")
sys.path.insert(0, SCRIPTS)
import common  # noqa: E402

WINDOW = ["--since", "2026-09-01", "--until", "2026-09-07"]
# A second before --since and the first instant past --until (the runs set TZ=UTC). Both hosts stamp
# skill loads, flagged prompts, interrupts and reviewer turns at these instants; none may count anywhere.
BEFORE, AFTER = "2026-08-31T23:59:59.000Z", "2026-09-08T00:00:00.000Z"
# A placeholder outside the temp dirs and this repo: anything else labels as scratch or self, the
# reviewer tables come out empty, and every assertion below would pass on nothing.
CWD = "/Users/me/acme"
CACHE = "/Users/me/.claude/plugins/cache/acme-market/workbench"
CODEX_CACHE = "/Users/me/.codex/plugins/cache/acme-market/workbench"
CLAUDE_PROMPT = "no, why did you drop the webapp retry flag"
CODEX_PROMPT = "stop, that is wrong for the webapp login form"
PLAIN_PROMPT = "add a retry test for the webapp"  # typed, but no correction pattern
OUTSIDE_PROMPT = "i said revert the webapp banner"  # flags i_said and revert, which nothing in the window hits
OUTSIDE_SKILL = "fix-ci"  # loaded only outside the window
INTERRUPT = "[Request interrupted by user]"
CUSTOM_AGENT = "acme-deploy-helper"
CUSTOM_SKILL = "acme-release-notes"
CODEX_NAMES = ("acme_reviewer_a", "test_review_webapp", "review_patterns")


def at(hh, mm, ss=0):
    return f"2026-09-02T{hh:02d}:{mm:02d}:{ss:02d}.000Z"


def write_jsonl(path, records):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as fh:
        for r in records:  # compact, key order kept: the Codex reader matches each line's head by regex
            fh.write(json.dumps(r, separators=(",", ":")) + "\n")


# ---------------------------------------------------------------- Claude Code records

def c_user(ts, text, **extra):
    return {"type": "user", "timestamp": ts, "cwd": CWD, "message": {"role": "user", "content": text}, **extra}


def c_assistant(ts, rid, *blocks):
    return {"type": "assistant", "timestamp": ts, "cwd": CWD, "requestId": rid,
            "message": {"id": rid, "model": "claude-opus-5-5", "usage": {"input_tokens": 10, "output_tokens": 5},
                        "content": list(blocks) or [{"type": "text", "text": "done"}]}}


def c_read(path):
    return {"type": "tool_use", "name": "Read", "input": {"file_path": path}}


def c_skill_load(ts, directory):
    return c_user(ts, f"Base directory for this skill: {directory}\n\n# Skill", isMeta=True)


def c_rejection(ts):
    return c_user(ts, [{"type": "tool_result", "tool_use_id": "t-1", "is_error": True,
                        "content": "The user doesn't want to proceed with this tool use."}])


def c_outside(ts):
    return [c_user(ts, OUTSIDE_PROMPT), c_user(ts, INTERRUPT), c_rejection(ts),
            c_skill_load(ts, f"{CACHE}/0.41.3/skills/{OUTSIDE_SKILL}")]


def claude_tree(home):
    project = os.path.join(home, "projects", "-Users-me-acme")
    subagents = os.path.join(project, "sess-1", "subagents")

    def agent(rel, agent_type, records):
        write_jsonl(os.path.join(subagents, rel + ".jsonl"), records)
        with open(os.path.join(subagents, rel + ".meta.json"), "w") as fh:
            json.dump({"agentType": agent_type}, fh)

    write_jsonl(os.path.join(project, "sess-1.jsonl"), [
        *c_outside(BEFORE),
        c_user(at(9, 0), CLAUDE_PROMPT),
        c_assistant(at(9, 1), "m-1"),
        c_user(at(9, 2), INTERRUPT),
        c_user(at(9, 3), PLAIN_PROMPT),
        c_rejection(at(9, 4)),
        c_skill_load(at(9, 30), f"{CACHE}/0.41.4/skills/code-quality-review"),
        c_skill_load(at(9, 40), os.path.join(home, "skills", CUSTOM_SKILL)),
        *c_outside(AFTER),
    ])
    # Dispatch, two rubric versions read (newest first, so neither "last read" nor a string max
    # gives 0.41.10), then one SendMessage continuation.
    agent("agent-tq", "workbench:test-quality-reviewer", [
        c_user(at(10, 0), "Review the test quality of the webapp retry change against main."),
        c_assistant(at(10, 1), "r-1", c_read(f"{CACHE}/0.41.10/skills/test-quality-review/SKILL.md")),
        c_assistant(at(10, 2), "r-2", c_read(f"{CACHE}/0.41.9/skills/test-quality-review/SKILL.md")),
        c_assistant(at(10, 10), "r-3"),
        c_user(at(11, 0), "The coordinator sent a message while you were working: the fix is in",
               isMeta=True, origin={"kind": "coordinator"}),
        c_assistant(at(11, 5), "r-4"),
    ])
    # A fresh dispatch that opens as a later pass: its only round is a follow-up.
    agent("agent-cq", "general-purpose", [
        c_user(at(12, 0), "Follow-up pass 1: review the correction delta for CQ-1 in the webapp change."),
        c_assistant(at(12, 1), "q-1", c_read(f"{CACHE}/0.41.6/skills/code-quality-review/SKILL.md")),
        c_assistant(at(12, 8), "q-2"),
    ])
    # ci-watcher reads nothing: its version is the one the parent session had loaded. Its second
    # round lands past --until, so it has no follow-up in the window.
    agent("agent-ci", "workbench:ci-watcher", [
        c_user(at(13, 0), "Watch CI for the pinned head of the webapp branch."),
        c_assistant(at(13, 3), "w-1"),
        c_user(AFTER, "The coordinator sent a message while you were working: watch the new head",
               isMeta=True, origin={"kind": "coordinator"}),
        c_assistant(AFTER, "w-2"),
    ])
    # A whole dispatch just before --since.
    agent("agent-early", "workbench:test-quality-reviewer", [
        c_user(BEFORE, "Review the test quality of the webapp banner change."),
        c_assistant(BEFORE, "e-1", c_read(f"{CACHE}/0.41.3/skills/test-quality-review/SKILL.md")),
    ])
    agent("agent-helper", CUSTOM_AGENT, [
        c_user(at(14, 0), "Draft the webapp deploy notes."),
        c_assistant(at(14, 2), "h-1"),
    ])
    agent(os.path.join("workflows", "run-1", "agent-wf"), "workflow-subagent", [
        c_user(at(15, 0), "Summarize the webapp changelog."),
        c_assistant(at(15, 4), "f-1"),
    ])


# ---------------------------------------------------------------- Codex records

def x_meta(ts, tid, source, **extra):
    return {"timestamp": ts, "type": "session_meta", "payload": {"id": tid, "cwd": CWD, "source": source, **extra}}


def x_event(ts, n, kind, **payload):
    return {"timestamp": ts, "ordinal": n, "type": "event_msg", "payload": {"type": kind, **payload}}


def x_user(ts, n, text, kinds):
    return {"timestamp": ts, "ordinal": n, "type": "response_item",
            "payload": {"type": "message", "role": "user", "content": [{"type": "input_text", "text": text}],
                        "internal_chat_message_metadata_passthrough": {"content_item_kinds": kinds}}}


def x_exec(ts, n, cmd):
    return {"timestamp": ts, "ordinal": n, "type": "response_item",
            "payload": {"type": "function_call", "name": "exec_command", "arguments": json.dumps({"cmd": cmd})}}


def x_sub(tid, name, records):
    spawn = {"subagent": {"thread_spawn": {}}}
    meta = x_meta(records[0]["timestamp"], tid, spawn, parent_thread_id="c-main", agent_path=f"/root/{name}")
    return [meta] + records


def x_skill(ts, n, name, version):
    text = (f"<skill><name>workbench:{name}</name>"
            f"<path>{CODEX_CACHE}/{version}/skills/{name}/SKILL.md</path></skill>")
    return x_user(ts, n, text, ["skills.selected_skill_instructions"])


def x_outside(ts, n):
    return [x_user(ts, n, OUTSIDE_PROMPT, ["user.text"]), x_event(ts, n + 1, "turn_aborted", reason="interrupted"),
            x_skill(ts, n + 2, OUTSIDE_SKILL, "0.41.3")]


def codex_tree(home):
    day = os.path.join(home, "sessions", "2026", "09", "02")
    write_jsonl(os.path.join(day, "rollout-main.jsonl"), [
        x_meta(at(9, 0), "c-main", "cli"),
        *x_outside(BEFORE, 1),
        x_user(at(9, 0, 5), 4, CODEX_PROMPT, ["user.text"]),
        x_event(at(9, 2), 5, "turn_aborted", reason="interrupted"),
        x_user(at(9, 3), 6, PLAIN_PROMPT, ["user.text"]),
        x_skill(at(9, 10), 7, "code-quality-review", "0.41.7"),
        *x_outside(AFTER, 8),
    ])
    # Spawned before 0.42.0: no contract header, so the task name and the rubric read decide.
    write_jsonl(os.path.join(day, "rollout-tq.jsonl"), x_sub("c-tq", CODEX_NAMES[0], [
        x_event(at(10, 0), 1, "task_started"),
        x_user(at(10, 0, 30), 2, "Review the test quality of the webapp retry change.", ["user.text"]),
        x_exec(at(10, 1), 3, f"cat {CODEX_CACHE}/0.41.5/skills/test-quality-review/SKILL.md"),
        # input_tokens includes the cached ones: 200 uncached + 300 cached + 40 output = 540
        x_event(at(10, 12), 4, "token_count",
                info={"total_token_usage": {"input_tokens": 500, "cached_input_tokens": 300, "output_tokens": 40}}),
        x_event(at(10, 12), 5, "task_complete"),
        x_event(at(11, 0), 6, "task_started"),
        x_event(at(11, 6), 7, "task_complete"),
        # A third turn past --until: no round, and its cumulative token count is not the window's.
        x_event(AFTER, 8, "task_started"),
        x_event(AFTER, 9, "token_count",
                info={"total_token_usage": {"input_tokens": 900, "cached_input_tokens": 300, "output_tokens": 90}}),
        x_event(AFTER, 10, "task_complete"),
    ]))
    # From 0.42.0 the spawn message names the agent. The names alone would say tq and cq.
    write_jsonl(os.path.join(day, "rollout-cq.jsonl"), x_sub("c-cq", CODEX_NAMES[1], [
        x_event(at(13, 0), 1, "task_started"),
        x_user(at(13, 0, 1), 2, "You are the code-quality-reviewer. Your contract:\nReview the webapp diff.",
               ["user.text"]),
        x_event(at(13, 20), 3, "task_complete"),
        # A follow-up carries no header; the contract from the first message must stand.
        x_event(at(13, 30), 4, "task_started"),
        x_user(at(13, 30, 1), 5, "The fix for CQ-1 is in; check the correction delta.", ["user.text"]),
        x_event(at(13, 40), 6, "task_complete"),
    ]))
    write_jsonl(os.path.join(day, "rollout-pattern.jsonl"), x_sub("c-pattern", CODEX_NAMES[2], [
        x_event(at(14, 0), 1, "task_started"),
        x_user(at(14, 0, 1), 2, "You are the pattern-reviewer. Your contract:\nCheck the webapp patterns.",
               ["user.text"]),
        x_event(at(14, 5), 3, "task_complete"),
    ]))
    # A whole dispatch just past --until.
    late = os.path.join(home, "sessions", "2026", "09", "08", "rollout-late.jsonl")
    write_jsonl(late, x_sub("c-late", "late_review", [
        x_event(AFTER, 1, "task_started"),
        x_user(AFTER, 2, "You are the test-quality-reviewer. Your contract:\nReview the webapp banner.",
               ["user.text"]),
        x_exec(AFTER, 3, f"cat {CODEX_CACHE}/0.41.3/skills/test-quality-review/SKILL.md"),
        x_event(AFTER, 4, "task_complete"),
    ]))


class MineOverFixture(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = tempfile.mkdtemp(prefix="mine-transcripts-")
        cls.addClassCleanup(shutil.rmtree, cls.root, ignore_errors=True)
        claude_home, codex_home = os.path.join(cls.root, "claude"), os.path.join(cls.root, "codex")
        claude_tree(claude_home)
        codex_tree(codex_home)
        cls.env = {**os.environ, "HOME": cls.root, "CLAUDE_CONFIG_DIR": claude_home, "CODEX_HOME": codex_home,
                   "TZ": "UTC"}
        cls.outputs = {}

    @classmethod
    def mine(cls, *args):
        if args not in cls.outputs:
            r = subprocess.run([sys.executable, "-B", os.path.join(SCRIPTS, "mine.py"), *args, *WINDOW],
                               env=cls.env, capture_output=True, text=True, timeout=60)
            if r.returncode != 0:
                raise AssertionError(f"mine.py {' '.join(args)} exited {r.returncode}: {r.stderr}")
            cls.outputs[args] = r.stdout
        return cls.outputs[args]

    def rows(self):
        return [json.loads(line) for line in self.mine("reviewers", "--rows").splitlines() if line.startswith("{")]

    def assert_row(self, key, **expected):
        [row] = [r for r in self.rows() if (r["host"], r["kind"]) == key]
        self.assertTrue(row["project"].startswith("proj-"), row)
        self.assertEqual({k: row[k] for k in expected}, expected)

    def test_reviewer_rows_cover_exactly_the_reviewer_dispatches(self):
        self.assertEqual(sorted((r["host"], r["kind"]) for r in self.rows()),
                         [("claude", "ci"), ("claude", "cq"), ("claude", "tq"), ("codex", "cq"), ("codex", "tq")])

    def test_claude_reviewer_dated_by_its_newest_rubric_read_with_a_continuation_round(self):
        self.assert_row(("claude", "tq"), version="0.41.10", version_source="read",
                        initial=10.0, followups=[5.0], active=15.0, wall=65.0)

    def test_claude_dispatch_that_opens_as_a_later_pass_has_no_initial_round(self):
        self.assert_row(("claude", "cq"), version="0.41.6", version_source="read",
                        initial=None, followups=[8.0], active=8.0)

    def test_claude_ci_watcher_takes_the_parent_session_version(self):
        self.assert_row(("claude", "ci"), version="0.41.4", version_source="parent", initial=3.0, followups=[])

    def test_codex_reviewer_turns_are_rounds_and_its_exec_read_dates_it(self):
        self.assert_row(("codex", "tq"), version="0.41.5", version_source="read",
                        initial=12.0, followups=[6.0], active=18.0, wall=66.0)

    def test_codex_contract_header_classifies_exactly(self):
        # tq by its name, but the header says code-quality-reviewer; the pattern-reviewer spawn,
        # which the name heuristic would call cq, is no reviewer at all.
        self.assert_row(("codex", "cq"), version="0.41.7", version_source="parent", initial=20.0, followups=[10.0])

    def test_codex_tokens_count_cached_input_once(self):
        spend = self.mine("spend")
        codex = spend[spend.index("[codex]"):]
        m = re.search(r"^subagents \(direct\)\s+(\d+)\s+\S+\s+\S+\s+(\S+)\s", codex, re.M)
        self.assertEqual(m.groups(), ("3", "540"))

    def host_block(self, *command, host):
        out = self.mine(*command)
        block = out[out.index(f"[{host}]"):]
        end = block.find("\n[", 1)
        return block if end < 0 else block[:end]

    @staticmethod
    def first_table(block):
        """{label: cells} for the table opening a host block, header row included. A neutral label
        reads <scope>-####: the disclosure tests pin the hashing, these pin the numbers."""
        lines = block.splitlines()[1:]
        header = lines[0].split()
        rows = {header[0]: header[1:]}
        for line in lines[1:]:
            cells = re.sub(r"^(user|project|plugin|agent)-[0-9a-f]{4}\b", r"\1-####", line).split()
            if len(cells) != len(header):
                break
            rows[cells[0]] = cells[1:]
        return rows

    def test_skills_counts_each_invocation_by_how_and_week(self):
        header = ["total", "model", "user", "read", "in-sub", "08-31*", "09-07*"]
        expected = {
            "claude": {  # cq: the parent's Skill load plus a subagent's read; tq: two reads in one thread
                "workbench:code-quality-review": ["2", "1", "0", "1", "1", "2", "0"],
                "workbench:test-quality-review": ["1", "0", "0", "1", "1", "1", "0"],
                "user-####": ["1", "1", "0", "0", "0", "1", "0"],
            },
            "codex": {  # cq: a $mention; tq: the subagent's exec read
                "workbench:code-quality-review": ["1", "0", "1", "0", "0", "1", "0"],
                "workbench:test-quality-review": ["1", "0", "0", "1", "1", "1", "0"],
            },
        }
        for host, rows in expected.items():
            with self.subTest(host=host):
                block = self.host_block("skills", host=host)
                self.assertEqual(self.first_table(block), {"skill": header, **rows})
                self.assertIn("interactive main sessions per week: 08-31*=1 09-07*=0", block)

    def test_friction_counts_flagged_prompts_interrupts_and_rejections(self):
        header = ["prompts", "flagged", "rate", "interrupts", "rejections", "pasted"]
        expected = {  # each host: a flagged prompt, a plain one and an interrupt; Claude adds a rejection
            "claude": (["2", "1", "50%", "1", "1", "0"], ["0", "0", "-", "0", "0", "0"], "negation 1, why 1"),
            "codex": (["2", "1", "50%", "1", "-", "0"], ["0", "0", "-", "0", "-", "0"], "negation 1, wrong 1"),
        }
        for host, (first_week, second_week, hits) in expected.items():
            with self.subTest(host=host):
                block = self.host_block("friction", host=host)
                self.assertEqual(self.first_table(block),
                                 {"week": header, "08-31*": first_week, "09-07*": second_week})
                self.assertIn(f"\nflag hits: {hits}; sessions with a flagged prompt: 1\n", block)

    def test_events_just_outside_the_window_count_in_no_command(self):
        # BEFORE and AFTER each hold a whole reviewer dispatch, which the thread counts would show. Their
        # other events sit in threads the window keeps: the exact skill and friction tables above, the
        # reviewer rows (ci-watcher has no follow-up, Codex tq one) and the token lines rule those out.
        threads = "threads: claude main 1, claude sub 4, claude workflow 1, codex main 1, codex sub 3"
        for command in (("skills",), ("friction",), ("reviewers", "--rows"), ("spend",)):
            with self.subTest(command=command[0]):
                self.assertIn(threads, self.mine(*command))
        self.assertNotIn(f"workbench:{OUTSIDE_SKILL}", self.mine("skills"))
        for host in ("claude", "codex"):
            hits = re.search(r"^flag hits: .*$", self.host_block("friction", host=host), re.M).group()
            self.assertNotRegex(hits, r"i_said|revert")
        claude_spend = self.host_block("spend", host="claude")
        self.assertRegex(claude_spend, r"(?m)^subagents \(direct\)\s+4\s+\S+\s+\S+\s+120\s")

    def default_output(self):
        return "\n".join(self.mine(*c) for c in (("reviewers", "--rows"), ("friction",), ("skills",), ("spend",)))

    def test_default_output_is_safe_to_quote(self):
        out = self.default_output()
        for secret in (CWD, "/Users/me", CLAUDE_PROMPT, CODEX_PROMPT, CUSTOM_AGENT, CUSTOM_SKILL, *CODEX_NAMES,
                       "acme", "webapp"):
            self.assertNotIn(secret, out)
        for label in (r"\bproj-[0-9a-f]{4}\b", r"\buser-[0-9a-f]{4}\b", r"\bagent-[0-9a-f]{4}\b"):
            self.assertRegex(out, label)  # the neutral stand-ins are there, so the names were seen

    def test_local_detail_prints_the_real_names(self):
        out = "\n".join(self.mine(*c, "--local-detail")
                        for c in (("reviewers", "--rows"), ("friction",), ("skills",), ("spend",)))
        for detail in (CWD, CLAUDE_PROMPT, CODEX_PROMPT, CUSTOM_AGENT, f"user:{CUSTOM_SKILL}"):
            self.assertIn(detail, out)


def compress(path):
    """Replace a session with its .jsonl.zst form, as Codex does to older sessions."""
    with open(path, "rb") as src, zstd.open(path + ".zst", "wb") as dst:
        dst.write(src.read())
    os.remove(path)


@unittest.skipIf(zstd is None, "compressing the fixture needs Python 3.14+")
class CompressedCodexTree(MineOverFixture):
    """Every fixture test again, with every Codex session compressed."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        for base, _, files in os.walk(os.path.join(cls.root, "codex")):
            for name in files:
                compress(os.path.join(base, name))

    def test_sessions_with_no_event_in_the_window_are_not_damage(self):
        self.assertNotIn("INCOMPLETE", self.mine("friction"))


def cut_in_second_frame(path):
    """Compress a session, then damage it past the lines a reader can already decode."""
    with open(path, "rb") as src:
        head = zstd.compress(src.read())
    tail = zstd.compress(b'{"timestamp":"2026-09-02T09:02:00.000Z","type":"event_msg"}\n' * 50)
    with open(path + ".zst", "wb") as dst:
        dst.write(head + tail[:len(tail) // 2])
    os.remove(path)


class CodexCoverage(unittest.TestCase):
    def setUp(self):
        self.root = tempfile.mkdtemp(prefix="mine-transcripts-")
        self.addCleanup(shutil.rmtree, self.root, ignore_errors=True)
        self.codex = os.path.join(self.root, "codex")
        self.day = os.path.join(self.codex, "sessions", "2026", "09", "02")
        self.env = {**os.environ, "HOME": self.root, "CLAUDE_CONFIG_DIR": os.path.join(self.root, "claude"),
                    "CODEX_HOME": self.codex, "TZ": "UTC"}

    def session(self, name, tid, day=None):
        path = os.path.join(day or self.day, name)
        write_jsonl(path, [x_meta(at(9, 0), tid, "cli"), x_user(at(9, 1), 1, PLAIN_PROMPT, ["user.text"])])
        return path

    def junk(self, name, day=None):
        path = os.path.join(day or self.day, name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as fh:
            fh.write(b"not a zstd frame")
        return path

    def run_mine(self, command, host):
        return subprocess.run([sys.executable, "-B", os.path.join(SCRIPTS, "mine.py"), command, "--host", host,
                               *WINDOW], env=self.env, capture_output=True, text=True, timeout=60)

    def mine(self, command="friction", host="codex"):
        r = self.run_mine(command, host)
        self.assertEqual(r.returncode, 0, r.stderr)
        return r.stdout

    def assert_no_path_leaks(self, out):
        self.assertNotIn(self.root, out)
        self.assertNotIn("rollout-", out)


class NoZstdInterpreter(CodexCoverage):
    def test_it_says_so_instead_of_undercounting(self):
        self.session("rollout-plain.jsonl", "c-plain")
        self.junk("rollout-old.jsonl.zst")
        stub = os.path.join(self.root, "stub", "compression")
        os.makedirs(stub)
        open(os.path.join(stub, "__init__.py"), "w").close()
        self.env["PYTHONPATH"] = os.path.dirname(stub)  # shadows the stdlib package, as a pre-3.14 Python has none
        out = self.mine()
        self.assertIn("threads: codex main 1\n", out)
        self.assertIn("INCOMPLETE: 1 compressed Codex sessions skipped; reading them needs Python 3.14+", out)
        self.assert_no_path_leaks(out)


class PlainSessionCoverage(CodexCoverage):
    @unittest.skipIf(os.geteuid() == 0, "root reads a mode-0 file")
    def test_an_unreadable_plain_session_still_raises(self):
        os.chmod(self.session("rollout-a.jsonl", "c-a"), 0)
        r = self.run_mine("friction", "codex")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("PermissionError", r.stderr)
        self.assertNotIn("INCOMPLETE", r.stdout)

    def test_a_subagent_source_given_as_a_string_is_read(self):
        write_jsonl(os.path.join(self.day, "rollout-a.jsonl"), [
            x_meta(at(9, 0), "c-a", {"subagent": "review"}),
            x_user(at(9, 1), 1, PLAIN_PROMPT, ["user.text"]),
        ])
        self.assertIn("threads: codex sub 1\n", self.mine())

    def test_a_claude_only_run_needs_no_codex_scan(self):
        self.assertNotIn("INCOMPLETE", self.mine(host="claude"))


@unittest.skipIf(zstd is None, "compressing the fixture needs Python 3.14+")
class CompressedSessionCoverage(CodexCoverage):
    def test_a_session_in_both_forms_reads_the_plain_copy(self):
        self.session("rollout-a.jsonl", "c-a")
        self.junk("rollout-a.jsonl.zst")
        out = self.mine()
        self.assertIn("threads: codex main 1\n", out)
        self.assertNotIn("INCOMPLETE", out)

    def test_the_plain_copy_wins_across_session_trees(self):
        self.junk("rollout-a.jsonl.zst")
        self.session("rollout-a.jsonl", "c-a", day=os.path.join(self.codex, "archived_sessions"))
        out = self.mine()
        self.assertIn("threads: codex main 1\n", out)
        self.assertNotIn("INCOMPLETE", out)

    def test_a_session_damaged_partway_is_dropped_whole_and_every_command_says_so(self):
        path = self.session("rollout-cut.jsonl", "c-cut")
        cut_in_second_frame(path)
        for command in ("skills", "reviewers", "friction", "spend"):
            with self.subTest(command):
                out = self.mine(command)
                self.assertIn("threads: none\n", out)
                self.assertIn("INCOMPLETE: 1 compressed Codex sessions unreadable", out)
                self.assert_no_path_leaks(out)

    def test_damaged_sessions_are_counted_and_the_others_still_count(self):
        self.session("rollout-good.jsonl", "c-good")
        cut_in_second_frame(self.session("rollout-cut.jsonl", "c-cut"))
        self.junk("rollout-bad.jsonl.zst")
        out = self.mine()
        self.assertIn("threads: codex main 1\n", out)
        self.assertIn("INCOMPLETE: 2 compressed Codex sessions unreadable", out)

    @unittest.skipIf(os.geteuid() == 0, "root reads a mode-0 file")
    def test_a_compressed_session_that_cannot_be_opened_is_counted(self):
        compress(self.session("rollout-a.jsonl", "c-a"))
        os.chmod(os.path.join(self.day, "rollout-a.jsonl.zst"), 0)
        self.assertIn("INCOMPLETE: 1 compressed Codex sessions unreadable", self.mine())

    def test_a_compressed_file_that_is_not_a_session_is_counted(self):
        os.makedirs(self.day)
        for name, content in (("rollout-garbage.jsonl.zst", b"not json\n"), ("rollout-empty.jsonl.zst", b"")):
            with open(os.path.join(self.day, name), "wb") as fh:
                fh.write(zstd.compress(content))
        out = self.mine()
        self.assertIn("threads: none\n", out)
        self.assertIn("INCOMPLETE: 2 compressed Codex sessions unreadable", out)

    def test_a_compressed_session_with_undecodable_bytes_is_counted(self):
        path = self.session("rollout-a.jsonl", "c-a")
        with open(path, "ab") as fh:
            fh.write(b'{"timestamp":"\xff","type":"event_msg"}\n')
        compress(path)
        self.assertIn("INCOMPLETE: 1 compressed Codex sessions unreadable", self.mine())

    def test_a_complete_read_prints_no_warning(self):
        compress(self.session("rollout-old.jsonl", "c-old"))
        out = self.mine()
        self.assertIn("threads: codex main 1\n", out)
        self.assertNotIn("INCOMPLETE", out)


class LaterPassPatterns(unittest.TestCase):
    """What makes a fresh dispatch count as a later pass. Each row is a decision; change it deliberately."""

    HEADER = ("Repository /Users/me/acme, base main, head 4d5e6f7, diff fingerprint 0f1e2d. "
              "Scope: webapp/src, webapp/tests. ")
    INITIAL = ("Review the test quality of the webapp retry change between main and HEAD. "
               + "Report every finding with a stable ID, its evidence and a severity. " * 4)

    PROMPTS = [
        ("Follow-up pass 1: review the correction delta for TQ-1 and TQ-2.", True),
        ("Re-review the fixes for CQ-3.", True),
        ("Second pass over the webapp diff.", True),
        ("Round 2 of the test-quality review.", True),
        ("Check the correction batch for ABC-123.", True),
        ("Review the affected-delta of the webapp change.", True),
        (HEADER + "This is follow-up pass 1: check the correction delta for TQ-1.", True),
        ("Review the webapp diff. Record follow-up pass 0 (initial).", False),
        ("Run the pre-review checks, then review the webapp diff.", False),  # "pre-review" is not re-review
        ("Review the webapp diff; the suite takes around 2 minutes.", False),  # "around 2" is not round 2
        # An initial prompt that quotes the correction rule after stating its task.
        (INITIAL + 'After you report, the owner returns a "correction batch" for a later pass.', False),
    ]

    NAMES = [
        ("tq_followup", True),
        ("test_quality_rereview", True),
        ("cq_round_2", True),
        ("tq_pass_1", True),
        ("tq_correction_review", True),
        ("cq_affected_delta", True),
        ("tq_delta_review", True),
        ("cq_second_pass", True),
        ("test_quality_review", False),
        ("pre_review_checks", False),
        ("tq_second_opinion", False),
        ("review_delta_encoder", False),
    ]

    def test_quoted_rule_sits_past_the_opening(self):
        self.assertGreater(len(self.INITIAL), common.FOLLOWUP_HEAD)

    def test_prompts(self):
        for text, expected in self.PROMPTS:
            with self.subTest(text=text[:60]):
                self.assertEqual(common.later_pass_prompt(text), expected)

    def test_codex_task_names(self):
        for name, expected in self.NAMES:
            with self.subTest(name=name):
                self.assertEqual(common.later_pass_name(name), expected)


class ReviewerIdentityOverFixture(unittest.TestCase):
    """Role evidence must survive the reader and CLI without becoming a routing guess."""

    def setUp(self):
        self.root = tempfile.mkdtemp(prefix="mine-identity-")
        self.addCleanup(shutil.rmtree, self.root, ignore_errors=True)
        self.codex_home = os.path.join(self.root, "codex")
        self.claude_home = os.path.join(self.root, "claude")
        self.day = os.path.join(self.codex_home, "sessions", "2026", "09", "02")

    def codex_agent(self, name, *, role=None, contract=None, contract_time=None, rubric=True, end_minute=2):
        records = x_sub(name, name, [x_event(at(10, 0), 1, "task_started")])
        meta = records[0]["payload"]
        meta.pop("agent_path")
        meta.pop("parent_thread_id")
        meta["source"]["subagent"]["thread_spawn"] = {
            "parent_thread_id": "c-main", "agent_path": f"/root/{name}", "agent_role": role}
        if contract:
            records.insert(1, x_user(contract_time or at(10, 0), 0,
                                     f"You are the {contract}. Your contract:\nReview the webapp.", []))
        else:
            records.append({"timestamp": at(10, 0), "type": "response_item",
                            "payload": {"type": "agent_message", "encrypted_content": "opaque-placeholder"}})
        if rubric:
            records.append(x_exec(at(10, 1), 2, f"cat {CODEX_CACHE}/0.48.2/skills/test-quality-review/SKILL.md"))
        records.append(x_event(at(10, end_minute), 3, "task_complete"))
        write_jsonl(os.path.join(self.day, f"rollout-{name}.jsonl"), records)

    def run_cli(self, command="reviewers"):
        env = {**os.environ, "CLAUDE_CONFIG_DIR": self.claude_home, "CODEX_HOME": self.codex_home, "TZ": "UTC"}
        args = [sys.executable, "-B", os.path.join(SCRIPTS, "mine.py"), command, *WINDOW]
        if command == "reviewers":
            args.append("--rows")
        result = subprocess.run(args, env=env, capture_output=True, text=True, timeout=30)
        self.assertEqual(result.returncode, 0, result.stderr)
        rows = [json.loads(line) for line in result.stdout.splitlines() if line.startswith("{")]
        return result.stdout, rows


    def test_a_codex_contract_role_outside_the_tables_is_named_as_a_workbench_role(self):
        self.codex_agent("spec", contract="spec-reviewer", rubric=False)
        out, _rows = self.run_cli()
        line = re.search(r"(?m)^not tabulated: (.*)$", out).group(1)
        self.assertIn("codex workbench:spec-reviewer 1", line)

    def test_a_codex_contract_role_from_another_plugin_stays_hashed(self):
        self.codex_agent("own", contract="acme:secret-reviewer", rubric=False)
        out, _rows = self.run_cli()
        line = re.search(r"(?m)^not tabulated: (.*)$", out).group(1)
        self.assertRegex(line, r"^codex agent-[0-9a-f]{4} 1  ")
        self.assertNotIn("secret", out)

    def test_rubric_read_is_candidate_even_with_encrypted_dispatch(self):
        self.codex_agent("implement_storage")
        output, rows = self.run_cli()
        self.assertEqual(len(rows), 1)
        self.assertEqual((rows[0]["kind"], rows[0]["identity"], rows[0]["identity_source"]),
                         ("tq", "candidate", "rubric-read"))
        self.assertIn("candidate", output)
        self.assertNotIn("opaque-placeholder", output)
        self.assertNotIn("implement_storage", output)
        spend, _ = self.run_cli("spend")
        self.assertIn("candidate test-quality-reviewer", spend)

    def test_registered_role_is_confirmed_without_readable_contract(self):
        self.codex_agent("check_diff", role="workbench:test-quality-reviewer")
        _, rows = self.run_cli()
        self.assertEqual(len(rows), 1)
        self.assertEqual((rows[0]["kind"], rows[0]["identity"], rows[0]["identity_source"]),
                         ("tq", "confirmed", "agent-type"))
        spend, _ = self.run_cli("spend")
        self.assertRegex(spend, r"(?m)^test-quality-reviewer\s+1\s")
        self.assertNotIn("candidate test-quality-reviewer", spend)

    def test_registered_nonreviewer_role_wins_over_name_and_rubric(self):
        self.codex_agent("test_quality_review", role="workbench:pattern-reviewer")
        _, rows = self.run_cli()
        self.assertEqual(rows, [])

    def test_nested_name_keeps_parent_version_and_followup_timing(self):
        write_jsonl(os.path.join(self.day, "rollout-parent.jsonl"), [
            x_meta(at(9, 0), "c-main", "cli"),
            x_skill(at(9, 1), 1, "test-quality-review", "0.47.1"),
        ])
        self.codex_agent("test_quality_rereview", rubric=False)
        _, rows = self.run_cli()
        self.assertEqual(len(rows), 1)
        self.assertEqual((rows[0]["kind"], rows[0]["identity"], rows[0]["identity_source"]),
                         ("tq", "candidate", "task-name"))
        self.assertEqual((rows[0]["version"], rows[0]["version_source"]), ("0.47.1", "parent"))
        self.assertIsNone(rows[0]["initial"])
        self.assertEqual(rows[0]["followups"], [2.0])

    def test_nonreviewer_contract_wins_over_name_and_rubric(self):
        self.codex_agent("test_quality_review", contract="pattern-reviewer")
        _, rows = self.run_cli()
        self.assertEqual(rows, [])

    def test_contract_before_window_keeps_identity_but_not_duration(self):
        self.codex_agent("test_quality_review", contract="code-quality-reviewer", contract_time=BEFORE)
        _, rows = self.run_cli()
        self.assertEqual(len(rows), 1)
        self.assertEqual((rows[0]["kind"], rows[0]["identity"], rows[0]["identity_source"]),
                         ("cq", "confirmed", "contract"))
        self.assertEqual(rows[0]["active"], 2.0)
        self.assertEqual(rows[0]["wall"], 2.0)
        self.assertEqual(rows[0]["start"], "2026-09-02 10:00")
        self.assertEqual(rows[0]["initial"], 2.0)
        self.assertEqual(rows[0]["followups"], [])

    def test_confirmed_and_candidate_counts_stay_in_separate_buckets(self):
        self.codex_agent("review_one", role="test-quality-reviewer")
        self.codex_agent("review_two", end_minute=6)
        output, rows = self.run_cli()
        self.assertEqual(sorted(row["identity"] for row in rows), ["candidate", "confirmed"])
        self.assertRegex(output, r"(?m)^0\.48\.2\s+codex\s+confirmed\s+1\s+0\s+2\.0\s+2\.0\s+2\.0\s+1\s+2\.0\s+2\.0\s")
        self.assertRegex(output, r"(?m)^0\.48\.2\s+codex\s+candidate\s+1\s+0\s+6\.0\s+6\.0\s+6\.0\s+1\s+6\.0\s+6\.0\s")

    def test_unidentified_encrypted_dispatch_is_counted_as_unknown(self):
        self.codex_agent("helper", rubric=False)
        output, rows = self.run_cli()
        self.assertEqual(rows, [])
        self.assertIn("unknown role: codex 1", output)

    def test_claude_generic_rubric_reader_is_also_candidate(self):
        parent = os.path.join(self.claude_home, "projects", "-Users-me-acme", "sess-1", "subagents")
        path = os.path.join(parent, "agent-generic.jsonl")
        write_jsonl(path, [c_user(at(10, 0), "Implement storage."),
                           c_assistant(at(10, 1), "r1", c_read(f"{CACHE}/0.48.2/skills/test-quality-review/SKILL.md"))])
        with open(os.path.join(parent, "agent-generic.meta.json"), "w") as fh:
            json.dump({"agentType": "general-purpose"}, fh)
        _, rows = self.run_cli()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["identity"], "candidate")



TOOLKIT_CACHE = "/Users/me/.claude/plugins/cache/acme-market/toolkit"


def c_tool(name, **inp):
    return {"type": "tool_use", "name": name, "input": inp}


def c_notification(ts):
    """A background task of the agent's own finished: the harness wakes the agent with this record."""
    return c_user(ts, "[SYSTEM NOTIFICATION - NOT USER INPUT]\n<task-notification>\n<task-id>t-1</task-id>",
                  isMeta=True, origin={"kind": "task-notification"})


def c_followup(ts):
    return c_user(ts, "The coordinator sent a message while you were working: the fix is in",
                  isMeta=True, origin={"kind": "coordinator"})


def x_code(ts, n, code):
    """Codex code mode: the command sits inside JavaScript, not a JSON argument."""
    return {"timestamp": ts, "ordinal": n, "type": "response_item",
            "payload": {"type": "custom_tool_call", "name": "exec", "input": code}}


class SmallTree(unittest.TestCase):
    """One temporary tree per test, for cases the shared fixture's pinned counts leave no room for."""

    def setUp(self):
        self.root = tempfile.mkdtemp(prefix="mine-small-")
        self.addCleanup(shutil.rmtree, self.root, ignore_errors=True)
        self.claude_home, self.codex_home = os.path.join(self.root, "claude"), os.path.join(self.root, "codex")
        self.project = os.path.join(self.claude_home, "projects", "-Users-me-acme")
        self.day = os.path.join(self.codex_home, "sessions", "2026", "09", "02")

    def claude_main(self, records, session="sess-1"):
        write_jsonl(os.path.join(self.project, f"{session}.jsonl"), records)

    def claude_agent(self, name, agent_type, records, session="sess-1"):
        sub = os.path.join(self.project, session, "subagents")
        write_jsonl(os.path.join(sub, f"agent-{name}.jsonl"), records)
        with open(os.path.join(sub, f"agent-{name}.meta.json"), "w") as fh:
            json.dump({"agentType": agent_type}, fh)

    def codex_file(self, name, records):
        write_jsonl(os.path.join(self.day, f"rollout-{name}.jsonl"), records)

    def mine(self, command, *extra):
        env = {**os.environ, "HOME": self.root, "CLAUDE_CONFIG_DIR": self.claude_home,
               "CODEX_HOME": self.codex_home, "TZ": "UTC"}
        r = subprocess.run([sys.executable, "-B", os.path.join(SCRIPTS, "mine.py"), command, *extra, *WINDOW],
                           env=env, capture_output=True, text=True, timeout=60)
        self.assertEqual(r.returncode, 0, r.stderr)
        return r.stdout

    def rows(self, *extra):
        return [json.loads(line) for line in self.mine("reviewers", "--rows", *extra).splitlines()
                if line.startswith("{")]


class RoundEndsAtTheReport(SmallTree):
    """A reviewer's own background task can finish long after its report. That wake-up is not review time."""

    def reviewer(self, *records):
        self.claude_agent("tq", "workbench:test-quality-reviewer", [
            c_user(at(10, 0), "Review the test quality of the webapp retry change."), *records])
        [row] = self.rows()
        return row

    def test_a_notification_after_the_handback_adds_no_time(self):
        row = self.reviewer(
            c_assistant(at(10, 10), "r-1", c_tool("SubagentHandback", report="PASS")),
            c_notification(at(15, 0)),
            c_assistant(at(15, 1), "r-2"))
        self.assertEqual((row["initial"], row["active"], row["wall"]), (10.0, 10.0, 10.0))

    def test_a_notification_before_any_report_is_a_wait_inside_the_round(self):
        row = self.reviewer(
            c_assistant(at(10, 2), "r-1", c_tool("Bash", command="node run-campaign.mjs", run_in_background=True)),
            c_notification(at(10, 20)),
            c_assistant(at(10, 25), "r-2", c_tool("SubagentHandback", report="PASS")))
        self.assertEqual((row["initial"], row["active"], row["wall"]), (25.0, 25.0, 25.0))

    def test_a_later_round_reports_by_message_and_its_late_notification_adds_no_time(self):
        row = self.reviewer(
            c_assistant(at(10, 10), "r-1", c_tool("SubagentHandback", report="ISSUES_FOUND")),
            c_followup(at(11, 0)),
            c_assistant(at(11, 5), "r-2", c_tool("SendMessage", to="main", message="PASS")),
            c_notification(at(16, 0)),
            c_assistant(at(16, 1), "r-3"))
        self.assertEqual((row["initial"], row["followups"], row["active"], row["wall"]), (10.0, [5.0], 15.0, 65.0))

    def test_a_tail_that_reports_again_was_work(self):
        row = self.reviewer(
            c_assistant(at(10, 10), "r-1", c_tool("SubagentHandback", report="slice done")),
            c_notification(at(10, 20)),
            c_assistant(at(10, 24), "r-2", c_tool("SendMessage", to="main", message="PASS")))
        self.assertEqual((row["initial"], row["active"], row["wall"]), (24.0, 24.0, 24.0))

    def test_a_round_after_a_stale_tail_counts_from_its_own_start(self):
        row = self.reviewer(
            c_assistant(at(10, 10), "r-1", c_tool("SubagentHandback", report="ISSUES_FOUND")),
            c_notification(at(12, 0)),
            c_assistant(at(12, 1), "r-2"),
            c_followup(at(13, 0)),
            c_assistant(at(13, 5), "r-3"))  # still working: no report yet, and the time already counts
        self.assertEqual((row["initial"], row["followups"], row["active"], row["wall"]), (10.0, [5.0], 15.0, 185.0))

    def test_a_message_to_another_agent_is_not_the_report(self):
        row = self.reviewer(
            c_assistant(at(10, 2), "r-1", c_tool("SendMessage", to="acme-helper", message="status?")),
            c_notification(at(10, 20)),
            c_assistant(at(10, 25), "r-2"))
        self.assertEqual((row["initial"], row["active"]), (25.0, 25.0))


class ContractReviewerAndOtherRoles(SmallTree):
    def test_contract_reviewer_has_its_own_table_on_both_hosts(self):
        self.claude_agent("ct", "workbench:contract-reviewer", [
            c_user(at(10, 0), "Review the webapp change against its agreed behavior."),
            c_assistant(at(10, 1), "r-1", c_read(f"{CACHE}/0.48.2/skills/contract-review/SKILL.md")),
            c_assistant(at(10, 7), "r-2")])
        self.codex_file("ct", x_sub("c-ct", "check_webapp", [
            x_event(at(11, 0), 1, "task_started"),
            x_user(at(11, 0, 1), 2, "You are the contract-reviewer. Your contract:\nReview the webapp.", ["user.text"]),
            x_event(at(11, 9), 3, "task_complete")]))
        out = self.mine("reviewers", "--rows")
        rows = [json.loads(line) for line in out.splitlines() if line.startswith("{")]
        self.assertEqual(sorted((r["host"], r["kind"], r["identity"], r["initial"]) for r in rows),
                         [("claude", "ct", "confirmed", 7.0), ("codex", "ct", "confirmed", 9.0)])
        self.assertEqual(rows[0]["version"] if rows[0]["host"] == "claude" else rows[1]["version"], "0.48.2")
        self.assertRegex(out, r"(?m)^contract-reviewer \(minutes\)\n.*\n0\.48\.2\s+claude\s+confirmed\s+1\s")
        self.assertIn("contract-reviewer", self.mine("spend"))

    def test_a_codex_spawn_without_a_header_is_a_contract_candidate_by_name_or_rubric(self):
        self.codex_file("named", x_sub("c-named", "contract_review_webapp", [
            x_event(at(10, 0), 1, "task_started"), x_event(at(10, 3), 2, "task_complete")]))
        self.codex_file("read", x_sub("c-read", "check_webapp", [
            x_event(at(11, 0), 1, "task_started"),
            x_exec(at(11, 1), 2, f"cat {CODEX_CACHE}/0.48.2/skills/contract-review/SKILL.md"),
            x_event(at(11, 4), 3, "task_complete")]))
        self.assertEqual(sorted((r["kind"], r["identity"], r["identity_source"]) for r in self.rows()),
                         [("ct", "candidate", "rubric-read"), ("ct", "candidate", "task-name")])
        self.assertIn("candidate contract-reviewer", self.mine("spend"))

    def test_a_generic_agent_that_read_the_contract_rubric_is_a_candidate(self):
        self.claude_agent("generic", "general-purpose", [
            c_user(at(10, 0), "Implement storage."),
            c_assistant(at(10, 1), "r-1", c_read(f"{CACHE}/0.48.2/skills/contract-review/SKILL.md"))])
        [row] = self.rows()
        self.assertEqual((row["kind"], row["identity"]), ("ct", "candidate"))

    def test_reviewer_roles_outside_the_tables_are_named_not_dropped(self):
        for name, agent_type in (("spec", "workbench:spec-reviewer"), ("own", "acme-secret-reviewer"),
                                 ("helper", CUSTOM_AGENT)):
            self.claude_agent(name, agent_type, [c_user(at(10, 0), "Review the webapp plan."),
                                                 c_assistant(at(10, 4), "r-1")])
        out = self.mine("reviewers")
        line = re.search(r"(?m)^not tabulated: (.*)$", out).group(1)
        self.assertRegex(line, r"^claude agent-[0-9a-f]{4} 1, claude workbench:spec-reviewer 1  ")
        self.assertNotIn("acme", out)
        self.assertIn("claude acme-secret-reviewer 1", self.mine("reviewers", "--local-detail"))

    def test_no_line_when_every_reviewer_role_has_a_table(self):
        self.claude_agent("tq", "workbench:test-quality-reviewer", [
            c_user(at(10, 0), "Review the webapp tests."), c_assistant(at(10, 4), "r-1")])
        self.assertNotIn("not tabulated", self.mine("reviewers"))


class SkillReadsAndLabels(SmallTree):
    def skill_row(self, out, name):
        m = re.search(rf"(?m)^{re.escape(name)}\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s", out)
        return m and tuple(int(x) for x in m.groups())  # total, model, user, read

    def test_this_repos_own_skill_read_by_a_relative_path_labels_as_self(self):
        records = [c_user(at(9, 0), PLAIN_PROMPT),
                   c_assistant(at(9, 1), "m-1", c_tool("Bash", command="cat .claude/skills/change-log/SKILL.md"))]
        for r in records:
            r["cwd"] = common.SELF_ROOT  # this checkout, wherever it is; never a literal path
        self.claude_main(records)
        out = self.mine("skills", "--host", "claude")
        self.assertEqual(self.skill_row(out, "self:change-log"), (1, 0, 0, 1))
        self.assertNotRegex(out, r"(?m)^project-")

    def test_only_a_command_that_opens_the_file_is_a_read(self):
        cache = f"{CACHE}/0.48.2/skills"
        local = ".claude/skills/acme-notes/SKILL.md"
        commands = [
            f"grep -n 'verdict' {cache}/fix-ci/SKILL.md",
            f"wc -c {cache}/fix-ci/SKILL.md; git log --oneline -- {cache}/fix-ci/SKILL.md",
            f"cat > {local} <<'EOF'\n# Notes\nEOF",
            f"sed -i '' 's/old/new/' {local}",
            f"cp {cache}/fix-ci/SKILL.md /Users/me/acme/copy.md",
            f"sed -n '1,40p' {cache}/file-pr/SKILL.md | head -20",
            f"cd /Users/me/acme && head -50 {cache}/audit/SKILL.md",
        ]
        self.claude_main([c_user(at(9, 0), PLAIN_PROMPT),
                          *(c_assistant(at(9, 1 + i), f"m-{i}", c_tool("Bash", command=cmd))
                            for i, cmd in enumerate(commands))])
        out = self.mine("skills", "--host", "claude")
        self.assertEqual(self.skill_row(out, "workbench:file-pr"), (1, 0, 0, 1))
        self.assertEqual(self.skill_row(out, "workbench:audit"), (1, 0, 0, 1))
        self.assertIsNone(self.skill_row(out, "workbench:fix-ci"))
        self.assertNotRegex(out, r"(?m)^project-")

    def test_codex_code_mode_reads_count_and_searches_do_not(self):
        cache = f"{CODEX_CACHE}/0.48.2/skills"
        self.codex_file("main", [
            x_meta(at(9, 0), "c-main", "cli"),
            x_code(at(9, 1), 1, f'text(await tools.exec_command({{cmd:"cat {cache}/file-pr/SKILL.md",max_output_tokens:12000}}));'),
            x_code(at(9, 2), 2, f'text(await tools.exec_command({{cmd:"rg -n Dispatch {cache}/fix-ci/SKILL.md"}}));'),
            x_code(at(9, 3), 3, f"text(require('fs').readFileSync('{cache}/audit/SKILL.md', 'utf8'));"),
            x_exec(at(9, 4), 4, f"diff -u {cache}/fix-ci/SKILL.md /Users/me/acme/copy.md"),
        ])
        out = self.mine("skills", "--host", "codex")
        self.assertEqual(self.skill_row(out, "workbench:file-pr"), (1, 0, 0, 1))
        self.assertEqual(self.skill_row(out, "workbench:audit"), (1, 0, 0, 1))
        self.assertIsNone(self.skill_row(out, "workbench:fix-ci"))

    def test_a_mention_still_dates_the_reviewer(self):
        # The version a reviewer ran is evidence from any mention of its rubric path; only the read count is strict.
        self.claude_agent("tq", "workbench:test-quality-reviewer", [
            c_user(at(10, 0), "Review the webapp tests."),
            c_assistant(at(10, 1), "r-1", c_tool("Bash", command=f"grep -n Verdict {CACHE}/0.48.2/skills/test-quality-review/SKILL.md"))])
        [row] = self.rows()
        self.assertEqual((row["version"], row["version_source"]), ("0.48.2", "read"))

    def test_a_skill_the_prompt_names_inline_is_user_invoked(self):
        self.claude_main([
            c_user(at(9, 0), "please run /toolkit:test-audit on the webapp tests, then stop"),
            c_skill_load(at(9, 6), f"{TOOLKIT_CACHE}/0.22.0/skills/test-audit"),
            c_skill_load(at(9, 7), f"{CACHE}/0.48.2/skills/fix-ci"),  # same turn, but the prompt did not name it
            c_user(at(9, 30), "now compare /Users/me/acme/audit/notes.md with the report"),
            c_skill_load(at(9, 31), f"{CACHE}/0.48.2/skills/audit"),  # a path component is not a slash name
        ])
        out = self.mine("skills", "--host", "claude")
        self.assertEqual(self.skill_row(out, "toolkit:test-audit"), (1, 0, 1, 0))
        self.assertEqual(self.skill_row(out, "workbench:fix-ci"), (1, 1, 0, 0))
        self.assertEqual(self.skill_row(out, "workbench:audit"), (1, 1, 0, 0))

    def test_a_bare_inline_name_matches_and_an_earlier_prompt_does_not(self):
        self.claude_main([
            c_user(at(9, 0), "use /fix-ci here."),
            c_skill_load(at(9, 1), f"{CACHE}/0.48.2/skills/fix-ci"),
            c_user(at(9, 10), PLAIN_PROMPT),
            c_skill_load(at(9, 11), f"{CACHE}/0.48.2/skills/fix-ci"),
        ])
        self.assertEqual(self.skill_row(self.mine("skills", "--host", "claude"), "workbench:fix-ci"), (2, 1, 1, 0))



class ReadAndSlashPatterns(unittest.TestCase):
    """What counts as opening a definition file, and as naming a skill in a prompt. Each row is a decision."""

    P = f"{CACHE}/0.48.2/skills/audit/SKILL.md"

    COMMANDS = [
        ("cat {p}", True),
        ("sed -n '1,40p' {p}", True),
        ("head -50 {p}", True),
        ("cat notes.md {p}", True),  # a later operand of the same reader
        ("echo done; cat {p}", True),
        ("cd /Users/me/acme && tail -20 {p}", True),
        ("cat {p} > /Users/me/acme/copy.md", True),  # read here, written elsewhere
        ("sed -i '' 's/old/new/' {p}", False),
        ("sed -Ei 's/old/new/' {p}", False),
        ("cat > {p} <<'EOF'", False),  # the redirect target is written, not read
        ("cat notes.md >> {p}", False),
        ("grep -n verdict {p}", False),
        ("rg -n verdict {p}", False),
        ("wc -c {p}", False),
        ("diff -u /Users/me/acme/copy.md {p}", False),
        ("cp {p} /Users/me/acme/copy.md", False),
        ("ls -l {p}", False),
        ("git log --oneline -- {p}", False),
        ("python3 - <<'EOF'\npath = '{p}'\nEOF", False),  # a bare mention inside a script
        ('{{"cmd": "cat {p}"}}', True),  # Codex function_call arguments
        ('{{"cmd":"rg -n verdict {p}"}}', False),
        ('{{"cmd":"cat notes.md\\ngrep -n verdict {p}"}}', False),  # an escaped newline ends the cat
        ('text(await tools.exec_command({{cmd:"sed -n 1,80p {p}"}}));', True),  # Codex code mode
        ("fs.readFileSync('{p}', 'utf8')", True),
        ('Path("{p}").read_text()', True),
        ('Path("{p}").write_text(body)', False),
        ("open('{p}').read()", True),
        ("open('{p}', 'w').write(body)", False),
    ]

    PROMPTS = [
        ("please run /toolkit:test-audit on the webapp tests", {"toolkit:test-audit"}),
        ("use /fix-ci.", {"fix-ci"}),
        ("either /audit or /claim-check, your call", {"audit", "claim-check"}),
        ("compare /Users/me/acme/audit/notes.md with the report", set()),
        ("open /audit/notes and summarize", set()),
        ("see https://example.com/audit for the format", set()),
        ("read ~/audit first", set()),
        ("keep the and/or wording", set()),
        ("check /notes.md", set()),
    ]

    def test_commands(self):
        for template, expected in self.COMMANDS:
            with self.subTest(command=template):
                self.assertEqual(list(common.definition_mentions(template.format(p=self.P))), [(self.P, expected)])

    def test_prompts(self):
        for text, expected in self.PROMPTS:
            with self.subTest(text=text):
                self.assertEqual(common.inline_slash_names(text), expected)


class HistoryReach(SmallTree):
    """Files are picked by last-write time, so a host whose older transcripts are gone shows early days as
    quiet when they are only missing. The banner names the day the surviving history starts."""

    IN_WINDOW = dt.datetime(2026, 9, 2, 12, tzinfo=dt.timezone.utc).timestamp()
    BEFORE_WINDOW = dt.datetime(2026, 8, 20, 12, tzinfo=dt.timezone.utc).timestamp()

    def last_written(self, stamp, *paths):
        for path in paths:
            os.utime(path, (stamp, stamp))

    def both_hosts(self):
        self.claude_main([c_user(BEFORE, PLAIN_PROMPT), c_user(at(9, 0), PLAIN_PROMPT)])
        self.codex_file("main", [x_meta(BEFORE, "c-main", "cli"), x_user(at(9, 1), 1, PLAIN_PROMPT, ["user.text"])])
        return os.path.join(self.project, "sess-1.jsonl"), os.path.join(self.day, "rollout-main.jsonl")

    def test_a_window_that_starts_before_the_oldest_transcript_says_so_per_host(self):
        # Both sessions hold an event before the window, and it changes nothing: the files that would
        # hold the other sessions of those days are what is missing.
        self.last_written(self.IN_WINDOW, *self.both_hosts())
        for command in ("skills", "reviewers", "friction", "spend"):
            with self.subTest(command):
                out = self.mine(command)
                for host in ("claude", "codex"):
                    self.assertIn(f"NOTICE: the oldest {host} transcript on this machine was last written "
                                  "2026-09-02; the window starts 2026-09-01, so the days before 2026-09-02 "
                                  "are undercounted\n", out)
        self.assertNotIn(self.root, self.mine("friction"))

    def test_a_transcript_last_written_before_the_window_means_history_reaches_it(self):
        claude, codex = self.both_hosts()
        self.last_written(self.IN_WINDOW, claude, codex)
        old_claude = os.path.join(self.project, "sess-old.jsonl")
        write_jsonl(old_claude, [c_user("2026-08-20T09:00:00.000Z", PLAIN_PROMPT)])
        old_codex = os.path.join(self.codex_home, "sessions", "2026", "08", "20", "rollout-old.jsonl")
        write_jsonl(old_codex, [x_meta("2026-08-20T09:00:00.000Z", "c-old", "cli")])
        self.last_written(self.BEFORE_WINDOW, old_claude, old_codex)
        self.assertNotIn("NOTICE", self.mine("friction"))

    def test_only_the_host_that_lacks_history_is_named(self):
        claude, codex = self.both_hosts()
        self.last_written(self.IN_WINDOW, claude)
        self.last_written(self.BEFORE_WINDOW, codex)
        out = self.mine("friction")
        self.assertIn("NOTICE: the oldest claude transcript", out)
        self.assertNotIn("oldest codex transcript", out)

    def test_a_subagent_file_does_not_stand_in_for_older_sessions(self):
        self.last_written(self.IN_WINDOW, *self.both_hosts())
        self.claude_agent("tq", "workbench:test-quality-reviewer", [c_user(at(10, 0), "Review the webapp tests.")])
        sub = os.path.join(self.project, "sess-1", "subagents", "agent-tq.jsonl")
        self.last_written(self.BEFORE_WINDOW, sub)
        self.assertIn("NOTICE: the oldest claude transcript", self.mine("friction", "--host", "claude"))

    def test_a_host_with_no_transcripts_prints_nothing(self):
        self.assertNotIn("NOTICE", self.mine("friction"))


if __name__ == "__main__":
    unittest.main()
