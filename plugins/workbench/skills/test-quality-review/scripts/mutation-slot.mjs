// Runs one mutation campaign at a time per host, first come first served:
//   node mutation-slot.mjs [--wait-limit <seconds>] [--queue <dir>] [--poll <ms>] -- <campaign command...>
// Exits with the campaign's status, 75 when the wait limit ends first, 127 when the
// command cannot start, 128+n after signal n, or 2 on bad arguments. The last stderr
// line is `mutation-slot: {json}` with the status, queue mode, seconds waited and
// whether the process listing could see other sessions (`listingSeesHost`; null when it
// waited behind other tickets or a lock the whole time and never took a listing).
// Campaigns are Stryker, cargo-mutants and the bundled rust-mutants-runner. A listing
// (`--list`, `--list-files`, `--version`, `--help`) executes no mutant: it runs at once
// with queue mode `bypass` and never holds another campaign back.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmdirSync, statSync, unlinkSync, utimesSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

const WAIT_LIMIT_EXIT = 75;
const STALE_MS = 120000;
const SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP'];
const VALUE_OPTIONS = new Set(['-r', '--require', '--import', '--loader', '--experimental-loader', '-C', '--conditions']);
// Keyed by tool: cargo-mutants reads -V as --unviable, which runs the campaign.
const LISTING = {
  'cargo-mutants': new Set(['--list', '--list-files', '--version', '--help', '-h']),
  stryker: new Set(['--version', '-V', '--help', '-h']),
  'rust-mutants-runner': new Set(['--list', '--help', '-h']),
};
const SCRIPTS = { stryker: ['stryker', 'stryker.js'], 'rust-mutants-runner': ['rust-mutants-runner', 'rust-mutants-runner.mjs'] };

const base = arg => path.basename(arg || '');

function scriptOf(args) {
  for (let i = 0; i < args.length; i += 1) {
    if (VALUE_OPTIONS.has(args[i])) i += 1;
    else if (!args[i].startsWith('-')) return args[i];
  }
  return '';
}

function toolOf(argv) {
  const program = base(argv[0]);
  if (program === 'cargo-mutants' || (program === 'cargo' && argv[1] === 'mutants')) return 'cargo-mutants';
  const script = base(program === 'node' || program === 'bun' ? scriptOf(argv.slice(1)) : argv[0]);
  return Object.keys(SCRIPTS).find(tool => SCRIPTS[tool].includes(script)) ?? null;
}

// Arguments after a bare `--` go to the test phase, so a flag there lists nothing.
export function isListing(argv) {
  const tool = toolOf(argv);
  if (!tool) return false;
  const end = argv.indexOf('--');
  return (end < 0 ? argv : argv.slice(0, end)).some(arg => LISTING[tool].has(arg));
}

const holdsSlot = argv => toolOf(argv) !== null && !isListing(argv);

export function campaigns(listing, exclude = process.pid) {
  return listing.split('\n')
    .map(line => line.trim().match(/^(\d+)\s+(.+)$/))
    .filter(Boolean)
    .map(([, pid, command]) => ({ pid: Number(pid), command }))
    .filter(({ pid, command }) => pid !== exclude && holdsSlot(command.split(/\s+/)));
}

export function readListing() {
  try {
    const text = process.env.MUTATION_SLOT_PS_FILE
      ? readFileSync(process.env.MUTATION_SLOT_PS_FILE, 'utf8')
      : execFileSync('ps', ['-axo', 'pid=,command='], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return { running: campaigns(text), seesHost: /^\s*1\s/m.test(text) };
  } catch (error) {
    return { running: [], seesHost: false, error: error.message };
  }
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function fresh(file) {
  try {
    return Date.now() - statSync(file).mtimeMs < STALE_MS;
  } catch {
    return false;
  }
}

function ownerPid(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8')).pid ?? null;
  } catch {
    return null;
  }
}

const touch = file => { const now = new Date(); utimesSync(file, now, now); };
const quietly = action => { try { action(); } catch { /* already gone */ } };
const ticketName = () => `${String(Date.now()).padStart(15, '0')}-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
const ticketPid = name => Number(name.split('-')[1]);
export const queuePosition = (names, mine) => [...names].sort().indexOf(mine);

// A fixed /tmp path, not os.tmpdir(): TMPDIR differs between hosts and sandboxes,
// and the queue only works when every session on the host shares it.
export function defaultQueue() {
  const user = process.getuid ? process.getuid() : os.userInfo().username;
  return path.join(existsSync('/tmp') ? '/tmp' : os.tmpdir(), `workbench-mutation-slot-${user}`);
}

export function parse(argv) {
  const split = argv.indexOf('--');
  const command = split < 0 ? [] : argv.slice(split + 1);
  const flags = split < 0 ? argv : argv.slice(0, split);
  const options = { queue: defaultQueue(), waitLimit: 900, poll: 2000, command };
  for (let i = 0; i < flags.length; i += 2) {
    const [flag, value] = [flags[i], flags[i + 1]];
    if (flag === '--queue' && value) options.queue = value;
    else if (flag === '--wait-limit' && Number(value) >= 0) options.waitLimit = Number(value);
    else if (flag === '--poll' && Number(value) > 0) options.poll = Number(value);
    else throw new Error(`Unknown or incomplete option: ${flag}`);
  }
  if (!command.length) throw new Error('Missing campaign command after --');
  return options;
}

export class Queue {
  mode = 'fifo';

  constructor(dir, record) {
    this.tickets = path.join(dir, 'tickets');
    this.lock = path.join(dir, 'lock');
    this.owner = path.join(this.lock, 'owner.json');
    this.record = record;
    mkdirSync(this.tickets, { recursive: true });
    this.ticket = path.join(this.tickets, ticketName());
    writeFileSync(this.ticket, record);
    this.held = false;
  }

  heartbeat() {
    if (this.held) quietly(() => touch(this.owner));
    else if (this.ticket) {
      if (!existsSync(this.ticket)) writeFileSync(this.ticket, this.record);
      touch(this.ticket);
    }
  }

  ahead() {
    const live = readdirSync(this.tickets).filter(name => {
      const file = path.join(this.tickets, name);
      if (file === this.ticket || (alive(ticketPid(name)) && fresh(file))) return true;
      quietly(() => unlinkSync(file));
      return false;
    });
    return queuePosition(live, path.basename(this.ticket));
  }

  lockHolder() {
    if (!existsSync(this.lock)) return null;
    const pid = ownerPid(this.owner);
    if (pid && alive(pid) && fresh(this.owner)) return pid;
    if (!pid && fresh(this.lock)) return 'starting';
    if (ownerPid(this.owner) !== pid) return 'starting';
    quietly(() => unlinkSync(this.owner));
    quietly(() => rmdirSync(this.lock));
    return null;
  }

  take() {
    try {
      mkdirSync(this.lock);
    } catch {
      return false;
    }
    writeFileSync(this.owner, this.record);
    this.held = true;
    this.leave();
    return true;
  }

  leave() {
    if (this.ticket) quietly(() => unlinkSync(this.ticket));
    this.ticket = null;
  }

  release() {
    if (!this.held) return;
    this.held = false;
    if (ownerPid(this.owner) !== process.pid) return;
    quietly(() => unlinkSync(this.owner));
    quietly(() => rmdirSync(this.lock));
  }
}

class Unqueued {
  constructor(mode, reason) {
    this.mode = mode;
    this.reason = reason;
  }

  heartbeat() {}

  ahead() { return 0; }

  lockHolder() { return null; }

  take() { return true; }

  leave() {}

  release() {}
}

function openSlot(dir, record) {
  try {
    return new Queue(dir, record);
  } catch (error) {
    return new Unqueued('ps-only', error.message);
  }
}

const say = fields => process.stderr.write(`mutation-slot: ${JSON.stringify(fields)}\n`);
const seconds = ms => Math.round(ms / 10) / 100;

async function waitForSlot(slot, options, abort, report) {
  const started = Date.now();
  let listing = { running: [], seesHost: null };
  let announced = false;
  for (;;) {
    slot.heartbeat();
    const position = slot.ahead();
    const holder = position === 0 ? slot.lockHolder() : null;
    if (position === 0 && !holder) {
      listing = readListing();
      if (!listing.running.length && slot.take()) return { status: 'acquired', waitedMs: Date.now() - started, listing };
    }
    if (!announced) {
      report({ status: 'waiting', queuedAhead: position, lockHolder: holder,
        runningCampaigns: position === 0 && !holder ? listing.running.map(c => c.pid) : [] });
      announced = true;
    }
    if (Date.now() - started >= options.waitLimit * 1000) return { status: 'wait-limit', waitedMs: Date.now() - started, listing };
    try {
      await sleep(options.poll, undefined, { signal: abort });
    } catch {
      return { status: 'signal', waitedMs: Date.now() - started, listing };
    }
  }
}

function runCampaign(command, onStart) {
  return new Promise(resolve => {
    const child = spawn(command[0], command.slice(1), { stdio: 'inherit' });
    onStart(child);
    child.on('error', error => resolve({ error }));
    child.on('exit', (code, signal) => resolve({ code, signal }));
  });
}

export async function main(argv) {
  let options;
  try {
    options = parse(argv);
  } catch (error) {
    say({ status: 'usage', reason: error.message });
    return 2;
  }
  const record = JSON.stringify({ pid: process.pid, cwd: process.cwd(), command: options.command.join(' ') });
  const bypass = isListing(options.command);
  const slot = bypass ? new Unqueued('bypass') : openSlot(options.queue, record);
  const abort = new AbortController();
  let child = null;
  const onSignal = signal => {
    if (child) quietly(() => child.kill(signal));
    if (!abort.signal.aborted) abort.abort(signal);
  };
  for (const signal of SIGNALS) process.on(signal, onSignal);
  const report = fields => say({ ...fields, queue: slot.mode, ...(slot.reason ? { queueError: slot.reason } : {}) });
  const signalExit = () => 128 + os.constants.signals[abort.signal.reason];
  try {
    const wait = bypass ? { status: 'acquired', waitedMs: 0, listing: { running: [], seesHost: null } }
      : await waitForSlot(slot, options, abort.signal, report);
    const seen = { waitedSeconds: seconds(wait.waitedMs), listingSeesHost: wait.listing.seesHost,
      ...(wait.listing.error ? { listingError: wait.listing.error } : {}) };
    if (wait.status === 'wait-limit') {
      report({ status: 'wait-limit', ...seen });
      return WAIT_LIMIT_EXIT;
    }
    if (wait.status === 'signal') {
      report({ status: 'signal', signal: abort.signal.reason, ...seen });
      return signalExit();
    }
    const launched = Date.now();
    const beat = setInterval(() => slot.heartbeat(), options.poll);
    const outcome = await runCampaign(options.command, started => { child = started; });
    clearInterval(beat);
    const exitCode = outcome.error ? 127 : outcome.code ?? 128 + os.constants.signals[outcome.signal];
    const status = outcome.error ? 'spawn-failed' : abort.signal.aborted ? 'stopped' : 'ran';
    report({ status, ...seen, ranSeconds: seconds(Date.now() - launched), exitCode,
      ...(outcome.error ? { reason: outcome.error.message } : {}) });
    return abort.signal.aborted ? signalExit() : exitCode;
  } finally {
    slot.leave();
    slot.release();
    for (const signal of SIGNALS) process.off(signal, onSignal);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = await main(process.argv.slice(2));
}
