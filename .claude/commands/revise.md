---
description: Revise slides from feedback
argument-hint: <slide id or section> <feedback>
---
Feedback: $ARGUMENTS

1. Find the slide by id (or the whole section) in `sections/`. Change only
   what the feedback asks for. Keep ids stable; if you split or add a slide,
   use the next free number.
2. Run `python build.py --shots --section <its file prefix>` and view the
   affected PNGs. Fix and repeat until clean.
3. Report what changed in a couple of lines.
