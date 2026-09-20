import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { sampleProject } from "../lib/sample";
import { validateProject } from "../lib/domain";
import {
  manuscript,
  readingHtml,
  citationsCsv,
  portableJson,
} from "../lib/export";
mkdirSync("examples", { recursive: true });
const p = sampleProject();
for (const [name, content] of [
  ["manuscript.md", manuscript(p)],
  ["reading-copy.html", readingHtml(p)],
  ["citations.csv", citationsCsv(p)],
  ["watchread-project.json", portableJson(p)],
])
  writeFileSync(`examples/${name}`, content);
const heat = JSON.parse(readFileSync("evals/runs/heat.json", "utf8"));
const source = JSON.parse(readFileSync("evals/runs/heat-source.json", "utf8"));
const second = validateProject({
  ...p,
  id: "heat-and-touch",
  sourceType: "upload",
  title: heat.companion.title,
  cues: source.cues,
  revision: heat.run.sourceHash,
  companion: heat.companion,
  run: heat.run,
  media: null,
  attribution:
    "Original short evaluation transcript written for WatchRead. Prepared from a real Fable 5.1 run; no human lecturer or recording.",
  createdAt: heat.run.createdAt,
  updatedAt: heat.run.createdAt,
});
writeFileSync("examples/heat-project.json", portableJson(second));
console.log("Wrote four sample exports and the real generated heat companion.");
