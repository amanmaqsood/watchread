import { Cue, validateCues } from "./domain";
function stamp(value: string) {
  const parts = value.trim().replace(",", ".").split(":");
  if (
    parts.length < 2 ||
    parts.length > 3 ||
    parts.some((v) => !/^\d+(\.\d+)?$/.test(v))
  )
    throw Error("Unrecognized transcript timestamp.");
  const n = parts.map(Number);
  if (n.at(-1)! >= 60 || (n.length === 3 && n[1] >= 60))
    throw Error("Timestamp seconds/minutes must be below 60.");
  return n.reduce((s, p) => s * 60 + p, 0);
}
export function parseTranscript(text: string, name: string): Cue[] {
  if (new TextEncoder().encode(text).length > 1024 * 1024)
    throw Error("Transcript exceeds the 1 MB limit.");
  const clean = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .trim();
  if (!clean) throw Error("This transcript is empty.");
  let cues: Cue[] = [];
  if (/\.(srt|vtt)$/i.test(name)) {
    const blocks = clean.split(/\n\s*\n/);
    for (const block of blocks) {
      if (
        /^(WEBVTT|NOTE|STYLE|REGION)(\s|$)/.test(block) &&
        !block.includes("-->")
      )
        continue;
      const lines = block.split("\n");
      const i = lines.findIndex((l) => l.includes("-->"));
      if (i < 0) {
        if (block.trim())
          throw Error(
            "A caption block has no timestamp. Upload VTT, SRT, or a plain TXT file.",
          );
        continue;
      }
      const m = lines[i].match(/^\s*([\d:.,]+)\s*-->\s*([\d:.,]+)/);
      if (!m) throw Error("A caption timestamp is malformed.");
      const body = lines
        .slice(i + 1)
        .join(" ")
        .replace(/<[^>]*>/g, "")
        .trim();
      if (body)
        cues.push({
          id: `cue-${cues.length + 1}`,
          start: stamp(m[1]),
          end: stamp(m[2]),
          text: body,
        });
    }
  } else if (/\.txt$/i.test(name)) {
    cues = clean
      .split(/\n\s*\n|\n/)
      .filter(Boolean)
      .map((text, i) => ({
        id: `cue-${i + 1}`,
        start: null,
        end: null,
        text: text.trim(),
      }));
  } else throw Error("Choose a .vtt, .srt, or .txt transcript.");
  cues = cues.filter(
    (c, i, a) =>
      !a
        .slice(0, i)
        .some(
          (p) => p.start === c.start && p.end === c.end && p.text === c.text,
        ),
  );
  validateCues(cues);
  return cues;
}
export async function hashData(data: string | ArrayBuffer) {
  const buffer =
    typeof data === "string" ? new TextEncoder().encode(data) : data;
  const result = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(result))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
