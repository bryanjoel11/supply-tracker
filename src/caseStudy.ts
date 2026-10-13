// Case study copy, written in Bryan's voice. Items marked [verify] are placeholders to confirm.

const v = '<mark class="verify" title="Placeholder: Bryan to confirm">[verify]</mark>';

export function caseStudyHTML(): string {
  return `
  <article class="case">
    <header class="case-hero reveal">
      <p class="eyebrow">Case study · Product management</p>
      <h2>From ordering blind to ordering on data</h2>
      <p class="lede">When I worked in theme park attractions operations, I built a small app to track our supplies. It helped my team stop over-ordering and, by my estimate, recover about <strong>35%</strong> of a supply budget that was being misused. This page is how I would turn that tool into a real product.</p>
      <p class="fineprint">v1 is recreated from memory; I no longer have access to it.</p>
    </header>

    <section class="case-sec reveal">
      <h3><span class="num">01</span> Problem</h3>
      <p>We ordered supplies blind. Nobody could see how much of anything we had or how fast we used it, so orders were based on habit and memory.</p>
      <ul>
        <li><b>Over-ordering.</b> To avoid running out, people padded every order. Extra stock sat on shelves and in back rooms ${v}.</li>
        <li><b>Shortages anyway.</b> The things that actually ran low were noticed late, which meant rush requests or borrowing from other areas ${v}.</li>
        <li><b>Wasted time.</b> Counting stock and chasing orders took time away from running the attraction ${v}.</li>
      </ul>
    </section>

    <section class="case-sec reveal">
      <h3><span class="num">02</span> What I built (v1)</h3>
      <p>A simple tracker the team could update during a shift ${v}.</p>
      <ul>
        <li>A list of our supplies with current counts.</li>
        <li>A way to log what was used and what arrived.</li>
        <li>A stock visualization that showed, at a glance, what was running low and what we had too much of. This was the part that changed behavior.</li>
      </ul>
      <p>Built with ${v} [tool or platform], used by roughly ${v} [number] cast members over about ${v} [months].</p>
    </section>

    <section class="case-sec reveal impact">
      <h3><span class="num">03</span> Impact</h3>
      <div class="impact-grid">
        <div class="impact-stat"><span class="big">~35%</span><span>of the misused supply budget recovered and reallocated elsewhere in the operation (my estimate)</span></div>
        <div class="impact-stat"><span class="big">0 → 1</span><span>from no visibility to a shared picture of stock the whole team used ${v}</span></div>
      </div>
      <p>Once people could see the shelves in one view, over-ordering stopped. The money that had been tied up in extra stock was moved to other needs in the operation. I estimated the 35% by comparing ${v} [what you compared, e.g. order totals before and after] over ${v} [time period].</p>
    </section>

    <section class="case-sec reveal">
      <h3><span class="num">04</span> What v2 adds</h3>
      <p>v1 showed what we had. v2 tells you what to do about it, for any small operations team.</p>
      <ul>
        <li><b>Reorder suggestions</b> from usage history: average daily use, how much it varies, lead time, and a safety buffer, explained in plain words.</li>
        <li><b>Status at a glance:</b> healthy, reorder soon, critical, or overstocked.</li>
        <li><b>Savings dashboard</b> that compares fixed-schedule "blind" ordering with data-driven ordering on spend, money sitting on shelves, and stockout days.</li>
        <li><b>General setup:</b> add your own items, costs, and lead times. Runs in the browser with no account.</li>
      </ul>
    </section>

    <section class="case-sec reveal">
      <h3><span class="num">05</span> Personas</h3>
      <div class="persona-grid">
        <div class="persona">
          <p class="persona-role">Shift lead</p>
          <h4>Maya, attraction shift lead</h4>
          <p><b>Needs:</b> to know before her shift if anything will run out, and to log usage in seconds.</p>
          <p><b>Pain today:</b> finds out an item is gone when a cast member asks for it.</p>
          <p><b>Success:</b> no surprises; logging takes under a minute per shift.</p>
        </div>
        <div class="persona">
          <p class="persona-role">Area manager</p>
          <h4>Daniel, operations manager</h4>
          <p><b>Needs:</b> to keep the supply budget in line and justify where money goes.</p>
          <p><b>Pain today:</b> approves orders without knowing if they are needed; budget disappears into shelves.</p>
          <p><b>Success:</b> spend drops without more stockouts, and he can show the savings.</p>
        </div>
      </div>
    </section>

    <section class="case-sec reveal">
      <h3><span class="num">06</span> Roadmap</h3>
      <ol class="roadmap">
        <li><span class="tag tag-done">v1 · Built</span><b>Visibility.</b> Item list, usage and delivery logging, stock visualization.</li>
        <li><span class="tag tag-now">v2 · This build</span><b>Decisions.</b> Reorder points and quantities from history, status alerts, savings dashboard.</li>
        <li><span class="tag tag-next">Next</span><b>Team product.</b> Shared cloud data and roles, barcode or QR scan to log usage, supplier lead-time tracking, purchase-order export, alerts by text or email, multi-location view.</li>
      </ol>
    </section>

    <section class="case-sec reveal">
      <h3><span class="num">07</span> Success metrics</h3>
      <table class="metrics">
        <thead><tr><th>Metric</th><th>Why it matters</th><th>Target</th></tr></thead>
        <tbody>
          <tr><td>Supply spend vs. baseline</td><td>The headline: money freed for other needs</td><td>−25% to −35%</td></tr>
          <tr><td>Stockout days per month</td><td>Savings must not come from running out</td><td>Flat or lower</td></tr>
          <tr><td>Value of overstock on shelves</td><td>Cash tied up in extra stock</td><td>−50%</td></tr>
          <tr><td>Rush / emergency orders</td><td>Expensive and stressful</td><td>Near zero</td></tr>
          <tr><td>Weekly active loggers</td><td>Suggestions are only as good as the data</td><td>80% of shifts log usage</td></tr>
          <tr><td>Time spent on stock checks</td><td>Gives time back to the operation</td><td>−50% ${v}</td></tr>
        </tbody>
      </table>
      <p class="fineprint">Targets are proposals for a pilot, not measured results.</p>
    </section>

    <section class="case-sec reveal">
      <h3><span class="num">08</span> What I learned</h3>
      <ul>
        <li>The visual mattered more than the math. People changed behavior when they could see the shelves.</li>
        <li>Logging has to be faster than skipping it, or the data goes stale.</li>
        <li>Show the money. Savings in dollars got attention that "better inventory" never did.</li>
      </ul>
    </section>
  </article>`;
}
