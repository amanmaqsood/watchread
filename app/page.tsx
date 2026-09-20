import Link from "next/link";
import {
  ArrowRight,
  Play,
  MoveUpRight,
  Check,
  BookOpen,
  LocateFixed,
} from "lucide-react";
import { Brand, Footer } from "@/components/ui";
import { Botanical } from "@/components/botanical";
export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Brand />
        <div>
          <Link href="/guide">How it works</Link>
          <Link href="/app">
            Your library <ArrowRight size={15} />
          </Link>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-line" />
            FOR THE MOMENTS THAT MAKE IT CLICK
          </div>
          <h1>
            A lecture you can <em>read.</em>
            <br />
            An explanation you can <em>return to.</em>
          </h1>
          <p className="hero-description">
            Read your lecture as a study book. Check an explanation against its
            source, then work through the questions you missed.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/app/photosynthesis/read">
              Open the sample <ArrowRight size={17} />
            </Link>
            <Link className="button text-button" href="/app/new">
              Start with your lecture <MoveUpRight size={16} />
            </Link>
          </div>
          <div className="hero-note">
            <span className="status-dot" /> Prepared companions by Fable 5.1. No
            sign-up.
          </div>
        </div>
        <div className="hero-art">
          <div className="orbit-note">
            Read at your pace.
            <br />
            Replay the part you need.
          </div>
          <div className="book-object">
            <div className="book-spine">WATCHREAD / FIELD NOTES</div>
            <div className="book-cover">
              <div className="cover-top">
                THE LECTURE COMPANION <span>№ 001</span>
              </div>
              <h2>
                How photosynthesis
                <br />
                <em>actually works.</em>
              </h2>
              <Botanical dark className="cover-plant" />
              <div className="cover-bottom">
                <span>
                  MATTER, LIGHT
                  <br />& THE LIFE OF A LEAF
                </span>
                <BookOpen size={22} />
              </div>
            </div>
            <div className="book-pages" />
          </div>
          <div className="floating-source">
            <span className="source-play">
              <Play size={14} fill="currentColor" />
            </span>
            <div>
              <small>EVERY EXPLANATION HAS A SOURCE</small>
              <p>Go back to the moment it clicks.</p>
            </div>
            <MoveUpRight size={17} />
          </div>
          <div className="art-caption">
            01 / BOTANY <span>7 MIN · 3 CHAPTERS</span>
          </div>
        </div>
      </section>
      <section className="how-section" id="how">
        <div className="section-heading">
          <span className="eyebrow">FROM WATCHING TO UNDERSTANDING</span>
          <h2>
            Find the part you missed.
            <br />
            <em>Then try again.</em>
          </h2>
        </div>
        <div className="how-grid">
          <article>
            <span className="step-no">01</span>
            <BookOpen />
            <h3>Make room to read.</h3>
            <p>
              Read the transcript as short chapters, with a glossary for
              unfamiliar terms.
            </p>
          </article>
          <article>
            <span className="step-no">02</span>
            <LocateFixed />
            <h3>Go straight to the source.</h3>
            <p>
              Click a source time to play the relevant passage and read its
              transcript.
            </p>
          </article>
          <article>
            <span className="step-no">03</span>
            <Check />
            <h3>Let a mistake teach you.</h3>
            <p>
              Read the feedback for your answer, revisit the explanation, and
              try a different question about the same idea.
            </p>
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
