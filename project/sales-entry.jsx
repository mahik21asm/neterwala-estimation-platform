// ===== UDL Product Costing — Sales Entry wizard component =====
// 7-step wizard mirroring Excel Sales Entry sheet (rows 4-77)

const { useState, useMemo } = React;

window.SalesEntryWizard = function SalesEntryWizard({ data, setData, onSubmit }) {
  const [step, setStep] = useState(0);
  const D = window.UDL_DATA.dropdowns;
  const se = data.salesEntry;

  function set(k, v) {
    setData({ ...data, salesEntry: { ...se, [k]: v } });
  }
  function setNested(group, k, v) {
    setData({ ...data, salesEntry: { ...se, [group]: { ...se[group], [k]: v } } });
  }
  function setTooling(k, v) {
    setData({ ...data, salesEntry: { ...se, tooling: { ...se.tooling, [k]: v } } });
  }

  const steps = [
    'Part ID', 'Composition', 'Mech. Props', 'HT & Surface',
    'Mould & Yield', 'Pricing', 'Tooling'
  ];

  return (
    <div>
      <div className="stepper">
        {steps.map((label, i) => (
          <React.Fragment key={i}>
            <div
              className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => setStep(i)}
            >
              <span className="num">{i < step ? '✓' : i + 1}</span>
              <span>{label}</span>
            </div>
            {i < steps.length - 1 && <span className="arrow">→</span>}
          </React.Fragment>
        ))}
      </div>

      {step === 0 && <Step1PartID se={se} set={set} D={D} />}
      {step === 1 && <Step2Composition se={se} setNested={setNested} D={D} />}
      {step === 2 && <Step3Mech se={se} setNested={setNested} D={D} />}
      {step === 3 && <Step4HT se={se} set={set} D={D} />}
      {step === 4 && <Step5Mould se={se} set={set} D={D} />}
      {step === 5 && <Step6Pricing se={se} set={set} D={D} />}
      {step === 6 && <Step7Tooling se={se} setTooling={setTooling} D={D} />}

      <div className="toolbar" style={{marginTop: 18, borderTop: '1.5px dashed #999', paddingTop: 14}}>
        <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
        <span className="sketch-note">Step {step + 1} of {steps.length} · Auto-saves every 30s</span>
        <span className="spacer" />
        <button className="btn ghost">Save Draft</button>
        {step < steps.length - 1
          ? <button className="btn primary" onClick={() => setStep(step + 1)}>Next →</button>
          : <button className="btn primary" onClick={onSubmit}>Generate Estimation →</button>
        }
      </div>
    </div>
  );
};

function Step1PartID({ se, set, D }) {
  return (
    <div className="card">
      <div className="card-head"><h3>Section 1 · Part Identification</h3>
        <span className="row-meta">15 fields · drives all plant + material cascades</span></div>
      <div className="card-body">
        <div className="form-grid">
          <Field label="Item Code *" val={se.itemCode} onChange={v=>set('itemCode',v)} hint="e.g. 30D" />
          <Field label="Die Code *" val={se.dieCode} onChange={v=>set('dieCode',v)} hint="usually = item code" />
          <Field label="Plant *" type="select" opts={D.plant} val={se.plant} onChange={v=>set('plant',v)} hint="cascades into 6+ master lookups" />
          <Field label="Date" val={se.date} onChange={v=>set('date',v)} />
          <Field label="Quotation No" val={se.quotationNo} onChange={v=>set('quotationNo',v)} />
          <Field label="Customer Type" type="select" opts={D.customerType} val={se.customerType} onChange={v=>set('customerType',v)} />
          <Field label="Dom / Exp" type="select" opts={D.geography} val={se.domExp} onChange={v=>set('domExp',v)} />
          <Field label="Customer Name *" val={se.customerName} onChange={v=>set('customerName',v)} />
          <Field label="Supply Condition" type="select" opts={D.supplyCondition} val={se.supplyCondition} onChange={v=>set('supplyCondition',v)} />
          <Field label="Part Description *" val={se.partDescription} onChange={v=>set('partDescription',v)} />
          <Field label="Material Type *" type="select" opts={D.materialType} val={se.materialType} onChange={v=>set('materialType',v)} hint="drives density + shell + OH" />
          <Field label="Drw No" val={se.drwNo} onChange={v=>set('drwNo',v)} />
          <Field label="Material *" val={se.material} onChange={v=>set('material',v)} hint="e.g. ASTM A 732 2Q" />
          <Field label="UOM" val={se.uom} onChange={v=>set('uom',v)} />
          <Field label="Batch Qty *" type="number" val={se.batchQty} onChange={v=>set('batchQty',+v)} hint="must be > 0 (else #DIV/0!)" />
        </div>
      </div>
    </div>
  );
}

function Step2Composition({ se, setNested, D }) {
  return (
    <div className="card">
      <div className="card-head"><h3>Section 2 · Composition</h3>
        <span className="row-meta">Min / Max % for 9 elements · Avg auto-computed on Estimation Sheet</span></div>
      <div className="card-body">
        <table className="xtable">
          <thead><tr><th>Element</th>{D.composition.map(el => <th key={el} className="num">{el}</th>)}</tr></thead>
          <tbody>
            <tr>
              <td className="label">Min %</td>
              {D.composition.map(el => (
                <td className="yellow num" key={el}>
                  <input type="number" step="0.01" value={se.compMin[el] ?? ''}
                    onChange={e=>setNested('compMin', el, e.target.value === '' ? '' : +e.target.value)} />
                </td>
              ))}
            </tr>
            <tr>
              <td className="label">Max %</td>
              {D.composition.map(el => (
                <td className="yellow num" key={el}>
                  <input type="number" step="0.01" value={se.compMax[el] ?? ''}
                    onChange={e=>setNested('compMax', el, e.target.value === '' ? '' : +e.target.value)} />
                </td>
              ))}
            </tr>
            <tr>
              <td className="label">Avg (auto)</td>
              {D.composition.map(el => {
                const mn = +se.compMin[el] || 0, mx = +se.compMax[el] || 0;
                return <td className="blue num" key={el}>{((mn + mx)/2).toFixed(3)}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Step3Mech({ se, setNested, D }) {
  return (
    <div className="card">
      <div className="card-head"><h3>Section 3 · Mechanical Properties</h3>
        <span className="row-meta">Optional — leave blank if not specified</span></div>
      <div className="card-body">
        <table className="xtable">
          <thead><tr><th>Property</th>{D.mech.map(p => <th key={p} className="num">{p}</th>)}</tr></thead>
          <tbody>
            <tr>
              <td className="label">Min</td>
              {D.mech.map(p => (
                <td className="yellow num" key={p}>
                  <input type="number" step="0.1" value={se.mechMin[p] ?? ''}
                    onChange={e=>setNested('mechMin', p, e.target.value === '' ? '' : +e.target.value)} />
                </td>
              ))}
            </tr>
            <tr>
              <td className="label">Max</td>
              {D.mech.map(p => (
                <td className="yellow num" key={p}>
                  <input type="number" step="0.1" value={se.mechMax[p] ?? ''}
                    onChange={e=>setNested('mechMax', p, e.target.value === '' ? '' : +e.target.value)} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Step4HT({ se, set, D }) {
  return (
    <div className="card">
      <div className="card-head"><h3>Section 4 · Heat Treatment, Surface & Inspection</h3></div>
      <div className="card-body">
        <div className="form-grid">
          <Field label="Heat Treatment" type="select" opts={['', ...D.heatTreatment]} val={se.heatTreatment} onChange={v=>set('heatTreatment',v)} />
          <Field label="Surface Treatment" type="select" opts={['', ...D.surfaceTreatment]} val={se.surfaceTreatment} onChange={v=>set('surfaceTreatment',v)} />
          <Field label="Hardness" val={se.hardness} onChange={v=>set('hardness',v)} hint="BHN/HRC value" />
          <Field label="Additional HT" type="select" opts={['', ...D.additionalHT]} val={se.additionalHT} onChange={v=>set('additionalHT',v)} />
          <Field label="Inspection" type="select" opts={D.inspection} val={se.inspection} onChange={v=>set('inspection',v)} />
          <Field label="Additional Hardness" val={se.additionalHardness} onChange={v=>set('additionalHardness',v)} />
        </div>
      </div>
    </div>
  );
}

function Step5Mould({ se, set, D }) {
  const riserWt = window.UDL_DATA.riserWeights[se.riserType] || 0;
  return (
    <div className="card">
      <div className="card-head"><h3>Section 5 · Mould & Yield Parameters</h3>
        <span className="row-meta">Drives yield %, mould wt, all per-piece costs</span></div>
      <div className="card-body">
        <div className="form-grid">
          <Field label="No / Mould *" type="number" val={se.noPerMould} onChange={v=>set('noPerMould',+v)} hint="components per mould tree" />
          <Field label="Riser Type" type="select" opts={D.riser} val={se.riserType} onChange={v=>set('riserType',v)}
            hint={`Lookup → ${riserWt.toFixed(3)} kg`} />
          <Field label="Component Wax Wt (kg)" type="number" step="0.001" val={se.compWaxWt} onChange={v=>set('compWaxWt',+v)} />
          <Field label="Component Metal Wt (kg) *" type="number" step="0.001" val={se.compMetalWt} onChange={v=>set('compMetalWt',+v)} hint="must be > 0" />
          <Field label="Riser Metal Wt (manual)" type="number" step="0.01" val={se.riserMetalWtManual} onChange={v=>set('riserMetalWtManual',+v)} hint="override actual riser wt" />
        </div>
      </div>
    </div>
  );
}

function Step6Pricing({ se, set, D }) {
  return (
    <div className="card">
      <div className="card-head"><h3>Section 6 · Pricing & Targets</h3></div>
      <div className="card-body">
        <div className="form-grid cols-2">
          <Field label="Target Price (₹/Pc)" type="number" val={se.targetPrice} onChange={v=>set('targetPrice',+v)} />
          <Field label="Currency" type="select" opts={D.currency} val={se.currency} onChange={v=>set('currency',v)} />
        </div>
      </div>
    </div>
  );
}

function Step7Tooling({ se, setTooling }) {
  const t = se.tooling;
  const dieTot = (+t.mainDie||0) + (+t.settingFix||0) + (+t.riserFeedDie||0) + (+t.ceramicCoreDie||0);
  const machTot = (+t.machiningFix||0) + (+t.machiningGauges||0) + (+t.specialTooling||0);
  return (
    <div className="card">
      <div className="card-head"><h3>Section 7 · Tooling & Development Costs (₹)</h3></div>
      <div className="card-body">
        <div className="two-col">
          <div>
            <h4 style={{marginTop:0, fontFamily:'var(--font-hand-bold)'}}>Die Tooling</h4>
            <div className="form-grid cols-2">
              <Field label="Main Die" type="number" val={t.mainDie} onChange={v=>setTooling('mainDie',+v)} />
              <Field label="Cavities" val={t.cavities} onChange={v=>setTooling('cavities',v)} />
              <Field label="Setting Fix / Coining" type="number" val={t.settingFix} onChange={v=>setTooling('settingFix',+v)} />
              <Field label="Riser & Feed Die" type="number" val={t.riserFeedDie} onChange={v=>setTooling('riserFeedDie',+v)} />
              <Field label="Ceramic Core Die" type="number" val={t.ceramicCoreDie} onChange={v=>setTooling('ceramicCoreDie',+v)} />
            </div>
            <div className="kpi info" style={{marginTop:12}}>
              <div className="k-label">Die Total</div>
              <div className="k-val">₹ {window.UDL_ENGINE.fmtInt(dieTot)}</div>
            </div>
          </div>
          <div>
            <h4 style={{marginTop:0, fontFamily:'var(--font-hand-bold)'}}>Machining Tooling</h4>
            <div className="form-grid cols-2">
              <Field label="Machining Fixture" type="number" val={t.machiningFix} onChange={v=>setTooling('machiningFix',+v)} />
              <Field label="Machining Gauges" type="number" val={t.machiningGauges} onChange={v=>setTooling('machiningGauges',+v)} />
              <Field label="Special Tooling" type="number" val={t.specialTooling} onChange={v=>setTooling('specialTooling',+v)} />
            </div>
            <div className="kpi info" style={{marginTop:12}}>
              <div className="k-label">Machining Total</div>
              <div className="k-val">₹ {window.UDL_ENGINE.fmtInt(machTot)}</div>
            </div>
          </div>
        </div>
        <hr className="dashed" />
        <div className="kpi accent">
          <div className="k-label">Total Development Cost</div>
          <div className="k-val">₹ {window.UDL_ENGINE.fmtInt(dieTot + machTot)}</div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, val, onChange, hint, type='text', opts, step }) {
  return (
    <div className="field">
      <label>{label}</label>
      {type === 'select'
        ? (<select value={val ?? ''} onChange={e=>onChange(e.target.value)}>
            {(opts||[]).map(o => <option key={o} value={o}>{o || '— select —'}</option>)}
          </select>)
        : (<input type={type} step={step}
            value={val ?? ''} onChange={e=>onChange(e.target.value)} />)
      }
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
