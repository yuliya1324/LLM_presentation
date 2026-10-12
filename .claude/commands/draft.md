---
description: Draft the slides for one section of the outline
argument-hint: <section file name, e.g. 02-method>
---
Draft `sections/$ARGUMENTS.html`.

1. Read `CLAUDE.md`, the `$ARGUMENTS` part of `outline.md`, everything in
   `sources/notes/` and `template/layouts.html`. Skim the neighbouring
   sections so your first and last slides connect to them.
2. Write one `<section>` per slide in the plan, choosing the layout that fits
   each message: results as charts or tables, processes as a flow, contrasts as
   a versus. Add fragments where the speaker builds the argument step by step.
   Give every slide speaker notes.
3. Run `python build.py --shots --section $ARGUMENTS`, view every PNG, fix
   problems and repeat until clean.
4. Report the slide ids with one line each, plus anything in the outline the
   notes couldn't support.
