import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  LocateFixed,
  Lightbulb,
  Download,
  Play,
} from "lucide-react";
import { Brand, Footer } from "@/components/ui";
export const metadata = { title: "The 2-minute tour | WatchRead" };
const steps = [
  {
    icon: BookOpen,
    title: "Read the lesson as a little book.",
    text: "Open the photosynthesis sample. You'll see short chapters, explanations, and a glossary. You can move between chapters at your own pace.",
    href: "/app/photosynthesis/read",
    action: "Open the reading room",
  },
  {
    icon: LocateFixed,
    title: "Check the original explanation.",
    text: "Click the small source time below an explanation. The recording jumps to the original passage. You can read the matching transcript, too.",
    href: "/app/photosynthesis/read",
    action: "Follow an explanation",
  },
  {
    icon: Lightbulb,
    title: "Work through a wrong answer.",
    text: "Choose Practice in chapter one. Pick 'Minerals absorbed from the soil'. Read why it's a common mix-up, revisit the explanation, then try a different question about the same idea.",
    href: "/app/photosynthesis/practice",
    action: "Try the learning loop",
  },
  {
    icon: Download,
    title: "Keep what you learned.",
    text: "Open Export. Download a readable book, a manuscript, a source spreadsheet, or a project you can restore later. Sources and review labels stay with the text.",
    href: "/app/photosynthesis/export",
    action: "See your takeaways",
  },
];
export default function Guide() {
  return (
    <main className="guide-page">
      <nav className="landing-nav">
        <Brand />
        <Link className="text-link" href="/app">
          Your library <ArrowRight size={16} />
        </Link>
      </nav>
      <header className="guide-heading">
        <span className="eyebrow">YOUR FIRST TWO MINUTES</span>
        <h1>
          A little book.
          <br />
          <em>A way back to understanding.</em>
        </h1>
        <p>
          Imagine a study buddy who turns your lesson into a book, points to
          where each idea came from, and helps you work through mistakes.
        </p>
        <Link className="button primary" href="/app/photosynthesis/read">
          <Play size={17} /> Open the sample
        </Link>
      </header>
      <section className="guide-loop" aria-label="The learning loop">
        <span>Read</span>
        <ArrowRight />
        <span>Check</span>
        <ArrowRight />
        <span>Revisit</span>
        <ArrowRight />
        <span>Try again</span>
      </section>
      <section className="guide-steps" aria-label="Step-by-step walkthrough">
        {steps.map((step, i) => (
          <article key={step.title}>
            <div className="guide-step-number">
              0{i + 1}
              <step.icon size={22} />
            </div>
            <div>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
              <Link className="text-link" href={step.href}>
                {step.action} <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        ))}
      </section>
      <section className="guide-note">
        <span className="eyebrow">ANOTHER SUBJECT, THE SAME IDEA</span>
        <h2>Why does a metal spoon feel colder?</h2>
        <p>
          Explore our second prepared lesson. This one uses text passages, so it
          shows how WatchRead works when there&apos;s no recording or timestamp.
        </p>
        <Link className="button secondary" href="/app/heat-and-touch/read">
          Explore the heat lesson <ArrowRight size={16} />
        </Link>
      </section>
      <p className="guide-entry">
        Fable 5.1 composed and reviewed both prepared companions.{" "}
        <Link className="text-link" href="/credits">
          Read the credits <ArrowRight size={15} />
        </Link>
      </p>
      <section className="guide-faq">
        <h2>Before you start.</h2>
        <details>
          <summary>What does WatchRead make?</summary>
          <p>
            A study companion: readable chapters, explanations linked to source
            passages, a glossary, practice questions, feedback for wrong
            answers, and a different follow-up question. You can export the
            result.
          </p>
        </details>
        <details>
          <summary>What makes it different from a summary?</summary>
          <p>
            WatchRead connects each explanation to its source and each wrong
            answer to a chance to try again. You can read the feedback, revisit
            the relevant passage, and answer a different question about the same
            idea.
          </p>
        </details>
        <details>
          <summary>Can I create a new companion here?</summary>
          <p>
            The public demo includes two complete prepared lessons. Live AI
            composition is currently available in the laptop version. You can
            save new source files here, or restore a project created on the
            laptop. A cloud AI connection is needed to compose new content
            directly on this website.
          </p>
          <Link className="text-link" href="/app/new">
            Save or restore a project <ArrowRight size={15} />
          </Link>
        </details>
        <details>
          <summary>Can I try importing something?</summary>
          <p>
            Download the heat project, go to New companion, and choose
            &apos;Restore an exported project&apos;. It opens as a separate copy
            in your own library.
          </p>
          <a className="text-link" href="/examples/heat-project.json" download>
            Download the example project <Download size={15} />
          </a>
          <p>
            For a source-only import, use our short transcript. It saves as a
            draft until AI composition is available.
          </p>
          <a className="text-link" href="/sample/practice-lesson.txt" download>
            Download a practice transcript <Download size={15} />
          </a>
        </details>
        <details>
          <summary>Where are my projects saved?</summary>
          <p>
            In this browser, on this device. They don&apos;t automatically
            appear on another computer. Download the Project JSON to keep a
            backup or move your work. Video files travel separately.
          </p>
        </details>
        <details>
          <summary>Does AI watch the video?</summary>
          <p>
            This version uses the transcript to create and review the companion.
            The video lets you replay the original explanation. It does not
            transcribe a video automatically or analyze the pictures.
          </p>
        </details>
        <details>
          <summary>
            Does &apos;source supported&apos; mean absolutely correct?
          </summary>
          <p>
            It means the explanation was linked to a source passage and checked
            against it. AI review can still miss mistakes, and the original
            lecture can be wrong. Open the source and use your judgment.
          </p>
        </details>
        <details>
          <summary>How do I rehearse the demo again?</summary>
          <p>
            Select the first chapter, then open Practice. If you already
            answered, choose &apos;Start again&apos;. Your earlier attempts stay
            saved. For a completely fresh browser state, use a new private
            window.
          </p>
        </details>
      </section>
      <Footer />
    </main>
  );
}
