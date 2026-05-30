import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Plant } from '../types';

export default function Configuration() {
  const qc = useQueryClient();
  const { data: plants = [] } = useQuery({ queryKey: ['plants'], queryFn: api.listPlants });
  const [selected, setSelected] = useState<string>('NSK');
  const [draft, setDraft] = useState<Partial<Plant>>({});
  const [saved, setSaved] = useState(false);

  const plant = plants.find((p: Plant) => p.code === selected);

  const update = useMutation({
    mutationFn: () => api.updatePlantRates(selected, draft),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plants'] }); setSaved(true); setTimeout(() => setSaved(false), 2000); setDraft({}); },
  });

  const val = (key: keyof Plant) => {
    if (key in draft) return draft[key] as number;
    return plant ? (plant[key] as number) ?? '' : '';
  };
  const set = (key: keyof Plant, v: string) => setDraft(d => ({ ...d, [key]: Number(v) }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuration</h1>
          <div className="page-sub">Plant process parameters and system settings</div>
        </div>
        {Object.keys(draft).length > 0 && (
          <button className="btn-primary" onClick={() => update.mutate()} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="tab-row">
        {plants.map((p: Plant) => (
          <button key={p.code} className={`tab-btn${selected === p.code ? ' active' : ''}`} onClick={() => { setSelected(p.code); setDraft({}); }}>
            {p.code}
          </button>
        ))}
      </div>

      {plant && (
        <div className="config-layout">
          <div className="card">
            <div className="card-head">Process Rates — {plant.code} ({plant.currency})</div>
            <div className="form-grid form-grid-3">
              <label>Overhead MS (₹/kg mould wt) <input type="number" value={val('overhead_ms')} onChange={e => set('overhead_ms', e.target.value)} /></label>
              <label>Overhead SS (₹/kg mould wt) <input type="number" value={val('overhead_ss')} onChange={e => set('overhead_ss', e.target.value)} /></label>
              <label>Labour (₹/kg mould wt) <input type="number" value={val('labour')} onChange={e => set('labour', e.target.value)} /></label>
              <label>Consumables MS <input type="number" value={val('consumables_ms')} onChange={e => set('consumables_ms', e.target.value)} /></label>
              <label>Consumables SS <input type="number" value={val('consumables_ss')} onChange={e => set('consumables_ss', e.target.value)} /></label>
              <label>Power (₹/kg) <input type="number" value={val('power')} onChange={e => set('power', e.target.value)} /></label>
              <label>Fuel (₹/kg) <input type="number" value={val('fuel')} onChange={e => set('fuel', e.target.value)} /></label>
              <label>Shell Rate MS <input type="number" value={val('shell_ms')} onChange={e => set('shell_ms', e.target.value)} /></label>
              <label>Shell Rate SS <input type="number" value={val('shell_ss')} onChange={e => set('shell_ss', e.target.value)} /></label>
            </div>
          </div>

          <div className="card">
            <div className="card-head">Wax &amp; Consumable Rates</div>
            <div className="form-grid form-grid-3">
              <label>Pattern Wax (₹/kg) <input type="number" value={val('pattern_wax')} onChange={e => set('pattern_wax', e.target.value)} /></label>
              <label>Riser Wax (₹/kg) <input type="number" value={val('riser_wax')} onChange={e => set('riser_wax', e.target.value)} /></label>
              <label>Water-Sol Wax <input type="number" value={val('water_sol_wax')} onChange={e => set('water_sol_wax', e.target.value)} /></label>
              <label>Ceramic Core (₹/pc) <input type="number" value={val('ceramic_core')} onChange={e => set('ceramic_core', e.target.value)} /></label>
              <label>Avg Std Mould Wt (kg) <input type="number" value={val('avg_std_mld_wt')} onChange={e => set('avg_std_mld_wt', e.target.value)} /></label>
            </div>
          </div>

          <div className="card">
            <div className="card-head">Loss &amp; Margin Parameters</div>
            <div className="form-grid">
              <label>Melting Loss (decimal, e.g. 0.03 = 3%) <input type="number" step="0.001" value={val('melting_loss')} onChange={e => set('melting_loss', e.target.value)} /></label>
              <label>Margin (decimal, e.g. 0.10 = 10%) <input type="number" step="0.001" value={val('margin')} onChange={e => set('margin', e.target.value)} /></label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
