> For the public deployment, simple explanation, 90-second script, judge questions, and live testing steps, use [PRESENTATION.md](PRESENTATION.md). Public URL: https://watchread.vercel.app. New AI generation remains local; see [DEPLOYMENT.md](DEPLOYMENT.md).

# WatchRead event demo

**Pitch:** A lecture you can read. An explanation you can return to.

## Before presenting

1. Run `npm run build && npm start` in this directory. Open **http://127.0.0.1:3000** in Google Chrome at 100% zoom. Keep this hostname; browser storage is origin-specific.
2. Open the prepared sample. Check that the video plays and the laptop's speaker volume is suitable. The sample and fonts work without an external network connection once the local server is running.
3. In Practice, choose **Start again** if a previous rehearsal already has an answer. Choose chapter 1. Do not clear the whole browser or delete other projects to reset the presentation.
4. Restore `examples/heat-project.json` through **New companion → Restore an exported project**. It is a text-only companion from a recorded Fable 5.1 run. Open its Sources screen in a second tab.
5. For a live generation follow-up, keep the existing Claude CLI signed in and the server restarted after any session change. Confirm `/api/status` says available. This is not required for the prepared 90-second presentation.
6. Keep `examples/reading-copy.html` and the source index available as portable fallback artifacts. They are real exports, not screenshots of functionality.

## 90-second script

| Time    | Action                                                                               | Say                                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 - 10 s  | Home → Open the sample                                                               | "Recorded lectures are easy to collect and hard to return to. WatchRead gives a difficult explanation a second life as a readable companion."                                                      |
| 10 - 25 s | Read the opening paragraph. Click the second source chip and let a few seconds play. | "Each factual passage keeps its source. This chip seeks the actual recording. The quote and time come from the transcript, not an invented citation."                                              |
| 25 - 42 s | Practice → choose **Minerals absorbed from the soil**                                | "Here is a plausible mistake. The response explains this particular misunderstanding: roots supply water and minerals, while the carbon mainly comes from the air."                                |
| 42 - 57 s | **Revisit the explanation**, play briefly, then **Try a different question**         | "The mistake leads back to its explanation, followed by a different question about the same idea."                                                                                                 |
| 57 - 67 s | Choose **Carbon atoms taken in as carbon dioxide**; show recovery trail              | "We record the first answer, the source opened, and the new answer. This is an observed recovery trail - not a claim that one click proves mastery."                                                 |
| 67 - 78 s | Switch to the prepared heat companion's Sources tab                                  | "This is a second real Fable 5.1 run on another subject. We also evaluated a held-out probability topic. New generation is real; these presentation examples are prepared."                        |
| 78 - 90 s | Export → Preview or download Markdown                                                | "Fable 5.1 composed and reviewed these companions. You can take the book and its sources with you, and return to the explanation when a question trips you up." |

Pause or mute the first tab's video before speaking over the second topic. Native video controls remain available throughout.

## Live follow-up

Use **New companion**, upload a short VTT/SRT/TXT source, optionally add its original video, and compose. Untimed text remains untimed. The observed browser run used the first five actual cues of the sample recording and produced a distinct 11-claim companion in **59.648 seconds** of model pipeline time (**61.216 seconds** including browser import, reload, and playback checks). A full 16-cue source also completed in **75.081 seconds** through the same pipeline outside the browser. These are observations, not guaranteed response times.

The real adversarial run needed all four allowed calls and took **91.848 seconds**. It withheld unresolved questions and marked missing visual context. A previous live attempt timed out during an authentication interruption; the source stayed saved. If fresh generation is unavailable at the venue, say so and use the clearly labeled prepared edition. Do not imply that prepared content was generated live.

## Observed verification

- Actual H.264/AAC video, matching VTT, source seeking within one second, advancing playback, and clip-end stopping.
- Wrong answer → source → different recovery question → saved attempt trail after reload.
- Real Fable 5.1 browser import/generation; imported media persisted as a Blob and played after reload.
- Real cancellation preserved the source and released the endpoint's active job.
- VTT/SRT/TXT parsing, untimed references, video-only drafts, schema/ref errors, source revisions, budget limits, and omitted review records.
- Project restore and original-media reconnection; mismatched files rejected; media quota failure leaves text usable; the sample remains usable without browser storage.
- All four exports reopened; HTML escapes source text and CSV neutralizes formula-leading content.
- Desktop and 390px mobile source flows, focus trap/restore, input-safe shortcuts, and no horizontal overflow.
- Automated axe scans: zero violations for WCAG 2 A/AA and 2.1 AA across seven routes at both widths plus feedback/player states. This is not a full manual accessibility audit.
- Production sample readiness measured at 548 ms, 225 ms, and 196 ms in fresh Chrome contexts on this laptop with the local server already running.

See [verification](docs/verification.md), [evaluation report](evals/REPORT.md), and [screenshots](docs/evidence/) for evidence and current counts.

## Answers a judge may ask for

**Why more than a summarizer?** The distinctive behavior is the source-linked recovery loop and the preserved evidence, revision, and attempt history. Its educational effectiveness is still a hypothesis to test with learners.

**Can it hallucinate?** Yes. Structural checks prevent nonexistent IDs and invented timestamps, but semantic support review can miss wording errors. One such miss in the prepared sample was corrected and disclosed. Unsupported or stale content is labeled and dependent checks are withheld.

**What runs offline?** The local prepared sample, player, reader, practice, storage, outline, and exports. Fresh generation needs connectivity and model access.

**What was actually built with AI?** Codex implemented and tested the application. Real Fable 5.1 calls generated and reviewed the saved companions. Sample narration uses macOS Samantha. The public demo is on Vercel. No human lecturer or learner outcome is claimed.

**What is not done?** Human learner validation, live API-key adapter verification, long-lecture evaluation, and the deliberately deferred features listed in the implementation plan. No benchmark result establishes winning odds.
