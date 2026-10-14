// Tests for release.mjs: node --test .claude/skills/release/tests/release.test.mjs
// Each case builds a throwaway marketplace repo and fake `claude` and `codex`
// CLIs, so no real checkout, host cache or CLI is touched.
import assert from 'node:assert/strict';
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(skillDir, 'scripts/release.mjs');
const gitDir = path.dirname(spawnSync('sh', ['-c', 'command -v git'], { encoding: 'utf8' }).stdout.trim());

const manifest = (name, version) => `{
  "name": "${name}",
  "version": "${version}",
  "description": "The ${name} plugin",
  "author": { "name": "Acme" }
}
`;
const MANIFESTS = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json', '.cursor-plugin/plugin.json', 'plugin.json'];

const marketplace = (alpha, beta) => `{
  "name": "workshop",
  "owner": { "name": "Acme" },
  "plugins": [
    {
      "name": "alpha",
      "version": "${alpha}",
      "source": "./plugins/alpha",
      "author": { "name": "Acme" }
    },
    {
      "name": "beta",
      "version": "${beta}",
      "source": "./plugins/beta",
      "author": { "name": "Acme" }
    }
  ]
}
`;

// A repo whose origin/main released alpha 1.2.0 and beta 1.2.0, the same version
// so a bump that edits the wrong entry shows. Alpha's 1.2.0 came from
// `versionCommit`; the commit before it shipped 1.1.0.
function fixture(t) {
  const base = realpathSync(mkdtempSync(path.join(tmpdir(), 'release-skill-')));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const dir = path.join(base, 'repo');
  const bin = path.join(base, 'bin');
  mkdirSync(bin, { recursive: true });
  const gitconfig = path.join(base, 'gitconfig');
  writeFileSync(gitconfig, '[user]\n\tname = Acme\n\temail = you@example.com\n');
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
  Object.assign(env, {
    GIT_CEILING_DIRECTORIES: base, GIT_CONFIG_GLOBAL: gitconfig, GIT_CONFIG_NOSYSTEM: '1',
    HOME: base, CODEX_HOME: path.join(base, 'codex-home'), PATH: [bin, gitDir, '/usr/bin', '/bin'].join(path.delimiter),
  });
  const f = {
    base, dir, env,
    file: (rel) => path.join(dir, rel),
    read: (rel) => readFileSync(path.join(dir, rel), 'utf8'),
    write: (rel, text) => { mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); writeFileSync(path.join(dir, rel), text); },
    git: (...args) => {
      const r = spawnSync('git', args, { cwd: dir, env, encoding: 'utf8' });
      assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
      return r.stdout.trim();
    },
    commit: (msg) => { f.git('add', '-A'); f.git('commit', '-q', '-m', msg); return f.git('rev-parse', 'HEAD'); },
    publish: () => f.git('update-ref', 'refs/remotes/origin/main', 'HEAD'),
    setVersion: (plugin, version) => {
      for (const rel of MANIFESTS) f.write(`plugins/${plugin}/${rel}`, manifest(plugin, version));
    },
    run: (...args) => spawnSync(process.execPath, [script, ...args], { cwd: dir, env: f.env, encoding: 'utf8' }),
    json: (...args) => {
      const r = f.run(...args);
      assert.equal(r.status, 0, r.stderr);
      return JSON.parse(r.stdout);
    },
    plugin: (name) => f.json('plan').plugins.find((p) => p.name === name),
  };
  mkdirSync(dir);
  f.git('init', '-q', '-b', 'main');
  f.write('.gitattributes', '* text=auto eol=lf\n');
  f.write('.claude-plugin/marketplace.json', marketplace('1.1.0', '1.2.0'));
  for (const name of ['alpha', 'beta']) {
    f.setVersion(name, name === 'alpha' ? '1.1.0' : '1.2.0');
    f.write(`plugins/${name}/skills/one/SKILL.md`, `# ${name} one\n`);
  }
  f.write('docs/change-log.md', '# Release Notes\n\n## alpha 1.1.0: 2026-01-01\n\n- First.\n');
  f.commit('feat: alpha 1.1.0 and beta 1.2.0');
  f.write('.claude-plugin/marketplace.json', marketplace('1.2.0', '1.2.0'));
  f.setVersion('alpha', '1.2.0');
  f.write('plugins/alpha/skills/one/SKILL.md', '# alpha one, revised\n');
  f.write('docs/change-log.md', `${f.read('docs/change-log.md')}\n## alpha 1.2.0: 2026-01-02\n\n- Revised.\n`);
  f.versionCommit = f.commit('feat: alpha 1.2.0');
  f.publish();
  return f;
}

const addGamma = (f) => {
  f.write('.claude-plugin/marketplace.json', f.read('.claude-plugin/marketplace.json').replace(
    '  ]\n}', '  ,\n    { "name": "gamma", "version": "0.1.0", "source": "./plugins/gamma" }\n  ]\n}'));
  f.setVersion('gamma', '0.1.0');
};

test('a plugin untouched since its released version is current, and its notes are not in question', (t) => {
  const f = fixture(t);
  const alpha = f.plugin('alpha');
  assert.equal(alpha.status, 'current');
  assert.equal(alpha.released, '1.2.0');
  assert.equal(alpha.working, '1.2.0');
  assert.equal(alpha.base, f.versionCommit);
  assert.equal(alpha.notes, null);
  assert.deepEqual(alpha.changed, []);
});

test('a change pushed without a bump still needs one, measured from the commit that set the version', (t) => {
  const f = fixture(t);
  f.write('plugins/alpha/skills/one/SKILL.md', '# alpha one, pushed unbumped\n');
  f.commit('fix: alpha wording');
  f.publish();
  const alpha = f.plugin('alpha');
  assert.equal(alpha.status, 'needs-bump');
  assert.equal(alpha.base, f.versionCommit);
  assert.equal(alpha.notes, null);
  assert.deepEqual(alpha.changed, ['plugins/alpha/skills/one/SKILL.md']);
  assert.deepEqual(alpha.commits.map((c) => c.replace(/^\w+ /, '')), ['fix: alpha wording']);
  assert.equal(f.plugin('beta').status, 'current');
});

test('uncommitted edits, staged files and untracked files all count as changes', (t) => {
  const f = fixture(t);
  f.write('plugins/alpha/skills/one/SKILL.md', '# alpha one, edited\n');
  f.write('plugins/alpha/skills/two/SKILL.md', '# alpha two\n');
  f.write('plugins/alpha/skills/three/SKILL.md', '# alpha three\n');
  f.git('add', 'plugins/alpha/skills/three/SKILL.md');
  const alpha = f.plugin('alpha');
  assert.equal(alpha.status, 'needs-bump');
  assert.deepEqual(alpha.changed, [
    'plugins/alpha/skills/one/SKILL.md', 'plugins/alpha/skills/three/SKILL.md', 'plugins/alpha/skills/two/SKILL.md',
  ]);
});

test('deleted files, manifests included, count as changes', (t) => {
  const f = fixture(t);
  unlinkSync(f.file('plugins/alpha/skills/one/SKILL.md'));
  unlinkSync(f.file('plugins/alpha/.cursor-plugin/plugin.json'));
  const alpha = f.plugin('alpha');
  assert.equal(alpha.status, 'needs-bump');
  assert.deepEqual(alpha.changed, ['plugins/alpha/.cursor-plugin/plugin.json', 'plugins/alpha/skills/one/SKILL.md']);
});

test('a manifest edit counts as a change unless it only moves the version', (t) => {
  const f = fixture(t);
  f.write('plugins/alpha/plugin.json', manifest('alpha', '1.2.0').replace('The alpha plugin', 'Alpha, renamed'));
  assert.deepEqual(f.plugin('alpha').changed, ['plugins/alpha/plugin.json']);

  const g = fixture(t);
  g.setVersion('alpha', '1.3.0');
  const alpha = g.plugin('alpha');
  assert.equal(alpha.status, 'bumped');
  assert.deepEqual(alpha.changed, []);
});

test('a manifest commit that keeps the version leaves the base on the commit that set it', (t) => {
  const f = fixture(t);
  f.write('plugins/alpha/.claude-plugin/plugin.json', manifest('alpha', '1.2.0').replace('The alpha plugin', 'Alpha, renamed'));
  f.commit('docs: rename alpha');
  f.publish();
  const alpha = f.plugin('alpha');
  assert.equal(alpha.base, f.versionCommit);
  assert.equal(alpha.status, 'needs-bump');
  assert.deepEqual(alpha.changed, ['plugins/alpha/.claude-plugin/plugin.json']);
});

test('a bump merged from a side branch takes its base from the merge, so work merged with it has shipped', (t) => {
  const f = fixture(t);
  f.git('checkout', '-q', '-b', 'side');
  f.write('.claude-plugin/marketplace.json', marketplace('1.3.0', '1.2.0'));
  f.setVersion('alpha', '1.3.0');
  f.commit('feat: alpha 1.3.0');
  f.git('checkout', '-q', 'main');
  f.write('plugins/alpha/skills/one/SKILL.md', '# alpha one, fixed on main\n');
  f.commit('fix: alpha on main');
  f.git('merge', '-q', '--no-ff', '-m', 'Merge side', 'side');
  f.publish();
  const alpha = f.plugin('alpha');
  assert.equal(alpha.status, 'current');
  assert.equal(alpha.base, f.git('rev-parse', 'HEAD'));
  assert.deepEqual(alpha.changed, []);
});

test('a bump committed but not pushed is measured against origin/main', (t) => {
  const f = fixture(t);
  f.write('.claude-plugin/marketplace.json', marketplace('1.3.0', '1.2.0'));
  f.setVersion('alpha', '1.3.0');
  f.write('plugins/alpha/skills/one/SKILL.md', '# alpha one, unpushed\n');
  f.commit('feat: alpha 1.3.0, unpushed');
  const alpha = f.plugin('alpha');
  assert.equal(alpha.released, '1.2.0');
  assert.equal(alpha.status, 'bumped');
  assert.equal(alpha.base, f.versionCommit);
  assert.deepEqual(alpha.changed, ['plugins/alpha/skills/one/SKILL.md']);
  assert.deepEqual(alpha.commits.map((c) => c.replace(/^\w+ /, '')), ['feat: alpha 1.3.0, unpushed']);
});

test('a raised working version is bumped, and has notes once the change-log has its section', (t) => {
  const f = fixture(t);
  f.setVersion('alpha', '1.3.0');
  f.write('plugins/alpha/skills/one/SKILL.md', '# alpha one, new behavior\n');
  let alpha = f.plugin('alpha');
  assert.equal(alpha.status, 'bumped');
  assert.equal(alpha.notes, false);
  assert.deepEqual(alpha.changed, ['plugins/alpha/skills/one/SKILL.md']);

  f.write('docs/change-log.md', '# Release Notes\n\n## alpha 1.3.0: 2026-02-01\n\n- New behavior.\n\n## alpha 1.1.0: 2026-01-01\n\n- First.\n');
  alpha = f.plugin('alpha');
  assert.equal(alpha.notes, true);
});

test('notes for another plugin or version do not count', (t) => {
  const f = fixture(t);
  f.setVersion('alpha', '1.3.0');
  f.write('docs/change-log.md', '# Release Notes\n\n## beta 1.3.0: 2026-02-01\n\n- Beta.\n\n## alpha 1.3.1: 2026-02-01\n\n- Later.\n');
  assert.equal(f.plugin('alpha').notes, false);
});

test('versions compare by number, not by text', (t) => {
  const f = fixture(t);
  f.setVersion('alpha', '1.10.0');
  assert.equal(f.plugin('alpha').status, 'bumped');
});

test('a working version not above the released one, or not x.y.z, is invalid', (t) => {
  const f = fixture(t);
  for (const version of ['1.1.9', '1.3', '1.3.0-beta']) {
    f.setVersion('alpha', version);
    assert.equal(f.plugin('alpha').status, 'invalid', version);
  }
});

test('a plugin missing from the released ref is new', (t) => {
  const f = fixture(t);
  addGamma(f);
  const gamma = f.plugin('gamma');
  assert.equal(gamma.status, 'new');
  assert.equal(gamma.released, null);
  assert.equal(gamma.working, '0.1.0');
  assert.equal(gamma.notes, false);
});

const versionFiles = (plugin) => ['.claude-plugin/marketplace.json', ...MANIFESTS.map((rel) => `plugins/${plugin}/${rel}`)];

test('bump writes the version into all four manifests and only that plugin\'s marketplace entry', (t) => {
  const f = fixture(t);
  const before = Object.fromEntries([...versionFiles('alpha'), ...versionFiles('beta')].map((rel) => [rel, f.read(rel)]));
  const r = f.run('bump', 'beta', '1.3.0');
  assert.equal(r.status, 0, r.stderr);
  for (const rel of MANIFESTS) {
    assert.equal(f.read(`plugins/beta/${rel}`), before[`plugins/beta/${rel}`].replace('"version": "1.2.0"', '"version": "1.3.0"'));
    assert.equal(f.read(`plugins/alpha/${rel}`), before[`plugins/alpha/${rel}`]);
  }
  const market = before['.claude-plugin/marketplace.json'];
  const betaAt = market.lastIndexOf('"version": "1.2.0"');
  assert.notEqual(betaAt, market.indexOf('"version": "1.2.0"'));
  assert.equal(f.read('.claude-plugin/marketplace.json'),
    `${market.slice(0, betaAt)}"version": "1.3.0"${market.slice(betaAt + '"version": "1.2.0"'.length)}`);
});

test('bump refuses a malformed version, one not above the released version, and an unknown plugin', (t) => {
  const f = fixture(t);
  const before = versionFiles('alpha').map(f.read).join('');
  for (const [plugin, version, reason] of [
    ['alpha', '1.3', /not an x\.y\.z version/],
    ['alpha', 'v1.3.0', /not an x\.y\.z version/],
    ['alpha', '1.3.0-beta', /not an x\.y\.z version/],
    ['alpha', '1.3.0.1', /not an x\.y\.z version/],
    ['alpha', '1.2.0', /not above the released 1\.2\.0/],
    ['alpha', '1.1.5', /not above the released 1\.2\.0/],
    ['delta', '9.0.0', /has no plugin named delta/],
  ]) {
    const r = f.run('bump', plugin, version);
    assert.equal(r.status, 1, `bump ${plugin} ${version} should fail`);
    assert.match(r.stderr, reason);
  }
  assert.equal(versionFiles('alpha').map(f.read).join(''), before);
});

test('bump accepts versions with multi-digit parts, which are higher only by number', (t) => {
  const f = fixture(t);
  for (const version of ['1.2.10', '1.10.0', '10.0.0']) {
    assert.equal(f.run('bump', 'alpha', version).status, 0, version);
    const alpha = f.plugin('alpha');
    assert.deepEqual({ working: alpha.working, status: alpha.status }, { working: version, status: 'bumped' });
  }
});

test('bump may raise a version that is bumped but not yet released', (t) => {
  const f = fixture(t);
  f.setVersion('alpha', '1.2.1');
  assert.equal(f.run('bump', 'alpha', '1.3.0').status, 0);
  assert.equal(f.plugin('alpha').working, '1.3.0');
  assert.match(f.read('.claude-plugin/marketplace.json'), /"name": "alpha",\n {6}"version": "1\.3\.0"/);
});

test('bump sets the first version of a new plugin', (t) => {
  const f = fixture(t);
  addGamma(f);
  const r = f.run('bump', 'gamma', '0.2.0');
  assert.equal(r.status, 0, r.stderr);
  for (const rel of MANIFESTS) assert.equal(f.read(`plugins/gamma/${rel}`), manifest('gamma', '0.2.0'));
  assert.match(f.read('.claude-plugin/marketplace.json'), /"name": "gamma", "version": "0\.2\.0"/);
});

test('bump refuses a plugin missing one of its manifests and edits nothing', (t) => {
  const f = fixture(t);
  unlinkSync(f.file('plugins/alpha/.cursor-plugin/plugin.json'));
  const before = versionFiles('alpha').filter((rel) => existsSync(f.file(rel))).map(f.read).join('');
  const r = f.run('bump', 'alpha', '1.3.0');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /missing plugins\/alpha\/\.cursor-plugin\/plugin\.json/);
  assert.equal(versionFiles('alpha').filter((rel) => existsSync(f.file(rel))).map(f.read).join(''), before);
});

test('a wrong command or argument count prints the usage', (t) => {
  const f = fixture(t);
  for (const args of [[], ['plan', 'x'], ['bump', 'alpha'], ['publish']]) {
    const r = f.run(...args);
    assert.equal(r.status, 1, args.join(' '));
    assert.match(r.stderr, /^usage: release\.mjs/);
  }
});

// Fake CLIs answer exactly `plugin list --json` from a file, log every other
// call, and fail a call that contains `fail`. `null` leaves the CLI missing.
function hosts(f, { claude = [], codex = [], fail = null } = {}) {
  for (const [name, list] of [['claude', claude], ['codex', codex && { installed: codex }]]) {
    const bin = path.join(f.base, 'bin', name);
    rmSync(bin, { force: true });
    if (list === null) continue;
    const listFile = path.join(f.base, `${name}-list.json`);
    writeFileSync(listFile, JSON.stringify(list));
    writeFileSync(bin, [
      '#!/bin/sh',
      `if [ "$*" = "plugin list --json" ]; then cat '${listFile}'; exit 0; fi`,
      `printf '%s\\n' "$*" >> '${path.join(f.base, `${name}.log`)}'`,
      fail ? `case "$*" in *'${fail}'*) echo "boom: $*" >&2; exit 3;; esac` : '',
      'exit 0',
    ].join('\n'));
    chmodSync(bin, 0o755);
  }
}
const calls = (f, name) => {
  const log = path.join(f.base, `${name}.log`);
  return existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n') : [];
};

function install(f, root) {
  cpSync(f.file('plugins/alpha'), root, { recursive: true });
  return root;
}

const claudePath = (f, version = '1.2.0') => path.join(f.base, 'claude-home/plugins/cache/workshop/alpha', version);
const codexPath = (f, version = '1.2.0') => path.join(f.base, 'codex-home/plugins/cache/workshop/alpha', version);
const claudeEntry = (f, version = '1.2.0') => ({ id: 'alpha@workshop', version, scope: 'user', enabled: true, installPath: claudePath(f, version) });
const codexEntry = (version = '1.2.0') => ({ pluginId: 'alpha@workshop', name: 'alpha', marketplaceName: 'workshop', version, enabled: true });
// Installs that are not released Workshop plugins: the same name from another
// marketplace, and a Workshop plugin the marketplace no longer lists.
const foreignClaude = (f) => [
  { id: 'alpha@elsewhere', version: '9.9.9', scope: 'user', enabled: true, installPath: path.join(f.base, 'elsewhere') },
  { id: 'retired@workshop', version: '0.1.0', scope: 'user', enabled: true, installPath: path.join(f.base, 'retired') },
];
const foreignCodex = [
  { pluginId: 'alpha@elsewhere', name: 'alpha', marketplaceName: 'elsewhere', version: '9.9.9', enabled: true },
  { pluginId: 'retired@workshop', name: 'retired', marketplaceName: 'workshop', version: '0.1.0', enabled: true },
];

test('refresh updates the marketplace, then each user-scope released Workshop plugin, in each host', (t) => {
  const f = fixture(t);
  hosts(f, {
    claude: [claudeEntry(f), { id: 'beta@workshop', version: '1.2.0', scope: 'project', enabled: true, installPath: path.join(f.base, 'b') }, ...foreignClaude(f)],
    codex: [codexEntry(), ...foreignCodex],
  });
  const r = f.run('refresh');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.deepEqual(calls(f, 'claude'), [
    'plugin marketplace update workshop',
    'plugin update alpha@workshop --scope user',
  ]);
  assert.deepEqual(calls(f, 'codex'), ['plugin marketplace upgrade workshop --json', 'plugin add alpha@workshop --json']);
  const steps = JSON.parse(r.stdout).steps;
  assert.deepEqual(steps.filter((step) => step.status !== 'ok').map(({ host, plugin, status }) => ({ host, plugin, status })), [
    { host: 'claude', plugin: 'beta', status: 'skipped' },
  ]);
});

test('refresh skips a host without its CLI or without a released Workshop plugin', (t) => {
  const f = fixture(t);
  hosts(f, { claude: null, codex: foreignCodex });
  const r = f.run('refresh');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.deepEqual(JSON.parse(r.stdout).steps.map(({ host, status }) => ({ host, status })), [
    { host: 'claude', status: 'skipped' },
    { host: 'codex', status: 'skipped' },
  ]);
  assert.deepEqual(calls(f, 'codex'), []);
});

test('a failed host command fails refresh, is reported, and the other updates still run', (t) => {
  const f = fixture(t);
  hosts(f, { claude: [claudeEntry(f)], codex: [codexEntry()], fail: 'marketplace update' });
  const r = f.run('refresh');
  assert.equal(r.status, 1);
  const failed = JSON.parse(r.stdout).steps.filter((step) => step.status === 'failed');
  assert.deepEqual(failed.map(({ command, output }) => ({ command, output })), [
    { command: 'claude plugin marketplace update workshop', output: 'boom: plugin marketplace update workshop' },
  ]);
  assert.deepEqual(calls(f, 'claude'), ['plugin marketplace update workshop', 'plugin update alpha@workshop --scope user']);
  assert.equal(calls(f, 'codex').length, 2);
});

test('installed copies that match the released tree pass, ignoring host markers and other plugins', (t) => {
  const f = fixture(t);
  const claudeCopy = install(f, claudePath(f));
  mkdirSync(path.join(claudeCopy, '.in_use'));
  writeFileSync(path.join(claudeCopy, '.in_use/4242'), '');
  writeFileSync(path.join(claudeCopy, '.DS_Store'), '');
  writeFileSync(path.join(install(f, codexPath(f)), 'skills/.DS_Store'), '');
  hosts(f, { claude: [claudeEntry(f), ...foreignClaude(f)], codex: [codexEntry(), ...foreignCodex] });
  const r = f.run('verify-caches');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.deepEqual(JSON.parse(r.stdout).rows.map(({ host, plugin, status, files }) => ({ host, plugin, status, files })), [
    { host: 'claude', plugin: 'alpha', status: 'match', files: 5 },
    { host: 'claude', plugin: 'retired', status: 'not-released', files: undefined },
    { host: 'codex', plugin: 'alpha', status: 'match', files: 5 },
    { host: 'codex', plugin: 'retired', status: 'not-released', files: undefined },
  ]);
  assert.deepEqual([...calls(f, 'claude'), ...calls(f, 'codex')], []);
});

test('a changed, a missing or an extra file each fails and is named', (t) => {
  for (const [defect, expected] of [
    [(root) => writeFileSync(path.join(root, 'skills/one/SKILL.md'), '# stale bytes\n'), { differing: ['skills/one/SKILL.md'], missing: [], extra: [] }],
    [(root) => unlinkSync(path.join(root, 'plugin.json')), { differing: [], missing: ['plugin.json'], extra: [] }],
    [(root) => writeFileSync(path.join(root, 'skills/one/leftover.md'), 'old\n'), { differing: [], missing: [], extra: ['skills/one/leftover.md'] }],
    [(root) => writeFileSync(path.join(root, 'skills/one/SKILL.md'), '# alpha one, revised\r\n'), { differing: ['skills/one/SKILL.md'], missing: [], extra: [] }],
    [(root) => rmSync(root, { recursive: true }), { differing: [], missing: MANIFESTS.concat('skills/one/SKILL.md').sort(), extra: [] }],
  ]) {
    const f = fixture(t);
    defect(install(f, claudePath(f)));
    hosts(f, { claude: [claudeEntry(f)] });
    const r = f.run('verify-caches');
    assert.equal(r.status, 1);
    const [row] = JSON.parse(r.stdout).rows;
    assert.equal(row.status, 'mismatch');
    assert.deepEqual({ differing: row.differing, missing: row.missing, extra: row.extra }, expected);
  }
});

test('a host still on an older version is stale', (t) => {
  const f = fixture(t);
  install(f, claudePath(f));
  install(f, codexPath(f, '1.1.0'));
  hosts(f, { claude: [claudeEntry(f)], codex: [codexEntry('1.1.0')] });
  const r = f.run('verify-caches');
  assert.equal(r.status, 1);
  const codex = JSON.parse(r.stdout).rows.find((row) => row.host === 'codex');
  assert.equal(codex.status, 'stale');
  assert.equal(codex.installed, '1.1.0');
  assert.equal(codex.released, '1.2.0');
});

test('copies are compared with origin/main, not with local commits or the working tree', (t) => {
  const f = fixture(t);
  install(f, claudePath(f));
  hosts(f, { claude: [claudeEntry(f)] });
  f.write('plugins/alpha/skills/one/SKILL.md', '# committed, not pushed\n');
  f.commit('fix: alpha, unpushed');
  f.write('plugins/alpha/skills/two/SKILL.md', '# uncommitted\n');
  const r = f.run('verify-caches');
  assert.equal(r.status, 0, r.stdout);
  assert.equal(JSON.parse(r.stdout).rows[0].status, 'match');
});

test('a host without its CLI is skipped and one without Workshop plugins says so, neither failing', (t) => {
  for (const missing of ['claude', 'codex']) {
    const f = fixture(t);
    install(f, claudePath(f));
    install(f, codexPath(f));
    hosts(f, { claude: [claudeEntry(f)], codex: [codexEntry()], [missing]: null });
    const probe = spawnSync('sh', ['-c', `command -v ${missing}`], { env: f.env, encoding: 'utf8' });
    assert.notEqual(probe.status, 0, `a real ${missing} is on the test PATH: ${probe.stdout}`);
    const r = f.run('verify-caches');
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const rows = JSON.parse(r.stdout).rows.map(({ host, status }) => ({ host, status }));
    assert.deepEqual(rows, ['claude', 'codex'].map((host) => ({ host, status: host === missing ? 'skipped' : 'match' })));
  }
  const f = fixture(t);
  hosts(f, { claude: [], codex: foreignCodex.slice(0, 1) });
  assert.deepEqual(f.json('verify-caches').rows.map(({ host, status }) => ({ host, status })), [
    { host: 'claude', status: 'none' },
    { host: 'codex', status: 'none' },
  ]);
});

test('without CODEX_HOME the Codex copy is read from ~/.codex', (t) => {
  const f = fixture(t);
  delete f.env.CODEX_HOME;
  install(f, path.join(f.base, '.codex/plugins/cache/workshop/alpha/1.2.0'));
  hosts(f, { claude: [], codex: [codexEntry()] });
  const row = f.json('verify-caches').rows.find((r) => r.host === 'codex');
  assert.equal(row.status, 'match');
});

test('the Codex copy of the skill matches the canonical one', () => {
  const repo = path.resolve(skillDir, '../../..');
  assert.equal(readFileSync(path.join(repo, '.codex/skills/release/SKILL.md'), 'utf8'), readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8'));
});
