// Marketing-site pieces: logo, nav, landing page, footer.

export const LOGO = `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
  <rect width="32" height="32" rx="8" fill="var(--brand)"/>
  <rect x="7.5" y="15" width="7.5" height="8" rx="1.6" fill="var(--paper)"/>
  <rect x="17" y="9" width="7.5" height="14" rx="1.6" fill="var(--accent)"/>
  <path d="M6.5 25.5h19" stroke="var(--paper)" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

export const WORDMARK = `<span class="wordmark">${LOGO}<span class="wm-text">Supply<b>Tracker</b></span></span>`;

export function siteHeader(active: string): string {
  const link = (href: string, label: string, key: string) =>
    `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`;
  return `
  <header class="site-nav">
    <div class="nav-inner">
      <a href="#/" class="brand-link" aria-label="Supply Tracker home">${WORDMARK}</a>
      <nav class="nav-links" id="nav-links" aria-label="Main">
        ${link('#/product', 'Product', 'product')}
        ${link('#/how-it-works', 'How it works', 'how')}
        ${link('#/case-study', 'Case study', 'case')}
      </nav>
      <div class="nav-cta">
        <a href="#/app/inventory" class="btn primary ${active === 'app' ? 'is-current' : ''}">Open app</a>
        <button class="menu-btn" id="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="nav-links">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
  </header>`;
}

export function siteFooter(): string {
  return `
  <footer class="site-foot">
    <div class="foot-inner">
      <div class="foot-brand">
        ${WORDMARK}
        <p>Inventory and reorder planning for small operations teams.</p>
      </div>
      <div class="foot-cols">
        <div>
          <h4>Product</h4>
          <a href="#/product">Features</a>
          <a href="#/how-it-works">How it works</a>
          <a href="#/app/savings">Savings</a>
        </div>
        <div>
          <h4>App</h4>
          <a href="#/app/inventory">Inventory</a>
          <a href="#/app/log">Log activity</a>
          <a href="#/app/reorder">Reorder</a>
        </div>
        <div>
          <h4>Story</h4>
          <a href="#/case-study">Case study</a>
        </div>
      </div>
    </div>
    <p class="data-note">All data in Supply Tracker is sample data for demonstration purposes only. It is not real Disney data.</p>
    <div class="foot-base"><span>© 2026 Supply Tracker</span><span>Built by Bryan</span></div>
  </footer>`;
}

export interface LandingData {
  previewRows: string; // pre-rendered rows for the hero product window
  needAction: number;
  shelfValue: string;
  pct: number;
  saved: string;
  blindSpend: string;
  smartSpend: string;
  stockoutsBlind: number;
  stockoutsSmart: number;
  rushAvoided: number;
}

const ICON = {
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18V8m6 10V5m6 13v-7m6 7V9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16 10 10l4 4 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7h5v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  coin: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.5.8-2.5 1.9 0 2.6 5.2 1.4 5.2 4.1 0 1.1-1.1 2-2.7 2-1.2 0-2.2-.5-2.7-1.4M12 6.5V8m0 8v1.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

export function landingHTML(d: LandingData): string {
  return `
  <section class="hero">
    <div class="hero-copy reveal">
      <p class="eyebrow">Inventory for small operations teams</p>
      <h1>Stop ordering blind.</h1>
      <p class="hero-sub">Supply Tracker shows what is on your shelves, tells you when to reorder and how much, and shows the money you stop wasting.</p>
      <div class="hero-ctas">
        <a href="#/app/inventory" class="btn primary lg">Open the app</a>
        <a href="#/how-it-works" class="btn ghost lg">See how it works</a>
      </div>
      <ul class="hero-points">
        <li>Runs in the browser</li><li>No account needed</li><li>Plain-language reorder advice</li>
      </ul>
    </div>
    <a class="product-window reveal" href="#/app/inventory" aria-label="Open the inventory view">
      <div class="pw-bar"><span></span><span></span><span></span><em>Inventory</em></div>
      <div class="pw-body">
        <div class="pw-kpis">
          <div><small>Need action</small><b>${d.needAction}</b></div>
          <div><small>On shelves</small><b>${d.shelfValue}</b></div>
          <div class="pw-save"><small>Rush orders avoided</small><b>${d.rushAvoided}</b></div>
        </div>
        <div class="pw-rows">${d.previewRows}</div>
      </div>
    </a>
  </section>

  <section class="band" id="features">
    <div class="section-head reveal">
      <p class="eyebrow">Product</p>
      <h2>Everything a small team needs to order with confidence</h2>
    </div>
    <div class="features">
      <article class="feature reveal">
        <span class="f-icon">${ICON.eye}</span>
        <h3>See every shelf at a glance</h3>
        <p>Each item gets a stock bar with its reorder point and healthy maximum, so "running low" and "way too much" are obvious in one look.</p>
      </article>
      <article class="feature reveal">
        <span class="f-icon">${ICON.bulb}</span>
        <h3>Reorder advice you can trust</h3>
        <p>Suggestions come from your own usage history and supplier lead times, written out in plain words, with the math one click away.</p>
      </article>
      <article class="feature reveal">
        <span class="f-icon">${ICON.coin}</span>
        <h3>Savings you can show</h3>
        <p>Compare ordering on a fixed schedule against ordering on data: spend, cash tied up on shelves, stockouts and rush orders.</p>
      </article>
    </div>
  </section>

  <section class="band alt" id="how">
    <div class="section-head reveal">
      <p class="eyebrow">How it works</p>
      <h2>Four steps from guesswork to a plan</h2>
    </div>
    <ol class="steps">
      <li class="reveal"><span class="step-n">1</span><h3>Add your items</h3><p>Name, unit, cost and how long the supplier takes to deliver.</p></li>
      <li class="reveal"><span class="step-n">2</span><h3>Log each shift</h3><p>Record what was used and what arrived. It takes seconds.</p></li>
      <li class="reveal"><span class="step-n">3</span><h3>Get reorder points</h3><p>Average use, variability and lead time become a clear "order N now".</p></li>
      <li class="reveal"><span class="step-n">4</span><h3>Track the savings</h3><p>See the budget you free up compared with ordering on habit.</p></li>
    </ol>
  </section>

  <section class="band results" id="results">
    <div class="results-grid">
      <div class="results-copy reveal">
        <p class="eyebrow">Results</p>
        <h2>Less guesswork, fewer surprises</h2>
        <p>Ordering from reorder points instead of a padded fixed schedule means the team sees problems coming, stops over-ordering, and keeps the budget working for the rest of the operation.</p>
        <ul class="results-points">
          <li><b>Everyone sees the same shelves.</b> One shared view of what's in stock and what's running low.</li>
          <li><b>No more padded orders.</b> Orders follow real usage, so extra stock stops piling up.</li>
          <li><b>Fewer last-minute scrambles.</b> Low items get flagged early, before anyone runs out.</li>
          <li><b>Time back on the floor.</b> Stock checks take seconds instead of a walk through the back room.</li>
        </ul>
        <a href="#/app/savings" class="btn primary">Open the savings dashboard</a>
      </div>
      <div class="results-chart reveal">
        <div class="chart-card"><p class="chart-title">Cumulative supply spend</p><div class="chart" id="landing-chart"></div></div>
      </div>
    </div>
    <blockquote class="origin reveal">
      <p>"My team was ordering supplies blind. I built a simple tracker on the floor, and once people could see the shelves, over-ordering stopped. Ordering got smarter, surprises dropped, and budget that was sitting on shelves went back to work. This is that idea, rebuilt as a product."</p>
      <footer>Bryan, creator · <a href="#/case-study">Read the case study →</a></footer>
    </blockquote>
  </section>

  <section class="cta-band reveal">
    <h2>Know what to order before you run out.</h2>
    <a href="#/app/inventory" class="btn accent lg">Open the app</a>
  </section>`;
}
