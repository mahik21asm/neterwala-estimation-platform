// ===== UDL Hi-Fi · Sales Entry wizard (7 steps) =====

const { useState: useStateSE } = React;

window.HiFiSalesEntry = function HiFiSalesEntry({ data, setData, onSubmit }) {
  const [step, setStep] = useStateSE(0);
  const D = window.UDL_DATA.dropdowns;
  const Icon = window.Icon;
  const se = data.salesEntry;

  function set(k, v) { setData({ ...data, salesEntry: { ...se, [k]: v } }); }
  function setNested(g, k, v) { setData({ ...data, salesEntry: { ...se, [g]: { ...se[g], [k]: v } } }); }
  function setTooling(k, v) { setData({ ...data, salesEntry: { ...se, tooling: { ...se.tooling, [k]: v } } }); }

  const steps = [
    { label: 'Part ID',      ico: 'package',  ct: 15 },
    { label: 'Composition',  ico: 'flask',    ct: 9 },
    { label: 'Mech. Props',  ico: 'sigma',    ct: 6 },
    { label: 'HT & Surface', ico: 'settings', ct: 6 },
    { label: 'Mould & Yield',ico: 'factory',  ct: 5 },
    { label: 'Pricing',      ico: 'sheet',    ct: 2 },
    { label: 'Tooling',      ico: 'database', ct: 8 },
  ];

  return (
    <div>
      <div className="stepper">
        {steps.map((s,i)=>(
          <div key={i} className={`step ${i===step?'active':''} ${i<step?'done':''}`} onClick={()=>setStep(i)}>
            <span className="num">{i<step ? <Icon name="check" size={11}/> : i+1}</span>
            <span className="label">{s.label}</span>
          </div>
        ))}
      </div>

      {step===0 && <S1 se={se} set={set} D={D}/>}
      {step===1 && <S2 se={se} setNested={setNested} D={D}/>}
      {step===2 && <S3 se={se} setNested={setNested} D={D}/>}
      {step===3 && <S4 se={se} set={set} D={D}/>}
      {step===4 && <S5 se={se} set={set} D={D}/>}
      {step===5 && <S6 se={se} set={set} D={D}/>}
      {step===6 && <S7 se={se} setTooling={setTooling}/>}

      <div style={{display:'flex',alignItems:'center',gap:10,marginTop:24,paddingTop:20,borderTop:'1px solid #e4e4e7'}}>
        <button className="btn" disabled={step===0} onClick={()=>setStep(step-1)}><Icon name="arrow-left" size={12}/> Back</button>
        <span className="mono muted" style={{fontSize:11.5}}>Step {step+1} of {steps.length} · auto-saves every 30s</span>
        <span className="spacer"/>
        <button className="btn ghost">Save Draft</button>
        {step<steps.length-1
          ? <button className="btn primary" onClick={()=>setStep(step+1)}>Next <Icon name="arrow-right" size={12}/></button>
          : <button className="btn brand" onClick={onSubmit}>Generate Estimation <Icon name="arrow-right" size={12}/></button>}
      </div>
    </div>
  );
};

function SCard({ title, meta, stripe, children }) {
  return (
    <div className="card">
      <div className="card-head">
        {stripe && <span className={`cell-stripe ${stripe}`}/>}
        <h3>{title}</h3>
        {meta && <span className="meta">{meta}</span>}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function F({ label, val, onChange, hint, type='text', opts, step, req, pill }) {
  const Ctl = type==='select' ? 'select' : 'input';
  return (
    <div className="field">
      <span className="field-label">
        {label} {req && <span className="req">*</span>}
        {pill && <span className={`pill ${pill}`}>{pill}</span>}
      </span>
      {type==='select'
        ? <select className="select" value={val ?? ''} onChange={e=>onChange(e.target.value)}>
            {(opts||[]).map(o => <option key={o} value={o}>{o || '— select —'}</option>)}
          </select>
        : <input className={`input ${pill==='input'?'input-tinted':''}`} type={type} step={step} value={val ?? ''} onChange={e=>onChange(e.target.value)}/>
      }
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

function S1({ se, set, D }) {
  return (
    <SCard title="Part Identification" meta="15 fields · cascades into 6+ master lookups" stripe="input">
      <div className="form-grid">
        <F label="Item Code"     val={se.itemCode}     onChange={v=>set('itemCode',v)} req hint="e.g. 30D"/>
        <F label="Die Code"      val={se.dieCode}      onChange={v=>set('dieCode',v)} req/>
        <F label="Plant"         val={se.plant}        onChange={v=>set('plant',v)} type="select" opts={D.plant} req hint={<><span className="arrow">→</span> drives 6 cascades</>}/>
        <F label="Date"          val={se.date}         onChange={v=>set('date',v)}/>
        <F label="Quotation No"  val={se.quotationNo}  onChange={v=>set('quotationNo',v)}/>
        <F label="Customer Type" val={se.customerType} onChange={v=>set('customerType',v)} type="select" opts={D.customerType}/>
        <F label="Geography"     val={se.domExp}       onChange={v=>set('domExp',v)} type="select" opts={D.geography}/>
        <F label="Customer Name" val={se.customerName} onChange={v=>set('customerName',v)} req/>
        <F label="Supply Condition" val={se.supplyCondition} onChange={v=>set('supplyCondition',v)} type="select" opts={D.supplyCondition}/>
        <F label="Part Description" val={se.partDescription} onChange={v=>set('partDescription',v)} req/>
        <F label="Material Type" val={se.materialType} onChange={v=>set('materialType',v)} type="select" opts={D.materialType} req hint={<><span className="arrow">→</span> density + shell + OH</>}/>
        <F label="Drawing No"    val={se.drwNo}        onChange={v=>set('drwNo',v)}/>
        <F label="Material Spec" val={se.material}     onChange={v=>set('material',v)} req hint="e.g. ASTM A 732 2Q"/>
        <F label="UOM"           val={se.uom}          onChange={v=>set('uom',v)}/>
        <F label="Batch Quantity" val={se.batchQty}   onChange={v=>set('batchQty',+v)} type="number" req hint="must be > 0"/>
      </div>
    </SCard>
  );
}

function S2({ se, setNested, D }) {
  return (
    <SCard title="Composition" meta="Min / Max % for 9 elements · Avg auto-computed" stripe="input">
      <div className="table-wrap">
        <table className="dtable">
          <thead><tr><th></th>{D.composition.map(el=><th key={el} className="num">{el}</th>)}</tr></thead>
          <tbody>
            <tr><td className="label-cell">Min %</td>{D.composition.map(el=>(
              <td key={el} className="input num"><input type="number" step="0.01" value={se.compMin[el] ?? ''} onChange={e=>setNested('compMin',el,e.target.value===''?'':+e.target.value)}/></td>
            ))}</tr>
            <tr><td className="label-cell">Max %</td>{D.composition.map(el=>(
              <td key={el} className="input num"><input type="number" step="0.01" value={se.compMax[el] ?? ''} onChange={e=>setNested('compMax',el,e.target.value===''?'':+e.target.value)}/></td>
            ))}</tr>
            <tr><td className="label-cell">Avg <span className="tag formula" style={{marginLeft:4}}>auto</span></td>{D.composition.map(el=>{
              const mn=+se.compMin[el]||0, mx=+se.compMax[el]||0;
              return <td key={el} className="formula num">{((mn+mx)/2).toFixed(3)}</td>;
            })}</tr>
          </tbody>
        </table>
      </div>
    </SCard>
  );
}

function S3({ se, setNested, D }) {
  return (
    <SCard title="Mechanical Properties" meta="Optional — leave blank if not specified" stripe="input">
      <div className="table-wrap">
        <table className="dtable">
          <thead><tr><th></th>{D.mech.map(p=><th key={p} className="num">{p}</th>)}</tr></thead>
          <tbody>
            <tr><td className="label-cell">Min</td>{D.mech.map(p=>(
              <td key={p} className="input num"><input type="number" step="0.1" value={se.mechMin[p] ?? ''} onChange={e=>setNested('mechMin',p,e.target.value===''?'':+e.target.value)}/></td>))}</tr>
            <tr><td className="label-cell">Max</td>{D.mech.map(p=>(
              <td key={p} className="input num"><input type="number" step="0.1" value={se.mechMax[p] ?? ''} onChange={e=>setNested('mechMax',p,e.target.value===''?'':+e.target.value)}/></td>))}</tr>
          </tbody>
        </table>
      </div>
    </SCard>
  );
}

function S4({ se, set, D }) {
  return (
    <SCard title="Heat Treatment, Surface & Inspection" stripe="input">
      <div className="form-grid">
        <F label="Heat Treatment"    val={se.heatTreatment}    onChange={v=>set('heatTreatment',v)} type="select" opts={['', ...D.heatTreatment]}/>
        <F label="Surface Treatment" val={se.surfaceTreatment} onChange={v=>set('surfaceTreatment',v)} type="select" opts={['', ...D.surfaceTreatment]}/>
        <F label="Hardness"          val={se.hardness}         onChange={v=>set('hardness',v)} hint="BHN/HRC value"/>
        <F label="Additional HT"     val={se.additionalHT}     onChange={v=>set('additionalHT',v)} type="select" opts={['', ...D.additionalHT]}/>
        <F label="Inspection"        val={se.inspection}       onChange={v=>set('inspection',v)} type="select" opts={D.inspection}/>
        <F label="Additional Hardness" val={se.additionalHardness} onChange={v=>set('additionalHardness',v)}/>
      </div>
    </SCard>
  );
}

function S5({ se, set, D }) {
  const riserWt = window.UDL_DATA.riserWeights[se.riserType] || 0;
  return (
    <SCard title="Mould & Yield Parameters" meta="Drives yield %, mould wt, all per-piece costs" stripe="input">
      <div className="form-grid">
        <F label="No / Mould" val={se.noPerMould} onChange={v=>set('noPerMould',+v)} type="number" req hint="components per mould tree"/>
        <F label="Riser Type" val={se.riserType} onChange={v=>set('riserType',v)} type="select" opts={D.riser} hint={<><span className="arrow">→</span> {riserWt.toFixed(3)} kg from lookup</>}/>
        <F label="Component Wax Wt (kg)" val={se.compWaxWt} onChange={v=>set('compWaxWt',+v)} type="number" step="0.001"/>
        <F label="Component Metal Wt (kg)" val={se.compMetalWt} onChange={v=>set('compMetalWt',+v)} type="number" step="0.001" req hint="must be > 0"/>
        <F label="Riser Metal Wt (manual override)" val={se.riserMetalWtManual} onChange={v=>set('riserMetalWtManual',+v)} type="number" step="0.01" hint="overrides table value"/>
      </div>
    </SCard>
  );
}

function S6({ se, set, D }) {
  return (
    <SCard title="Pricing & Targets" stripe="input">
      <div className="form-grid cols-2">
        <F label="Target Price (₹/Pc)" val={se.targetPrice} onChange={v=>set('targetPrice',+v)} type="number" hint="customer ceiling"/>
        <F label="Currency" val={se.currency} onChange={v=>set('currency',v)} type="select" opts={D.currency}/>
      </div>
    </SCard>
  );
}

function S7({ se, setTooling }) {
  const t = se.tooling;
  const dieTot  = (+t.mainDie||0)+(+t.settingFix||0)+(+t.riserFeedDie||0)+(+t.ceramicCoreDie||0);
  const machTot = (+t.machiningFix||0)+(+t.machiningGauges||0)+(+t.specialTooling||0);
  return (
    <>
      <div className="two-col">
        <SCard title="Die Tooling" stripe="input">
          <div className="form-grid cols-2">
            <F label="Main Die"            val={t.mainDie}        onChange={v=>setTooling('mainDie',+v)} type="number"/>
            <F label="Cavities"            val={t.cavities}       onChange={v=>setTooling('cavities',v)}/>
            <F label="Setting Fix/Coining" val={t.settingFix}     onChange={v=>setTooling('settingFix',+v)} type="number"/>
            <F label="Riser & Feed Die"    val={t.riserFeedDie}   onChange={v=>setTooling('riserFeedDie',+v)} type="number"/>
            <F label="Ceramic Core Die"    val={t.ceramicCoreDie} onChange={v=>setTooling('ceramicCoreDie',+v)} type="number"/>
          </div>
          <div className="kpi" style={{marginTop:14,background:'var(--cell-formula)',borderColor:'transparent'}}>
            <div className="k-label">Die Total</div>
            <div className="k-val" style={{color:'var(--cell-formula-ink)'}}><span className="unit">₹</span>{window.fmtI(dieTot)}</div>
          </div>
        </SCard>
        <SCard title="Machining Tooling" stripe="input">
          <div className="form-grid cols-2">
            <F label="Machining Fixture" val={t.machiningFix}     onChange={v=>setTooling('machiningFix',+v)} type="number"/>
            <F label="Machining Gauges"  val={t.machiningGauges}  onChange={v=>setTooling('machiningGauges',+v)} type="number"/>
            <F label="Special Tooling"   val={t.specialTooling}   onChange={v=>setTooling('specialTooling',+v)} type="number"/>
          </div>
          <div className="kpi" style={{marginTop:14,background:'var(--cell-formula)',borderColor:'transparent'}}>
            <div className="k-label">Machining Total</div>
            <div className="k-val" style={{color:'var(--cell-formula-ink)'}}><span className="unit">₹</span>{window.fmtI(machTot)}</div>
          </div>
        </SCard>
      </div>
      <div className="kpi feature" style={{marginTop:16}}>
        <div className="k-label">Total Development Cost</div>
        <div className="k-val"><span className="unit">₹</span>{window.fmtI(dieTot+machTot)}</div>
        <div className="k-sub">die ₹{window.fmtI(dieTot)} + machining ₹{window.fmtI(machTot)}</div>
      </div>
    </>
  );
}
