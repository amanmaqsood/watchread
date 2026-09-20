"use client";
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  FileText,
  Link2,
  ChevronDown,
  VideoOff,
} from "lucide-react";
import { Project, time, passage } from "@/lib/domain";
export type Selection = { ids: string[]; play: boolean; nonce: number };
export function SourcePlayer({
  project,
  url,
  selection,
  onSelect,
  onReconnect,
}: {
  project: Project;
  url: string;
  selection: Selection | null;
  onSelect: (ids: string[], play?: boolean) => void;
  onReconnect: (file: File) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [buffering, setBuffering] = useState(false);
  const [transcript, setTranscript] = useState(true);
  const end = useRef<number | null>(null);
  useEffect(() => {
    const element = video.current;
    if (!element || !selection) return;
    const cues = passage(project.cues, selection.ids);
    const cue = cues[0];
    if (cue?.start == null) return;
    let cancelled = false;
    const seek = () => {
      if (cancelled) return;
      end.current = selection.play ? cue.end : null;
      element.currentTime = cue.start!;
      setCurrent(cue.start!);
      if (selection.play)
        void element
          .play()
          .catch(() =>
            setError("Press Play to hear the selected explanation."),
          );
    };
    if (element.readyState >= 1) seek();
    else element.addEventListener("loadedmetadata", seek, { once: true });
    return () => {
      cancelled = true;
      element.removeEventListener("loadedmetadata", seek);
    };
  }, [selection, project.cues, url]);
  const active = project.cues.find(
    (c) =>
      c.start != null && c.end != null && current >= c.start && current < c.end,
  );
  useEffect(() => {
    if (!selection) return;
    const child = Array.from(
      list.current?.querySelectorAll<HTMLElement>("[data-cue]") ?? [],
    ).find((el) => el.dataset.cue === selection.ids[0]);
    if (child && list.current)
      list.current.scrollTo({
        top: child.offsetTop - 20,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }, [selection]);
  return (
    <aside className="source-panel" id="source-panel">
      <div className="panel-label">
        <span>
          <span className="status-dot" />
          THE ORIGINAL EXPLANATION
        </span>
        <span>
          {project.media ? time(project.media.duration) : "TEXT SOURCE"}
        </span>
      </div>
      <div className="video-frame">
        {url ? (
          <video
            ref={video}
            src={url}
            poster={
              project.sourceType === "sample"
                ? "/sample/poster.webp"
                : undefined
            }
            controls
            preload="metadata"
            playsInline
            onLoadStart={() => setBuffering(true)}
            onLoadedData={() => setBuffering(false)}
            onWaiting={() => setBuffering(true)}
            onCanPlay={() => setBuffering(false)}
            onPlaying={() => setBuffering(false)}
            onTimeUpdate={(e) => {
              const t = e.currentTarget.currentTime;
              setCurrent(t);
              if (end.current != null && t >= end.current) {
                e.currentTarget.pause();
                end.current = null;
              }
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => {
              setBuffering(false);
              setError(
                "This recording could not be played. Reconnect a compatible MP4 or WebM.",
              );
            }}
          >
            <track
              kind="captions"
              src={
                project.sourceType === "sample"
                  ? "/sample/transcript.vtt"
                  : undefined
              }
              srcLang="en"
              label="English"
            />
          </video>
        ) : (
          <div className="missing-video">
            <VideoOff size={30} />
            <h3>
              {project.media
                ? "Reconnect your recording"
                : "Your words are here."}
            </h3>
            <p>
              {project.media
                ? "The saved text is available. Choose the original file to restore playback."
                : "Add the matching recording for source playback. Text references work without it."}
            </p>
            <label className="button secondary small">
              Choose recording
              <input
                type="file"
                accept=".mp4,.webm"
                className="visually-hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) onReconnect(e.target.files[0]);
                }}
              />
            </label>
          </div>
        )}
      </div>
      {url && buffering && (
        <p className="media-loading" role="status">
          Loading the recording… Your selected passage will open when it&apos;s
          ready.
        </p>
      )}
      <div className="player-caption">
        <Volume2 size={13} />
        <span>
          {project.sourceType === "sample"
            ? "Original lesson · Synthetic narration"
            : (project.media?.name ?? "Transcript only")}
        </span>
        <span className="time-display" data-testid="timecode">
          {time(current)}
        </span>
      </div>
      {error && (
        <p className="error-notice" role="alert">
          {error}
        </p>
      )}
      {selection && (
        <div className="selected-source">
          <div className="selected-heading">
            <Link2 size={13} />
            <span>YOUR SELECTED PASSAGE</span>
            {url && passage(project.cues, selection.ids)[0]?.start != null && (
              <button
                aria-label={playing ? "Pause source clip" : "Play source clip"}
                className="icon-button"
                onClick={() => {
                  if (playing) video.current?.pause();
                  else onSelect(selection.ids, true);
                }}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
            )}
          </div>
          <p>
            {passage(project.cues, selection.ids)[0]?.text ??
              "This source reference is no longer current."}
          </p>
          {selection.ids.length > 1 && (
            <div className="passage-options">
              {passage(project.cues, selection.ids).map((c, i) => (
                <button key={c.id} onClick={() => onSelect([c.id], true)}>
                  Passage {i + 1} · {time(c.start)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <button
        className="transcript-heading"
        onClick={() => setTranscript(!transcript)}
        aria-expanded={transcript}
      >
        <span>
          <FileText size={15} />
          Lecture transcript
        </span>
        <ChevronDown size={16} className={!transcript ? "rotate" : ""} />
      </button>
      {transcript && (
        <div className="transcript-list" ref={list}>
          {project.cues.length ? (
            project.cues.map((c) => (
              <button
                data-cue={c.id}
                key={c.id}
                className={`transcript-cue ${selection?.ids.includes(c.id) ? "selected" : ""} ${active?.id === c.id ? "current" : ""}`}
                onClick={() => onSelect([c.id], true)}
              >
                <span>{time(c.start)}</span>
                <p>{c.text}</p>
              </button>
            ))
          ) : (
            <p className="empty-hint">
              Add a transcript to connect this recording to a companion.
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
