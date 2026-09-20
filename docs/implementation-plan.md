# WatchRead implementation plan

Planning completed: 2026-09-20. Planning snapshot: written before implementation. The built application, final checks, and documented implementation decisions are recorded in `docs/verification.md` and `docs/adr/0004-local-model-runtime.md` through `0005-embedded-evidence-model.md`. The user accepted the recommendations and delegated remaining decisions. This plan precedes execution of the goal; it does not assume an event deadline or official rubric.

## 1. Product contract

**Pitch:** WatchRead turns a lecture into a readable companion that takes you back to the explanation when you get something wrong.

**Audience:** students revising concept-heavy lectures. **Primary job:** find and understand the source explanation behind a misunderstanding without searching the entire recording again.

The signature sequence is: read a supported claim → answer a chapter question → select a plausible wrong answer → see the specific misunderstanding → play the relevant clip → answer a different question → see the recovery trail. This is a product hypothesis, not an established learning-effect claim.

The complete version must process a new supported transcript. A prepared sample alone does not satisfy the contract. An offline event means an in-person event here; prepared sample playback works disconnected on the local app, while new model generation requires connectivity.

## 2. Scope

| Must ship                                            | Stretch after core gates pass          | Deferred                                     |
| ---------------------------------------------------- | -------------------------------------- | -------------------------------------------- |
| Actual sample recording and matched timed transcript | YouTube embed with supplied transcript | Caption scraping and automatic transcription |
| Readable three-chapter prepared sample               | CSS cover microinteraction             | WebGL and 3D reader                          |
| MP4/WebM + VTT/SRT import; explicit untimed TXT mode | Command palette                        | Chat, accounts, billing, collaboration       |
| Real generated companion and checks                  | Extra sample topics                    | Video-frame understanding                    |
| Claim-level references and needs-review state        | EPUB / genuine DOCX                    | Fake DOC and publisher-ready claims          |
| Misconception-specific restudy and recovery question | Higher lecture limits after evaluation | Keyword-based mastery scoring                |
| Reload-safe documents and media recovery             | Public sample-only deployment          | Unauthenticated public paid generation       |
| Title/reorder editing and source invalidation        | Rich text editing                      | Full publishing studio                       |
| Markdown, HTML, citations CSV, project JSON          | Expanded review tools                  | Complex agent orchestration                  |

Keep Next.js App Router, TypeScript, Tailwind, npm, Lucide, and optional restrained Motion. Preserve warm paper `#F4EFE4`, ink `#1C1915`, moss `#2F4F3E`, and caution `#C4842A`. Caution labels need readable dark text and an icon or word, not color alone. Bundle fonts or use good local fallbacks so the local demonstration has no font-network dependency.

## 3. Data contract

| Entity            | Required fields and meaning                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project           | ID, title, source type, declared rights/attribution, schema version, current source/document revisions, timestamps, processing state.                                                   |
| SourceRevision    | Immutable transcript hash, parser version, original filename, timing kind, normalized cues. Media association stores actual duration, content fingerprint, MIME type, and availability. |
| Cue               | Stable ID within the revision, original text, nullable start/end, optional speaker. No invented timing.                                                                                 |
| Claim             | ID, chapter ID, displayed text, kind `quotation/paraphrase/inference`, evidence references, review status/reason, content hash. Sentence-sized claims group into readable paragraphs.   |
| EvidenceReference | Source revision, cue IDs, optional text offsets per cue. Code resolves exact quotations and timing; noncontiguous passages remain separate references.                                  |
| SupportReview     | Claim/evidence hashes, reviewer kind `model/human`, result `supported/needs_review/contradicted`, concise reason. No calibrated-confidence claim.                                       |
| Chapter           | Stable ID, title, goal, order, claim IDs and summary claim IDs. Factual summaries follow the same evidence rules.                                                                       |
| Check             | Concept ID, question, choices, correct choice ID, supporting claims/passages, wrong-choice misconception mapping, recovery check ID.                                                    |
| Attempt           | Check revision, chosen answer, timestamp, restudy references opened, recovery answer. Opening a clip does not imply understanding.                                                      |
| GenerationRun     | Input hash, prompt/schema version, actual provider/model, stages, usage when available, status/error. No secrets or raw provider logs.                                                  |

IndexedDB owns saved documents, attempts, and eligible media blobs. Recreate and revoke object URLs in the player lifecycle; never persist them as durable source locations. localStorage is only for small preferences. See MDN's [file/blob support](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) and [quota/eviction behavior](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

Initial limits to verify in implementation: one recording, 30 minutes, 150 MB media, 1 MB transcript, 1,200 cues, and 12,000 normalized model-input tokens. Reject over-limit inputs with an explanation; never silently truncate. Video-only imports remain drafts awaiting transcript. Untimed text can generate text-linked content but no timestamp navigation. User-supplied transcript/media alignment is declared by the user, not automatically proven; the sample's timing is manually checked.

## 4. Real processing pipeline

1. Parse locally, preserve wording, detect malformed/negative/reversed times, and assign stable cue IDs. Preserve legitimate overlapping captions; deduplicate only exact duplicates under a documented rule.
2. Validate transcript limits and loaded media duration; flag cues outside its bounds. Content relying on unseen slides stays needs review.
3. On Generate, send transcript text and cue IDs to the server adapter. Say beside the button that text goes to the configured model and video remains on the device.
4. Generate a structured draft: 2–4 chapters, at most 40 claims, up to two initial and two recovery checks per chapter. The model selects source references, not authoritative quotations, URLs, or timestamps.
5. Validate schema, IDs, revisions, spans, answer structure, and limits deterministically. Resolve source quotations/times in code. Render content as escaped text.
6. Review source support in a separate model pass with actual passages and relevant surrounding context, including later corrections. Label this as model review; a second pass is not independent ground truth.
7. Allow one repair cycle followed by validation and rereview. At most four model requests total: draft, review, optional repair, optional review. No endless retries or fallback to fabricated sample output.
8. Publish atomically. Unresolved content is visibly needs review. Enable graded checks only when the correct answer, explanation, and recovery mapping are supported. Failed regeneration preserves the last valid companion.

Claude is the first provider. Verify the configured model is available to the account; never invent a Fable API identifier or silently substitute another model. Use current SDK structured outputs plus application validation. [Claude's structured-output documentation](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) notes incompatibility with native citation blocks, so use WatchRead's cue-reference schema rather than enabling both features.

Use a server-only credential, one concurrent job, cancellation, timeouts, and a bounded token budget. Default ceiling: 60,000 input tokens and 16,000 output tokens across all calls, checking remaining allowance before every request. SDK retries must be disabled or included in the four-request cap. Record actual usage; these limits are not a monetary guarantee. No purchase of credits or account changes. Missing credentials must leave live generation visibly unavailable while all sample work proceeds.

The local app binds to loopback and validates generation request origin/host. Public paid generation is deferred pending an access and budget design. Public sample-only builds must disable generation server-side.

## 5. Reader and recovery experience

Primary navigation: Read, Practice, Sources, Export. Outline editing and print preview are panels. Open sample enters the reading room immediately; a prepared project should not pretend to undergo live generation.

Desktop: approximately 40% player/transcript and 60% book. Mobile: full-width book with compact source controls opening an accessible player sheet. Source chips show timestamps when available; otherwise “Transcript passage.” Needs-review content has an explicit label.

Citation activation selects the passage, waits for media metadata if necessary, seeks the actual media element, highlights cues, and preserves book scroll. A user-initiated Play clip plays the interval and stops at its end. Handle autoplay rejection and missing media honestly. Provide visible focus, reduced motion, screen-reader labels, and shortcuts that never intercept typing in fields.

Practice presents one check at a time. Wrong options lead to a specific explanation, supporting source interval, and a different question about the same concept. Record before/after answers without claiming mastery or durable learning gain.

Sources displays exact excerpts, revision, timing availability, and review status. If showing coverage, use `factual claims with valid references / all factual claims`, including summary claims and excluding headings/UI copy. Call it citation coverage and show semantic-review counts separately. Never call it a truth score.

Title/order edits preserve evidence. Transcript replacement creates a new source revision and marks dependent references/checks stale. Keep the previous companion recoverable. Media reconnect must match the saved fingerprint; a different recording requires a new association and timing review.

## 6. Sample and evaluation material

Create an original 6–8 minute photosynthesis microlecture with three chapters: where plant material comes from; roles of water/carbon dioxide; light reactions and carbon fixation. Include plausible distractors, such as confusing the source of released oxygen. Check scientific statements against authoritative teaching sources such as [OpenStax](https://openstax.org/books/biology/pages/8-2-the-light-dependent-reactions-of-photosynthesis). Write original prose and attribute adaptations.

Use an already available owned recording if possible; otherwise produce real narrated slides, explicitly labeled synthetic narration. Do not impersonate a fictional professor or claim this is a captured human lecture. Derive timings from produced audio, then inspect alignment. Preserve a provenance manifest: script, media/transcript hashes, narration origin, attribution, generation run, and review status.

Create the prepared companion through the live pipeline when access exists, then review every claim/check. If initially hand-authored, disclose that and do not count it as generation evaluation. An unsupported-claim demonstration must be a labeled test case, not a false statement quietly inserted into the lesson.

Maintain three permitted small evaluation sources across at least two topics, with one held out from prompt tuning. Adversarial cases: nonexistent cue, unsupported paraphrase, later correction, quoted wrong answer, missing visual context, untimed text, malformed timestamps, source replacement, absent media, quota failure, model cancellation, and instruction-like transcript text.

## 7. Modules and responsibilities

```text
app/                         landing, library, new, project routes
app/api/generate/route.ts     bounded local generation entry point
components/reader/           book, transcript, player, source selection
components/practice/         question, restudy, recovery trail
lib/domain/                  schemas, references, revisions, invariants
lib/import/                  VTT/SRT/TXT parsing and validation
lib/generation/              Claude adapter, prompts, review, budget
lib/storage/                 IndexedDB repository and migrations
lib/export/                  Markdown, HTML, CSV, portable JSON
content/sample/              script, transcript, companion, provenance
public/sample/               actual media and poster
tests/                       unit/integration/browser cases
evals/                       fixtures and scored review records
```

Keep player operations, source resolution, generation, storage, and exports behind small independent interfaces. UI code cannot invent evidence or alter source timing. No multi-agent product dashboard is needed.

## 8. Milestones and dependencies

Effort shares guide sequencing, not a promised calendar. A deadline can later be attached without reopening product decisions.

| Milestone               | Share | Deliverables                                                         | Exit gate                                                               |
| ----------------------- | ----- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| M0: scaffold and source | 10%   | App, scripts, environment example, sample media/provenance, schemas  | Real recording plays with matched transcript.                           |
| M1: source loop         | 15%   | Reader, parser, evidence resolver, player, first claim               | Claim opens correct actual media interval on desktop/mobile.            |
| M2: durable import      | 10%   | IndexedDB, import states, revisions, reconnect                       | New source reloads; untimed and invalid inputs behave honestly.         |
| M3: composition         | 20%   | Model adapter, bounded pipeline, review, cancellation                | Held-out source yields its own companion; failures preserve prior work. |
| M4: recovery            | 15%   | Checks, misconception mappings, clips, new questions, attempt record | Complete wrong-answer → clip → different-question journey.              |
| M5: companion tools     | 10%   | Sources, outline, exports, print                                     | Exports reopen with references; changed sources invalidate evidence.    |
| M6: design/access       | 10%   | Publishing style, responsive layout, focus/contrast/motion           | Core tasks work at 390px and 1280px.                                    |
| M7: evaluation/demo     | 10%   | Evaluation report, browser evidence, README, DEMO, script            | Critical checks pass with observed evidence or are explicitly blocked.  |

M1 precedes landing polish. M2–M3 establish new-input behavior before extra routes. M4 depends on valid support. No stretch work before M7 passes.

## 9. Verification and quality gates

Create and run install, lint, typecheck, focused test, production-build, and browser-test scripts. Rehearse against the built app.

- **Integrity:** zero nonexistent cue references, invented time intervals, or stale references shown as current. Adversarial fixtures must expose each violation.
- **Sample support:** manually inspect all sample claims and correct/wrong/recovery explanations. No known unsupported content in the default graded flow.
- **Held-out support:** inspect at least 30 generated claims across the three sources, or every claim if fewer exist. Record supported/partial/unsupported counts and reviewer method. Target at least 90% fully supported on this limited corpus, with every identified unsupported claim withheld or visibly marked. This is a target, not an achieved result or general accuracy claim.
- **Actual playback:** assert media `currentTime` within one second of the requested point after seeking; observe playing and advancing time, then clip-end behavior. Listen/watch manually to confirm the explanation matches.
- **Failure states:** missing credentials, cancellation, timeout, schema failure, and budget exhaustion never become successful compose states. Preserve the previous valid document.
- **Persistence:** reload the sample and uploaded media; exercise quota failure and reconnect; retain hashes and attempts.
- **Exports:** reopen all artifacts and compare citations/status. Escape HTML, neutralize formula-leading CSV cells, validate JSON imports. Portable project JSON excludes the video and states it must be reattached.
- **Accessibility:** keyboard-only core loop, focus restoration after the player sheet, input-safe shortcuts, readable feedback, and reduced motion.
- **Performance targets:** sample usable within two seconds on the event laptop; short-source generation within 90 seconds. Measure actuals; truthful progress must handle slower runs.
- **Human observation:** aim for three consenting learners performing the recovery task. Note task completion, clip-search time, confusion, and retry errors. If comparing ordinary video/transcript navigation, vary order where feasible. Without participants, report no human validation; agent tests are not user studies.

If the held-out source fails, media is unavailable, or recovery mappings are unsupported, fix the core before polishing. Repeated semantic failure means reduce generation scope and reevaluate, not hide failures behind the sample.

## 10. Demo and delivery

| Time   | Action                                                                       |
| ------ | ---------------------------------------------------------------------------- |
| 0–10s  | State the learner problem and open the prepared sample.                      |
| 10–25s | Read a passage and play its actual source interval.                          |
| 25–55s | Choose a plausible wrong answer, review its clip, try the recovery question. |
| 55–70s | Show the recorded recovery trail and source status.                          |
| 70–80s | Open a second generated companion with its real run details.                 |
| 80–90s | Export and state the actual contributions of the event tools.                |

The second companion can be precomputed, but say so; offer live generation separately when connected. The 90-second script is a presentation choice, not a claimed event requirement.

Deliver a functioning local app, `README.md`, `DEMO.md` with observed passes only, `evals/report.md`, sample provenance, secret-free run records, example exports, and a concise note on actual coding/model use. Missing runtime access or human evaluation remains explicitly pending. No winning-odds claim or unverified compliance statement.

Execute `goal.md` next, not the contradictory original `prompt.md`.
