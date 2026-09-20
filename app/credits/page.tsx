import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Brand, Footer } from "@/components/ui";
export const metadata = { title: "Credits | WatchRead" };
export default function Credits() {
  return (
    <main className="guide-page">
      <nav className="landing-nav">
        <Brand />
        <Link className="text-link" href="/app">
          Your library <ArrowRight size={16} />
        </Link>
      </nav>
      <header className="guide-heading">
        <span className="eyebrow">THE MODEL BEHIND THE COMPANIONS</span>
        <h1>
          With thanks to
          <br />
          <em>Fable 5.1.</em>
        </h1>
        <p>
          Fable 5.1 composed and reviewed the prepared study companions you can
          read here.
        </p>
        <Link className="button primary" href="/app">
          <BookOpen size={17} /> Read a companion
        </Link>
      </header>
      <section className="guide-steps" aria-label="Model contributions">
        <article>
          <div className="guide-step-number">01</div>
          <div>
            <h2>From a transcript to a study book.</h2>
            <p>
              Fable 5.1 organized the lessons into chapters, wrote the
              explanations and glossary, and created questions with feedback for
              common mistakes.
            </p>
          </div>
        </article>
        <article>
          <div className="guide-step-number">02</div>
          <div>
            <h2>A separate review against the source.</h2>
            <p>
              A second Fable 5.1 pass checked the generated material against the
              transcript. WatchRead also checks source references in code. Model
              review can miss errors, so you can open the original passage and
              judge it yourself.
            </p>
          </div>
        </article>
        <article>
          <div className="guide-step-number">03</div>
          <div>
            <h2>The work is recorded.</h2>
            <p>
              Each saved run includes its model ID and source revision. The
              prepared photosynthesis edition has a few disclosed editorial
              changes. Opening a prepared companion does not trigger a new model
              call.
            </p>
            <a
              className="text-link"
              href="https://github.com/amanmaqsood/watchread/blob/main/CREDITS.md"
            >
              Read the credits and run records <ArrowRight size={15} />
            </a>
          </div>
        </article>
      </section>
      <section className="guide-note">
        <h2>The original lesson.</h2>
        <p>
          The photosynthesis recording uses an original script and slides, with
          synthetic macOS Samantha narration. OpenStax teaching references and
          the media tools are credited in the repository.
        </p>
        <a
          className="text-link"
          href="https://github.com/amanmaqsood/watchread"
        >
          View the public repository <ArrowRight size={15} />
        </a>
      </section>
      <Footer />
    </main>
  );
}
