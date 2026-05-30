import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { RfqPipeline } from '../types';
import { WORKFLOW_STAGES } from '../types';

const STAGE_COLOR: Record<string, string> = {
  rfq: '#e3f2fd',
  est: '#fff9c4',
  bom: '#f3e5f5',
  fin: '#e8f5e9',
  apv: '#c8e6c9',
  qte: '#ffcdd2',
};

export default function Workflow() {
  const qc = useQueryClient();
  const { data: pipeline = [], isLoading } = useQuery({ queryKey: ['pipeline'], queryFn: api.listPipeline });
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ rfqNo: '', item: '', customer: '', companyCode: 'UDL', plantCode: 'Nasik', amountDisplay: '' });

  const advance = useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: string }) => api.advanceStage(id, stage, 'Sales User'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipeline'] }),
  });

  const create = useMutation({
    mutationFn: () => api.createRfq({ ...form }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pipeline'] }); setCreating(false); setForm({ rfqNo: '', item: '', customer: '', companyCode: 'UDL', plantCode: 'Nasik', amountDisplay: '' }); },
  });

  const stageKeys = WORKFLOW_STAGES.map(s => s.k);
  const byStage = WORKFLOW_STAGES.reduce((acc, s) => {
    acc[s.k] = pipeline.filter((r: RfqPipeline) => r.stage === s.k);
    return acc;
  }, {} as Record<string, RfqPipeline[]>);

  if (isLoading) return <div className="page-loading">Loading pipeline…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">RFQ Workflow</h1>
          <div className="page-sub">Kanban pipeline · {pipeline.length} active RFQs</div>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}>+ New RFQ</button>
      </div>

      {creating && (
        <div className="modal-overlay" onClick={() => setCreating(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">New RFQ</div>
            <div className="form-grid">
              <label>RFQ No<input value={form.rfqNo} onChange={e => setForm(f => ({ ...f, rfqNo: e.target.value }))} placeholder="RFQ-2024-001" /></label>
              <label>Item Code<input value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} placeholder="30D-001" /></label>
              <label>Customer<input value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} placeholder="Cummins India" /></label>
              <label>Company
                <select value={form.companyCode} onChange={e => setForm(f => ({ ...f, companyCode: e.target.value }))}>
                  {['UDL','UTPL','UAL','UAML','TGUK'].map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Plant
                <select value={form.plantCode} onChange={e => setForm(f => ({ ...f, plantCode: e.target.value }))}>
                  {['Nasik','Aurangabad','Pune','Solapur','Coventry'].map(p => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label>Amount (display)<input value={form.amountDisplay} onChange={e => setForm(f => ({ ...f, amountDisplay: e.target.value }))} placeholder="₹2,500" /></label>
            </div>
            <div className="modal-foot">
              <button className="btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => create.mutate()} disabled={!form.rfqNo || !form.item}>Create RFQ</button>
            </div>
          </div>
        </div>
      )}

      <div className="kanban">
        {WORKFLOW_STAGES.map(stage => (
          <div className="kanban-col" key={stage.k}>
            <div className="kanban-col-head" style={{ background: STAGE_COLOR[stage.k] ?? '#f5f5f5' }}>
              <span>{stage.icon} {stage.title}</span>
              <span className="kanban-count">{byStage[stage.k]?.length ?? 0}</span>
            </div>
            <div className="kanban-cards">
              {(byStage[stage.k] ?? []).map((rfq: RfqPipeline) => {
                const nextIdx = stageKeys.indexOf(stage.k) + 1;
                const nextStage = nextIdx < stageKeys.length ? WORKFLOW_STAGES[nextIdx] : null;
                return (
                  <div className="kanban-card" key={rfq.id}>
                    <div className="kc-rfq">{rfq.rfq_no}</div>
                    <div className="kc-item">{rfq.item}</div>
                    <div className="kc-meta">
                      <span className="kc-co" style={{ borderColor: rfq.company_color ?? '#999' }}>{rfq.company_code}</span>
                      <span className="kc-plant">{rfq.plant_code}</span>
                    </div>
                    {rfq.customer && <div className="kc-cust">{rfq.customer}</div>}
                    {rfq.amount_display && <div className="kc-amount">{rfq.amount_display}</div>}
                    {nextStage && stage.k !== 'qte' && (
                      <button
                        className="kc-advance"
                        onClick={() => advance.mutate({ id: rfq.id, stage: nextStage.k })}
                        disabled={advance.isPending}
                      >
                        → {nextStage.title}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
