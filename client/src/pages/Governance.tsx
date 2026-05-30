import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AuditEntry } from '../types';

const ROLES = [
  { role: 'Sales User', access: ['Create estimation', 'Edit draft', 'View pipeline'], plant: 'All', company: 'Own company' },
  { role: 'Plant Engineer', access: ['Full estimation edit', 'Save versions', 'View all plants'], plant: 'Assigned', company: 'All' },
  { role: 'Plant Manager', access: ['Approve versions', 'Edit master data', 'View analytics'], plant: 'All', company: 'All' },
  { role: 'Group Finance', access: ['View all estimations', 'Approve pricing', 'Export data'], plant: 'All', company: 'All' },
  { role: 'Admin', access: ['Full access', 'User management', 'System config'], plant: 'All', company: 'All' },
];

const APPROVAL_MATRIX = [
  { level: 'L1 — Draft → Review', approver: 'Plant Engineer', within: 'Same plant', sla: '2 working days' },
  { level: 'L2 — Review → Approved', approver: 'Plant Manager', within: 'Same company', sla: '3 working days' },
  { level: 'L3 — Group Approval', approver: 'Group Finance / MD', within: 'Group level', sla: '5 working days' },
];

export default function Governance() {
  const { data: audit = [] } = useQuery({ queryKey: ['audit'], queryFn: api.listAudit });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Governance</h1>
          <div className="page-sub">Roles, approvals, and audit trail</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">Roles &amp; Permissions</div>
          <table className="data-table">
            <thead><tr><th>Role</th><th>Plant Access</th><th>Company</th><th>Capabilities</th></tr></thead>
            <tbody>
              {ROLES.map(r => (
                <tr key={r.role}>
                  <td><b>{r.role}</b></td>
                  <td>{r.plant}</td>
                  <td>{r.company}</td>
                  <td style={{ fontSize: 11 }}>{r.access.join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">Approval Matrix</div>
          <table className="data-table">
            <thead><tr><th>Level</th><th>Approver</th><th>Scope</th><th>SLA</th></tr></thead>
            <tbody>
              {APPROVAL_MATRIX.map(a => (
                <tr key={a.level}>
                  <td>{a.level}</td>
                  <td>{a.approver}</td>
                  <td>{a.within}</td>
                  <td>{a.sla}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">Audit Log — Recent Activity</div>
        <table className="data-table full">
          <thead>
            <tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Object</th><th>Details</th></tr>
          </thead>
          <tbody>
            {(audit as AuditEntry[]).slice(0, 20).map(a => (
              <tr key={a.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{new Date(a.timestamp).toLocaleString()}</td>
                <td>{a.actor}</td>
                <td><span className="badge">{a.action}</span></td>
                <td>{a.object}</td>
                <td style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{a.details}</td>
              </tr>
            ))}
            {audit.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: 32 }}>No audit entries yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">Immutable Version Policy</div>
        <div style={{ padding: '12px 16px', lineHeight: 1.7, fontSize: 13 }}>
          <p>Every saved estimation version is <b>immutable</b> — once created, data cannot be modified. New versions must be created for any changes.</p>
          <p>Approved versions are locked. Approval can only be granted by Plant Manager or above.</p>
          <p>All state transitions are recorded in the audit log with actor, timestamp, and object reference.</p>
          <p>Version history is retained indefinitely for compliance and traceability.</p>
        </div>
      </div>
    </div>
  );
}
