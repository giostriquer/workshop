// Failure-path tests for validate-native-plugin.sh: node --test scripts/validate-native-plugin.test.mjs
// Each case validates a throwaway copy of what the validator reads, so the
// real checkout is never touched and a mutation shows up only in the copy.
import assert from 'node:assert/strict';
import { appendFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Everything the validator reads, plus .gitignore, which decides what `git add -A` tracks.
const inputs = ['scripts/validate-native-plugin.sh', 'plugins', '.claude-plugin', '.agents/plugins', '.cursor-plugin', '.gitignore'];
const EM_DASH = String.fromCharCode(0x2014); // built, so this file never contains one
const OK = 'native plugin validation ok';

const handoff = 'plugins/workbench/skills/handoff-goal';
const handoffSkill = `${handoff}/SKILL.md`;
const handoffSidecar = `${handoff}/agents/openai.yaml`;

// A copy under <base>/repo. Git sees only the copy: no parent repository, no
// user or system config, and no GIT_* variables inherited from a hook.
function copyRepo(t, { git = true, before } = {}) {
  const base = realpathSync(mkdtempSync(path.join(tmpdir(), 'validate-native-plugin-')));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const dir = path.join(base, 'repo');
  for (const rel of inputs) cpSync(path.join(repoRoot, rel), path.join(dir, rel), { recursive: true });
  const gitconfig = path.join(base, 'gitconfig');
  writeFileSync(gitconfig, '');
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
  Object.assign(env, { GIT_CEILING_DIRECTORIES: base, GIT_CONFIG_GLOBAL: gitconfig, GIT_CONFIG_NOSYSTEM: '1' });
  const copy = {
    dir, env,
    file: (rel) => path.join(dir, rel),
    read: (rel) => readFileSync(path.join(dir, rel), 'utf8'),
    write: (rel, text) => { mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); writeFileSync(path.join(dir, rel), text); },
    // Runs from outside the copy: the validator must find its root by itself.
    validate: () => spawnSync('sh', [path.join(dir, 'scripts/validate-native-plugin.sh')], {
      cwd: base, env, encoding: 'utf8', timeout: 20000,
    }),
  };
  before?.(copy);
  if (git) {
    for (const args of [['init', '-q'], ['add', '-A']]) {
      const r = spawnSync('git', args, { cwd: dir, env, encoding: 'utf8' });
      assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
    }
  }
  return copy;
}

function assertPasses(result) {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), OK);
}

function assertFails(result, pattern) {
  assert.equal(result.status, 1, `expected a failure, got stdout ${JSON.stringify(result.stdout)}`);
  assert.match(result.stderr, pattern);
  assert.doesNotMatch(result.stdout, new RegExp(OK));
}

test('a clean copy passes, so the failure cases below start from green', (t) => {
  assertPasses(copyRepo(t).validate());
});

test('an em dash in a tracked file fails and names the file and line', (t) => {
  const copy = copyRepo(t, { before: (c) => c.write('notes/draft.md', `first line\nsecond ${EM_DASH} line\n`) });
  assertFails(copy.validate(), /em dash \(U\+2014\) in tracked files[\s\S]*^notes\/draft\.md:2$/m);
});

test('an em dash added to a tracked file after staging still fails (the scan reads the working tree)', (t) => {
  const copy = copyRepo(t);
  appendFileSync(copy.file('plugins/workbench/README.md'), `trailing ${EM_DASH} line\n`);
  const lines = copy.read('plugins/workbench/README.md').split('\n').length - 1;
  assertFails(copy.validate(), new RegExp(`^plugins/workbench/README\\.md:${lines}$`, 'm'));
});

test('an em dash in an untracked file passes: the ban covers tracked files only', (t) => {
  const copy = copyRepo(t);
  copy.write('scratch/untracked.md', `untracked ${EM_DASH} text\n`);
  assertPasses(copy.validate());
});

test('outside a git checkout the em dash scan fails instead of skipping', (t) => {
  assertFails(copyRepo(t, { git: false }).validate(), /git grep could not scan the tracked files for em dashes/);
});

test('a user-invoked-only skill needs its Codex sidecar with allow_implicit_invocation: false', (t) => {
  const copy = copyRepo(t);
  const sidecar = copy.read(handoffSidecar);
  assert.match(sidecar, /^ {2}allow_implicit_invocation: false$/m, 'fixture precondition');

  copy.write(handoffSidecar, sidecar.replace('allow_implicit_invocation: false', 'allow_implicit_invocation: true'));
  assertFails(copy.validate(), /handoff-goal\/agents\/openai\.yaml must set policy\.allow_implicit_invocation: false/);

  unlinkSync(copy.file(handoffSidecar));
  assertFails(copy.validate(), /handoff-goal\/SKILL\.md sets disable-model-invocation: true, which Codex ignores/);
});

test('only a direct child of policy: sets allow_implicit_invocation', async (t) => {
  // The direct child's indentation is the first indented line under policy:, so the nested
  // block leads in several cases. A key nested deeper is not policy.allow_implicit_invocation.
  const copy = copyRepo(t);
  const sidecar = copy.read(handoffSidecar);
  const tail = 'policy:\n  allow_implicit_invocation: false\n';
  assert.ok(sidecar.endsWith(tail), 'fixture precondition');
  const policy = (...lines) => ['policy:', ...lines, ''].join('\n');
  for (const [label, block, passes] of [
    ['a nested false alone fails', policy('  extra:', '    allow_implicit_invocation: false'), false],
    ['a direct true beside a nested false fails',
      policy('  extra:', '    allow_implicit_invocation: false', '  allow_implicit_invocation: true'), false],
    ['a direct key set false then true fails',
      policy('  allow_implicit_invocation: false', '  allow_implicit_invocation: true'), false],
    ['a direct key set true then false fails',
      policy('  allow_implicit_invocation: true', '  allow_implicit_invocation: false'), false],
    ['a direct false beside a nested block that sets the key true passes',
      policy('  extra:', '    note: kept', '    allow_implicit_invocation: true', '  allow_implicit_invocation: false'), true],
    ['a direct false indented four spaces passes', policy('    allow_implicit_invocation: false'), true],
  ]) {
    await t.test(label, () => {
      copy.write(handoffSidecar, sidecar.slice(0, -tail.length) + block);
      const result = copy.validate();
      if (passes) assertPasses(result);
      else assertFails(result, /handoff-goal\/agents\/openai\.yaml must set policy\.allow_implicit_invocation: false/);
    });
  }
});

// Without the key, or with it false, the skill stays model-invocable and needs no sidecar.
for (const [label, edit] of [
  ['without disable-model-invocation', (skill) => skill.replace(/^disable-model-invocation: true\n/m, '')],
  ['with disable-model-invocation: false', (skill) => skill.replace('disable-model-invocation: true', 'disable-model-invocation: false')],
]) {
  test(`a skill ${label} needs no sidecar`, (t) => {
    const copy = copyRepo(t);
    copy.write(handoffSkill, edit(copy.read(handoffSkill)));
    assert.doesNotMatch(copy.read(handoffSkill), /disable-model-invocation: true/, 'fixture precondition');
    unlinkSync(copy.file(handoffSidecar));
    assertPasses(copy.validate());
  });
}

test('disable-model-invocation must be spelled literally true or false', async (t) => {
  // Hosts read other spellings differently (a quoted "true" is a string), and the
  // sidecar check keys on the literal, so any other spelling would skip it silently.
  const copy = copyRepo(t);
  const skill = copy.read(handoffSkill);
  for (const spelling of ['True', '"true"', 'yes', 'False']) {
    await t.test(spelling, () => {
      copy.write(handoffSkill, skill.replace('disable-model-invocation: true', `disable-model-invocation: ${spelling}`));
      assertFails(copy.validate(),
        new RegExp(`disable-model-invocation must be the literal true or false, not '${spelling}'`));
    });
  }
});
