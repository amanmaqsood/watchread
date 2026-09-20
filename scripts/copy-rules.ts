export type CopyIssue = { rule: string; message: string };
export function checkCopy(text: string, heading = false): CopyIssue[] {
  const issues: CopyIssue[] = [];
  if (/[\u2013\u2014]/u.test(text))
    issues.push({
      rule: "dashes",
      message: "Use a full stop, comma, colon, or plain hyphen.",
    });
  if (/[\u2018\u2019\u201c\u201d]/u.test(text))
    issues.push({ rule: "quotes", message: "Use straight quotes." });
  if (/\p{Extended_Pictographic}/u.test(text))
    issues.push({ rule: "emoji", message: "Use words instead of emoji." });
  if (/^\s*\*\*[^*\n]+\*\*\s*$/m.test(text) || /<b(?:\s|>)/i.test(text))
    issues.push({
      rule: "decorative-bold",
      message:
        "Use a heading or plain sentence instead of a standalone bold slogan.",
    });
  if (heading) {
    const words = text
      .trim()
      .replace(/[.!?]$/, "")
      .split(/\s+/)
      .filter((w) => /^[A-Za-z]/.test(w));
    const common = words.filter(
      (w) =>
        ![
          "WatchRead",
          "Fable",
          "Claude",
          "AI",
          "JSON",
          "CSV",
          "VTT",
          "SRT",
          "TXT",
          "HTML",
          "MP4",
          "WebM",
          "OpenStax",
          "Node",
          "Next.js",
          "GitHub",
        ].includes(w),
    );
    const meaningful = common.filter(
      (w) =>
        ![
          "a",
          "an",
          "the",
          "of",
          "in",
          "to",
          "and",
          "or",
          "with",
          "for",
          "on",
        ].includes(w.toLowerCase()),
    );
    if (meaningful.length > 1 && meaningful.every((w) => /^[A-Z]/.test(w)))
      issues.push({
        rule: "heading-case",
        message: "Use sentence case in headings.",
      });
  }
  return issues;
}
