// ===== UDL Product Costing — Estimation Sheet view =====
// Sectioned (collapsible) form mirroring the Excel Estimation Sheet
// All cells color-coded: GREEN=linked, BLUE=formula, YELLOW=editable

const { useState: useStateE } = React;

window.EstimationSheet = function EstimationSheet({ data, setData }) {
  const D = window.UDL_DATA;
  const computed = window.UDL_ENGINE.compute(data);
  const fmt = window.UDL_ENGINE.fmt;
  const fmtInt = window.UDL_ENGINE.fmtInt;
  const fmtPct = window.UDL_ENGINE.fmtPct;
  const se = data.salesEntry;

  const [open, setOpen] = useStateE({
    header: true, charge: true, yield: true, tests: true,
    cost: true, postFoundry: true, machining: true, pricing: true, tooling: true,
  });
  const toggle = k => setOpen({ ...open, [k]: !open[k] });

  // helpers to mutate child arrays
  function setReturn(idx, key, val) {
    const next = data.chargeReturn.slice();
    next[idx] = { ...next[idx], [key]: val };
    setData({ ...data, chargeReturn: next });
  }
  function setVirgin(idx, key, val) {
    const next = data.chargeVirgin.slice();
    next[idx] = { ...next[idx], [key]: val };
    setData({ ...data, chargeVirgin: next });
  }
  function setPF(idx, key, val) {
    const next = data.postFoundry.slice();
    next[idx] = { ...next[idx], [key]: val };
    setData({ ...data, postFoundry: next });
  }
  function setMach(idx, key, val) {
    const next = data.machining.slice();
    next[idx] = { ...next[idx], [key]: val };
    setData({ ...data, machining: next });
  }
  function addPF() { setData({ ...data, postFoundry: [...data.postFoundry, {op:'',rate:0,ihos:'IH',cycle:'',uom:'NO'}] }); }
  function addMach() { setData({ ...data, machining: [...data.machining, {op:'',cycle:'',machine:'',amount:0,complexity:'',addon:0}] }); }

  return (
    <div>
      {/* ===== KPI summary ===== */}
      <div className="kpi-row">
        <div className="kpi info">
          <div className="k-label">Yield %</div>
          <div className="k-val">{fmtPct(computed.yieldPct)}</div>
          <div className="k-sub">Mould Wt: {fmt(computed.mouldWtMetal)} kg</div>
        </div>
        <div className="kpi">
          <div className="k-label">Charge Rate (Return)</div>
          <div className="k-val">₹ {fmt(computed.ret.rate)}</div>
          <div className="k-sub">per kg · {se.materialType}</div>
        </div>
        <div className="kpi accent">
          <div className="k-label">Quoted Sales Price (B · 20% rej · with RC)</div>
          <div className="k-val">₹ {fmt(computed.quotedWith[1])}</div>
          <div className="k-sub">vs target ₹{fmt(se.targetPrice)}</div>
        </div>
        <div className="kpi ok">
          <div className="k-label">Total Dev Cost</div>
          <div className="k-val">₹ {fmtInt(computed.tooling.totalDevCost)}</div>
          <div className="k-sub">die + machining</div>
        </div>
      </div>

      <div className="legend">
        <span className="swatch"><span className="sw green"></span>Linked from Sales Entry</span>
        <span className="swatch"><span className="sw blue"></span>Formula (auto-calculated)</span>
        <span className="swatch"><span className="sw yellow"></span>Editable input</span>
        <span className="swatch"><span className="sw white"></span>Label</span>
      </div>

      {/* ===== HEADER (linked) ===== */}
      <Section title="Header — linked from Sales Entry" open={open.header} onToggle={()=>toggle('header')} tag="green" tagText="GREEN · linked">
        <div className="form-grid cols-4">
          <KV label="Item Code" v={se.itemCode} cls="green"/>
          <KV label="Die Code" v={se.dieCode} cls="green"/>
          <KV label="Plant" v={se.plant} cls="green"/>
          <KV label="Date" v={se.date} cls="green"/>
          <KV label="Quotation" v={se.quotationNo} cls="green"/>
          <KV label="Customer" v={se.customerName} cls="green"/>
          <KV label="Customer Type" v={se.customerType} cls="green"/>
          <KV label="Dom/Exp" v={se.domExp} cls="green"/>
          <KV label="Supply" v={se.supplyCondition} cls="green"/>
          <KV label="Material Type" v={se.materialType} cls="green"/>
          <KV label="Material" v={se.material} cls="green"/>
          <KV label="Drw No" v={se.drwNo} cls="green"/>
          <KV label="UOM" v={se.uom} cls="green"/>
          <KV label="Batch Qty" v={fmtInt(se.batchQty)} cls="green"/>
          <KV label="Heat Treatment" v={se.heatTreatment} cls="green"/>
          <KV label="Surface" v={se.surfaceTreatment} cls="green"/>
        </div>

        <h4 style={{marginTop:14, fontFamily:'var(--font-hand-bold)'}}>Composition (avg auto)</h4>
        <table className="xtable">
          <thead><tr><th></th>{D.dropdowns.composition.map(el=><th key={el} className="num">{el}</th>)}</tr></thead>
          <tbody>
            <tr><td className="label">Min</td>{D.dropdowns.composition.map(el=><td key={el} className="green num">{(+se.compMin[el]||0).toFixed(3)}</td>)}</tr>
            <tr><td className="label">Max</td>{D.dropdowns.composition.map(el=><td key={el} className="green num">{(+se.compMax[el]||0).toFixed(3)}</td>)}</tr>
            <tr><td className="label">Avg</td>{D.dropdowns.composition.map(el=><td key={el} className="blue num">{computed.compAvg[el].toFixed(3)}</td>)}</tr>
          </tbody>
        </table>
      </Section>

      {/* ===== CHARGE CALCULATION ===== */}
      <Section title="Charge Calculation (Rows 18–33)" open={open.charge} onToggle={()=>toggle('charge')} tag="yellow" tagText="YELLOW · editable">
        <div className="two-col">
          <ChargeTable title="Virgin Charge" rows={data.chargeVirgin} onChange={setVirgin} totalRate={computed.virgin.rate} totalQty={computed.virgin.sumQty} totalVal={computed.virgin.sumVal} />
          <ChargeTable title="Return Charge" rows={data.chargeReturn} onChange={setReturn} totalRate={computed.ret.rate} totalQty={computed.ret.sumQty} totalVal={computed.ret.sumVal} />
        </div>
        <h4 style={{marginTop:14, fontFamily:'var(--font-hand-bold)'}}>Return Calculation</h4>
        <table className="xtable">
          <thead><tr><th>Return Code</th><th>Return Alloy Description</th><th className="num">Ret Alloy Rate</th><th className="num">Charge Rate</th><th className="num">Rate To Be Considered</th></tr></thead>
          <tbody>
            <tr>
              <td className="yellow">—</td>
              <td className="yellow">—</td>
              <td className="yellow num">{fmt(data.retAlloyRate || 0)}</td>
              <td className="blue num">{fmt(computed.ret.rate)}</td>
              <td className="blue num">{fmt(computed.rateToConsider)}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ===== YIELD & MOULD ===== */}
      <Section title="Yield & Mould Calculations (Rows 45–56)" open={open.yield} onToggle={()=>toggle('yield')} tag="blue" tagText="BLUE · formula">
        <table className="xtable">
          <thead><tr><th></th><th className="num">Wax</th><th className="num">Metal</th></tr></thead>
          <tbody>
            <tr><td className="label">Specific Gravity</td><td className="blue num">{fmt(computed.densityWax,2)}</td><td className="blue num">{fmt(computed.densityMetal,2)}</td></tr>
            <tr><td className="label">Component Wt (kg)</td><td className="blue num">{fmt(computed.compWtWax,4)}</td><td className="green num">{fmt(se.compMetalWt,3)}</td></tr>
            <tr><td className="label">Feed Wt (kg)</td><td className="blue num">{fmt(computed.feedWtWax,4)}</td><td className="green num">{fmt(se.compWaxWt,3)}</td></tr>
            <tr><td className="label">Riser Wt (lookup) — {se.riserType}</td><td className="blue num">{fmt(computed.riserWaxQty,3)}</td><td className="blue num">{fmt(computed.riserWtFromTable,3)}</td></tr>
            <tr><td className="label">Riser Metal Wt (manual override)</td><td>—</td><td className="yellow num">{fmt(se.riserMetalWtManual,2)}</td></tr>
            <tr className="total"><td className="label">Mould Wt (kg)</td><td className="blue num">{fmt(computed.mouldWtWax,3)}</td><td className="blue num">{fmt(computed.mouldWtMetal,3)}</td></tr>
            <tr className="total"><td className="label">Yield %</td><td colSpan="2" className="blue num">{fmtPct(computed.yieldPct,2)}</td></tr>
          </tbody>
        </table>

        <h4 style={{marginTop:14, fontFamily:'var(--font-hand-bold)'}}>Rejection Scenarios</h4>
        <table className="xtable">
          <thead><tr><th>Scenario</th><th className="num">Rej %</th><th className="num">Good Castings / Mould</th><th className="num">Moulds Required</th></tr></thead>
          <tbody>
            {computed.scenarios.map(s=>(
              <tr key={s.id}>
                <td className="label">{s.id}</td>
                <td className="yellow num">{(s.rejPct*100).toFixed(0)}%</td>
                <td className="blue num">{fmt(s.goodPerMould,2)}</td>
                <td className="blue num">{fmtInt(s.mouldsReq)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ===== TESTING ===== */}
      <Section title="Testing Charges (Rows 58–68)" open={open.tests} onToggle={()=>toggle('tests')} tag="yellow" tagText="YELLOW · editable">
        <table className="xtable">
          <thead><tr><th>Test</th><th>Applicable</th><th className="num">Sample %</th><th className="num">Bulk %</th><th className="num">Rate ₹</th><th className="num">Amount / PC</th><th>Remark</th></tr></thead>
          <tbody>
            {D.tests.map(t => {
              const a = data.tests?.[t] || {};
              return (
                <tr key={t}>
                  <td className="label">{t}</td>
                  <td className="yellow"><select value={a.appl||'No'} onChange={e=>{const next={...data.tests,[t]:{...a,appl:e.target.value}};setData({...data,tests:next});}}><option>Yes</option><option>No</option></select></td>
                  <td className="yellow num">{a.sample ?? ''}</td>
                  <td className="yellow num">{a.bulk ?? ''}</td>
                  <td className="yellow num">{a.rate ?? 0}</td>
                  <td className="blue num">0.00</td>
                  <td className="yellow">—</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      {/* ===== COST BUILD-UP ===== */}
      <Section title="Cost Build-Up per Mould (Rows 70–87)" open={open.cost} onToggle={()=>toggle('cost')} tag="blue" tagText="BLUE · all formulas">
        <table className="xtable">
          <thead><tr><th></th><th></th><th className="num">Weight</th><th className="num">Rate</th><th className="num">Value With Riser Cr</th><th className="num">Value W/o Riser Cr</th></tr></thead>
          <tbody>
            <CostRow label="Wax Cost" sub="Pattern Wax" qty={computed.costRows.patternWax.qty} rate={computed.costRows.patternWax.rate} v1={computed.costRows.patternWax.value} v2={computed.costRows.patternWax.value} />
            <CostRow label="" sub="Riser Wax" qty={computed.costRows.riserWax.qty} rate={computed.costRows.riserWax.rate} v1={computed.costRows.riserWax.value} v2={computed.costRows.riserWax.value} />
            <CostRow label="" sub="Water Sol Wax" qty={0} rate={computed.costRows.waterSolWax.rate} v1={0} v2={0} />
            <CostRow label="" sub="Ceramic Core" qty={computed.costRows.ceramicCore.qty} rate={computed.costRows.ceramicCore.rate} v1={computed.costRows.ceramicCore.value} v2={computed.costRows.ceramicCore.value} />
            <CostRow label="Shell" sub="Shell Cost" qty={computed.costRows.shell.qty} rate={computed.costRows.shell.rate} v1={computed.costRows.shell.value} v2={computed.costRows.shell.value} />
            <CostRow label="Metal Cost" sub="Mould Wt" qty={computed.costRows.metal.qty} rate={computed.costRows.metal.rate} v1={computed.costRows.metal.valueWith} v2={computed.costRows.metal.valueWithout} note="metal cost (gross)" />
            <CostRow label="" sub="Return Credit" qty={computed.costRows.returnCredit.qty} rate={computed.costRows.returnCredit.rate} v1={-computed.costRows.returnCredit.value} v2={0} note="(deducted in With RC)" />
            <CostRow label="Consumables" sub="" qty="" rate={computed.costRows.consumables.rate} v1={computed.costRows.consumables.value} v2={computed.costRows.consumables.value} />
            <CostRow label="Heat Treatment" sub="" qty={computed.costRows.ht.qty} rate={computed.costRows.ht.rate} v1={computed.costRows.ht.value} v2={computed.costRows.ht.value} />
            <CostRow label="Power" sub="" qty="" rate={computed.costRows.power.rate} v1={computed.costRows.power.value} v2={computed.costRows.power.value} />
            <CostRow label="Fuel" sub="" qty="" rate={computed.costRows.fuel.rate} v1={computed.costRows.fuel.value} v2={computed.costRows.fuel.value} />
            <CostRow label="Labour" sub="" qty="" rate={computed.costRows.labour.rate} v1={computed.costRows.labour.value} v2={computed.costRows.labour.value} />
            <CostRow label="Overhead" sub="" qty="" rate={computed.costRows.overhead.rate} v1={computed.costRows.overhead.value} v2={computed.costRows.overhead.value} />
            <CostRow label="Leak Mould (1%)" sub="" qty="" rate="" v1={computed.costRows.leakMould.withRC} v2={computed.costRows.leakMould.withoutRC} />
            <tr className="total"><td colSpan="4" className="label">TOTAL MOULD COST</td><td className="blue num">₹ {fmt(computed.totalCostWithRC)}</td><td className="blue num">₹ {fmt(computed.totalCostWithoutRC)}</td></tr>
          </tbody>
        </table>
      </Section>

      {/* ===== POST-FOUNDRY ===== */}
      <Section title="Post-Foundry Operations (Rows 89–110)" open={open.postFoundry} onToggle={()=>toggle('postFoundry')} tag="yellow" tagText="YELLOW + BLUE">
        <table className="xtable">
          <thead><tr><th>Operation</th><th className="num">Rate</th><th>IH/OS</th><th className="num">UOM</th><th className="num">Per Casting</th></tr></thead>
          <tbody>
            {data.postFoundry.map((r,i)=>(
              <tr key={i}>
                <td className="yellow"><select value={r.op} onChange={e=>setPF(i,'op',e.target.value)}><option value=""></option>{D.dropdowns.postFoundryOps.map(o=><option key={o}>{o}</option>)}</select></td>
                <td className="yellow num"><input type="number" value={r.rate||0} onChange={e=>setPF(i,'rate',+e.target.value)} /></td>
                <td className="yellow"><select value={r.ihos} onChange={e=>setPF(i,'ihos',e.target.value)}><option>IH</option><option>OS</option></select></td>
                <td className="yellow"><select value={r.uom} onChange={e=>setPF(i,'uom',e.target.value)}><option>NO</option><option>MD</option><option>KG</option></select></td>
                <td className="blue num">₹ {fmt(computed.pfRows[i]?.perCast || 0)}</td>
              </tr>
            ))}
            <tr className="total"><td colSpan="4" className="label">PF Sub-Total per casting</td><td className="blue num">₹ {fmt(computed.pfTotal)}</td></tr>
          </tbody>
        </table>
        <button className="btn sm ghost" style={{marginTop:8}} onClick={addPF}>+ Add operation</button>

        <h4 style={{marginTop:14, fontFamily:'var(--font-hand-bold)'}}>RC Casting Cost & As Cast (per scenario)</h4>
        <table className="xtable">
          <thead><tr><th></th><th colSpan="3">With Riser Cr</th><th colSpan="3">Without Riser Cr</th></tr>
            <tr><th>Row</th><th className="num">A 15%</th><th className="num">B 20%</th><th className="num">C 25%</th><th className="num">A 15%</th><th className="num">B 20%</th><th className="num">C 25%</th></tr>
          </thead>
          <tbody>
            <tr><td className="label">RC Casting Cost</td>{computed.rcPerScenarioWith.map((v,i)=><td key={i} className="blue num">{fmt(v)}</td>)}{computed.rcPerScenarioWithout.map((v,i)=><td key={i} className="blue num">{fmt(v)}</td>)}</tr>
            <tr className="total"><td className="label">As Cast Cost</td>{computed.asCastWith.map((v,i)=><td key={i} className="blue num">{fmt(v)}</td>)}{computed.asCastWithout.map((v,i)=><td key={i} className="blue num">{fmt(v)}</td>)}</tr>
          </tbody>
        </table>
      </Section>

      {/* ===== MACHINING ===== */}
      <Section title="Machining Operations (Rows 112–130)" open={open.machining} onToggle={()=>toggle('machining')} tag="yellow" tagText="YELLOW + BLUE">
        <table className="xtable">
          <thead><tr><th>Operation</th><th className="num">Cycle (min)</th><th>Machine</th><th className="num">Type</th><th className="num">Rate/Hr</th><th className="num">Amount</th><th className="num">Cmplx Factor</th><th className="num">Addon ₹</th><th className="num">Total</th></tr></thead>
          <tbody>
            {data.machining.map((r,i)=>{
              const c = computed.machRows[i];
              return (
                <tr key={i}>
                  <td className="yellow"><select value={r.op} onChange={e=>setMach(i,'op',e.target.value)}><option value=""></option>{D.dropdowns.machiningOps.map(o=><option key={o}>{o}</option>)}</select></td>
                  <td className="yellow num"><input type="number" value={r.cycle||''} onChange={e=>setMach(i,'cycle',+e.target.value)} /></td>
                  <td className="yellow"><select value={r.machine} onChange={e=>setMach(i,'machine',e.target.value)}><option value=""></option>{D.dropdowns.machineType.map(o=><option key={o}>{o}</option>)}</select></td>
                  <td className="blue num">{c?.machineType||''}</td>
                  <td className="blue num">{fmtInt(c?.ratePerHr||0)}</td>
                  <td className="blue num">{fmt(c?.amount||0)}</td>
                  <td className="yellow num"><input type="number" step="0.1" value={r.complexity||''} onChange={e=>setMach(i,'complexity',+e.target.value)} /></td>
                  <td className="yellow num"><input type="number" value={r.addon||0} onChange={e=>setMach(i,'addon',+e.target.value)} /></td>
                  <td className="blue num">₹ {fmt(c?.total||0)}</td>
                </tr>
              );
            })}
            <tr className="total"><td colSpan="8" className="label">Total Machining Cost</td><td className="blue num">₹ {fmt(computed.machTotal)}</td></tr>
          </tbody>
        </table>
        <button className="btn sm ghost" style={{marginTop:8}} onClick={addMach}>+ Add operation</button>
      </Section>

      {/* ===== FINAL PRICING ===== */}
      <Section title="Final Pricing — 6 columns (Rows 131–141)" open={open.pricing} onToggle={()=>toggle('pricing')} tag="blue" tagText="BLUE · all formulas">
        <table className="xtable">
          <thead>
            <tr><th></th><th colSpan="3" className="label">With Riser Cr</th><th colSpan="3" className="label">Without Riser Cr</th></tr>
            <tr><th></th><th className="num">A 15%</th><th className="num">B 20%</th><th className="num">C 25%</th><th className="num">A 15%</th><th className="num">B 20%</th><th className="num">C 25%</th></tr>
          </thead>
          <tbody>
            <PriceRow label="Machining Charges" w={computed.machChargesWith} wo={computed.machChargesWithout} />
            <PriceRow label="Finished Casting Cost" w={computed.finishedWith} wo={computed.finishedWithout} />
            <PriceRow label="Add Margin" w={computed.marginWith} wo={computed.marginWithout} />
            <PriceRow label="Ex Price / Pc (₹)" w={computed.exPriceWith} wo={computed.exPriceWithout} bold />
            <PriceRow label={`Ex Price / Pc (${se.currency})`} w={computed.exForeignWith} wo={computed.exForeignWithout} />
            <PriceRow label="Ex Work Rate / kg" w={computed.perKgWith} wo={computed.perKgWithout} />
            <PriceRow label="QUOTED SALES PRICE ₹" w={computed.quotedWith} wo={computed.quotedWithout} bold highlight />
          </tbody>
        </table>
        <div className="sketch-note" style={{marginTop:10}}>↑ The 6-column matrix matches Excel rows 131–141 exactly. Pick any cell for the customer quote.</div>
      </Section>

      {/* ===== TOOLING SUMMARY ===== */}
      <Section title="Tooling & Development Summary (Rows 148–155)" open={open.tooling} onToggle={()=>toggle('tooling')} tag="green" tagText="GREEN · linked from Sales Entry">
        <div className="three-col">
          <div className="kpi info"><div className="k-label">Die Total</div><div className="k-val">₹ {fmtInt(computed.tooling.dieTotal)}</div><div className="k-sub">main + setting + riser + ceramic</div></div>
          <div className="kpi info"><div className="k-label">Machining Tooling</div><div className="k-val">₹ {fmtInt(computed.tooling.machTooling)}</div><div className="k-sub">fixture + gauges + special</div></div>
          <div className="kpi accent"><div className="k-label">Total Dev Cost</div><div className="k-val">₹ {fmtInt(computed.tooling.totalDevCost)}</div></div>
        </div>
      </Section>
    </div>
  );
};

function Section({ title, open, onToggle, children, tag, tagText }) {
  return (
    <div className={`card ${open?'':'collapsed'}`}>
      <div className="card-head" onClick={onToggle}>
        <h3>{title}</h3>
        {tag && <span className={`tag ${tag}`}>{tagText}</span>}
        <span className="chev">{open?'▼':'▶'}</span>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function KV({ label, v, cls }) {
  return (<div className="field"><label>{label}</label>
    <div className={`xtable`} style={{display:'inline-block'}}>
      <div style={{padding:'4px 8px',border:'1px solid var(--ink)',borderRadius:4}} className={cls}>{v ?? '—'}</div>
    </div></div>);
}

function ChargeTable({ title, rows, onChange, totalRate, totalQty, totalVal }) {
  const fmt = window.UDL_ENGINE.fmt;
  return (
    <div>
      <h4 style={{margin:'0 0 6px',fontFamily:'var(--font-hand-bold)'}}>{title}</h4>
      <table className="xtable">
        <thead><tr><th>#</th><th>Code</th><th>Metal</th><th className="num">Rate</th><th className="num">Qty</th><th className="num">Value</th></tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              <td className="label">{i+1}</td>
              <td className="yellow"><input value={r.code||''} onChange={e=>onChange(i,'code',e.target.value)} /></td>
              <td className="yellow"><input value={r.metal||''} onChange={e=>onChange(i,'metal',e.target.value)} /></td>
              <td className="yellow num"><input type="number" value={r.rate||0} onChange={e=>onChange(i,'rate',+e.target.value)} /></td>
              <td className="yellow num"><input type="number" step="0.01" value={r.qty||0} onChange={e=>onChange(i,'qty',+e.target.value)} /></td>
              <td className="blue num">{fmt((+r.rate||0)*(+r.qty||0))}</td>
            </tr>
          ))}
          <tr className="total">
            <td colSpan="3" className="label">Charge Rate</td>
            <td className="blue num">{fmt(totalRate)}</td>
            <td className="blue num">{fmt(totalQty)}</td>
            <td className="blue num">{fmt(totalVal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CostRow({ label, sub, qty, rate, v1, v2, note }) {
  const fmt = window.UDL_ENGINE.fmt;
  return (
    <tr>
      <td className="label">{label}</td>
      <td>{sub}{note && <span style={{color:'#888',fontSize:11,marginLeft:6}}>{note}</span>}</td>
      <td className="blue num">{qty===''?'':fmt(qty,3)}</td>
      <td className="blue num">{rate===''?'':fmt(rate,2)}</td>
      <td className="blue num">{v1<0?'(':''}{fmt(Math.abs(v1))}{v1<0?')':''}</td>
      <td className="blue num">{fmt(v2)}</td>
    </tr>
  );
}

function PriceRow({ label, w, wo, bold, highlight }) {
  const fmt = window.UDL_ENGINE.fmt;
  return (
    <tr className={bold?'total':''} style={highlight?{background:'#fff59d'}:{}}>
      <td className="label">{label}</td>
      {w.map((v,i)=><td key={'w'+i} className="blue num">{fmt(v)}</td>)}
      {wo.map((v,i)=><td key={'o'+i} className="blue num">{fmt(v)}</td>)}
    </tr>
  );
}
