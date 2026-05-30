export default function Architecture() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Architecture</h1>
          <div className="page-sub">System design · Technology stack · Deployment</div>
        </div>
      </div>

      <div className="arch-diagram">
        <div className="arch-layer">
          <div className="arch-label">Frontend</div>
          <div className="arch-boxes">
            <div className="arch-box">React 18<br /><small>TypeScript + Vite</small></div>
            <div className="arch-box">React Router v6<br /><small>Client-side routing</small></div>
            <div className="arch-box">TanStack Query<br /><small>Server state</small></div>
            <div className="arch-box">react-hook-form<br /><small>Form management</small></div>
          </div>
        </div>

        <div className="arch-arrow">↓ HTTP / REST API (Vite proxy in dev, same origin in prod)</div>

        <div className="arch-layer">
          <div className="arch-label">Backend</div>
          <div className="arch-boxes">
            <div className="arch-box">Express.js<br /><small>TypeScript + tsx</small></div>
            <div className="arch-box">Estimation Engine<br /><small>Excel-faithful formulas</small></div>
            <div className="arch-box">Zod Validation<br /><small>Runtime type safety</small></div>
            <div className="arch-box">Audit Logger<br /><small>Immutable trail</small></div>
          </div>
        </div>

        <div className="arch-arrow">↓ pg (node-postgres) connection pool</div>

        <div className="arch-layer">
          <div className="arch-label">Database</div>
          <div className="arch-boxes">
            <div className="arch-box arch-db">PostgreSQL 16<br /><small>JSONB for version data</small></div>
            <div className="arch-box arch-db">companies<br /><small>5 entities</small></div>
            <div className="arch-box arch-db">plants<br /><small>5 locations</small></div>
            <div className="arch-box arch-db">estimations +<br />versions + pipeline<br /><small>Immutable versions</small></div>
          </div>
        </div>
      </div>

      <div className="dash-grid" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-head">Key Design Decisions</div>
          <ul style={{ padding: '8px 24px', lineHeight: 2, fontSize: 13 }}>
            <li><b>JSONB for estimation data</b> — full flexibility for versioned estimation structure without schema migrations</li>
            <li><b>Client-side engine mirror</b> — computation runs in browser for instant feedback; server re-runs for stored prices</li>
            <li><b>Immutable versions</b> — estimation_versions are append-only; previous versions never modified</li>
            <li><b>Multi-company, multi-plant</b> — company and plant are first-class concepts; all data is scoped</li>
            <li><b>Vite proxy</b> — /api/* proxied to Express in development; same-origin in production via static serving</li>
          </ul>
        </div>

        <div className="card">
          <div className="card-head">Technology Stack</div>
          <table className="data-table">
            <tbody>
              <tr><td>Runtime</td><td>Node.js 20 LTS</td></tr>
              <tr><td>Language</td><td>TypeScript (strict)</td></tr>
              <tr><td>Database</td><td>PostgreSQL 16</td></tr>
              <tr><td>ORM</td><td>None (raw SQL via pg pool)</td></tr>
              <tr><td>API style</td><td>REST (JSON)</td></tr>
              <tr><td>Auth</td><td>Session-based (planned)</td></tr>
              <tr><td>Build</td><td>Vite (client) + tsc (server)</td></tr>
              <tr><td>Dev runner</td><td>tsx (server), vite dev (client)</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">Ports &amp; Services</div>
          <table className="data-table">
            <tbody>
              <tr><td>React Dev Server</td><td><span className="mono">:5173</span></td></tr>
              <tr><td>Express API</td><td><span className="mono">:3001</span></td></tr>
              <tr><td>PostgreSQL</td><td><span className="mono">:5432</span></td></tr>
              <tr><td>Production</td><td>Single Express server on <span className="mono">:3001</span></td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">Estimation Engine Accuracy</div>
          <div style={{ padding: '8px 16px', fontSize: 13, lineHeight: 1.8 }}>
            <p>The estimation engine faithfully ports the Neterwala Excel formulas:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>Charge rate = weighted average of virgin + return metal</li>
              <li>Mould weight = (comp wt × no/mould) + riser wt</li>
              <li>Yield % = (comp wt × no/mould) / mould wt</li>
              <li>3 rejection scenarios: A=15%, B=20%, C=25%</li>
              <li>6-column pricing matrix: With/Without RC × 3 scenarios</li>
              <li>Return credit = metal remaining after moulding loss</li>
              <li>Machining: cycle time × machine rate + rej overhead</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
