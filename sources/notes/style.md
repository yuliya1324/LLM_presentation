# Project page look (https://wuyxin.github.io/collabllm/)

Measured from computed styles with Playwright (12 Oct 2026). The site uses Tailwind v4, whose
colours are defined in oklch. The hex values below are converted from those. **Not applied**:
the team decides whether `template/theme.css` should change.

## Fonts

- **Manrope** (sans-serif, falls back to Arial/Helvetica) for everything on the main page.
  h1 48px / 700, h2 36px / 700, body 16px, lead paragraphs 20px / 400. Headings have tight
  letter-spacing.
- **Serif** (ui-serif → Georgia) for the blog article: headings and body. It looks like an
  editorial article.
- **Monospace** (ui-monospace / SFMono / Menlo) in the terminal card.

## Colours

| Role | Tailwind v4 name | Hex |
|---|---|---|
| Headings | gray-700 | `#364153` |
| Body / secondary text | gray-500 | `#6a7282` |
| Muted text | gray-600 | `#4a5565` |
| Accent (logo ring, "Active Collaborators", "About CollabLLM", card icons, quote titles, affiliation numbers) | orange-500 | `#ff6900` |
| "ICML 2025 Outstanding Paper" | orange-600 | `#f54900` |
| Author links | blue-400 | `#51a2ff` |
| Page / band background | gray-50 | `#f9fafb` |
| Section background, cards | white | `#ffffff` |
| Borders | zinc-200 / gray-200 | `#e4e4e7` / `#e5e7eb` |
| Nav pills (Github / Blog / Paper) | zinc-950 | `#09090b` |
| Terminal background | gray-900 | `#101828` |
| Terminal `$` prompt | green-400 | `#05df72` |
| Terminal dots | red-500 / yellow-500 / green-500 | `#fb2c36` / `#f0b100` / `#00c950` |

Comparison with `template/theme.css`: the theme already uses the same palette, but with
Tailwind **v3** hex values (`--ink #374151`, `--orange #f97316`, `--blue #60a5fa`, `--band
#f9fafb`). The site's v4 orange (`#ff6900`) is slightly more saturated than `#f97316`. The
difference is barely visible, and no change is needed unless the team wants an exact match.

## Recurring visual devices

- **Two-tone headings**: the first part is gray-700 and the key phrase is orange ("Make Your
  LLMs / **Active Collaborators**", "What Users Said **About CollabLLM**"). The template's
  `.hl` in the STATEMENT layout does the same.
- **Alternating section backgrounds**: gray-50 bands and white sections (template `band`).
- **Three-card rows** with a small orange rounded-square icon, a bold question title and grey
  text (template CARDS).
- **Quote cards**: white with a light border and soft shadow, an orange title that opens with a
  quotation mark ("“Efficient"), italic body with **bold** key phrases (template QUOTES).
- **macOS-style dark terminal** with red/yellow/green dots and green `$` prompts (template
  TERMINAL).
- **Black pill buttons** with an icon in the nav, and a white outlined pill CTA with an arrow.
- An **orange ring** logo mark next to the "CollabLLM" wordmark.
- The page has no images. The paper figures use their own palette: salmon/orange user bubbles,
  teal assistant bubbles, mauve "collaborative simulation" boxes, and red vs blue in the user
  study.
