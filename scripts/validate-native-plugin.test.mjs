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
const inputs = ['scripts/validate-native-plugin.sh', 'scripts/check-skill-size.mjs', 'plugins', '.claude-plugin', '.agents/plugins', '.cursor-plugin', '.claude/skills', '.codex/skills', '.gitignore'];
const EM_DASH = String.fromCharCode(0x2014); // built, so this file never contains one
const OK = 'native plugin validation ok';

const userOnly = 'plugins/workbench/skills/epic-orchestration';
const userOnlySkill = `${userOnly}/SKILL.md`;
const userOnlySidecar = `${userOnly}/agents/openai.yaml`;

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
  const sidecar = copy.read(userOnlySidecar);
  assert.match(sidecar, /^ {2}allow_implicit_invocation: false$/m, 'fixture precondition');

  copy.write(userOnlySidecar, sidecar.replace('allow_implicit_invocation: false', 'allow_implicit_invocation: true'));
  assertFails(copy.validate(), /epic-orchestration\/agents\/openai\.yaml must set policy\.allow_implicit_invocation: false/);

  unlinkSync(copy.file(userOnlySidecar));
  assertFails(copy.validate(), /epic-orchestration\/SKILL\.md sets disable-model-invocation: true, which Codex ignores/);
});

test('only a direct child of policy: sets allow_implicit_invocation', async (t) => {
  // The direct child's indentation is the first indented line under policy:, so the nested
  // block leads in several cases. A key nested deeper is not policy.allow_implicit_invocation.
  const copy = copyRepo(t);
  const sidecar = copy.read(userOnlySidecar);
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
      copy.write(userOnlySidecar, sidecar.slice(0, -tail.length) + block);
      const result = copy.validate();
      if (passes) assertPasses(result);
      else assertFails(result, /epic-orchestration\/agents\/openai\.yaml must set policy\.allow_implicit_invocation: false/);
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
    copy.write(userOnlySkill, edit(copy.read(userOnlySkill)));
    assert.doesNotMatch(copy.read(userOnlySkill), /disable-model-invocation: true/, 'fixture precondition');
    unlinkSync(copy.file(userOnlySidecar));
    assertPasses(copy.validate());
  });
}

test('disable-model-invocation must be spelled literally true or false', async (t) => {
  // Hosts read other spellings differently (a quoted "true" is a string), and the
  // sidecar check keys on the literal, so any other spelling would skip it silently.
  const copy = copyRepo(t);
  const skill = copy.read(userOnlySkill);
  for (const spelling of ['True', '"true"', 'yes', 'False']) {
    await t.test(spelling, () => {
      copy.write(userOnlySkill, skill.replace('disable-model-invocation: true', `disable-model-invocation: ${spelling}`));
      assertFails(copy.validate(),
        new RegExp(`disable-model-invocation must be the literal true or false, not '${spelling}'`));
    });
  }
});

const museManifest = 'plugins/workbench/.muse-plugin/plugin.json';

test('a missing Muse manifest fails', (t) => {
  const copy = copyRepo(t);
  unlinkSync(copy.file(museManifest));
  assertFails(copy.validate(), /missing JSON file: plugins\/workbench\/\.muse-plugin\/plugin\.json/);
});

test('the Muse manifest is held to the plugin version and skill enumeration', async (t) => {
  const copy = copyRepo(t);
  const doc = JSON.parse(copy.read(museManifest));
  const mutate = (fn) => {
    const next = structuredClone(doc);
    fn(next);
    copy.write(museManifest, JSON.stringify(next, null, 2) + '\n');
  };
  for (const [label, fn, pattern] of [
    ['a wrong plugin name fails', (d) => { d.name = 'acme'; }, /Muse workbench manifest name must be workbench/],
    ['an unsupported schema version fails', (d) => { d.schemaVersion = 2; }, /Muse workbench manifest schemaVersion must be 1/],
    ['a non-native source fails', (d) => { d.compat.source = 'acme'; }, /Muse workbench manifest compat.source must be native/],
    ['a wrong manifest directory fails', (d) => { d.compat.manifestDir = '.acme-plugin'; }, /Muse workbench manifest compat.manifestDir must be .muse-plugin/],
    ['a drifted version fails', (d) => { d.version = '0.0.0'; }, /Muse workbench manifest version must match Claude manifest/],
    ['a skill dropped from the enumeration fails', (d) => { d.capabilities.skills.shift(); }, /Muse workbench skills file list mismatch/],
    ['a skill path off the canonical form fails', (d) => { d.capabilities.skills[0].path = 'skills/audit/index.md'; }, /Muse workbench skill audit path must be skills\/audit\/SKILL\.md/],
    ['an unsupported capability family fails', (d) => { d.capabilities.agents = []; }, /Muse workbench manifest declares unsupported capability family agents/],
    ['a non-empty unshipped family fails', (d) => { d.capabilities.hooks = [{ id: 'x' }]; }, /Muse workbench manifest capabilities\.hooks must be an empty array/],
  ]) {
    await t.test(label, () => {
      mutate(fn);
      assertFails(copy.validate(), pattern);
    });
  }
});

test('a root Muse marketplace file fails: Muse does not probe it', (t) => {
  const copy = copyRepo(t, { before: (c) => c.write('.muse-plugin/marketplace.json', '{}\n') });
  assertFails(copy.validate(), /\.muse-plugin\/marketplace\.json must not exist/);
});

test('a drifted repo-local mirror fails: Muse runs the .codex copy', (t) => {
  const copy = copyRepo(t);
  copy.write('.codex/skills/push/SKILL.md', copy.read('.codex/skills/push/SKILL.md') + '\ndrift\n');
  assertFails(copy.validate(), /repo-local mirror drift: \.codex\/skills\/push differs from canonical \.claude\/skills\/push/);
});


test('every repo-local skill needs its complete Codex mirror', (t) => {
  const copy = copyRepo(t);
  copy.write('.claude/skills/acme-guide/SKILL.md', '---\nname: acme-guide\ndescription: Use when checking a sample.\n---\n');
  assertFails(copy.validate(), /repo-local mirror drift: \.codex\/skills\/acme-guide/);

  copy.write('.codex/skills/acme-guide/SKILL.md', copy.read('.claude/skills/acme-guide/SKILL.md'));
  copy.write('.claude/skills/acme-guide/references/example.md', 'Supporting reference\n');
  assertFails(copy.validate(), /repo-local mirror drift: \.codex\/skills\/acme-guide/);

  copy.write('.codex/skills/acme-guide/references/example.md', 'Supporting reference\n');
  assertPasses(copy.validate());
  copy.write('.codex/skills/acme-guide/references/example.md', 'Outdated reference\n');
  assertFails(copy.validate(), /repo-local mirror drift: \.codex\/skills\/acme-guide/);
});


test('an oversized entrypoint fails the native package gate', (t) => {
  const copy = copyRepo(t);
  const rel = 'plugins/toolkit/skills/why/SKILL.md';
  copy.write(rel, copy.read(rel).padEnd(20000, ' '));
  assertFails(copy.validate(), /skills\/why\/SKILL.md: 20000 bytes/);
});
