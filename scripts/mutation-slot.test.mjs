import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, unlinkSync, utimesSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const helper = path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '../plugins/workbench/skills/test-quality-review/scripts/mutation-slot.mjs');
const { campaigns, defaultQueue, isListing, parse, Queue, queuePosition, readListing } = await import(pathToFileURL(helper).href);
const TIMEOUT = { timeout: 30000 };

function rig(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'mutation-slot-test-'));
  const r = { root, queue: path.join(root, 'queue'), ps: path.join(root, 'ps.txt'), log: path.join(root, 'order.log'),
    gate: path.join(root, 'gate'), pids: [], children: [] };
  writeFileSync(r.ps, '');
  t.after(() => {
    writeFileSync(r.gate, '');
    for (const pid of r.pids) if (!gone(pid)) process.kill(pid, 'SIGKILL');
    for (const child of r.children) { child.stdout.destroy(); child.stderr.destroy(); }
    rmSync(root, { recursive: true, force: true });
  });
  return r;
}

function start(r, command, extra = [], spawnOptions = {}) {
  const child = spawn(process.execPath, [helper, '--queue', r.queue, '--poll', '40', ...extra, '--', ...command], {
    env: { ...process.env, MUTATION_SLOT_PS_FILE: r.ps },
    stdio: ['ignore', 'pipe', 'pipe'],
    ...spawnOptions,
  });
  r.pids.push(child.pid);
  r.children.push(child);
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  const lines = () => stderr.split('\n').filter(line => line.startsWith('mutation-slot: {'))
    .map(line => JSON.parse(line.slice('mutation-slot: '.length)));
  child.lines = lines;
  child.done = new Promise(resolve => child.on('exit', (code, signal) => {
    resolve({ code, signal, stdout, stderr, lines: lines(), summary: lines().at(-1) ?? null });
  }));
  return child;
}

const node = script => [process.execPath, '-e', script];
const quote = JSON.stringify;
const marker = file => node(`require('fs').writeFileSync(${quote(file)}, '')`);
const gated = (r, name) => node(
  `const fs=require('fs');fs.appendFileSync(${quote(r.log)},'${name}-start\\n');` +
  `const t=setInterval(()=>{if(!fs.existsSync(${quote(r.root)}))process.exit(1);` +
  `if(fs.existsSync(${quote(r.gate)})){clearInterval(t);fs.appendFileSync(${quote(r.log)},'${name}-end\\n');}},20);`);
const logStep = (r, name) => node(
  `const fs=require('fs');fs.appendFileSync(${quote(r.log)},'${name}-start\\n');fs.appendFileSync(${quote(r.log)},'${name}-end\\n');`);
const ticketsDir = r => path.join(r.queue, 'tickets');
const tickets = r => existsSync(ticketsDir(r)) ? readdirSync(ticketsDir(r)) : [];
const lockDir = r => path.join(r.queue, 'lock');
const ownerFile = r => path.join(lockDir(r), 'owner.json');
const until = async (predicate, ms = 10000) => {
  const end = Date.now() + ms;
  while (!predicate()) {
    if (Date.now() > end) throw new Error('condition not reached');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
};
const gone = pid => { try { process.kill(pid, 0); return false; } catch (error) { return error.code === 'ESRCH'; } };
const within = (promise, ms = 8000) => Promise.race([promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(`no exit within ${ms} ms`)), ms).unref())]);
const deadPid = () => spawnSync(process.execPath, ['-e', '']).pid;
const waiting = child => () => child.lines().some(line => line.status === 'waiting');
const backdate = (file, minutes = 3) => { const then = new Date(Date.now() - minutes * 60000); utimesSync(file, then, then); };
const recent = file => Date.now() - statSync(file).mtimeMs < 5000;
const holdLock = (r, pid = process.pid) => {
  mkdirSync(lockDir(r), { recursive: true });
  writeFileSync(ownerFile(r), JSON.stringify({ pid }));
};
const seedTicket = (r, stamp, pid = process.pid) => {
  mkdirSync(ticketsDir(r), { recursive: true });
  const file = path.join(ticketsDir(r), `${String(stamp).padStart(15, '0')}-${pid}-seed${stamp}`);
  writeFileSync(file, '{}');
  return file;
};

test('recognizes campaign processes and ignores shells, pollers, builds and the helper', () => {
  const listing = [
    '  101 /Users/me/.cargo/bin/cargo-mutants mutants --in-place --file src/parser.rs',
    '  102 cargo mutants --list',
    '  103 node /tmp/tq.abc/tree/node_modules/@stryker-mutator/core/bin/stryker.js run stryker.conf.json',
    '  104 /tmp/tq.abc/tree/node_modules/.bin/stryker run',
    '  105 bun /tmp/tq.abc/tree/node_modules/@stryker-mutator/core/bin/stryker run',
    '  106 node -r tsx/cjs --enable-source-maps --max-old-space-size=8192 node_modules/@stryker-mutator/core/bin/stryker.js run',
    '  201 /bin/zsh -c ps -axo pid,command | grep -E \'[s]tryker|[c]argo-mutants\'',
    '  202 node /tmp/tq.abc/tree/node_modules/vitest/vitest.mjs --config vitest.stryker.config.ts',
    '  203 node /plugins/workbench/skills/test-quality-review/scripts/mutation-slot.mjs -- npx stryker run',
    '  204 grep cargo-mutants',
    '  205 node /plugins/workbench/skills/test-quality-review/scripts/mutation-slot.mjs -- stryker run',
    '  206 node /plugins/workbench/skills/test-quality-review/scripts/mutation-slot.mjs -- node_modules/.bin/stryker run',
    '  207 bun /plugins/workbench/skills/test-quality-review/scripts/mutation-slot.mjs -- stryker run',
    '  208 cargo test --lib',
    '  209 cargo build --release',
    '  210 node',
    '  211 node --inspect',
  ].join('\n');
  assert.deepEqual(campaigns(listing, 0).map(c => c.pid), [101, 103, 104, 105, 106]);
});

test('a listing that executes no mutant is not a campaign', () => {
  for (const argv of [
    ['cargo', 'mutants', '--list'],
    ['cargo', 'mutants', '--list-files', '--file', 'src/parser.rs'],
    ['/Users/me/.cargo/bin/cargo-mutants', 'mutants', '--version'],
    ['node_modules/.bin/stryker', '--help'],
  ]) assert.equal(isListing(argv), true, argv.join(' '));
  for (const argv of [
    ['cargo', 'mutants', '--in-place'],
    ['cargo', 'mutants', '--in-place', '--', '--list'],
    ['node_modules/.bin/stryker', 'run', '--dryRunOnly'],
    ['cargo', 'build', '--list'],
    // cargo-mutants reads -V as --unviable, which runs the campaign.
    ['cargo', 'mutants', '--in-place', '-V', '--file', 'src/parser.rs'],
    ['cargo-mutants', '-V'],
  ]) assert.equal(isListing(argv), false, argv.join(' '));
  for (const argv of [['stryker', '-V'], ['node', 'node_modules/.bin/stryker', '--version']]) assert.equal(isListing(argv), true, argv.join(' '));
  assert.deepEqual(campaigns('  401 cargo mutants --in-place -V\n', 0).map(c => c.pid), [401]);
  assert.deepEqual(campaigns('  301 cargo mutants --list-files\n  302 cargo mutants --in-place -- --list\n', 0).map(c => c.pid), [302]);
});

test('never counts its own process as a running campaign', () => {
  assert.deepEqual(campaigns('  4242 node /tmp/x/stryker.js run\n', 4242), []);
});

test('the real process listing finds a running campaign and sees the host', TIMEOUT, async t => {
  const r = rig(t);
  const fake = path.join(r.root, 'cargo-mutants');
  symlinkSync(process.execPath, fake);
  const campaign = spawn(fake, ['-e', 'setTimeout(()=>{}, 20000)'], { stdio: 'ignore' });
  r.pids.push(campaign.pid);
  await until(() => readListing().running.some(c => c.pid === campaign.pid));
  campaign.kill('SIGKILL');
  assert.equal(readListing().seesHost, true);
});

test('the bare form keeps the whole command and uses the default queue', () => {
  const options = parse(['--', 'npx', 'stryker', 'run']);
  assert.deepEqual(options.command, ['npx', 'stryker', 'run']);
  assert.equal(options.queue, defaultQueue());
  assert.equal(options.waitLimit, 900);
});

test('the default queue is one fixed path per user, whatever TMPDIR says', () => {
  const user = process.getuid ? process.getuid() : os.userInfo().username;
  const previous = process.env.TMPDIR;
  process.env.TMPDIR = '/var/empty/elsewhere';
  try {
    assert.equal(defaultQueue(), path.join(existsSync('/tmp') ? '/tmp' : os.tmpdir(), `workbench-mutation-slot-${user}`));
  } finally {
    if (previous === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = previous;
  }
});

test('queue position is the rank of the ticket name, whatever order the directory lists', () => {
  const names = ['000000000000003-30-c', '000000000000001-10-a', '000000000000004-40-d', '000000000000002-20-b'];
  assert.equal(queuePosition(names, '000000000000003-30-c'), 2);
  assert.equal(queuePosition(names, '000000000000001-10-a'), 0);
});

test('two queue entries cannot both take the lock', t => {
  const r = rig(t);
  const first = new Queue(r.queue, '{}');
  const second = new Queue(r.queue, '{}');
  t.after(() => { first.leave(); first.release(); second.leave(); second.release(); });
  assert.equal(first.take(), true);
  assert.equal(second.take(), false);
});

test('runs the command when the slot is free and passes its exit status through', TIMEOUT, async t => {
  const r = rig(t);
  const result = await start(r, node('console.log("campaign output"); process.exit(3)')).done;
  assert.equal(result.code, 3);
  assert.match(result.stdout, /campaign output/);
  assert.equal(result.summary.status, 'ran');
  assert.equal(result.summary.queue, 'fifo');
  assert.equal(result.summary.exitCode, 3);
  assert.ok(result.summary.ranSeconds > 0 && result.summary.ranSeconds < 10);
  assert.deepEqual(tickets(r), []);
  assert.equal(existsSync(lockDir(r)), false);
});

test('a campaign killed by a signal exits 128 plus that signal', TIMEOUT, async t => {
  const r = rig(t);
  const result = await start(r, node('process.kill(process.pid, "SIGKILL")')).done;
  assert.equal(result.code, 137);
  assert.equal(result.summary.exitCode, 137);
});

test('a command that cannot start exits 127 and frees the slot', TIMEOUT, async t => {
  const r = rig(t);
  const result = await within(start(r, [path.join(r.root, 'no-such-campaign')]).done);
  assert.equal(result.code, 127);
  assert.equal(result.summary.status, 'spawn-failed');
  assert.equal(existsSync(lockDir(r)), false);
});

for (const [label, args] of [
  ['an unreadable wait limit', ['--wait-limit', '10m', '--', 'true']],
  ['a negative wait limit', ['--wait-limit', '-1', '--', 'true']],
  ['an unknown option', ['--bogus', '1', '--', 'true']],
  ['no -- separator', ['true']],
  ['nothing after --', ['--']],
]) {
  test(`rejects ${label} before joining the queue`, TIMEOUT, t => {
    const r = rig(t);
    const run = spawnSync(process.execPath, [helper, '--queue', r.queue, ...args], { encoding: 'utf8' });
    assert.equal(run.status, 2);
    assert.match(run.stderr, /mutation-slot: \{"status":"usage"/);
    assert.equal(existsSync(r.queue), false);
  });
}

test('runs queued campaigns one at a time in arrival order', TIMEOUT, async t => {
  const r = rig(t);
  const a = start(r, gated(r, 'A'));
  await until(() => existsSync(r.log));
  const b = start(r, logStep(r, 'B'));
  await until(() => tickets(r).length === 1);
  const c = start(r, logStep(r, 'C'));
  await until(() => tickets(r).length === 2 && waiting(c)());
  writeFileSync(r.gate, '');
  const results = await Promise.all([a.done, b.done, c.done]);
  assert.deepEqual(results.map(x => x.code), [0, 0, 0]);
  assert.deepEqual(readFileSync(r.log, 'utf8').trim().split('\n'),
    ['A-start', 'A-end', 'B-start', 'B-end', 'C-start', 'C-end']);
  assert.equal(results[2].lines[0].queuedAhead, 1);
  for (const later of results.slice(1)) assert.ok(later.summary.waitedSeconds > 0 && later.summary.waitedSeconds < 10);
});

test('waits behind every older live ticket, not newer ones', TIMEOUT, async t => {
  const r = rig(t);
  const older = [seedTicket(r, 1), seedTicket(r, 2)];
  seedTicket(r, 999999999999998);
  seedTicket(r, 999999999999999);
  const ran = path.join(r.root, 'ran');
  const child = start(r, marker(ran));
  await until(waiting(child));
  assert.equal(child.lines()[0].queuedAhead, 2);
  await new Promise(resolve => setTimeout(resolve, 200));
  assert.equal(existsSync(ran), false);
  assert.ok(older.every(existsSync));
  older.forEach(file => unlinkSync(file));
  const result = await child.done;
  assert.equal(result.code, 0);
  assert.equal(existsSync(ran), true);
});

test('waits for a campaign started outside the queue', TIMEOUT, async t => {
  const r = rig(t);
  writeFileSync(r.ps, '  999 /Users/me/.cargo/bin/cargo-mutants mutants --in-place\n');
  const ran = path.join(r.root, 'ran');
  const child = start(r, marker(ran));
  await until(waiting(child));
  assert.deepEqual(child.lines()[0].runningCampaigns, [999]);
  assert.equal(existsSync(ran), false);
  writeFileSync(r.ps, '');
  const result = await child.done;
  assert.equal(result.code, 0);
  assert.equal(existsSync(ran), true);
  assert.ok(result.summary.waitedSeconds > 0 && result.summary.waitedSeconds < 10);
});

test('runs a listing at once while another campaign holds the slot', TIMEOUT, async t => {
  const r = rig(t);
  holdLock(r);
  writeFileSync(r.ps, '  999 cargo mutants --in-place\n');
  const ran = path.join(r.root, 'ran');
  const tool = path.join(r.root, 'cargo-mutants');
  writeFileSync(tool, `#!${process.execPath}\nrequire('fs').writeFileSync(${quote(ran)}, process.argv.slice(2).join(' '));\n`);
  chmodSync(tool, 0o755);
  const result = await within(start(r, [tool, 'mutants', '--list'], ['--wait-limit', '0']).done);
  assert.equal(result.code, 0);
  assert.equal(readFileSync(ran, 'utf8'), 'mutants --list');
  assert.equal(result.summary.status, 'ran');
  assert.equal(result.summary.queue, 'bypass');
  assert.equal(result.lines.some(line => line.status === 'waiting'), false);
  assert.equal(existsSync(ownerFile(r)), true);
  assert.deepEqual(tickets(r), []);
});

test('a zero wait limit still runs a campaign when the slot is free', TIMEOUT, async t => {
  const r = rig(t);
  const result = await start(r, node(''), ['--wait-limit', '0']).done;
  assert.equal(result.code, 0);
  assert.equal(result.summary.status, 'ran');
});

test('a listing that shows only the helper itself does not hold it back', TIMEOUT, async t => {
  const r = rig(t);
  writeFileSync(r.ps, '  999 cargo mutants --in-place\n');
  const ran = path.join(r.root, 'ran');
  const child = start(r, marker(ran), ['--wait-limit', '5']);
  await until(waiting(child));
  writeFileSync(r.ps, `  ${child.pid} node ${helper} -- node_modules/.bin/stryker run\n`);
  const result = await child.done;
  assert.equal(result.code, 0);
  assert.equal(existsSync(ran), true);
});

test('gives up at the wait limit without running the command', TIMEOUT, async t => {
  const r = rig(t);
  writeFileSync(r.ps, '  999 cargo mutants --in-place\n');
  const ran = path.join(r.root, 'ran');
  const result = await start(r, marker(ran), ['--wait-limit', '0.3']).done;
  assert.equal(result.code, 75);
  assert.equal(result.summary.status, 'wait-limit');
  assert.ok(result.summary.waitedSeconds >= 0.3 && result.summary.waitedSeconds < 2.3);
  assert.deepEqual(result.lines[0].runningCampaigns, [999]);
  assert.equal(existsSync(ran), false);
  assert.deepEqual(tickets(r), []);
});

test('reports whether its process listing could see other sessions', TIMEOUT, async t => {
  const r = rig(t);
  const blind = await start(r, node('')).done;
  assert.equal(blind.summary.listingSeesHost, false);
  writeFileSync(r.ps, '  4321 node /x/helper.mjs\n   901 /bin/zsh\n');
  const ownOnly = await start(r, node('')).done;
  assert.equal(ownOnly.summary.listingSeesHost, false);
  writeFileSync(r.ps, '    1 /sbin/launchd\n');
  const sighted = await start(r, node('')).done;
  assert.equal(sighted.summary.listingSeesHost, true);
});

test('a failing process listing still runs the command and reports the failure', TIMEOUT, async t => {
  const r = rig(t);
  rmSync(r.ps);
  const result = await start(r, node('process.exit(4)')).done;
  assert.equal(result.code, 4);
  assert.equal(result.summary.status, 'ran');
  assert.equal(result.summary.listingSeesHost, false);
  assert.ok(result.summary.listingError);
});

test('recovers a lock and a queue ticket left by dead processes', TIMEOUT, async t => {
  const r = rig(t);
  holdLock(r, deadPid());
  seedTicket(r, 1, deadPid());
  const result = await start(r, node(''), ['--wait-limit', '5']).done;
  assert.equal(result.code, 0);
  assert.equal(result.summary.status, 'ran');
  assert.deepEqual(tickets(r), []);
});

test('recovers a lock and a ticket whose live owner stopped refreshing them', TIMEOUT, async t => {
  const r = rig(t);
  holdLock(r);
  backdate(ownerFile(r));
  backdate(seedTicket(r, 1));
  const result = await start(r, node(''), ['--wait-limit', '5']).done;
  assert.equal(result.code, 0);
  assert.equal(result.summary.status, 'ran');
  assert.deepEqual(tickets(r), []);
});

test('waits on a lock still being created, and recovers one abandoned that way', TIMEOUT, async t => {
  const r = rig(t);
  mkdirSync(lockDir(r), { recursive: true });
  const held = await start(r, node(''), ['--wait-limit', '0.3']).done;
  assert.equal(held.code, 75);
  assert.equal(held.lines[0].lockHolder, 'starting');
  backdate(lockDir(r));
  const recovered = await start(r, node(''), ['--wait-limit', '5']).done;
  assert.equal(recovered.code, 0);
});

test('treats a lock owner it may not signal as alive', TIMEOUT, async t => {
  const r = rig(t);
  holdLock(r, 1);
  const result = await start(r, node(''), ['--wait-limit', '0.3']).done;
  assert.equal(result.code, 75);
  assert.equal(result.lines[0].lockHolder, 1);
  assert.equal(result.summary.listingSeesHost, null);
  assert.equal(existsSync(ownerFile(r)), true);
});

test('keeps its ticket fresh while waiting and restores it if removed', TIMEOUT, async t => {
  const r = rig(t);
  holdLock(r);
  const child = start(r, node(''));
  await until(waiting(child));
  const [name] = tickets(r);
  const file = path.join(ticketsDir(r), name);
  backdate(file);
  await until(() => recent(file));
  unlinkSync(file);
  await until(() => existsSync(file));
  child.kill('SIGTERM');
  await child.done;
});

test('keeps the lock fresh while its campaign runs', TIMEOUT, async t => {
  const r = rig(t);
  const child = start(r, gated(r, 'A'));
  await until(() => existsSync(r.log));
  backdate(ownerFile(r));
  await until(() => recent(ownerFile(r)));
  writeFileSync(r.gate, '');
  assert.equal((await child.done).code, 0);
});

test('leaves a lock another process took over in place', TIMEOUT, async t => {
  const r = rig(t);
  const child = start(r, gated(r, 'A'));
  await until(() => existsSync(r.log));
  writeFileSync(ownerFile(r), JSON.stringify({ pid: process.pid }));
  writeFileSync(r.gate, '');
  assert.equal((await child.done).code, 0);
  assert.equal(JSON.parse(readFileSync(ownerFile(r), 'utf8')).pid, process.pid);
});

test('falls back to the process listing when the queue directory is unusable', TIMEOUT, async t => {
  const r = rig(t);
  writeFileSync(r.queue, 'a file, not a directory');
  const result = await start(r, node('')).done;
  assert.equal(result.code, 0);
  assert.equal(result.summary.queue, 'ps-only');
  assert.ok(result.summary.queueError);
  writeFileSync(r.ps, '  999 cargo mutants --in-place\n');
  const ran = path.join(r.root, 'ran');
  const blocked = await start(r, marker(ran), ['--wait-limit', '0.3']).done;
  assert.equal(blocked.code, 75);
  assert.equal(blocked.summary.queue, 'ps-only');
  assert.equal(existsSync(ran), false);
});

test('a signal while waiting leaves the queue without running the command', TIMEOUT, async t => {
  const r = rig(t);
  holdLock(r);
  const ran = path.join(r.root, 'ran');
  const child = start(r, marker(ran));
  await until(waiting(child));
  child.kill('SIGTERM');
  const result = await within(child.done);
  assert.equal(result.code, 143);
  assert.equal(result.summary.status, 'signal');
  assert.ok(result.summary.waitedSeconds >= 0 && result.summary.waitedSeconds < 10);
  assert.equal(existsSync(ran), false);
  assert.deepEqual(tickets(r), []);
  assert.equal(existsSync(ownerFile(r)), true);
});

const holdCampaign = pidFile => node(
  `require('fs').writeFileSync(${quote(pidFile)}, String(process.pid)); setInterval(()=>{}, 1000)`);
const campaignPid = async (r, pidFile) => {
  await until(() => existsSync(pidFile) && readFileSync(pidFile, 'utf8').length > 0);
  const pid = Number(readFileSync(pidFile, 'utf8'));
  assert.ok(pid > 0);
  r.pids.push(pid);
  return pid;
};

for (const [signal, code] of [['SIGINT', 130], ['SIGTERM', 143], ['SIGHUP', 129]]) {
  test(`${signal} while running is passed to the campaign and frees the slot`, TIMEOUT, async t => {
    const r = rig(t);
    const pidFile = path.join(r.root, 'campaign.pid');
    const child = start(r, holdCampaign(pidFile));
    const pid = await campaignPid(r, pidFile);
    child.kill(signal);
    const result = await within(child.done);
    assert.equal(result.code, code);
    assert.equal(result.summary.status, 'stopped');
    await until(() => gone(pid));
    assert.equal(existsSync(lockDir(r)), false);
  });
}

test('a kill of the caller\'s process group also ends the campaign', TIMEOUT, async t => {
  const r = rig(t);
  const pidFile = path.join(r.root, 'campaign.pid');
  const child = start(r, holdCampaign(pidFile), [], { detached: true });
  const pid = await campaignPid(r, pidFile);
  process.kill(-child.pid, 'SIGKILL');
  await child.done;
  await until(() => gone(pid), 3000);
});
