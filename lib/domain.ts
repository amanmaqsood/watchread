import { z } from "zod";

export const CueSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(10000),
  start: z.number().nonnegative().nullable(),
  end: z.number().nonnegative().nullable(),
});
export type Cue = z.infer<typeof CueSchema>;
// Field order must not change a fingerprint after Zod parsing or JSON restore.
export function serializeCues(cues: Cue[]) {
  return JSON.stringify(
    cues.map(({ id, start, end, text }) => ({ id, start, end, text })),
  );
}
export const ClaimSchema = z.object({
  id: z.string(),
  text: z.string().min(1).max(2000),
  cueIds: z.array(z.string()).max(12),
  kind: z.enum(["quotation", "paraphrase", "inference"]),
  status: z.enum(["supported", "needs_review", "contradicted", "stale"]),
  reason: z.string().max(1000),
});
export type Claim = z.infer<typeof ClaimSchema>;
export const ChoiceSchema = z.object({
  id: z.string(),
  text: z.string().max(500),
  explanation: z.string().max(1000),
  cueIds: z.array(z.string()).max(12),
});
export const CheckSchema = z.object({
  id: z.string(),
  concept: z.string(),
  question: z.string().max(1000),
  choices: z.array(ChoiceSchema).min(2).max(4),
  correctId: z.string(),
  cueIds: z.array(z.string()).min(1).max(12),
  recovery: z.object({
    question: z.string().max(1000),
    choices: z
      .array(z.object({ id: z.string(), text: z.string().max(500) }))
      .min(2)
      .max(4),
    correctId: z.string(),
    explanation: z.string().max(1000),
    cueIds: z.array(z.string()).min(1).max(12),
  }),
  status: z.enum(["supported", "needs_review", "stale"]),
});
export type Check = z.infer<typeof CheckSchema>;
export const ChapterSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  goal: z.string().max(300),
  claims: z.array(ClaimSchema).min(1).max(20),
  checks: z.array(CheckSchema).max(2),
});
export const CompanionSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300),
  chapters: z.array(ChapterSchema).min(1).max(4),
  glossary: z
    .array(
      z.object({
        term: z.string().max(100),
        definition: z.string().max(500),
        cueIds: z.array(z.string()).min(1).max(12),
      }),
    )
    .max(12),
});
export type Companion = z.infer<typeof CompanionSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export const AttemptSchema = z.object({
  id: z.string(),
  checkId: z.string(),
  revision: z.string(),
  choiceId: z.string(),
  runId: z.string().optional(),
  correct: z.boolean(),
  createdAt: z.string(),
  clipOpened: z.boolean(),
  recoveryChoiceId: z.string().optional(),
  recoveryCorrect: z.boolean().optional(),
});
export type Attempt = z.infer<typeof AttemptSchema>;
export const RunSchema = z.object({
  id: z.string(),
  provider: z.string(),
  model: z.string(),
  sourceHash: z.string(),
  promptVersion: z.string(),
  createdAt: z.string(),
  durationMs: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  requests: z.number(),
  reviewer: z.string(),
});
export type GenerationRun = z.infer<typeof RunSchema>;
export const ProjectSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  title: z.string().max(200),
  sourceType: z.enum(["sample", "upload"]),
  rights: z.enum(["owner", "licensed", "exploring"]),
  attribution: z.string().max(1000),
  createdAt: z.string(),
  updatedAt: z.string(),
  revision: z.string(),
  cues: z.array(CueSchema).max(1200),
  companion: CompanionSchema.nullable(),
  attempts: z.array(AttemptSchema).max(10000),
  media: z
    .object({
      name: z.string(),
      hash: z.string(),
      duration: z.number().nonnegative(),
      size: z.number().nonnegative(),
      mime: z.string(),
      sampleUrl: z.string().optional(),
    })
    .nullable(),
  run: RunSchema.nullable(),
  status: z.enum(["ready", "draft", "needs_review"]),
  previousCompanion: CompanionSchema.nullable().optional(),
  previousRun: RunSchema.nullable().optional(),
  previousSource: z
    .object({ revision: z.string(), cues: z.array(CueSchema) })
    .optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const time = (seconds: number | null | undefined) =>
  seconds == null
    ? "Untimed"
    : `${Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0")}:${Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0")}`;
export function passage(cues: Cue[], ids: string[]) {
  return ids
    .map((id) => cues.find((c) => c.id === id))
    .filter((c): c is Cue => Boolean(c));
}
export function evidenceLabel(cues: Cue[], ids: string[]) {
  const p = passage(cues, ids);
  return p[0]?.start != null
    ? `${time(p[0].start)} to ${time(p[0].end)}${p.length > 1 ? ` +${p.length - 1}` : ""}`
    : "Transcript passage";
}
export function validateCues(cues: Cue[], duration?: number) {
  if (!cues.length)
    throw Error("The transcript contains no readable passages.");
  if (cues.length > 1200)
    throw Error("Please use a transcript with at most 1,200 cues.");
  const ids = new Set<string>();
  for (const cue of cues) {
    if (ids.has(cue.id)) throw Error("Duplicate cue identifier.");
    ids.add(cue.id);
    if (!cue.text.trim()) throw Error("Empty transcript cue.");
    if ((cue.start === null) !== (cue.end === null))
      throw Error("A cue needs both start and end times.");
    if (
      cue.start != null &&
      cue.end != null &&
      (cue.start < 0 || cue.end <= cue.start || !Number.isFinite(cue.end))
    )
      throw Error("Invalid cue timing. End must follow start.");
    if (duration && cue.end != null && cue.end > duration + 1)
      throw Error(
        "Transcript timing extends beyond this recording. Check the matching transcript.",
      );
  }
}
export function inspectCompanion(companion: Companion, cues: Cue[]) {
  const errors: string[] = [];
  const ids = new Set(cues.map((c) => c.id));
  const seen = new Set<string>();
  const register = (id: string) => {
    if (!id || seen.has(id))
      errors.push(`Duplicate or empty identifier: ${id}`);
    seen.add(id);
  };
  const refs = (refs: string[], where: string) => {
    if (!refs.length || refs.some((id) => !ids.has(id)))
      errors.push(`${where}: missing source passage`);
  };
  if (companion.chapters.flatMap((c) => c.claims).length > 40)
    errors.push("More than 40 claims");
  for (const chapter of companion.chapters) {
    register(chapter.id);
    for (const claim of chapter.claims) {
      register(claim.id);
      if (claim.status === "supported") refs(claim.cueIds, claim.id);
      if (claim.cueIds.some((id) => !ids.has(id)))
        errors.push(`${claim.id}: unknown cue`);
      if (
        claim.kind === "quotation" &&
        claim.status === "supported" &&
        !passage(cues, claim.cueIds)
          .map((c) => c.text)
          .join(" ")
          .includes(claim.text)
      )
        errors.push(`${claim.id}: quotation differs from source`);
    }
    for (const q of chapter.checks) {
      register(q.id);
      refs(q.cueIds, q.id);
      refs(q.recovery.cueIds, `${q.id} recovery`);
      if (
        new Set(q.choices.map((c) => c.id)).size !== q.choices.length ||
        !q.choices.some((c) => c.id === q.correctId)
      )
        errors.push(`${q.id}: invalid answer`);
      if (
        new Set(q.recovery.choices.map((c) => c.id)).size !==
          q.recovery.choices.length ||
        !q.recovery.choices.some((c) => c.id === q.recovery.correctId)
      )
        errors.push(`${q.id}: invalid recovery answer`);
      if (
        q.question.trim().toLowerCase() ===
        q.recovery.question.trim().toLowerCase()
      )
        errors.push(`${q.id}: recovery repeats question`);
      for (const c of q.choices) refs(c.cueIds, `${q.id}/${c.id}`);
    }
  }
  for (const item of companion.glossary) refs(item.cueIds, item.term);
  return errors;
}
export function replaceSource(
  project: Project,
  cues: Cue[],
  revision: string,
): Project {
  validateCues(cues, project.media?.duration);
  const companion = project.companion
    ? structuredClone(project.companion)
    : null;
  companion?.chapters.forEach((c) => {
    c.claims.forEach((x) => {
      x.status = "stale";
      x.reason =
        "The transcript has changed. Regenerate to reconnect this claim.";
    });
    c.checks.forEach((x) => (x.status = "stale"));
  });
  return {
    ...project,
    revision,
    cues,
    companion,
    previousCompanion:
      project.status === "needs_review"
        ? (project.previousCompanion ?? project.companion)
        : project.companion,
    previousRun:
      project.status === "needs_review"
        ? (project.previousRun ?? null)
        : project.run,
    previousSource:
      project.status === "needs_review" && project.previousSource
        ? project.previousSource
        : {
            revision: project.revision,
            cues: project.cues,
          },
    status: "needs_review",
    run: null,
    updatedAt: new Date().toISOString(),
  };
}
export function restoreSource(project: Project): Project {
  if (!project.previousSource || !project.previousCompanion) return project;
  return validateProject({
    ...project,
    cues: project.previousSource.cues,
    revision: project.previousSource.revision,
    companion: project.previousCompanion,
    run: project.previousRun ?? null,
    previousCompanion: null,
    previousRun: null,
    previousSource: undefined,
    status: "ready",
    updatedAt: new Date().toISOString(),
  });
}
export function isCurrentAttempt(attempt: Attempt, project: Project) {
  return (
    attempt.revision === project.revision &&
    attempt.runId === (project.run?.id ?? project.revision)
  );
}
export function validateProject(raw: unknown) {
  const p = ProjectSchema.parse(raw);
  if (p.run && p.run.sourceHash !== p.revision)
    throw Error(
      "The generation record belongs to a different source revision.",
    );
  if (p.cues.length) validateCues(p.cues, p.media?.duration);
  else if (p.companion) throw Error("A companion needs a source transcript.");
  if (
    p.media?.sampleUrl &&
    !(
      p.sourceType === "sample" &&
      p.id === "photosynthesis" &&
      p.media.sampleUrl === "/sample/lecture.mp4"
    )
  )
    throw Error("Untrusted media URL.");
  if (p.companion) {
    const current = structuredClone(p.companion);
    current.chapters.forEach((c) => {
      c.claims = c.claims.filter((x) => x.status !== "stale");
      c.checks = c.checks.filter((x) => x.status !== "stale");
    });
    if (p.status === "needs_review") current.glossary = [];
    const e = inspectCompanion(current, p.cues);
    if (e.length) throw Error(e.join("; "));
  }
  return p;
}
export function coverage(p: Project) {
  const claims = evidenceClaims(p);
  return {
    total: claims.length,
    linked: claims.filter(
      (c) =>
        c.status !== "stale" &&
        c.cueIds.length &&
        passage(p.cues, c.cueIds).length === c.cueIds.length,
    ).length,
    reviewed: claims.filter((c) => c.status === "supported").length,
  };
}
export function evidenceClaims(p: Project): Claim[] {
  if (!p.companion) return [];
  return [
    ...p.companion.chapters.flatMap((c) => c.claims),
    ...p.companion.glossary.map((g, i): Claim => ({
      id: `glossary:${i}:${g.term}`,
      text: `${g.term}: ${g.definition}`,
      cueIds: g.cueIds,
      kind: "paraphrase",
      status: p.status === "needs_review" ? "stale" : "supported",
      reason:
        p.status === "needs_review"
          ? "The transcript changed. Regenerate this glossary entry."
          : "Glossary entry retained after source support review.",
    })),
  ];
}
