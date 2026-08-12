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
// Default to release tracking: unreleased commits on the branch are work in
// progress, not something to review or mirror.
const track = manifest.upstream.track ?? "releases";
const tagPattern = manifest.upstream.tagPattern ?? "v*";
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
  git(["fetch", "--tags", "--force", "origin", ref], { cwd: cacheDir });
} else {
  git(["clone", "--quiet", repo, cacheDir]);
}

// -- resolve the target: the newest published release, not the branch tip -----
// Comparing against a branch tip reviews work in progress. Releases are what
// upstream actually ships, so they are the only thing worth reviewing or
// mirroring.
let head;
let headRelease = null;
if (track === "releases") {
  const tags = git(["tag", "--list", tagPattern, "--sort=-v:refname"], { cwd: cacheDir })
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
  if (tags.length === 0) {
    console.error(
      `No tags matching "${tagPattern}" in ${repo}. Upstream publishes no releases, ` +
        `so there is nothing to compare against. Set upstream.track to "branch" in the ` +
        `manifest to fall back to the ${ref} tip.`
    );
    process.exit(2);
  }
  headRelease = tags[0];
  // Annotated tags resolve to a tag object; ^{commit} gets the commit it points at.
  head = git(["rev-parse", `${headRelease}^{commit}`], { cwd: cacheDir });
} else {
  head = git(["rev-parse", `origin/${ref}`], { cwd: cacheDir });
}

// How far the branch has run past the release we are targeting — reported so an
// operator can see there is unreleased work, without it entering the review.
const unreleasedCount =
  track === "releases"
    ? Number(git(["rev-list", "--count", `${head}..origin/${ref}`], { cwd: cacheDir, allowFail: true }) || 0)
    : 0;

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
  const result = { mode: "initial-pin", head, headRelease, track, upstreamEntries: [...seen].sort(), unmapped, missing: missing.map((p) => p.upstreamPath) };
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`# workbench-drift — initial pin\n`);
    console.log(
      headRelease
        ? `Upstream: ${repo} @ ${headRelease} (\`${head}\`)\n`
        : `Upstream: ${repo} @ \`${head}\` (branch tip \`${ref}\`)\n`
    );
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

const groups = { reviewRequired: new Map(), remirror: new Map(), droppedFyi: new Map(), unmapped: [] };
for (const c of changes) {
  const piece = pieceFor(c.path) ?? (c.from ? pieceFor(c.from) : null);
  if (!piece) {
    groups.unmapped.push(c);
  } else if (piece.disposition === "adopted") {
    if (!groups.reviewRequired.has(piece.upstreamPath)) groups.reviewRequired.set(piece.upstreamPath, { piece, files: [] });
    groups.reviewRequired.get(piece.upstreamPath).files.push(c);
  } else if (piece.disposition === "mirrored") {
    // Mirrored pieces are copied verbatim — no diff to judge, but they must not
    // fall into the dropped bucket, which would silently ignore upstream changes.
    if (!groups.remirror.has(piece.upstreamPath)) groups.remirror.set(piece.upstreamPath, { piece, files: [] });
    groups.remirror.get(piece.upstreamPath).files.push(c);
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
  track,
  head,
  headRelease,
  unreleasedCommits: unreleasedCount,
  upToDate: changes.length === 0,
  reviewRequired: reviewBlocks,
  remirror: [...groups.remirror.values()].map(({ piece, files }) => ({
    upstreamPath: piece.upstreamPath,
    localPath: piece.localPath,
    changedFiles: files.length,
  })),
  intentionallyDropped: [...groups.droppedFyi.entries()].map(([p, n]) => ({ upstreamPath: p, changedFiles: n })),
  unmapped: groups.unmapped,
};

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.log(`# workbench-drift — upstream drift report\n`);
if (track === "releases") {
  console.log(`Upstream: ${repo} — tracking published releases (\`${tagPattern}\`)`);
  console.log(`Target:   ${headRelease} (\`${head}\`)`);
} else {
  console.log(`Upstream: ${repo} (branch tip \`${ref}\`)`);
  console.log(`Target:   \`${head}\``);
}
console.log(`Reviewed: \`${lastReviewed.commit}\`${lastReviewed.release ? ` (${lastReviewed.release})` : ""}\n`);
if (unreleasedCount > 0) {
  console.log(
    `> ${unreleasedCount} unreleased commit(s) sit on \`${ref}\` past ${headRelease}. ` +
      `Excluded — work in progress is not reviewed or mirrored.\n`
  );
}
if (result.upToDate) {
  console.log(`No changes under watched paths since the last review. Up to date.`);
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
console.log(`## Re-mirror (mirrored pieces — copy upstream wholesale, do not adapt) — ${result.remirror.length}\n`);
for (const m of result.remirror) {
  console.log(`- ${m.upstreamPath} → ${m.localPath} — ${m.changedFiles} changed file(s); re-copy the upstream tree verbatim`);
}
console.log(`\n## Intentionally dropped (FYI only) — ${result.intentionallyDropped.length}\n`);
for (const d of result.intentionallyDropped) {
  console.log(`- ${d.upstreamPath} — ${d.changedFiles} changed file(s); disposition stands unless the operator reopens it`);
}
console.log(`\n## Unmapped (new upstream pieces — need a disposition) — ${result.unmapped.length}\n`);
for (const u of result.unmapped) {
  console.log(`- ${u.status} ${u.path}`);
}
console.log(`\nAfter the review completes, advance the pin: upstream.lastReviewed.commit = "${head}"`);
