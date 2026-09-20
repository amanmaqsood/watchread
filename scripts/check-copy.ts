import ts from "typescript";
import { readFileSync, readdirSync } from "node:fs";
import { checkCopy } from "./copy-rules";
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
  );
}
const failures: string[] = [];
function inspect(file: string, text: string, line: number, heading = false) {
  for (const issue of checkCopy(text, heading))
    failures.push(`${file}:${line} [${issue.rule}] ${issue.message}`);
}
for (const file of [...files("app"), ...files("components")].filter((f) =>
  f.endsWith(".tsx"),
)) {
  const source = readFileSync(file, "utf8");
  const ast = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function visit(node: ts.Node) {
    const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
    if (ts.isJsxOpeningElement(node) && node.tagName.getText(ast) === "b")
      inspect(file, "<b>", line);
    if (ts.isJsxText(node) || ts.isStringLiteral(node))
      inspect(file, node.text, line);
    if (
      ts.isJsxElement(node) &&
      /^h[1-6]$/.test(node.openingElement.tagName.getText(ast))
    ) {
      let text = "";
      function headingText(n: ts.Node) {
        if (ts.isJsxText(n)) text += " " + n.text;
        else if (!ts.isJsxExpression(n)) ts.forEachChild(n, headingText);
      }
      node.children.forEach(headingText);
      inspect(file, text.replace(/\s+/g, " "), line, true);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
for (const file of [
  "README.md",
  "CREDITS.md",
  "PRESENTATION.md",
  "DEMO.md",
  "DEPLOYMENT.md",
]) {
  let fence = false;
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((raw, index) => {
      if (/^```/.test(raw)) {
        fence = !fence;
        return;
      }
      if (fence) return;
      const text = raw.replace(/`[^`]*`/g, "").replace(/\]\([^)]*\)/g, "]");
      inspect(file, text, index + 1);
      if (/^#{1,6} /.test(text))
        inspect(file, text.replace(/^#+ /, ""), index + 1, true);
    });
}
if (failures.length) {
  console.error([...new Set(failures)].join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "Copy check passed: interface text and current public docs. Original source and model records are excluded.",
  );
