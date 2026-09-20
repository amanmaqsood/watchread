> September 20, 2026 deployment update: WatchRead is now public at https://watchread.vercel.app. This record below describes the earlier local build. See [DEPLOYMENT.md](../DEPLOYMENT.md) for current hosted capabilities and cloud generation limits, and `docs/evidence/public-browser-tests.txt` for the hosted verification run.

# Final verification record

Date: 2026-09-20. Local production app: **http://127.0.0.1:3000**. The server is bound to loopback. This record concerns the agreed local event scope in `goal.md`; it does not claim a public release or universal correctness.

## Fresh checks

| Gate                     | Observed result                                                                              | Evidence                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Lint                     | Passed                                                                                       | `npm run lint`                                                                |
| TypeScript               | Passed                                                                                       | `npm run typecheck` and production build's type check                         |
| Unit/integration         | **27 passed** across three files                                                             | `tests/unit/`                                                                 |
| Production build         | Passed                                                                                       | `docs/evidence/production-build.txt`                                          |
| Standard browser suite   | **11 passed**, two live tests deliberately skipped                                           | `docs/evidence/browser-tests.txt`                                             |
| Opt-in live composition  | Passed separately, 59.648 s pipeline time                                                    | `evals/browser/live-import.json`, `docs/evidence/live-generation-test.txt`    |
| Opt-in live cancellation | Passed separately                                                                            | `evals/browser/cancellation.json`, `docs/evidence/live-cancellation-test.txt` |
| Accessibility/layout     | **16 states**, zero automated violations, no tested route overflow                           | `docs/evidence/accessibility.json`                                            |
| Sample readiness         | **548 / 225 / 196 ms** in three fresh Chrome contexts                                        | `docs/evidence/performance.json`                                              |
| Final model availability | Existing authenticated local CLI available; configured and observed model `claude-fable-5-1` | `/api/status` and successful run records                                      |

The two live tests are opt-in to avoid silently consuming provider usage in ordinary test runs. They are not missing implementations. Their successful runs are retained separately from the latest standard browser report. Later final changes concerned presentation, canonical source restore, and the evidence index; the real pipeline and cancellation behavior were exercised in production.

## Requirement-by-requirement audit

| Agreed requirement                                        | Current implementation and direct evidence                                                                                                                                                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A coherent local Next.js application with the seven views | Production route table; seven routes exercised at 1280px and 390px. Project root redirects to Read.                                                                                                                                                     |
| Real 6–8 minute original lecture, honest origin           | Actual 447.246-second H.264/AAC recording; 16 timed cues; synthetic narration disclosed in UI/provenance; original script and reference links retained.                                                                                                 |
| Source selection uses real media                          | Browser observes actual `currentTime` within one second of the selected cue, advancing playback, and stopping at cue end. Multiple passages remain separate; later cues scroll into view.                                                               |
| New source import                                         | Real browser timed video/transcript import; VTT/SRT/TXT parser checks; video-only draft and untimed saved draft observed after reload.                                                                                                                  |
| Real live composition                                     | Distinct 11-claim companion from a newly imported five-cue timed excerpt; actual returned Fable 5.1 ID; source and video persisted and played after reload. Three additional complete-source evaluations and a real adversarial run retained.           |
| No false evidence                                         | Structural tests reject nonexistent IDs, fabricated quotations, invalid timing, bad answer structure, and reused recovery wording. All displayed time/source excerpts are resolved from cues.                                                           |
| Coverage includes factual content                         | Chapter claims **and glossary definitions** appear in Sources and citation CSV. The prepared sample has 17 referenced factual units (14 chapter claims + 3 definitions). Semantic support is shown separately from citation coverage.                   |
| Semantic review and unresolved content                    | Separate model review, bounded repair; omitted/unsupported records require review; dependent checks withheld. Real adversarial run marks missing visual context and withholds two checks.                                                               |
| Source revisions and restore                              | Replacement invalidates claims/checks/definitions. Previous source, companion, and run restore together. Canonical serialization prevents field-order hash mismatches. Imported fingerprints are checked.                                               |
| Wrong-answer recovery                                     | Specific wrong-choice explanation, actual source clip, different same-concept question, saved initial/recovery answers, and trail observed after reload. Attempts are bound to source and generation run.                                               |
| Durable media and honest failure                          | Imported video Blob survives reload. Quota failure preserves text. Exported projects ask for the original recording, reject a different fingerprint, and restore playback with the correct file. Sample works even when browser storage is unavailable. |
| Bounded server work                                       | Loopback Origin/Host validation; one active job; at most four adapter calls; input/output budgets; per-call timeout; real cancellation and lease release tested. No keys are exposed to the client.                                                     |
| Tool-free source boundary                                 | CLI model gets no tools or MCP servers; source instructions remain quoted data. Real injection fixture did not alter the requested title or invent cue references.                                                                                      |
| Author tools                                              | Chapter rename persists after reload; reorder moves whole chapter objects with their references; chapter navigation and input-safe shortcuts implemented.                                                                                               |
| Four portable exports                                     | Markdown, standalone HTML, citation CSV, and project JSON downloaded/reopened. HTML escapes imported text; CSV neutralizes formula-leading cells; JSON excludes media and restores valid evidence. Example artifacts are in `examples/`.                |
| Mobile/keyboard/accessibility                             | 390px source sheet, focus trap/restore, Escape, visible controls, input-safe shortcuts, no tested horizontal overflow. Axe reports no WCAG 2 A/AA or 2.1 AA violations across the tested states.                                                        |
| Three-source evaluation, held-out topic, 30+ claims       | 39 chapter claims across biology, heat, probability inspected, plus nine glossary definitions and nine question pairs. The held-out-topic limitation and observed review misses are disclosed in `evals/REPORT.md`.                                     |
| Judge-ready explanation and handoff                       | `README.md`, `DEMO.md` with a 90-second script, `evals/REPORT.md`, `docs/build-notes.md`, original goal/plan/ADRs, provenance, example exports, and screenshots.                                                                                        |
| No fabricated human validation, publication, or ranking   | No human learning study, public deployment, event submission, or winning-odds claim is made.                                                                                                                                                            |

## Known limits, not hidden passes

- Fresh generation still needs network connectivity and current account/model access. A timeout/authentication interruption occurred during development and was recovered; the failed attempt is documented.
- The adversarial repair run took 91.848 seconds, slightly exceeding the 90-second performance target. Ordinary short-source successes ranged from about 57 to 75 seconds; future latency is not guaranteed.
- The raw model review missed one misleading feedback phrase. The prepared sample contains a disclosed correction. Model support review is not external truth verification.
- Human learner testing and a human audio/teacher review have not occurred. Automated scans and agent inspections do not stand in for those studies.
- The direct API-key adapter is implemented but not live-tested because this laptop used its authenticated local CLI path.
- YouTube, automatic transcription, 3D, arbitrary prose editing, public hosting, and publisher-ready pagination were deliberately deferred by the agreed plan.
- Browser automation could not attach to the user's visible Chrome through the extension during handoff. The separate installed-Chrome test runner completed the production journeys; open the local link directly to present.

The event build is runnable and its core flows are verified within this scope. No claim of “100% correct for every possible input” is made.
