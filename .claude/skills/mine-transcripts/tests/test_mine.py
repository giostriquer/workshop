"""mine.py over a synthetic transcript tree laid out per ../transcript-formats.md.

Run from the repo root:
    python3 -B -m unittest discover -s .claude/skills/mine-transcripts/tests

common.py reads HOME, CLAUDE_CONFIG_DIR and CODEX_HOME at import, so every command runs
mine.py in a subprocess pointed at a temporary tree. Only the regex tables import common.
"""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

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


if __name__ == "__main__":
    unittest.main()
