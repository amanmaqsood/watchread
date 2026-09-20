import { describe, it, expect } from "vitest";
import { checkCopy } from "../../scripts/copy-rules";
describe("first-party copy rules", () => {
  it.each([
    ["dashes", "Read\u2014then revisit.", false],
    ["quotes", "It\u2019s saved.", false],
    ["emoji", "Ready \u{1F680}", false],
    ["heading-case", "Your Study Companion", true],
    ["decorative-bold", "**Learn like never before**", false],
  ])("flags %s", (rule, text, heading) =>
    expect(
      checkCopy(String(text), Boolean(heading)).map((x) => x.rule),
    ).toContain(rule),
  );
  it("accepts sentence case, model names, and meaningful inline emphasis", () => {
    expect(checkCopy("Generate with Fable 5.1", true)).toEqual([]);
    expect(checkCopy("Choose **Start again** to retry.")).toEqual([]);
    expect(
      checkCopy("Your source is saved. Try again when you're connected."),
    ).toEqual([]);
  });
});
