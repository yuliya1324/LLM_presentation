---
description: Read the paper, repo, website and demo; write shared notes and extract figures
argument-hint: <paper url or path> [repo url] [website url]
---
Sources: $ARGUMENTS

1. Paper. For arXiv, download the PDF to `sources/paper.pdf` and the LaTeX
   source from `https://arxiv.org/e-print/<id>` into `sources/latex/`.
2. Figures. Copy the original figure files from the LaTeX source into
   `assets/figures/`, converting PDF figures to PNG at 200 dpi. Without a
   source, render and crop figures from the PDF with PyMuPDF. Name them after
   the paper: `fig1.png`, `fig2.png`, `table2.png`.
3. Write `sources/notes/paper.md`: summary, problem, contributions, method
   (key equations in LaTeX), setup, main results with exact numbers,
   limitations, and one line per figure/table on what it shows. Copy every
   results table in full with exact numbers, so slides can chart them. Cite
   the page or section for every claim.
4. Repo, if given: shallow clone into `sources/repo/`. Write
   `sources/notes/repo.md`: what is implemented, key files, how to run it, and
   anything that differs from the paper.
5. Website and demo, if given: fetch them and write `sources/notes/web.md`.
   Screenshot the demo with Playwright into `assets/figures/demo-*.png`.
6. If there is a project website, note its look in `sources/notes/style.md`:
   fonts, main colours (hex) and any recurring visual devices. Don't change
   `template/theme.css`; the team decides.
7. Write `sources/notes/glossary.md`: terms, abbreviations and notation the
   talk should use consistently.
8. Fill in the header and a proposed slide plan in `outline.md`, keeping its
   format, for the team to edit. Don't write slides.
