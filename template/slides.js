/* Slide runtime: charts, count-up numbers, background bands.
   Authors never write JS; they use the classes and data attributes in layouts.html. */
(function () {
  const STATIC = /[?&]static\b/.test(location.search);
  if (STATIC) document.documentElement.classList.add("static");

  const css = getComputedStyle(document.documentElement);
  const tok = (name) => css.getPropertyValue(name).trim();

  // class="band" → light grey background across the whole screen
  document.querySelectorAll(".reveal .slides section.band").forEach((s) =>
    s.setAttribute("data-background-color", tok("--band")));

  // ---------- charts ----------
  const ROLE = { ours: "--orange", ours2: "--orange-mid", base: "--gray-400", base2: "--gray-300", other: "--blue" };
  const BY_INDEX = ["--orange", "--blue", "--gray-400", "--orange-mid", "--gray-300"];
  const charts = new Map();

  function valueLabels(spec) {
    const decimals = spec.decimals ?? 1;
    const unit = spec.unit || "";
    return {
      id: "valueLabels",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = `700 16px ${tok("--font")}`;
        ctx.fillStyle = tok("--ink");
        chart.data.datasets.forEach((ds, i) => {
          if (!chart.isDatasetVisible(i)) return;
          chart.getDatasetMeta(i).data.forEach((el, j) => {
            const val = ds.data[j];
            if (val == null) return;
            const text = Number(val).toFixed(decimals) + unit;
            if (chart.options.indexAxis === "y") {
              ctx.textAlign = "left"; ctx.textBaseline = "middle";
              ctx.fillText(text, el.x + 8, el.y);
            } else {
              ctx.textAlign = "center"; ctx.textBaseline = "bottom";
              ctx.fillText(text, el.x, el.y - 6);
            }
          });
        });
        ctx.restore();
      },
    };
  }

  function build(canvas) {
    if (!window.Chart) return;
    Chart.defaults.font.family = tok("--font");
    Chart.defaults.color = tok("--muted");
    const spec = JSON.parse(canvas.dataset.chart);
    const slide = canvas.closest("section");
    const pending = new Set(
      [...slide.querySelectorAll(".fragment[data-show-series]:not(.visible)")].map((f) => +f.dataset.showSeries));
    const type = spec.type || "bar";
    const datasets = spec.series.map((s, i) => {
      const color = tok(ROLE[s.role] || BY_INDEX[i % BY_INDEX.length]);
      return {
        label: s.name, data: s.data, hidden: pending.has(i),
        backgroundColor: color, borderColor: color,
        borderWidth: type === "line" ? 3 : 0, borderRadius: type === "bar" ? 6 : 0,
        pointRadius: 6, pointHoverRadius: 6, tension: 0.25,
      };
    });
    const horizontal = !!spec.horizontal;
    const valueAxis = horizontal ? "x" : "y";
    const catAxis = horizontal ? "y" : "x";

    charts.get(canvas)?.destroy();
    charts.set(canvas, new Chart(canvas, {
      type,
      data: { labels: spec.labels, datasets },
      options: {
        indexAxis: horizontal ? "y" : "x",
        responsive: true, maintainAspectRatio: false,
        animation: STATIC ? false : { duration: 1100, easing: "easeOutQuart" },
        layout: { padding: { top: 24, right: horizontal ? 60 : 8 } },
        plugins: {
          legend: {
            display: datasets.length > 1, position: "top", align: "start",
            labels: { usePointStyle: true, pointStyle: "rectRounded", boxWidth: 14, padding: 22, font: { size: 18 }, color: tok("--ink") },
          },
          tooltip: { enabled: false },
        },
        scales: {
          [valueAxis]: {
            min: spec.min, max: spec.max, grid: { color: tok("--line") }, border: { display: false },
            ticks: { font: { size: 16 }, color: tok("--muted") },
            title: { display: !!spec.axis, text: spec.axis, font: { size: 18, weight: 600 }, color: tok("--muted") },
          },
          [catAxis]: {
            grid: { display: false }, border: { color: tok("--gray-300") },
            ticks: { font: { size: 18, weight: 600 }, color: tok("--ink") },
          },
        },
      },
      plugins: spec.values === false ? [] : [valueLabels(spec)],
    }));
  }

  function toggleSeries(fragment, on) {
    if (!fragment.dataset.showSeries) return;
    const canvas = fragment.closest("section").querySelector("canvas[data-chart]");
    const chart = charts.get(canvas);
    if (!chart) return;
    chart.setDatasetVisibility(+fragment.dataset.showSeries, on);
    chart.update();
  }

  // ---------- count-up numbers: <span class="count">+18.5%</span> ----------
  function countUp(el) {
    if (!el.dataset.final) el.dataset.final = el.textContent;
    const final = el.dataset.final;
    const m = final.match(/^(.*?)(-?\d+(?:[.,]\d+)?)(.*)$/s);
    if (!m || STATIC) { el.textContent = final; return; }
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(",", "."));
    const decimals = (num.split(/[.,]/)[1] || "").length;
    const t0 = performance.now(), dur = 1300;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? pre + (target * eased).toFixed(decimals) + post : final;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function enter(slide) {
    if (!slide) return;
    slide.querySelectorAll("canvas[data-chart]").forEach(build);
    slide.querySelectorAll(".count").forEach(countUp);
  }

  Reveal.on("ready", (e) => document.fonts.ready.then(() => enter(e.currentSlide)));
  Reveal.on("slidechanged", (e) => enter(e.currentSlide));
  Reveal.on("fragmentshown", (e) => (e.fragments || [e.fragment]).forEach((f) => toggleSeries(f, true)));
  Reveal.on("fragmenthidden", (e) => (e.fragments || [e.fragment]).forEach((f) => toggleSeries(f, false)));
})();
