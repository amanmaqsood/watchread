import { describe, it, expect, vi, afterEach } from "vitest";
const model = vi.hoisted(() => ({
  compose: vi.fn(),
  generationConfig: vi.fn(() => ({ available: true })),
}));
vi.mock("../../lib/generation", () => model);
import { POST } from "../../app/api/generate/route";
const request = (
  origin = "http://localhost:3000",
  body: unknown = {
    title: "Lesson",
    cues: [{ id: "cue-1", text: "A source passage.", start: null, end: null }],
  },
  signal?: AbortSignal,
) =>
  new Request("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
describe("local generation boundary", () => {
  it("accepts a matching loopback Host even if Next normalizes its internal URL", async () => {
    const req = request("http://127.0.0.1:3000", {
      title: "invalid",
      cues: [],
    });
    req.headers.set("host", "127.0.0.1:3000");
    expect((await POST(req)).status).toBe(400);
  });
  it("rejects foreign origins before invoking a model", async () => {
    expect((await POST(request("https://foreign.example"))).status).toBe(403);
    expect(model.compose).not.toHaveBeenCalled();
  });
  it("rejects invalid input before invoking a model", async () => {
    expect(
      (await POST(request("http://localhost:3000", { title: "x", cues: [] })))
        .status,
    ).toBe(400);
    expect(model.compose).not.toHaveBeenCalled();
  });
  it("keeps the concurrency lease until cancellation has actually unwound", async () => {
    let release: (v: unknown) => void = () => {};
    let signal: AbortSignal | undefined;
    model.compose.mockImplementationOnce((_c, _t, s) => {
      signal = s;
      return new Promise((resolve) => {
        release = resolve;
      });
    });
    const first = await POST(request());
    expect(first.status).toBe(200);
    expect((await POST(request())).status).toBe(429);
    await first.body!.cancel();
    expect(signal?.aborted).toBe(true);
    expect((await POST(request())).status).toBe(429);
    release({});
    await new Promise((resolve) => setTimeout(resolve, 0));
    model.compose.mockResolvedValueOnce({
      companion: { title: "Fresh" },
      run: { id: "new" },
    });
    const next = await POST(request());
    expect(next.status).toBe(200);
    expect(await next.text()).toContain("Fresh");
  });
  it("streams a truthful provider failure and releases the job", async () => {
    model.compose.mockRejectedValueOnce(
      Error("Provider temporarily unavailable"),
    );
    const response = await POST(request());
    expect(await response.text()).toContain("Provider temporarily unavailable");
    model.compose.mockResolvedValueOnce({
      companion: { title: "Retry" },
      run: { id: "retry" },
    });
    expect(await (await POST(request())).text()).toContain("Retry");
  });
});

describe("hosted generation boundary", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });
  function hosted(code?: string, origin = "https://watchread.vercel.app") {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "watchread.vercel.app");
    const req = new Request("https://watchread.vercel.app/api/generate", {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json",
        ...(code ? { "x-watchread-code": code } : {}),
      },
      body: JSON.stringify({
        title: "Lesson",
        cues: [{ id: "cue-1", text: "A passage.", start: null, end: null }],
      }),
    });
    return req;
  }
  it("returns an honest unavailable state before asking for access", async () => {
    model.generationConfig.mockReturnValueOnce({ available: false });
    const response = await POST(hosted());
    expect(response.status).toBe(503);
    expect(await response.text()).toContain("laptop version");
  });
  it("fails closed without a configured presenter code", async () => {
    vi.stubEnv("WATCHREAD_DEMO_CODE", "");
    expect((await POST(hosted())).status).toBe(401);
  });
  it("rejects a wrong code and foreign origin", async () => {
    vi.stubEnv("WATCHREAD_DEMO_CODE", "private-test-code-123456");
    expect((await POST(hosted("wrong"))).status).toBe(401);
    expect(
      (
        await POST(
          hosted("private-test-code-123456", "https://foreign.example"),
        )
      ).status,
    ).toBe(403);
    expect(model.compose).not.toHaveBeenCalled();
  });
  it("allows the configured production host with a valid private code", async () => {
    vi.stubEnv("WATCHREAD_DEMO_CODE", "private-test-code-123456");
    model.compose.mockResolvedValueOnce({
      companion: { title: "Hosted" },
      run: { id: "cloud" },
    });
    const response = await POST(hosted("private-test-code-123456"));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Hosted");
  });
  it("rejects loopback hosts on a hosted runtime", async () => {
    hosted();
    expect((await POST(request())).status).toBe(403);
  });
});
