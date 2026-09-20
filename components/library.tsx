"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Plus, Search, BookOpen, ArrowUpRight } from "lucide-react";
import { Brand, Footer } from "./ui";
import { Botanical } from "./botanical";
import { listProjects } from "@/lib/storage";
import { Project } from "@/lib/domain";
import { preparedProjects } from "@/lib/sample";
export function Library() {
  const [projects, setProjects] = useState<Project[]>(preparedProjects());
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    listProjects()
      .then((items) =>
        setProjects([
          ...preparedProjects().map(
            (p) => items.find((saved) => saved.id === p.id) ?? p,
          ),
          ...items.filter(
            (p) => !["photosynthesis", "heat-and-touch"].includes(p.id),
          ),
        ]),
      )
      .catch(() =>
        setError(
          "Saved projects could not be read. Check that browser storage is enabled.",
        ),
      );
  }, []);
  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="library-page">
      <nav className="landing-nav">
        <Brand />
        <Link className="button small primary" href="/app/new">
          <Plus size={16} />
          New companion
        </Link>
      </nav>
      <header className="library-heading">
        <p className="eyebrow">YOUR PERSONAL READING ROOM</p>
        <h1>
          A shelf for
          <br />
          <em>the things you&apos;re learning.</em>
        </h1>
        <p>Open a prepared lesson or add a transcript of your own.</p>
        <Link className="text-link guide-entry" href="/guide">
          First time here? Take the 2-minute tour <ArrowRight size={16} />
        </Link>
      </header>
      <div className="library-tools">
        <span>
          {projects.length} {projects.length === 1 ? "companion" : "companions"}{" "}
          on your shelf
        </span>
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Search your library"
            placeholder="Find a companion"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      <div className="shelf">
        {filtered.map((p) => (
          <Link className="shelf-card" href={`/app/${p.id}/read`} key={p.id}>
            <div
              className={`shelf-cover ${p.sourceType !== "sample" ? "alt-cover" : ""}`}
            >
              <div className="cover-top">
                WATCHREAD EDITIONS <ArrowUpRight size={17} />
              </div>
              <h2>{p.title}</h2>
              <Botanical dark className="shelf-plant" />
              <span className="shelf-cover-bottom">
                {p.sourceType === "sample"
                  ? "THE ORIGINAL FIELD NOTES"
                  : "YOUR LECTURE COMPANION"}
              </span>
            </div>
            <div className="shelf-meta">
              <span>
                {["photosynthesis", "heat-and-touch"].includes(p.id)
                  ? "PREPARED SAMPLE"
                  : p.status === "draft"
                    ? "DRAFT"
                    : "YOUR LIBRARY"}
              </span>
              <ArrowRight size={18} />
            </div>
            <h3>{p.title}</h3>
            <p>
              {p.companion?.chapters.length ?? 0} chapters ·{" "}
              {p.media
                ? `${Math.round(p.media.duration / 60)} min recording`
                : "Transcript companion"}
            </p>
          </Link>
        ))}
        <Link className="new-shelf" href="/app/new">
          <span>
            <Plus size={24} />
          </span>
          <h3>Add your next lesson.</h3>
          <p>
            Bring a transcript or
            <br />
            restore a saved companion.
          </p>
          <span className="text-link">
            Create a companion <ArrowRight size={15} />
          </span>
        </Link>
      </div>
      {filtered.length === 0 && (
        <p className="empty-hint">No companions match that search.</p>
      )}
      <div className="library-local">
        <BookOpen size={18} />
        <p>
          Your shelf lives in this browser. Export a project to keep a portable
          copy.
        </p>
      </div>
      <Footer />
    </main>
  );
}
