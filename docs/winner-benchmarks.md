# Winner benchmarks for WatchRead

Researched 2026-09-20. Placements below are verified from organizer announcements. Product descriptions are documented behavior, not our own runtime tests. Lessons are our interpretation, not an official rubric or a prediction of winning.

| Project | Verified result | Documented mechanism | Implication for WatchRead |
| --- | --- | --- | --- |
| Medkit | First, Built with Opus 4.7 | Medical learners act through a simulated encounter and receive assessment of that encounter. | Require the learner to attempt something, then respond specifically. |
| Maieutic | Third, Built with Opus 4.7 | Students state intended behavior; the tool asks reasoning questions and compares intent with implementation. | Keep student reasoning central. Generated reading alone is insufficient differentiation. |
| Tekton | First, Opus 4.8 Build Day | Explorable historical architecture exposes sources behind selected components. | Put source inspection directly inside the main experience. |
| Mechanica | First, Education, OpenAI Build Week | Interactive historical machines combine exploration with source attribution and inference labels. | Make the concept usable and uncertainty legible. |
| Dấu | Second, Education, OpenAI Build Week | Pronunciation attempts receive visual feedback and targeted correction. | Connect a specific error to a correction and a fresh attempt. |

Organizer evidence: [Anthropic Opus 4.7 winners](https://claude.com/blog/meet-the-winners-of-built-with-opus-4-7-claude-code-hackathon), [Anthropic Opus 4.8 Build Day winners](https://claude.com/blog/meet-the-winners-of-our-claude-opus-4-8-build-day-hackathon), [OpenAI Build Week winners](https://developers.openai.com/blog/build-week-winners).

Project references for further inspection: [Medkit repository](https://github.com/bedriyan/medkit-app), [Maieutic](https://maieutic.dev/), [Tekton repository](https://github.com/tangxiya-star/Tekton), [Mechanica submission](https://devpost.com/software/xiaoqiang), [Dấu submission](https://devpost.com/software/d-u-see-your-vietnamese-tones). No project code was copied or reused.

## What changes in WatchRead

The strongest comparison is not the number of features or amount of 3D. It is the completeness of a meaningful interaction. WatchRead should let a judge observe an actual misconception, follow its source explanation, attempt a different question, and inspect what happened.

Working differentiation hypothesis: a readable lecture companion with misconception-specific source playback and recorded retries. This is not a claim of category novelty or superiority over the winners. It requires testing.

NotebookLM already documents YouTube import, transcript citations, embedded video, and study guides. [Google's announcement](https://blog.google/innovation-and-ai/products/notebooklm-audio-video-sources/) establishes overlap with the original pitch; it does not establish whether every competitor has or lacks WatchRead's proposed recovery flow. A head-to-head task test is still needed before making superiority claims.

## Judge questions the build must survive

1. Does this work on a lecture that was not prepared for the demo?
2. Is that clip actually supporting the claim, or does it merely contain the same words?
3. What happens when the lecturer later corrects a statement?
4. Is the wrong-answer explanation supported by the source?
5. Does the retry ask a new question, or just reveal the previous answer?
6. Can the source and references still be inspected after exporting or reopening?
7. What did the model genuinely do, and which behavior is deterministic?
8. What have you observed with real learners, and what remains a hypothesis?

The plan answers these with source revisions, separate structural/semantic checks, bounded generation, actual media, a held-out evaluation set, and an honest validation report. No amount of visual polish substitutes for those checks.
