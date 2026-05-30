import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Plant } from '../types';
import { fmt } from '../types';

const RATE_FIELDS: { key: keyof Plant; label: string }[] = [
  { key: 'overhead_ms', label: 'Overhead (MS)' },
  { key: 'overhead_ss', label: 'Overhead (SS)' },
  { key: 'labour', label: 'Labour' },
  { key: 'consumables_ms', label: 'Consumables (MS)' },
  { key: 'consumables_ss', label: 'Consumables (SS)' },
  { key: 'power', label: 'Power' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'shell_ms', label: 'Shell Rate (MS)' },
  { key: 'shell_ss', label: 'Shell Rate (SS)' },
  { key: 'pattern_wax', label: 'Pattern Wax' },
  { key: 'riser_wax', label: 'Riser Wax' },
  { key: 'ceramic_core', label: 'Ceramic Core' },
  { key: 'melting_loss', label: 'Melting Loss' },
  { key: 'margin', label: 'Margin %' },
];

export default function PlantComparison() {
  const { data: plants = [], isLoading } = useQuery({ queryKey: ['plant-comparison'], queryFn: api.getPlantComparison });

  if (isLoading) return <div className="page-loading">Loading plant data…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Plant Comparison</h1>
          <div className="page-sub">Rate master side-by-side · {plants.length} plants</div>
        </div>
      </div>

      <div className="card">
        <table className="data-table full comparison-table">
          <thead>
            <tr>
              <th>Rate Head</th>
              {plants.map((p: Plant) => <th key={p.code}>{p.code}<br /><span style={{ fontWeight: 400, fontSize: 10, color: 'var(--ink-faint)' }}>{(p as any).currency ?? ''}</span></th>)}
            </tr>
          </thead>
          <tbody>
            {RATE_FIELDS.map(({ key, label }) => {
              const vals = plants.map((p: Plant) => Number(p[key]) || 0);
              const max = Math.max(...vals);
              const min = Math.min(...vals.filter(v => v > 0));
              return (
                <tr key={key}>
                  <td>{label}</td>
                  {plants.map((p: Plant) => {
                    const v = Number(p[key]) || 0;
                    const isMax = v === max && max !== min;
                    const isMin = v === min && max !== min;
                    return (
                      <td key={p.code} className={isMax ? 'cell-high' : isMin ? 'cell-low' : ''}>
                        {key === 'melting_loss' || key === 'margin' ? `${(v * 100).toFixed(1)}%` : fmt(v)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="sketch-note">
        ↑ Green = lowest cost · Red = highest cost · Values in local currency (INR/GBP)
      </div>
    </div>
  );
}
