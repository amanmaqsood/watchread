# WatchRead prompt review

Status: initial review preserved, 2026-09-20. The user subsequently clarified an offline Fable 5.1 event and accepted the recommended direction; see `grilling.md`, `implementation-plan.md`, and `../goal.md` for the resolved contract. This is not an official judging rubric or an instruction to start implementation.

## Verdict

The core journey is understandable and worth testing: read a passage, inspect its source, answer a question, and revisit the relevant recording. The current prompt is stronger at specifying presentation than at specifying a working transformation of a new recording. It is not ready to run unchanged as the build goal.

The central judge challenge is: “I brought a different lecture. Can your app make a useful companion and show that its citations actually support what it wrote?” The prompt currently does not define a credible answer.

## Findings

| Priority | Prompt reference | Finding | Recommended change |
| --- | --- | --- | --- |
| Critical | line 8 | The prompt names a Claude Fable 5.1 buildathon; the current request names a Codex Astra 6 hackathon. Rules, deadline, required technology, and reuse eligibility are not established. | Identify the exact official event before choosing the submission contract. Keep any provisional judging framework explicitly unofficial. |
| Critical | lines 24, 47–51, 109 | Real runtime generation is forbidden, but arbitrary uploads are supposed to become books and quizzes. No extractive or generative composition algorithm is specified. Animated stages cannot supply that missing capability. | Decide whether the entry is an editor for prepared companions, an extractive transcript tool, or a generator. Specify actual processing and display stages from real work. |
| Critical | lines 40–45, 59 | A fake player can satisfy the required demo while no recording exists behind the claimed proof. A realistic fictional lecturer and owner label do not establish provenance. | Use a real owned or licensed recording with matched transcript. Clearly label any illustrative fixture. A missing source must display as unavailable. |
| Critical | lines 67–75, 124–125 | The promise is sentence-level evidence, but the model only attaches citations to paragraphs. Having a citation ID does not establish that a sentence is supported. | Define claim or sentence spans and source relationships; distinguish exact quotation, paraphrase, inference, and unsupported content. Validate references separately from semantic support. |
| High | lines 14, 68, 137–140 | “Prove every page,” confidence, and source-grounded percentage have no operational definition. A source may itself be wrong. | Distinguish source attribution from factual truth. Define the coverage denominator and review method; omit arbitrary confidence numbers. Consider “A book that takes you back to the source.” |
| High | lines 17, 49, 201 | Refresh checks cover the seed, not an uploaded recording. The prompt lacks an asset retention and reconnection contract. | Specify what survives reload, what is stored locally, and how a user reconnects unavailable media. Select implementation after the persistence decision. |
| High | lines 48–51 | Plain text has no reliable timestamps, and video without captions has no transcript. Invented text cannot become evidence for the upload. | Support explicit untimed transcript and awaiting-transcript states. Require real alignment before enabling timestamp claims. |
| High | lines 69, 131–135 | Keyword scoring can reward copied terms and miss an otherwise correct explanation. It cannot establish learning or mastery. | Use evidence-backed fixed-answer checks first; label any teach-back feedback as a limited heuristic or defer it. |
| High | line 8 | “Previously won” and the relationship to VidBook are assertions in the prompt, not independently verified submission evidence. | Document what pre-exists, what will be newly built, and what the event permits. Verify public claims before putting them in the pitch. |
| Medium | lines 142–153 | Print preview, pagination, and a renamed HTML file can overpromise publishing readiness. | Ship accurately named formats; validate the exported artifact itself. Treat print-ready pagination as a separately verified capability. |
| Medium | lines 186–205 | A changed timecode is sufficient to pass today, even if no real media plays. No unseen-input, evidence-integrity, or uploaded-source reload checks exist. | Require actual media seek/playback, correct source support, unfamiliar transcript import, missing-source handling, and exported citation integrity. |
| Medium | lines 207–215 | Landing and library are built before the riskiest product mechanism. | Prove one real import → companion → source playback → restudy loop before broad navigation and visual polish. |

## What to preserve

- The calm publishing aesthetic and restrained reader layout.
- A one-click connection between reading and the relevant source interval.
- Wrong-answer recovery that returns to the source.
- A dependable sample path and no mandatory sign-in.
- YouTube as secondary rather than a prerequisite.
- Explicit manual verification before marking demo checks passed.

## Provisional judging lens

Until the actual rubric is verified, assess usefulness for one audience, differentiation from available study tools, technical credibility, observable results, reliability, and clarity of the short demo. These are mentoring criteria, not claimed official criteria. No defensible winning probability or global rank can be inferred from this prompt.

## Candidate demonstration

Recommendation only: use a short real lecture with an easily misunderstood concept. Show a readable explanation, play its supporting source interval, answer a check incorrectly, and recover through a targeted restudy clip. Also show that an unsupported claim is visibly unresolved. Validate the pipeline on a second transcript not used to hand-author the sample.

Choose the exact audience and generation contract before writing the final pitch or expanding the feature list.

## Public evidence checked on 2026-09-20

- [OpenAI Developers' Singapore Astra hackathon](https://luma.com/fdzbrq5b) describes a September 13 event with teams of two, five hours of building, a deployed prototype, and a 90-second video explaining Astra use. Registration is closed. This has not been identified as the user's event.
- [Product Hunt's GPT-6 Astra Challenge](https://www.producthunt.com/contests/gpt-6-astra-challenge) displays September 18, 2026 and prizes for the top five launches. This has not been identified as the user's event either. Both listed dates precede this review date; no future deadline should be inferred from them.
- [Google's NotebookLM announcement](https://blog.google/innovation-and-ai/products/notebooklm-audio-video-sources/) documents YouTube imports, key-concept summaries, citations to video transcripts, an embedded video player, and study-guide generation. This establishes feature overlap, not a tested head-to-head result or evidence about exact timestamp-seeking behavior.

At the initial review, the precise competition and requirements were unresolved. The user then clarified an offline Fable 5.1 event and explicitly directed us not to pursue its host. That factual search is closed; these other events are not constraints on WatchRead. The plan uses product-quality benchmarks and makes no official compliance claim.
