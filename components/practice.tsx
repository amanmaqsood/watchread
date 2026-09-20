"use client";
import { useState } from "react";
import {
  ArrowRight,
  RotateCcw,
  Play,
  CheckCircle2,
  Lightbulb,
  Check,
} from "lucide-react";
import {
  Project,
  Attempt,
  Check as ChapterCheck,
  evidenceLabel,
  isCurrentAttempt,
} from "@/lib/domain";
export function Practice({
  project,
  chapterIndex,
  onUpdate,
  onSource,
}: {
  project: Project;
  chapterIndex: number;
  onUpdate: (p: Project) => void;
  onSource: (ids: string[], play?: boolean) => void;
}) {
  const chapter = project.companion!.chapters[chapterIndex];
  const questions = chapter.checks.filter((q) => q.status === "supported");
  const latest = project.attempts
    .filter(
      (a) => a.checkId === questions[0]?.id && isCurrentAttempt(a, project),
    )
    .at(-1);
  const [index, setIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(latest?.id ?? null);
  const [recover, setRecover] = useState(Boolean(latest?.recoveryChoiceId));
  const [currentChoice, setCurrentChoice] = useState(
    latest?.recoveryChoiceId ?? "",
  );
  const q = questions[Math.min(index, questions.length - 1)];
  const attempt = project.attempts.find((a) => a.id === attemptId);
  const choice = q?.choices.find((c) => c.id === attempt?.choiceId);
  function answer(check: ChapterCheck, choiceId: string) {
    const a: Attempt = {
      id: crypto.randomUUID(),
      checkId: check.id,
      revision: project.revision,
      runId: project.run?.id ?? project.revision,
      choiceId,
      correct: choiceId === check.correctId,
      createdAt: new Date().toISOString(),
      clipOpened: false,
    };
    setAttemptId(a.id);
    onUpdate({
      ...project,
      attempts: [...project.attempts, a],
      updatedAt: new Date().toISOString(),
    });
  }
  function patch(values: Partial<Attempt>) {
    onUpdate({
      ...project,
      attempts: project.attempts.map((a) =>
        a.id === attemptId ? { ...a, ...values } : a,
      ),
      updatedAt: new Date().toISOString(),
    });
  }
  if (!q)
    return (
      <div className="practice-empty">
        <Lightbulb size={32} />
        <h2>A little more source review first.</h2>
        <p>
          This chapter&apos;s questions are waiting for supported explanations.
          Read its source passages or regenerate the companion.
        </p>
      </div>
    );
  return (
    <section className="practice-page">
      <div className="eyebrow">A MOMENT TO MAKE IT YOURS</div>
      <div className="practice-title">
        <h1>{recover ? "Try a new angle." : "What stayed with you?"}</h1>
        <span>{chapter.title}</span>
      </div>
      <div className="question-card">
        <div className="question-meta">
          <span>
            {recover ? "RECOVERY CHECK" : "CHAPTER CHECK"} ·{" "}
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>{q.concept}</span>
        </div>
        <h2>{recover ? q.recovery.question : q.question}</h2>
        <div className="answer-options">
          {(recover ? q.recovery.choices : q.choices).map((c, i) => {
            const selected = recover
              ? currentChoice === c.id
              : attempt?.choiceId === c.id;
            const answered = recover
              ? Boolean(currentChoice)
              : Boolean(attempt);
            const right =
              c.id === (recover ? q.recovery.correctId : q.correctId);
            return (
              <button
                key={c.id}
                disabled={answered}
                className={`answer-option ${selected ? "chosen" : ""} ${answered && right ? "correct" : ""} ${selected && !right ? "incorrect" : ""}`}
                onClick={() => {
                  if (recover) {
                    setCurrentChoice(c.id);
                    patch({
                      recoveryChoiceId: c.id,
                      recoveryCorrect: c.id === q.recovery.correctId,
                    });
                  } else answer(q, c.id);
                }}
              >
                <span className="answer-letter">
                  {answered && right ? (
                    <Check size={15} />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span>{c.text}</span>
              </button>
            );
          })}
        </div>
        {attempt && !recover && (
          <div
            className={`answer-feedback ${attempt.correct ? "positive" : ""}`}
            role="status"
          >
            <div>
              <Lightbulb size={20} />
              <h3>
                {attempt.correct
                  ? "That's the connection."
                  : "A useful thing to untangle."}
              </h3>
            </div>
            <p>{choice?.explanation}</p>
            <button
              className="button secondary small"
              onClick={() => {
                patch({ clipOpened: true });
                onSource(choice?.cueIds ?? q.cueIds, true);
              }}
            >
              <Play size={14} />
              Revisit the explanation{" "}
              <span>
                {evidenceLabel(project.cues, choice?.cueIds ?? q.cueIds)}
              </span>
            </button>
            <button
              className="text-link recovery-link"
              onClick={() => setRecover(true)}
            >
              Try a different question <ArrowRight size={15} />
            </button>
          </div>
        )}
        {recover && currentChoice && (
          <div
            className={`answer-feedback ${currentChoice === q.recovery.correctId ? "positive" : ""}`}
            role="status"
          >
            <div>
              <CheckCircle2 size={20} />
              <h3>
                {currentChoice === q.recovery.correctId
                  ? "A new question. A clearer connection."
                  : "Keep the explanation close."}
              </h3>
            </div>
            <p>{q.recovery.explanation}</p>
            <button
              className="text-link"
              onClick={() => onSource(q.recovery.cueIds, true)}
            >
              Return to this source <Play size={13} />
            </button>
          </div>
        )}
      </div>
      {attempt && (
        <div className="recovery-trail">
          <div className="eyebrow">YOUR RECOVERY TRAIL</div>
          <div className="trail-steps">
            <div>
              <span
                className={attempt.correct ? "trail-dot good" : "trail-dot"}
              />
              <strong>
                {attempt.correct
                  ? "First answer correct"
                  : "An idea to revisit"}
              </strong>
              <small>First attempt</small>
            </div>
            <div>
              <span
                className={
                  attempt.clipOpened ? "trail-dot good" : "trail-dot pending"
                }
              />
              <strong>
                {attempt.clipOpened ? "Source opened" : "Revisit the source"}
              </strong>
              <small>The original explanation</small>
            </div>
            <div>
              <span
                className={
                  attempt.recoveryCorrect
                    ? "trail-dot good"
                    : "trail-dot pending"
                }
              />
              <strong>
                {attempt.recoveryChoiceId
                  ? attempt.recoveryCorrect
                    ? "New answer correct"
                    : "Keep exploring"
                  : "A different question"}
              </strong>
              <small>
                {attempt.recoveryChoiceId
                  ? "Recovery attempt recorded"
                  : "Your next step"}
              </small>
            </div>
          </div>
          <p>A record of your attempts, not a measure of lasting mastery.</p>
        </div>
      )}
      <div className="practice-bottom">
        <button
          className="text-link"
          onClick={() => {
            setAttemptId(null);
            setRecover(false);
            setCurrentChoice("");
            if (questions.length > 1) setIndex((index + 1) % questions.length);
          }}
        >
          <RotateCcw size={14} />
          {questions.length > 1 ? "Next check" : "Start again"}
        </button>
        <span>
          {project.attempts.filter((a) => isCurrentAttempt(a, project)).length}{" "}
          attempts saved on this device
        </span>
      </div>
    </section>
  );
}
