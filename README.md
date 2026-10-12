# Paper slides

Reveal.js slides about one paper, drafted with Claude Code by a team of three.
Each person owns their own files in `sections/`; `build.py` stitches them together.

## See the template

```bash
python build.py --demo && python -m http.server -d dist
```

Open `localhost:8000/demo.html`: every layout, with real CollabLLM content.
Click or press the arrow keys to step through animations.

## Setup

```bash
pip install playwright pymupdf
playwright install chromium
```

## Workflow

1. **Ingest** (one person): `/ingest <arxiv url> <repo url> <website url>`.
   Commit `sources/notes/`, `assets/figures/` and the draft `outline.md`.
2. **Split** (together): edit `outline.md`, assign owners, rename the files in
   `sections/` to match. Commit to main.
3. **Draft** (each person, on their own branch): `/draft 02-method`.
4. **Iterate**: `python -m http.server -d dist` and open the deck. The URL shows
   the slide id (`#/method-3`), so feedback can be precise:
   `/revise method-3 too dense, split it and use fig2`.
5. **Merge**: open a PR with your section file. No conflicts as long as everyone
   only touches their own files.
6. **Review** (after merging): `/review` lists cross-section problems by slide id
   and owner. Each owner fixes theirs with `/revise`.

## Presenting

- Open `dist/index.html`, press `S` for speaker notes.
- PDF: open `dist/index.html?print-pdf` in Chrome and print to PDF.

## Files

| Path | What it is |
|---|---|
| `CLAUDE.md` | Rules every Claude Code session follows |
| `.claude/commands/` | `/ingest`, `/draft`, `/revise`, `/review` |
| `template/` | Shell, theme, runtime (charts, counters) and the allowed layouts |
| `outline.md` | Section split, owners, one message per slide |
| `sections/` | One file per section, built in filename order |
| `sources/notes/` | Shared notes on the paper, repo, site, glossary |
| `build.py` | Builds `dist/`; `--shots` renders PNGs and flags overflow; `--demo` builds the layouts |
