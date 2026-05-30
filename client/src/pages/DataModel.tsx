export default function DataModel() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Model</h1>
          <div className="page-sub">PostgreSQL schema · Entity relationships</div>
        </div>
      </div>

      <div className="datamodel-grid">
        {[
          {
            name: 'companies',
            color: '#1565c0',
            fields: [
              { name: 'id', type: 'SERIAL PK' },
              { name: 'code', type: 'VARCHAR(10) UNIQUE' },
              { name: 'name', type: 'TEXT' },
              { name: 'process', type: 'TEXT' },
              { name: 'color', type: 'VARCHAR(20)' },
            ],
          },
          {
            name: 'plants',
            color: '#6a1b9a',
            fields: [
              { name: 'id', type: 'SERIAL PK' },
              { name: 'code', type: 'VARCHAR(10) UNIQUE' },
              { name: 'company_code', type: 'FK → companies' },
              { name: 'name', type: 'TEXT' },
              { name: 'currency', type: 'VARCHAR(5)' },
              { name: 'overhead_ms/ss', type: 'NUMERIC' },
              { name: 'labour', type: 'NUMERIC' },
              { name: 'power, fuel', type: 'NUMERIC' },
              { name: 'shell_ms/ss', type: 'NUMERIC' },
              { name: 'pattern_wax, riser_wax', type: 'NUMERIC' },
              { name: 'melting_loss, margin', type: 'NUMERIC (decimal)' },
              { name: '+ 10 more rate fields', type: '…' },
            ],
          },
          {
            name: 'estimations',
            color: '#2e7d32',
            fields: [
              { name: 'id', type: 'SERIAL PK' },
              { name: 'rfq_no', type: 'TEXT UNIQUE' },
              { name: 'item_code', type: 'TEXT' },
              { name: 'die_code', type: 'TEXT' },
              { name: 'plant_code', type: 'FK → plants' },
              { name: 'company_code', type: 'FK → companies' },
              { name: 'customer', type: 'TEXT' },
              { name: 'material_type', type: 'TEXT' },
              { name: 'status', type: 'TEXT' },
              { name: 'current_version', type: 'INT' },
              { name: 'created_at, updated_at', type: 'TIMESTAMPTZ' },
            ],
          },
          {
            name: 'estimation_versions',
            color: '#e65100',
            fields: [
              { name: 'id', type: 'SERIAL PK' },
              { name: 'estimation_id', type: 'FK → estimations (CASCADE)' },
              { name: 'version_no', type: 'INT' },
              { name: 'label', type: 'TEXT' },
              { name: 'created_by', type: 'TEXT' },
              { name: 'price', type: 'NUMERIC' },
              { name: 'data', type: 'JSONB ← full estimation input' },
              { name: 'status', type: "TEXT (draft/approved)" },
              { name: 'notes', type: 'TEXT' },
              { name: 'UNIQUE', type: '(estimation_id, version_no)' },
            ],
          },
          {
            name: 'rfq_pipeline',
            color: '#00695c',
            fields: [
              { name: 'id', type: 'SERIAL PK' },
              { name: 'rfq_no', type: 'TEXT UNIQUE' },
              { name: 'estimation_id', type: 'FK → estimations (nullable)' },
              { name: 'item', type: 'TEXT' },
              { name: 'company_code', type: 'FK → companies' },
              { name: 'plant_code', type: 'FK → plants' },
              { name: 'customer', type: 'TEXT' },
              { name: 'stage', type: 'TEXT (6 stages)' },
              { name: 'amount_display', type: 'TEXT' },
              { name: 'created_at', type: 'TIMESTAMPTZ' },
            ],
          },
          {
            name: 'audit_log',
            color: '#4e342e',
            fields: [
              { name: 'id', type: 'SERIAL PK' },
              { name: 'timestamp', type: 'TIMESTAMPTZ DEFAULT now()' },
              { name: 'actor', type: 'TEXT' },
              { name: 'action', type: 'TEXT' },
              { name: 'object', type: 'TEXT' },
              { name: 'details', type: 'TEXT' },
            ],
          },
        ].map(table => (
          <div className="dm-table" key={table.name} style={{ borderTopColor: table.color }}>
            <div className="dm-name" style={{ color: table.color }}>{table.name}</div>
            {table.fields.map(f => (
              <div className="dm-field" key={f.name}>
                <span className="dm-fname">{f.name}</span>
                <span className="dm-ftype">{f.type}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">Key Relationships</div>
        <div style={{ padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 2 }}>
          <div>companies (1) ←→ (N) plants</div>
          <div>companies (1) ←→ (N) estimations</div>
          <div>plants (1) ←→ (N) estimations</div>
          <div>estimations (1) ←→ (N) estimation_versions [CASCADE DELETE]</div>
          <div>estimations (1) ←→ (N) rfq_pipeline</div>
          <div>audit_log — append-only, no FKs (event sourcing pattern)</div>
        </div>
      </div>
    </div>
  );
}
