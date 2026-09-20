---
status: accepted
---
# Keep media local and generation explicit

Use browser IndexedDB for project state and eligible media, with a server-side Claude adapter receiving transcript text only for bounded generation. A prepared sample remains usable without model access; this supersedes the original localStorage-only and no-runtime-model restrictions while avoiding cloud media storage, accounts, and silent upload of recordings.
