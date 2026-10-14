// Hand-rolled SVG charts. Text uses text tokens; color only on marks.

export interface Series {
  name: string;
  values: number[];
  color: string; // CSS var reference
  key: string;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * exp;
}

function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export interface LineOpts {
  dates: string[];
  series: Series[];
  format: (v: number) => string;
  height?: number;
  label: string;
}

/**
 * Mount a multi-series line chart sized to its container, with a hover crosshair + tooltip.
 * Re-call on resize to re-measure.
 */
export function mountLineChart(container: HTMLElement, opts: LineOpts): void {
  const W = Math.max(280, Math.round(container.clientWidth || 640));
  const H = opts.height ?? 260;
  const m = { t: 14, r: 12, b: 28, l: 52 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const n = opts.dates.length;
  const max = niceMax(Math.max(...opts.series.flatMap((s) => s.values)));
  const x = (i: number) => m.l + (n <= 1 ? 0 : (i / (n - 1)) * iw);
  const y = (v: number) => m.t + ih - (v / max) * ih;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const grid = ticks
    .map(
      (v) =>
        `<line x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}" class="${v === 0 ? 'baseline' : 'grid'}"/>` +
        `<text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end" class="axis-label">${esc(opts.format(v))}</text>`,
    )
    .join('');
  const tickCount = W < 480 ? 3 : 4;
  const xTickIdx = Array.from({ length: tickCount }, (_, k) => Math.round((k * (n - 1)) / (tickCount - 1)));
  const xTicks = xTickIdx
    .map(
      (i, k) =>
        `<text x="${x(i)}" y="${H - 8}" text-anchor="${k === 0 ? 'start' : k === xTickIdx.length - 1 ? 'end' : 'middle'}" class="axis-label">${shortDate(opts.dates[i])}</text>`,
    )
    .join('');

  const paths = opts.series
    .map((s) => {
      const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    })
    .join('');

  const dots = opts.series
    .map((s) => `<circle class="hover-dot" data-key="${s.key}" r="4.5" fill="${s.color}" stroke="var(--surface)" stroke-width="2" cx="-20" cy="-20"/>`)
    .join('');

  const legend = opts.series
    .map((s) => `<span class="legend-item"><span class="legend-swatch" style="background:${s.color}"></span>${esc(s.name)}</span>`)
    .join('');

  container.innerHTML = `
    <div class="legend">${legend}</div>
    <div class="chart-wrap">
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label)}">
        ${grid}${xTicks}
        <line class="crosshair" x1="-10" x2="-10" y1="${m.t}" y2="${m.t + ih}"/>
        ${paths}${dots}
        <rect class="hit" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/>
      </svg>
      <div class="tooltip" hidden></div>
    </div>`;

  const svg = container.querySelector('svg')!;
  const tip = container.querySelector<HTMLDivElement>('.tooltip')!;
  const cross = container.querySelector<SVGLineElement>('.crosshair')!;

  const show = (clientX: number) => {
    const rect = svg.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * W;
    const i = Math.max(0, Math.min(n - 1, Math.round(((sx - m.l) / iw) * (n - 1))));
    const px = x(i);
    cross.setAttribute('x1', String(px));
    cross.setAttribute('x2', String(px));
    opts.series.forEach((s) => {
      const dot = container.querySelector<SVGCircleElement>(`.hover-dot[data-key="${s.key}"]`)!;
      dot.setAttribute('cx', String(px));
      dot.setAttribute('cy', String(y(s.values[i])));
    });
    tip.innerHTML =
      `<div class="tip-date">${shortDate(opts.dates[i])}</div>` +
      opts.series
        .map(
          (s) =>
            `<div class="tip-row"><span class="legend-swatch" style="background:${s.color}"></span><span>${esc(s.name)}</span><b>${esc(opts.format(s.values[i]))}</b></div>`,
        )
        .join('');
    tip.hidden = false;
    const tw = tip.offsetWidth;
    let left = px + 14;
    if (left + tw > W) left = px - tw - 14;
    tip.style.left = `${Math.max(0, left)}px`;
  };
  const hide = () => {
    tip.hidden = true;
    cross.setAttribute('x1', '-10');
    cross.setAttribute('x2', '-10');
    container.querySelectorAll('.hover-dot').forEach((d) => d.setAttribute('cx', '-20'));
  };
  svg.addEventListener('pointermove', (e) => show(e.clientX));
  svg.addEventListener('pointerdown', (e) => show(e.clientX));
  svg.addEventListener('pointerleave', hide);
}

/** Small usage bar sparkline with an average line. */
export function usageSpark(daily: number[], avg: number, dates: string[]): string {
  const W = 300;
  const H = 56;
  const n = daily.length;
  const max = Math.max(1, ...daily);
  const bw = W / n;
  const bars = daily
    .map((v, i) => {
      const h = (v / max) * (H - 6);
      return v > 0
        ? `<rect x="${(i * bw + 0.5).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${Math.max(1, bw - 1).toFixed(1)}" height="${h.toFixed(1)}" rx="1" class="spark-bar"><title>${shortDate(dates[i])}: ${v} used</title></rect>`
        : '';
    })
    .join('');
  const ay = H - (avg / max) * (H - 6);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Daily usage, last ${n} days, average ${avg.toFixed(1)} per day">
    ${bars}<line x1="0" x2="${W}" y1="${ay}" y2="${ay}" class="spark-avg"/></svg>`;
}
