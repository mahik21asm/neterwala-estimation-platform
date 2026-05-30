export default function SAPIntegration() {
  const touchpoints = [
    { module: 'MM', name: 'Material Master', direction: 'SAP → Platform', status: 'ready', desc: 'Item codes, material types, and BOM sync from SAP MM' },
    { module: 'CO', name: 'Cost Center Rates', direction: 'SAP → Platform', status: 'ready', desc: 'Labour, overhead, and machine rates from CO module' },
    { module: 'SD', name: 'Customer & Pricing', direction: 'Platform → SAP', status: 'planned', desc: 'Approved ex-works prices pushed to SAP SD condition records' },
    { module: 'PP', name: 'Production Orders', direction: 'SAP → Platform', status: 'planned', desc: 'Actual vs estimated cost comparison from PP orders' },
    { module: 'FI', name: 'Exchange Rates', direction: 'SAP → Platform', status: 'ready', desc: 'Live USD/GBP/EUR rates from SAP FI' },
    { module: 'QM', name: 'Quality Results', direction: 'SAP → Platform', status: 'planned', desc: 'Rejection rates and quality data from QM module' },
  ];

  const statusColor: Record<string, string> = { ready: '#4caf50', planned: '#ff9800', active: '#2196f3' };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">SAP Integration</h1>
          <div className="page-sub">Touchpoints with SAP ERP · Bidirectional sync design</div>
        </div>
      </div>

      <div className="sketch-note">
        ⚠ Integration layer is in design phase. API endpoints are stubbed — actual SAP RFC/BAPI connections to be configured with BASIS team.
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">Integration Touchpoints</div>
        <div className="sap-grid">
          {touchpoints.map(t => (
            <div className="sap-card" key={t.name}>
              <div className="sap-module" style={{ background: statusColor[t.status] }}>{t.module}</div>
              <div className="sap-body">
                <div className="sap-name">{t.name}</div>
                <div className="sap-dir">{t.direction}</div>
                <div className="sap-desc">{t.desc}</div>
              </div>
              <span className={`status-pill status-${t.status}`}>{t.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">Data Flow Architecture</div>
        <div className="flow-diagram">
          <div className="flow-box flow-sap">SAP ERP<br /><small>S/4HANA</small></div>
          <div className="flow-arrow">⇄</div>
          <div className="flow-box flow-middle">Integration<br />Middleware<br /><small>RFC / REST</small></div>
          <div className="flow-arrow">⇄</div>
          <div className="flow-box flow-platform">Estimation<br />Platform<br /><small>PostgreSQL</small></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">Configuration Parameters</div>
        <table className="data-table">
          <thead><tr><th>Parameter</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>SAP System ID</td><td><span className="mono">PRD</span></td><td><span className="status-pill status-planned">TBD</span></td></tr>
            <tr><td>RFC Destination</td><td><span className="mono">NETERWALA_PRD</span></td><td><span className="status-pill status-planned">TBD</span></td></tr>
            <tr><td>Client Number</td><td><span className="mono">100</span></td><td><span className="status-pill status-planned">TBD</span></td></tr>
            <tr><td>Sync Frequency</td><td>Every 4 hours</td><td><span className="status-pill status-planned">TBD</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
