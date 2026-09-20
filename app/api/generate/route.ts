import { z } from "zod";
import { CueSchema } from "@/lib/domain";
import { compose, generationConfig } from "@/lib/generation";
import { timingSafeEqual } from "node:crypto";
export const runtime = "nodejs";
export const maxDuration = 300;
let activeJob: symbol | null = null;
export async function POST(request: Request) {
  // Next may normalize request.url to its internal bind host. The browser's
  // same-origin boundary is the actual Host header, never a forwarded header.
  const internalUrl = new URL(request.url);
  let url: URL;
  try {
    url = new URL(
      `${internalUrl.protocol}//${request.headers.get("host") || internalUrl.host}`,
    );
  } catch {
    return Response.json({ error: "Invalid local host." }, { status: 403 });
  }
  const origin = request.headers.get("origin");
  const hosted = process.env.VERCEL === "1";
  const permittedHosts = [
    process.env.VERCEL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ];
  const hostAllowed = hosted
    ? url.protocol === "https:" && permittedHosts.includes(url.host)
    : ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (!hostAllowed || origin !== url.origin)
    return Response.json(
      { error: "Open WatchRead directly to compose a companion." },
      { status: 403 },
    );
  if (hosted) {
    if (!generationConfig().available)
      return Response.json(
        {
          error:
            "New AI composition is not enabled on this public demo. Create a companion in the laptop version, then restore its exported project here.",
        },
        { status: 503 },
      );
    const expected = Buffer.from(process.env.WATCHREAD_DEMO_CODE || "");
    const supplied = Buffer.from(request.headers.get("x-watchread-code") || "");
    if (
      expected.length < 16 ||
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    )
      return Response.json(
        {
          error:
            "Enter the presenter's demo code on the New companion page to enable live composition.",
        },
        { status: 401 },
      );
  }
  if (activeJob)
    return Response.json(
      { error: "A companion is already being composed. Please wait." },
      { status: 429 },
    );
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 1_100_000) throw Error("Input too large");
    body = z
      .object({
        title: z.string().min(1).max(200),
        cues: z.array(CueSchema).min(1).max(1200),
      })
      .parse(JSON.parse(raw));
  } catch {
    return Response.json(
      { error: "The source is invalid or exceeds the import limit." },
      { status: 400 },
    );
  }
  if (activeJob)
    return Response.json(
      { error: "A companion is already being composed. Please wait." },
      { status: 429 },
    );
  const lease = Symbol("generation");
  activeJob = lease;
  const encoder = new TextEncoder();
  const abort = new AbortController();
  const onAbort = () => abort.abort();
  request.signal.addEventListener("abort", onAbort, { once: true });
  if (request.signal.aborted) abort.abort();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (data: unknown) => {
        if (!abort.signal.aborted)
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };
      try {
        const result = await compose(
          body.cues,
          body.title,
          abort.signal,
          (stage) => emit({ stage }),
        );
        emit({ result });
      } catch (error) {
        emit({
          error:
            error instanceof Error
              ? error.message
              : "Generation failed. Your source is safe.",
        });
      } finally {
        if (activeJob === lease) activeJob = null;
        request.signal.removeEventListener("abort", onAbort);
        try {
          controller.close();
        } catch {}
      }
    },
    cancel() {
      abort.abort();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
    },
  });
}
