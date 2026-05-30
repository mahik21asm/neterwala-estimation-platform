import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Estimation } from '../types';

export default function Export() {
  const { data: estimations = [] } = useQuery({ queryKey: ['estimations'], queryFn: api.listEstimations });
  const [selected, setSelected] = useState<number[]>([]);
  const [format, setFormat] = useState('csv');

  const toggle = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === estimations.length ? [] : estimations.map((e: Estimation) => e.id));

  const handleExport = () => {
    if (format === 'csv') {
      const rows = [
        ['RFQ No', 'Item Code', 'Customer', 'Company', 'Plant', 'Material', 'Status', 'Updated'],
        ...estimations
          .filter((e: Estimation) => selected.length === 0 || selected.includes(e.id))
          .map((e: Estimation) => [e.rfqNo, e.itemCode, e.customer ?? '', e.companyCode, e.plantCode, e.materialType, e.status, e.updatedAt ?? '']),
      ];
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'estimations.csv'; a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Export</h1>
          <div className="page-sub">Export estimations and reports</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">Export Options</div>
          <div className="form-grid">
            <label>Format
              <select value={format} onChange={e => setFormat(e.target.value)}>
                <option value="csv">CSV — Estimations list</option>
                <option value="excel">Excel (planned)</option>
                <option value="pdf">PDF Report (planned)</option>
              </select>
            </label>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn-primary" onClick={handleExport} disabled={format !== 'csv'}>
              Download {format.toUpperCase()}
            </button>
            {format !== 'csv' && <span className="sketch-note" style={{ marginLeft: 12 }}>Coming soon</span>}
          </div>
        </div>

        <div className="card">
          <div className="card-head">Quick Stats</div>
          <table className="data-table">
            <tbody>
              <tr><td>Total estimations</td><td>{estimations.length}</td></tr>
              <tr><td>Selected</td><td>{selected.length === 0 ? 'All' : selected.length}</td></tr>
              <tr><td>Draft</td><td>{estimations.filter((e: Estimation) => e.status === 'draft').length}</td></tr>
              <tr><td>Approved</td><td>{estimations.filter((e: Estimation) => e.status === 'approved').length}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">
          Select Estimations to Export
          <button className="btn-ghost btn-sm" style={{ marginLeft: 12 }} onClick={toggleAll}>
            {selected.length === estimations.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <table className="data-table full">
          <thead>
            <tr>
              <th><input type="checkbox" checked={selected.length === estimations.length && estimations.length > 0} onChange={toggleAll} /></th>
              <th>RFQ No</th><th>Item</th><th>Customer</th><th>Status</th><th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {(estimations as Estimation[]).map(e => (
              <tr key={e.id} className={selected.includes(e.id) ? 'row-selected' : ''}>
                <td><input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggle(e.id)} /></td>
                <td><span className="mono">{e.rfqNo}</span></td>
                <td>{e.itemCode}</td>
                <td>{e.customer}</td>
                <td><span className={`status-pill status-${e.status}`}>{e.status}</span></td>
                <td style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{e.updatedAt ? new Date(e.updatedAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
