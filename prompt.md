/goal
TASK: Build the entire WatchRead web app now. Do not pause for questions. Do not ask me to choose a stack, palette, or scope. Use the decisions below. Keep building until the app runs and the demo path works.

WatchRead turns a lecture video into a companion book. The book and video stay tied together. User taps a sentence → the video jumps to that exact moment. Wrong quiz answer → video rewinds to the proof clip. User can export the book.

This is a finished-looking product, not a prototype.

WHY: I am entering a Claude Fable 5.1 buildathon. I previously built VidBook (YouTube → book files) and won a hackathon. WatchRead must look like the better next product: proof, teaching, and export. The winning moment is one click: sentence → proof clip. The UI must look like a calm publishing studio.

OUTCOME: A locally runnable Next.js + TypeScript + Tailwind app with seed data, polished UI/UX, and a 90-second demo that needs no API keys.

LOCKED DECISIONS — do not ask, do not change
- Name: WatchRead
- Tagline: A book that can prove every page.
- Stack: Next.js App Router, TypeScript, Tailwind, Framer Motion, lucide-react
- UI kit: build clean custom components in /components. Use shadcn-style primitives if useful, but do not stall on scaffolding.
- State: localStorage + in-memory store. No database. No auth.
- Package manager: npm
- Port: default next dev
- Color: warm paper #F4EFE4, ink #1C1915, moss #2F4F3E, caution #C4842A, line #E6DCC8
- Type: Newsreader or Fraunces for book text, Geist or Inter for UI. If a font package is annoying, use: ui-sans-serif + ui-serif with good sizes and tracking.
- Three.js: ONLY a small hero on the landing page (3D book cover that can tilt/open). After “Open sample”, switch to HTML. NEVER build the reader, quizzes, or print preview in WebGL.
- YouTube: optional and secondary. Sample + upload are required. Do not block the demo on YouTube.
- No paid APIs. No login. No Stripe. No real LLM calls at runtime.
- If a library is heavy or flaky, choose the simpler local option and continue.

SIMPLE PRODUCT FLOW YOU MUST IMPLEMENT
1. User opens the site
2. User clicks Open sample lecture  OR  uploads a video/transcript  OR  pastes a YouTube URL
3. App shows a short compose sequence
4. User enters the reading room: video left, book right
5. User taps a cited sentence
6. Video seeks to that timestamp and transcript highlights
7. User takes a chapter check
8. Wrong answer offers Rewind to proof
9. User can edit outline, preview 6×9 print, download files

INPUTS
A. Sample project, already generated, always works
   Title: How Photosynthesis Actually Works
   Subtitle: Guest lecture · 38 min
   Author: Dr. Maya Rao
   Rights: owner
   Include a realistic transcript with timestamps from 00:00 to 38:00, 6 chapters, citation spans, 2–3 checks per chapter, glossary, 3 caution paragraphs on purpose.
   Player: HTML5 video if /public/sample-lecture.mp4 exists. If not, build a finished fake player: poster, play/pause, scrubber, timecode, chapter ticks. Seeking MUST still change currentTime state and highlight cues. This fake player is acceptable and must feel real.

B. Upload
   Accept .mp4, .webm, .txt, .vtt, .srt
   Video plays from a local object URL
   Transcript files are parsed into cues
   If only video is uploaded and no captions, generate a clearly labeled demo transcript from filename + “waiting for captions” caution chapters so the UI still works. Never dead-end.

C. YouTube URL, optional
   Parse video id
   Show thumbnail + title if possible with no key
   Try captions only if a simple public method works without secrets
   If captions fail, do not crash. Show a calm error: “Captions unavailable. Upload a transcript.”
   If embed is allowed, use youtube-nocookie embed and seek with start seconds when a citation is clicked
   If embed fails, fall back to proof player using timestamps only
   YouTube is never the primary demo.

DATA MODEL
Project { id, title, subtitle, authorName, sourceType: "sample"|"upload"|"youtube", sourceLabel, durationSec, rights: "owner"|"licensed"|"unknown", coverTone, createdAt, status }
Cue { id, start, end, text }
Chapter { id, number, title, goal, summary, start, end, sections }
Section { id, heading, paragraphs }
Paragraph { id, text, citationIds, origin: "source"|"bridge"|"caution" }
Citation { id, start, end, quote, confidence }
Check { id, chapterId, kind: "recall"|"why"|"teachback", question, choices?, answer, explanation, evidenceCitationIds }

Rules:
- origin source => at least one citation
- origin caution => amber flag in UI
- checks only use their evidence citations
- clicking a citation sets activeCitationId and seeks to start

ROUTES
/                 marketing
/app              library
/app/new          wizard
/app/[id]/read    reading room, default studio view
/app/[id]/outline
/app/[id]/checks
/app/[id]/proof
/app/[id]/print
/app/[id]/export
Redirect /app/[id] to /app/[id]/read

UI/UX BAR — build this like a real product
Landing /
- Full-viewport studio, not a generic AI landing
- Left: headline + 3 short steps + two buttons: Open sample lecture, Start with my video
- Right: Three.js hardcover OR a high-craft CSS book if Three.js takes too long. Prefer shipping a gorgeous CSS book over a broken 3D scene. If Three.js is used, keep it under 150 lines and do not let it block other pages.
- No purple gradients, no chatbot bubbles, no “powered by agents” theater
- Footer: “For recordings you own or have license to adapt. From the maker of VidBook.”

Library /app
- Dust-jacket cards
- Sample card first, ribbon: Ready to demo
- Search, new button
- Empty state still shows one ghost jacket

Wizard /app/new
4 quiet steps on one page with a stepper:
1 Source: Sample / Upload / YouTube
2 Rights: I own this / Licensed / Just exploring
3 Intent: Class notes / Creator companion / Print draft
4 Compose
Compose screen uses named stages for ~1.2s: Clean, Cue, Outline, Ground, Checks, Compose
Then route into read.

Reading room /app/[id]/read  ★ most important screen
Desktop split:
- Left ~40% Proof Player
  video/fake video
  chapter markers
  current quote card under player
  scrollable transcript, active cue highlighted
- Right ~60% Book
  paper page, 65–70ch measure
  running header + folio
  chapter title + italic goal
  paragraphs
  source sentences have a faint underline and a chip 12:04–12:31
  click chip/sentence => seek + highlight + small “Proof clip” toast
  bridge paragraphs slightly muted
  caution paragraphs amber rule + label “Not clearly in the recording”
Sticky mini player on mobile.
Keyboard: space play/pause, j/k next/prev citation, n/p chapter, ? help.

Checks
One question, large type, immediate feedback.
Wrong: show quote + Rewind to proof.
Teach-back: textarea + 3 rubric bullets, local keyword score is fine.
End with restudy clip list.

Proof
Big number: percent of body text that is source-grounded.
Table: quote, time, confidence.
Filters: low confidence, caution, missing citations.

Print
6×9 spread preview, mirrored margins, gutter, running heads, page numbers.
Title page, rights page, “How to read this book” page explaining proof chips.
Looks like paper, not a webpage screenshot.

Export
Download:
- manuscript.md
- print.html (paged 6×9 CSS)
- citations.csv
- word-friendly.html saved as watchread.doc if docx library is a time sink
Show what each file is for. Do not pretend a file downloaded if it did not.

Studio chrome
Slim left nav + top bar after /app.
Items: Read, Outline, Checks, Proof, Print, Export.
Autosave badge.
Command palette ⌘K jumping to chapters and routes.
Shortcuts sheet.
404 and skeletons in the same visual language.

SAMPLE CONTENT QUALITY
Write a real lecture, not lorem.
Chapters:
1. Why green is not the point
2. Two jobs: catch light, build sugar
3. Water, air, stomata
4. Inside the chloroplast
5. Exam traps
6. A walk-outside experiment
Put timestamps on almost every body paragraph.
Include student-style wrong answers in checks.

WHAT NOT TO BUILD
- no auth
- no payments
- no social
- no live scraping that can fail the demo
- no multi-agent dashboard
- no 3D page-flip reader
- no settings forest
- no blocking modal
- do not restart if something is hard; degrade and continue

VERIFICATION — you must actually do these
1. npm install && npm run build must succeed. If build fails, fix it.
2. README at root:
   npm install
   npm run dev
   Then open http://localhost:3000
   Include a 90-second demo script:
   Home → Open sample → tap sentence → fail a check → rewind → print → export
3. Click-through works with no network model:
   - sample opens
   - citation click changes timecode and transcript highlight
   - failed check rewind works
   - outline title edit appears in reader
   - print spread renders
   - markdown download works
   - refresh keeps sample project
4. Looks designed at 390px and 1280px
5. Caution paragraphs are visible
6. Three.js, if present, does not break /app
7. Add DEMO.md with pass/fail boxes and mark them passed only after you checked

BUILD ORDER, NO STOPS
1. App shell, tokens, landing, library
2. Seed types + sample project
3. Reading room + player + citation click
4. Checks + rewind
5. Outline, proof, print, export
6. Wizard inputs
7. Motion polish, README, DEMO.md
8. Build fix

When you would normally ask a question, assume the default above and keep coding.
Do not output a long plan first. Create files immediately.
Ship a working app.