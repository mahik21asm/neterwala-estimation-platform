import { NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Company } from '../types';

const NAV = [
  { group: 'Workspace', items: [
    { to: '/',           label: 'Group Dashboard',  icon: '◧', badge: null },
    { to: '/workflow',   label: 'RFQ Workflow',      icon: '➜', badge: '47' },
    { to: '/estimations',label: 'Estimations',       icon: '☰', badge: null },
    { to: '/sales-entry',label: 'Sales Entry',       icon: '✎', badge: null },
  ]},
  { group: 'Analysis', items: [
    { to: '/plant-comparison', label: 'Plant Comparison',    icon: '⇄', badge: null },
    { to: '/scenarios',        label: 'Scenarios & Versions',icon: '⚡', badge: null },
    { to: '/analytics',        label: 'Analytics',           icon: '◔', badge: null },
  ]},
  { group: 'Platform', items: [
    { to: '/master',     label: 'Master Data',       icon: '⊞', badge: null },
    { to: '/sap',        label: 'SAP Integration',   icon: '↔', badge: null },
    { to: '/governance', label: 'Governance',         icon: '✓', badge: null },
    { to: '/config',     label: 'Configuration',      icon: '⚙', badge: null },
  ]},
  { group: 'Design', items: [
    { to: '/architecture', label: 'Architecture',   icon: '◭', badge: null },
    { to: '/data-model',   label: 'Data Model',     icon: '◇', badge: null },
    { to: '/export',       label: 'Export',          icon: '↓', badge: null },
  ]},
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: companies } = useQuery({ queryKey: ['companies'], queryFn: api.listCompanies });
  const activeCompany: Company | undefined = companies?.[0];
  const loc = useLocation();

  return (
    <div className="app">
      <header className="topbar">
        <div className="nw-brand">
          <img src="/neterwala-logo.png" alt="Neterwala Group" />
          <div className="nw-brand-text">
            <div className="t1">Neterwala Group</div>
            <div className="t2">Product Estimation Platform</div>
          </div>
        </div>
        <span className="nw-platform-pill">v1.0 · production</span>
        <span className="topbar-spacer" />
        {activeCompany && (
          <div className="nw-context">
            <span className="context-dot" style={{ background: activeCompany.color }} />
            <span>
              <span className="lbl">Company</span>
              <span className="val">{activeCompany.code}</span>
            </span>
          </div>
        )}
        <div className="nw-context">
          <span>
            <span className="lbl">Plant</span>
            <span className="val">Nasik</span>
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-faint)' }}>▾</span>
        </div>
        <div className="user-chip">
          <span className="av">S</span>
          <span style={{ fontSize: 12 }}>Sales<br />
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)' }}>Tech User</span>
          </span>
        </div>
      </header>

      <aside className="sidebar">
        {NAV.map(({ group, items }) => (
          <div className="nav-group" key={group}>
            <div className="nav-label">{group}</div>
            {items.map(({ to, label, icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="ico">{icon}</span>
                <span>{label}</span>
                {badge && <span className="badge">{badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
        <div className="nw-foot">
          <b style={{ fontFamily: 'var(--font-hand-bold)', fontSize: 13 }}>Group platform · v1.0</b><br />
          PostgreSQL · React · Express<br />
          UDL · UTPL · UAL · UAML · TGUK
        </div>
      </aside>

      <main className="main">
        {activeCompany && (
          <div className="nw-context-strip">
            <span className="context-dot" style={{ background: activeCompany.color }} />
            <span>Company: <b>{activeCompany.name}</b></span>
            <span style={{ color: 'var(--ink-faint)' }}>·</span>
            <span>Plant: <b>Nasik</b> (INR)</span>
            <span style={{ color: 'var(--ink-faint)' }}>·</span>
            <span>Process: <b>{activeCompany.process}</b></span>
            <span style={{ flex: 1 }} />
            <span className="sketch-note" style={{ margin: 0, fontSize: 11 }}>
              ⚠ Plant selection is <b>mandatory</b> — same product, different cost per plant.
            </span>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
