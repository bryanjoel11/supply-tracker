# Supply Tracker v2

An inventory and reorder-planning tool for small operations teams, plus a product case study.

While working attractions in Tomorrowland, I built a simple app to track our supplies. Before it, the team ordered blind. The stock visualization helped us stop over-ordering and, by my estimate, recover about 35% of a supply budget that was being misused, which was reallocated elsewhere in the operation. I no longer have that app, so v1 is recreated from memory in the case study. This repo is v2: the same idea turned into a general product.

> Personal portfolio project. All items, numbers and history in the app are fictional demo data for a generic "attraction operations team". No internal Disney data, logos or screenshots are used.

## Why it matters (for a hiring manager)

- **Commercial outcome first.** The Savings tab leads with budget recovered, not features: same demand, two ordering strategies, and the dollar difference.
- **Product thinking.** The Case study tab covers the problem, v1, impact, what v2 adds, two personas, a v1/v2/next roadmap, and success metrics with guardrails (savings must not come from more stockouts).
- **Explainable decisions.** Every reorder suggestion is written out in plain words, with the math one click away, so a shift lead can trust it.
- **Built from floor experience.** It solves a problem I lived, not a hypothetical one.

## Features

- **Inventory:** every item with stock on hand, days of supply, unit cost, and a stock bar showing reorder point and healthy max. Status is one of Healthy, Reorder soon, Critical, Overstocked (icon + label, not color alone). Filter, search, add, edit, delete.
- **Log activity:** log usage and receive orders with simple forms; recent activity with undo.
- **Reorder:** for each item, average daily usage and variability over the last 90 days, reorder point = lead-time demand + safety stock (z = 1.65, about 95% service level), and an order-up-to quantity (~14 days of supply + buffer). Includes a "suggested order today" sheet and a usage sparkline per item.
- **Savings dashboard:** simulates "ordering blind" (fixed every-14-days orders padded by habit, rush orders at a 30% premium when out) against data-driven ordering on the same 90 days of usage. Compares spend, value sitting on shelves, overstock, stockout days and emergency orders, with hover-able SVG charts and a per-item table. With the demo data it lands at about 38% less spend; it recalculates when you change the data.
- **Case study** in first person, with `[verify]` markers on details to confirm.
- **Reset demo data** button. Everything runs client-side; data lives in `localStorage`.

## Tech

Vite + TypeScript, no UI framework, hand-rolled SVG charts. Fonts: Space Grotesk, Inter, JetBrains Mono (Google Fonts). "Stellar Forge" dark theme shared with the rest of the portfolio. Honors `prefers-reduced-motion`; works down to phone width.

```
src/
  data.ts        data model, seeded demo generator, localStorage
  analytics.ts   usage stats, reorder math, blind vs data-driven simulation
  charts.ts      SVG line chart (crosshair tooltip) and usage sparkline
  caseStudy.ts   case study copy
  main.ts        views and interactions
  style.css      theme and layout
```

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build to dist/
npm run preview   # serve dist/
```

## Deploy to Netlify

`netlify.toml` is included. In Netlify: **Add new site → Import from Git**, choose the repo, and use:

- Build command: `npm run build`
- Publish directory: `dist`

Or drag the `dist/` folder into Netlify Drop. The build uses relative paths (`base: './'`), so `dist/` also works from any subfolder.

## Known limits

- The data-driven simulation uses usage statistics from the whole 90-day window, so it has some hindsight; real-world savings would be a bit lower.
- Single user, single device (localStorage). Shared data, roles, barcode scanning and supplier tracking are on the roadmap.
