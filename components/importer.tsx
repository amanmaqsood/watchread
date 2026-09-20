"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Video,
  Check,
  LoaderCircle,
  BookOpen,
} from "lucide-react";
import { Brand } from "./ui";
import { Cue, Project, validateCues, validateProject } from "@/lib/domain";
import { serializeCues } from "@/lib/domain";
import { parseTranscript, hashData } from "@/lib/import";
import { saveMedia, saveProject } from "@/lib/storage";
import { generateCompanion } from "@/lib/client-generation";

export function Importer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<File | null>(null);
  const [rights, setRights] = useState<Project["rights"]>("owner");
  const [error, setError] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [warning, setWarning] = useState("");
  const [stage, setStage] = useState("");
  const [config, setConfig] = useState<{
    available: boolean;
    provider: string;
    model: string;
    reason?: string;
    requiresCode?: boolean;
  } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    setDemoCode(sessionStorage.getItem("watchread-demo-code") || "");
    fetch("/api/status")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() =>
        setConfig({ available: false, provider: "Unavailable", model: "" }),
      );
    return () => controller.current?.abort();
  }, []);
  async function importJson(file: File) {
    setError("");
    try {
      if (file.size > 2 * 1024 * 1024)
        throw Error("Project JSON exceeds 2 MB.");
      const project = validateProject(JSON.parse(await file.text()));
      if (project.revision !== (await hashData(serializeCues(project.cues))))
        throw Error(
          "This project's source fingerprint does not match its transcript.",
        );
      if (
        project.previousSource &&
        project.previousSource.revision !==
          (await hashData(serializeCues(project.previousSource.cues)))
      )
        throw Error(
          "The previous source fingerprint does not match its transcript.",
        );
      project.id = `import-${crypto.randomUUID()}`;
      project.sourceType = "upload";
      if (project.media) delete project.media.sampleUrl;
      project.updatedAt = new Date().toISOString();
      await saveProject(project);
      router.push(`/app/${project.id}/read`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not restore this project.",
      );
    }
  }
  async function submit() {
    setError("");
    setWarning("");
    setStage("Reading your source");
    controller.current = new AbortController();
    try {
      if (!video && !transcript)
        throw Error("Add a transcript or recording to get started.");
      let cues: Cue[] = [];
      if (transcript)
        cues = parseTranscript(await transcript.text(), transcript.name);
      let media: Project["media"] = null;
      if (video) {
        if (video.size > 150 * 1024 * 1024)
          throw Error("Recording exceeds the 150 MB limit.");
        if (!/\.(mp4|webm)$/i.test(video.name))
          throw Error("Choose an MP4 or WebM recording.");
        const url = URL.createObjectURL(video);
        try {
          const duration = await new Promise<number>((resolve, reject) => {
            const element = document.createElement("video");
            const timer = setTimeout(
              () => reject(Error("Could not read this recording.")),
              10000,
            );
            element.onloadedmetadata = () => {
              clearTimeout(timer);
              resolve(element.duration);
            };
            element.onerror = () => {
              clearTimeout(timer);
              reject(
                Error(
                  "This browser cannot play that recording. Try an H.264 MP4.",
                ),
              );
            };
            element.src = url;
          });
          if (!Number.isFinite(duration) || duration > 1800)
            throw Error("Use a recording up to 30 minutes long.");
          media = {
            name: video.name,
            hash: await hashData(await video.arrayBuffer()),
            duration,
            size: video.size,
            mime: video.type || "video/mp4",
          };
          if (cues.length) validateCues(cues, duration);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      const now = new Date().toISOString();
      const id = projectId ?? crypto.randomUUID();
      setProjectId(id);
      const revision = await hashData(serializeCues(cues));
      let project: Project = {
        schemaVersion: 1,
        id,
        title:
          title.trim() ||
          transcript?.name.replace(/\.[^.]+$/, "") ||
          video!.name.replace(/\.[^.]+$/, ""),
        sourceType: "upload",
        rights,
        attribution:
          rights === "owner"
            ? "Ownership declared by the uploader."
            : rights === "licensed"
              ? "Permission declared by the uploader."
              : "Exploration only; adaptation rights not confirmed.",
        createdAt: now,
        updatedAt: now,
        revision,
        cues,
        companion: null,
        attempts: [],
        media,
        run: null,
        status: "draft",
      };
      await saveProject(project);
      if (video) {
        try {
          await saveMedia(id, video);
        } catch {
          setWarning(
            "Your source text is saved. Browser storage could not retain the video; reconnect it in the reader.",
          );
        }
      }
      if (!cues.length || !config?.available) {
        router.push(`/app/${id}/read`);
        return;
      }
      const result = await generateCompanion(
        project.title,
        cues,
        controller.current.signal,
        setStage,
      );
      project = {
        ...project,
        title: result.companion.title,
        ...result,
        status: "ready",
        updatedAt: new Date().toISOString(),
      };
      await saveProject(project);
      router.push(`/app/${id}/read`);
    } catch (e) {
      setError(
        e instanceof Error && e.name === "AbortError"
          ? "Composition cancelled. Your imported source remains in your library."
          : e instanceof Error
            ? e.message
            : "Could not create this companion.",
      );
    } finally {
      setStage("");
    }
  }
  return (
    <main className="import-page">
      <nav className="landing-nav">
        <Brand />
        <Link href="/app">
          <ArrowLeft size={15} />
          Your library
        </Link>
      </nav>
      <div className="import-layout">
        <aside className="import-aside">
          <span className="eyebrow">A NEW COMPANION</span>
          <h1>
            Turn your lecture
            <br />
            into a
            <br />
            <em>study book.</em>
          </h1>
          <p>
            Start with the transcript.
            <br />
            Add the recording for source playback.
          </p>
          <div className="import-steps">
            <div>
              <span>01</span>
              <p>
                <strong>Bring your source</strong>Recording and transcript,
                together.
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                <strong>Make a companion</strong>Readable chapters, tied to the
                source.
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                <strong>Find your way through</strong>Read, revisit, and try
                again.
              </p>
            </div>
          </div>
          <Link className="text-link" href="/app/photosynthesis/read">
            Explore the prepared sample <ArrowRight size={15} />
          </Link>
        </aside>
        <section className="import-form">
          <div className="form-top">
            <BookOpen size={21} />
            <span>YOUR SOURCE MATERIAL</span>
            <span>01 / 03</span>
          </div>
          <h2>What are we learning?</h2>
          <label className="field-label">
            Companion title
            <input
              className="text-input"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The surprisingly useful world of probability"
              disabled={Boolean(stage)}
            />
          </label>
          <div className="upload-grid">
            <label className={`upload-zone ${transcript ? "has-file" : ""}`}>
              <input
                type="file"
                accept=".vtt,.srt,.txt"
                disabled={Boolean(stage)}
                onChange={(e) => setTranscript(e.target.files?.[0] ?? null)}
              />
              {transcript ? <Check size={24} /> : <FileText size={24} />}
              <strong>{transcript?.name ?? "Add a transcript"}</strong>
              <span>VTT, SRT, or TXT · up to 1 MB</span>
              <small>{transcript ? "Ready to read" : "Choose file"}</small>
            </label>
            <label className={`upload-zone ${video ? "has-file" : ""}`}>
              <input
                type="file"
                accept="video/mp4,video/webm,.mp4,.webm"
                disabled={Boolean(stage)}
                onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
              />
              {video ? <Check size={24} /> : <Video size={24} />}
              <strong>{video?.name ?? "Add the recording"}</strong>
              <span>MP4 or WebM · up to 150 MB</span>
              <small>
                {video ? "Ready to play" : "Optional · enables source playback"}
              </small>
            </label>
          </div>
          <p className="field-help">
            Try it with our{" "}
            <a
              className="text-link"
              href="/sample/practice-lesson.txt"
              download
            >
              short practice transcript
            </a>
            .
          </p>
          <p className="field-help">
            Timestamped transcripts connect passages to the recording. Plain
            text works too, with text references.
          </p>
          <label className="field-label">
            Your relationship to this recording
            <select
              value={rights}
              onChange={(e) => setRights(e.target.value as Project["rights"])}
              disabled={Boolean(stage)}
            >
              <option value="owner">I created or own this recording</option>
              <option value="licensed">I have permission to adapt it</option>
              <option value="exploring">
                I&apos;m exploring for personal study
              </option>
            </select>
          </label>
          <div className="privacy-note">
            <span className="status-dot" />
            <p>
              The video stays on this device. When you compose, transcript text
              is sent to{" "}
              {config?.available
                ? config.provider === "Local Claude"
                  ? "Claude's remote model through this laptop"
                  : config.provider
                : "the configured remote model"}
              .
            </p>
          </div>
          {config && !config.available && (
            <p className="notice">
              {config.reason ??
                "Live composition isn't configured. You can save your source and use the prepared sample."}
            </p>
          )}
          {warning && <p className="notice">{warning}</p>}
          {error && (
            <p className="error-notice" role="alert">
              {error}
              {projectId && (
                <>
                  {" "}
                  <Link href={`/app/${projectId}/read`}>Open saved source</Link>
                </>
              )}
            </p>
          )}
          {config?.available && config.requiresCode && (
            <label className="field-label">
              Presenter demo code
              <input
                className="text-input"
                type="password"
                value={demoCode}
                autoComplete="off"
                placeholder="Ask the presenter for live composition access"
                onChange={(e) => {
                  setDemoCode(e.target.value);
                  sessionStorage.setItem("watchread-demo-code", e.target.value);
                }}
              />
              <span className="field-help">
                Only new AI composition needs a code. Prepared lessons are open
                to everyone.
              </span>
            </label>
          )}
          {stage ? (
            <div className="compose-progress" aria-live="polite">
              <LoaderCircle className="spin" size={22} />
              <div>
                <strong>{stage}</strong>
                <span>
                  Your source is saved. You can cancel and return later.
                </span>
              </div>
              <button
                className="text-link"
                onClick={() => controller.current?.abort()}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="button primary full"
              onClick={submit}
              disabled={!video && !transcript}
            >
              {transcript && config?.available
                ? "Compose my companion"
                : "Save my source"}
              <ArrowRight size={18} />
            </button>
          )}
          <div className="import-bottom">
            <label className="text-link">
              <Upload size={14} />
              Restore an exported project
              <input
                type="file"
                accept=".json"
                className="visually-hidden"
                disabled={Boolean(stage)}
                onChange={(e) => {
                  if (e.target.files?.[0]) void importJson(e.target.files[0]);
                }}
              />
            </label>
            <span>No account needed</span>
          </div>
        </section>
      </div>
    </main>
  );
}
