// Data model and the fixed seeded dataset. Every page load builds the same numbers;
// edits made during a visit live in memory only.

export interface Item {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitCost: number;
  leadTimeDays: number;
  stock: number;
  /** How much padding the team used when ordering "blind" (baseline simulation only). */
  blindFactor: number;
}

export type EventType = 'use' | 'receive';

export interface StockEvent {
  id: string;
  itemId: string;
  date: string; // YYYY-MM-DD
  type: EventType;
  qty: number;
  note?: string;
}

export interface AppState {
  version: number;
  seededAt: string;
  items: Item[];
  events: StockEvent[];
}

const STATE_VERSION = 1;
export const HISTORY_DAYS = 90;

// ---------- date helpers ----------
export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return isoDate(dt);
}
export function today(): string {
  return isoDate(new Date());
}
export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// ---------- seeded RNG ----------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function poisson(mean: number, rnd: () => number): number {
  if (mean <= 0) return 0;
  if (mean > 30) {
    // normal approximation
    const u = 1 - rnd();
    const v = rnd();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return Math.max(0, Math.round(mean + z * Math.sqrt(mean)));
  }
  const L = Math.exp(-mean);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rnd();
  } while (p > L);
  return k - 1;
}

interface SeedSpec {
  name: string;
  category: string;
  unit: string;
  unitCost: number;
  lead: number;
  base: number; // mean daily usage
  blind: number; // blind-ordering padding factor
  scenario?: 'overstock' | 'critical' | 'soon';
  rainy?: boolean;
}

const SEED: SeedSpec[] = [
  { name: 'Nitrile gloves', category: 'PPE', unit: 'box of 100', unitCost: 9.5, lead: 5, base: 3.2, blind: 1.8, scenario: 'soon' },
  { name: 'Disinfectant wipes', category: 'Cleaning', unit: 'canister', unitCost: 6.8, lead: 4, base: 5, blind: 1.9 },
  { name: 'Multi-surface cleaner', category: 'Cleaning', unit: 'gallon', unitCost: 14, lead: 5, base: 1.1, blind: 1.8, scenario: 'overstock' },
  { name: 'Paper towels', category: 'Cleaning', unit: 'case of 12', unitCost: 38, lead: 4, base: 0.6, blind: 1.7 },
  { name: 'Trash liners', category: 'Cleaning', unit: 'case of 250', unitCost: 42, lead: 5, base: 0.5, blind: 1.9 },
  { name: 'Hand sanitizer refill', category: 'Cleaning', unit: '1 L bottle', unitCost: 11, lead: 5, base: 1.6, blind: 1.8 },
  { name: 'AA batteries', category: 'Electrical', unit: '24-pack', unitCost: 16.5, lead: 3, base: 0.9, blind: 2.1, scenario: 'critical' },
  { name: '9V batteries', category: 'Electrical', unit: '12-pack', unitCost: 21, lead: 3, base: 0.25, blind: 1.9 },
  { name: 'Radio earpieces', category: 'Electrical', unit: 'each', unitCost: 24, lead: 10, base: 0.25, blind: 1.6, scenario: 'soon' },
  { name: 'Guest wristbands', category: 'Guest', unit: 'roll of 500', unitCost: 55, lead: 14, base: 0.8, blind: 1.7, scenario: 'overstock' },
  { name: 'Ticket paper rolls', category: 'Guest', unit: 'case of 50', unitCost: 48, lead: 7, base: 0.35, blind: 2.1 },
  { name: 'Rain ponchos', category: 'Guest', unit: 'case of 200', unitCost: 90, lead: 10, base: 0.15, blind: 0.9, rainy: true },
  { name: 'Sunscreen packets', category: 'Guest', unit: 'box of 100', unitCost: 32, lead: 7, base: 0.3, blind: 1.9 },
  { name: 'First-aid kit refills', category: 'Safety', unit: 'refill pack', unitCost: 27, lead: 7, base: 0.45, blind: 1.6, scenario: 'critical' },
  { name: 'Ear plugs', category: 'Safety', unit: 'box of 200', unitCost: 28, lead: 7, base: 0.12, blind: 1.8 },
  { name: 'Safety vests', category: 'Safety', unit: 'each', unitCost: 8, lead: 10, base: 0.12, blind: 2.0, scenario: 'overstock' },
  { name: 'Zip ties', category: 'Maintenance', unit: 'bag of 1000', unitCost: 12, lead: 5, base: 0.15, blind: 1.7 },
  { name: 'Gaffer tape', category: 'Maintenance', unit: 'roll', unitCost: 19, lead: 5, base: 0.35, blind: 1.5 },
];

/** Build ~90 days of usage and deliveries, ending today. */
export function buildSeedState(): AppState {
  const rnd = mulberry32(20261013);
  const end = today();
  const start = addDays(end, -(HISTORY_DAYS - 1));
  const items: Item[] = [];
  const events: StockEvent[] = [];

  // shared rainy days (for ponchos)
  const rainy: boolean[] = Array.from({ length: HISTORY_DAYS }, () => rnd() < 0.12);

  SEED.forEach((s, idx) => {
    const id = `item-${idx + 1}`;
    const cycle = 14;
    const ss = 1.65 * Math.sqrt(s.lead) * Math.sqrt(s.base) * (s.rainy ? 3 : 1.6) + 1;
    const rop = s.base * s.lead + ss;
    const max = rop + s.base * cycle * 1.2;
    let stock = Math.round(max * 0.8 + 1);
    const pipeline: { day: number; qty: number }[] = [];

    for (let t = 0; t < HISTORY_DAYS; t++) {
      const date = addDays(start, t);
      // deliveries
      for (const p of pipeline.filter((p) => p.day === t)) {
        stock += p.qty;
        events.push({ id: uid(), itemId: id, date, type: 'receive', qty: p.qty, note: 'Scheduled order' });
      }
      // usage
      const dow = (HISTORY_DAYS - 1 - t) % 7; // fixed weekly rhythm, independent of the calendar
      const weekend = dow === 0 || dow === 5 || dow === 6 ? 1.3 : 0.9;
      let mean = s.base * weekend * (0.95 + 0.1 * (t / HISTORY_DAYS));
      if (s.rainy) mean = rainy[t] ? s.base * 7 : s.base * 0.3;
      const want = poisson(mean, rnd);
      const used = Math.min(stock, want);
      if (used > 0) {
        stock -= used;
        events.push({ id: uid(), itemId: id, date, type: 'use', qty: used });
      }
      // reorder decision
      const onOrder = pipeline.filter((p) => p.day > t).reduce((a, p) => a + p.qty, 0);
      const daysLeft = HISTORY_DAYS - t;
      let allowOrder = true;
      if (s.scenario === 'critical' && daysLeft <= 22) allowOrder = false;
      if (s.scenario === 'soon' && daysLeft <= 10) allowOrder = false;
      if (s.scenario === 'overstock' && daysLeft <= 20) allowOrder = false;
      if (allowOrder && stock + onOrder <= rop) {
        const qty = Math.max(1, Math.round(max - stock - onOrder));
        pipeline.push({ day: t + s.lead, qty });
      }
      // a bulk "just in case" order that landed recently
      if (s.scenario === 'overstock' && daysLeft === 9) {
        const qty = Math.max(3, Math.round(s.base * 75));
        stock += qty;
        events.push({ id: uid(), itemId: id, date, type: 'receive', qty, note: 'Bulk order (vendor promo)' });
      }
    }

    items.push({
      id,
      name: s.name,
      category: s.category,
      unit: s.unit,
      unitCost: s.unitCost,
      leadTimeDays: s.lead,
      stock,
      blindFactor: s.blind,
    });
  });

  events.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { version: STATE_VERSION, seededAt: end, items, events };
}

// ---------- state ----------
/** Fresh copy of the fixed seeded dataset. Nothing is persisted between visits. */
export function loadState(): AppState {
  return buildSeedState();
}
