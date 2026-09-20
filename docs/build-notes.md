# Build and model-use notes

Built on 2026-09-20 for an in-person Fable 5.1 demonstration. The public site is at https://watchread.vercel.app. Deployment and publication followed separate user requests; no event submission was made.

## Actual contributions

- Codex performed the planning, application implementation, original educational script, source rendering scripts, runtime integration, tests, visual inspection, and documentation.
- Real `claude-fable-5-1` calls generated and separately reviewed companions. The exact returned model ID and usage are preserved per successful run. The implementation does not silently substitute another model.
- The original recording was rendered from the original script using macOS Samantha synthetic speech, SVG slides, Sharp, and FFmpeg. Attribution points to OpenStax teaching references used when preparing the script.
- No human lecturer was recorded or impersonated. No human learners were recruited or simulated.

## Toolchain observed

Node 24.16.0, Next.js 16.3.5, React 19.3.0, TypeScript 6.0.3, Tailwind 4.3.3, Zod 4.6.5, Anthropic SDK 0.127.0, Playwright 1.63.0, and Vitest 5.0.1. Exact package versions are pinned in `package-lock.json`; use `npm ci`.

The runtime uses the existing authenticated Claude CLI session on this laptop. `.env.local` contains adapter settings and a local development OIDC token added by Vercel CLI. It is excluded from deployment and Git; no credential is embedded in browser assets. The direct SDK alternative is implemented but was not exercised with live API credentials. See ADR 0004.

## Source and media evidence

`public/sample/lecture.mp4` is a real 1280×720 H.264 video with AAC audio at 22,050 Hz. FFprobe measures 447.246 seconds and 8,923,648 bytes. The generated VTT's final cue ends at 447.2 seconds; the 0.046-second container difference is below the one-second alignment tolerance.

The rendering script synthesizes each exact cue's text, measures the encoded segment, and accumulates its actual duration into the transcript. Frame inspections at the carbon introduction, oxygen-from-water explanation, and light-independent Calvin-cycle explanation show the corresponding original slides. The full AAC stream was decoded successfully; measured mean volume is -15.8 dB and maximum -1.2 dB, establishing an audible, non-silent track. Browser checks prove playback advances and citation seeks/stops operate on the real media element. This is an agent engineering check, not a human audio review.

Source and media hashes are in `content/sample/provenance.json`. The prepared companion's editorial changes are disclosed there. Historical raw model outputs remain in `evals/`.

## Limits of the record

Successful run records report returned input/output tokens and application-level adapter calls. They are not an invoice and do not include unreported usage from interrupted/failed calls or coding-session usage. No price or spending claim is inferred from token counts. Authentication probes and cancellation checks are separate from successful companion evaluations.

The local server must stay running. Restoring a CLI login may require restarting the server so it receives the current session. Standard browser tests do not contact the model; two explicit opt-in tests verified real composition and real cancellation separately.


## Public deployment follow-up — September 20, 2026

Published https://watchread.vercel.app in response to explicit deployment authorization. Added a first-use guide, a second prepared heat companion, a downloadable example project and practice transcript, an honest hosted draft state, and a media buffering indicator. The public app uses the existing local browser storage model; there is no uploaded-user-content database. New AI generation stays on the laptop because the optional Vercel AI Gateway requested payment-card verification, which the user declined. See [DEPLOYMENT.md](../DEPLOYMENT.md) and [PRESENTATION.md](../PRESENTATION.md) for verified scope and presentation instructions.
