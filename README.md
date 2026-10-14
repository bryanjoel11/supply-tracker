# Supply Tracker v2

A product website and web app for inventory and reorder planning on small operations teams, plus a product case study.

When I worked in theme park attractions operations, I built a simple app to track our supplies. Before it, the team ordered blind. Seeing our stock at a glance helped us stop over-ordering and freed up budget for the rest of the operation. This repo is v2: the same idea turned into a general product.

## Why it matters (for a hiring manager)

- **Real product framing.** A branded landing page sells the product before the app opens, the way a SaaS site would.
- **Commercial outcome first.** The results section and Savings view leads with budget recovered, not features: same demand, two ordering strategies, and the dollar difference.
- **Product thinking.** The case study page covers the problem, v1, impact, what v2 adds, two personas, a v1/v2/next roadmap, and success metrics with guardrails (savings must not come from more stockouts).
- **Explainable decisions.** Every reorder suggestion is written out in plain words, with the math one click away, so a shift lead can trust it.
- **Built from floor experience.** It solves a problem I lived, not a hypothetical one.

## What's in the site

- **Landing page:** hero with a live product window built from the app's own data, three product features, a four-step "how it works", a results section with the savings headline and spend chart, and a footer.
- **App** (sidebar on desktop, tabs on mobile):
  - **Inventory:** every item with stock on hand, days of supply, unit cost, and a stock bar showing reorder point and healthy max. Status is Healthy, Reorder soon, Critical or Overstocked (icon + label, not color alone). Filter, search, add, edit, delete.
  - **Log activity:** log usage and receive orders with simple forms; recent activity with undo.
  - **Reorder:** average daily usage and variability over the last 90 days, reorder point = lead-time demand + safety stock (z = 1.65, about a 95% service level), and an order-up-to quantity (~14 days of supply + buffer), explained in plain words with the math one click away, plus a "suggested order today" sheet.
  - **Savings:** compares "ordering blind" (fixed every-14-days orders padded by habit, rush orders at a 30% premium when out) with data-driven ordering over the same 90 days of usage: spend, value on shelves, overstock, stockout days and emergency orders, with SVG charts and a per-item table. It recalculates when the data changes.
- **Case study page:** problem, v1, impact, what v2 adds, personas, roadmap, success metrics, written in first person with `[verify]` markers on details to confirm.
- **Fixed seeded dataset:** 18 supply items with 90 days of usage and deliveries. Every page load starts from the same numbers; edits during a visit stay in memory and are not saved.

## Brand

Supply Tracker has its own identity: a shelf-and-boxes logo mark with a two-weight wordmark, a light warm off-white palette (`#FAF7F2`) with a deep green primary (`#0E5E4E`) and a warm orange accent (`#E8913A`), and Manrope (headings), IBM Plex Sans (body) and IBM Plex Mono (numbers) from Google Fonts. Chart colors were checked for contrast and color-blind separation.

## Tech

Vite + TypeScript, no UI framework, hand-rolled SVG charts, hash routing (`#/`, `#/product`, `#/how-it-works`, `#/case-study`, `#/app/inventory|log|reorder|savings`) so it stays a static site. Honors `prefers-reduced-motion`; works down to phone width.

```
src/
  site.ts        logo, nav, landing page, footer
  data.ts        data model and fixed seeded dataset
  analytics.ts   usage stats, reorder math, blind vs data-driven simulation
  charts.ts      SVG line chart (crosshair tooltip) and usage sparkline
  caseStudy.ts   case study page
  main.ts        routing, app views and interactions
  style.css      brand and layout
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
- No saving: edits last for the visit only. Shared data, roles, barcode scanning and supplier tracking are on the roadmap.
