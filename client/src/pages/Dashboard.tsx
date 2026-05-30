import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { fmt, fmtInt } from '../types';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: api.getDashboard });
  const { data: companies } = useQuery({ queryKey: ['companies'], queryFn: api.listCompanies });

  if (isLoading) return <div className="page-loading">Loading dashboard…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Group Dashboard</h1>
          <div className="page-sub">Live platform overview · All entities</div>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-label">Open RFQs</div>
          <div className="kpi-value">{stats?.openRfqs ?? 0}</div>
          <div className="kpi-sub">Active in pipeline</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Estimations</div>
          <div className="kpi-value">{stats?.totalEstimations ?? 0}</div>
          <div className="kpi-sub">All time</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Approved</div>
          <div className="kpi-value">{stats?.approvedCount ?? 0}</div>
          <div className="kpi-sub">Versions approved</div>
        </div>
        <div className="kpi-card accent">
          <div className="kpi-label">Win Rate</div>
          <div className="kpi-value">{stats ? Math.round(stats.winRate * 100) : 0}%</div>
          <div className="kpi-sub">Approved / total</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">By Company</div>
          <table className="data-table">
            <thead>
              <tr><th>Company</th><th>Estimations</th><th>Pipeline</th></tr>
            </thead>
            <tbody>
              {(stats?.byCompany ?? []).map((r: any) => (
                <tr key={r.company_code}>
                  <td>
                    <span className="company-dot" style={{ background: companies?.find(c => c.code === r.company_code)?.color ?? '#999' }} />
                    {r.company_code}
                  </td>
                  <td>{r.count}</td>
                  <td>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">Pipeline by Stage</div>
          <table className="data-table">
            <thead>
              <tr><th>Stage</th><th>Count</th><th>Bar</th></tr>
            </thead>
            <tbody>
              {(stats?.byStage ?? []).map((r: any) => {
                const max = Math.max(...(stats?.byStage ?? []).map((x: any) => Number(x.count)));
                const pct = max > 0 ? (Number(r.count) / max) * 100 : 0;
                return (
                  <tr key={r.stage}>
                    <td>{r.stage}</td>
                    <td>{r.count}</td>
                    <td><div className="mini-bar"><div className="mini-bar-fill" style={{ width: `${pct}%` }} /></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">Estimation Status</div>
          <table className="data-table">
            <thead>
              <tr><th>Status</th><th>Count</th></tr>
            </thead>
            <tbody>
              {(stats?.byStatus ?? []).map((r: any) => (
                <tr key={r.status}>
                  <td><span className={`status-pill status-${r.status}`}>{r.status}</span></td>
                  <td>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">Group Entities</div>
          <div className="company-grid">
            {(companies ?? []).map(c => (
              <div className="company-tile" key={c.code} style={{ borderLeftColor: c.color }}>
                <div className="co-code">{c.code}</div>
                <div className="co-name">{c.name}</div>
                <div className="co-proc">{c.process}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
