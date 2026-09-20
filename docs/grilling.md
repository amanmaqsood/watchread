# WatchRead design interview

Status: planning decisions resolved on 2026-09-20 under the user's instruction, “rest go with your picks.” The original prompt remains preserved. No application implementation has started. The initial tree below is retained as interview history and is superseded by the resolution table at the end.

## Settled from the request and prompt

- Work in `/Users/ashish/watchread`.
- Review WatchRead as a potential hackathon submission.
- Use grilling and domain modeling, recording terminology and consequential decisions.
- Produce an implementation plan after the interview resolves its dependencies.
- Preserve the central companion-book, source-navigation, and chapter-check concept while testing its assumptions.

No strategic or architectural recommendation below is accepted merely because it is recommended.

## Design tree

1. Competition identity and official rules: unresolved factual prerequisite; focused public verification found multiple distinct events and cannot identify the intended one.
   - Deadline and submission assets.
   - Judging criteria and required Codex/model usage.
   - Existing-work eligibility and disclosure.
2. Primary audience and job: decision open now.
   - Learner success measure and evaluation participants.
   - Representative recording, lesson complexity, and demo story.
   - Necessary exports versus optional publishing features.
3. Real product contract: decision open now.
   - Prepared-book editor, extractive companion, or model-generated companion.
   - Whether runtime model use and a bounded budget are allowed.
   - Transcript acquisition, timing, and missing-source behavior.
   - Citation semantics, unsupported content, and evaluation gates.
4. Relationship to VidBook: decision open now; eligibility depends on branch 1.
   - Fresh implementation versus specific reused assets/code.
   - Evidence of the claimed prior work and new contribution.
5. Implementation design: depends on branches 1–4.
   - Asset persistence, document revisions, and citation invalidation.
   - Processing architecture, failure states, and cost controls if applicable.
   - Accessibility, player behavior, export formats, and deployment surface.
6. Execution plan and revised goal: depends on settled scope and architecture.
   - Milestones with dependencies, deliverables, and acceptance criteria.
   - Tests, unfamiliar-input evaluation, demo rehearsal, and submission evidence.

## Current independent decision frontier

- Which official competition or participant brief is the intended target? The prompt and conversation name different events, and public search does not disambiguate them.
- Who is the primary user for the submitted version, and what one task must improve?
- May the product generate companions from new transcripts using a real model, while preserving a prepared sample that needs no key, or must all runtime use remain model-free?
- Should WatchRead be newly implemented, or is reuse of specific VidBook work intended?

Competition identity needs an official link or participant brief from the user because focused public research could not resolve it. Technical details downstream of these decisions belong in later rounds.

## Documentation contract

`CONTEXT.md` contains the stable project vocabulary. Contested terms such as “proof,” “grounded,” and “confidence” remain unresolved here rather than being silently canonized. ADRs will be added only for consequential decisions with real alternatives after agreement. The final implementation plan and revised goal are pending the interview; they are not yet approved or executable.

## Resolution after the user's response

The user identified an offline Fable 5.1 event, asked us to stop investigating its host, requested comparison with past Claude/Codex winners, and accepted the remaining recommendations. This resolves the interview through delegated judgment without another confirmation round. No official rubric, event eligibility, or winning probability is claimed.

| Branch / challenge | Selected decision | Reason and authority |
| --- | --- | --- |
| Audience | Students revising difficult lectures. | User accepted the recommendation. |
| Product contract | Real generation from new transcripts plus a prepared sample that requires no API key. | User accepted this change to the original model-free restriction. |
| Prior work | Fresh implementation informed by VidBook; disclose any actual reused assets. | User accepted the recommendation. No prior-winner claim is needed in the pitch. |
| Meaning of offline | In-person event; local sample works disconnected, new generation needs a model connection. | Working interpretation, not a claim about venue connectivity. |
| Differentiation | Wrong answer → specific misunderstanding → source clip → different recovery question → recorded recovery trail. | Complete learning task rather than another summary generator. |
| Evidence meaning | Source attribution and reviewed support, not universal factual correctness. | A lecturer may be wrong. Rename Proof to Sources; remove confidence theater. |
| Unsupported or contradictory source | Needs-review content, with dependent graded checks withheld. | Never turn a timestamp or keyword match into proof. |
| Sample | Original 6–8 minute photosynthesis microlecture, about three chapters; owned recording if available, otherwise actual narrated slides labeled synthetic narration. | Short real media instead of a fictional 38-minute lecturer. Asset creation remains a build task. |
| Imports | MP4/WebM + VTT/SRT is the complete source-playback path. Untimed TXT gets text references. Video alone awaits a transcript. | No fabricated timestamps; transcription and frame understanding deferred. |
| Persistence | IndexedDB for documents and eligible media, explicit reconnect on quota failure or eviction. | Durable object URLs are not a persistence mechanism. |
| Editing | Chapter title/order editing only; transcript changes create a revision and invalidate dependent evidence/checks. | Rich prose edits would require much broader citation invalidation. |
| Runtime model | Server-side Claude adapter, configured available model ID; Fable 5.1 if exposed by the user's account. | Never invent an API ID or silently substitute models. |
| Budget and access | Bounded jobs using an existing credential; no purchases or account changes. | Missing access leaves live validation pending while sample work proceeds. |
| Deployment | Local event build first; public paid generation deferred. | Avoid accounts and an uncontrolled spend endpoint. |
| Exports | Markdown, honest HTML, citations CSV, portable project JSON; browser-print reading copy. | No renamed fake DOC or unverified publishing claims. |
| Evaluation | Source/playback tests, unfamiliar inputs, adversarial cases, real user observations if available. | Agent checks cannot stand in for learning outcomes or user feedback. |
| Scope cuts | Defer 3D, scraping, teach-back scoring, and publishing extras. | Protect the generation and recovery loop. |

Edge cases resolved: a source quoting a wrong answer is not support for that answer; a later correction must be considered; valid JSON can be semantically wrong; an absent recording cannot become a simulated player; a recovery check must differ from the original question; a correct retry is an observed answer, not proof of lasting learning.

The decision frontier is closed for planning. Implementation details and gates are in `implementation-plan.md`, consequential trade-offs in `adr/`, and the revised runnable instruction in `../goal.md`. The original prompt is preserved for comparison. No `/goal` has been started in this review session.
