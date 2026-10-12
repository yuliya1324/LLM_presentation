#!/usr/bin/env python3
"""Build the deck.

  python build.py                         sections/*.html (filename order) -> dist/index.html
  python build.py --shots                 also render every slide (final state) to dist/shots/
  python build.py --shots --section 02    only slides from files starting with "02"
  python build.py --demo                  build template/layouts.html instead -> dist/demo.html
"""
import argparse
import json
import re
import shutil
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
COMMENT = re.compile(r"<!--.*?-->", re.S)


def check(name: str, html: str) -> list[str]:
    problems = []
    live = COMMENT.sub("", html)
    for src in re.findall(r'src="([^"]+)"', live):
        if not src.startswith(("http", "data:")) and not (ROOT / src).exists():
            problems.append(f"{name}: missing image {src}")
    if re.search(r"\sstyle=|<style|<script", live):
        problems.append(f"{name}: no style attributes, <style> or <script>; use template classes")
    for spec in re.findall(r"data-chart='([^']*)'", live):
        try:
            json.loads(spec)
        except json.JSONDecodeError as e:
            problems.append(f"{name}: invalid data-chart JSON ({e})")
    return problems


def build(files: list[Path], out_name: str) -> list[str]:
    problems, parts = [], []
    for path in files:
        html = path.read_text(encoding="utf-8")
        problems += check(path.name, html)
        # Tag each slide with the file it came from, for --section and reports.
        html = re.sub(r"<section(?=[\s>])", f'<section data-file="{path.stem}"', html)
        parts.append(f"<!-- {path.name} -->\n{html}")

    body = "\n\n".join(parts)
    ids = re.findall(r'<section[^>]*\sid="([^"]+)"', COMMENT.sub("", body))
    for slide_id, n in Counter(ids).items():
        if n > 1:
            problems.append(f"duplicate slide id '{slide_id}' ({n} times)")

    title = re.search(r"<h1[^>]*>(.*?)</h1>", body, re.S)
    title = re.sub(r"<[^>]+>", "", title.group(1)).strip() if title else "Paper talk"

    DIST.mkdir(exist_ok=True)
    base = (ROOT / "template" / "base.html").read_text(encoding="utf-8")
    page = base.replace("{{TITLE}}", title).replace("{{SECTIONS}}", body)
    (DIST / out_name).write_text(page, encoding="utf-8")
    for asset in ("theme.css", "slides.js"):
        shutil.copy(ROOT / "template" / asset, DIST / asset)
    shutil.copytree(ROOT / "assets", DIST / "assets", dirs_exist_ok=True)
    print(f"built dist/{out_name} ({len(files)} file(s), {len(ids)} slides)")
    return problems


def shots(page_name: str, section: str | None) -> list[str]:
    from playwright.sync_api import sync_playwright

    out = DIST / "shots"
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    problems = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto((DIST / page_name).as_uri() + "?static")
        page.wait_for_function("window.Reveal && Reveal.isReady()")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(500)
        for i in range(page.evaluate("Reveal.getTotalSlides()")):
            # Jump to the slide with all fragments shown: the final state.
            page.evaluate(f"""() => {{
                Reveal.slide({i}, 0);
                const idx = [...Reveal.getCurrentSlide().querySelectorAll('.fragment')]
                    .map(f => +f.dataset.fragmentIndex);
                if (idx.length) Reveal.slide({i}, 0, Math.max(...idx));
            }}""")
            page.wait_for_timeout(350)
            s = page.evaluate("""() => {
                const el = Reveal.getCurrentSlide();
                return { id: el.id || "", file: el.dataset.file || "",
                         over: el.scrollHeight > el.clientHeight + 2 ||
                               el.scrollWidth > el.clientWidth + 2 };
            }""")
            if section and not s["file"].startswith(section):
                continue
            name = f'{i:02d}_{s["id"] or "slide"}.png'
            page.screenshot(path=str(out / name))
            print(f"  dist/shots/{name}")
            if s["over"]:
                problems.append(f'{s["file"]}: slide {s["id"] or i} overflows')
        browser.close()
    return problems


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--shots", action="store_true", help="render slides to PNG (final state)")
    ap.add_argument("--section", help="only shoot slides from files starting with this")
    ap.add_argument("--demo", action="store_true", help="build template/layouts.html as a demo deck")
    args = ap.parse_args()

    if args.demo:
        files, page_name = [ROOT / "template" / "layouts.html"], "demo.html"
    else:
        files, page_name = sorted((ROOT / "sections").glob("*.html")), "index.html"

    problems = build(files, page_name)
    if args.shots:
        problems += shots(page_name, args.section)
    for p in problems:
        print(f"PROBLEM: {p}")
    sys.exit(1 if problems else 0)
