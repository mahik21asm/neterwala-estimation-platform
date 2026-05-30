import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function Analytics() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: api.getDashboard });
  const { data: plants = [] } = useQuery({ queryKey: ['plant-comparison'], queryFn: api.getPlantComparison });

  if (isLoading) return <div className="page-loading">Loading analytics…</div>;

  const byCompany = stats?.byCompany ?? [];
  const maxEst = Math.max(...byCompany.map((r: any) => Number(r.count)), 1);
  const byStage = stats?.byStage ?? [];
  const maxStage = Math.max(...byStage.map((r: any) => Number(r.count)), 1);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <div className="page-sub">Group-level insights · All entities</div>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-label">Total RFQs</div>
          <div className="kpi-value">{stats?.openRfqs ?? 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Estimations</div>
          <div className="kpi-value">{stats?.totalEstimations ?? 0}</div>
        </div>
        <div className="kpi-card accent">
          <div className="kpi-label">Win Rate</div>
          <div className="kpi-value">{stats ? Math.round(stats.winRate * 100) : 0}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Approved</div>
          <div className="kpi-value">{stats?.approvedCount ?? 0}</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">Estimations by Company</div>
          <div className="bar-chart">
            {byCompany.map((r: any) => (
              <div className="bar-row" key={r.company_code}>
                <span className="bar-label">{r.company_code}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(Number(r.count) / maxEst) * 100}%` }} />
                </div>
                <span className="bar-val">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">Pipeline by Stage</div>
          <div className="bar-chart">
            {byStage.map((r: any) => (
              <div className="bar-row" key={r.stage}>
                <span className="bar-label" style={{ width: 160 }}>{r.stage}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(Number(r.count) / maxStage) * 100}%`, background: 'var(--accent2)' }} />
                </div>
                <span className="bar-val">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">Estimation Status Mix</div>
          <div className="donut-placeholder">
            <table className="data-table">
              <tbody>
                {(stats?.byStatus ?? []).map((r: any) => (
                  <tr key={r.status}>
                    <td><span className={`status-pill status-${r.status}`}>{r.status}</span></td>
                    <td>{r.count}</td>
                    <td><div className="mini-bar"><div className="mini-bar-fill" style={{ width: `${(Number(r.count) / (stats?.totalEstimations || 1)) * 100}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">Plant Cost Index (Overhead MS)</div>
          {plants.length > 0 && (() => {
            const max = Math.max(...plants.map((p: any) => Number(p.overhead_ms)));
            return (
              <div className="bar-chart">
                {plants.map((p: any) => (
                  <div className="bar-row" key={p.code}>
                    <span className="bar-label">{p.code}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(Number(p.overhead_ms) / max) * 100}%`, background: 'var(--green)' }} />
                    </div>
                    <span className="bar-val">₹{Number(p.overhead_ms).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
