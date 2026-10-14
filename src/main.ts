import './style.css';
import { AppState, Item, StockEvent, loadState, today, uid } from './data';
import {
  ItemStats,
  Status,
  STATUS_LABEL,
  allStats,
  compare,
  money,
  num,
  SERVICE_Z,
  ORDER_CYCLE_DAYS,
  BLIND_INTERVAL_DAYS,
  RUSH_PREMIUM,
  windowDates,
} from './analytics';
import { mountLineChart, usageSpark } from './charts';
import { caseStudyHTML } from './caseStudy';
import { siteHeader, siteFooter, landingHTML, LandingData } from './site';

const state: AppState = loadState();

type View = 'inventory' | 'log' | 'reorder' | 'savings';
type Page = 'landing' | 'case' | 'app';
interface Route {
  page: Page;
  view: View;
  anchor?: string;
  navKey: string;
}

const APP_VIEWS: { id: View; label: string; icon: string }[] = [
  { id: 'inventory', label: 'Inventory', icon: '<path d="M4 20V10m5.3 10V4m5.4 16v-7M20 20V8" />' },
  { id: 'log', label: 'Log activity', icon: '<path d="M5 4h10l4 4v12H5z"/><path d="M9 12h6M9 16h6M12 9v6"/>' },
  { id: 'reorder', label: 'Reorder', icon: '<path d="M4 7h11l-3-3M20 17H9l3 3"/>' },
  { id: 'savings', label: 'Savings', icon: '<path d="M4 17l5-5 4 4 7-8"/><path d="M15 8h5v5"/>' },
];

const app = document.getElementById('app')!;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const STATUS_ICON: Record<Status, string> = {
  critical: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 15 14H1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  soon: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  healthy: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m5 8.2 2 2 4-4.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  over: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 11V5M5.5 7.5 8 5l2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function pill(s: Status): string {
  return `<span class="pill pill-${s}">${STATUS_ICON[s]}${STATUS_LABEL[s]}</span>`;
}

function persist() {
  /* in-memory only: every visit starts from the same seeded dataset */
}

function parseRoute(): Route {
  const h = location.hash.replace(/^#\/?/, '');
  const [a, b] = h.split('/');
  if (a === 'app') {
    const view = (APP_VIEWS.some((v) => v.id === b) ? b : 'inventory') as View;
    return { page: 'app', view, navKey: 'app' };
  }
  if (APP_VIEWS.some((v) => v.id === a)) return { page: 'app', view: a as View, navKey: 'app' };
  if (a === 'case-study' || a === 'case') return { page: 'case', view: 'inventory', navKey: 'case' };
  if (a === 'product') return { page: 'landing', view: 'inventory', anchor: 'features', navKey: 'product' };
  if (a === 'how-it-works') return { page: 'landing', view: 'inventory', anchor: 'how', navKey: 'how' };
  return { page: 'landing', view: 'inventory', navKey: '' };
}

function currentView(): View | null {
  const r = parseRoute();
  return r.page === 'app' ? r.view : null;
}

// ---------- toast ----------
let toastTimer = 0;
function toast(msg: string) {
  const el = document.getElementById('toast')!;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2600);
}

// ---------- page rendering ----------
let lastPage: Page | null = null;

function render() {
  const r = parseRoute();
  const pageChanged = r.page !== lastPage;
  lastPage = r.page;
  redrawCharts = null;
  let body = '';
  if (r.page === 'app') {
    body = `
      <div class="app-shell">
        <aside class="app-side" aria-label="App sections">
          <p class="side-label">Workspace</p>
          <p class="side-team">Attraction Ops · Supplies</p>
          <nav class="side-nav" id="side-nav">
            ${APP_VIEWS.map(
              (v) =>
                `<a href="#/app/${v.id}" data-view="${v.id}" class="${v.id === r.view ? 'active' : ''}" ${v.id === r.view ? 'aria-current="page"' : ''}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${v.icon}</svg><span>${v.label}</span>${v.id === 'reorder' ? `<em class="side-badge" id="side-badge"></em>` : ''}</a>`,
            ).join('')}
          </nav>
        </aside>
        <main id="view" class="app-main" tabindex="-1"></main>
      </div>
      <p class="data-note app-data-note">All data in Supply Tracker is sample data for demonstration purposes only. It is not real Disney data.</p>`;
  } else if (r.page === 'case') {
    body = `<main id="view" class="page-case" tabindex="-1">${caseStudyHTML()}</main>${siteFooter()}`;
  } else {
    body = `<main id="view" class="page-landing" tabindex="-1">${landingHTML(landingData())}</main>${siteFooter()}`;
  }
  app.innerHTML = `<div class="top-disclaimer" role="note">All data in Supply Tracker is sample data for demonstration purposes only. It is not real Disney data.</div>${siteHeader(r.navKey)}${body}<div id="toast" role="status" aria-live="polite"></div><dialog id="item-dialog"></dialog>`;
  wireNav();
  const main = document.getElementById('view')!;
  if (r.page === 'app') renderView();
  if (r.page === 'landing') mountLandingChart();
  setupReveals(main);

  if (r.anchor) {
    const el = document.getElementById(r.anchor);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: pageChanged || reduceMotion ? 'instant' : 'smooth' });
    }
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

function wireNav() {
  const btn = document.getElementById('menu-btn');
  const links = document.getElementById('nav-links');
  btn?.addEventListener('click', () => {
    const open = links!.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

/** Re-render just the current app view (after edits). */
function renderView() {
  const view = currentView();
  const main = document.getElementById('view');
  if (!view || !main) {
    render();
    return;
  }
  main.className = `app-main view view-${view}`;
  switch (view) {
    case 'inventory':
      renderInventory(main);
      break;
    case 'log':
      renderLog(main);
      break;
    case 'reorder':
      renderReorder(main);
      break;
    case 'savings':
      renderSavings(main);
      break;
  }
  const badge = document.getElementById('side-badge');
  if (badge) {
    const n = allStats(state).filter((s) => s.suggestQty > 0).length;
    badge.textContent = n ? String(n) : '';
    badge.hidden = !n;
  }
  const nav = document.getElementById('side-nav');
  const active = nav?.querySelector<HTMLElement>('a.active');
  if (nav && active && nav.scrollWidth > nav.clientWidth) {
    nav.scrollLeft = Math.max(0, active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2);
  }
  setupReveals(main);
}

// ---------- landing data ----------
function landingData(): LandingData {
  const stats = allStats(state);
  const c = compare(state);
  const pick = ['critical', 'soon', 'over', 'healthy'] as Status[];
  const rows = pick
    .map((st) => stats.find((s) => s.status === st))
    .filter((s): s is ItemStats => !!s)
    .concat(stats.filter((s) => s.status === 'healthy').slice(1, 2))
    .map(
      (s) => `<div class="pw-row"><span class="pw-name">${esc(s.item.name)}</span>${stockBar(s)}${pill(s.status)}</div>`,
    )
    .join('');
  const value = state.items.reduce((a, i) => a + i.stock * i.unitCost, 0);
  return {
    previewRows: rows,
    needAction: stats.filter((s) => s.status === 'critical' || s.status === 'soon').length,
    shelfValue: money(value),
    pct: c.blind.spend > 0 ? ((c.blind.spend - c.smart.spend) / c.blind.spend) * 100 : 0,
    saved: money(c.blind.spend - c.smart.spend),
    blindSpend: money(c.blind.spend),
    smartSpend: money(c.smart.spend),
    stockoutsBlind: c.blind.stockoutDays,
    stockoutsSmart: c.smart.stockoutDays,
    rushAvoided: Math.max(0, c.blind.rushOrders - c.smart.rushOrders),
  };
}

function mountLandingChart() {
  const c = compare(state);
  const cum = (arr: number[]) => {
    let a = 0;
    return arr.map((v) => (a += v));
  };
  const series = [
    { name: 'Fixed schedule', key: 'blind', color: 'var(--series-blind)', values: cum(c.blind.dailySpend) },
    { name: 'Supply Tracker', key: 'smart', color: 'var(--series-smart)', values: cum(c.smart.dailySpend) },
  ];
  const fmtK = (v: number) => (v >= 1000 ? `$${num(v / 1000, 1)}k` : money(v));
  const draw = () => {
    const el = document.getElementById('landing-chart');
    if (el) mountLineChart(el, { dates: c.dates, series, format: fmtK, height: 240, label: 'Cumulative supply spend, fixed schedule vs Supply Tracker' });
  };
  draw();
  redrawCharts = draw;
}

// ---------- reveal ----------
function setupReveals(root: HTMLElement) {
  const els = root.querySelectorAll<HTMLElement>('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  els.forEach((e, i) => {
    e.style.setProperty('--stagger', `${Math.min(i, 6) * 80}ms`);
    io.observe(e);
  });
}

// ---------- inventory ----------
let invFilter: Status | 'all' = 'all';
let invSearch = '';

function stockBar(st: ItemStats): string {
  const scale = Math.max(st.item.stock, st.target * 1.6, 1);
  const pct = (v: number) => Math.min(100, (v / scale) * 100);
  return `
    <div class="bar" role="img" aria-label="${st.item.stock} on hand. Reorder point ${st.rop}, healthy max ${st.target}.">
      <div class="bar-fill fill-${st.status}" style="width:${pct(st.item.stock)}%"></div>
      <span class="bar-mark mark-rop" style="left:${pct(st.rop)}%" title="Reorder point: ${st.rop}"></span>
      <span class="bar-mark mark-max" style="left:${pct(st.target)}%" title="Healthy max: ${st.target}"></span>
    </div>`;
}

function renderInventory(main: HTMLElement) {
  const stats = allStats(state);
  const counts: Record<Status, number> = { critical: 0, soon: 0, healthy: 0, over: 0 };
  stats.forEach((s) => counts[s.status]++);
  const value = state.items.reduce((a, i) => a + i.stock * i.unitCost, 0);
  const overValue = stats.reduce((a, s) => a + Math.max(0, s.item.stock - s.target) * s.item.unitCost, 0);
  const order: Record<Status, number> = { critical: 0, soon: 1, over: 2, healthy: 3 };
  const rows = stats
    .filter((s) => invFilter === 'all' || s.status === invFilter)
    .filter((s) => !invSearch || (s.item.name + ' ' + s.item.category).toLowerCase().includes(invSearch.toLowerCase()))
    .sort((a, b) => order[a.status] - order[b.status] || a.item.name.localeCompare(b.item.name));

  main.innerHTML = `
    <section class="kpis reveal">
      <div class="kpi"><span class="kpi-label">Items tracked</span><span class="kpi-value">${state.items.length}</span></div>
      <div class="kpi"><span class="kpi-label">Value on shelves</span><span class="kpi-value">${money(value)}</span></div>
      <div class="kpi"><span class="kpi-label">Need action</span><span class="kpi-value">${counts.critical + counts.soon}</span><span class="kpi-note">${counts.critical} critical · ${counts.soon} soon</span></div>
      <div class="kpi"><span class="kpi-label">Tied up in overstock</span><span class="kpi-value">${money(overValue)}</span><span class="kpi-note">above healthy max</span></div>
    </section>

    <section class="panel reveal">
      <div class="panel-head">
        <div class="filters" role="group" aria-label="Filter by status">
          ${(['all', 'critical', 'soon', 'healthy', 'over'] as const)
            .map(
              (f) =>
                `<button class="chip ${invFilter === f ? 'on' : ''}" data-filter="${f}">${f === 'all' ? 'All' : STATUS_LABEL[f]} <span>${f === 'all' ? stats.length : counts[f]}</span></button>`,
            )
            .join('')}
        </div>
        <div class="panel-tools">
          <input type="search" id="inv-search" placeholder="Search items" value="${esc(invSearch)}" aria-label="Search items"/>
          <button class="btn primary" id="add-item">+ Add item</button>
        </div>
      </div>
      <div class="bar-legend"><span><i class="lg-rop"></i>Reorder point</span><span><i class="lg-max"></i>Healthy max</span></div>
      <div class="inv-list">
        <div class="inv-row inv-header" aria-hidden="true">
          <span>Item</span><span>On hand</span><span>Stock level</span><span>Status</span><span>Unit cost</span><span></span>
        </div>
        ${
          rows.length
            ? rows
                .map(
                  (s) => `
          <div class="inv-row">
            <div class="inv-name"><b>${esc(s.item.name)}</b><span>${esc(s.item.category)} · ${esc(s.item.unit)}</span></div>
            <div class="inv-stock"><b class="mono">${s.item.stock}</b><span>${s.avg > 0 ? (s.item.stock === 0 ? 'out of stock' : `${num(s.daysOfSupply, 0)} days left`) : 'no recent use'}</span></div>
            <div class="inv-bar">${stockBar(s)}</div>
            <div class="inv-status">${pill(s.status)}</div>
            <div class="inv-cost mono">${money(s.item.unitCost, 2)}</div>
            <div class="inv-act"><button class="btn small ghost" data-edit="${s.item.id}" aria-label="Edit ${esc(s.item.name)}">Edit</button></div>
          </div>`,
                )
                .join('')
            : `<p class="empty">No items match.</p>`
        }
      </div>
    </section>`;

  main.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((b) =>
    b.addEventListener('click', () => {
      invFilter = b.dataset.filter as Status | 'all';
      renderView();
    }),
  );
  const search = main.querySelector<HTMLInputElement>('#inv-search')!;
  search.addEventListener('input', () => {
    invSearch = search.value;
    renderView();
    const s2 = document.querySelector<HTMLInputElement>('#inv-search');
    if (s2) {
      s2.focus();
      s2.setSelectionRange(s2.value.length, s2.value.length);
    }
  });
  main.querySelector('#add-item')!.addEventListener('click', () => openItemDialog());
  main.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach((b) =>
    b.addEventListener('click', () => openItemDialog(state.items.find((i) => i.id === b.dataset.edit))),
  );
}

// ---------- item dialog ----------
function openItemDialog(item?: Item) {
  const dlg = document.getElementById('item-dialog') as HTMLDialogElement;
  const isNew = !item;
  const it: Item = item ?? {
    id: 'item-' + uid(),
    name: '',
    category: '',
    unit: 'each',
    unitCost: 0,
    leadTimeDays: 5,
    stock: 0,
    blindFactor: 1.6,
  };
  const cats = Array.from(new Set(state.items.map((i) => i.category))).sort();
  dlg.innerHTML = `
    <form method="dialog" class="dlg-form" id="item-form">
      <h2>${isNew ? 'Add item' : 'Edit item'}</h2>
      <label>Name<input name="name" required maxlength="60" value="${esc(it.name)}"/></label>
      <div class="two">
        <label>Category<input name="category" list="cat-list" required maxlength="30" value="${esc(it.category)}"/></label>
        <label>Unit<input name="unit" required maxlength="30" value="${esc(it.unit)}"/></label>
      </div>
      <datalist id="cat-list">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
      <div class="three">
        <label>Unit cost ($)<input name="unitCost" type="number" min="0" step="0.01" required value="${it.unitCost}"/></label>
        <label>Lead time (days)<input name="leadTimeDays" type="number" min="1" max="120" step="1" required value="${it.leadTimeDays}"/></label>
        <label>On hand<input name="stock" type="number" min="0" step="1" required value="${it.stock}"/></label>
      </div>
      <p class="hint">Changing "On hand" here is a stock count correction. To record use or a delivery, use Log activity so history stays accurate.</p>
      <div class="dlg-actions">
        ${isNew ? '' : '<button type="button" class="btn danger" id="del-item">Delete item</button>'}
        <span class="spacer"></span>
        <button type="button" class="btn ghost" id="cancel-item">Cancel</button>
        <button type="submit" class="btn primary">${isNew ? 'Add item' : 'Save'}</button>
      </div>
    </form>`;
  dlg.showModal();
  const form = dlg.querySelector<HTMLFormElement>('#item-form')!;
  dlg.querySelector('#cancel-item')!.addEventListener('click', () => dlg.close());
  dlg.querySelector('#del-item')?.addEventListener('click', () => {
    if (!confirm(`Delete "${it.name}" and its history?`)) return;
    state.items = state.items.filter((i) => i.id !== it.id);
    state.events = state.events.filter((e) => e.itemId !== it.id);
    persist();
    dlg.close();
    renderView();
    toast(`Deleted ${it.name}`);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const next: Item = {
      ...it,
      name: String(fd.get('name')).trim(),
      category: String(fd.get('category')).trim(),
      unit: String(fd.get('unit')).trim(),
      unitCost: Math.max(0, Number(fd.get('unitCost')) || 0),
      leadTimeDays: Math.max(1, Math.round(Number(fd.get('leadTimeDays')) || 1)),
      stock: Math.max(0, Math.round(Number(fd.get('stock')) || 0)),
    };
    if (isNew) state.items.push(next);
    else state.items = state.items.map((i) => (i.id === it.id ? next : i));
    persist();
    dlg.close();
    renderView();
    toast(isNew ? `Added ${next.name}` : `Saved ${next.name}`);
  });
}

// ---------- log activity ----------
function itemOptions(selected?: string) {
  return [...state.items]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((i) => `<option value="${i.id}" ${i.id === selected ? 'selected' : ''}>${esc(i.name)} (${i.stock} on hand)</option>`)
    .join('');
}

let lastLogItem = '';

function renderLog(main: HTMLElement) {
  const recent = state.events
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.date < b.e.date ? 1 : a.e.date > b.e.date ? -1 : b.i - a.i))
    .slice(0, 25)
    .map((x) => x.e);
  const nameOf = (id: string) => state.items.find((i) => i.id === id)?.name ?? 'Deleted item';
  const t = today();
  const form = (kind: 'use' | 'receive') => `
    <form class="panel log-form reveal" data-kind="${kind}">
      <h2>${kind === 'use' ? 'Log usage' : 'Receive order'}</h2>
      <p class="hint">${kind === 'use' ? 'What did the team use this shift?' : 'A delivery arrived. Add it to stock.'}</p>
      <label>Item<select name="item" required>${itemOptions(lastLogItem)}</select></label>
      <div class="two">
        <label>Quantity<input name="qty" type="number" min="1" step="1" required value="1"/></label>
        <label>Date<input name="date" type="date" required max="${t}" value="${t}"/></label>
      </div>
      <label><span>Note <span class="opt">(optional)</span></span><input name="note" maxlength="80" placeholder="${kind === 'use' ? 'e.g. Spill cleanup at queue' : 'e.g. PO 1042'}"/></label>
      <button class="btn primary" type="submit">${kind === 'use' ? 'Log usage' : 'Add to stock'}</button>
    </form>`;

  main.innerHTML = `
    <div class="log-grid">
      ${form('use')}
      ${form('receive')}
    </div>
    <section class="panel reveal">
      <h2>Recent activity</h2>
      <ul class="activity">
        ${recent
          .map(
            (e) => `
          <li>
            <span class="act-type act-${e.type}">${e.type === 'use' ? 'Used' : 'Received'}</span>
            <span class="act-what"><b>${e.type === 'use' ? '−' : '+'}${e.qty}</b> ${esc(nameOf(e.itemId))}${e.note ? `<em> · ${esc(e.note)}</em>` : ''}</span>
            <span class="act-date mono">${e.date}</span>
            <button class="btn small ghost" data-undo="${e.id}" aria-label="Undo this entry">Undo</button>
          </li>`,
          )
          .join('')}
      </ul>
    </section>`;

  main.querySelectorAll<HTMLFormElement>('.log-form').forEach((f) =>
    f.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const kind = f.dataset.kind as 'use' | 'receive';
      const fd = new FormData(f);
      const itemId = String(fd.get('item'));
      const item = state.items.find((i) => i.id === itemId);
      if (!item) return;
      let qty = Math.max(1, Math.round(Number(fd.get('qty')) || 0));
      if (kind === 'use' && qty > item.stock) {
        if (!confirm(`Only ${item.stock} ${item.name} on hand. Log ${item.stock} instead?`)) return;
        qty = item.stock;
        if (qty === 0) return;
      }
      const ev2: StockEvent = {
        id: uid(),
        itemId,
        date: String(fd.get('date')) || t,
        type: kind,
        qty,
        note: String(fd.get('note') || '').trim() || undefined,
      };
      state.events.push(ev2);
      item.stock += kind === 'use' ? -qty : qty;
      lastLogItem = itemId;
      persist();
      renderView();
      toast(`${kind === 'use' ? 'Logged' : 'Received'} ${qty} × ${item.name}. Now ${item.stock} on hand.`);
    }),
  );
  main.querySelectorAll<HTMLButtonElement>('[data-undo]').forEach((b) =>
    b.addEventListener('click', () => {
      const e = state.events.find((x) => x.id === b.dataset.undo);
      if (!e) return;
      const item = state.items.find((i) => i.id === e.itemId);
      if (item) item.stock = Math.max(0, item.stock + (e.type === 'use' ? e.qty : -e.qty));
      state.events = state.events.filter((x) => x.id !== e.id);
      persist();
      renderView();
      toast('Entry removed and stock adjusted');
    }),
  );
}

// ---------- reorder ----------
function explain(s: ItemStats): string {
  const u = esc(s.item.unit);
  const L = s.item.leadTimeDays;
  if (s.avg <= 0) return `No usage logged in the last ${s.days} days, so there is nothing to base a reorder on yet. Log usage and a suggestion will appear.`;
  const parts = [
    `The team uses about <b>${num(s.avg, 1)}</b> per day (unit: ${u}), and a typical day swings by about ±${num(s.sd, 1)}.`,
    `A delivery takes <b>${L} day${L === 1 ? '' : 's'}</b>, so you go through roughly <b>${num(s.leadDemand, 1)}</b> while you wait.`,
    `Adding a buffer of <b>${num(s.safety, 1)}</b> for busy days gives a reorder point of <b>${s.rop}</b>.`,
  ];
  if (s.suggestQty > 0) {
    parts.push(
      `You have <b>${s.item.stock}</b>, which is at or below that point. Order <b>${s.suggestQty}</b> to get back up to about ${ORDER_CYCLE_DAYS} days of supply plus the buffer (${s.target}).`,
    );
    if (s.status === 'critical')
      parts.push(
        s.item.stock === 0
          ? `You are already out, so consider a rush order to cover the ${L} days until a normal order arrives.`
          : `At this rate you may run out in about ${Math.max(1, Math.round(s.daysOfSupply))} day${Math.max(1, Math.round(s.daysOfSupply)) === 1 ? '' : 's'}, before a normal order arrives. Consider a rush order.`,
      );
  } else if (s.status === 'over') {
    parts.push(
      `You have <b>${s.item.stock}</b>, about ${num(s.daysOfSupply, 0)} days of supply. That is well above the healthy max of ${s.target}, so roughly ${money((s.item.stock - s.target) * s.item.unitCost)} is sitting on the shelf. Skip the next order.`,
    );
  } else {
    parts.push(`You have <b>${s.item.stock}</b>. No order needed yet; expect to reorder in about <b>${num(s.daysUntilReorder, 0)} days</b>.`);
  }
  return parts.join(' ');
}

function renderReorder(main: HTMLElement) {
  const stats = allStats(state);
  const dates = windowDates();
  const rank: Record<Status, number> = { critical: 0, soon: 1, over: 3, healthy: 2 };
  stats.sort((a, b) => rank[a.status] - rank[b.status] || a.daysUntilReorder - b.daysUntilReorder);
  const toOrder = stats.filter((s) => s.suggestQty > 0);
  const total = toOrder.reduce((a, s) => a + s.suggestQty * s.item.unitCost, 0);

  main.innerHTML = `
    <section class="panel order-sheet reveal">
      <div>
        <p class="eyebrow">Suggested order today</p>
        <h2>${toOrder.length ? `${toOrder.length} item${toOrder.length > 1 ? 's' : ''} · ${money(total)}` : 'Nothing to order today'}</h2>
        <p class="hint">Based on the last ${dates.length} days of logged usage. Reorder point = usage during lead time + safety buffer (about a 95% chance of not running out while you wait).</p>
      </div>
      ${
        toOrder.length
          ? `<table class="order-table"><thead><tr><th>Item</th><th>Qty</th><th>Est. cost</th></tr></thead><tbody>
          ${toOrder.map((s) => `<tr><td>${esc(s.item.name)}</td><td class="mono">${s.suggestQty}</td><td class="mono">${money(s.suggestQty * s.item.unitCost, 2)}</td></tr>`).join('')}
          </tbody></table>`
          : ''
      }
    </section>
    <div class="reorder-grid">
      ${stats
        .map(
          (s) => `
        <article class="panel rcard reveal">
          <header><h3>${esc(s.item.name)}</h3>${pill(s.status)}</header>
          <p class="rcard-action">${
            s.suggestQty > 0
              ? `Order <b>${s.suggestQty}</b> now <span>(${money(s.suggestQty * s.item.unitCost)})</span>`
              : s.status === 'over'
                ? 'Skip the next order'
                : s.avg > 0
                  ? `Reorder in ~${num(s.daysUntilReorder, 0)} days`
                  : 'Not enough data'
          }</p>
          <p class="why">${explain(s)}</p>
          <div class="spark-wrap">${usageSpark(s.daily, s.avg, dates)}<div class="spark-cap"><span>Daily use, last ${dates.length} days</span><span>avg ${num(s.avg, 1)}/day</span></div></div>
          <details>
            <summary>Show the math</summary>
            <dl class="math">
              <dt>Average daily use</dt><dd>${num(s.avg, 2)}</dd>
              <dt>Daily variability (std. dev.)</dt><dd>${num(s.sd, 2)}</dd>
              <dt>Lead time</dt><dd>${s.item.leadTimeDays} days</dd>
              <dt>Lead-time demand</dt><dd>${num(s.avg, 2)} × ${s.item.leadTimeDays} = ${num(s.leadDemand, 1)}</dd>
              <dt>Safety stock</dt><dd>${SERVICE_Z} × ${num(s.sd, 2)} × √${s.item.leadTimeDays} = ${num(s.safety, 1)}</dd>
              <dt>Reorder point</dt><dd>⌈${num(s.leadDemand, 1)} + ${num(s.safety, 1)}⌉ = ${s.rop}</dd>
              <dt>Order-up-to level</dt><dd>${s.rop} + ${ORDER_CYCLE_DAYS} days × ${num(s.avg, 2)} = ${s.target}</dd>
            </dl>
          </details>
        </article>`,
        )
        .join('')}
    </div>`;
}

// ---------- savings ----------
function renderSavings(main: HTMLElement) {
  const c = compare(state);
  const saved = c.blind.spend - c.smart.spend;
  const pct = c.blind.spend > 0 ? (saved / c.blind.spend) * 100 : 0;
  const cum = (arr: number[]) => {
    let a = 0;
    return arr.map((v) => (a += v));
  };
  const perItem = [...c.perItem].sort((a, b) => b.blind.spend - b.smart.spend - (a.blind.spend - a.smart.spend));
  const avgShelf = (r: typeof c.blind) => r.dailyShelfValue.reduce((a, b) => a + b, 0) / Math.max(1, r.dailyShelfValue.length);

  const tile = (label: string, blind: string, smart: string, better: string, note = '') => `
    <div class="cmp reveal">
      <span class="kpi-label">${label}</span>
      <div class="cmp-vals">
        <div><span class="who"><i class="dot dot-blind"></i>Blind</span><b class="mono">${blind}</b></div>
        <div><span class="who"><i class="dot dot-smart"></i>Data-driven</span><b class="mono">${smart}</b></div>
      </div>
      <span class="cmp-delta">${better}</span>
      ${note ? `<span class="kpi-note">${note}</span>` : ''}
    </div>`;

  main.innerHTML = `
    <section class="hero-stat reveal">
      <p class="eyebrow">Budget recovered · last ${c.dates.length} days</p>
      <h2><span class="grad">${money(saved)}</span> freed up, <span class="mono">${num(pct, 0)}%</span> of supply spend</h2>
      <p class="lede">Same items, same daily usage. Ordering on a fixed schedule with padded guesses would have cost <b>${money(c.blind.spend)}</b>. Ordering from the reorder points in this app would have cost <b>${money(c.smart.spend)}</b>, with fewer stockout days. That difference is budget the operation could put somewhere else.</p>
      <p class="fineprint">Sample data for demonstration only, not real Disney data. Recalculates as you log usage or edit costs.</p>
    </section>

    <section class="cmp-grid">
      ${tile('Total spend', money(c.blind.spend), money(c.smart.spend), `−${money(saved)}`)}
      ${tile('Avg. value sitting on shelves', money(avgShelf(c.blind)), money(avgShelf(c.smart)), `−${money(avgShelf(c.blind) - avgShelf(c.smart))}`, `of which overstock: ${money(c.blind.avgExcessValue)} vs ${money(c.smart.avgExcessValue)}`)}
      ${tile('Stockout days', String(c.blind.stockoutDays), String(c.smart.stockoutDays), c.smart.stockoutDays <= c.blind.stockoutDays ? `${c.blind.stockoutDays - c.smart.stockoutDays} fewer` : `${c.smart.stockoutDays - c.blind.stockoutDays} more`, 'item-days where demand exceeded stock')}
      ${tile('Emergency orders', String(c.blind.rushOrders), String(c.smart.rushOrders), `${Math.max(0, c.blind.rushOrders - c.smart.rushOrders)} avoided`, `rush orders cost ${Math.round((RUSH_PREMIUM - 1) * 100)}% more`)}
    </section>

    <section class="panel reveal">
      <h2>Cumulative spend</h2>
      <p class="hint">Blind ordering spends on a fixed rhythm whether stock is needed or not.</p>
      <div class="chart" id="chart-spend"></div>
    </section>
    <section class="panel reveal">
      <h2>Value of stock on shelves</h2>
      <p class="hint">Money tied up in inventory each day. Lower is better, as long as stockouts stay low.</p>
      <div class="chart" id="chart-shelf"></div>
    </section>

    <section class="panel reveal">
      <h2>Where the savings come from</h2>
      <div class="table-scroll">
      <table class="data-table">
        <thead><tr><th>Item</th><th>Blind spend</th><th>Data-driven</th><th>Saved</th><th>Stockout days</th></tr></thead>
        <tbody>
          ${perItem
            .map(
              (p) => `<tr><td>${esc(p.item.name)}</td><td class="mono">${money(p.blind.spend)}</td><td class="mono">${money(p.smart.spend)}</td><td class="mono ${p.blind.spend - p.smart.spend >= 0 ? 'pos' : 'neg'}">${p.blind.spend - p.smart.spend >= 0 ? '' : '−'}${money(Math.abs(p.blind.spend - p.smart.spend))}</td><td class="mono">${p.blind.stockoutDays} → ${p.smart.stockoutDays}</td></tr>`,
            )
            .join('')}
        </tbody>
      </table>
      </div>
    </section>

    <section class="panel reveal">
      <details class="method">
        <summary>How this is calculated</summary>
        <ul>
          <li><b>Demand:</b> the actual usage logged for each item over the last ${c.dates.length} days. Both strategies face exactly the same days.</li>
          <li><b>Starting point:</b> both start with the same stock (about one lead time plus a week of supply).</li>
          <li><b>Ordering blind:</b> every ${BLIND_INTERVAL_DAYS} days, order the "usual" amount: two weeks of use padded by a per-item habit factor (most items padded 1.5 to 2.1×; seasonal items like ponchos were under-ordered). If an item runs out, place a rush order at a ${Math.round((RUSH_PREMIUM - 1) * 100)}% premium.</li>
          <li><b>Data-driven:</b> when stock plus anything on order drops to the reorder point, order up to the healthy max. Rush orders follow the same rule if it ever runs out.</li>
          <li><b>Spend</b> counts every order placed in the period. <b>Overstock</b> is stock above the healthy max, valued at unit cost.</li>
          <li><b>Caveat:</b> the data-driven run uses usage stats from the whole window, so it has some hindsight. In real use the estimates update as data comes in, so expect results a bit below this.</li>
        </ul>
      </details>
    </section>`;

  const spendSeries = [
    { name: 'Ordering blind', key: 'blind', color: 'var(--series-blind)', values: cum(c.blind.dailySpend) },
    { name: 'Data-driven', key: 'smart', color: 'var(--series-smart)', values: cum(c.smart.dailySpend) },
  ];
  const shelfSeries = [
    { name: 'Ordering blind', key: 'blind', color: 'var(--series-blind)', values: c.blind.dailyShelfValue },
    { name: 'Data-driven', key: 'smart', color: 'var(--series-smart)', values: c.smart.dailyShelfValue },
  ];
  const fmtK = (v: number) => (v >= 1000 ? `$${num(v / 1000, 1)}k` : money(v));
  const draw = () => {
    const a = document.getElementById('chart-spend');
    const b = document.getElementById('chart-shelf');
    if (a) mountLineChart(a, { dates: c.dates, series: spendSeries, format: fmtK, label: 'Cumulative supply spend, blind vs data-driven' });
    if (b) mountLineChart(b, { dates: c.dates, series: shelfSeries, format: fmtK, height: 220, label: 'Daily value of stock on shelves, blind vs data-driven' });
  };
  draw();
  redrawCharts = draw;
}

let redrawCharts: (() => void) | null = null;
let resizeTimer = 0;
let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    redrawCharts?.();
  }, 150);
});

// ---------- boot ----------
render();
window.addEventListener('hashchange', render);
