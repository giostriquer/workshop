import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const pack = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../plugins/toolkit/skills/adopt-global-rules');

test('Muse adoption detects the host, preserves local content, and is idempotent', (t) => {
  const root = mkdtempSync(path.join(tmpdir(), 'adopt-rules-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const run = (...args) => {
    const result = spawnSync(process.execPath, [path.join(pack, 'adopt.mjs'), '--root', root, '--host', 'muse', '--json', ...args], {
      encoding: 'utf8', timeout: 10000,
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  const target = path.join(root, '.config/muse/AGENTS.md');
  const absent = run();
  assert.equal(absent.hosts.length, 1);
  assert.equal(absent.hosts[0].present, false);
  assert.equal(absent.actions[0].action, 'skipped');
  assert.equal(existsSync(target), false);

  mkdirSync(path.dirname(target), { recursive: true });
  const local = '# Acme preferences\nKeep the webapp examples local.\n';
  writeFileSync(target, local);
  const otherHosts = ['.claude/CLAUDE.md', '.codex/AGENTS.md'];
  for (const relative of otherHosts) {
    const file = path.join(root, relative);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, local);
  }
  const plan = run('--dry-run');
  assert.equal(plan.hosts[0].present, true);
  assert.deepEqual(plan.actions.map(({ action }) => action), ['added', 'added', 'added']);
  assert.equal(readFileSync(target, 'utf8'), local);

  const applied = run();
  assert.deepEqual(applied.actions.map(({ ruleId, action }) => [ruleId, action]), [['globals', 'added'], ['model-floor', 'added'], ['session-transcripts', 'added']]);
  const installed = readFileSync(target, 'utf8');
  assert.ok(installed.startsWith(local));
  for (const [id, file] of [['globals', 'globals/MUSE.md'], ['model-floor', 'rules/core/model-floor.md'], ['session-transcripts', 'rules/core/session-transcripts.md']]) {
    const body = readFileSync(path.join(pack, file), 'utf8').trim();
    assert.ok(installed.includes(`<!-- workshop:rule id=${id} -->\n${body}\n<!-- /workshop:rule id=${id} -->`));
  }
  const repeated = run();
  assert.deepEqual(repeated.actions.map(({ action }) => action), ['unchanged', 'unchanged', 'unchanged']);
  assert.equal(readFileSync(target, 'utf8'), installed);
  for (const relative of otherHosts) assert.equal(readFileSync(path.join(root, relative), 'utf8'), local);
});

const adopt = (root, ...args) => {
  const result = spawnSync(process.execPath, [path.join(pack, 'adopt.mjs'), '--root', root, ...args], {
    encoding: 'utf8', timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
};

const homeWith = (t, files) => {
  const root = mkdtempSync(path.join(tmpdir(), 'adopt-rules-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [relative, content] of Object.entries(files)) {
    const file = path.join(root, relative);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  mkdirSync(path.join(root, '.codex'), { recursive: true });
  mkdirSync(path.join(root, '.config/muse'), { recursive: true });
  return root;
};

test('a core-only run installs the session-transcripts rule on every host, idempotently', (t) => {
  const root = homeWith(t, { '.claude/CLAUDE.md': '# Acme\n' });
  const targets = ['.claude/rules/session-transcripts.md', '.codex/AGENTS.md', '.config/muse/AGENTS.md'];
  const body = readFileSync(path.join(pack, 'rules/core/session-transcripts.md'), 'utf8').trim();
  assert.ok(body.length > 0);

  const applied = JSON.parse(adopt(root, '--tier', 'core', '--json'));
  const added = applied.actions.filter(({ ruleId }) => ruleId === 'session-transcripts');
  assert.deepEqual(added.map(({ hostId, action }) => [hostId, action]), [['claude', 'added'], ['codex', 'added'], ['muse', 'added']]);
  const installed = targets.map((relative) => readFileSync(path.join(root, relative), 'utf8'));
  for (const text of installed) assert.ok(text.includes(body));

  const repeated = JSON.parse(adopt(root, '--tier', 'core', '--json'));
  assert.ok(repeated.actions.every(({ action }) => action === 'unchanged'));
  assert.deepEqual(targets.map((relative) => readFileSync(path.join(root, relative), 'utf8')), installed);
});

test('a first Muse adoption reports that Muse stops reading the Claude document', (t) => {
  const root = homeWith(t, { '.claude/CLAUDE.md': '# Acme\n' });
  const takeover = { hostId: 'muse', creates: '.config/muse/AGENTS.md', stopsReading: '.claude/CLAUDE.md' };
  assert.deepEqual(JSON.parse(adopt(root, '--dry-run', '--json')).takeovers, [takeover]);
  assert.match(adopt(root, '--dry-run'), /Muse: \.config\/muse\/AGENTS\.md replaces \.claude\/CLAUDE\.md/);
  assert.equal(existsSync(path.join(root, takeover.creates)), false);

  assert.match(adopt(root), /Muse: \.config\/muse\/AGENTS\.md replaces \.claude\/CLAUDE\.md/);
  assert.deepEqual(JSON.parse(adopt(root, '--dry-run', '--json')).takeovers, []);
});

test('no takeover is reported when Muse already has its document or there is nothing to lose', (t) => {
  const adopted = homeWith(t, { '.claude/CLAUDE.md': '# Acme\n', '.config/muse/AGENTS.md': '' });
  assert.deepEqual(JSON.parse(adopt(adopted, '--dry-run', '--json')).takeovers, []);
  const bare = homeWith(t, { '.claude/settings.json': '{}' });
  assert.deepEqual(JSON.parse(adopt(bare, '--dry-run', '--json')).takeovers, []);
  const noMuse = homeWith(t, { '.claude/CLAUDE.md': '# Acme\n' });
  rmSync(path.join(noMuse, '.config/muse'), { recursive: true });
  assert.deepEqual(JSON.parse(adopt(noMuse, '--dry-run', '--json')).takeovers, []);
});

test('the cleanup exclusion and the session-transcripts rule protect the same paths', () => {
  const homePaths = (text) => [...text.matchAll(/`(~\/[^`]+)`/g)].map(([, found]) => found).sort();
  const rule = readFileSync(path.join(pack, 'rules/core/session-transcripts.md'), 'utf8');
  const cleanup = readFileSync(path.join(pack, '../../../workbench/skills/workspace-cleanup/SKILL.md'), 'utf8');
  const [, exclusion] = cleanup.match(/\*\*Session transcripts are never a candidate\.\*\*([\s\S]*?)\n\n/);
  assert.ok(homePaths(rule).length > 0);
  assert.deepEqual(homePaths(exclusion), homePaths(rule));
});
