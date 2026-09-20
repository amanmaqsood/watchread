# WatchRead public deployment

Production: **https://watchread.vercel.app**

Tour: https://watchread.vercel.app/guide

Main demo: https://watchread.vercel.app/app/photosynthesis/read

Second lesson: https://watchread.vercel.app/app/heat-and-touch/read

Presenter tutorial and live testing steps: [PRESENTATION.md](PRESENTATION.md).

## What is live

- Two complete prepared companions, with actual recorded Fable 5.1 generation metadata.
- The original photosynthesis video and timestamped transcript.
- Source-linked reading, glossary, misconception feedback, recovery questions, and a saved attempt trail.
- Text-only heat lesson with passage references.
- Browser-local edits and persistence, source replacement and restoration, exports, project import, and reconnecting the original video.
- A first-use walkthrough and downloadable practice files.

## New AI generation

**Fresh AI generation is not enabled on this public deployment.** It remains available on the local laptop at http://127.0.0.1:3000 with the authenticated Claude CLI. The public site saves new source material as a draft and can restore a companion exported from the laptop.

Hosting succeeded on Vercel without adding a payment method or changing the account plan. A separate test of Vercel AI Gateway returned HTTP 403 `customer_verification_required`, requiring a verified card for AI service access. The user declined this step; no card, paid credits, or auto-top-up was added. Netlify was unnecessary because the hosting deployment was not blocked.

The gateway adapter is implemented but **not enabled or validated end to end**. It has no model fallback. Future enablement needs verified model access, `WATCHREAD_GATEWAY=1`, and a private `WATCHREAD_DEMO_CODE` of at least 16 bytes in the project environment. Public model requests require the expected deployment origin/host and this code. Concurrency limiting is per function instance, not a distributed account-wide quota. A real public generation rollout would also need a durable rate/budget mechanism.

The local CLI never runs on Vercel. No Claude login credentials or local environment file were deployed. The Vercel CLI added a local development OIDC token while linking; `.env*` is excluded from deployment and Git.

## Source and release

- Team/project: `apex-stack/watchread`
- Project ID: `prj_hVuxHTNBYhiBwkbTgdJI2Vg8qjK9`
- Final deployment: `dpl_42LyC2ZFhchjPbArDZwoFRjpWF4t`
- Immutable URL: https://watchread-45uope8f7-apex-stack.vercel.app
- Inspector: https://vercel.com/apex-stack/watchread/42LyC2ZFhchjPbArDZwoFRjpWF4t
- Source of the initial deployment: local workspace upload before Git initialization. The public repository is https://github.com/amanmaqsood/watchread. Publication updates are recorded below.
- Source fingerprints: `docs/evidence/hosting-source-manifest.json`
- Deployment output: `docs/evidence/vercel-inspect.txt`

## Privacy and portability

Prepared examples are public. Uploaded videos and personal projects stay in the current browser's IndexedDB; there is no shared project database or cross-device sync. New transcript content is sent to a remote model only when a configured generation path is used. JSON exports include transcript and generated content but not the video binary.

A public-site project and a localhost project belong to different browser origins. To move one, export **The whole companion**, then choose **Restore an exported project** on the other site. Reconnect the same video when prompted. Keep exports as backups before clearing browser data.

## Re-deploy

Run `vercel deploy --prod --yes --scope apex-stack` from this linked directory. Confirm the ready state and public alias, then run `TEST_BASE_URL=https://watchread.vercel.app npx playwright test` and the targeted hosted-state checks. Do not upload `.env.local` or Claude credentials.

## Technical references

- [Vercel Anthropic-compatible Messages API](https://vercel.com/docs/ai-gateway/sdks-and-apis/anthropic-messages-api)
- [Vercel OIDC authentication](https://vercel.com/docs/ai-gateway/authentication-and-byok/oidc)

## Final verification  -  September 20, 2026

- Final Vercel deployment `dpl_42LyC2ZFhchjPbArDZwoFRjpWF4t`: **Ready**, production, aliased to `watchread.vercel.app`.
- Production build, lint, and TypeScript: passed. Unit/integration tests: **32 passed**.
- Public browser journeys: **13 passed**. Two opt-in live-model tests were intentionally skipped on the public site because cloud generation is disabled; their earlier local real-model runs are documented separately.
- Public desktop/mobile automated accessibility scan: **18 states**, no detected axe violations or horizontal overflow. This is not a complete manual accessibility audit.
- Real hosted configuration test: a new transcript saves as a draft; composition is visibly disabled; no model output is fabricated.
- Same-origin generation request: honest HTTP 503 unavailable response. Foreign-origin request: HTTP 403.
- Video range request: HTTP 206. Prepared project download: HTTP 200. `.env.local` URL: HTTP 404.
- Initial hosted QA found a wrongly excluded example download and a cold media load exceeding a five-second test window. The deployment ignore rule was fixed, the player gained an actual buffering indicator, and the browser assertions allow realistic network loading time. The final public rerun passed.

Evidence: `docs/evidence/public-browser-tests.txt`, `docs/evidence/public/accessibility.json`, `docs/evidence/public/hosted-draft.json`, `docs/evidence/public/generation-boundary.json`, and `docs/evidence/vercel-inspect.txt`. The earlier failed run is retained as `docs/evidence/public-browser-tests-initial.txt`.
