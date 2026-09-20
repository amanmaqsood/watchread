import { generationConfig } from "@/lib/generation";
import { execFile } from "node:child_process";
export const runtime = "nodejs";
export async function GET() {
  const config = generationConfig();
  if (config.provider === "Local Claude") {
    const authenticated = await new Promise<boolean>((resolve) => {
      execFile(
        "claude",
        ["auth", "status", "--json"],
        { timeout: 5000, maxBuffer: 20000 },
        (error, stdout) => {
          if (error) return resolve(false);
          try {
            resolve(JSON.parse(stdout).loggedIn === true);
          } catch {
            resolve(false);
          }
        },
      );
    });
    if (!authenticated)
      return Response.json({
        ...config,
        available: false,
        reason:
          "The server cannot find an authenticated Claude CLI session. Sign in, then restart WatchRead.",
      });
  }
  return Response.json(
    {
      ...config,
      ...(!config.available && process.env.VERCEL === "1"
        ? {
            reason:
              "The public demo includes two complete prepared lessons. New AI composition runs in the laptop version. You can save your source here or restore an exported project.",
          }
        : {}),
      requiresCode: process.env.VERCEL === "1",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
