import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { EventEmitter } from 'node:events';
import { installEvidence, readEvidence, currentPage, stopTabVideo } from '../plugins/toolkit/skills/web-demo-video/scripts/browser-evidence.mjs';

const exec = promisify(execFile);
const script = path.resolve(process.env.UI_DEMO_CAPTURE_SCRIPT ?? fileURLToPath(
  new URL('../plugins/toolkit/skills/web-demo-video/scripts/capture.mjs', import.meta.url),
));

async function invoke(args, options = {}) {
  try {
    const result = await exec(process.execPath, [script, ...args], { timeout: 15_000, ...options });
    return { code: 0, ...result, data: result.stdout.trim() ? JSON.parse(result.stdout) : null };
  } catch (error) {
    if (error instanceof SyntaxError) throw error;
    return { code: error.code, stdout: error.stdout, stderr: error.stderr,
      data: error.stdout?.trim() ? JSON.parse(error.stdout) : null };
  }
}

async function fixture(t, overrides = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-demo-video-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const cli = path.join(root, 'browser-cli.mjs');
  await fs.writeFile(path.join(root, 'config.json'), JSON.stringify(overrides));
  await fs.writeFile(cli, `
    import fs from 'node:fs';
    import path from 'node:path';
    import {fileURLToPath} from 'node:url';
    const root=path.dirname(fileURLToPath(import.meta.url));
    const args=process.argv.slice(2);
    const config=JSON.parse(fs.readFileSync(path.join(root,'config.json')));
    fs.appendFileSync(path.join(root,'calls.jsonl'),JSON.stringify({cwd:process.cwd(),args})+'\\n');
    const command=args.find(a=>!a.startsWith('-'));
    const reply=value=>console.log(JSON.stringify(value));
    if(args.includes('--version')){reply({version:'0.1.22'});process.exit(0);}
    if(args.includes('--help')){reply({help:config.noVideo?'unknown command':command+' [filename] --size --cursor'});process.exit(0);}
    if(command===config.slow){fs.writeFileSync(path.join(root,'busy'),'started');await new Promise(r=>setTimeout(r,800));}
    if(command===config.fail){reply({isError:true,error:'Mock browser rejected the action'});process.exit(0);}
    if(command==='open')reply({session:'owned',pid:1234,result:{}});
    else if(command==='close')reply({status:'closed'});
    else if(command==='video-start'){
      const index=args.indexOf(command);
      fs.writeFileSync(path.join(root,'video-path'),args[index+1]);reply({result:'Recording started'});
    } else if(command==='video-stop'){
      const dest=fs.readFileSync(path.join(root,'video-path'),'utf8');
      if(!config.skipWebm)fs.writeFileSync(dest,Buffer.from(config.webmBytes??'1a45dfa3000000000000000000000000','hex'));
      if(config.multiVideo)fs.writeFileSync(dest.replace(/\\.webm$/, '-1.webm'),Buffer.from('1a45dfa3000000000000000000000000','hex'));
      reply({result:'- [Video](./'+path.basename(dest)+')'+(config.multiVideo?'\\n- [Video](./'+path.basename(dest).replace(/\\.webm$/, '-1.webm')+')':'')});
    } else if(command==='screenshot'){
      const dest=args.find(a=>a.startsWith('--filename=')).slice('--filename='.length);
      if(!config.skipPng)fs.writeFileSync(dest,config.pngBytes?Buffer.from(config.pngBytes,'hex'):Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV2kAAAAASUVORK5CYII=','base64'));
      reply({result:'Screenshot saved'});
    } else if(command==='console')reply({result:config.console??'Total messages: 0 (Errors: 0, Warnings: 0)\\n'});
    else if(command==='requests')reply({result:config.requests??'No requests'});
    else if(command==='snapshot')reply({snapshot:[{role:'heading',name:'Acme Webapp'}]});
    else if(command==='run-code'){
      const code=args[args.indexOf(command)+1];
      if(config.failWait&&code.includes('.waitFor('))reply({isError:true,error:'Control never became ready'});
      else if(code.startsWith('function currentPage'))reply({result:JSON.stringify({page:config.page??0})});
      else if(code.startsWith('function readEvidence'))reply({result:config.badEvidence?'unknown':JSON.stringify(config.evidence??{console:[],requests:[],pages:[{id:0,url:'http://localhost:3000'}]})});
      else reply({result:JSON.stringify({installed:true})});
    }
    else if(['video-show-actions','video-chapter','fill','click','goto','tab-close'].includes(command))reply({});
    else reply({isError:true,error:'Unsupported fixture command: '+command});
  `);
  const calls = async () => (await fs.readFile(path.join(root, 'calls.jsonl'), 'utf8'))
    .trim().split('\n').map(line => JSON.parse(line));
  const start = async () => {
    const result = await invoke(['start', '--project', root, '--out', 'evidence with spaces', '--cli', cli,
      '--url', 'http://localhost:3000', '--name', 'acme-demo']);
    assert.equal(result.code, 0, result.stdout || result.stderr);
    assert.ok(result.data.runDir);
    return result.data.runDir;
  };
  return { root, cli, calls, start };
}

test('doctor diagnoses unsupported video commands without installing or starting a browser', async t => {
  const f = await fixture(t, { noVideo: true });
  const result = await invoke(['doctor', '--project', f.root, '--cli', f.cli]);
  assert.equal(result.code, 2);
  assert.equal(result.data.ready, false);
  assert.match(result.data.error, /video/i);
  assert.deepEqual((await f.calls()).map(c => c.args.find(a => !a.startsWith('-'))), [undefined, 'video-start']);
  assert.deepEqual((await fs.readdir(f.root)).sort(), ['browser-cli.mjs', 'calls.jsonl', 'config.json']);
});

test('each start owns a fresh session and directory without overwriting old evidence', async t => {
  const f = await fixture(t);
  const first = await f.start();
  await fs.writeFile(path.join(first, 'keep.txt'), 'earlier evidence');
  const second = await f.start();
  assert.notEqual(first, second);
  assert.equal(await fs.readFile(path.join(first, 'keep.txt'), 'utf8'), 'earlier evidence');
  const manifests = await Promise.all([first, second].map(async run =>
    JSON.parse(await fs.readFile(path.join(run, 'manifest.json'), 'utf8'))));
  assert.notEqual(manifests[0].session, manifests[1].session);
  assert.equal(manifests[0].visualReview, 'pending');
  assert.equal(manifests[1].visualReview, 'pending');
  const browser = JSON.parse(await fs.readFile(path.join(first, 'browser-config.json'), 'utf8')).browser;
  assert.equal(browser.isolated, true);
  assert.equal(browser.launchOptions.headless, true);
  assert.deepEqual(browser.contextOptions.viewport, {width:1280,height:720});
  const calls = await f.calls();
  const collectorIndex = calls.findIndex(call => call.cwd === first && call.args.includes('run-code') &&
    call.args.some(arg => arg.startsWith('function installEvidence')));
  const navigationIndex = calls.findIndex(call => call.cwd === first && call.args.includes('goto'));
  assert.ok(collectorIndex >= 0 && collectorIndex < navigationIndex);
  for (const call of calls) {
    const manifest = manifests.find(item => item.runDir === call.cwd);
    if (!manifest) continue;
    assert.ok(call.args.includes(`-s=${manifest.session}`));
  }
});

test('a failed action retains a failure frame and still finalizes video and the owned session', async t => {
  const f = await fixture(t, { fail: 'click' });
  const run = await f.start();
  const result = await invoke(['act', '--run', run, '--', 'click', 'e9']);
  assert.equal(result.code, 1);
  const ended = await invoke(['finish', '--run', run, '--mp4', 'off']);
  assert.equal(ended.code, 1);
  assert.equal(ended.data.captureStatus, 'failed');
  assert.ok(ended.data.files.failureFrame);
  assert.ok(ended.data.files.webm);
  await fs.access(path.join(run, ended.data.files.failureFrame));
  await fs.access(path.join(run, ended.data.files.webm));
  assert.equal(ended.data.cleanupStatus, 'closed');
  assert.match(ended.data.errors[0].message, /Mock browser/);
});

test('finish checks media existence and preserves diagnostics when recorder finalization fails', async t => {
  const f = await fixture(t, { fail: 'video-stop' });
  const run = await f.start();
  assert.equal((await invoke(['frame', '--run', run, '--name', 'Home is visible'])).code, 0);
  const ended = await invoke(['finish', '--run', run, '--mp4', 'off']);
  assert.equal(ended.code, 1);
  assert.equal(ended.data.captureStatus, 'failed');
  assert.equal(ended.data.files.webm, undefined);
  assert.equal(ended.data.cleanupStatus, 'closed');
  assert.ok(ended.data.errors.some(e => e.phase === 'video-stop'));
  await fs.access(path.join(run, 'console.json'));
  await fs.access(path.join(run, 'requests.json'));
});

test('frame and finish produce checked artifacts and repeat finish without reopening or reclosing', async t => {
  const f = await fixture(t);
  const run = await f.start();
  const frame = await invoke(['frame', '--run', run, '--name', 'Share dialog is visible']);
  assert.equal(frame.code, 0);
  const ended = await invoke(['finish', '--run', run, '--mp4', 'off']);
  assert.equal(ended.code, 0);
  assert.equal(ended.data.captureStatus, 'captured');
  assert.equal(ended.data.visualReview, 'pending');
  assert.equal(ended.data.scenes.length, 1);
  assert.equal(ended.data.scenes[0].name, 'Share dialog is visible');
  await fs.access(path.join(run, ended.data.scenes[0].snapshot));
  const before = await f.calls();
  const repeated = await invoke(['finish', '--run', run]);
  assert.equal(repeated.code, 0);
  assert.deepEqual(repeated.data, ended.data);
  assert.deepEqual(await f.calls(), before);
  for (const args of [['act', '--run', run, '--', 'click', 'e5'], ['frame', '--run', run, '--name', 'Late frame']]) {
    assert.equal((await invoke(args)).code, 2);
  }
  assert.deepEqual(await f.calls(), before);
  const recording = before.find(call => call.cwd === run && call.args.includes('video-start'));
  assert.ok(recording.args.includes('--size=1280x720'));
  assert.ok(recording.args.includes('--cursor'));
  const chapter = before.find(call => call.cwd === run && call.args.includes('video-chapter'));
  assert.ok(chapter.args.includes('Share dialog is visible'));
  assert.ok(chapter.args.includes('--duration=1200'));
  assert.ok(Number.isFinite(ended.data.scenes[0].elapsedMs));
  assert.ok(ended.data.scenes[0].elapsedMs >= 0);
  assert.ok(ended.data.scenes[0].elapsedMs <= Date.parse(ended.data.finishedAt) - Date.parse(ended.data.recordingStartedAt));
});

test('browser diagnostics require review and preserve the original tool evidence', async t => {
  const evidence = { console: 'Total messages: 2 (Errors: 2, Warnings: 0)', requests: 'GET http://localhost:3000/broken => [503] Unavailable',
    evidence: { console: [{type:'error',text:'Acme failure'},{type:'pageerror',text:'Acme exception'}], requests: [{url:'http://localhost:3000/broken',status:503}] } };
  const f = await fixture(t, evidence);
  const run = await f.start();
  await invoke(['frame', '--run', run, '--name', 'Home']);
  const ended = await invoke(['finish', '--run', run, '--mp4', 'off']);
  assert.equal(ended.code, 1);
  assert.equal(ended.data.captureStatus, 'needs-review');
  assert.equal(ended.data.consoleErrors, 2);
  assert.equal(ended.data.failedRequests, true);
  assert.equal(ended.data.cleanupStatus, 'closed');
  for (const command of ['console', 'requests']) {
    assert.equal(JSON.parse(await fs.readFile(path.join(run, ended.data.files[command]), 'utf8')).result, evidence[command]);
  }
});

test('an unavailable run-wide collector cannot be reported as a clean capture', async t => {
  const f = await fixture(t, { badEvidence: true });
  const run = await f.start();
  await invoke(['frame', '--run', run, '--name', 'Home']);
  const ended = await invoke(['finish', '--run', run, '--mp4', 'off']);
  assert.equal(ended.code, 1);
  assert.equal(ended.data.captureStatus, 'failed');
  assert.ok(ended.data.files.webm);
  assert.ok(ended.data.errors.some(error => error.phase === 'browser-evidence'));
});

test('actions keep literal arguments and cannot override session ownership', async t => {
  const f = await fixture(t);
  const run = await f.start();
  const injectedPath = path.join(f.root, 'unexpected');
  const literal = `$(touch ${injectedPath}); \`touch ${injectedPath}\``;
  assert.equal((await invoke(['act', '--run', run, '--', 'fill', 'e5', literal])).code, 0);
  const call = (await f.calls()).find(c => c.args.includes('fill'));
  assert.ok(call.args.includes(literal));
  await assert.rejects(fs.access(injectedPath));
  for (const args of [['close-all'], ['kill-all'], ['attach'], ['click', 'e5', '-s=someone-else'], ['click', 'e5', '-s', 'someone-else'], ['click','e5','--session=someone-else'], ['click','e5','--session','someone-else'], ['click','e5','--config=other.json'], ['click','e5','--config','other.json'], ['click','e5','--json'], ['click','e5','--json=true'], ['click','e5','--raw']]) {
    assert.equal((await invoke(['act', '--run', run, '--', ...args])).code, 2);
  }
  for (const literal of ['caption --session', '--sessions', '--configurable', '--raw-data', '--jsonish']) {
    assert.equal((await invoke(['act', '--run', run, '--', 'fill', 'e5', literal])).code, 0);
  }
  assert.ok(!(await f.calls()).some(c => c.args.includes('close-all') || c.args.includes('kill-all') || c.args.includes('-s=someone-else')));
});

test('scene readiness executes visible and hidden waits before capture and retains wait failures', async t => {
  const f = await fixture(t);
  const run = await f.start();
  const frame = await invoke(['frame', '--run', run, '--name', 'Ready', '--wait-for', '#ready', '--wait-hidden', '.loading']);
  assert.equal(frame.code, 0);
  const calls = await f.calls();
  const waits = calls.filter(call => call.args.includes('run-code') && call.args.some(arg => arg.includes('.waitFor(')));
  assert.equal(waits.length, 2);
  assert.ok(waits[0].args.some(arg => arg.includes('"#ready"') && arg.includes('"visible"')));
  assert.ok(waits[1].args.some(arg => arg.includes('".loading"') && arg.includes('"hidden"')));
  assert.ok(calls.indexOf(waits[1]) < calls.findIndex(call => call.args.includes('snapshot')));
  await fs.writeFile(path.join(f.root, 'config.json'), JSON.stringify({ failWait: true }));
  const failed = await invoke(['frame', '--run', run, '--name', 'Never ready', '--wait-for', '#absent']);
  assert.equal(failed.code, 1);
  const manifest = JSON.parse(await fs.readFile(path.join(run, 'manifest.json'), 'utf8'));
  assert.equal(manifest.scenes.length, 1);
  assert.match(manifest.errors[0].message, /never became ready/);
  await fs.access(path.join(run, manifest.errors[0].frame));
});

test('foreign owner, directory and session manifests cannot drive or close a browser', async t => {
  const f = await fixture(t);
  const run = await f.start();
  const filename = path.join(run, 'manifest.json');
  const original = JSON.parse(await fs.readFile(filename, 'utf8'));
  const before = await f.calls();
  for (const change of [{ owner: 'another-tool' }, { runDir: f.root }, { session: 'personal-session' },
    { session: `prefix-${original.session}` }, { session: `${original.session}-suffix` }]) {
    await fs.writeFile(filename, JSON.stringify({ ...original, ...change }));
    for (const args of [['act', '--run', run, '--', 'click', 'e5'], ['finish', '--run', run]]) {
      assert.equal((await invoke(args)).code, 2);
    }
  }
  assert.deepEqual(await f.calls(), before);
});

test('finish retries failed owned cleanup without replaying recording or actions', async t => {
  const f = await fixture(t, { fail: 'close' });
  const run = await f.start();
  await invoke(['frame', '--run', run, '--name', 'Home']);
  const failed = await invoke(['finish', '--run', run, '--mp4', 'off']);
  assert.equal(failed.code, 1);
  assert.equal(failed.data.cleanupStatus, 'failed');
  await fs.writeFile(path.join(f.root, 'config.json'), '{}');
  const before = await f.calls();
  const retry = await invoke(['finish', '--run', run]);
  assert.equal(retry.code, 1);
  assert.equal(retry.data.cleanupStatus, 'closed');
  assert.deepEqual(retry.data.errors, failed.data.errors);
  assert.deepEqual((await f.calls()).slice(before.length).map(call => call.args.find(arg => !arg.startsWith('-'))), ['close']);
  assert.ok(retry.data.files.webm);
});

test('all tab recordings are delivered, associated with scenes and converted when requested', async t => {
  const f = await fixture(t, { multiVideo: true, page: 1 });
  const run = await f.start();
  await invoke(['frame', '--run', run, '--name', 'Second tab']);
  assert.equal((await invoke(['act', '--run', run, '--', 'tab-close'])).code, 0);
  const browserCalls = await f.calls();
  const closeIndex = browserCalls.findIndex(call => call.args.includes('tab-close'));
  assert.ok(browserCalls[closeIndex-1].args.includes('run-code'));
  assert.ok(browserCalls[closeIndex-1].args.some(arg => arg.includes('stopTabVideo')));
  const ffmpeg = path.join(f.root, 'converter.mjs');
  await fs.writeFile(ffmpeg, String.raw`import fs from 'node:fs';fs.appendFileSync(new URL('converter-args.jsonl',import.meta.url),JSON.stringify(process.argv.slice(2))+'\n');fs.writeFileSync(process.argv.at(-1),Buffer.from('000000186674797069736f6d0000000069736f6d','hex'));`);
  const ended = await invoke(['finish', '--run', run, '--mp4', 'required', '--ffmpeg', ffmpeg]);
  assert.equal(ended.code, 0);
  assert.deepEqual(ended.data.files.videos, ['acme-demo.webm', 'acme-demo-1.webm']);
  assert.deepEqual(ended.data.files.mp4s, ['acme-demo.mp4', 'acme-demo-1.mp4']);
  assert.equal(ended.data.scenes[0].video, 'acme-demo-1.webm');
  assert.equal(ended.data.conversion.status, 'converted');
  assert.equal(ended.data.files.mp4, 'acme-demo.mp4');
  for (const name of [...ended.data.files.videos, ...ended.data.files.mp4s]) await fs.access(path.join(run, name));
  const calls = (await fs.readFile(path.join(f.root, 'converter-args.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(calls.length, 2);
  for (const [index, args] of calls.entries()) {
    assert.ok(args.includes('-n'));
    assert.equal(args[args.indexOf('-i')+1], ended.data.files.videos[index]);
    assert.equal(args[args.indexOf('-vf')+1], 'pad=ceil(iw/2)*2:ceil(ih/2)*2');
    assert.equal(args[args.indexOf('-c:v')+1], 'libx264');
    assert.equal(args[args.indexOf('-pix_fmt')+1], 'yuv420p');
    assert.equal(args[args.indexOf('-movflags')+1], '+faststart');
    assert.equal(args.at(-1), ended.data.files.mp4s[index].replace(/\.mp4$/, '.partial.mp4'));
    await assert.rejects(fs.access(path.join(run, args.at(-1))));
  }
});

test('a scene on another tab fails when the recorder returns only the primary video', async t => {
  const f = await fixture(t, { page: 1 });
  const run = await f.start();
  assert.equal((await invoke(['frame', '--run', run, '--name', 'Second tab'])).code, 0);
  const ended = await invoke(['finish', '--run', run, '--mp4', 'off']);
  assert.equal(ended.code, 1);
  assert.equal(ended.data.captureStatus, 'failed');
  assert.equal(ended.data.scenes[0].video, 'acme-demo-1.webm');
  assert.deepEqual(ended.data.files.videos, ['acme-demo.webm']);
  assert.ok(ended.data.errors.some(error => error.phase === 'video-stop' && /Recording for scene 1 is missing/.test(error.message)));
  assert.equal(ended.data.cleanupStatus, 'closed');
});

test('a header-only PNG or WebM cannot be advertised as a completed artifact', async t => {
  const f = await fixture(t, { pngBytes: '89504e470d0a1a0a', webmBytes: '1a45dfa3' });
  const run = await f.start();
  assert.equal((await invoke(['frame', '--run', run, '--name', 'Home'])).code, 1);
  const ended = await invoke(['finish', '--run', run, '--mp4', 'off']);
  assert.equal(ended.code, 1);
  assert.equal(ended.data.captureStatus, 'failed');
  assert.deepEqual(ended.data.scenes, []);
  assert.equal(ended.data.files.failureFrame, undefined);
  assert.equal(ended.data.files.webm, undefined);
  assert.equal(ended.data.cleanupStatus, 'closed');
});

test('successful recorder replies with missing or wrong-signature files still fail', async t => {
  for (const overrides of [{ skipPng: true }, { pngBytes: '000000000000000000' }, { skipWebm: true }, { webmBytes: '000000000000000000' }]) {
    const f = await fixture(t, overrides);
    const run = await f.start();
    const frame = await invoke(['frame', '--run', run, '--name', 'Home']);
    const ended = await invoke(['finish', '--run', run, '--mp4', 'off']);
    assert.equal(ended.code, 1);
    assert.equal(ended.data.cleanupStatus, 'closed');
    if (overrides.skipPng || overrides.pngBytes) {
      assert.equal(frame.code, 1);
      assert.deepEqual(ended.data.scenes, []);
      assert.equal(ended.data.files.failureFrame, undefined);
    } else assert.equal(ended.data.files.webm, undefined);
  }
});

test('MP4 modes distinguish off, unavailable, required and optional conversion failures', async t => {
  for (const mode of ['off', 'auto', 'required', 'optional-failure']) {
    const f = await fixture(t);
    const run = await f.start();
    await invoke(['frame', '--run', run, '--name', 'Home']);
    const converter = path.join(f.root, 'converter.mjs');
    const invoked = path.join(f.root, 'converted');
    await fs.writeFile(converter, "import fs from 'node:fs';fs.writeFileSync(new URL('converted',import.meta.url),'called');process.exit(7);");
    const ffmpeg = ['auto', 'required'].includes(mode) ? path.join(f.root, 'missing') : converter;
    const ended = await invoke(['finish', '--run', run, '--mp4', mode === 'optional-failure' ? 'auto' : mode, '--ffmpeg', ffmpeg]);
    assert.equal(ended.code, mode === 'required' ? 1 : 0);
    assert.equal(ended.data.conversion.status, mode === 'off' ? 'skipped' : mode === 'optional-failure' ? 'failed' : 'unavailable');
    assert.ok(ended.data.files.webm);
    if (mode === 'required') {
      assert.equal(ended.data.captureStatus, 'failed');
      assert.ok(ended.data.errors.some(error => error.phase === 'conversion' && /ffmpeg is unavailable/.test(error.message)));
    } else assert.ok(!ended.data.errors.some(error => error.phase === 'conversion'));
    if (mode === 'optional-failure') {
      await fs.access(invoked);
      assert.ok(ended.data.warnings.some(w => w.includes('conversion failed')));
    } else await assert.rejects(fs.access(invoked));
  }
});

test('doctor and automatic MP4 conversion resolve ffmpeg from a controlled PATH', async t => {
  const f = await fixture(t);
  const run = await f.start();
  await invoke(['frame', '--run', run, '--name', 'Home']);
  const bin = path.join(f.root, 'bin');
  await fs.mkdir(bin);
  const env = { ...process.env, PATH: bin };
  const absent = await invoke(['doctor', '--project', f.root, '--cli', f.cli], { env });
  assert.equal(absent.code, 0);
  assert.equal(absent.data.ffmpeg, null);
  const converter = path.join(f.root, 'converter.mjs');
  await fs.writeFile(converter, String.raw`import fs from 'node:fs';fs.writeFileSync(new URL('converter-args.json',import.meta.url),JSON.stringify(process.argv.slice(2)));fs.writeFileSync(process.argv.at(-1),Buffer.from('000000186674797069736f6d0000000069736f6d','hex'));`);
  await fs.symlink(converter, path.join(bin, 'ffmpeg'));
  const available = await invoke(['doctor', '--project', f.root, '--cli', f.cli], { env });
  assert.equal(available.code, 0);
  assert.equal(available.data.ffmpeg, await fs.realpath(converter));
  const ended = await invoke(['finish', '--run', run], { env });
  assert.equal(ended.code, 0);
  assert.equal(ended.data.captureStatus, 'captured');
  assert.equal(ended.data.conversion.status, 'converted');
  assert.equal(ended.data.files.mp4, 'acme-demo.mp4');
  const args = JSON.parse(await fs.readFile(path.join(f.root, 'converter-args.json'), 'utf8'));
  assert.equal(args[args.indexOf('-i') + 1], 'acme-demo.webm');
  await fs.access(path.join(run, ended.data.files.mp4));
});

test('independent console, HTTP and transport errors determine run-wide review status', async t => {
  for (const evidence of [
    { console: Array.from({length:12}, () => ({type:'error',text:'Acme failure'})), requests: [] },
    { console: [], requests: [{status:400}] },
    { console: [], requests: [{status:404}] },
    { console: [], requests: [{status:503}] },
    { console: [], requests: [{failure:'Connection refused'}] },
  ]) {
    const f = await fixture(t, { evidence });
    const run = await f.start();
    await invoke(['frame', '--run', run, '--name', 'Home']);
    const ended = await invoke(['finish', '--run', run, '--mp4', 'off']);
    assert.equal(ended.code, 1);
    assert.equal(ended.data.captureStatus, 'needs-review');
    assert.equal(ended.data.consoleErrors, evidence.console.length);
    assert.equal(ended.data.failedRequests, evidence.requests.length > 0);
    assert.deepEqual(ended.data.warnings.filter(w => w.includes('Console')), []);
  }
});

test('healthy and pending requests with ordinary console messages remain a clean capture', async t => {
  const evidence = { console: [{type:'warning',text:'Acme warning'}, {type:'info',text:'Acme information'}],
    requests: [{status:200}, {status:399}, {status:null}] };
  const f = await fixture(t, { evidence });
  const run = await f.start();
  await invoke(['frame', '--run', run, '--name', 'Home']);
  const ended = await invoke(['finish', '--run', run, '--mp4', 'off']);
  assert.equal(ended.code, 0);
  assert.equal(ended.data.captureStatus, 'captured');
  assert.equal(ended.data.consoleErrors, 0);
  assert.equal(ended.data.failedRequests, false);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(run, ended.data.files.browserEvidence), 'utf8')), evidence);
});

test('native diagnostic acquisition failures keep video and close the owned session', async t => {
  for (const command of ['console', 'requests']) {
    const f = await fixture(t, { fail: command });
    const run = await f.start();
    await invoke(['frame', '--run', run, '--name', 'Home']);
    const ended = await invoke(['finish', '--run', run, '--mp4', 'off']);
    assert.equal(ended.code, 1);
    assert.equal(ended.data.captureStatus, 'failed');
    assert.ok(ended.data.errors.some(error => error.phase === command));
    assert.ok(ended.data.files.webm);
    assert.equal(ended.data.cleanupStatus, 'closed');
  }
});

test('the bundled collector retains errors and requests across navigation and closed tabs', () => {
  const context = new EventEmitter();
  let url = 'http://localhost:3000/broken';
  const first = { context: () => context, url: () => url };
  const second = { context: () => context, url: () => 'http://localhost:3000/other' };
  context.pages = () => [first];
  assert.throws(() => readEvidence(first), /unavailable/);
  installEvidence(first);
  assert.deepEqual(readEvidence(first).pages, [{id:0,url:'http://localhost:3000/broken'}]);
  assert.throws(() => installEvidence(first), /already/);
  context.emit('page', second);
  assert.deepEqual(readEvidence(first).pages, [{id:0,url:'http://localhost:3000/broken'}, {id:1,url:'http://localhost:3000/other'}]);
  context.emit('console', { page: () => first, type: () => 'error', text: () => 'Earlier error', location: () => ({ lineNumber: 1 }) });
  const request = { frame: () => ({ page: () => first }), url: () => 'http://localhost:3000/broken', method: () => 'GET', resourceType: () => 'fetch' };
  context.emit('request', request);
  assert.equal(readEvidence(first).requests.length, 1);
  assert.equal(readEvidence(first).requests[0].status, null);
  assert.equal(readEvidence(first).requests[0].url, 'http://localhost:3000/broken');
  assert.equal(readEvidence(first).requests[0].page, 0);
  context.emit('response', { request: () => request, status: () => 503, statusText: () => 'Unavailable' });
  url = 'http://localhost:3000/clean';
  context.emit('weberror', { page: () => second, error: () => new Error('Closed tab exception') });
  context.emit('requestfailed', { frame: () => { throw new Error('Worker request'); }, url: () => 'http://localhost:3000/offline', method: () => 'GET', resourceType: () => 'fetch', failure: () => ({ errorText: 'Connection refused' }) });
  context.emit('requestfailed', { ...request, url: () => 'http://localhost:3000/unknown-failure', failure: () => null });
  context.pages = () => [first];
  const evidence = JSON.parse(JSON.stringify(readEvidence(first)));
  assert.deepEqual(evidence.console.map(entry => [entry.page, entry.type, entry.text]), [[0, 'error', 'Earlier error'], [1, 'pageerror', 'Closed tab exception']]);
  assert.equal(evidence.requests.length, 3);
  assert.equal(evidence.requests[0].status, 503);
  assert.equal(evidence.requests[0].page, 0);
  assert.equal(evidence.requests[0].url, 'http://localhost:3000/broken');
  assert.equal(evidence.requests[0].method, 'GET');
  assert.equal(evidence.requests[0].resourceType, 'fetch');
  assert.equal(evidence.console[0].location.lineNumber, 1);
  assert.match(evidence.console[1].stack, /Closed tab exception/);
  assert.equal(evidence.requests[1].failure, 'Connection refused');
  assert.equal(evidence.requests[1].page, null);
  assert.equal(evidence.requests[2].failure, 'Request failed');
  assert.equal(currentPage(first).page, 0);
  assert.equal(currentPage(second).page, 1);
});

test('closing a tab flushes its selected recording and propagates recorder failure', async () => {
  const stopped = [];
  const context = { pages: () => [first, second] };
  const first = { context: () => context, screencast: { stop: async () => stopped.push(0) } };
  const second = { context: () => context, screencast: { stop: async () => stopped.push(1) } };
  await stopTabVideo(second, null);
  await stopTabVideo(second, 0);
  assert.deepEqual(stopped, [1, 0]);
  await assert.rejects(stopTabVideo(second, 2), /unavailable/);
  first.screencast.stop = async () => { throw new Error('Recorder failed'); };
  await assert.rejects(stopTabVideo(first, null), /Recorder failed/);
});

test('an MP4 conversion failure keeps WebM and records the real conversion error', async t => {
  const f = await fixture(t);
  const run = await f.start();
  assert.equal((await invoke(['frame', '--run', run, '--name', 'Home'])).code, 0);
  const ffmpeg = path.join(f.root, 'broken-ffmpeg.mjs');
  await fs.writeFile(ffmpeg, 'console.error("encoder is broken");process.exit(7);');
  const ended = await invoke(['finish', '--run', run, '--mp4', 'required', '--ffmpeg', ffmpeg]);
  assert.equal(ended.code, 1);
  assert.equal(ended.data.conversion.status, 'failed');
  assert.match(ended.data.conversion.error, /encoder is broken/);
  assert.ok(ended.data.errors.some(error => error.phase === 'conversion' && /encoder is broken/.test(error.message)));
  assert.ok(ended.data.files.webm);
  assert.equal(ended.data.files.mp4, undefined);
});

test('a converter cannot advertise a non-MP4 output merely by returning success', async t => {
  for (const [contents, encoding] of [['not a video', 'utf8'], ['0000001866747970', 'hex']]) {
    const f = await fixture(t);
    const run = await f.start();
    assert.equal((await invoke(['frame', '--run', run, '--name', 'Home'])).code, 0);
    const ffmpeg = path.join(f.root, 'invalid-ffmpeg.mjs');
    await fs.writeFile(ffmpeg, `import fs from 'node:fs';fs.writeFileSync(process.argv.at(-1),Buffer.from(${JSON.stringify(contents)},${JSON.stringify(encoding)}));`);
    const ended = await invoke(['finish', '--run', run, '--mp4', 'required', '--ffmpeg', ffmpeg]);
    assert.equal(ended.code, 1);
    assert.equal(ended.data.conversion.status, 'failed');
    assert.ok(ended.data.errors.some(error => error.phase === 'conversion'));
    assert.equal(ended.data.files.mp4, undefined);
    assert.ok(ended.data.files.webm);
  }
});

test('overlapping commands are rejected before they can drive or overwrite a scene', async t => {
  const f = await fixture(t, { slow: 'screenshot' });
  const run = await f.start();
  const pending = invoke(['frame', '--run', run, '--name', 'First scene']);
  for (let attempt = 0; attempt < 100; attempt++) {
    try { await fs.access(path.join(f.root, 'busy')); break; }
    catch { await new Promise(resolve => setTimeout(resolve, 10)); }
  }
  const overlap = await invoke(['act', '--run', run, '--', 'fill', 'e5', 'Second']);
  assert.equal((await pending).code, 0);
  assert.equal(overlap.code, 2);
  assert.match(overlap.data.error, /running|busy|sequential/i);
  assert.ok(!(await f.calls()).some(c => c.args.includes('fill')));
  assert.equal((await invoke(['frame', '--run', run, '--name', 'Second scene'])).code, 0);
  const manifest = JSON.parse(await fs.readFile(path.join(run, 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest.scenes.map(s => s.name), ['First scene', 'Second scene']);
  assert.notEqual(manifest.scenes[0].frame, manifest.scenes[1].frame);
});

test('recovery rejects a live command and finalizes an interrupted command without replaying it', async t => {
  const f = await fixture(t, { slow: 'screenshot' });
  const run = await f.start();
  const pending = exec(process.execPath, [script, 'frame', '--run', run, '--name', 'Interrupted'], { timeout: 15_000 });
  pending.catch(() => {});
  for (let attempt = 0; attempt < 100; attempt++) {
    try { await fs.access(path.join(f.root, 'busy')); break; }
    catch { await new Promise(resolve => setTimeout(resolve, 10)); }
  }
  await fs.access(path.join(f.root, 'busy'));
  const active = await invoke(['finish', '--run', run, '--recover', '--mp4', 'off']);
  pending.child.kill('SIGTERM');
  await assert.rejects(pending, error => error.signal === 'SIGTERM');
  for (let attempt = 0; attempt < 150; attempt++) {
    try { await fs.access(path.join(run, 'scene-01-interrupted.png')); break; }
    catch { await new Promise(resolve => setTimeout(resolve, 10)); }
  }
  await fs.access(path.join(run, 'scene-01-interrupted.png'));
  assert.equal(active.code, 2);
  assert.equal((await invoke(['finish', '--run', run, '--mp4', 'off'])).code, 2);
  const recovered = await invoke(['finish', '--run', run, '--recover', '--mp4', 'off']);
  assert.equal(recovered.code, 1);
  assert.equal(recovered.data.captureStatus, 'failed');
  assert.equal(recovered.data.cleanupStatus, 'closed');
  assert.ok(recovered.data.errors.some(e => e.phase === 'recovery'));
  assert.ok(recovered.data.files.webm);
  await fs.access(path.join(run, recovered.data.files.interruptedCommand));
  assert.equal((await f.calls()).filter(c => c.args.includes('screenshot')).length, 1);
});
