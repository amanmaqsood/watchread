# ADR 0005: Embed evidence records in a small immutable companion

Status: implemented, 2026-09-20.

The event application represents the planned entities in one validated project document rather than separate database tables. The current source revision is `revision` plus immutable `cues`; claims and checks carry cue IDs within that revision. `run.sourceHash` must match the revision. Claim kind, support state, and the review reason embed the support review in the claim. Chapter arrays define order. Correct answers, per-choice explanations, and recovery questions embed the check mapping. Attempts carry both source revision and generation run ID.

Arbitrary prose editing is not exposed. Outline title/order edits do not alter evidence. Source replacement marks claims and checks stale and retains the previous source, companion, and run as one restorable snapshot. A successful regeneration creates a new run ID, so previous attempts cannot attach to different questions that happen to reuse a check ID. Old attempts remain in the portable project history.

For this immutable-prose version, separate per-claim content hashes and evidence-row tables would duplicate the enclosing validated snapshot. They become necessary if concurrent collaboration or arbitrary prose editing is introduced. The source hash uses a canonical cue field order, so schema parsing and JSON serialization order cannot create false mismatches.

Review states are conservative: unresolved claims withhold all graded checks in the same chapter. This can withhold a separately supported question; the adversarial evaluation records that tradeoff. A more granular claim-to-check dependency graph is deferred until it can be evaluated.

A generation run records successful actual provider/model usage and source identity. Failed calls preserve the saved source/previous companion and display the failure; raw provider logs and credential material are not persisted.
