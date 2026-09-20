import { Project, evidenceLabel, passage, evidenceClaims } from "./domain";
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
export function manuscript(p: Project) {
  return `# ${p.title}\n\n${p.companion?.subtitle ?? ""}\n\nSource: ${p.attribution}\nSource revision: ${p.revision}\nModel: ${p.run?.model ?? "Not recorded"}\n\n${p.companion?.chapters.map((c, i) => `## ${i + 1}. ${c.title}\n\n${c.claims.map((x) => `${x.text}\n\n[${x.kind}; ${x.status}; ${x.status === "stale" ? "Source changed" : evidenceLabel(p.cues, x.cueIds)}; ${x.cueIds.join(", ")}]${x.reason ? ` ${x.reason}` : ""}\n`).join("\n")}`).join("\n") ?? "No companion yet."}\n\n${p.status !== "needs_review" && p.companion?.glossary.length ? `## Glossary\n\n${p.companion.glossary.map((g) => `**${g.term}**: ${g.definition} [${g.cueIds.join(", ")}]`).join("\n\n")}` : ""}\n\n## Source transcript\n\n${p.cues.map((c) => `${c.id} (${evidenceLabel(p.cues, [c.id])}): ${c.text}`).join("\n\n")}\n\nSource references show attribution, not independent factual verification.\n`;
}
export function readingHtml(p: Project) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(p.title)}</title><style>@page{size:6in 9in;margin:.65in .7in}body{max-width:42rem;margin:3rem auto;padding:1.5rem;font:18px/1.7 Georgia,serif;color:#1c1915;background:#fffdf8}h1{font-size:3rem;line-height:1.1}h2{break-before:page;font-size:2rem}small{font:12px/1.5 system-ui;color:#555}a{color:#2f4f3e}p{orphans:3;widows:3}.note{border-left:3px solid #c4842a;padding-left:1rem}@media print{body{margin:0;padding:0}}</style></head><body><small>WATCHREAD · READING COPY</small><h1>${escape(p.title)}</h1><p>${escape(p.companion?.subtitle ?? "")}</p><small>${escape(p.attribution)}<br>Source revision: ${escape(p.revision)}<br>Model: ${escape(p.run?.model ?? "Not recorded")}<br>Source references are attribution, not independent factual verification. Media is not embedded.</small>${p.companion?.chapters.map((c, i) => `<h2>${i + 1}. ${escape(c.title)}</h2>${c.claims.map((x) => `<p class="${x.status !== "supported" ? "note" : ""}">${escape(x.text)} <small>[${escape(x.kind)}; ${escape(x.status)}: ${x.status === "stale" ? "Source changed; regenerate references" : x.cueIds.map((id) => `<a href="#${encodeURIComponent(id)}">${escape(id)}</a>`).join(", ")}] ${escape(x.reason)}</small></p>`).join("")}`).join("") ?? ""}${p.status !== "needs_review" && p.companion?.glossary.length ? `<h2>Glossary</h2>${p.companion.glossary.map((g) => `<p><strong>${escape(g.term)}</strong>: ${escape(g.definition)} <small>${g.cueIds.map((id) => `<a href="#${encodeURIComponent(id)}">${escape(id)}</a>`).join(", ")}</small></p>`).join("")}` : ""}<h2>Source transcript</h2>${p.cues.map((c) => `<p id="${escape(c.id)}"><small>${escape(c.id)} · ${escape(evidenceLabel(p.cues, [c.id]))}</small><br>${escape(c.text)}</p>`).join("")}</body></html>`;
}
export function citationsCsv(p: Project) {
  const cell = (s: string) =>
    `"${(/^[\s]*[=+@\-\t\r]/.test(s) ? "'" : "") + s.replaceAll('"', '""')}"`;
  const rows = [
    [
      "claim",
      "kind",
      "status",
      "source_revision",
      "cue_ids",
      "time",
      "source_text",
    ],
    ...evidenceClaims(p).map((x) => [
      x.text,
      x.kind,
      x.status,
      x.status === "stale"
        ? (p.previousSource?.revision ?? "unknown previous revision")
        : p.revision,
      x.cueIds.join(";"),
      x.status === "stale" ? "stale" : evidenceLabel(p.cues, x.cueIds),
      x.status === "stale"
        ? "Source changed"
        : passage(p.cues, x.cueIds)
            .map((c) => c.text)
            .join(" "),
    ]),
  ];
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}
export function portableJson(p: Project) {
  return JSON.stringify(
    {
      ...p,
      exportNote:
        "Media is not included. Reattach the original recording to restore playback.",
    },
    null,
    2,
  );
}
export function download(name: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
