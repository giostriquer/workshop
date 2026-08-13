#!/usr/bin/env node
// adopt-global-rules — install the workshop's global agent configuration onto
// this machine, additively.
//
// Two kinds of content:
//   globals/  a whole instruction document, authored per host (Claude and Codex
//             want different things said), installed as one managed block.
//   rules/    discrete single-source rules fanned out to every host.
//
// The contract is narrow on purpose: the pack owns its own marked blocks and
// nothing else. Content outside those markers is never rewritten, and a target
// file that exists without a marker is reported, never touched.

import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

// ── args ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const val = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null;
};

if (has("--help") || has("-h")) {
  console.log(`adopt-global-rules — install global agent configuration onto this machine

  --dry-run        plan only; write nothing
  --json           machine-readable plan/result
  --tier <t>       core | all   (default: all — core plus eligible optional)
  --host <ids>     comma-separated host ids (default: every detected host)
  --skip-globals   install rules only; leave the global instruction doc alone
  --root <dir>     treat <dir> as the home directory (testing)
  --prune          remove managed blocks whose rule left the manifest
  -h, --help       this text

Exit codes: 0 clean · 2 collisions or orphans need attention · 1 error`);
  process.exit(0);
}

const dryRun = has("--dry-run");
const asJson = has("--json");
const prune = has("--prune");
const skipGlobals = has("--skip-globals");
const tier = val("--tier") ?? "all";
const hostFilter = (val("--host") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const root = resolve(val("--root") ?? homedir());

if (!["core", "all"].includes(tier)) {
  console.error(`--tier must be "core" or "all", got "${tier}"`);
  process.exit(1);
}

// ── markers ──────────────────────────────────────────────────────────────────
// Block-level HTML comments are stripped from memory files before they reach a
// model's context, so the marker is free to carry: visible on disk, invisible
// in the session.
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const NS = "workshop";
// Namespaces this installer still recognises on disk but no longer writes.
// A marker rename that does not carry its predecessors makes every block
// already on a machine invisible — the installer would append a second copy of
// everything and report no orphan, because orphan detection keys on the same
// pattern. Retire an entry only once no machine can still be carrying it.
const LEGACY_NS = ["agent-workshop"];
const NS_ALT = [NS, ...LEGACY_NS].map(esc).join("|");

const OPEN = (id, ns = NS) => `<!-- ${ns}:rule id=${id} -->`;
const CLOSE = (id, ns = NS) => `<!-- /${ns}:rule id=${id} -->`;
const ANY_MANAGED = new RegExp(
  `<!--\\s*(?:${NS_ALT}):rule id=([A-Za-z0-9._-]+)\\s*-->[\\s\\S]*?<!--\\s*\\/(?:${NS_ALT}):rule id=\\1\\s*-->`,
  "g"
);
const ANY_OPEN = new RegExp(`<!--\\s*(?:${NS_ALT}):rule id=([A-Za-z0-9._-]+)\\s*-->`, "g");
const isManaged = (text, id) => [NS, ...LEGACY_NS].some((ns) => text.includes(OPEN(id, ns)));

const lf = (s) => s.replace(/\r\n/g, "\n");

// ── manifest ─────────────────────────────────────────────────────────────────
let manifest;
try {
  manifest = JSON.parse(readFileSync(join(HERE, "rules", "manifest.json"), "utf8"));
} catch (err) {
  console.error(`Could not read the pack manifest: ${err.message}`);
  process.exit(1);
}

const GLOBAL_DOC_ID = manifest.globalDocId ?? "globals";
const packFile = (rel) => lf(readFileSync(join(HERE, rel), "utf8")).trim();

// The global-doc id is reserved, so it is a known id for orphan purposes even
// though it is not a rule.
const knownIds = new Set([...manifest.rules.map((r) => r.id), GLOBAL_DOC_ID]);

// ── host detection ───────────────────────────────────────────────────────────
for (const id of hostFilter) {
  if (!manifest.hosts.some((h) => h.id === id)) {
    console.error(`Unknown host "${id}". Known: ${manifest.hosts.map((h) => h.id).join(", ")}`);
    process.exit(1);
  }
}

const hosts = manifest.hosts
  .filter((h) => !hostFilter.length || hostFilter.includes(h.id))
  .map((h) => ({ ...h, present: existsSync(join(root, h.detect)) }));

// An optional rule's precondition is evaluated per host: the same rule can be
// eligible on one host and skipped on another.
function preconditionMet(rule, host) {
  if (!rule.requires?.mcp) return { ok: true };
  for (const rel of host.mcpConfigs ?? []) {
    const p = join(root, rel);
    if (!existsSync(p)) continue;
    try {
      if (readFileSync(p, "utf8").includes(rule.requires.mcp)) return { ok: true, foundIn: rel };
    } catch {
      /* unreadable config is not a precondition failure we can diagnose */
    }
  }
  return {
    ok: false,
    reason: `no "${rule.requires.mcp}" MCP server found in ${(host.mcpConfigs ?? []).join(", ") || "any known config"}`,
  };
}

// ── a minimal diff: common prefix/suffix trimmed, the middle shown ───────────
function diffLines(before, after) {
  const a = before.split("\n");
  const b = after.split("\n");
  let s = 0;
  while (s < a.length && s < b.length && a[s] === b[s]) s++;
  let e = 0;
  while (e < a.length - s && e < b.length - s && a[a.length - 1 - e] === b[b.length - 1 - e]) e++;
  const removed = a.slice(s, a.length - e);
  const added = b.slice(s, b.length - e);
  return [...removed.map((l) => `- ${l}`), ...added.map((l) => `+ ${l}`)].join("\n");
}

// ── per-file edit accumulation ───────────────────────────────────────────────
// A single file can receive several blocks — on Codex the global doc and every
// rule all land in AGENTS.md. Reading and writing it once per block would make
// each pass blind to the previous one, so all edits accumulate in memory and
// the file is written exactly once.
const fileStates = new Map();
function fileState(path) {
  if (!fileStates.has(path)) {
    const raw = existsSync(path) ? readFileSync(path, "utf8") : "";
    fileStates.set(path, { path, raw, text: lf(raw), hadCrlf: raw.includes("\r\n") });
  }
  return fileStates.get(path);
}

function upsertBlock(st, id, body, legacyMarkers = []) {
  const block = `${OPEN(id)}\n${body}\n${CLOSE(id)}`;
  const fenced = new RegExp(`${esc(OPEN(id))}[\\s\\S]*?${esc(CLOSE(id))}`);

  const hit = st.text.match(fenced);
  if (hit) {
    if (hit[0] === block) return { action: "unchanged" };
    st.text = st.text.replace(fenced, () => block);
    return { action: "updated", diff: diffLines(hit[0], block) };
  }

  // A block written under a retired marker namespace: rewrite it in place under
  // the current one rather than appending a second copy beside it.
  for (const ns of LEGACY_NS) {
    const legacy = new RegExp(`${esc(OPEN(id, ns))}[\\s\\S]*?${esc(CLOSE(id, ns))}`);
    const lhit = st.text.match(legacy);
    if (lhit) {
      st.text = st.text.replace(legacy, () => block);
      return { action: "updated", migratedFrom: `${ns}:rule`, diff: diffLines(lhit[0], block) };
    }
  }

  // Legacy form: the same marker used as both opening and closing fence, which
  // is how these blocks were maintained by hand before the pack existed.
  // Recognising it is what stops adoption from appending a duplicate.
  for (const marker of legacyMarkers) {
    const tag = `<!-- ${marker} -->`;
    const first = st.text.indexOf(tag);
    const second = first >= 0 ? st.text.indexOf(tag, first + tag.length) : -1;
    if (first >= 0 && second > first) {
      const span = st.text.slice(first, second + tag.length);
      st.text = st.text.slice(0, first) + block + st.text.slice(second + tag.length);
      return { action: "updated", migratedFrom: tag, diff: diffLines(span, block) };
    }
  }

  const sep = st.text.trim().length ? "\n\n" : "";
  st.text = `${st.text.replace(/\s*$/, "")}${sep}${block}\n`;
  return { action: "added" };
}

// ── planning ─────────────────────────────────────────────────────────────────
const actions = [];
const orphans = [];
const unmanaged = {};
const deletes = new Set();

const eligible = manifest.rules.filter((r) => tier === "all" || r.tier === "core");

for (const host of hosts) {
  unmanaged[host.id] = [];

  if (!host.present) {
    actions.push({
      hostId: host.id,
      ruleId: null,
      action: "skipped",
      reason: `${host.label} not installed (no ~/${host.detect})`,
    });
    continue;
  }

  const touchedFiles = new Set();

  // ── 1. the global instruction document ─────────────────────────────────────
  if (host.globalDoc && !skipGlobals) {
    const path = join(root, host.globalDoc.target);
    const st = fileState(path);
    touchedFiles.add(path);
    const r = upsertBlock(st, GLOBAL_DOC_ID, packFile(host.globalDoc.file));
    actions.push({ hostId: host.id, ruleId: GLOBAL_DOC_ID, kind: "global-doc", path, source: host.globalDoc.file, ...r });
  }

  // ── 2. the rules ───────────────────────────────────────────────────────────
  if (host.mode === "dir") {
    const dir = join(root, host.target);
    for (const rule of eligible) {
      const pre = preconditionMet(rule, host);
      if (!pre.ok) {
        actions.push({ hostId: host.id, ruleId: rule.id, kind: "rule", action: "skipped", reason: pre.reason });
        continue;
      }
      const path = join(dir, `${rule.id}.md`);
      const desired = `${OPEN(rule.id)}\n\n${packFile(rule.file)}\n`;
      const st = fileState(path);

      if (!st.raw) {
        st.text = desired;
        actions.push({ hostId: host.id, ruleId: rule.id, kind: "rule", action: "added", path });
        continue;
      }
      if (!isManaged(st.text, rule.id)) {
        actions.push({
          hostId: host.id,
          ruleId: rule.id,
          kind: "rule",
          action: "collision",
          path,
          reason: "a file already exists at this path without a pack marker — it is yours, so it was left untouched",
        });
        fileStates.delete(path); // never write a file we do not own
        continue;
      }
      if (st.text === desired) {
        actions.push({ hostId: host.id, ruleId: rule.id, kind: "rule", action: "unchanged", path });
        continue;
      }
      const diff = diffLines(st.text, desired);
      st.text = desired;
      actions.push({ hostId: host.id, ruleId: rule.id, kind: "rule", action: "updated", path, diff });
    }

    // Orphans and unmanaged files across the whole rules directory.
    if (existsSync(dir)) {
      for (const name of readdirSync(dir).filter((n) => n.endsWith(".md"))) {
        const p = join(dir, name);
        const body = lf(readFileSync(p, "utf8"));
        const ids = [...body.matchAll(ANY_OPEN)].map((x) => x[1]);
        for (const id of ids) {
          if (!knownIds.has(id)) {
            orphans.push({ hostId: host.id, ruleId: id, path: p, pruned: prune });
            // Safe to delete outright: the file carries a pack marker, so the
            // pack wrote it. An unmarked file is a collision, handled above.
            if (prune) deletes.add(p);
          }
        }
        // A rules directory is a flat namespace, so a rule the user wrote under
        // a different filename never collides — it just sits alongside the
        // pack's copy saying the same thing twice. Only a reader catches that.
        if (!ids.length) unmanaged[host.id].push({ source: p, content: body.trim() });
      }
    }
  } else {
    const path = join(root, host.target);
    const st = fileState(path);
    touchedFiles.add(path);
    for (const rule of eligible) {
      const pre = preconditionMet(rule, host);
      if (!pre.ok) {
        actions.push({ hostId: host.id, ruleId: rule.id, kind: "rule", action: "skipped", reason: pre.reason });
        continue;
      }
      const r = upsertBlock(st, rule.id, packFile(rule.file), rule.legacyMarkers ?? []);
      actions.push({ hostId: host.id, ruleId: rule.id, kind: "rule", path, ...r });
    }
  }

  // ── 3. orphans and unmanaged prose in every single file this host touches ──
  for (const path of touchedFiles) {
    const st = fileState(path);
    for (const m of [...st.text.matchAll(ANY_OPEN)]) {
      const id = m[1];
      if (knownIds.has(id)) continue;
      orphans.push({ hostId: host.id, ruleId: id, path, pruned: prune });
      if (prune) {
        st.text = st.text.replace(
          new RegExp(`\\n*<!--\\s*(?:${NS_ALT}):rule id=${esc(id)}\\s*-->[\\s\\S]*?<!--\\s*\\/(?:${NS_ALT}):rule id=${esc(id)}\\s*-->\\n*`),
          "\n\n"
        );
      }
    }
    // Everything the pack does not own, handed back verbatim. This is the
    // skill's input: only a reader can tell whether this prose duplicates or
    // contradicts something the pack is about to install.
    const outside = st.text.replace(ANY_MANAGED, "").replace(/\n{3,}/g, "\n\n").trim();
    if (outside) unmanaged[host.id].push({ source: path, content: outside });
  }
}

// ── apply ────────────────────────────────────────────────────────────────────
const writes = [];
for (const st of fileStates.values()) {
  const content = st.hadCrlf ? st.text.replace(/\n/g, "\r\n") : st.text;
  if (content !== st.raw) writes.push({ path: st.path, content });
}

if (!dryRun) {
  for (const w of writes) {
    mkdirSync(dirname(w.path), { recursive: true });
    writeFileSync(w.path, w.content);
  }
  for (const path of deletes) unlinkSync(path);
}

const collisions = actions.filter((a) => a.action === "collision");
const result = {
  root,
  dryRun,
  tier,
  packVersion: manifest.packVersion,
  hosts: hosts.map((h) => ({ id: h.id, label: h.label, present: h.present, target: h.target, globalDoc: h.globalDoc?.target ?? null })),
  actions,
  orphans,
  collisions,
  unmanaged,
};

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(collisions.length || orphans.length ? 2 : 0);
}

// ── report ───────────────────────────────────────────────────────────────────
const icon = { added: "+", updated: "~", unchanged: "=", skipped: ".", collision: "!" };
console.log(`adopt-global-rules — pack v${manifest.packVersion}${dryRun ? " (dry run — nothing written)" : ""}`);
console.log(`home: ${root}\n`);

for (const host of hosts) {
  const mine = actions.filter((a) => a.hostId === host.id);
  const targets = [...new Set([host.globalDoc && !skipGlobals ? host.globalDoc.target : null, host.target].filter(Boolean))];
  const where = host.present ? targets.join(" + ") : "not installed";
  console.log(`## ${host.label} — ${where}`);
  for (const a of mine) {
    const label = a.kind === "global-doc" ? `${a.ruleId} (global doc)` : a.ruleId ?? "(host)";
    console.log(
      `  ${icon[a.action] ?? "?"} ${label} — ${a.action}${a.reason ? `: ${a.reason}` : ""}${a.migratedFrom ? ` (migrated legacy ${a.migratedFrom})` : ""}`
    );
    if (a.diff) console.log(a.diff.split("\n").map((l) => `      ${l}`).join("\n"));
  }
  console.log("");
}

const unmanagedCount = Object.values(unmanaged).reduce((n, list) => n + list.length, 0);
if (unmanagedCount) {
  console.log(`## Unmanaged — ${unmanagedCount}`);
  console.log(`Content the pack does not own. Read it: something you wrote under a different`);
  console.log(`name is not a collision, it is a duplicate nothing here can detect.`);
  for (const [hostId, list] of Object.entries(unmanaged)) {
    for (const u of list) console.log(`  ? ${hostId} — ${u.source} (${u.content.split("\n").length} lines)`);
  }
  console.log("");
}

if (orphans.length) {
  console.log(`## Orphans — ${orphans.length}`);
  for (const o of orphans) {
    console.log(`  ? ${o.ruleId} in ${o.path} — no longer in the manifest${o.pruned ? " (pruned)" : "; re-run with --prune to remove"}`);
  }
  console.log("");
}

if (collisions.length) {
  console.log(`## Collisions — ${collisions.length}`);
  console.log(`These were left exactly as found. They are yours, not the pack's.`);
  for (const c of collisions) console.log(`  ! ${c.ruleId} — ${c.path}`);
  console.log("");
}

process.exit(collisions.length || orphans.length ? 2 : 0);
