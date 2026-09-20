# Present WatchRead with confidence

## Explain it to a class 5 student

Imagine your teacher explains something in a video. You watch it, but one part is confusing. You keep moving the video backward, trying to find that part.

WatchRead turns the lesson's transcript into a little study book. Each explanation has a bookmark that takes you back to where it came from. It asks you a question. If you make a mistake, it explains the mix-up, opens the useful part of the lesson, and gives you a different question to try.

**One sentence:** WatchRead turns a lecture into a source-linked study companion that helps you learn from your mistakes.

"Source-linked" just means "you can check where the explanation came from." A "companion" is your little study book.

## What goes in and what comes out

| You give it | It makes |
| --- | --- |
| A transcript: the words spoken in a lesson | Short, readable chapters |
| Optional video, plus timestamps in the transcript | Buttons that jump to the relevant part of the video |
| The topic explained in the source | A glossary and practice questions |
| A wrong answer | Feedback about that misconception and a different follow-up question |
| The finished companion | A reading copy, manuscript, source spreadsheet, or restorable project |

This version needs a transcript. Uploading a video alone saves a source draft; it does not automatically create subtitles or analyze the pictures.

## Your 90-second presentation

Keep the photosynthesis sample open in the first chapter before you begin.

### 0 - 15 seconds - the problem

"Have you ever watched a whole lesson and still got the question wrong? Then you spend ages hunting through the video for the explanation you missed. WatchRead helps with that moment."

### 15 - 30 seconds - the little book

"Here is a lesson turned into a readable companion. I can read at my own pace. And if I wonder where an explanation came from, I click its source."

Action: click a source time below an explanation. Let the video play briefly. Point to the highlighted transcript.

### 30 - 65 seconds - the main moment

"Now let's see whether I understood it. I'll choose a common wrong answer: that most of a tree's dry mass comes from minerals in the soil."

Action: open Practice. Choose **A - Minerals absorbed from the soil**.

"WatchRead explains the mix-up. I can go straight back to the relevant explanation. Then it asks a different question about the same idea."

Action: click **Revisit the explanation**, then **Try a different question**, then **A - Carbon atoms taken in as carbon dioxide**.

"It records the first attempt, the source I revisited, and the new answer. This shows my learning activity; it doesn't claim one correct answer proves lasting mastery."

### 65 - 80 seconds - trust

Action: open Sources.

"The explanations point to actual transcript passages. The model reviews the material against those passages. If the source changes, old links and questions are marked for review."

### 80 - 90 seconds - the close

Action: open Export.

"I can take the book and its sources with me. Our focus is one connected loop: read, check, revisit, and try again."

## What to be completely clear about

- **The public website works now with prepared lessons.** Those lessons came from recorded, real Fable 5.1 generation runs. Opening one does not trigger a new AI call.
- **Fresh AI generation runs in the laptop version.** The Vercel website does not currently have an enabled cloud model connection. Hosting is separate from the AI service; no payment card was added.
- **Fable 5.1 composed and reviewed the study companions.** Show the recorded model name in Sources if asked. The implementation and source-media credits are in CREDITS.md and the build notes.
- **The model works from the transcript.** The video is for source playback, not visual understanding in this version.
- **The photosynthesis video is original demonstration material with synthetic narration.** It is not a recording of a real classroom. The heat lesson is an original text-only example.
- **Source supported does not mean guaranteed true.** AI review can miss errors. The source itself could also be wrong. People can inspect the cited passage.
- **Projects are saved in this browser.** They do not automatically sync across devices or between localhost and the public website. Export Project JSON to move them. Reconnect the same video separately.
- **We have software tests and model evaluation examples, not a student learning study.** Do not claim improved grades, proved retention, paying customers, or universal correctness.

## Questions judges might ask

### "Why not just ask a chatbot for a summary?"

"A summary is useful. Our focus is what happens after you misunderstand something: the explanation, source passage, wrong-answer feedback, and new question are connected in the same workspace. You can inspect the source and keep the resulting book."

### "Is this the first product with citations or quizzes?"

"No. Those features exist elsewhere. Our distinction is how we connect them into a visible recovery loop and preserve evidence when the source changes."

### "What is the hardest part?"

"Keeping generated explanations and practice questions connected to the right source version, including after a transcript changes. We check references in code, review the generated material, withhold unsupported practice, and record attempts against the relevant generation."

### "What does the AI actually do?"

"It organizes the transcript into chapters, writes explanations and glossary entries, creates questions and misconception-specific feedback, then reviews them against the source. Code checks that the references exist and that quoted passages match."

### "Will this always make someone learn?"

"We haven't proved that. The next experiment is to compare this recovery loop with a summary-only experience and measure a delayed follow-up test, not just immediate correct answers."

### "What would you build next?"

"First, test it with real students and teachers. Then improve transcription and cloud composition, guided by the mistakes we observe. We would preserve the inspectable source trail."

## Test the public site yourself

Use the public URL in DEPLOYMENT.md. Start in a fresh private window for a clean demonstration.

1. Click **How it works**. Read the four steps, then **Open the sample**.
2. Choose the first chapter, **A tree is made of air**, if another chapter is selected.
3. Click a source time below an explanation. Check that the video jumps, plays, and highlights the corresponding transcript.
4. Open **Practice**. Choose **A - Minerals absorbed from the soil**. Check that it explains the misconception.
5. Click **Revisit the explanation**. Check the right passage opens.
6. Click **Try a different question**. Choose **A - Carbon atoms taken in as carbon dioxide**. Check **New answer correct** appears.
7. Refresh. Your attempt should still be recorded. Choose **Start again** when rehearsing another time.
8. Open **Sources**. Inspect the quoted passages and the recorded generation model.
9. Open **Export**. Download **The manuscript** or **The reading copy**. Open the downloaded file and inspect its source references.
10. Return to **Your library**. Open **Why a Metal Spoon Feels Colder**. Check that it works with text references and makes no fake video claim.
11. For restore testing, open **How it works → Can I try importing something?** Download the example project. Open **New companion → Restore an exported project** and select it. A separate companion should open and survive refresh.
12. For a fresh source, download the practice transcript from New companion. Upload it and click **Save my source**. On this hosted edition it saves an honest draft; it does not pretend to generate a book.

## Show fresh AI generation on your laptop

1. Open http://127.0.0.1:3000/app/new while the local server is running.
2. If it isn't running, open Terminal and run `cd /Users/ashish/watchread`, then `npm run dev`. Keep Terminal open. The Claude CLI must be signed in.
3. Download or choose `public/sample/practice-lesson.txt`. You can use another short transcript you own, too.
4. Add the transcript, title, and optional video. Click **Compose my companion**. Explain that only the transcript is sent to the remote model; the video stays on the device.
5. Wait for the actual stages to finish. Previous local test cases took about a minute; new runs can vary or fail.
6. Inspect **Sources**, then open **Export → The whole companion**.
7. On the public website, choose **New companion → Restore an exported project** and select that JSON. Now the newly generated companion is on the public site's browser shelf, without uploading its contents to a shared project database.

Do a fresh generation before the presentation so you have a ready result if the event internet is unreliable. Describe it as a prepared result. Do not claim it was generated live if it was not.

## Spend your remaining practice time well

Rehearse the 90-second flow three times. Practice explaining the cloud/laptop difference in one calm sentence. Ask someone to use the site without your help; note where they hesitate. Keep both the public sample and the local generator ready in separate tabs. Spend your last minutes on the demonstration, not on adding unrelated features.
