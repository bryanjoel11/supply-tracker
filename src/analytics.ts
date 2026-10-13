import { AppState, Item, StockEvent, addDays, today, HISTORY_DAYS } from './data';

export const SERVICE_Z = 1.65; // ~95% chance of not running out during a lead time
export const ORDER_CYCLE_DAYS = 14; // order roughly two weeks of supply at a time
export const BLIND_INTERVAL_DAYS = 14; // the old habit: order every other week
export const RUSH_PREMIUM = 1.3; // emergency orders cost 30% more
export const RUSH_LEAD_DAYS = 1;

export type Status = 'critical' | 'soon' | 'healthy' | 'over';

export const STATUS_LABEL: Record<Status, string> = {
  critical: 'Critical',
  soon: 'Reorder soon',
  healthy: 'Healthy',
  over: 'Overstocked',
};

export interface ItemStats {
  item: Item;
  days: number;
  daily: number[]; // usage per day, oldest first
  avg: number;
  sd: number;
  leadDemand: number;
  safety: number;
  rop: number;
  target: number; // order-up-to level
  daysOfSupply: number; // Infinity when no usage
  status: Status;
  suggestQty: number; // what to order now (0 if not needed yet)
  daysUntilReorder: number;
}

export function windowDates(end = today(), days = HISTORY_DAYS): string[] {
  const start = addDays(end, -(days - 1));
  return Array.from({ length: days }, (_, i) => addDays(start, i));
}

export function dailyUsage(itemId: string, events: StockEvent[], dates: string[]): number[] {
  const idx = new Map(dates.map((d, i) => [d, i]));
  const out = new Array(dates.length).fill(0);
  for (const e of events) {
    if (e.itemId !== itemId || e.type !== 'use') continue;
    const i = idx.get(e.date);
    if (i !== undefined) out[i] += e.qty;
  }
  return out;
}

export function computeStats(item: Item, events: StockEvent[], dates = windowDates()): ItemStats {
  const daily = dailyUsage(item.id, events, dates);
  const n = daily.length;
  const avg = daily.reduce((a, b) => a + b, 0) / n;
  const variance = daily.reduce((a, b) => a + (b - avg) ** 2, 0) / Math.max(1, n - 1);
  const sd = Math.sqrt(variance);
  const L = Math.max(1, item.leadTimeDays);
  const leadDemand = avg * L;
  const safety = SERVICE_Z * sd * Math.sqrt(L);
  const rop = Math.ceil(leadDemand + safety);
  const target = Math.ceil(rop + avg * ORDER_CYCLE_DAYS);
  const daysOfSupply = avg > 0 ? item.stock / avg : Infinity;

  let status: Status = 'healthy';
  if (avg <= 0) status = item.stock === 0 ? 'critical' : 'healthy';
  else if (item.stock <= Math.ceil(leadDemand)) status = 'critical';
  else if (item.stock <= rop) status = 'soon';
  else if (item.stock > target * 1.5 + 2) status = 'over';

  const suggestQty = item.stock <= rop ? Math.max(1, target - item.stock) : 0;
  const daysUntilReorder = avg > 0 ? Math.max(0, (item.stock - rop) / avg) : Infinity;

  return { item, days: n, daily, avg, sd, leadDemand, safety, rop, target, daysOfSupply, status, suggestQty, daysUntilReorder };
}

export function allStats(state: AppState): ItemStats[] {
  const dates = windowDates();
  return state.items.map((it) => computeStats(it, state.events, dates));
}

// ---------- policy simulation (blind vs data-driven) ----------

export interface PolicyResult {
  spend: number;
  rushOrders: number;
  rushSpend: number;
  stockoutDays: number;
  orders: number;
  avgExcessValue: number; // average value of stock above the healthy max, per day
  endShelfValue: number;
  dailySpend: number[];
  dailyShelfValue: number[];
}

export interface ItemComparison {
  item: Item;
  blind: PolicyResult;
  smart: PolicyResult;
}

export interface Comparison {
  dates: string[];
  blind: PolicyResult;
  smart: PolicyResult;
  perItem: ItemComparison[];
}

function emptyResult(n: number): PolicyResult {
  return {
    spend: 0,
    rushOrders: 0,
    rushSpend: 0,
    stockoutDays: 0,
    orders: 0,
    avgExcessValue: 0,
    endShelfValue: 0,
    dailySpend: new Array(n).fill(0),
    dailyShelfValue: new Array(n).fill(0),
  };
}

function simulate(stats: ItemStats, demand: number[], mode: 'blind' | 'smart'): PolicyResult {
  const { item, avg, rop, target } = stats;
  const n = demand.length;
  const r = emptyResult(n);
  const cost = item.unitCost;
  const L = Math.max(1, item.leadTimeDays);
  // Both policies start from the same shelf: about one lead time plus a week of supply.
  let stock = Math.round(avg * (L + 7));
  const pipeline: { day: number; qty: number }[] = [];
  const blindQty = Math.max(1, Math.round(avg * BLIND_INTERVAL_DAYS * item.blindFactor));
  const offset = item.id.length % BLIND_INTERVAL_DAYS; // stagger the fixed order day per item
  let excessSum = 0;

  const order = (t: number, qty: number, rush: boolean) => {
    const price = cost * (rush ? RUSH_PREMIUM : 1);
    r.spend += qty * price;
    r.dailySpend[t] += qty * price;
    r.orders++;
    if (rush) {
      r.rushOrders++;
      r.rushSpend += qty * price;
    }
    pipeline.push({ day: t + (rush ? RUSH_LEAD_DAYS : L), qty });
  };

  for (let t = 0; t < n; t++) {
    for (const p of pipeline) if (p.day === t) stock += p.qty;
    const want = demand[t];
    if (want > stock) r.stockoutDays++;
    stock = Math.max(0, stock - want);
    const onOrder = pipeline.filter((p) => p.day > t).reduce((a, p) => a + p.qty, 0);

    if (mode === 'blind') {
      if (avg > 0 && (t + offset) % BLIND_INTERVAL_DAYS === 0) order(t, blindQty, false);
      else if (stock === 0 && onOrder === 0 && avg > 0) order(t, Math.max(1, Math.round(avg * 7)), true);
    } else {
      if (avg > 0 && stock + onOrder <= rop) order(t, Math.max(1, target - stock - onOrder), false);
      else if (stock === 0 && onOrder === 0 && avg > 0) order(t, Math.max(1, Math.round(avg * 3)), true);
    }

    const shelf = stock * cost;
    r.dailyShelfValue[t] = shelf;
    excessSum += Math.max(0, stock - target) * cost;
  }
  r.avgExcessValue = excessSum / n;
  r.endShelfValue = stock * cost;
  return r;
}

function addInto(acc: PolicyResult, r: PolicyResult) {
  acc.spend += r.spend;
  acc.rushOrders += r.rushOrders;
  acc.rushSpend += r.rushSpend;
  acc.stockoutDays += r.stockoutDays;
  acc.orders += r.orders;
  acc.avgExcessValue += r.avgExcessValue;
  acc.endShelfValue += r.endShelfValue;
  r.dailySpend.forEach((v, i) => (acc.dailySpend[i] += v));
  r.dailyShelfValue.forEach((v, i) => (acc.dailyShelfValue[i] += v));
}

export function compare(state: AppState): Comparison {
  const dates = windowDates();
  const n = dates.length;
  const blind = emptyResult(n);
  const smart = emptyResult(n);
  const perItem: ItemComparison[] = [];
  for (const item of state.items) {
    const stats = computeStats(item, state.events, dates);
    const b = simulate(stats, stats.daily, 'blind');
    const s = simulate(stats, stats.daily, 'smart');
    addInto(blind, b);
    addInto(smart, s);
    perItem.push({ item, blind: b, smart: s });
  }
  return { dates, blind, smart, perItem };
}

// ---------- formatting ----------
export const money = (v: number, digits = 0) =>
  '$' + v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const num = (v: number, digits = 1) =>
  v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: digits });
