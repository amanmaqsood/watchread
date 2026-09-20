import { describe, it, expect } from "vitest";
import { parseTranscript } from "../../lib/import";
import { sampleProject } from "../../lib/sample";
import {
  inspectCompanion,
  replaceSource,
  validateProject,
  validateCues,
} from "../../lib/domain";
import { citationsCsv, readingHtml, portableJson } from "../../lib/export";
describe("transcript boundaries", () => {
  it("reads real VTT/SRT times without inventing times for TXT", () => {
    expect(
      parseTranscript(
        "WEBVTT\n\n00:00:03.200 --> 00:00:05.100\nA leaf.",
        "a.vtt",
      )[0],
    ).toEqual({ id: "cue-1", start: 3.2, end: 5.1, text: "A leaf." });
    expect(
      parseTranscript(
        "1\n00:01:00,000 --> 00:01:04,000\nA sentence.",
        "a.srt",
      )[0].start,
    ).toBe(60);
    expect(parseTranscript("Untimed words.", "a.txt")[0].start).toBeNull();
  });
  it("rejects missing and reversed timing", () => {
    expect(() => parseTranscript("Words without times", "a.srt")).toThrow();
    expect(() =>
      parseTranscript("00:00:10.000 --> 00:00:09.000\nWords", "a.vtt"),
    ).toThrow();
    expect(() =>
      parseTranscript("00:00:99.000 --> 00:01:01.000\nWords", "a.vtt"),
    ).toThrow();
  });
  it("allows overlapping captions but rejects media mismatch", () => {
    const c = parseTranscript(
      "00:00:01.000 --> 00:00:04.000\nOne\n\n00:00:02.000 --> 00:00:05.000\nTwo",
      "a.vtt",
    );
    expect(c).toHaveLength(2);
    expect(() => validateCues(c, 2)).toThrow();
  });
});
describe("source contracts", () => {
  it("validates all prepared sample references", () => {
    const p = sampleProject();
    expect(inspectCompanion(p.companion!, p.cues)).toEqual([]);
    expect(validateProject(p).id).toBe(p.id);
  });
  it("rejects nonexistent evidence and fabricated quotations", () => {
    const p = sampleProject();
    p.companion!.chapters[0].claims[0].cueIds = ["invented"];
    expect(inspectCompanion(p.companion!, p.cues).length).toBeGreaterThan(0);
    const q = sampleProject();
    q.companion!.chapters[0].claims[0].kind = "quotation";
    q.companion!.chapters[0].claims[0].text = "The moon is made of sunlight.";
    expect(
      inspectCompanion(q.companion!, q.cues).some((e) =>
        e.includes("quotation"),
      ),
    ).toBe(true);
  });
  it("invalidates practice and claims after source replacement and retains the original", () => {
    const p = sampleProject();
    const changed = replaceSource(
      p,
      [{ id: "new", start: 0, end: 1, text: "A changed source." }],
      "new-revision",
    );
    expect(changed.previousCompanion).toEqual(p.companion);
    expect(
      changed.companion!.chapters.every(
        (c) =>
          c.claims.every((x) => x.status === "stale") &&
          c.checks.every((x) => x.status === "stale"),
      ),
    ).toBe(true);
    expect(p.companion!.chapters[0].claims[0].status).toBe("supported");
  });
  it("rejects external video URLs in imported projects", () => {
    const p = sampleProject();
    p.media!.sampleUrl = "https://example.com/tracker.mp4";
    expect(() => validateProject(p)).toThrow("Untrusted");
  });
  it("refuses a repeated recovery question", () => {
    const p = sampleProject();
    const q = p.companion!.chapters[0].checks[0];
    q.recovery.question = q.question;
    expect(
      inspectCompanion(p.companion!, p.cues).some((e) => e.includes("repeats")),
    ).toBe(true);
  });
});
describe("portable exports", () => {
  it("escapes source markup and neutralizes spreadsheet formulas", () => {
    const p = sampleProject();
    p.title = '<script>alert("unsafe")</script>';
    p.companion!.chapters[0].claims[0].text = '=HYPERLINK("bad")';
    expect(readingHtml(p)).not.toContain("<script>");
    expect(citationsCsv(p)).toContain("\"'=HYPERLINK");
  });
  it("preserves source references and explicitly excludes media bytes", () => {
    const p = sampleProject();
    const result = JSON.parse(portableJson(p));
    expect(result.cues).toEqual(p.cues);
    expect(result.exportNote).toContain("Media is not included");
    expect(result).not.toHaveProperty("blob");
  });
});

describe("revision identity and recovery history", () => {
  it("restores the original generation record alongside its transcript", async () => {
    const { restoreSource } = await import("../../lib/domain");
    const original = sampleProject();
    const changed = replaceSource(
      original,
      [{ id: "new", text: "Changed lesson.", start: null, end: null }],
      "changed",
    );
    const changedAgain = replaceSource(
      changed,
      [{ id: "newer", text: "Another lesson.", start: null, end: null }],
      "changed-again",
    );
    const restored = restoreSource(changedAgain);
    expect(restored.run).toEqual(original.run);
    expect(restored.revision).toBe(original.revision);
    expect(restored.cues).toEqual(original.cues);
    expect(restored.companion).toEqual(original.companion);
  });
  it("does not attach an old answer to regenerated questions on the same source", async () => {
    const { isCurrentAttempt } = await import("../../lib/domain");
    const p = sampleProject();
    const attempt = {
      id: "attempt",
      checkId: "q1",
      revision: p.revision,
      runId: p.run!.id,
      choiceId: "a",
      correct: false,
      createdAt: new Date().toISOString(),
      clipOpened: true,
    };
    expect(isCurrentAttempt(attempt, p)).toBe(true);
    p.run!.id = "new-generation";
    expect(isCurrentAttempt(attempt, p)).toBe(false);
  });
  it("rejects generation metadata belonging to a different source revision", () => {
    const p = sampleProject();
    p.run!.sourceHash = "wrong-revision";
    expect(() => validateProject(p)).toThrow("different source revision");
  });
});

it("keeps source fingerprints stable across schema parsing and JSON field order", async () => {
  const { serializeCues, CueSchema } = await import("../../lib/domain");
  const p = sampleProject();
  const original = serializeCues(p.cues);
  expect(
    serializeCues(
      p.cues.map((c) =>
        CueSchema.parse({ text: c.text, end: c.end, start: c.start, id: c.id }),
      ),
    ),
  ).toBe(original);
  const { createHash } = await import("node:crypto");
  expect(createHash("sha256").update(original).digest("hex")).toBe(p.revision);
});

it("includes glossary definitions in citation coverage and invalidates them with the source", async () => {
  const { coverage } = await import("../../lib/domain");
  const p = sampleProject();
  expect(coverage(p)).toEqual({ total: 17, linked: 17, reviewed: 17 });
  const changed = replaceSource(
    p,
    [{ id: "new", text: "New source.", start: null, end: null }],
    "new",
  );
  expect(coverage(changed)).toEqual({ total: 17, linked: 0, reviewed: 0 });
  expect(citationsCsv(p)).toContain("Stomata: Tiny leaf pores");
});
