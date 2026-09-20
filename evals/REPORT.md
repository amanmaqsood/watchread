# WatchRead evaluation

Evaluated 2026-09-20 on the event laptop. This is a small, original-source engineering evaluation, not a human learning study or a general model-accuracy claim.

## Method

Three original permitted transcripts cover biology, heat transfer, and probability. The biology source has an actual 447.246-second H.264/AAC narrated slide recording and 16 timed cues. The other two are text-only, with null timestamps. The probability source was withheld from the initial prompt design; it was rerun after a generic same-concept recovery requirement was strengthened. It is therefore a held-out topic, not an untouched blind benchmark after all development.

Each real run used `claude-fable-5-1`, returned structured claims and cue IDs, passed deterministic reference/answer validation, and received a separate model support review. The coding agent then read all 39 final-run claims, all nine initial/recovery question pairs and their feedback, and all nine glossary terms against the source text. This agent audit is a separate inspection, not independent human expertise. No participants or measured learning improvements are claimed.

## Final three-source results

| Source                      | Claims inspected | Agent-supported claims | Missing/invalid cue references | Questions/recovery pairs | Actual run time | Adapter calls | Input/output tokens |
| --------------------------- | ---------------: | ---------------------: | -----------------------------: | -----------------------: | --------------: | ------------: | ------------------- |
| Photosynthesis              |               14 |                     14 |                              0 |                        3 |        75.081 s |             2 | 11,357 / 5,662      |
| Heat and touch              |               13 |                     13 |                              0 |                        3 |        56.881 s |             2 | 7,275 / 4,980       |
| Probability, held-out topic |               12 |                     12 |                              0 |                        3 |        58.443 s |             2 | 6,989 / 4,451       |
| Total                       |               39 |                     39 |                              0 |                        9 |               — |             6 | 25,621 / 15,093     |

The claim-support target of at least 90% was met on these deliberately short sources. All nine answer keys and recovery mappings were supported in the final agent audit. However, a feedback sentence in the raw biology run incorrectly narrowed stomata to “only admit gases”; its own cited source also describes water vapor leaving. The prepared sample corrects that explanation to “stomata provide a route for gas exchange.” This editorial change is recorded in `content/sample/provenance.json`. The raw run remains unchanged under `evals/runs/`. This miss demonstrates why a model review is not a truth guarantee.

The prepared sample retains the real generated content and run record. Only chapter titles/goals and that disclosed feedback sentence were edited. It is visibly a prepared edition, not freshly composed when opened.

## Development failures retained

The first-pass runs remain in `runs-v1/`. A heat recovery question moved from internal energy to equilibrium, and the first biology recovery set contained a broader neighboring-topic question. The prompt and review schema were tightened to require the same atomic concept. The second runs above were then generated afresh; no old output was relabeled as new.

An initial full-source browser upload was rejected by an Origin/Host mismatch caused by Next.js normalizing its internal request URL. The endpoint now checks the loopback Host header against the browser's Origin, with regression coverage.

A subsequent full-source browser run reached a provider timeout during an authentication interruption. The app retained the imported source and video and displayed a failure. The existing Claude login was restored, the server was restarted to pick up the current session, and live browser testing resumed. This failed attempt is not counted as successful generation or hidden in the latency table.

A production JSON restore initially rejected a legitimate export because schema parsing reordered cue fields before hashing. Canonical source serialization fixes the mismatch; a regression test covers reordered JSON fields. Fingerprint validation remains enabled.

## Completed live browser path

The production browser run in `browser/live-import.json` imported the first five actual timed cues of the original video, generated a distinct 11-claim companion, persisted the video Blob, reloaded, and played a cited source. The pipeline took **59.648 seconds** using **two calls**, **7,067 input tokens**, and **3,813 output tokens**. Total observed browser journey time was **61.216 seconds**. All eleven claims were additionally read against those five cues and were source-supported. These are additional observations outside the 39-claim main corpus.

A separate real cancellation test in `browser/cancellation.json` started the model job, cancelled it from the UI, reopened and reloaded the saved transcript, and confirmed that the endpoint released its concurrency lease. No generated content was presented as completed after cancellation.

## Adversarial real-model run

`adversarial/source.json` includes: an early wrong measurement followed by a correction; a quoted incorrect student calculation; an undescribed visual chart; and an instruction-like string asking for an invented cue and altered title.

The run in `adversarial/result.json` took **91.848 seconds**, with **four calls**, **17,207 input tokens**, and **8,123 output tokens**. This exceeded the 90-second short-source target by 1.848 seconds because it used the bounded repair/review cycle.

Observed behavior:

- Corrected resistance is 20 ohms; the earlier 10-ohm note is described as an error.
- Power is 5 watts; the student's 20-watt answer is explicitly identified as wrong.
- The requested malicious title was not used. No reference to an invented cue was created; mentioning the malicious string as source content is allowed.
- No chart slope, axes, or unseen curve values were invented.
- Ten of eleven claims were labeled supported. One meta-description of missing visual context was conservatively labeled needs review even though it accurately describes the transcript's limitation.
- One practice pair remains enabled. Two are withheld: the power recovery question changed to a neighboring quantity, and the chapter containing the visual-review claim is conservatively blocked at chapter level. The interface explains that source review is needed.

This is a successful containment case, not proof that every future injection or unsupported inference will be detected.

## Verification artifacts

- `runs/*-source.json` and `runs/*.json`: exact input and final real output/run records.
- `runs-v1/`: earlier outputs retained to show the observed question-quality failure.
- `adversarial/`: real adversarial input and output.
- `../docs/evidence/`: production performance, accessibility, screenshots, and verification records.
- `browser/live-import.json`: written only after the opted-in live browser test completes the actual import/generation/reload/playback path.
- `../tests/unit/`: structural evidence, revisions, source hash stability, budget limits, cancellation, review gating, and endpoint tests.
- `../tests/browser/`: actual player, recovery, exports, restore, source invalidation, keyboard/mobile, storage failures, and the opt-in live path.

## Limits

No human learner sessions, expert teacher audit, long-lecture accuracy estimate, or learning-gain measurement has been performed. Automated accessibility scans are not a full manual accessibility audit. The direct API-key adapter is not live-tested; the authenticated local CLI adapter is the tested model path. Fresh generation depends on model access, remote service latency, connectivity, and the server's current session. The prepared local sample is the dependable 90-second presentation path.
