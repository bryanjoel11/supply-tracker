// Case study copy, written in Bryan's voice.

export function caseStudyHTML(): string {
  return `
  <header class="case-hero">
    <div class="case-hero-inner reveal">
      <p class="eyebrow">Case study · Product management</p>
      <h2>From ordering blind to ordering on data</h2>
      <p class="lede">When I worked in theme park attractions operations, I built a small app to track our supplies. It gave my team a clear view of what we had, helped us stop over-ordering, and freed up supply budget that had been tied up in extra stock. This page is how I would turn that tool into a real product.</p>
      <p class="fineprint">v1 is recreated from memory; I no longer have access to it. The numbers in the app are sample data for demonstration only, not real Disney data.</p>
    </div>
  </header>
  <article class="case">

    <section class="case-sec reveal">
      <h3><span class="num">01</span> Problem</h3>
      <p>We ordered supplies blind. Nobody could see how much of anything we had or how fast we used it, so orders were based on habit and memory.</p>
      <ul>
        <li><b>Over-ordering.</b> To avoid running out, people padded every order. Extra stock sat on shelves and in back rooms.</li>
        <li><b>Shortages anyway.</b> The things that actually ran low were noticed late, which meant rush requests or borrowing from other areas.</li>
        <li><b>Wasted time.</b> Counting stock and chasing orders took time away from running the attraction.</li>
      </ul>
    </section>

    <section class="case-sec reveal">
      <h3><span class="num">02</span> What I built (v1)</h3>
      <p>A simple tracker the team could update during a shift.</p>
      <ul>
        <li>A list of our supplies with current counts.</li>
        <li>A way to log what was used and what arrived.</li>
        <li>A stock visualization that showed, at a glance, what was running low and what we had too much of. This was the part that changed behavior.</li>
      </ul>
      <p>v1 had both a mobile version, so the team could check and log stock on the go during a shift, and a desktop version for reviewing stock levels and planning orders.</p>
      <p>Built as a React web app with a Firebase database, so counts synced live between the mobile and desktop versions. It was used by coordinators, leaders and the proprietor.</p>
    </section>

    <section class="case-sec reveal impact">
      <h3><span class="num">03</span> Impact</h3>
      <ul>
        <li><b>Clear visibility.</b> For the first time, the whole team shared one picture of what we had and what was running low.</li>
        <li><b>Smarter ordering.</b> Orders were based on what we actually used instead of habit, so padded orders and overstock stopped.</li>
        <li><b>Budget put to better use.</b> Money that had been sitting on shelves as extra stock was moved to other needs in the operation.</li>
        <li><b>Fewer surprises.</b> Low items were spotted early, so there were fewer last-minute rush requests.</li>
        <li><b>Time back.</b> Checking stock took less time, which meant more time spent running the attraction.</li>
      </ul>
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
      <h3><span class="num">05</span> Needs, pains and success</h3>
      <div class="persona-grid">
        <div class="persona">
          <p class="persona-role">On the floor</p>
          <p><b>Needs:</b> to know before a shift if anything will run out, and to log usage in seconds.</p>
          <p><b>Pain today:</b> finds out an item is gone when a team member asks for it.</p>
          <p><b>Success:</b> no surprises; logging takes under a minute per shift.</p>
        </div>
        <div class="persona">
          <p class="persona-role">Managing the budget</p>
          <p><b>Needs:</b> to keep the supply budget in line and justify where money goes.</p>
          <p><b>Pain today:</b> approves orders without knowing if they are needed; budget disappears into shelves.</p>
          <p><b>Success:</b> spending stays in line without more stockouts, and it's clear where the money goes.</p>
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
          <tr><td>Supply spend vs. baseline</td><td>The headline: money freed for other needs</td><td>Lower than before</td></tr>
          <tr><td>Stockout days per month</td><td>Savings must not come from running out</td><td>Flat or lower</td></tr>
          <tr><td>Value of overstock on shelves</td><td>Cash tied up in extra stock</td><td>Much lower</td></tr>
          <tr><td>Rush / emergency orders</td><td>Expensive and stressful</td><td>Near zero</td></tr>
          <tr><td>Weekly active loggers</td><td>Suggestions are only as good as the data</td><td>80% of shifts log usage</td></tr>
          <tr><td>Time spent on stock checks</td><td>Gives time back to the operation</td><td>Noticeably less</td></tr>
        </tbody>
      </table>
      <p class="fineprint">Targets are proposals for a pilot, not measured results.</p>
    </section>

    <section class="case-sec reveal">
      <h3><span class="num">08</span> What I learned</h3>
      <ul>
        <li>The visual mattered more than the math. People changed behavior when they could see the shelves.</li>
        <li>Logging has to be faster than skipping it, or the data goes stale.</li>
        <li>Show the impact. A clear picture of where the budget was going got attention that "better inventory" never did.</li>
      </ul>
    </section>
    <section class="case-cta reveal">
      <h3>See v2 in action</h3>
      <p>Reorder suggestions, stock status and the savings comparison are all live in the app.</p>
      <a href="#/app/inventory" class="btn primary">Open the app</a>
    </section>
  </article>`;
}
