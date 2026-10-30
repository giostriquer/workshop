import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const script = resolve('scripts/check-skill-size.mjs');
const roots = ['plugins/workbench/skills', 'plugins/toolkit/skills', '.claude/skills', '.codex/skills'];

function fixture(t) {
  mkdirSync('.workbench', { recursive: true });
  const root = mkdtempSync(resolve('.workbench/skill-size-test-'));
  for (const dir of roots) mkdirSync(join(root, dir), { recursive: true });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function skill(root, dir, text) {
  const folder = join(root, dir, 'example');
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'SKILL.md'), text);
}

test('accepts 19,999 bytes and rejects exactly 20,000 with its path and size', t => {
  const root = fixture(t);
  skill(root, roots[0], 'a'.repeat(19999));
  assert.match(execFileSync(process.execPath, [script, root], { encoding: 'utf8' }), /skill size validation ok/);
  skill(root, roots[0], 'a'.repeat(20000));
  const result = spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /plugins\/workbench\/skills\/example\/SKILL.md: 20000 bytes/);
});

test('counts UTF-8 bytes conservatively instead of characters', t => {
  const root = fixture(t);
  skill(root, roots[1], 'é'.repeat(10000));
  const result = spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /20000 bytes/);
});

test('checks both plugins and both host trees while excluding references and parked skills', t => {
  const root = fixture(t);
  for (const dir of roots) skill(root, dir, 'a'.repeat(20001));
  const result = spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  for (const dir of roots) assert.ok(result.stderr.includes(`${dir}/example/SKILL.md: 20001 bytes`));
  for (const dir of roots) skill(root, dir, 'small');
  skill(root, 'attic/skills', 'a'.repeat(30000));
  writeFileSync(join(root, roots[0], 'example', 'reference.md'), 'a'.repeat(30000));
  assert.match(execFileSync(process.execPath, [script, root], { encoding: 'utf8' }), /skill size validation ok/);
});

test('reports an incomplete tree instead of silently passing', t => {
  const root = fixture(t);
  rmSync(join(root, roots[3]), { recursive: true });
  const result = spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /\.codex\/skills/);
});
