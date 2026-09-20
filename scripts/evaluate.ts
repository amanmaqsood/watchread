import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { compose } from "../lib/generation";
import { Cue, inspectCompanion } from "../lib/domain";
try {
  process.loadEnvFile(".env.local");
} catch {}
mkdirSync("evals/runs", { recursive: true });
const make = (texts: string[]): Cue[] =>
  texts.map((text, i) => ({
    id: `cue-${i + 1}`,
    start: null,
    end: null,
    text,
  }));
const sources = [
  {
    id: "photosynthesis",
    title: "How photosynthesis actually works",
    cues: JSON.parse(readFileSync("content/sample/cues.json", "utf8")) as Cue[],
  },
  {
    id: "heat",
    title: "Why a metal spoon feels colder",
    cues: make([
      "A metal spoon and a wooden spoon can be at the same room temperature and still feel different. The metal usually feels colder because it transfers thermal energy away from a warmer hand more quickly. Feeling cold does not by itself measure the object's temperature.",
      "Thermal conduction transfers energy through matter without the bulk movement of the material. Metals are often good thermal conductors. Wood generally conducts heat much more slowly. A wooden spoon handle can therefore stay comfortable longer when part of the spoon is in hot liquid.",
      "Temperature and thermal energy are not interchangeable names. Temperature describes a thermal state, while total internal energy also depends on how much material is present and its properties. A larger amount of water can contain more internal energy than a smaller amount at the same temperature.",
      "Energy transfers spontaneously from a hotter object to a colder one when they can exchange heat. It does not flow because cold is a substance entering the warm object. When two objects reach thermal equilibrium, there is no net heat transfer between them.",
      "A student says the metal must be colder because it feels colder. That conclusion is not justified. The sensation depends on the rate of energy transfer as well as the temperatures. Compare both objects with a suitable thermometer to test whether their temperatures really differ.",
      "An insulating glove reduces heat transfer between a hand and an object. It does not create heat merely by being an insulator. The same principle helps explain why insulation can keep a warm drink warm or a cold drink cold: it slows energy exchange with the surroundings.",
    ]),
  },
  {
    id: "probability-heldout",
    title: "Two coin tosses and a stubborn misconception",
    cues: make([
      "For an ideal fair coin, heads and tails each have probability one half on a toss. In this example, successive tosses are independent. Independence means that knowing the result of one toss does not change the probability distribution for the next one.",
      "After three heads in a row, a student says tails is now due. For the independent fair coin described here, that is a mistake. The probability of tails on the next toss is still one half. The coin has no memory of earlier outcomes.",
      "For two independent fair tosses, the four ordered outcomes are heads-heads, heads-tails, tails-heads, and tails-tails. Each ordered outcome has probability one quarter. Order matters when listing these elementary outcomes.",
      "Exactly one head can occur as heads-tails or tails-heads. Those are two distinct outcomes, so its probability is one half. Counting only one of them would miss half of the favorable outcomes. Two heads has probability one quarter.",
      "At least one head includes heads-heads, heads-tails, and tails-heads. Its probability is three quarters. Another method is to subtract the probability of no heads, which is tails-tails, from one.",
      "A probability model describes assumptions, not a guarantee that every small batch will match its expected proportions. Four tosses do not have to contain exactly two heads. If the coin is biased or tosses are dependent, the fair independent model must be reconsidered.",
    ]),
  },
];
for (const source of sources) {
  writeFileSync(
    `evals/runs/${source.id}-source.json`,
    JSON.stringify(source, null, 2),
  );
  console.log(`Starting ${source.id}`);
  try {
    const result = await compose(
      source.cues,
      source.title,
      AbortSignal.timeout(300000),
      (stage) => console.log(`${source.id}: ${stage}`),
    );
    writeFileSync(
      `evals/runs/${source.id}.json`,
      JSON.stringify(result, null, 2),
    );
    const claims = result.companion.chapters.flatMap((c) => c.claims);
    console.log(
      JSON.stringify({
        source: source.id,
        claims: claims.length,
        supported: claims.filter((c) => c.status === "supported").length,
        errors: inspectCompanion(result.companion, source.cues),
        run: result.run,
      }),
    );
  } catch (e) {
    writeFileSync(`evals/runs/${source.id}-error.txt`, String(e));
    console.error(source.id, String(e));
  }
}
