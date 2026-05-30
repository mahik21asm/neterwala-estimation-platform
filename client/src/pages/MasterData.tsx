import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Plant, Company, AuditEntry } from '../types';
import { fmt } from '../types';

export default function MasterData() {
  const qc = useQueryClient();
  const { data: plants = [] } = useQuery({ queryKey: ['plants'], queryFn: api.listPlants });
  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: api.listCompanies });
  const { data: audit = [] } = useQuery({ queryKey: ['audit'], queryFn: api.listAudit });
  const [editing, setEditing] = useState<Plant | null>(null);
  const [tab, setTab] = useState<'plants' | 'companies' | 'audit'>('plants');

  const updatePlant = useMutation({
    mutationFn: (p: Plant) => api.updatePlantRates(p.code, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plants'] }); setEditing(null); },
  });

  const EDITABLE_FIELDS: { key: keyof Plant; label: string; isPercent?: boolean }[] = [
    { key: 'overhead_ms', label: 'Overhead MS' },
    { key: 'overhead_ss', label: 'Overhead SS' },
    { key: 'labour', label: 'Labour' },
    { key: 'consumables_ms', label: 'Consumables MS' },
    { key: 'consumables_ss', label: 'Consumables SS' },
    { key: 'power', label: 'Power' },
    { key: 'fuel', label: 'Fuel' },
    { key: 'shell_ms', label: 'Shell Rate MS' },
    { key: 'shell_ss', label: 'Shell Rate SS' },
    { key: 'pattern_wax', label: 'Pattern Wax' },
    { key: 'riser_wax', label: 'Riser Wax' },
    { key: 'ceramic_core', label: 'Ceramic Core' },
    { key: 'melting_loss', label: 'Melting Loss', isPercent: true },
    { key: 'margin', label: 'Margin', isPercent: true },
    { key: 'avg_std_mld_wt', label: 'Avg Std Mould Wt' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Data</h1>
          <div className="page-sub">Rate masters, companies, and audit trail</div>
        </div>
      </div>

      <div className="tab-row">
        {(['plants', 'companies', 'audit'] as const).map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'plants' ? 'Plant Rate Masters' : t === 'companies' ? 'Companies' : 'Audit Log'}
          </button>
        ))}
      </div>

      {tab === 'plants' && (
        <>
          {editing && (
            <div className="modal-overlay" onClick={() => setEditing(null)}>
              <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
                <div className="modal-head">Edit Plant: {editing.code}</div>
                <div className="form-grid form-grid-3">
                  {EDITABLE_FIELDS.map(({ key, label, isPercent }) => (
                    <label key={key}>
                      {label} {isPercent ? '(×1 = 100%)' : ''}
                      <input
                        type="number"
                        step={isPercent ? '0.01' : '0.01'}
                        value={editing[key] as number ?? ''}
                        onChange={e => setEditing(p => p ? { ...p, [key]: Number(e.target.value) } : null)}
                      />
                    </label>
                  ))}
                </div>
                <div className="modal-foot">
                  <button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                  <button className="btn-primary" onClick={() => updatePlant.mutate(editing!)} disabled={updatePlant.isPending}>
                    {updatePlant.isPending ? 'Saving…' : 'Save Rates'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <table className="data-table full">
              <thead>
                <tr>
                  <th>Plant</th><th>Code</th><th>Company</th><th>Currency</th>
                  <th>Overhead MS</th><th>Labour</th><th>Power</th><th>Margin</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {plants.map((p: Plant) => (
                  <tr key={p.code}>
                    <td>{p.code}</td>
                    <td><span className="mono">{p.code}</span></td>
                    <td>{p.company_code}</td>
                    <td>{p.currency}</td>
                    <td>{fmt(Number(p.overhead_ms))}</td>
                    <td>{fmt(Number(p.labour))}</td>
                    <td>{fmt(Number(p.power))}</td>
                    <td>{((Number(p.margin) || 0) * 100).toFixed(1)}%</td>
                    <td><button className="btn-ghost btn-sm" onClick={() => setEditing({ ...p })}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'companies' && (
        <div className="card">
          <table className="data-table full">
            <thead>
              <tr><th>Code</th><th>Company Name</th><th>Process</th><th>Color</th></tr>
            </thead>
            <tbody>
              {companies.map((c: Company) => (
                <tr key={c.code}>
                  <td><span className="mono">{c.code}</span></td>
                  <td>{c.name}</td>
                  <td>{c.process}</td>
                  <td><span className="color-swatch" style={{ background: c.color }} />{c.color}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'audit' && (
        <div className="card">
          <table className="data-table full">
            <thead>
              <tr><th>Time</th><th>Actor</th><th>Action</th><th>Object</th><th>Details</th></tr>
            </thead>
            <tbody>
              {(audit as AuditEntry[]).map((a: AuditEntry) => (
                <tr key={a.id}>
                  <td style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{new Date(a.timestamp).toLocaleString()}</td>
                  <td>{a.actor}</td>
                  <td>{a.action}</td>
                  <td>{a.object}</td>
                  <td style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{a.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
