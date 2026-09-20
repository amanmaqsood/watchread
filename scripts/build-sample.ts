import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import sharp from "sharp";
const root = process.cwd();
const dir = `${root}/content/sample`;
mkdirSync(`${dir}/audio`, { recursive: true });
mkdirSync(`${dir}/frames`, { recursive: true });
mkdirSync(`${root}/public/sample`, { recursive: true });
const script = JSON.parse(readFileSync(`${dir}/script.json`, "utf8")) as {
  chapter: number;
  heading: string;
  key: string;
  text: string;
  claim: string;
}[];
const xml = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const wrap = (s: string, n: number) => {
  const lines: string[] = [];
  let line = "";
  for (const word of s.split(" ")) {
    if ((line + word).length > n) {
      lines.push(line);
      line = "";
    }
    line += word + " ";
  }
  if (line) lines.push(line.trim());
  return lines;
};
const leaf = `<g transform="translate(970 410) rotate(-18)"><path d="M0 190 Q-18 20 8 -185" fill="none" stroke="#d6d6a6" stroke-width="3"/>${[-140, -65, 10, 85].map((y, i) => `<path d="M4 ${y + 30} Q-130 ${y - 90} -145 ${y - 20} Q-80 ${y + 60} 4 ${y + 30}" fill="${i % 2 ? "#6d8b59" : "#8b9e6c"}"/><path d="M5 ${y + 25} Q110 ${y - 85} 130 ${y - 28} Q65 ${y + 58} 5 ${y + 25}" fill="${i % 2 ? "#afba85" : "#708f64"}"/>`).join("")}</g>`;
const cues = [];
let cursor = 0;
const clips: string[] = [];
for (const [i, s] of script.entries()) {
  const stem = `${dir}/audio/${String(i).padStart(2, "0")}`;
  writeFileSync(`${stem}.txt`, s.text);
  execFileSync("say", [
    "-v",
    "Samantha",
    "-r",
    "153",
    "-f",
    `${stem}.txt`,
    "-o",
    `${stem}.aiff`,
  ]);
  const seconds =
    Number(
      execFileSync(
        "ffprobe",
        [
          "-v",
          "error",
          "-show_entries",
          "format=duration",
          "-of",
          "default=noprint_wrappers=1:nokey=1",
          `${stem}.aiff`,
        ],
        { encoding: "utf8" },
      ).trim(),
    ) + 0.5;
  const duration = Math.ceil(seconds * 10) / 10;
  const frame = `${dir}/frames/${i}.png`;
  const svg = `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg"><rect width="1280" height="720" fill="#183c2f"/><circle cx="1010" cy="360" r="280" fill="#234736"/><rect x="65" y="65" width="28" height="28" rx="3" fill="#dce2bb"/><text x="111" y="86" font-family="Arial" font-size="21" fill="#f4efe4">watchread</text><text x="70" y="172" font-family="Arial" font-size="15" letter-spacing="4" fill="#bfcdad">CHAPTER 0${s.chapter + 1} / BOTANY</text>${wrap(
    s.key,
    24,
  )
    .map(
      (l, j) =>
        `<text x="65" y="${290 + j * 74}" font-family="Georgia" font-size="66" fill="#f4efe4">${xml(l)}</text>`,
    )
    .join("")}${wrap(s.claim, 55)
    .map(
      (l, j) =>
        `<text x="70" y="${470 + j * 33}" font-family="Arial" font-size="23" fill="#d3dbc5">${xml(l)}</text>`,
    )
    .join(
      "",
    )}${leaf}<line x1="70" y1="630" x2="1210" y2="630" stroke="#66806c"/><text x="70" y="668" font-family="Arial" font-size="16" fill="#c0ccb3">HOW PHOTOSYNTHESIS ACTUALLY WORKS</text><text x="970" y="668" font-family="Arial" font-size="14" fill="#c0ccb3">Original lesson · Synthetic narration</text></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(frame);
  const clip = `${stem}.mp4`;
  execFileSync("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-loop",
    "1",
    "-framerate",
    "10",
    "-i",
    frame,
    "-i",
    `${stem}.aiff`,
    "-t",
    String(duration),
    "-af",
    "apad",
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-tune",
    "stillimage",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "96k",
    clip,
  ]);
  clips.push(clip);
  cues.push({
    id: `cue-${i + 1}`,
    start: Number(cursor.toFixed(3)),
    end: Number((cursor + duration).toFixed(3)),
    text: s.text,
  });
  cursor += duration;
  console.log(`Rendered ${i + 1}/${script.length}`);
}
writeFileSync(
  `${dir}/audio/concat.txt`,
  clips.map((c) => `file '${c}'`).join("\n"),
);
execFileSync("ffmpeg", [
  "-hide_banner",
  "-loglevel",
  "error",
  "-y",
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  `${dir}/audio/concat.txt`,
  "-c",
  "copy",
  "-movflags",
  "+faststart",
  `${root}/public/sample/lecture.mp4`,
]);
await sharp(`${dir}/frames/0.png`)
  .webp({ quality: 85 })
  .toFile(`${root}/public/sample/poster.webp`);
const stamp = (s: number) =>
  `${Math.floor(s / 3600)
    .toString()
    .padStart(2, "0")}:${Math.floor((s / 60) % 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toFixed(3).padStart(6, "0")}`;
const vtt =
  "WEBVTT\n\n" +
  cues
    .map((c) => `${c.id}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`)
    .join("\n");
writeFileSync(`${root}/public/sample/transcript.vtt`, vtt);
writeFileSync(`${dir}/cues.json`, JSON.stringify(cues, null, 2));
const hash = (x: Buffer | string) =>
  createHash("sha256").update(x).digest("hex");
const media = readFileSync(`${root}/public/sample/lecture.mp4`);
writeFileSync(
  `${dir}/provenance.json`,
  JSON.stringify(
    {
      title: "How photosynthesis actually works",
      origin:
        "Original educational script and rendered slides; synthetic macOS Samantha narration. Not a recorded human lecturer.",
      preparation:
        "Editorially prepared companion, separate from runtime generation evaluations",
      references: [
        "https://openstax.org/books/biology/pages/8-2-the-light-dependent-reactions-of-photosynthesis",
        "https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules",
      ],
      mediaHash: hash(media),
      transcriptHash: hash(JSON.stringify(cues)),
      duration: cursor,
      size: media.length,
      createdAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(`Sample ready: ${cursor.toFixed(1)} seconds`);
