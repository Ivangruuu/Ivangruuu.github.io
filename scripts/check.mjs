import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
const html = await readFile("dist/index.html", "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
if (new Set(ids).size !== ids.length) throw new Error("Duplicate HTML ids");
for (const id of [
  "about",
  "experience",
  "vision",
  "language",
  "multimodal",
  "ocr",
  "nlp",
  "stack",
  "education",
  "contact",
]) {
  if (!ids.includes(id)) throw new Error(`Missing static section: ${id}`);
}
for (const m of html.matchAll(/\b(?:src|data-src|href|poster)="([^"#]+)"/g)) {
  const url = m[1];
  if (/^(?:https?:|mailto:|tel:|data:)/.test(url)) continue;
  const path = decodeURIComponent(url.split("?")[0]);
  await access(resolve("dist", path));
}
for (const m of html.matchAll(/href="#([^"]+)"/g))
  if (!ids.includes(m[1])) throw new Error(`Broken anchor: ${m[1]}`);
if (/<video[^>]*\s(?:autoplay|src)=?/.test(html))
  throw new Error("Video eagerly loads or autoplays before enhancement");
for (const file of [
  "dist/app.js",
  "dist/animation.js",
  "src/content.mjs",
  "src/render.mjs",
])
  execFileSync(process.execPath, ["--check", file]);
console.log(
  "Static sections, unique ids, anchors, local resources and script syntax checked.",
);
