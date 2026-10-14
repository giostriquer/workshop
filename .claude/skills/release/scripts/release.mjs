#!/usr/bin/env node
// release.mjs: deterministic half of the release skill. Prints JSON.
//
//   plan                    per marketplace plugin: released (origin/main) and working
//                           versions, changes since the commit that set the released
//                           version, and a status: current, needs-bump, bumped, invalid, new
//   bump <plugin> <x.y.z>   writes the version into the plugin's four manifests and its
//                           marketplace entry, editing only the version text
//   refresh                 updates the marketplace and each user-scope Workshop plugin in
//                           Claude Code and Codex; exits 1 when a host command fails
//   verify-caches           compares each installed Workshop copy with origin/main;
//                           exits 1 when a copy is stale or differs
//
// Run from anywhere inside the Workshop checkout. Tests: node --test .claude/skills/release/tests/release.test.mjs

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const RELEASED = "origin/main";
const MARKETPLACE = ".claude-plugin/marketplace.json";
const MANIFESTS = [".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".cursor-plugin/plugin.json", "plugin.json"];
const CHANGE_LOG = "docs/change-log.md";
// Files a host or the OS adds to an installed copy.
const HOST_FILES = new Set([".in_use", ".DS_Store"]);
const SEMVER = /^\d+\.\d+\.\d+$/;
const VERSION_TOKEN = /("version"\s*:\s*")([^"]*)"/g;
const HOST_COMMANDS = {
  claude: {
    marketplace: (market) => ["plugin", "marketplace", "update", market],
    plugin: (install, market) => ["plugin", "update", `${install.plugin}@${market}`, "--scope", install.scope],
  },
  codex: {
    marketplace: (market) => ["plugin", "marketplace", "upgrade", market, "--json"],
    plugin: (install, market) => ["plugin", "add", `${install.plugin}@${market}`, "--json"],
  },
};

let root;

function run(cmd, args, { input, allowFail = false } = {}) {
  const r = spawnSync(cmd, args, { cwd: root, input, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw r.error;
  if (r.status === 0) return r.stdout;
  if (allowFail) return null;
  throw new Error(`${cmd} ${args.join(" ")} failed:\n${r.stderr}`);
}

const git = (args, options) => run("git", args, options);
const show = (ref, file) => git(["show", `${ref}:${file}`], { allowFail: true });
const lines = (text, separator = "\n") => text.split(separator).filter(Boolean);
const sourceOf = (entry) => entry.source.replace(/^\.\//, "");
const readText = (file) => (existsSync(join(root, file)) ? readFileSync(join(root, file), "utf8") : null);
const versionIn = (text) => (text === null ? null : JSON.parse(text).version ?? null);
const releasedVersion = (src) => versionIn(show(RELEASED, `${src}/.claude-plugin/plugin.json`));
const print = (value) => process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);

function compareVersions(a, b) {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

// The commit on origin/main that set the released version. First parents only, so
// a merged bump resolves to the merge, and later manifest commits that keep the
// version do not move the base.
function versionBase(src, released) {
  const file = `${src}/.claude-plugin/plugin.json`;
  for (const commit of lines(git(["log", "--first-parent", "--format=%H", RELEASED, "--", file]))) {
    if (versionIn(show(`${commit}^`, file)) !== released) return commit;
  }
  return null;
}

// A manifest whose only difference is its version is the bump, not a change.
function onlyVersionMoved(base, file) {
  const before = show(base, file);
  const after = readText(file);
  const strip = (text) => text.replace(VERSION_TOKEN, '$1"');
  return before !== null && after !== null && strip(before) === strip(after);
}

function changedSince(base, src) {
  const manifests = new Set(MANIFESTS.map((m) => `${src}/${m}`));
  const tracked = base === null
    ? git(["ls-files", "-z", "--", src])
    : git(["diff", "--name-only", "-z", "--no-renames", base, "--", src]);
  const untracked = git(["ls-files", "-z", "--others", "--exclude-standard", "--", src]);
  return [...new Set([...lines(tracked, "\0"), ...lines(untracked, "\0")])]
    .filter((file) => !(base !== null && manifests.has(file) && onlyVersionMoved(base, file)))
    .sort();
}

function plan() {
  const marketplace = JSON.parse(readText(MARKETPLACE));
  const changeLog = readText(CHANGE_LOG) ?? "";
  const plugins = marketplace.plugins.map((entry) => {
    const src = sourceOf(entry);
    const released = releasedVersion(src);
    const working = versionIn(readText(`${src}/.claude-plugin/plugin.json`));
    const base = released === null ? null : versionBase(src, released);
    const changed = changedSince(base, src);
    const commits = base === null ? [] : lines(git(["log", "--format=%h %s", `${base}..HEAD`, "--", src]));
    let status;
    if (released === null) status = "new";
    else if (working === released) status = changed.length ? "needs-bump" : "current";
    else status = working !== null && SEMVER.test(working) && compareVersions(working, released) > 0 ? "bumped" : "invalid";
    // Notes belong to an unreleased version; the released one already has its section.
    const heading = `## ${entry.name} ${working}:`;
    const notes = status === "bumped" || status === "new"
      ? changeLog.split("\n").some((line) => line.startsWith(heading))
      : null;
    return { name: entry.name, source: src, released, working, base, status, notes, changed, commits };
  });
  print({ ref: RELEASED, plugins });
}

// Each "version" key's path and text span, in document order, so one version is
// rewritten in place and a hand-formatted file keeps every other byte.
function versionSlots(text) {
  const paths = [];
  const walk = (value, at) => {
    if (Array.isArray(value)) value.forEach((item, i) => walk(item, [...at, i]));
    else if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) {
        if (key === "version") paths.push(at);
        walk(item, [...at, key]);
      }
    }
  };
  walk(JSON.parse(text), []);
  const tokens = [...text.matchAll(VERSION_TOKEN)];
  if (tokens.length !== paths.length) throw new Error("cannot match each version key to its text");
  return tokens.map((m, i) => ({ path: paths[i], start: m.index + m[1].length, end: m.index + m[1].length + m[2].length }));
}

function withVersion(file, at, version) {
  const text = readText(file);
  const slot = versionSlots(text).find((s) => JSON.stringify(s.path) === JSON.stringify(at));
  if (!slot) throw new Error(`${file} has no version at ${JSON.stringify(at)}`);
  return text.slice(0, slot.start) + version + text.slice(slot.end);
}

function bump(name, version) {
  if (!SEMVER.test(version)) throw new Error(`${version} is not an x.y.z version`);
  const marketplace = JSON.parse(readText(MARKETPLACE));
  const index = marketplace.plugins.findIndex((entry) => entry.name === name);
  if (index < 0) throw new Error(`${MARKETPLACE} has no plugin named ${name}`);
  const src = sourceOf(marketplace.plugins[index]);
  const released = releasedVersion(src);
  if (released !== null && compareVersions(version, released) <= 0) {
    throw new Error(`${name} ${version} is not above the released ${released}`);
  }
  const targets = [[MARKETPLACE, ["plugins", index]], ...MANIFESTS.map((m) => [`${src}/${m}`, []])];
  const missing = targets.filter(([file]) => readText(file) === null).map(([file]) => file);
  if (missing.length) throw new Error(`missing ${missing.join(", ")}`);
  // Every file is rewritten in memory first, so a failure leaves none edited.
  const edits = targets.map(([file, at]) => [file, withVersion(file, at, version)]);
  for (const [file, text] of edits) writeFileSync(join(root, file), text);
  print({ plugin: name, version, files: edits.map(([file]) => file) });
}

function releasedMarketplace() {
  const marketplace = JSON.parse(show(RELEASED, MARKETPLACE) ?? "null");
  if (!marketplace) throw new Error(`${RELEASED} has no ${MARKETPLACE}`);
  const plugins = new Map(marketplace.plugins.map((entry) => {
    const src = sourceOf(entry);
    return [entry.name, { src, version: releasedVersion(src) }];
  }));
  return { name: marketplace.name, plugins };
}

// null when the CLI is not installed on this machine.
function hostList(cli) {
  const r = spawnSync(cli, ["plugin", "list", "--json"], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error?.code === "ENOENT") return null;
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${cli} plugin list --json failed:\n${r.stderr}`);
  return JSON.parse(r.stdout);
}

// Each host's installed plugins from the given marketplace, with the folder it loads.
function hosts(market) {
  const claude = hostList("claude");
  const codex = hostList("codex");
  const codexCache = join(process.env.CODEX_HOME || join(homedir(), ".codex"), "plugins", "cache", market);
  return [
    {
      host: "claude",
      missing: claude === null,
      installs: (claude ?? []).flatMap((entry) => {
        const [plugin, from] = entry.id.split("@");
        return from === market ? [{ plugin, version: entry.version, scope: entry.scope, enabled: entry.enabled, path: entry.installPath }] : [];
      }),
    },
    {
      host: "codex",
      missing: codex === null,
      installs: (codex?.installed ?? []).filter((entry) => entry.marketplaceName === market).map((entry) => (
        { plugin: entry.name, version: entry.version, enabled: entry.enabled, path: join(codexCache, entry.name, entry.version) })),
    },
  ];
}

function refresh() {
  const market = releasedMarketplace();
  const steps = [];
  for (const { host, missing, installs } of hosts(market.name)) {
    const shipped = installs.filter((install) => market.plugins.has(install.plugin));
    // A project or local install belongs to a folder this run does not know.
    const elsewhere = shipped.filter((install) => install.scope && install.scope !== "user");
    for (const install of elsewhere) {
      steps.push({ host, plugin: install.plugin, status: "skipped", reason: `${install.scope} scope: update it from its project` });
    }
    const global = shipped.filter((install) => !elsewhere.includes(install));
    if (missing || !global.length) {
      steps.push({ host, status: "skipped", reason: missing ? `${host} is not on PATH` : "no released Workshop plugin installed globally" });
      continue;
    }
    const commands = [HOST_COMMANDS[host].marketplace(market.name), ...global.map((install) => HOST_COMMANDS[host].plugin(install, market.name))];
    for (const args of commands) {
      const r = spawnSync(host, args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
      const step = { host, command: [host, ...args].join(" "), status: r.status === 0 ? "ok" : "failed" };
      if (r.status !== 0) step.output = (r.stderr || r.stdout || String(r.error ?? "")).trim();
      steps.push(step);
    }
  }
  print({ steps });
  if (steps.some((step) => step.status === "failed")) process.exitCode = 1;
}

const releasedIdCache = new Map();
function releasedIds(src) {
  if (!releasedIdCache.has(src)) {
    const ids = new Map(lines(git(["ls-tree", "-r", "-z", RELEASED, "--", src]), "\0")
      .map((line) => line.match(/^\S+ (\S+) (\S+)\t(.*)$/s))
      .filter((m) => m[1] === "blob")
      .map((m) => [m[3].slice(src.length + 1), m[2]]));
    releasedIdCache.set(src, ids);
  }
  return releasedIdCache.get(src);
}

function filesUnder(dir, prefix = "") {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => !HOST_FILES.has(d.name))
    .flatMap((d) => (d.isDirectory()
      ? filesUnder(join(dir, d.name), `${prefix}${d.name}/`)
      : [`${prefix}${d.name}`]));
}

// Git object ids of the raw bytes, comparable with the ids ls-tree reports.
function installedIds(dir) {
  const files = filesUnder(dir);
  if (!files.length) return new Map();
  const ids = lines(git(["hash-object", "--no-filters", "--stdin-paths"], { input: files.map((rel) => `${join(dir, rel)}\n`).join("") }));
  return new Map(files.map((rel, i) => [rel, ids[i]]));
}

function checkCopy(host, install, released) {
  const row = { host, plugin: install.plugin, installed: install.version, released: released?.version ?? null, enabled: install.enabled, path: install.path };
  if (!released) return { ...row, status: "not-released" };
  if (install.version !== released.version) return { ...row, status: "stale" };
  const expected = releasedIds(released.src);
  const actual = installedIds(install.path);
  const differing = [...expected].filter(([rel, id]) => actual.has(rel) && actual.get(rel) !== id).map(([rel]) => rel).sort();
  const missing = [...expected.keys()].filter((rel) => !actual.has(rel)).sort();
  const extra = [...actual.keys()].filter((rel) => !expected.has(rel)).sort();
  const status = differing.length || missing.length || extra.length ? "mismatch" : "match";
  return { ...row, status, files: expected.size, differing, missing, extra };
}

function verifyCaches() {
  const market = releasedMarketplace();
  const rows = [];
  for (const { host, missing, installs } of hosts(market.name)) {
    if (missing) rows.push({ host, status: "skipped", reason: `${host} is not on PATH` });
    else if (!installs.length) rows.push({ host, status: "none", reason: "no Workshop plugin installed" });
    for (const install of installs) rows.push(checkCopy(host, install, market.plugins.get(install.plugin)));
  }
  print({ ref: RELEASED, rows });
  if (rows.some((row) => row.status === "stale" || row.status === "mismatch")) process.exitCode = 1;
}

const COMMANDS = { plan: [0, plan], bump: [2, bump], refresh: [0, refresh], "verify-caches": [0, verifyCaches] };
const [command, ...args] = process.argv.slice(2);
try {
  root = spawnSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).stdout.trim();
  if (!root) throw new Error("run release.mjs inside the Workshop checkout");
  const [arity, action] = COMMANDS[command] ?? [];
  if (!action || args.length !== arity) throw new Error("usage: release.mjs plan | bump <plugin> <x.y.z> | refresh | verify-caches");
  action(...args);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
