# ADR 0004: Use the authenticated local Fable runtime for the event

Status: accepted implementation decision, 2026-09-20.

The planned server-only Claude API adapter is implemented. This laptop has no configured Anthropic API key, but its existing Claude CLI session is authenticated and actually resolves the requested model to `claude-fable-5-1`. A live probe and subsequent generation runs confirmed that exact model ID in returned usage metadata.

For this local event build, the Node route can invoke that existing runtime as a bounded text model. It uses `--safe-mode`, `--strict-mcp-config`, `--tools ''`, `--no-session-persistence`, an explicit model, low effort, and a per-invocation budget. Transcript JSON arrives through stdin. No model tools, file editing, shell commands, autonomous agents, or MCP connectors are offered to the model. The adapter parses the returned text and usage; it does not store raw CLI logs. No credentials are copied into the application or browser.

The model is remote even though the adapter is local. The prepared sample requires no model connection; fresh composition requires connectivity and valid existing account access. The UI discloses transcript transfer. Video bytes remain in browser storage.

The direct SDK path remains available by explicitly setting `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`; it uses structured JSON output and disables SDK retries. It was not exercised against a live API key on this laptop. Do not describe that path as live-verified.

Runtime limits are enforced by the shared composition pipeline: at most four adapter invocations, bounded input/output totals, one active endpoint job, and cancellation. CLI invocation counts are application-level calls, not a guarantee about the provider's internal transport retries. The existing CLI has its own runtime overhead; usage counts include any reported cache input. Per-call timeout is 110 seconds for the CLI, 100 seconds for the SDK. The app binds to loopback and rejects generation from a different Origin/Host.

Next.js may normalize `request.url` to an internal bind hostname. The endpoint validates the actual Host header against the browser's Origin, while restricting that host to loopback. Forwarded host headers are not trusted. This behavior has a regression test and was checked through the real browser upload flow.

This is a documented extension of the planned API-only adapter, selected to make live generation work with the account access already authorized on the event laptop.
