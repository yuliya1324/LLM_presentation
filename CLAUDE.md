# Paper slides harness

A reveal.js deck about one paper, written by three people. Each person owns
one or more files in `sections/`. `build.py` concatenates them in filename
order into `dist/index.html`. The look follows the paper's project page
(see `template/theme.css`).

## Hard rules

- Only edit the section file(s) you were asked to work on. Don't edit other
  sections, `template/` or `outline.md` unless explicitly asked.
- Use only the layouts in `template/layouts.html` (run `python build.py --demo`
  to see them). No `style=` attributes, `<style>` or `<script>` tags, and no
  new classes. If no layout fits, say so instead of improvising.
- Every top-level `<section>` has a unique `id` prefixed with its section name:
  `method-1`, `method-2`, ...
- Facts come from `sources/notes/`. Numbers on slides and in charts must match
  the paper exactly. Put the source ("Table 2, p. 7") in a `<p class="source">`.
- Figures come from `assets/figures/`. Never redraw a paper figure as an image;
  re-plotting its numbers as a chart is fine.
- Use the terms and notation in `sources/notes/glossary.md`.
- What the presenter says goes in `<aside class="notes">`, not on the slide.

## Slide style

- One message per slide. The title states it as a sentence
  ("Interactivity rises on all three tasks"), not a topic ("Results").
- At most 40 words of visible text and 5 bullets. No nested bullets.
- Prefer a chart, a figure or a single number over bullets.
- Colours carry meaning: the paper's method is always role `ours` (orange),
  baselines are `base` / `base2` (grey). Don't add colours.

## Animation

Motion should reveal the argument in the order the speaker tells it, never decorate.
- `class="fragment"` (or `fragment fade-up`) to build a slide step by step.
  Use it for comparisons, processes and lists the speaker walks through.
  At most about 5 steps per slide; leave simple slides static.
- Charts and `.count` numbers animate by themselves when the slide appears.
  To make a series appear on a click, add
  `<span class="fragment" data-show-series="N"></span>` inside the `.chart`.
- `data-auto-animate` on two consecutive slides morphs elements with the same
  `data-id`. Use it to show one thing changing (a window growing, a value moving).
- `class="band"` gives a section opener a grey background.

## Checking your work

After any change run `python build.py --shots --section <file prefix>` and view
every PNG it lists. Screenshots show each slide's final state (all fragments
visible). Fix any reported problem, any slide that overflows, any unreadable
chart or figure and anything crowded. Repeat until clean before reporting back.
