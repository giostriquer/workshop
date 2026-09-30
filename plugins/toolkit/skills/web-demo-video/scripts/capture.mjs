import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseArgs, promisify } from 'node:util';
import { installEvidence, readEvidence, currentPage, stopTabVideo } from './browser-evidence.mjs';

const exec = promisify(execFile);
const OWNER = 'workshop-ui-demo-video';
const actions = new Set([
  'goto', 'reload', 'go-back', 'go-forward', 'snapshot', 'find', 'click', 'dblclick',
  'fill', 'type', 'press', 'keydown', 'keyup', 'hover', 'select', 'check', 'uncheck',
  'drag', 'drop', 'upload', 'mousemove', 'mousedown', 'mouseup', 'mousewheel',
  'dialog-accept', 'dialog-dismiss', 'tab-list', 'tab-new', 'tab-close', 'tab-select',
  'state-load', 'console', 'requests', 'generate-locator', 'highlight', 'run-code',
]);
const help = `UI demo capture — uses @playwright/cli 0.1.22 or a compatible newer release.

node capture.mjs doctor [--project DIR] [--cli PATH] [--url URL]
node capture.mjs start --url URL [--project DIR] [--out DIR] [--name NAME]
                      [--cli PATH] [--browser chrome|chromium|msedge|firefox|webkit]
                      [--viewport 1280x720] [--storage-state FILE]
node capture.mjs act --run DIR -- COMMAND [ARG...]
node capture.mjs frame --run DIR --name "Scene name" [--wait-for CSS] [--wait-hidden CSS]
node capture.mjs finish --run DIR [--mp4 auto|off|required] [--ffmpeg PATH] [--recover]

Commands return JSON. Exit 0: command/capture succeeded, visual review still pending.
Exit 1: capture/artifact/error evidence needs attention. Exit 2: usage/prerequisite gap.
Run from the installed skill; never copy this script. The CLI is resolved from
--cli, UI_DEMO_VIDEO_CLI, the target project's @playwright/cli, or PATH.
No command installs packages, starts an app server, or attaches to an existing browser.
Capture calls on a run must be sequential. Only the run's owned session is closed.
`;

function parse(argv) {
  const separator = argv.indexOf('--');
  const { values, positionals } = parseArgs({
    args: separator < 0 ? argv : argv.slice(0, separator), allowPositionals: true,
    options: Object.fromEntries([
      'project', 'cli', 'url', 'out', 'name', 'run', 'browser', 'viewport',
      'storage-state', 'wait-for', 'wait-hidden', 'mp4', 'ffmpeg',
    ].map(key => [key, { type: 'string' }]).concat([
      ['help', { type: 'boolean' }], ['recover', { type: 'boolean' }],
    ])),
  });
  if (positionals.length > 1) throw new Error('Unexpected positional arguments; use -- before browser commands.');
  return { command: positionals[0], options: values, args: separator < 0 ? [] : argv.slice(separator + 1) };
}

async function executable(candidate) {
  if (!candidate) return null;
  const names = path.isAbsolute(candidate) || candidate.includes(path.sep)
    ? [path.resolve(candidate)]
    : (process.env.PATH ?? '').split(path.delimiter).map(dir => path.join(dir, candidate));
  for (const name of names) {
    try {
      if ((await fs.stat(name)).isFile()) return await fs.realpath(name);
    } catch (error) {
      if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error;
    }
  }
  return null;
}

async function cliPath(options, project) {
  const explicit = options.cli ?? process.env.UI_DEMO_VIDEO_CLI;
  if (explicit) {
    const resolved = await executable(explicit);
    if (!resolved) throw new Error(`Playwright CLI not found: ${explicit}`);
    return resolved;
  }
  try {
    return createRequire(path.join(project, 'package.json')).resolve('@playwright/cli/playwright-cli.js');
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
  }
  const resolved = await executable('playwright-cli');
  if (resolved) return resolved;
  throw new Error('Playwright CLI is missing. Reuse an installed @playwright/cli, or follow the skill\'s one-time isolated setup. No app dependency changes are needed.');
}

async function execute(file, args, cwd, timeout = 90_000) {
  const js = /\.[cm]?js$/i.test(file);
  return exec(js ? process.execPath : file, js ? [file, ...args] : args, {
    cwd, timeout, maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
  });
}

async function native(cli, args, cwd) {
  let output;
  try {
    output = await execute(cli, ['--json', ...args], cwd);
  } catch (error) {
    let response;
    try { response = JSON.parse(error.stdout); } catch {}
    throw new Error(response?.error || error.stderr?.trim() || error.message);
  }
  let response;
  try { response = JSON.parse(output.stdout); }
  catch { throw new Error('Playwright CLI did not return JSON; use a compatible CLI release.'); }
  if (response.isError || response.result?.isError) {
    throw new Error(response.error ?? response.result.error ?? 'Playwright CLI reported an error.');
  }
  return response;
}

async function tooling(options, project) {
  const cli = await cliPath(options, project);
  const { version } = await native(cli, ['--version'], project);
  const { help: videoHelp } = await native(cli, ['--help', 'video-start'], project);
  if (!videoHelp?.includes('video-start') || !videoHelp.includes('--size') || !videoHelp.includes('--cursor')) {
    throw new Error(`Playwright CLI ${version ?? 'unknown'} lacks the required native video commands.`);
  }
  for (const command of ['video-chapter', 'video-show-actions']) {
    const { help: commandHelp } = await native(cli, ['--help', command], project);
    if (!commandHelp?.includes(command)) throw new Error(`Playwright CLI ${version ?? 'unknown'} lacks ${command}.`);
  }
  return { cli, version };
}

function appUrl(input) {
  const url = new URL(input);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Use an HTTP(S) app URL without embedded credentials.');
  }
  return url.href;
}

async function doctor(options) {
  const project = path.resolve(options.project ?? '.');
  const tools = await tooling(options, project);
  const report = { ready: true, project, ...tools, browserLaunch: 'checked by start',
    ffmpeg: await executable(options.ffmpeg ?? 'ffmpeg'), warnings: [] };
  if (options.url) {
    const url = appUrl(options.url);
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    await response.body?.cancel();
    report.app = { url, status: response.status };
    if (!response.ok) throw new Error(`App readiness check returned HTTP ${response.status}.`);
  }
  return report;
}

async function save(manifest) {
  const temporary = path.join(manifest.runDir, `manifest-${process.pid}.tmp`);
  await fs.writeFile(temporary, JSON.stringify(manifest, null, 2) + '\n');
  await fs.rename(temporary, path.join(manifest.runDir, 'manifest.json'));
}

async function load(run) {
  if (!run) throw new Error('--run must name the directory returned by start.');
  const runDir = await fs.realpath(path.resolve(run));
  const manifest = JSON.parse(await fs.readFile(path.join(runDir, 'manifest.json'), 'utf8'));
  if (manifest.owner !== OWNER || manifest.runDir !== runDir || !/^ui-demo-[a-f0-9]{12}$/.test(manifest.session)) {
    throw new Error('This directory is not an owned UI demo run.');
  }
  return manifest;
}

async function withRun(options, fn) {
  const identity = await load(options.run);
  const filename = path.join(identity.runDir, '.capture.lock');
  let lock;
  let recovered;
  try {
    lock = await fs.open(filename, 'wx');
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    let holder;
    try { holder = JSON.parse(await fs.readFile(filename, 'utf8')); } catch {}
    let abandoned = false;
    if (holder?.owner === OWNER && Number.isInteger(holder.pid) && holder.pid > 0) {
      try { process.kill(holder.pid, 0); }
      catch (probe) { abandoned = probe.code === 'ESRCH'; }
    }
    if (!options.recover || !abandoned) {
      throw new Error(abandoned
        ? 'A capture command was interrupted. After outstanding tool calls return, use finish --recover.'
        : 'A capture command is already running. Wait for its result and retry sequentially.');
    }
    recovered = `abandoned-lock-${randomUUID()}.json`;
    await fs.rename(filename, path.join(identity.runDir, recovered));
    lock = await fs.open(filename, 'wx');
  }
  try {
    await lock.writeFile(JSON.stringify({ owner: OWNER, pid: process.pid, startedAt: new Date().toISOString() }));
    const manifest = await load(identity.runDir);
    if (recovered) {
      recordError(manifest, 'recovery', new Error('A previous capture command was interrupted; inspect preserved evidence before starting a fresh run.'));
      manifest.files.interruptedCommand = recovered;
      manifest.captureStatus = 'failed';
      await save(manifest);
    }
    return await fn(manifest);
  } finally {
    await lock.close();
    await fs.unlink(filename);
  }
}

async function call(manifest, command, ...args) {
  const response = await native(manifest.cli, [`-s=${manifest.session}`, command, ...args], manifest.runDir);
  await fs.appendFile(path.join(manifest.runDir, 'activity.jsonl'),
    JSON.stringify({ at: new Date().toISOString(), command, response }) + '\n');
  return response;
}

function recordError(manifest, phase, error) {
  const item = { phase, message: error instanceof Error ? error.message : String(error) };
  manifest.errors.push(item);
  return item;
}

async function validFile(runDir, filename, signature, offset = 0) {
  const file = await fs.open(path.join(runDir, filename));
  try {
    const buffer = Buffer.alloc(signature.length);
    const { bytesRead } = await file.read(buffer, 0, signature.length, offset);
    if ((await file.stat()).size <= signature.length + offset || bytesRead !== signature.length || !buffer.equals(signature)) {
      throw new Error(`Capture did not produce a valid ${filename}.`);
    }
  } finally { await file.close(); }
}

async function failureFrame(manifest, item) {
  const filename = `failure-${String(manifest.errors.length).padStart(2, '0')}.png`;
  try {
    await call(manifest, 'screenshot', `--filename=${path.join(manifest.runDir, filename)}`);
    await validFile(manifest.runDir, filename, Buffer.from('89504e470d0a1a0a', 'hex'));
    item.frame = filename;
    manifest.files.failureFrame = filename;
  } catch (error) {
    item.frameError = error.message;
  }
}

async function close(manifest) {
  try {
    const result = await call(manifest, 'close');
    manifest.cleanupStatus = result.status;
  } catch (error) {
    manifest.cleanupStatus = 'failed';
    recordError(manifest, 'close', error);
  }
}

async function start(options) {
  if (!options.url) throw new Error('start requires --url.');
  const url = appUrl(options.url);
  const name = options.name ?? 'ui-demo';
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(name)) throw new Error('--name uses 1–64 lowercase letters, numbers, or hyphens.');
  const browser = options.browser ?? 'chrome';
  if (!['chrome', 'chromium', 'msedge', 'firefox', 'webkit'].includes(browser)) throw new Error('Unsupported --browser.');
  const dimensions = /^(\d+)x(\d+)$/.exec(options.viewport ?? '1280x720');
  if (!dimensions || dimensions.slice(1).some(n => +n < 100 || +n > 4096)) throw new Error('--viewport must be WIDTHxHEIGHT, from 100 to 4096 pixels.');
  const project = await fs.realpath(path.resolve(options.project ?? '.'));
  const tools = await tooling(options, project);
  const output = path.resolve(project, options.out ?? 'tmp/ui-demo-video');
  await fs.mkdir(output, { recursive: true });
  const runDir = await fs.realpath(await fs.mkdtemp(path.join(output, `${name}-`)));
  const manifest = { owner: OWNER, schemaVersion: 1, name, runDir, project, ...tools, url,
    session: `ui-demo-${randomUUID().replaceAll('-', '').slice(0, 12)}`,
    startedAt: new Date().toISOString(), captureStatus: 'recording', visualReview: 'pending',
    scenes: [], files: {}, errors: [], warnings: [], cleanupStatus: 'open' };
  try {
    await exec('git', ['check-ignore', '--quiet', runDir], { cwd: project });
  } catch {
    manifest.warnings.push('Output is not known to be gitignored; keep verification artifacts out of delivery.');
  }
  await fs.mkdir(path.join(runDir, '.playwright'));
  const config = { browser: {
    browserName: ['firefox', 'webkit'].includes(browser) ? browser : 'chromium',
    isolated: true,
    launchOptions: { headless: true, ...(['firefox', 'webkit'].includes(browser) ? {} : { channel: browser }) },
    contextOptions: { viewport: { width: +dimensions[1], height: +dimensions[2] },
      ...(options['storage-state'] ? { storageState: path.resolve(project, options['storage-state']) } : {}) },
  }, outputDir: runDir, timeouts: { action: 10_000, navigation: 60_000 } };
  await fs.writeFile(path.join(runDir, 'browser-config.json'), JSON.stringify(config, null, 2));
  await save(manifest);
  return withRun({ run: runDir }, async manifest => {
    try {
      await call(manifest, 'open', `--config=${path.join(runDir, 'browser-config.json')}`);
      await call(manifest, 'run-code', installEvidence.toString());
      await call(manifest, 'video-start', path.join(runDir, `${name}.webm`), `--size=${dimensions[0]}`, '--cursor');
      manifest.recordingStartedAt = new Date().toISOString();
      await save(manifest);
      await call(manifest, 'video-show-actions');
      const state = await call(manifest, 'goto', url);
      return { runDir, session: manifest.session, state, visualReview: 'pending' };
    } catch (error) {
      const item = recordError(manifest, 'start', error);
      await failureFrame(manifest, item);
      await finalize(manifest, { mp4: 'off' });
      error.runDir = runDir;
      throw error;
    }
  });
}

async function act(manifest, args) {
  if (args[0] === 'tab-close') {
    const index = args.length === 1 ? null : Number(args[1]);
    if (args.length > 2 || (index !== null && (!Number.isInteger(index) || index < 0))) throw new Error('tab-close accepts one nonnegative tab index.');
    await call(manifest, 'run-code', `async page => (${stopTabVideo.toString()})(page, ${JSON.stringify(index)})`);
  }
  const response = await call(manifest, ...args);
  const filename = response.snapshot?.file;
  if (filename) {
    const resolved = path.resolve(manifest.runDir, filename);
    if (resolved.startsWith(manifest.runDir + path.sep)) response.snapshotText = await fs.readFile(resolved, 'utf8');
  }
  return { runDir: manifest.runDir, ...response };
}

async function frame(manifest, options) {
  if (!options.name) throw new Error('frame requires a descriptive --name.');
  for (const [key, state] of [['wait-for', 'visible'], ['wait-hidden', 'hidden']]) {
    if (options[key]) {
      await call(manifest, 'run-code', `async page => { await page.locator(${JSON.stringify(options[key])}).waitFor({ state: ${JSON.stringify(state)}, timeout: 15000 }); }`);
    }
  }
  const index = manifest.scenes.length + 1;
  const current = JSON.parse((await call(manifest, 'run-code', currentPage.toString())).result);
  const slug = options.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'scene';
  const filename = `scene-${String(index).padStart(2, '0')}-${slug}.png`;
  const snapshot = await call(manifest, 'snapshot');
  const snapshotFile = `scene-${index}.json`;
  await fs.writeFile(path.join(manifest.runDir, snapshotFile), JSON.stringify(snapshot, null, 2));
  await call(manifest, 'screenshot', `--filename=${path.join(manifest.runDir, filename)}`);
  await validFile(manifest.runDir, filename, Buffer.from('89504e470d0a1a0a', 'hex'));
  manifest.scenes.push({ index, name: options.name, frame: filename, snapshot: snapshotFile,
    page: current.page, video: `${manifest.name}${current.page ? `-${current.page}` : ''}.webm`,
    elapsedMs: Date.now() - Date.parse(manifest.recordingStartedAt) });
  await save(manifest);
  await call(manifest, 'video-chapter', options.name, '--duration=1200');
  return { runDir: manifest.runDir, scene: manifest.scenes.at(-1), snapshot, visualReview: 'pending' };
}

async function convert(manifest, options) {
  const mode = options.mp4 ?? 'auto';
  if (mode === 'off') { manifest.conversion = { status: 'skipped' }; return; }
  const ffmpeg = await executable(options.ffmpeg ?? 'ffmpeg');
  if (!ffmpeg) {
    manifest.conversion = { status: 'unavailable' };
    if (mode === 'required') recordError(manifest, 'conversion', new Error('MP4 is required, but ffmpeg is unavailable.'));
    return;
  }
  const parts = [];
  manifest.files.mp4s = [];
  for (const webm of manifest.files.videos) {
    const basename = path.basename(webm, '.webm');
    const partial = `${basename}.partial.mp4`;
    try {
      await execute(ffmpeg, ['-n', '-i', webm, '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', partial], manifest.runDir, 60_000);
      await validFile(manifest.runDir, partial, Buffer.from('ftyp'), 4);
      const mp4 = `${basename}.mp4`;
      await fs.rename(path.join(manifest.runDir, partial), path.join(manifest.runDir, mp4));
      manifest.files.mp4s.push(mp4);
      if (webm === manifest.files.webm) manifest.files.mp4 = mp4;
      parts.push({ webm, mp4, status: 'converted' });
    } catch (error) {
      const message = (error.stderr || error.message).slice(-2000);
      parts.push({ webm, status: 'failed', error: message });
      if (mode === 'required') recordError(manifest, 'conversion', new Error(message));
      else manifest.warnings.push(`MP4 conversion failed for ${webm}; WebM is preserved.`);
    }
  }
  manifest.conversion = { status: parts.every(part => part.status === 'converted') ? 'converted' : 'failed', parts };
  const errors = parts.filter(part => part.error).map(part => part.error);
  if (errors.length) manifest.conversion.error = errors.join('\n');
}

async function finalize(manifest, options) {
  if (manifest.finishedAt) {
    if (manifest.cleanupStatus === 'failed') {
      await close(manifest);
      await save(manifest);
    }
    return manifest;
  }
  if (!['auto', 'off', 'required'].includes(options.mp4 ?? 'auto')) throw new Error('--mp4 must be auto, off, or required.');
  for (const [command, args] of [['console', ['error']], ['requests', ['--static']]]) {
    try {
      const evidence = await call(manifest, command, ...args);
      await fs.writeFile(path.join(manifest.runDir, `${command}.json`), JSON.stringify(evidence, null, 2));
      manifest.files[command] = `${command}.json`;
    } catch (error) { recordError(manifest, command, error); }
  }
  try {
    const response = await call(manifest, 'run-code', readEvidence.toString());
    const evidence = JSON.parse(response.result);
    if (!Array.isArray(evidence.console) || !Array.isArray(evidence.requests)) throw new Error('Browser evidence is incomplete.');
    await fs.writeFile(path.join(manifest.runDir, 'browser-evidence.json'), JSON.stringify(evidence, null, 2));
    manifest.files.browserEvidence = 'browser-evidence.json';
    manifest.consoleErrors = evidence.console.filter(entry => ['error', 'pageerror'].includes(entry.type)).length;
    manifest.failedRequests = evidence.requests.some(entry => entry.failure || entry.status >= 400);
  } catch (error) { recordError(manifest, 'browser-evidence', error); }
  try {
    const response = await call(manifest, 'video-stop');
    const filenames = [...(response.result ?? '').matchAll(/\[Video\]\(([^)]+)\)/g)].map(match => {
      const resolved = path.resolve(manifest.runDir, decodeURIComponent(match[1]));
      const filename = path.basename(resolved);
      if (path.dirname(resolved) !== manifest.runDir || !new RegExp(`^${manifest.name}(?:-[1-9]\\d*)?\\.webm$`).test(filename)) {
        throw new Error('Recorder returned a file outside its owned video names.');
      }
      return filename;
    });
    if (!filenames.length) throw new Error('Recorder returned no video artifacts.');
    manifest.files.videos = [];
    for (const filename of filenames) {
      await validFile(manifest.runDir, filename, Buffer.from('1a45dfa3', 'hex'));
      manifest.files.videos.push(filename);
    }
    if (!filenames.includes(`${manifest.name}.webm`)) throw new Error('Primary recording is missing.');
    manifest.files.webm = `${manifest.name}.webm`;
    for (const scene of manifest.scenes) {
      if (!filenames.includes(scene.video)) throw new Error(`Recording for scene ${scene.index} is missing.`);
    }
  } catch (error) { recordError(manifest, 'video-stop', error); }
  await close(manifest);
  if (manifest.files.webm) await convert(manifest, options);
  if (!manifest.scenes.length) recordError(manifest, 'frames', new Error('No scene frames were captured.'));
  manifest.captureStatus = manifest.errors.length ? 'failed'
    : manifest.consoleErrors || manifest.failedRequests ? 'needs-review' : 'captured';
  manifest.finishedAt = new Date().toISOString();
  await save(manifest);
  return manifest;
}

async function main() {
  const { command, options, args } = parse(process.argv.slice(2));
  if (options.help || !command) { console.log(help); return; }
  if (command === 'doctor') {
    try { console.log(JSON.stringify(await doctor(options), null, 2)); }
    catch (error) { console.log(JSON.stringify({ ready: false, error: error.message }, null, 2)); process.exitCode = 2; }
    return;
  }
  if (command === 'start') { console.log(JSON.stringify(await start(options), null, 2)); return; }
  if (!['act', 'frame', 'finish'].includes(command)) throw new Error(`Unknown command: ${command}`);
  await withRun({ ...options, recover: command === 'finish' && options.recover }, async manifest => {
    if (command === 'finish') {
      const result = await finalize(manifest, options);
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.captureStatus === 'captured' ? 0 : 1;
      return;
    }
    if (manifest.finishedAt) throw new Error('This capture is finished; start a fresh run.');
    if (command === 'act' && (!actions.has(args[0]) || args.some(arg => /^(-s(?:=|$)|--session(?:=|$)|--config(?:=|$)|--json(?:=|$)|--raw(?:=|$))/.test(arg)))) {
      throw new Error('Use a supported UI action without session/config/output overrides; capture owns the browser lifecycle.');
    }
    try {
      const result = command === 'act' ? await act(manifest, args) : await frame(manifest, options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      const item = recordError(manifest, command, error);
      await failureFrame(manifest, item);
      await save(manifest);
      console.log(JSON.stringify({ runDir: manifest.runDir, error: item }, null, 2));
      process.exitCode = 1;
    }
  });
}

main().catch(error => {
  console.log(JSON.stringify({ error: error.message, ...(error.runDir ? { runDir: error.runDir } : {}) }, null, 2));
  process.exitCode = 2;
});
