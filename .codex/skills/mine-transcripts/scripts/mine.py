#!/usr/bin/env python3
"""Cross-session statistics over this machine's Claude Code and Codex transcripts.

  skills     skill invocations per skill and week, per host
  reviewers  test-quality, code-quality and contract reviewer and ci-watcher time by rubric version
  friction   candidate user corrections, interrupts and tool rejections (counts only by default)
  spend      subagent and workflow dispatches, agent-hours and tokens

Default output is aggregate numbers and neutral labels (proj-<hash>, <scope>-<hash>), safe to
quote. --local-detail prints real project paths, names and prompt text for reading on this
machine only; never paste that output into a repository, PR or ticket.
"""

import argparse
import datetime as dt
import json
import sys
from collections import Counter, defaultdict

sys.dont_write_bytecode = True  # keep the skill folder free of __pycache__

import claude_code  # noqa: E402
import codex  # noqa: E402
from common import (  # noqa: E402
    BUILTIN_AGENTS, PASTE_LEN, Labeler, Window, human_tokens, later_pass_name, later_pass_prompt, summary, table, vkey,
    workbench_version_at)

WORKBENCH_AGENTS = {"ci-watcher", "code-quality-reviewer", "comment-trimmer", "contract-reviewer",
                    "spec-reviewer", "test-quality-reviewer"}
KINDS = {"tq": ("test-quality-reviewer", "test-quality-review"),
         "cq": ("code-quality-reviewer", "code-quality-review"),
         "ct": ("contract-reviewer", "contract-review"),
         "ci": ("ci-watcher", None)}
RUBRIC_KINDS = [k for k, (_, rubric) in KINDS.items() if rubric]
# Generic rubric readers are candidates; workflow agents may be verifying the rubric itself.
RUBRIC_AGENT_TYPES = {"general-purpose", "claude"}


def parse_args(argv):
    shared = argparse.ArgumentParser(add_help=False)
    shared.add_argument("--days", type=int, default=30, help="window: the last N days plus today (default 30)")
    shared.add_argument("--since", type=dt.date.fromisoformat, help="window start, YYYY-MM-DD (local time)")
    shared.add_argument("--until", type=dt.date.fromisoformat, help="window end, inclusive (default today)")
    shared.add_argument("--host", choices=("claude", "codex", "all"), default="all")
    shared.add_argument("--all-projects", action="store_true",
                        help="keep scratch-dir sessions (and, for reviewers, this repo's own probe runs)")
    shared.add_argument("--public-plugins", default="workbench,toolkit",
                        help="plugins whose skill and agent names print as-is (default workbench,toolkit)")
    shared.add_argument("--local-detail", action="store_true",
                        help="real paths, names and prompt text; local reading only, never paste it anywhere")
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("skills", parents=[shared], help="skill invocations per skill and week")
    p.add_argument("--min-count", type=int, default=1, help="hide skills used fewer times")
    p = sub.add_parser("reviewers", parents=[shared], help="reviewer timing by rubric version")
    p.add_argument("--split-at", metavar="VERSION", help="two buckets, <VERSION and >=VERSION, instead of one per version")
    p.add_argument("--kinds", default=",".join(KINDS), help=f"any of {','.join(KINDS)} (default all)")
    p.add_argument("--rows", action="store_true", help="also print one neutral JSON line per dispatch")
    sub.add_parser("friction", parents=[shared], help="candidate corrections and interrupts")
    p = sub.add_parser("spend", parents=[shared], help="subagent and workflow spend")
    p.add_argument("--top", type=int, default=5, help="largest workflow runs to list (default 5)")
    return parser.parse_args(argv)


def load(args):
    until = args.until or dt.date.today()
    since = args.since or until - dt.timedelta(days=args.days)
    window = Window(since, until)
    threads, skipped, reach = [], Counter(), {}
    if args.host in ("claude", "all"):
        claude_threads, reach["claude"] = claude_code.scan(window, keep_text=args.local_detail)
        threads += claude_threads
    if args.host in ("codex", "all"):
        codex_threads, skipped, reach["codex"] = codex.scan(window, keep_text=args.local_detail)
        threads += codex_threads
    labeler = Labeler(args.local_detail, [p for p in args.public_plugins.split(",") if p])
    index = {(th.host, th.id): th for th in threads}
    for th in threads:
        th.project = labeler.project(th.cwd)
    for th in threads:  # a subagent belongs to its root session's project
        root, hops = th, 0
        while root.parent and (th.host, root.parent) in index and hops < 5:
            root, hops = index[(th.host, root.parent)], hops + 1
        if root is not th and root.project != "unknown":
            th.project = root.project
    banner(args, window, threads, skipped, reach)
    return window, threads, labeler, index


def banner(args, window, threads, skipped, reach):
    if args.local_detail:
        print("LOCAL DETAIL: real names and text below. Never paste this output into a repository, PR or ticket.")
    counts = Counter((th.host, th.origin) for th in threads)
    parts = ", ".join(f"{h} {o} {n}" for (h, o), n in sorted(counts.items()))
    print(f"{args.command}  window {window}  host={args.host}  threads: {parts or 'none'}")
    if skipped["no_zstd"]:
        print(f"INCOMPLETE: {skipped['no_zstd']} compressed Codex sessions skipped; "
              "reading them needs Python 3.14+")
    if skipped["unreadable"]:
        print(f"INCOMPLETE: {skipped['unreadable']} compressed Codex sessions unreadable")
    for host, r in sorted(reach.items()):
        first_day = r.starts_after(window)
        if first_day:
            print(f"NOTICE: the oldest {host} transcript on this machine was last written {first_day}; the "
                  f"window starts {window.since}, so the days before {first_day} are undercounted")


def keep(th, args):
    return args.all_projects or th.project != "scratch"


def minutes(seconds):
    return None if seconds is None else seconds / 60


def fmt(value, digits=1):
    return "-" if value is None else f"{value:.{digits}f}"


# ---------------------------------------------------------------- skills

def cmd_skills(args):
    window, threads, labeler, _ = load(args)
    weeks = window.weeks()
    for host in sorted({th.host for th in threads}):
        agg = defaultdict(Counter)
        sessions = Counter()
        for th in threads:
            if th.host != host or not keep(th, args):
                continue
            if th.origin == "main" and not th.automated:
                sessions[window.week(th.first)] += 1
            invoked = {q for _, q, how in th.skills if how != "read"}
            reads = set()
            for ts, q, how in sorted(th.skills):
                if how == "read":  # one per thread; a skill invoked in the thread is not also a read
                    if q in invoked or q in reads:
                        continue
                    reads.add(q)
                c = agg[labeler.name(q)]
                c["total"] += 1
                c[how] += 1
                c["sub"] += th.origin != "main"
                c[window.week(ts)] += 1
        rows = [[name, c["total"], c["model"], c["user"], c["read"], c["sub"], *(c[w] for w in weeks)]
                for name, c in sorted(agg.items(), key=lambda kv: (-kv[1]["total"], kv[0]))
                if c["total"] >= args.min_count]
        print(f"\n[{host}] interactive main sessions per week: "
              + " ".join(f"{window.show(w)}={sessions[w]}" for w in weeks))
        print(table(["skill", "total", "model", "user", "read", "in-sub", *map(window.show, weeks)], rows))
    print("\nmodel = Skill tool call; user = slash command or a /name typed in the prompt (Claude), or $mention "
          "(Codex); read = SKILL.md opened by path (Read, cat, sed -n and the like, not a search, diff or edit), "
          "once per thread (Codex has no Skill tool, so a read is how its model invokes a skill); "
          "in-sub = inside a subagent. Weeks start Monday; * marks a partial week.")


# ---------------------------------------------------------------- reviewers

def classify(th):
    """Return a possible reviewer kind and the evidence identifying it."""
    if th.contract:
        return next((kind for kind, (agent, _) in KINDS.items() if agent == th.contract), None), "contract"
    base = (th.agent_type or "").split(":")[-1]
    for kind, (agent, _) in KINDS.items():
        if base == agent:
            return kind, "agent-type"
    if th.host == "claude":
        if th.agent_type in RUBRIC_AGENT_TYPES:
            rubrics = {v[4] for v in th.versions if v[3] == "skills"}
            for kind in RUBRIC_KINDS:
                if KINDS[kind][1] in rubrics:
                    return kind, "rubric-read"
        return None, "agent-type" if base else "unknown"
    if base and base not in {"default", "worker", "explorer"}:
        return None, "agent-type"
    agents = {v[4] for v in th.versions if v[3] == "agents"} | th.agent_hints
    for kind, (agent, _) in KINDS.items():
        if agent in agents:
            return kind, "agent-read"
    n = th.name.lower()
    rubrics = {v[4] for v in th.versions if v[3] == "skills"}
    tq, cq, ct = (KINDS[k][1] in rubrics for k in ("tq", "cq", "ct"))
    if "watch" in n or ("ci_" in n and "fix" not in n):
        return "ci", "task-name"
    if ("test" in n and "review" in n) or "test_quality" in n or "tqr" in n:
        return "tq", "task-name"
    if "contract" in n and "review" in n:
        return "ct", "task-name"
    if any(x in n for x in ("review", "audit_diff", "adversarial")):
        return ("tq" if tq and not cq else "ct" if ct and not cq and not tq else "cq"), "task-name"
    return ("tq" if tq else "cq" if cq else "ct", "rubric-read") if tq or cq or ct else (None, "unknown")


def rubric_version(th, kind, index):
    agent, rubric = KINDS[kind]
    own = [v[2] for v in th.versions if v[1] == "workbench"
           and ((v[3] == "skills" and v[4] == rubric) or (v[3] == "agents" and v[4] == agent))]
    if own:
        return max(own, key=vkey), "read"
    parent, hops = index.get((th.host, th.parent)), 0
    while parent is not None and hops < 5:
        ver = workbench_version_at(parent, th.first)
        if ver:
            return ver, "parent"
        parent, hops = index.get((th.host, parent.parent)), hops + 1
    return None, "none"


def other_reviewer(th, identity_source, labeler):
    """Label for a dispatch whose confirmed role is a reviewer this command has no table for."""
    role = th.contract if identity_source == "contract" else th.agent_type
    if not role or not role.split(":")[-1].endswith("-reviewer"):
        return None
    if identity_source == "contract" and role in WORKBENCH_AGENTS:
        role = f"workbench:{role}"  # the header drops the plugin; any other name stays hashed
    return f"{th.host} {labeler.name(role if ':' in role else f'custom:{role}')}"


def cmd_reviewers(args):
    window, threads, labeler, index = load(args)
    kinds = [k.strip() for k in args.kinds.split(",") if k.strip() in KINDS]
    dispatches, excluded, unknown, untabulated = [], Counter(), Counter(), Counter()
    for th in threads:
        if th.origin not in ("sub", "workflow"):
            continue
        if th.project in ("self", "scratch") and not args.all_projects:
            excluded[f"{th.project} project"] += 1
            continue
        if not th.rounds:
            excluded["no dispatch prompt in window"] += 1
            continue
        kind, identity_source = classify(th)
        if identity_source == "unknown":
            unknown[th.host] += 1
        if kind is None and identity_source in {"contract", "agent-type"}:
            untabulated[other_reviewer(th, identity_source, labeler)] += 1
        if kind not in kinds:
            continue
        version, source = rubric_version(th, kind, index)
        durations = [minutes(e - s) for s, e, _ in th.rounds]
        first_is_followup = later_pass_prompt(th.first_prompt) if th.host == "claude" else later_pass_name(th.name)
        followups = [d for d, r in zip(durations[1:], th.rounds[1:]) if r[2] == "followup"]
        dispatches.append({
            "host": th.host, "kind": kind, "project": th.project,
            "identity": "confirmed" if identity_source in {"contract", "agent-type"} else "candidate",
            "identity_source": identity_source,
            "start": dt.datetime.fromtimestamp(th.first).strftime("%Y-%m-%d %H:%M"),
            "version": version, "version_source": source,
            "wall": minutes(th.last - th.first), "active": minutes(th.active()),
            "initial": None if first_is_followup else durations[0],
            "followups": ([durations[0]] if first_is_followup else []) + followups,
        })

    def bucket(version):
        if version is None:
            return "unknown"
        if args.split_at:
            return f">={args.split_at}" if vkey(version) >= vkey(args.split_at) else f"<{args.split_at}"
        return version

    def order(b):
        if b == "unknown":
            return (1, ())
        return (0, vkey(b.lstrip("<>=")) + ((1,) if b.startswith(">=") else (0,)))

    headers = ["bucket", "host", "identity", "disp", "w/fu", "wall med", "wall p90", "active med",
               "init n", "init med", "init p90", "fu n", "fu med"]
    for kind in kinds:
        groups = defaultdict(list)
        for x in dispatches:
            if x["kind"] == kind:
                groups[(bucket(x["version"]), x["host"], x["identity"])].append(x)
        rows = []
        for (b, host, identity), xs in sorted(groups.items(), key=lambda kv: (order(kv[0][0]), *kv[0][1:])):
            wall, active = summary(x["wall"] for x in xs), summary(x["active"] for x in xs)
            init = summary(x["initial"] for x in xs)
            fu = summary(f for x in xs for f in x["followups"])
            rows.append([b, host, identity, len(xs), sum(1 for x in xs if x["followups"]),
                         fmt(wall["median"]), fmt(wall["p90"]), fmt(active["median"]),
                         init["n"] if init else 0, fmt(init and init["median"]), fmt(init and init["p90"]),
                         fu["n"] if fu else 0, fmt(fu and fu["median"])])
        print(f"\n{KINDS[kind][0]} (minutes)")
        print(table(headers, rows) if rows else "  no dispatches")
    sources = Counter(x["version_source"] for x in dispatches)
    print("\nidentity: confirmed = explicit contract or registered role; candidate = name or definition read. "
          "Candidates need manual role verification; session durations are not mutation-lane times.")
    if unknown:
        print("unknown role: " + ", ".join(f"{host} {n}" for host, n in sorted(unknown.items())))
    del untabulated[None]
    if untabulated:
        print("not tabulated: " + ", ".join(f"{label} {n}" for label, n in sorted(untabulated.items()))
              + "  (confirmed reviewer roles with no table here; spend lists their time)")
    print("\nversion source: " + ", ".join(f"{k} {v}" for k, v in sorted(sources.items()))
          + "  (read = the agent opened its rubric or agent file; parent = the dispatching session's loaded version)")
    if excluded:
        print("excluded: " + ", ".join(f"{k} {v}" for k, v in sorted(excluded.items()))
              + "  (--all-projects includes self/scratch projects)")
    if args.rows:
        for x in sorted(dispatches, key=lambda x: x["start"]):
            print(json.dumps({k: (round(v, 1) if isinstance(v, float) else
                                  [round(f, 1) for f in v] if isinstance(v, list) else v) for k, v in x.items()}))


# ---------------------------------------------------------------- friction

def cmd_friction(args):
    window, threads, _, _ = load(args)
    weeks = window.weeks()
    for host in sorted({th.host for th in threads}):
        per = defaultdict(Counter)
        flags = Counter()
        flagged_sessions = set()
        detail = []
        for th in threads:
            if th.host != host or th.automated or not keep(th, args):
                continue
            if th.host == "claude":
                for ts in th.rejections:
                    per[window.week(ts)]["rejections"] += 1
            if th.origin != "main":
                continue
            for ts in th.interrupts:
                per[window.week(ts)]["interrupts"] += 1
            for ts, strong, weak, length, text in th.prompts:
                w = per[window.week(ts)]
                w["prompts"] += 1
                w["pasted"] += length > PASTE_LEN
                flags.update(strong + weak)
                if strong:
                    w["flagged"] += 1
                    flagged_sessions.add(th.id)
                    if text is not None:
                        detail.append((ts, th.project, strong, text))
        rows = []
        for w in weeks:
            c = per[w]
            rate = f"{100 * c['flagged'] / c['prompts']:.0f}%" if c["prompts"] else "-"
            rows.append([window.show(w), c["prompts"], c["flagged"], rate, c["interrupts"],
                         c["rejections"] if host == "claude" else "-", c["pasted"]])
        print(f"\n[{host}]")
        print(table(["week", "prompts", "flagged", "rate", "interrupts", "rejections", "pasted"], rows))
        print("flag hits: " + (", ".join(f"{k} {v}" for k, v in flags.most_common()) or "none")
              + f"; sessions with a flagged prompt: {len(flagged_sessions)}")
        for ts, project, strong, text in sorted(detail):
            one_line = " ".join(text.split())[:200]
            print(f"  {dt.datetime.fromtimestamp(ts):%m-%d %H:%M} {project} [{','.join(strong)}] {one_line}")
    print("\nflagged = a strong pattern (negation, why, i_said, wrong, still_broken, you_didnt, revert) in the first "
          f"600 chars of a typed prompt under {PASTE_LEN} chars; prompts include reports the user relays by paste. "
          "Candidates and a lower bound: read them (--local-detail) before concluding. * marks a partial week.")


# ---------------------------------------------------------------- spend

def agent_label(th, labeler):
    if th.host == "codex":
        if th.origin == "guardian":
            return "guardian (auto-review)"
        kind, source = classify(th)
        if kind:
            prefix = "" if source in {"contract", "agent-type"} else "candidate "
            return prefix + KINDS[kind][0]
        return "other subagent"
    at = th.agent_type or "unknown"
    return labeler.name(at if ":" in at or at in BUILTIN_AGENTS or at == "unknown" else f"custom:{at}")


def cmd_spend(args):
    window, threads, labeler, _ = load(args)
    weeks = window.weeks()
    for host in sorted({th.host for th in threads}):
        hs = [th for th in threads if th.host == host and keep(th, args)]
        all_tokens = sum(th.total_tokens() for th in hs) or 1

        def line(label, group, hours=True):
            tok = sum(th.total_tokens() for th in group)
            wall = sum(th.last - th.first for th in group) / 3600
            active = sum(th.active() or (th.last - th.first) for th in group) / 3600
            return [label, len(group), f"{active:.1f}" if hours else "-", f"{wall:.1f}" if hours else "-",
                    human_tokens(tok), f"{100 * tok / all_tokens:.0f}%"]

        mains = [th for th in hs if th.origin == "main"]
        subs = [th for th in hs if th.origin == "sub"]
        flows = [th for th in hs if th.origin == "workflow"]
        guards = [th for th in hs if th.origin == "guardian"]
        print(f"\n[{host}]")
        rows = [line("main sessions", mains, hours=False), line("subagents (direct)", subs)]
        if flows:
            rows.append(line("workflow agents", flows))
        if guards:
            rows.append(line("guardian (auto-review)", guards))
        print(table(["group", "threads", "active h", "wall h", "tokens", "share"], rows))

        by_type = defaultdict(list)
        for th in subs + flows:
            by_type[agent_label(th, labeler) if th.origin == "sub" else "workflow agents"].append(th)
        rows = []
        for label, group in sorted(by_type.items(), key=lambda kv: -sum(t.total_tokens() for t in kv[1])):
            models = Counter()
            for th in group:
                models.update(th.models)
            rows.append(line(label, group) + [models.most_common(1)[0][0] if models else "-"])
        if rows:
            print("\nby agent type")
            print(table(["type", "dispatches", "active h", "wall h", "tokens", "share", "top model"], rows))

        rows = []
        for w in weeks:
            ws = [th for th in subs if window.week(th.first) == w]
            wf = [th for th in flows if window.week(th.first) == w]
            hours = (sum(th.active() or (th.last - th.first) for th in ws) + sum(th.last - th.first for th in wf)) / 3600
            runs = [len({(th.parent, th.workflow) for th in wf}), len(wf)] if flows else []
            rows.append([window.show(w), len(ws), *runs, f"{hours:.1f}", human_tokens(sum(th.total_tokens() for th in ws + wf))])
        print("\nper week (subagents and workflows)")
        print(table(["week", "subagents", *(["wf runs", "wf agents"] if flows else []), "agent h", "tokens"], rows))

        if flows:
            runs = defaultdict(list)
            for th in flows:
                runs[(th.parent, th.workflow)].append(th)
            hours = {k: sum(th.last - th.first for th in v) / 3600 for k, v in runs.items()}
            ranked = sorted(runs, key=lambda k: -hours[k])
            total_h = sum(hours.values()) or 1
            top10 = sum(hours[k] for k in ranked[:10])
            print(f"\nworkflows: {len(runs)} runs, {len(flows)} agents, {total_h:.1f} agent-hours (wall); "
                  f"top 10 runs = {100 * top10 / total_h:.0f}% of agent-hours; "
                  f"runs over 20 agents: {sum(1 for v in runs.values() if len(v) > 20)}")
            rows = []
            for i, k in enumerate(ranked[:args.top], 1):
                group = runs[k]
                rows.append([f"run-{i}", dt.date.fromtimestamp(min(t.first for t in group)).isoformat(),
                             group[0].project, len(group), f"{hours[k]:.1f}",
                             human_tokens(sum(t.total_tokens() for t in group))])
            print(table(["run", "started", "project", "agents", "agent h", "tokens"], rows))
    print("\ntokens = uncached input + cache read + cache write + output. active h = time inside dispatch rounds "
          "(idle waits between rounds excluded); wall h = first to last event. Cost is not estimated.")


COMMANDS = {"skills": cmd_skills, "reviewers": cmd_reviewers, "friction": cmd_friction, "spend": cmd_spend}


def main(argv=None):
    args = parse_args(sys.argv[1:] if argv is None else argv)
    COMMANDS[args.command](args)


if __name__ == "__main__":
    main()
