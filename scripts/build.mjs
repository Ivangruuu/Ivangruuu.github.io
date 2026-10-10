import { readFile, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { format } from "prettier";
import { sections } from "../src/render.mjs";
const hash = (text) =>
  createHash("sha256").update(text).digest("hex").slice(0, 10);
const script = await readFile("src/app.js", "utf8");
const animation = await readFile("src/animation.js", "utf8");
const styles = await readFile("src/styles.css", "utf8");
const favicon = await readFile("src/favicon.svg", "utf8");
let html = await readFile("src/index.html", "utf8");
html = html
  .replace("{{sections}}", sections)
  .replace("{{appHash}}", hash(script))
  .replace("{{animationHash}}", hash(animation))
  .replace("{{styleHash}}", hash(styles))
  .replace("{{faviconHash}}", hash(favicon));
if (html.includes("{{")) throw new Error("Unresolved template placeholder");
await writeFile("dist/index.html", await format(html, { parser: "html" }));
await writeFile("dist/app.js", script);
await writeFile("dist/animation.js", animation);
await writeFile("dist/styles.css", styles);
await writeFile("dist/favicon.svg", favicon);
await rm("dist/content.js", { force: true });
console.log("Built static HTML, styles and progressive enhancements.");
