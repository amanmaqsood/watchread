/goal

Build WatchRead in `/Users/ashish/watchread` to the following agreed contract. This file supersedes the original `prompt.md`. Read `CONTEXT.md`, `docs/implementation-plan.md`, and `docs/adr/` before implementation. The interview is complete under the user's instruction to follow the recommended choices; do not restart questions about stack, palette, or scope.

## Outcome

Deliver a polished, locally runnable Next.js application for students revising difficult recorded lectures. WatchRead creates a readable companion with inspectable sources and helps the learner revisit an explanation after a wrong answer.

Pitch: “A lecture you can read. An explanation you can return to.”

Signature journey: real lecture → readable companion → plausible wrong answer → specific source clip → different recovery question → recorded recovery trail. A prepared sample works without API keys or network calls. New transcript generation must be real when a configured model connection is available.

This is for an offline Fable 5.1 event. Do not spend time finding the host or infer official rules. Treat offline as in-person; model inference may need connectivity. Aim for the quality of documented Claude/Codex winners without claiming a rank or winning probability. Build fresh; no copying VidBook or winner code. Preserve the original prompt as history.

## Stack and visual language

Use Next.js App Router, TypeScript, Tailwind, npm, Lucide, optional restrained Motion, and custom accessible components. IndexedDB stores projects and eligible media; localStorage stores only preferences. No auth, payments, cloud media storage, or required external database.

Warm paper `#F4EFE4`, ink `#1C1915`, moss `#2F4F3E`, caution `#C4842A`, line `#E6DCC8`. Editorial serif book text and clean sans UI; bundle fonts or use local fallbacks. Calm publishing studio, generous line spacing, 65–70 character measure. Use readable caution labels, visible focus, reduced motion, and a good 390px mobile layout. No 3D dependency or generic chatbot interface.

## Build the risky interaction first

Follow milestones M0–M7 in the implementation plan. Start with actual media, transcript, domain schema, and one working claim-to-source interaction. Then durable imports, live composition, recovery checks, exports, and visual polish. Do not spend the first phase on a decorative landing page.

Use these routes or simpler equivalent routes while preserving the complete journey:

- `/`: compact product introduction, Open sample, Start with a lecture.
- `/app`: saved projects; sample first.
- `/app/new`: source/transcript selection, rights declaration, import validation, Generate.
- `/app/[id]/read`: player/transcript/book, chapter navigation, title/order editing.
- `/app/[id]/practice`: question, specific correction, restudy clip, recovery check.
- `/app/[id]/sources`: source references, review states, revisions.
- `/app/[id]/export`: exports and browser-print reading copy.

Redirect the project root to Read. Every major empty/error/loading state should fit the visual language and describe real state.

## Real sources

Create a real 6–8 minute photosynthesis microlecture with approximately three chapters and a matching timed transcript. Use an owned recording if already available; otherwise produce original narrated slides with clearly labeled synthetic narration. Check the educational content against authoritative sources and attribute adaptations. Do not invent a professor, duration, rights ownership, or a captured human lecture. Write a provenance manifest and inspect timing against the actual recording.

Import MP4/WebM plus VTT/SRT. Support TXT as untimed text with text citations only. Video without a transcript remains a saved draft awaiting captions; never generate evidence from its filename. Initial limits: 30-minute recording, 150 MB media, 1 MB transcript, 1,200 cues, 12,000 normalized input tokens. Explain limits and invalid timing without truncating silently.

HTML5 playback is required. Never substitute a fake player, timecode simulation, or poster for source playback. Transcript-only sources must say that media is unavailable.

## Evidence contract

Implement the entities and invariants in the plan: Project, SourceRevision, Cue, Claim, EvidenceReference, SupportReview, Chapter, Check, Attempt, GenerationRun.

Represent sentence-sized claims with references to immutable source revisions and cue spans. Derive quotations and timing in code from the source; do not trust model-provided quotations or timestamps. Distinguish quotation, paraphrase, and inference. Source attribution is not proof that a lecturer is factually correct.

Validate reference IDs, ranges, source hashes, answer structure, and schema deterministically. Separately review semantic support. Unsupported, contradicted, ambiguous, or stale content is marked Needs review. Hide dependent graded checks until their answers and explanations have valid support. Handle later corrections and quotations of wrong student answers as adversarial cases.

Coverage, if shown, means factual claims with valid references divided by all factual claims, including summaries. Show semantic-review status separately. No invented confidence percentages or truth scores.

Title/order edits are supported. Do not add arbitrary prose editing in v1. Source replacement creates a revision and invalidates dependent citations/checks while preserving the old companion.

## Generation

Use a server-only Claude SDK adapter with an explicitly configured model available to the account; use Fable 5.1 only if actually available. Verify the exact API model ID. Do not silently substitute a different model or claim a model was used because it appears in this prompt.

Pipeline: parse and validate → structured draft → deterministic reference checks → model support review → at most one repair/review cycle → atomic save. Draft at most four chapters, 40 claims, and two initial plus two recovery checks per chapter. Keep user video local; send transcript text only, with a clear notice beside Generate.

Use structured output with our cue-reference schema, not incompatible native citation features. Model review is not ground truth. Transcript instructions are untrusted source content, never application commands.

One concurrent job, at most four model requests including retries, maximum 60,000 input and 16,000 output tokens across the run, timeout and cancellation. Preflight each request against the remaining cap. Persist actual usage and run metadata, not secrets or raw provider logs. Stages correspond to real completed work; no artificial compose animation claiming analysis that never happened.

Use existing server-side credentials only. Never put keys in the browser, buy credits, or change accounts. With no credential/model access, complete the sample, adapter, tests, and truthful unavailable state; report live generation as pending. Never present fixture output as new generation.

Bind the event app to loopback and validate generation request origin/host. Public paid generation and deployment are outside this local execution goal. Do not publish or send messages.

## Practice and persistence

Every wrong choice maps to a specific misconception and source passage. Rewind opens the actual source interval. After restudy, ask a different question about the same concept. Save the initial answer, passage opened, and recovery answer. Display these observations without claiming mastery or proven learning gain.

Persist documents, attempts, and eligible media blobs in IndexedDB. Recreate object URLs after reload. Handle storage quota/eviction with a truthful reconnect flow; match media fingerprints rather than attaching an unrelated file. Saved metadata must not imply unavailable video is present.

## Exports

Ship `manuscript.md`, `reading-copy.html`, `citations.csv`, and portable project JSON. Preserve source references and review status. JSON excludes the video and tells users to reconnect it. HTML is HTML, not a renamed DOC. Browser print can have book-like margins and typography but is not sold as publisher-ready pagination.

Escape imported/generated text, neutralize CSV formula injection, validate reimported JSON, and reopen every exported format during verification.

## Verification and completion

Create and run lint, typecheck, unit/integration tests, production build, and browser tests. Prioritize meaningful failure cases and the complete core journey.

Required observed checks:

1. Sample opens and works without model/network access, using actual media and local assets.
2. Claim click seeks the real media element within one second of target; playback advances and clip-end handling works; the clip actually supports the claim.
3. Wrong answer → relevant clip → different question → saved recovery trail works.
4. A new timed transcript produces a distinct companion through the real pipeline when configured. No reused seed disguised as generation.
5. Untimed text has no invented times; absent media/captions and provider failures are explicit.
6. Refresh restores sample and imported project; quota failure and media reconnection are tested.
7. Source replacement invalidates old references/checks.
8. Exports open and retain evidence and uncertainty labels.
9. Keyboard and mobile journeys work at 390px and 1280px.
10. Three permitted evaluation sources across two topics, including one held out from prompt tuning, are assessed; inspect at least 30 claims total or every claim if fewer. Report actual counts, method, and failures. Target at least 90% supported claims on this small corpus; unsupported claims must be marked or withheld.

Audit every sample claim/check. Add adversarial tests for missing references, later source corrections, quoted wrong answers, source injection, missing visual context, cancellation, storage failure, and budget exhaustion. No “passed” without an observed check.

Produce README with exact install/run commands, DEMO with observed pass/fail/pending checks and a 90-second script, an evaluation report, sample provenance, example exports, and actual build/model usage notes. Human learner sessions are desirable but cannot be fabricated; say if none occurred.

Targets to measure: sample usable in two seconds on the event laptop and short-source generation within 90 seconds. If unavailable or slower, report that honestly. Preserve the reliable prepared demonstration.

Defer YouTube, 3D, teach-back scoring, broad publishing features, and all other stretch work until the complete loop passes. Keep building and fixing within scope. Finish by reporting what works, fresh verification, how to run it, and any real remaining external dependency. Do not label the whole product complete if live generation or core evidence is still unverified.
