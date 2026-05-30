import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { computeEstimation } from '../lib/engine';
import type { Plant } from '../types';
import { fmt } from '../types';

const DEFAULT_INPUTS = {
  metalRate: 45,
  compWt: 2.5,
  noPerMould: 4,
  batchQty: 500,
  materialType: 'MS',
  plantCode: 'Nasik',
};

export default function Scenarios() {
  const { data: plants = [] } = useQuery({ queryKey: ['plants'], queryFn: api.listPlants });
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [versions, setVersions] = useState<{ label: string; inputs: typeof DEFAULT_INPUTS }[]>([]);

  const plant: Plant | undefined = plants.find((p: Plant) => p.code === inputs.plantCode);

  const buildData = (inp: typeof DEFAULT_INPUTS) => ({
    salesEntry: {
      materialType: inp.materialType,
      compMetalWt: inp.compWt,
      noPerMould: inp.noPerMould,
      batchQty: inp.batchQty,
      riserType: 'NA',
      currency: 'INR',
    },
    chargeVirgin: [{ material: 'Pig Iron', qty: inp.noPerMould * inp.compWt, rate: inp.metalRate }],
    chargeReturn: [],
    retAlloyRate: inp.metalRate,
    postFoundry: [],
    machining: [],
    htRate: 30,
  });

  const result = plant ? computeEstimation(buildData(inputs) as any, plant) : null;

  const versionResults = versions.map(v => ({
    label: v.label,
    result: plant ? computeEstimation(buildData(v.inputs) as any, plant) : null,
  }));

  const saveVersion = () => {
    const label = `v${versions.length + 1} — ₹${inputs.metalRate}/kg`;
    setVersions(vs => [...vs, { label, inputs: { ...inputs } }]);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scenarios &amp; Versions</h1>
          <div className="page-sub">What-if simulator · Instant recalculation</div>
        </div>
        <button className="btn-ghost" onClick={saveVersion}>Save Snapshot</button>
      </div>

      <div className="scenario-layout">
        <div className="card scenario-controls">
          <div className="card-head">Input Parameters</div>
          <div className="form-grid">
            <label>Plant
              <select value={inputs.plantCode} onChange={e => setInputs(i => ({ ...i, plantCode: e.target.value }))}>
                {plants.map((p: Plant) => <option key={p.code} value={p.code}>{p.code}</option>)}
              </select>
            </label>
            <label>Material
              <select value={inputs.materialType} onChange={e => setInputs(i => ({ ...i, materialType: e.target.value }))}>
                {['MS','SS','Aluminium'].map(m => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label>Metal Rate (₹/kg)
              <input type="range" min={20} max={120} value={inputs.metalRate} onChange={e => setInputs(i => ({ ...i, metalRate: Number(e.target.value) }))} />
              <span className="range-val">₹{inputs.metalRate}</span>
            </label>
            <label>Component Weight (kg)
              <input type="range" min={0.5} max={20} step={0.5} value={inputs.compWt} onChange={e => setInputs(i => ({ ...i, compWt: Number(e.target.value) }))} />
              <span className="range-val">{inputs.compWt} kg</span>
            </label>
            <label>No. per Mould
              <input type="range" min={1} max={12} value={inputs.noPerMould} onChange={e => setInputs(i => ({ ...i, noPerMould: Number(e.target.value) }))} />
              <span className="range-val">{inputs.noPerMould}</span>
            </label>
            <label>Batch Qty
              <input type="number" value={inputs.batchQty} onChange={e => setInputs(i => ({ ...i, batchQty: Number(e.target.value) }))} />
            </label>
          </div>
        </div>

        <div className="card">
          <div className="card-head">Live Result — Current Inputs</div>
          {result ? (
            <table className="data-table">
              <thead><tr><th>Scenario</th><th>Rej%</th><th>As-Cast (With RC)</th><th>Ex-Price (With RC)</th><th>Ex-Price (Without RC)</th></tr></thead>
              <tbody>
                {result.scenarios.map((s, i) => (
                  <tr key={s.id}>
                    <td>Scenario {s.id}</td>
                    <td>{(s.rejPct * 100).toFixed(0)}%</td>
                    <td>{fmt(result.asCastWith[i])}</td>
                    <td className="linked-cell">{fmt(result.exPriceWith[i])}</td>
                    <td className="formula-cell">{fmt(result.exPriceWithout[i])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div style={{ color: 'var(--ink-faint)', padding: 16 }}>Select a plant to see calculations</div>}
        </div>
      </div>

      {versionResults.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-head">Saved Snapshots — Ex-Price (Scenario B, With RC)</div>
          <table className="data-table">
            <thead>
              <tr><th>Version</th><th>Metal Rate</th><th>Comp Wt</th><th>Per Mould</th><th>Ex-Price B</th><th>Δ vs v1</th></tr>
            </thead>
            <tbody>
              {versionResults.map((v, i) => {
                const price = v.result?.exPriceWith[1] ?? 0;
                const base = versionResults[0].result?.exPriceWith[1] ?? 0;
                const delta = i > 0 ? price - base : 0;
                return (
                  <tr key={v.label}>
                    <td>{v.label}</td>
                    <td>₹{versions[i].inputs.metalRate}</td>
                    <td>{versions[i].inputs.compWt} kg</td>
                    <td>{versions[i].inputs.noPerMould}</td>
                    <td className="linked-cell">{fmt(price)}</td>
                    <td style={{ color: delta > 0 ? 'var(--red)' : delta < 0 ? 'var(--green)' : '' }}>
                      {i === 0 ? '—' : `${delta > 0 ? '+' : ''}${fmt(delta)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
