"""Shared pieces for mine.py: host paths, the date window, neutral labels, stats.

Every path is derived at run time from $HOME (or CLAUDE_CONFIG_DIR / CODEX_HOME).
Labels are neutral by default: projects become proj-<hash>, names outside the
public plugins become <scope>-<hash>. --local-detail switches to real names.
"""

import datetime as dt
import hashlib
import os
import re
import tempfile
from collections import Counter

HOME = os.path.expanduser("~")
CLAUDE_HOME = os.environ.get("CLAUDE_CONFIG_DIR") or os.path.join(HOME, ".claude")
CODEX_HOME = os.environ.get("CODEX_HOME") or os.path.join(HOME, ".codex")

# .../plugins/cache/<marketplace>/<plugin>/<version>/(skills|agents)/<name>
PLUGIN_PATH_RE = re.compile(r"plugins/cache/[\w.-]+/([\w.-]+)/(\d+\.\d+\.\d+)/(skills|agents)/([\w.-]+)")
# A skill or agent definition path inside a command or a Read: .../SKILL.md, .../agents/<x>.md|.toml
DEF_PATH_RE = re.compile(r"[^\s'\"`;|&()<>=,]*/(?:SKILL\.md|agents/[\w.-]+\.(?:md|toml))")
LOCAL_SKILL_RE = re.compile(r"(?:^|/)\.(?:claude|codex|agents)/skills/([\w.-]+)/SKILL\.md$")
LOCAL_AGENT_RE = re.compile(r"(?:^|/)\.(?:claude|codex)/agents/([\w.-]+)\.(?:md|toml)$")
WORKTREE_RE = re.compile(r"/(?:\.claude/worktrees|\.codex/worktrees|\.worktrees)/.*$")

BUILTIN_AGENTS = {"general-purpose", "Explore", "Plan", "fork", "workflow-subagent", "claude",
                  "statusline-setup", "claude-code-guide", "output-style-setup"}

# A fresh dispatch that is a later pass says so up front: in the opening of its prompt (Claude) or in
# its task name (Codex). Whole words only, so "pre-review", "around 2" and tq_second_opinion do not
# count, and a rule an initial prompt quotes further down ("... returns a correction batch") does not.
# tests/test_mine.py pins each decision.
FOLLOWUP_HEAD = 300
FOLLOWUP_RE = re.compile(r"\bpass [1-9]\b|\bround [2-9]\b|\bre-?review|\bsecond (?:round|pass)\b"
                         r"|\bcorrection (?:delta|batch|submission)|\baffected-delta\b", re.I)
FOLLOWUP_NAME_RE = re.compile(r"follow.?up|(?<![a-z])re.?review|round.?[2-9]|(?<![a-z])pass.?[1-9]|correction"
                              r"|affected.?delta|delta.?(?:review|pass)|second.?(?:round|pass|review)", re.I)

# Candidate-correction patterns, matched against the first 600 characters of a prompt.
STRONG_FLAGS = {
    "negation": r"^\s*(no|nope|nah|stop|wait|hold on|ugh|n[aã]o|pare|para)\b",
    "why": r"\bwhy (did|are|would|do|does|is|was|were|didn'?t|doesn'?t|haven'?t|can'?t|won'?t|not)\b"
           r"|\bwhat are you doing\b|\bpor ?que\b",
    "i_said": r"\b(i said|i told you|i asked|as i said|like i said|i already|i've said|we agreed|i meant|eu disse|j[aá] disse)\b",
    "wrong": r"\b(wrong|incorrect(ly)?|not what|that'?s not|isn'?t what|misunderstood|mistake|errado)\b",
    "still_broken": r"\bstill (broken|failing|fails|not|doesn'?t|isn'?t|wrong|the same|happening)\b",
    "you_didnt": r"\b(you didn'?t|you forgot|you missed|you skipped|you ignored|you should have|you shouldn'?t"
                 r"|you were supposed|you did not|you never|you haven'?t)\b",
    "revert": r"\b(revert|undo|roll ?back|put it back)\b",
}
WEAK_FLAGS = {"dont": r"\b(don'?t|do not|never)\b", "again": r"\b(again|still|de novo)\b"}
FLAG_RES = {k: re.compile(v, re.I | re.M) for k, v in {**STRONG_FLAGS, **WEAK_FLAGS}.items()}
PASTE_LEN = 2500


def _find_repo_root():
    d = os.path.dirname(os.path.abspath(__file__))
    while d != os.path.dirname(d):
        if os.path.exists(os.path.join(d, ".git")):
            return WORKTREE_RE.sub("", d)
        d = os.path.dirname(d)
    return None


SELF_ROOT = _find_repo_root()
SCRATCH_ROOTS = {"/tmp", "/private/tmp", "/var/folders", "/private/var/folders",
                 os.path.realpath(tempfile.gettempdir())}


def short_hash(text, n=4):
    return hashlib.sha256(text.encode()).hexdigest()[:n]


def under(path, root):
    return bool(root) and (path == root or path.startswith(root.rstrip("/") + "/"))


def later_pass_prompt(text):
    return bool(FOLLOWUP_RE.search(text[:FOLLOWUP_HEAD]))


def later_pass_name(name):
    return bool(FOLLOWUP_NAME_RE.search(name))


def ts_of(value):
    if not value:
        return None
    try:
        return dt.datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return None


def vkey(version):
    return tuple(int(x) for x in re.findall(r"\d+", version)[:3])


class Window:
    """Local-time date window, both ends inclusive."""

    def __init__(self, since, until):
        self.since, self.until = since, until
        self.start = dt.datetime.combine(since, dt.time()).timestamp()
        self.end = dt.datetime.combine(until + dt.timedelta(days=1), dt.time()).timestamp()

    def __contains__(self, ts):
        return ts is not None and self.start <= ts < self.end

    def __str__(self):
        return f"{self.since}..{self.until}"

    @staticmethod
    def week(ts):
        d = dt.date.fromtimestamp(ts)
        return (d - dt.timedelta(days=d.weekday())).strftime("%m-%d")

    def weeks(self):
        d = self.since - dt.timedelta(days=self.since.weekday())
        out = []
        while d <= self.until:
            out.append(d.strftime("%m-%d"))
            d += dt.timedelta(days=7)
        return out

    def show(self, week):
        """Week label for display; * marks a week the window only partly covers."""
        weeks = self.weeks()
        partial = (week == weeks[0] and self.since.weekday() != 0) or (week == weeks[-1] and self.until.weekday() != 6)
        return week + "*" if partial else week


class Labeler:
    """Turns paths and names into neutral labels unless local detail is on."""

    def __init__(self, detail, public_plugins):
        self.detail = detail
        self.public = set(public_plugins)

    def project(self, cwd):
        if not cwd:
            return "unknown"
        root = WORKTREE_RE.sub("", cwd.rstrip("/"))
        if under(root, SELF_ROOT):
            return "self"
        if any(under(root, s) for s in SCRATCH_ROOTS):
            return "scratch"
        if self.detail:
            return root.replace(HOME, "~", 1)
        return "proj-" + short_hash(root)

    def name(self, qualified):
        """qualified is '<plugin|user|project|self|custom>:<name>' or a bare built-in agent type."""
        scope, sep, bare = qualified.partition(":")
        if not sep or scope in self.public or scope == "self":
            return qualified  # built-in agent types and public or repo-own names
        if self.detail:
            return bare if scope == "custom" else qualified
        prefix = {"user": "user", "project": "project", "custom": "agent"}.get(scope, "plugin")
        return f"{prefix}-{short_hash(qualified)}"


def local_scope(path, cwd=None):
    if cwd and not os.path.isabs(path) and not path.startswith("~"):
        path = os.path.join(cwd, path)
    path = path.replace("~", HOME, 1) if path.startswith("~") else path
    if under(WORKTREE_RE.sub("", path), SELF_ROOT):
        return "self"
    if under(path, CLAUDE_HOME) or under(path, CODEX_HOME) or under(path, os.path.join(HOME, ".agents")):
        return "user"
    return "project"


class Thread:
    """One transcript file reduced to what the reports need. Text never leaves this object
    unless --local-detail is on."""

    def __init__(self, host, tid, origin):
        self.host, self.id, self.origin = host, tid, origin  # origin: main | sub | workflow | guardian
        self.parent = self.workflow = self.agent_type = None
        self.name = ""            # Codex agent task name; used for classification, never printed
        self.contract = None       # workbench agent a Codex spawn message names (0.42.0 on)
        self.cwd = self.project = None
        self.automated = False     # SDK or `codex exec` sessions: no human at the keyboard
        self.first = self.last = None
        self.rounds = []           # [start, end, kind]; kind: initial | followup | other
        self.round_open = False
        self.first_prompt = ""     # first 900 chars of a subagent's dispatch prompt; never printed
        self.versions = []         # (ts, plugin, version, 'skills'|'agents', name)
        self.agent_hints = set()   # local agent definitions read (Codex)
        self.skills = []           # (ts, qualified, how); how: model | user | read
        self.prompts = []          # (ts, strong_flags, weak_flags, length, text-or-None)
        self.interrupts = []
        self.rejections = []
        self.tokens = Counter()    # input (uncached), cache_read, cache_write, output
        self.models = Counter()

    def touch(self, ts):
        if self.first is None or ts < self.first:
            self.first = ts
        if self.last is None or ts > self.last:
            self.last = ts
        if self.round_open and ts > self.rounds[-1][1]:
            self.rounds[-1][1] = ts

    def start_round(self, ts, kind):
        self.rounds.append([ts, ts, kind])
        self.round_open = True

    def note_definition(self, path, ts, cwd=None):
        """A Read or command that opened a SKILL.md or agent definition."""
        m = PLUGIN_PATH_RE.search(path)
        if m:
            plugin, ver, what, name = m.groups()
            if what == "agents":
                name = re.sub(r"\.(md|toml)$", "", name)
            self.versions.append((ts, plugin, ver, what, name))
            if what == "skills" and path.endswith("SKILL.md"):
                self.skills.append((ts, f"{plugin}:{name}", "read"))
            return
        m = LOCAL_SKILL_RE.search(path)
        if m:
            self.skills.append((ts, f"{local_scope(path, cwd)}:{m.group(1)}", "read"))
            return
        m = LOCAL_AGENT_RE.search(path)
        if m:
            self.agent_hints.add(m.group(1))

    def note_prompt(self, ts, text, keep_text):
        head = text[:600]
        if len(text) > PASTE_LEN:
            strong, weak = (), ()
        else:
            strong = tuple(k for k in STRONG_FLAGS if FLAG_RES[k].search(head))
            weak = tuple(k for k in WEAK_FLAGS if FLAG_RES[k].search(head))
        self.prompts.append((ts, strong, weak, len(text), head if keep_text else None))

    def active(self):
        return sum(e - s for s, e, _ in self.rounds)

    def total_tokens(self):
        return sum(self.tokens.values())


def workbench_version_at(thread, ts):
    """The workbench version a session had loaded around ts: latest at or before, else earliest after."""
    vs = sorted((t, v) for t, p, v, _, _ in (thread.versions if thread else []) if p == "workbench")
    before = [v for t, v in vs if t <= ts]
    if before:
        return before[-1]
    return vs[0][1] if vs else None


def summary(values):
    xs = sorted(v for v in values if v is not None)
    if not xs:
        return None
    n = len(xs)
    mid = n // 2
    med = xs[mid] if n % 2 else (xs[mid - 1] + xs[mid]) / 2
    return {"n": n, "median": med, "p90": xs[min(n - 1, int(n * 0.9))], "mean": sum(xs) / n}


def table(headers, rows):
    rows = [[str(c) for c in r] for r in rows]
    widths = [max(len(h), *(len(r[i]) for r in rows)) if rows else len(h) for i, h in enumerate(headers)]
    lines = ["  ".join(h.ljust(w) if i == 0 else h.rjust(w) for i, (h, w) in enumerate(zip(headers, widths)))]
    for r in rows:
        lines.append("  ".join(c.ljust(w) if i == 0 else c.rjust(w) for i, (c, w) in enumerate(zip(r, widths))))
    return "\n".join(lines)


def human_tokens(n):
    for unit, size in (("B", 1e9), ("M", 1e6), ("k", 1e3)):
        if n >= size:
            return f"{n / size:.1f}{unit}"
    return str(int(n))
