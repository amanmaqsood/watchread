import { CompanionSchema, Cue, RunSchema } from "./domain";
export async function generateCompanion(
  title: string,
  cues: Cue[],
  signal: AbortSignal,
  onStage: (stage: string) => void,
) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-watchread-code": sessionStorage.getItem("watchread-demo-code") || "",
    },
    body: JSON.stringify({ title, cues }),
    signal,
  });
  if (!response.ok) {
    const data = await response.json();
    throw Error(data.error ?? "Unable to compose this source.");
  }
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let index;
    while ((index = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, index);
      buffer = buffer.slice(index + 1);
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.stage) onStage(event.stage);
      if (event.error) throw Error(event.error);
      if (event.result)
        result = {
          companion: CompanionSchema.parse(event.result.companion),
          run: RunSchema.parse(event.result.run),
        };
    }
  }
  if (!result)
    throw Error(
      "The connection ended before the companion was ready. Your source is saved.",
    );
  return result;
}
