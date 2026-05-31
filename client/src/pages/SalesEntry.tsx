import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { computeEstimation } from '../lib/engine';
import type { EstimationData, Plant } from '../types';
import { DEFAULT_SALES_ENTRY, DROPDOWNS, COMPOSITIONS, MECH_PROPS, TESTS, fmt, fmtInt } from '../types';

const STEPS = ['Sales Entry', 'Charge Mix', 'Post-Foundry', 'Machining', 'Heat Treatment', 'Tooling', 'Summary'];

const initData = (): EstimationData => ({
  salesEntry: { ...DEFAULT_SALES_ENTRY },
  chargeVirgin: [{ material: 'Pig Iron', qty: 100, rate: 45 }],
  chargeReturn: [{ material: 'Returns', qty: 50, rate: 30 }],
  retAlloyRate: 0,
  postFoundry: [],
  machining: [],
  htRate: 30,
  tests: {},
});

export default function SalesEntry() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<EstimationData>(initData());
  const [meta, setMeta] = useState({ rfqNo: '', customer: '', plantCode: 'Nasik', companyCode: 'UDL' });
  const [saving, setSaving] = useState(false);

  const { data: plants = [] } = useQuery({ queryKey: ['plants'], queryFn: api.listPlants });
  const { data: existing } = useQuery({
    queryKey: ['estimation', id],
    queryFn: () => api.getEstimation(Number(id)),
    enabled: !!id && id !== 'new',
  });

  useEffect(() => {
    if (existing?.latestVersion?.data) {
      setData(existing.latestVersion.data as EstimationData);
      setMeta({ rfqNo: existing.rfq_no, customer: existing.customer ?? '', plantCode: existing.plant_code, companyCode: existing.company_code });
    }
  }, [existing]);

  const plant: Plant | undefined = plants.find((p: Plant) => p.code === meta.plantCode);
  const result = plant ? computeEstimation(data, plant) : null;

  const save = useMutation({
    mutationFn: async () => {
      if (id && id !== 'new') {
        return api.saveVersion(Number(id), { label: `v${((existing as any)?.versions?.length ?? 0) + 1}`, createdBy: 'Sales User', data });
      } else {
        return api.createEstimation({
          rfqNo: meta.rfqNo,
          itemCode: data.salesEntry.itemCode ?? 'ITEM',
          plantCode: meta.plantCode,
          companyCode: meta.companyCode,
          customer: meta.customer,
          materialType: data.salesEntry.materialType,
          data,
        });
      }
    },
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['estimations'] });
      if (!id || id === 'new') nav(`/estimations/${res.id}`);
    },
  });

  const se = data.salesEntry;
  const upSe = (k: string, v: any) => setData(d => ({ ...d, salesEntry: { ...d.salesEntry, [k]: v } }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{id && id !== 'new' ? `Estimation #${id}` : 'New Estimation'}</h1>
          <div className="page-sub">{meta.rfqNo || 'Enter RFQ details below'}</div>
        </div>
        <button className="btn-primary" onClick={() => save.mutate()} disabled={save.isPending || saving}>
          {save.isPending ? 'Saving…' : id && id !== 'new' ? 'Save Version' : 'Create'}
        </button>
      </div>

      <div className="wizard-steps">
        {STEPS.map((s, i) => (
          <button key={s} className={`wizard-step${step === i ? ' active' : ''}${i < step ? ' done' : ''}`} onClick={() => setStep(i)}>
            <span className="ws-num">{i + 1}</span>
            <span className="ws-label">{s}</span>
          </button>
        ))}
      </div>

      <div className="wizard-body">
        {step === 0 && (
          <div className="card">
            <div className="card-head">Sales Entry — Component Details</div>
            <div className="form-grid form-grid-3">
              <label>RFQ No <input value={meta.rfqNo} onChange={e => setMeta(m => ({ ...m, rfqNo: e.target.value }))} placeholder="RFQ-2024-001" /></label>
              <label>Item Code <input value={se.itemCode ?? ''} onChange={e => upSe('itemCode', e.target.value)} placeholder="30D-001" /></label>
              <label>Customer <input value={meta.customer} onChange={e => setMeta(m => ({ ...m, customer: e.target.value }))} /></label>
              <label>Plant
                <select value={meta.plantCode} onChange={e => setMeta(m => ({ ...m, plantCode: e.target.value }))}>
                  {plants.map((p: Plant) => <option key={p.code} value={p.code}>{p.code}</option>)}
                </select>
              </label>
              <label>Company
                <select value={meta.companyCode} onChange={e => setMeta(m => ({ ...m, companyCode: e.target.value }))}>
                  {['UDL','UTPL','UAL','UAML','TGUK'].map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Material Type
                <select value={se.materialType} onChange={e => upSe('materialType', e.target.value)}>
                  {DROPDOWNS.materialType.map(v => <option key={v}>{v}</option>)}
                </select>
              </label>
              <label>Component Wt (kg) <input type="number" value={se.compMetalWt ?? ''} onChange={e => upSe('compMetalWt', e.target.value)} /></label>
              <label>Wax Wt (kg) <input type="number" value={se.compWaxWt ?? ''} onChange={e => upSe('compWaxWt', e.target.value)} /></label>
              <label>No. per Mould <input type="number" value={se.noPerMould ?? ''} onChange={e => upSe('noPerMould', e.target.value)} /></label>
              <label>Batch Qty <input type="number" value={se.batchQty ?? ''} onChange={e => upSe('batchQty', e.target.value)} /></label>
              <label>Riser Type
                <select value={se.riserType ?? ''} onChange={e => upSe('riserType', e.target.value)}>
                  {DROPDOWNS.riser.map(v => <option key={v}>{v}</option>)}
                </select>
              </label>
              <label>Riser Wt (manual) <input type="number" value={se.riserMetalWtManual ?? ''} onChange={e => upSe('riserMetalWtManual', e.target.value)} /></label>
              <label>Currency
                <select value={se.currency ?? 'INR'} onChange={e => upSe('currency', e.target.value)}>
                  {DROPDOWNS.currency.map(v => <option key={v}>{v}</option>)}
                </select>
              </label>
              <label>Supply Condition
                <select value={se.supplyCondition ?? ''} onChange={e => upSe('supplyCondition', e.target.value)}>
                  {DROPDOWNS.supplyCondition.map(v => <option key={v}>{v}</option>)}
                </select>
              </label>
              <label>Heat Treatment
                <select value={se.heatTreatment ?? ''} onChange={e => upSe('heatTreatment', e.target.value)}>
                  {DROPDOWNS.heatTreatment.map(v => <option key={v}>{v}</option>)}
                </select>
              </label>
            </div>

            {result && (
              <div className="calc-preview">
                <div className="cp-head">Live Calculation Preview</div>
                <div className="cp-grid">
                  <span>Mould Wt (Metal)</span><span className="formula-cell">{fmt(result.mouldWtMetal)} kg</span>
                  <span>Yield %</span><span className="formula-cell">{(result.yieldPct * 100).toFixed(1)}%</span>
                  <span>Riser Wt</span><span className="formula-cell">{fmt(result.riserWtFromTable)} kg</span>
                  <span>Metal Rate</span><span className="formula-cell">₹{fmt(result.rateToConsider)}/kg</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="card">
            <div className="card-head">Charge Mix</div>
            <div className="section-label">Virgin Metal</div>
            <table className="data-table">
              <thead><tr><th>Material</th><th>Qty (kg)</th><th>Rate (₹/kg)</th><th></th></tr></thead>
              <tbody>
                {(data.chargeVirgin ?? []).map((row, i) => (
                  <tr key={i}>
                    <td><input value={row.material ?? ''} onChange={e => setData(d => { const a = [...(d.chargeVirgin??[])]; a[i] = { ...a[i], material: e.target.value }; return { ...d, chargeVirgin: a }; })} /></td>
                    <td><input type="number" value={row.qty ?? ''} onChange={e => setData(d => { const a = [...(d.chargeVirgin??[])]; a[i] = { ...a[i], qty: Number(e.target.value) }; return { ...d, chargeVirgin: a }; })} /></td>
                    <td><input type="number" value={row.rate ?? ''} onChange={e => setData(d => { const a = [...(d.chargeVirgin??[])]; a[i] = { ...a[i], rate: Number(e.target.value) }; return { ...d, chargeVirgin: a }; })} /></td>
                    <td><button className="btn-ghost btn-sm" onClick={() => setData(d => ({ ...d, chargeVirgin: (d.chargeVirgin??[]).filter((_,j)=>j!==i) }))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn-ghost btn-sm" onClick={() => setData(d => ({ ...d, chargeVirgin: [...(d.chargeVirgin??[]), { material: '', qty: 0, rate: 0 }] }))}>+ Add Row</button>

            <div className="section-label" style={{ marginTop: 16 }}>Return / Alloy</div>
            <table className="data-table">
              <thead><tr><th>Material</th><th>Qty (kg)</th><th>Rate (₹/kg)</th><th></th></tr></thead>
              <tbody>
                {(data.chargeReturn ?? []).map((row, i) => (
                  <tr key={i}>
                    <td><input value={row.material ?? ''} onChange={e => setData(d => { const a = [...(d.chargeReturn??[])]; a[i] = { ...a[i], material: e.target.value }; return { ...d, chargeReturn: a }; })} /></td>
                    <td><input type="number" value={row.qty ?? ''} onChange={e => setData(d => { const a = [...(d.chargeReturn??[])]; a[i] = { ...a[i], qty: Number(e.target.value) }; return { ...d, chargeReturn: a }; })} /></td>
                    <td><input type="number" value={row.rate ?? ''} onChange={e => setData(d => { const a = [...(d.chargeReturn??[])]; a[i] = { ...a[i], rate: Number(e.target.value) }; return { ...d, chargeReturn: a }; })} /></td>
                    <td><button className="btn-ghost btn-sm" onClick={() => setData(d => ({ ...d, chargeReturn: (d.chargeReturn??[]).filter((_,j)=>j!==i) }))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn-ghost btn-sm" onClick={() => setData(d => ({ ...d, chargeReturn: [...(d.chargeReturn??[]), { material: '', qty: 0, rate: 0 }] }))}>+ Add Row</button>

            <div className="form-grid" style={{ marginTop: 16 }}>
              <label>Return Alloy Rate Override (0 = use avg) <input type="number" value={data.retAlloyRate ?? ''} onChange={e => setData(d => ({ ...d, retAlloyRate: Number(e.target.value) }))} /></label>
            </div>

            {result && (
              <div className="calc-preview">
                <div className="cp-grid">
                  <span>Virgin Rate</span><span className="formula-cell">₹{fmt(result.virgin.rate)}/kg</span>
                  <span>Return Rate</span><span className="formula-cell">₹{fmt(result.ret.rate)}/kg</span>
                  <span>Rate to Consider</span><span className="formula-cell linked-cell">₹{fmt(result.rateToConsider)}/kg</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <div className="card-head">Post-Foundry Operations</div>
            <table className="data-table">
              <thead><tr><th>Operation</th><th>UOM</th><th>Rate</th><th>Per Cast</th><th></th></tr></thead>
              <tbody>
                {(data.postFoundry ?? []).map((row, i) => (
                  <tr key={i}>
                    <td>
                      <select value={row.operation ?? ''} onChange={e => setData(d => { const a = [...(d.postFoundry??[])]; a[i] = { ...a[i], operation: e.target.value }; return { ...d, postFoundry: a }; })}>
                        {DROPDOWNS.postFoundryOps.map(v => <option key={v}>{v}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={row.uom ?? 'NO'} onChange={e => setData(d => { const a = [...(d.postFoundry??[])]; a[i] = { ...a[i], uom: e.target.value }; return { ...d, postFoundry: a }; })}>
                        {['NO','MD','KG'].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </td>
                    <td><input type="number" value={row.rate ?? ''} onChange={e => setData(d => { const a = [...(d.postFoundry??[])]; a[i] = { ...a[i], rate: Number(e.target.value) }; return { ...d, postFoundry: a }; })} /></td>
                    <td className="formula-cell">{result ? fmt(result.pfRows[i]?.perCast ?? 0) : '—'}</td>
                    <td><button className="btn-ghost btn-sm" onClick={() => setData(d => ({ ...d, postFoundry: (d.postFoundry??[]).filter((_,j)=>j!==i) }))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn-ghost btn-sm" onClick={() => setData(d => ({ ...d, postFoundry: [...(d.postFoundry??[]), { operation: 'Shot Blasting', uom: 'NO', rate: 0 }] }))}>+ Add Operation</button>
            {result && <div className="calc-preview"><div className="cp-grid"><span>PF Total / cast</span><span className="formula-cell">₹{fmt(result.pfTotal)}</span></div></div>}
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <div className="card-head">Machining Operations</div>
            <table className="data-table">
              <thead><tr><th>Operation</th><th>Machine</th><th>Cycle (min)</th><th>Complexity</th><th>Add-on</th><th>Total</th><th></th></tr></thead>
              <tbody>
                {(data.machining ?? []).map((row, i) => (
                  <tr key={i}>
                    <td>
                      <select value={row.operation ?? ''} onChange={e => setData(d => { const a = [...(d.machining??[])]; a[i] = { ...a[i], operation: e.target.value }; return { ...d, machining: a }; })}>
                        {DROPDOWNS.machiningOps.map(v => <option key={v}>{v}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={row.machine ?? ''} onChange={e => setData(d => { const a = [...(d.machining??[])]; a[i] = { ...a[i], machine: e.target.value }; return { ...d, machining: a }; })}>
                        {DROPDOWNS.machineType.map(v => <option key={v}>{v}</option>)}
                      </select>
                    </td>
                    <td><input type="number" value={row.cycle ?? ''} onChange={e => setData(d => { const a = [...(d.machining??[])]; a[i] = { ...a[i], cycle: Number(e.target.value) }; return { ...d, machining: a }; })} /></td>
                    <td><input type="number" step="0.1" value={row.complexity ?? ''} onChange={e => setData(d => { const a = [...(d.machining??[])]; a[i] = { ...a[i], complexity: Number(e.target.value) }; return { ...d, machining: a }; })} /></td>
                    <td><input type="number" value={row.addon ?? ''} onChange={e => setData(d => { const a = [...(d.machining??[])]; a[i] = { ...a[i], addon: Number(e.target.value) }; return { ...d, machining: a }; })} /></td>
                    <td className="formula-cell">{result ? fmt(result.machRows[i]?.total ?? 0) : '—'}</td>
                    <td><button className="btn-ghost btn-sm" onClick={() => setData(d => ({ ...d, machining: (d.machining??[]).filter((_,j)=>j!==i) }))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn-ghost btn-sm" onClick={() => setData(d => ({ ...d, machining: [...(d.machining??[]), { operation: 'Milling', machine: 'VF 2 - 1', cycle: 0, complexity: 1, addon: 0 }] }))}>+ Add Operation</button>
            {result && <div className="calc-preview"><div className="cp-grid"><span>Machining Total</span><span className="formula-cell">₹{fmt(result.machTotal)}</span></div></div>}
          </div>
        )}

        {step === 4 && (
          <div className="card">
            <div className="card-head">Heat Treatment</div>
            <div className="form-grid">
              <label>HT Rate (₹/kg) <input type="number" value={data.htRate ?? 30} onChange={e => setData(d => ({ ...d, htRate: Number(e.target.value) }))} /></label>
            </div>
            {result && (
              <div className="calc-preview">
                <div className="cp-grid">
                  <span>HT Weight</span><span className="formula-cell">{fmt(Number(se.compMetalWt) * Number(se.noPerMould))} kg</span>
                  <span>HT Value</span><span className="formula-cell linked-cell">₹{fmt(result.costRows.ht.value)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="card">
            <div className="card-head">Tooling Cost</div>
            <div className="form-grid form-grid-3">
              <label>Main Die <input type="number" value={data.salesEntry.tooling?.mainDie ?? ''} onChange={e => upSe('tooling', { ...se.tooling, mainDie: Number(e.target.value) })} /></label>
              <label>Setting / Fixture <input type="number" value={data.salesEntry.tooling?.settingFix ?? ''} onChange={e => upSe('tooling', { ...se.tooling, settingFix: Number(e.target.value) })} /></label>
              <label>Riser / Feed Die <input type="number" value={data.salesEntry.tooling?.riserFeedDie ?? ''} onChange={e => upSe('tooling', { ...se.tooling, riserFeedDie: Number(e.target.value) })} /></label>
              <label>Ceramic Core Die <input type="number" value={data.salesEntry.tooling?.ceramicCoreDie ?? ''} onChange={e => upSe('tooling', { ...se.tooling, ceramicCoreDie: Number(e.target.value) })} /></label>
              <label>Machining Fixture <input type="number" value={data.salesEntry.tooling?.machiningFix ?? ''} onChange={e => upSe('tooling', { ...se.tooling, machiningFix: Number(e.target.value) })} /></label>
              <label>Machining Gauges <input type="number" value={data.salesEntry.tooling?.machiningGauges ?? ''} onChange={e => upSe('tooling', { ...se.tooling, machiningGauges: Number(e.target.value) })} /></label>
              <label>Special Tooling <input type="number" value={data.salesEntry.tooling?.specialTooling ?? ''} onChange={e => upSe('tooling', { ...se.tooling, specialTooling: Number(e.target.value) })} /></label>
            </div>
            {result && (
              <div className="calc-preview">
                <div className="cp-grid">
                  <span>Die Total</span><span className="formula-cell">₹{fmtInt(result.tooling.dieTotal)}</span>
                  <span>Mach Tooling</span><span className="formula-cell">₹{fmtInt(result.tooling.machTooling)}</span>
                  <span>Total Dev Cost</span><span className="formula-cell linked-cell">₹{fmtInt(result.tooling.totalDevCost)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 6 && result && (
          <div>
            <div className="card">
              <div className="card-head">Cost Build-up — Per Mould</div>
              <table className="data-table">
                <thead><tr><th>Cost Head</th><th>Qty</th><th>Rate</th><th>With RC</th><th>Without RC</th></tr></thead>
                <tbody>
                  <tr><td>Pattern Wax</td><td>{fmt(result.costRows.patternWax.qty)}</td><td>{fmt(result.costRows.patternWax.rate)}</td><td colSpan={2}>{fmt(result.costRows.patternWax.value)}</td></tr>
                  <tr><td>Riser Wax</td><td>{fmt(result.costRows.riserWax.qty)}</td><td>{fmt(result.costRows.riserWax.rate)}</td><td colSpan={2}>{fmt(result.costRows.riserWax.value)}</td></tr>
                  <tr><td>Ceramic Core</td><td>0.15</td><td>{fmt(result.costRows.ceramicCore.rate)}</td><td colSpan={2}>{fmt(result.costRows.ceramicCore.value)}</td></tr>
                  <tr><td>Shell Cost</td><td>{fmt(result.costRows.shell.qty)}</td><td>{fmt(result.costRows.shell.rate)}</td><td colSpan={2}>{fmt(result.costRows.shell.value)}</td></tr>
                  <tr><td>Metal (gross)</td><td>{fmt(result.mouldWtMetal)}</td><td>{fmt(result.costRows.metal.rate)}</td><td className="formula-cell">{fmt(result.costRows.metal.valueWith)}</td><td className="formula-cell">{fmt(result.costRows.metal.valueWithout)}</td></tr>
                  <tr><td>Consumables</td><td>—</td><td>{fmt(result.costRows.consumables.rate)}</td><td colSpan={2}>{fmt(result.costRows.consumables.value)}</td></tr>
                  <tr><td>Heat Treatment</td><td>{fmt(result.costRows.ht.qty)}</td><td>{fmt(result.costRows.ht.rate)}</td><td colSpan={2}>{fmt(result.costRows.ht.value)}</td></tr>
                  <tr><td>Power</td><td>—</td><td>{fmt(result.costRows.power.rate)}</td><td colSpan={2}>{fmt(result.costRows.power.value)}</td></tr>
                  <tr><td>Fuel</td><td>—</td><td>{fmt(result.costRows.fuel.rate)}</td><td colSpan={2}>{fmt(result.costRows.fuel.value)}</td></tr>
                  <tr><td>Labour</td><td>—</td><td>{fmt(result.costRows.labour.rate)}</td><td colSpan={2}>{fmt(result.costRows.labour.value)}</td></tr>
                  <tr><td>Overhead</td><td>—</td><td>{fmt(result.costRows.overhead.rate)}</td><td colSpan={2}>{fmt(result.costRows.overhead.value)}</td></tr>
                  <tr><td>Leak / Misc (1%)</td><td>—</td><td>—</td><td className="formula-cell">{fmt(result.costRows.leakMould.withRC)}</td><td className="formula-cell">{fmt(result.costRows.leakMould.withoutRC)}</td></tr>
                  <tr style={{ fontWeight: 700 }}><td>TOTAL COST / MOULD</td><td>—</td><td>—</td><td className="linked-cell">{fmt(result.totalCostWithRC)}</td><td className="linked-cell">{fmt(result.totalCostWithoutRC)}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-head">Ex-Works Pricing Matrix</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Scenario</th><th>Rej%</th>
                    <th>With RC — As Cast</th><th>Without RC — As Cast</th>
                    <th>With RC — Finished</th><th>Without RC — Finished</th>
                    <th>With RC — Ex Price</th><th>Without RC — Ex Price</th>
                  </tr>
                </thead>
                <tbody>
                  {result.scenarios.map((s, i) => (
                    <tr key={s.id}>
                      <td>Scenario {s.id}</td>
                      <td>{(s.rejPct * 100).toFixed(0)}%</td>
                      <td className="formula-cell">{fmt(result.asCastWith[i])}</td>
                      <td className="formula-cell">{fmt(result.asCastWithout[i])}</td>
                      <td className="formula-cell">{fmt(result.finishedWith[i])}</td>
                      <td className="formula-cell">{fmt(result.finishedWithout[i])}</td>
                      <td className="linked-cell">{fmt(result.exPriceWith[i])}</td>
                      <td className="linked-cell">{fmt(result.exPriceWithout[i])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="wizard-nav">
          <button className="btn-ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Back</button>
          <button className="btn-primary" onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>Next →</button>
        </div>
      </div>
    </div>
  );
}
