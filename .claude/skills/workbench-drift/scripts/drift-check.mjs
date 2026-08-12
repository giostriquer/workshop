#!/usr/bin/env node
// drift-check.mjs — deterministic half of the workbench-drift skill.
// Fetches the upstream repo named in the manifest, diffs lastReviewed..HEAD over
// the watched paths, maps every change through the manifest's pieces, and emits
// a grouped report (markdown to stdout; --json for machine output). Judgment —
// adopt / adapt / ignore — belongs to the skill, never to this script.
//
// Usage: node drift-check.mjs [--manifest <path>] [--cache <dir>] [--json]

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
function argValue(name) {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
}
const asJson = args.includes("--json");
const scriptDir = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(argValue("--manifest") ?? join(scriptDir, "..", "manifest.json"));

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const { repo, ref, watchPaths, lastReviewed } = manifest.upstream;
const cacheDir = resolve(
  argValue("--cache") ?? join(tmpdir(), "workbench-drift", repo.replace(/[^a-zA-Z0-9]+/g, "-"))
);

function git(cliArgs, opts = {}) {
  const res = spawnSync("git", cliArgs, { encoding: "utf8", cwd: opts.cwd, maxBuffer: 64 * 1024 * 1024 });
  if (res.error) throw res.error;
  if (res.status !== 0 && !opts.allowFail) {
    throw new Error(`git ${cliArgs.join(" ")} failed:\n${res.stderr}`);
  }
  return res.stdout.trim();
}

// -- sync the upstream clone -------------------------------------------------
if (existsSync(join(cacheDir, ".git"))) {
  git(["fetch", "origin", ref], { cwd: cacheDir });
} else {
  git(["clone", "--quiet", repo, cacheDir]);
}
const head = git(["rev-parse", `origin/${ref}`], { cwd: cacheDir });

// -- map an upstream path to its manifest piece (longest prefix wins) --------
function pieceFor(path) {
  let best = null;
  for (const p of manifest.pieces) {
    if (path.startsWith(p.upstreamPath) && (!best || p.upstreamPath.length > best.upstreamPath.length)) {
      best = p;
    }
  }
  return best;
}

// -- initial-pin mode: no reviewed commit yet --------------------------------
if (!lastReviewed.commit) {
  const seen = new Set();
  for (const watch of watchPaths) {
    const listing = git(["ls-tree", "--name-only", head, `${watch}/`], { cwd: cacheDir, allowFail: true });
    for (const entry of listing.split("\n").filter(Boolean)) {
      // normalize dirs to trailing-slash form to match manifest prefixes
      const type = git(["cat-file", "-t", `${head}:${entry}`], { cwd: cacheDir, allowFail: true });
      seen.add(type === "tree" ? `${entry}/` : entry);
    }
  }
  const unmapped = [...seen].filter((e) => !pieceFor(e));
  const missing = manifest.pieces.filter(
    (p) => ![...seen].some((e) => e.startsWith(p.upstreamPath) || p.upstreamPath.startsWith(e))
  );
  const result = { mode: "initial-pin", head, upstreamEntries: [...seen].sort(), unmapped, missing: missing.map((p) => p.upstreamPath) };
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`# workbench-drift — initial pin\n`);
    console.log(`Upstream: ${repo} @ \`${head}\` (ref \`${ref}\`)\n`);
    console.log(`Manifest has no reviewed commit yet (seeded from release ${lastReviewed.release ?? "?"}).`);
    console.log(`Coverage check against the live repo:\n`);
    console.log(`- upstream entries under watched paths: ${result.upstreamEntries.length}`);
    console.log(`- unmapped (need a disposition): ${unmapped.length ? unmapped.join(", ") : "none"}`);
    console.log(`- in manifest but absent upstream: ${result.missing.length ? result.missing.join(", ") : "none"}`);
    console.log(`\nWhen the coverage review is done, pin it:`);
    console.log(`  upstream.lastReviewed.commit = "${head}"`);
  }
  process.exit(0);
}

// -- drift mode: lastReviewed..HEAD ------------------------------------------
const rawStatus = git(
  ["diff", "--name-status", `${lastReviewed.commit}..${head}`, "--", ...watchPaths],
  { cwd: cacheDir }
);

const changes = rawStatus
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [status, ...paths] = line.split("\t");
    return { status, path: paths[paths.length - 1], from: paths.length > 1 ? paths[0] : null };
  });

const groups = { reviewRequired: new Map(), droppedFyi: new Map(), unmapped: [] };
for (const c of changes) {
  const piece = pieceFor(c.path) ?? (c.from ? pieceFor(c.from) : null);
  if (!piece) {
    groups.unmapped.push(c);
  } else if (piece.disposition === "adopted") {
    if (!groups.reviewRequired.has(piece.upstreamPath)) groups.reviewRequired.set(piece.upstreamPath, { piece, files: [] });
    groups.reviewRequired.get(piece.upstreamPath).files.push(c);
  } else {
    groups.droppedFyi.set(piece.upstreamPath, (groups.droppedFyi.get(piece.upstreamPath) ?? 0) + 1);
  }
}

const reviewBlocks = [...groups.reviewRequired.values()].map(({ piece, files }) => ({
  upstreamPath: piece.upstreamPath,
  localPath: piece.localPath,
  why: piece.why,
  adaptations: piece.adaptations ?? null,
  files,
  diff: git(["diff", `${lastReviewed.commit}..${head}`, "--", piece.upstreamPath], { cwd: cacheDir }),
}));

const result = {
  mode: "drift",
  repo,
  ref,
  lastReviewed: lastReviewed.commit,
  head,
  upToDate: changes.length === 0,
  reviewRequired: reviewBlocks,
  intentionallyDropped: [...groups.droppedFyi.entries()].map(([p, n]) => ({ upstreamPath: p, changedFiles: n })),
  unmapped: groups.unmapped,
};

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.log(`# workbench-drift — upstream drift report\n`);
console.log(`Upstream: ${repo} (ref \`${ref}\`)`);
console.log(`Reviewed: \`${lastReviewed.commit}\` → head \`${head}\`\n`);
if (result.upToDate) {
  console.log(`No changes under watched paths. Up to date.`);
  process.exit(0);
}
console.log(`## Review required (adopted pieces) — ${reviewBlocks.length}\n`);
for (const b of reviewBlocks) {
  console.log(`### ${b.upstreamPath} → ${b.localPath}`);
  console.log(`Recorded rationale: ${b.why}`);
  if (b.adaptations) console.log(`Recorded adaptations: ${b.adaptations}`);
  console.log(`Files: ${b.files.map((f) => `${f.status} ${f.path}`).join(", ")}\n`);
  console.log("```diff\n" + b.diff + "\n```\n");
}
console.log(`## Intentionally dropped (FYI only) — ${result.intentionallyDropped.length}\n`);
for (const d of result.intentionallyDropped) {
  console.log(`- ${d.upstreamPath} — ${d.changedFiles} changed file(s); disposition stands unless the operator reopens it`);
}
console.log(`\n## Unmapped (new upstream pieces — need a disposition) — ${result.unmapped.length}\n`);
for (const u of result.unmapped) {
  console.log(`- ${u.status} ${u.path}`);
}
console.log(`\nAfter the review completes, advance the pin: upstream.lastReviewed.commit = "${head}"`);
