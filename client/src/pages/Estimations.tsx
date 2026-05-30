import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Estimation } from '../types';

export default function Estimations() {
  const { data: estimations = [], isLoading } = useQuery({ queryKey: ['estimations'], queryFn: api.listEstimations });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = (estimations as Estimation[]).filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.rfq_no.toLowerCase().includes(q) || e.item_code.toLowerCase().includes(q) || (e.customer ?? '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) return <div className="page-loading">Loading estimations…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Estimations</h1>
          <div className="page-sub">{(estimations as Estimation[]).length} records · All plants</div>
        </div>
        <Link to="/estimations/new" className="btn-primary">+ New Estimation</Link>
      </div>

      <div className="filter-bar">
        <input
          className="filter-search"
          placeholder="Search RFQ, item, customer…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div className="card">
        <table className="data-table full">
          <thead>
            <tr>
              <th>RFQ No</th>
              <th>Item</th>
              <th>Customer</th>
              <th>Company</th>
              <th>Plant</th>
              <th>Material</th>
              <th>Status</th>
              <th>Versions</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: 32 }}>No estimations found</td></tr>
            )}
            {filtered.map(e => (
              <tr key={e.id}>
                <td><span className="mono">{e.rfq_no}</span></td>
                <td>{e.item_code}</td>
                <td>{e.customer}</td>
                <td>{e.company_code}</td>
                <td>{e.plant_code}</td>
                <td>{e.material_type}</td>
                <td><span className={`status-pill status-${e.status}`}>{e.status}</span></td>
                <td>{e.version_count ?? 0}</td>
                <td style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{e.updated_at ? new Date(e.updated_at).toLocaleDateString() : '—'}</td>
                <td>
                  <Link to={`/estimations/${e.id}`} className="btn-ghost btn-sm">Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
