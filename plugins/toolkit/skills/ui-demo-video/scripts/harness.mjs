// Reusable UI demo-video harness: records a Playwright-driven walkthrough of the
// running app, emits per-scene PNG frames (the model-readable feedback loop) plus
// a webm/mp4 video (the human-shareable evidence).
//
// Ships with the ui-demo-video skill. Copy this file into the project (e.g. tmp/)
// next to your scenario file; it must resolve the project's own Playwright
// Install, then run:
//
//   import { recordUiDemo } from "./harness.mjs";
//
//   await recordUiDemo(
//     {
//       name: "my-demo",                          // output folder + file basename
//       baseUrl: "http://localhost:3000",
//       prewarm: ["/items"],                      // routes visited off-camera first
//     },
//     async ({ page, scene, highlight }) => {
//       await scene("list shows the item", async () => {
//         await page.goto("http://localhost:3000/items", { waitUntil: "networkidle" });
//         await highlight(page.getByText("Quarterly report"));
//       });
//     },
//   );
//
// Outputs under tmp/<name>/:
//   <name>.webm, <name>.mp4 (if ffmpeg), scene-NN-<slug>.png per scene,
//   scene-FAIL.png on error, manifest.json (scene list + timings + files).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

async function loadChromium() {
  for (const pkg of ["@playwright/test", "playwright"]) {
    try {
      return (await import(pkg)).chromium;
    } catch (err) {
      if (err.code !== "ERR_MODULE_NOT_FOUND") throw err;
    }
  }
  throw new Error(
    "ui-demo-video harness: neither @playwright/test nor playwright is installed in this project: run: npm i -D @playwright/test && npx playwright install chromium",
  );
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

export async function recordUiDemo(config, scenario) {
  const {
    name,
    baseUrl,
    outDir = "tmp",
    viewport = { width: 1280, height: 720 },
    prewarm = [],
    hideNextDevOverlay = true,
    hideSelectors = [],
    defaultTimeoutMs = 60_000,
    scenePauseMs = 1200,
  } = config;
  if (!name || !baseUrl) throw new Error("recordUiDemo: config.name and config.baseUrl are required");

  const demoDir = path.join(outDir, name);
  fs.mkdirSync(demoDir, { recursive: true });

  const chromium = await loadChromium();
  const browser = await chromium.launch();
  const manifest = { name, baseUrl, startedAt: new Date().toISOString(), scenes: [], files: {} };

  try {
    if (prewarm.length > 0) {
      const warmPage = await browser.newPage();
      warmPage.setDefaultTimeout(90_000);
      for (const route of prewarm) {
        await warmPage.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle" });
      }
      await warmPage.close();
    }

    const context = await browser.newContext({
      viewport,
      recordVideo: { dir: demoDir, size: viewport },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(defaultTimeoutMs);

    const hidden = [...(hideNextDevOverlay ? ["nextjs-portal"] : []), ...hideSelectors];
    if (hidden.length > 0) {
      await page.addInitScript((selectors) => {
        const css = document.createElement("style");
        css.textContent = `${selectors.join(", ")} { display: none !important; }`;
        document.addEventListener("DOMContentLoaded", () => document.head.appendChild(css));
      }, hidden);
    }

    async function highlight(locator, ms = 2200) {
      await locator.evaluate((el) => {
        el.style.outline = "3px solid #e11d48";
        el.style.outlineOffset = "4px";
      });
      await page.waitForTimeout(ms);
      await locator.evaluate((el) => {
        el.style.outline = "";
        el.style.outlineOffset = "";
      });
    }

    let sceneIndex = 0;
    async function scene(sceneName, fn) {
      sceneIndex += 1;
      const label = `scene-${String(sceneIndex).padStart(2, "0")}-${slugify(sceneName)}`;
      const startedMs = Date.now();
      console.log(`▶ ${label}`);
      await fn();
      await page.waitForTimeout(scenePauseMs);
      const framePath = path.join(demoDir, `${label}.png`);
      await page.screenshot({ path: framePath, fullPage: false });
      manifest.scenes.push({
        index: sceneIndex,
        name: sceneName,
        frame: framePath,
        durationMs: Date.now() - startedMs,
      });
      console.log(`  frame: ${framePath}`);
    }

    let scenarioError = null;
    try {
      await scenario({ page, context, scene, highlight });
    } catch (err) {
      scenarioError = err;
      const failPath = path.join(demoDir, "scene-FAIL.png");
      await page.screenshot({ path: failPath, fullPage: false }).catch(() => {});
      manifest.files.failFrame = failPath;
      console.error(`✖ scenario failed (state captured in ${failPath}): ${err.message.split("\n")[0]}`);
    }

    const video = page.video();
    await context.close();
    const rawVideo = await video.path();
    const webmPath = path.join(demoDir, `${name}.webm`);
    fs.renameSync(rawVideo, webmPath);
    manifest.files.webm = webmPath;

    try {
      const mp4Path = path.join(demoDir, `${name}.mp4`);
      execFileSync(
        "ffmpeg",
        ["-y", "-i", webmPath, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4Path],
        { stdio: "ignore" },
      );
      manifest.files.mp4 = mp4Path;
    } catch {
      console.log("  (ffmpeg unavailable: kept webm only)");
    }

    manifest.finishedAt = new Date().toISOString();
    manifest.ok = scenarioError === null;
    const manifestPath = path.join(demoDir, "manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`\n${manifest.ok ? "✔" : "✖"} ${manifest.scenes.length} scene(s) recorded`);
    console.log(`  video: ${manifest.files.mp4 ?? manifest.files.webm}`);
    console.log(`  manifest: ${manifestPath}`);
    if (scenarioError) throw scenarioError;
    return manifest;
  } finally {
    await browser.close();
  }
}
