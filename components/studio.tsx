"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Check,
  ChevronDown,
  Download,
  FileText,
  Link2,
  List,
  LoaderCircle,
  MoreHorizontal,
  Play,
  Plus,
  Settings2,
  ShieldCheck,
  X,
  AlertCircle,
  Printer,
  RotateCcw,
} from "lucide-react";
import { Brand, Loading } from "./ui";
import { Botanical } from "./botanical";
import { SourcePlayer, Selection } from "./source-player";
import { Practice } from "./practice";
import {
  Project,
  coverage,
  evidenceClaims,
  evidenceLabel,
  passage,
  replaceSource,
  restoreSource,
  serializeCues,
} from "@/lib/domain";
import { preparedProject } from "@/lib/sample";
import { loadProject, saveProject, loadMedia, saveMedia } from "@/lib/storage";
import { hashData, parseTranscript } from "@/lib/import";
import {
  citationsCsv,
  download,
  manuscript,
  portableJson,
  readingHtml,
} from "@/lib/export";
import { generateCompanion } from "@/lib/client-generation";
import { useModal } from "@/lib/use-modal";

export function Studio({ id, view }: { id: string; view: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [chapterIndex, setChapterIndex] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [saved, setSaved] = useState(true);
  const [saveFailed, setSaveFailed] = useState(false);
  const [outline, setOutline] = useState(false);
  const [mobileSource, setMobileSource] = useState(false);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("all");
  const [stage, setStage] = useState("");
  const [print, setPrint] = useState(false);
  const [help, setHelp] = useState(false);
  const [generationAvailable, setGenerationAvailable] = useState<
    boolean | null
  >(null);
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((c) => setGenerationAvailable(c.available === true))
      .catch(() => setGenerationAvailable(false));
  }, []);
  useModal(outline || print || help || mobileSource, () => {
    setOutline(false);
    setPrint(false);
    setHelp(false);
    setMobileSource(false);
  });
  const saveQueue = useRef(Promise.resolve());
  const saveVersion = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let alive = true;
    let objectUrl = "";
    async function load() {
      try {
        let p = await loadProject(id);
        if (!p && preparedProject(id)) {
          p = preparedProject(id)!;
          await saveProject(p);
        }
        if (!alive) return;
        setProject(p);
        if (p) {
          const storedChapter = Number(
            localStorage.getItem(`watchread-chapter-${id}`) || 0,
          );
          const savedChapter = Number.isFinite(storedChapter)
            ? Math.floor(storedChapter)
            : 0;
          setChapterIndex(
            Math.max(
              0,
              Math.min(savedChapter, (p.companion?.chapters.length ?? 1) - 1),
            ),
          );
          if (p.media?.sampleUrl) setMediaUrl(p.media.sampleUrl);
          else {
            const blob = await loadMedia(id);
            if (blob) {
              objectUrl = URL.createObjectURL(blob);
              if (alive) setMediaUrl(objectUrl);
            }
          }
        }
      } catch (e) {
        if (alive) {
          if (preparedProject(id)) {
            const p = preparedProject(id)!;
            setProject(p);
            setMediaUrl(p.media?.sampleUrl || "");
            setSaved(false);
            setSaveFailed(true);
          }
          setError(
            preparedProject(id)
              ? "Browser storage is unavailable. The sample still works; export your changes to keep them."
              : e instanceof Error
                ? e.message
                : "Unable to load the project.",
          );
        }
      } finally {
        if (alive) setLoaded(true);
      }
    }
    void load();
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      abort.current?.abort();
    };
  }, [id]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);
  function update(p: Project) {
    const version = ++saveVersion.current;
    setProject(p);
    setSaved(false);
    setSaveFailed(false);
    saveQueue.current = saveQueue.current
      .catch(() => {})
      .then(() => saveProject(p))
      .then(() => {
        if (version === saveVersion.current) setSaved(true);
      })
      .catch(() => {
        if (version !== saveVersion.current) return;
        setError(
          "Your changes could not be saved. Export the project now to keep a copy.",
        );
        setSaved(false);
        setSaveFailed(true);
      });
  }
  function chapter(i: number) {
    setChapterIndex(i);
    try {
      localStorage.setItem(`watchread-chapter-${id}`, String(i));
    } catch {
      /* Reading remains available without preferences. */
    }
  }
  function select(ids: string[], play = false) {
    setSelection({ ids, play, nonce: Date.now() });
    if (window.innerWidth < 900) setMobileSource(true);
    setToast(
      play ? "Opening the original explanation" : "Source passage selected",
    );
  }
  async function reconnect(file: File) {
    if (!project) return;
    setError("");
    try {
      if (file.size > 150 * 1024 * 1024 || !/^video\//.test(file.type))
        throw Error("Choose a video up to 150 MB.");
      const hash = await hashData(await file.arrayBuffer());
      if (project.media && hash !== project.media.hash)
        throw Error(
          "That is a different recording. Reconnect the original file or create a new companion.",
        );
      const url = URL.createObjectURL(file);
      const duration = await new Promise<number>((resolve, reject) => {
        const v = document.createElement("video");
        v.src = url;
        v.onloadedmetadata = () => resolve(v.duration);
        v.onerror = () =>
          reject(Error("This video format could not be opened."));
      });
      if (!Number.isFinite(duration) || duration > 1800) {
        URL.revokeObjectURL(url);
        throw Error("Use a recording up to 30 minutes.");
      }
      if (project.cues.some((c) => c.end != null && c.end > duration + 1)) {
        URL.revokeObjectURL(url);
        throw Error(
          "This recording ends before the transcript. Check that they match.",
        );
      }
      await saveMedia(id, file);
      if (mediaUrl.startsWith("blob:")) URL.revokeObjectURL(mediaUrl);
      setMediaUrl(url);
      update({
        ...project,
        media: {
          name: file.name,
          hash,
          duration,
          size: file.size,
          mime: file.type,
        },
        updatedAt: new Date().toISOString(),
      });
      setToast("Recording reconnected");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not reconnect the recording.",
      );
    }
  }
  async function replace(file: File) {
    if (!project) return;
    try {
      const cues = parseTranscript(await file.text(), file.name);
      update(replaceSource(project, cues, await hashData(serializeCues(cues))));
      setSelection(null);
      setToast("Transcript updated. Regenerate to reconnect sources.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update transcript.");
    }
  }
  async function generate() {
    if (!project) return;
    setError("");
    abort.current = new AbortController();
    setStage("Reading your source");
    try {
      const result = await generateCompanion(
        project.title,
        project.cues,
        abort.current.signal,
        setStage,
      );
      update({
        ...project,
        ...result,
        title: result.companion.title,
        status: "ready",
        updatedAt: new Date().toISOString(),
      });
      chapter(0);
      setToast("Your companion is ready");
    } catch (e) {
      setError(
        e instanceof Error && e.name === "AbortError"
          ? "Composition cancelled. Your previous companion is unchanged."
          : e instanceof Error
            ? e.message
            : "Composition failed.",
      );
    } finally {
      setStage("");
    }
  }
  useEffect(() => {
    function keys(e: KeyboardEvent) {
      if (
        (e.target as HTMLElement).closest(
          "input,textarea,select,button,[contenteditable]",
        )
      )
        return;
      if (e.key === "?") setHelp((x) => !x);
      if (project?.companion) {
        if (e.key === "n")
          chapter(
            Math.min(chapterIndex + 1, project.companion.chapters.length - 1),
          );
        if (e.key === "p") chapter(Math.max(0, chapterIndex - 1));
      }
    }
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  });
  useEffect(() => {
    if (outline) titleRef.current?.focus();
  }, [outline]);
  if (!loaded) return <Loading />;
  if (!project)
    return (
      <main className="empty-page">
        <Brand />
        <h1>This companion isn&apos;t on this shelf.</h1>
        <p>
          {error ||
            "Projects are stored in the browser where you created them."}
        </p>
        <Link href="/app" className="button primary">
          Go to your library
        </Link>
      </main>
    );
  const current = project.companion?.chapters[chapterIndex];
  const stats = coverage(project);
  const nav = [
    { id: "read", label: "Read", icon: BookOpen },
    { id: "practice", label: "Practice", icon: Check },
    { id: "sources", label: "Sources", icon: ShieldCheck },
    { id: "export", label: "Export", icon: Download },
  ];
  function exportFile(kind: string) {
    if (!project) return;
    const content =
      kind === "md"
        ? manuscript(project)
        : kind === "html"
          ? readingHtml(project)
          : kind === "csv"
            ? citationsCsv(project)
            : portableJson(project);
    const name =
      kind === "md"
        ? "manuscript.md"
        : kind === "html"
          ? "reading-copy.html"
          : kind === "csv"
            ? "citations.csv"
            : "watchread-project.json";
    download(
      name,
      content,
      kind === "html"
        ? "text/html"
        : kind === "json"
          ? "application/json"
          : "text/plain;charset=utf-8",
    );
    setToast(`Download requested: ${name}`);
  }
  return (
    <div className="studio">
      <aside className="studio-rail">
        <Link href="/app" className="rail-logo" aria-label="Your library">
          <BookOpen size={23} />
        </Link>
        <div className="rail-nav">
          {nav.map((n) => (
            <Link
              href={`/app/${id}/${n.id}`}
              key={n.id}
              className={view === n.id ? "active" : ""}
              aria-current={view === n.id ? "page" : undefined}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
            </Link>
          ))}
        </div>
        <div className="rail-bottom">
          <Link href="/app/new" aria-label="New companion">
            <Plus size={20} />
          </Link>
          <button onClick={() => setHelp(true)} aria-label="Keyboard shortcuts">
            ?
          </button>
        </div>
      </aside>
      <div className="studio-body">
        <header className="studio-header">
          <div className="breadcrumb">
            <Link href="/app">Your library</Link>
            <span>/</span>
            <strong>{project.title}</strong>
          </div>
          <div className="header-actions">
            <span className={`save-status ${saved ? "" : "unsaved"}`}>
              <span className="status-dot" />
              {saved
                ? "Saved on this device"
                : saveFailed
                  ? "Not saved"
                  : "Saving…"}
            </span>
            <button
              className="icon-button"
              aria-label="Edit chapter outline"
              onClick={() => setOutline(!outline)}
            >
              <Settings2 size={17} />
            </button>
          </div>
        </header>
        <div className="studio-subheader">
          <div>
            <span className="edition-label">
              {project.sourceType === "sample"
                ? "WATCHREAD EDITIONS / 001"
                : "YOUR LECTURE COMPANION"}
            </span>
            <h2>{project.title}</h2>
          </div>
          <div className="chapter-switch">
            <List size={16} />
            <select
              aria-label="Choose chapter"
              value={chapterIndex}
              onChange={(e) => chapter(Number(e.target.value))}
            >
              {project.companion?.chapters.map((c, i) => (
                <option value={i} key={c.id}>
                  {String(i + 1).padStart(2, "0")} · {c.title}
                </option>
              )) ?? <option>Source draft</option>}
            </select>
            <ChevronDown size={14} />
          </div>
        </div>
        {error && (
          <div className="studio-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}
        {project.status === "needs_review" && (
          <div className="revision-notice">
            The transcript changed. Previous citations and practice checks need
            to be regenerated. Regeneration sends transcript text to the
            configured remote model; video stays here.
            <button
              className="text-link"
              onClick={generate}
              disabled={Boolean(stage) || generationAvailable !== true}
            >
              Regenerate <RotateCcw size={14} />
            </button>
          </div>
        )}
        {generationAvailable === false && project.status !== "ready" && (
          <div className="revision-notice">
            AI composition is unavailable here. Your source is saved. Create a
            companion in the laptop version and restore its exported project
            here.{" "}
            <Link className="text-link" href="/guide">
              See how it works <ArrowRight size={14} />
            </Link>
          </div>
        )}
        {stage && (
          <div className="revision-notice" role="status">
            <LoaderCircle className="spin" size={16} />
            {stage}
            <button
              onClick={() => abort.current?.abort()}
              className="text-link"
            >
              Cancel
            </button>
          </div>
        )}
        <div
          className={`workspace ${view !== "read" && view !== "practice" ? "single-workspace" : ""}`}
        >
          {(view === "read" || view === "practice") && (
            <div
              className={`source-container ${mobileSource ? "mobile-open" : ""}`}
              role={mobileSource ? "dialog" : undefined}
              aria-modal={mobileSource ? true : undefined}
              aria-label={mobileSource ? "Source explanation" : undefined}
            >
              <button
                className="close-source icon-button"
                onClick={() => setMobileSource(false)}
                aria-label="Close source player"
              >
                <X size={21} />
              </button>
              <SourcePlayer
                project={project}
                url={mediaUrl}
                selection={selection}
                onSelect={select}
                onReconnect={reconnect}
              />
            </div>
          )}
          <div className="document-container">
            {!project.companion ? (
              <section className="draft-state">
                <div className="chapter-eyebrow">YOUR SOURCE IS SAVED</div>
                <h1>
                  Let&apos;s give it
                  <br />
                  <em>some shape.</em>
                </h1>
                <p>
                  {project.cues.length
                    ? "Your transcript is ready. Compose a companion with readable chapters, source references, and questions to think through."
                    : "Add a matching transcript to turn this recording into a companion. We won't invent what the recording says."}
                </p>
                {project.cues.length ? (
                  <>
                    <button
                      className="button primary"
                      onClick={generate}
                      disabled={Boolean(stage) || generationAvailable !== true}
                    >
                      Compose companion <ArrowRight size={17} />
                    </button>
                    <p className="field-help">
                      Composition sends transcript text to the configured remote
                      model. Your video stays on this device.
                    </p>
                  </>
                ) : (
                  <label className="button primary">
                    Add transcript
                    <input
                      type="file"
                      accept=".srt,.vtt,.txt"
                      className="visually-hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0])
                          void replace(e.target.files[0]);
                      }}
                    />
                  </label>
                )}
              </section>
            ) : view === "read" && current ? (
              <article className="book-page">
                <div className="book-running">
                  <span>
                    {project.sourceType === "sample"
                      ? "A FIELD GUIDE TO THE LIFE OF A LEAF"
                      : "YOUR LECTURE, RECONSIDERED"}
                  </span>
                  <button
                    className="icon-button"
                    onClick={() => setOutline(true)}
                    aria-label="Open outline"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <div className="chapter-eyebrow">
                  <span className="tiny-line" />
                  CHAPTER {String(chapterIndex + 1).padStart(2, "0")}
                </div>
                <h1>{current.title}</h1>
                <p className="chapter-goal">{current.goal}</p>
                <div className="book-rule">
                  <span>READ AT YOUR PACE. THE SOURCE IS ALWAYS CLOSE.</span>
                </div>
                <div className="book-prose">
                  {current.claims.map((claim, i) => (
                    <div
                      className={`claim-block ${claim.status !== "supported" ? "uncertain" : ""}`}
                      key={claim.id}
                    >
                      {i === 0 && (
                        <span className="margin-number">
                          {String(chapterIndex + 1).padStart(2, "0")}.1
                        </span>
                      )}
                      <button
                        className={`claim-text ${i === 0 ? "first-claim" : ""} ${selection?.ids[0] === claim.cueIds[0] ? "selected-claim" : ""}`}
                        disabled={
                          claim.status === "stale" || !claim.cueIds.length
                        }
                        onClick={() => select(claim.cueIds, true)}
                      >
                        {claim.text}
                      </button>
                      <button
                        className="citation-chip"
                        disabled={
                          claim.status === "stale" || !claim.cueIds.length
                        }
                        onClick={() => select(claim.cueIds, true)}
                      >
                        <Link2 size={11} />
                        {claim.status === "stale"
                          ? "Source changed"
                          : evidenceLabel(project.cues, claim.cueIds)}
                        <MoveArrow />
                      </button>
                      {claim.status !== "supported" && (
                        <p className="claim-warning">
                          <AlertCircle size={13} />
                          {claim.status === "stale"
                            ? "Source changed"
                            : "Needs review"}{" "}
                          · {claim.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {project.sourceType === "sample" && chapterIndex === 0 && (
                  <div className="book-illustration">
                    <Botanical />
                    <div>
                      <span className="eyebrow">FIELD NOTE 01</span>
                      <p>
                        What looks like a leaf
                        <br />
                        is a meeting of
                        <br />
                        <em>air, water, and light.</em>
                      </p>
                    </div>
                  </div>
                )}
                {project.status !== "needs_review" &&
                  project.companion.glossary.length > 0 && (
                    <details className="chapter-glossary">
                      <summary>
                        A few useful words <ChevronDown size={16} />
                      </summary>
                      <dl>
                        {project.companion.glossary.map((item) => (
                          <div key={item.term}>
                            <dt>{item.term}</dt>
                            <dd>{item.definition}</dd>
                            <button
                              className="text-link"
                              onClick={() => select(item.cueIds, true)}
                            >
                              <Link2 size={12} />{" "}
                              {evidenceLabel(project.cues, item.cueIds)}
                            </button>
                          </div>
                        ))}
                      </dl>
                    </details>
                  )}
                <div className="chapter-end">
                  <div>
                    <span className="eyebrow">PAUSE FOR A MOMENT</span>
                    <h3>What stayed with you?</h3>
                    <p>A small question. A chance to connect the ideas.</p>
                  </div>
                  <Link
                    className="button secondary"
                    href={`/app/${id}/practice`}
                  >
                    Try a chapter check <ArrowRight size={15} />
                  </Link>
                </div>
                <footer className="book-folio">
                  <button
                    disabled={chapterIndex === 0}
                    onClick={() => chapter(chapterIndex - 1)}
                  >
                    <ArrowLeft size={14} />
                    Previous
                  </button>
                  <span>
                    WATCHREAD / {String(chapterIndex + 1).padStart(2, "0")}
                  </span>
                  <button
                    disabled={
                      chapterIndex === project.companion.chapters.length - 1
                    }
                    onClick={() => chapter(chapterIndex + 1)}
                  >
                    Next chapter
                    <ArrowRight size={14} />
                  </button>
                </footer>
              </article>
            ) : view === "practice" ? (
              <Practice
                key={`${current?.id}-${project.run?.id ?? project.revision}`}
                project={project}
                chapterIndex={chapterIndex}
                onUpdate={update}
                onSource={select}
              />
            ) : view === "sources" ? (
              <section className="sources-page">
                <p className="eyebrow">KNOW WHERE THE WORDS COME FROM</p>
                <h1>
                  Keep the source
                  <br />
                  <em>in sight.</em>
                </h1>
                <p className="page-intro">
                  A reference takes you back to the lecture. It doesn&apos;t
                  make the lecture infallible.
                </p>
                <div className="source-summary">
                  <div>
                    <strong>
                      {stats.total
                        ? Math.round((stats.linked / stats.total) * 100)
                        : 0}
                      <small>%</small>
                    </strong>
                    <span>Citation coverage</span>
                    <p>
                      {stats.linked} of {stats.total} chapter claims and
                      glossary definitions have current source references.
                    </p>
                  </div>
                  <div>
                    <strong>
                      {stats.reviewed}
                      <small> / {stats.total}</small>
                    </strong>
                    <span>Source-supported claims</span>
                    <p>
                      {project.run
                        ? "Separate model review"
                        : "Imported review labels; no generation record"}
                      . No calibrated confidence score.
                    </p>
                  </div>
                </div>
                <div className="source-toolbar">
                  <h3>The evidence, passage by passage.</h3>
                  <select
                    aria-label="Filter sources"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All claims</option>
                    <option value="review">Needs review</option>
                    <option value="supported">Supported</option>
                  </select>
                </div>
                <div className="evidence-list">
                  {evidenceClaims(project)
                    .filter(
                      (c) =>
                        filter === "all" ||
                        (filter === "supported"
                          ? c.status === "supported"
                          : c.status !== "supported"),
                    )
                    .map((c) => (
                      <article className="evidence-row" key={c.id}>
                        <span
                          className={`evidence-status ${c.status !== "supported" ? "amber" : ""}`}
                        >
                          {c.status === "supported" ? (
                            <Check size={13} />
                          ) : (
                            <AlertCircle size={13} />
                          )}{" "}
                          {c.status === "supported"
                            ? "Source supported"
                            : "Needs review"}
                        </span>
                        <h4>{c.text}</h4>
                        <span className="claim-kind">
                          {c.kind === "quotation"
                            ? "Direct quotation"
                            : c.kind === "inference"
                              ? "Inference"
                              : "Paraphrase"}
                        </span>
                        <blockquote>
                          {c.status === "stale"
                            ? "The source has changed. Regenerate to reconnect this claim."
                            : passage(project.cues, c.cueIds)
                                .map((x) => x.text)
                                .join(" ")}
                        </blockquote>
                        <button
                          disabled={c.status === "stale"}
                          className="text-link"
                          onClick={() => {
                            select(c.cueIds, true);
                            setMobileSource(true);
                          }}
                        >
                          <Play size={13} />
                          {evidenceLabel(project.cues, c.cueIds)}
                        </button>
                        <small>{c.reason}</small>
                      </article>
                    ))}
                </div>
                <div className="source-management">
                  <h3>The source record</h3>
                  <p>{project.attribution}</p>
                  <p>
                    {project.run
                      ? `Generated with ${project.run.model} · ${project.run.requests} model requests · ${(project.run.durationMs / 1000).toFixed(1)} seconds`
                      : "No generation record is attached to this version."}
                  </p>
                  <p className="hash-label">
                    Revision {project.revision.slice(0, 16)}
                  </p>
                  <label className="button secondary small">
                    Replace transcript
                    <input
                      type="file"
                      accept=".srt,.vtt,.txt"
                      className="visually-hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0])
                          void replace(e.target.files[0]);
                      }}
                    />
                  </label>
                  <p className="field-help">
                    Replacing the transcript marks existing citations and
                    questions as stale. The previous companion is retained.
                  </p>
                  {project.previousSource && project.previousCompanion && (
                    <button
                      className="text-link"
                      onClick={() => {
                        update(restoreSource(project));
                        setSelection(null);
                        setToast("Previous source and companion restored");
                      }}
                    >
                      <RotateCcw size={14} />
                      Restore previous source and companion
                    </button>
                  )}
                </div>
              </section>
            ) : (
              <section className="export-page">
                <p className="eyebrow">TAKE THE IDEAS WITH YOU</p>
                <h1>
                  A companion
                  <br />
                  <em>beyond this screen.</em>
                </h1>
                <p className="page-intro">
                  Keep the words. Keep their sources. Make a copy that fits the
                  way you study.
                </p>
                <div className="export-grid">
                  {[
                    {
                      kind: "md",
                      title: "The manuscript",
                      format: "MARKDOWN",
                      description:
                        "Readable chapters and source references. Ready for your notes app.",
                    },
                    {
                      kind: "html",
                      title: "The reading copy",
                      format: "HTML",
                      description:
                        "An elegant, self-contained document. Open it in a browser or print it.",
                    },
                    {
                      kind: "csv",
                      title: "The source index",
                      format: "CSV",
                      description:
                        "Every claim, its source passage, and review status in a spreadsheet.",
                    },
                    {
                      kind: "json",
                      title: "The whole companion",
                      format: "PROJECT JSON",
                      description:
                        "Chapters, transcript, and attempts. Restore it here; reconnect the video.",
                    },
                  ].map((item) => (
                    <button
                      className="export-card"
                      onClick={() => exportFile(item.kind)}
                      key={item.kind}
                    >
                      <div>
                        <FileText size={25} />
                        <span>{item.format}</span>
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <span className="text-link">
                        Download <Download size={15} />
                      </span>
                    </button>
                  ))}
                </div>
                <div className="print-promo">
                  <BookOpen size={26} />
                  <div>
                    <h3>For a quieter kind of reading.</h3>
                    <p>
                      Preview a book-like reading copy. Browser print layout may
                      vary.
                    </p>
                  </div>
                  <button
                    className="button secondary small"
                    onClick={() => setPrint(true)}
                  >
                    Preview <ArrowRight size={15} />
                  </button>
                </div>
                <p className="export-note">
                  Sources and review labels travel with your text. Video files
                  stay on your device.
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
      {(view === "read" || view === "practice") && (
        <button
          className="mobile-source-button"
          onClick={() => setMobileSource(true)}
        >
          <Play size={14} />
          Open source{" "}
          <span>
            {selection
              ? evidenceLabel(project.cues, selection.ids)
              : "Lecture & transcript"}
          </span>
        </button>
      )}
      {mobileSource && (view === "sources" || view === "export") && (
        <div className="modal-backdrop" onClick={() => setMobileSource(false)}>
          <div
            className="source-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Source explanation"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              onClick={() => setMobileSource(false)}
              aria-label="Close source"
            >
              <X size={20} />
            </button>
            <SourcePlayer
              project={project}
              url={mediaUrl}
              selection={selection}
              onSelect={select}
              onReconnect={reconnect}
            />
          </div>
        </div>
      )}
      {outline && (
        <div className="modal-backdrop" onClick={() => setOutline(false)}>
          <section
            className="outline-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Chapter outline"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-heading">
              <span className="eyebrow">MAKE IT YOUR OWN</span>
              <button
                className="icon-button"
                aria-label="Close outline"
                onClick={() => setOutline(false)}
              >
                <X size={20} />
              </button>
            </div>
            <h2>The shape of your companion.</h2>
            <p>
              Rename or reorder chapters. Their source references stay
              connected.
            </p>
            {project.companion?.chapters.map((c, i) => (
              <div className="outline-row" key={c.id}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <input
                  ref={i === 0 ? titleRef : undefined}
                  aria-label={`Chapter ${i + 1} title`}
                  value={c.title}
                  maxLength={200}
                  onChange={(e) => {
                    const companion = structuredClone(project.companion!);
                    companion.chapters[i].title =
                      e.target.value || "Untitled chapter";
                    update({
                      ...project,
                      companion,
                      updatedAt: new Date().toISOString(),
                    });
                  }}
                />
                <button
                  className="icon-button"
                  disabled={i === 0}
                  aria-label={`Move chapter ${i + 1} up`}
                  onClick={() => {
                    const companion = structuredClone(project.companion!);
                    [companion.chapters[i - 1], companion.chapters[i]] = [
                      companion.chapters[i],
                      companion.chapters[i - 1],
                    ];
                    update({ ...project, companion });
                    chapter(i - 1);
                  }}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  className="icon-button"
                  disabled={i === project.companion!.chapters.length - 1}
                  aria-label={`Move chapter ${i + 1} down`}
                  onClick={() => {
                    const companion = structuredClone(project.companion!);
                    [companion.chapters[i + 1], companion.chapters[i]] = [
                      companion.chapters[i],
                      companion.chapters[i + 1],
                    ];
                    update({ ...project, companion });
                    chapter(i + 1);
                  }}
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            ))}
            <button
              className="button primary"
              onClick={() => setOutline(false)}
            >
              Back to reading <Check size={16} />
            </button>
          </section>
        </div>
      )}
      {print && (
        <div className="modal-backdrop">
          <section
            className="print-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Reading copy preview"
          >
            <div>
              <h3>Reading copy</h3>
              <button
                className="button secondary small"
                onClick={() => {
                  const frame =
                    document.querySelector<HTMLIFrameElement>("#print-frame");
                  frame?.contentWindow?.print();
                }}
              >
                <Printer size={14} />
                Print
              </button>
              <button
                className="icon-button"
                aria-label="Close preview"
                onClick={() => setPrint(false)}
              >
                <X size={20} />
              </button>
            </div>
            <iframe
              id="print-frame"
              title="Book reading copy"
              srcDoc={readingHtml(project)}
            />
          </section>
        </div>
      )}
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            className="outline-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            <div className="dialog-heading">
              <h2>A few quiet shortcuts.</h2>
              <button
                className="icon-button"
                aria-label="Close shortcuts"
                onClick={() => setHelp(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p>
              <kbd>n</kbd> Next chapter
            </p>
            <p>
              <kbd>p</kbd> Previous chapter
            </p>
            <p>
              <kbd>?</kbd> This sheet
            </p>
            <p>
              Use Tab and Enter to follow a source passage. Video controls have
              their own keyboard controls.
            </p>
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={15} />
          {toast}
        </div>
      )}
    </div>
  );
}
function MoveArrow() {
  return <ArrowRight size={10} />;
}
