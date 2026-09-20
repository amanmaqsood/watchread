# Credits

## Fable 5.1

Fable 5.1 is the model behind WatchRead's prepared study companions. It turned the source transcripts into chapters, wrote the explanations and glossary entries, and created practice questions with feedback for common mistakes. A separate Fable 5.1 pass reviewed the material against the source.

The saved runs report `claude-fable-5-1`. Their model IDs, source hashes, token counts, and review results are preserved in the [sample record](content/sample/companion.json), [heat companion](content/prepared/heat.json), and [evaluation report](evals/REPORT.md).

The prepared photosynthesis edition includes a few editorial changes, listed in its [provenance record](content/sample/provenance.json). Original model outputs remain in `evals/`.

## Sources and supporting tools

The photosynthesis script and slides are original demonstration material. The script used these OpenStax teaching references:

- [The light-dependent reactions of photosynthesis](https://openstax.org/books/biology/pages/8-2-the-light-dependent-reactions-of-photosynthesis)
- [Using light energy to make organic molecules](https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules)

The recording uses macOS Samantha synthetic narration, SVG slides, Sharp, and FFmpeg. The application uses Next.js, React, Tailwind CSS, Zod, IndexedDB, Lucide, DM Sans, and Newsreader. Package versions are in `package-lock.json`.

The [build notes](docs/build-notes.md) record the implementation and testing contributions. The notes also list the tools used to render the original recording.
