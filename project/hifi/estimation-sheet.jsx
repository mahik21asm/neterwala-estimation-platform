// ===== UDL Hi-Fi · Estimation Sheet (the heart) =====

const { useState: useStateES } = React;

window.HiFiEstimation = function HiFiEstimation({ data, setData }) {
  const D = window.UDL_DATA;
  const c = window.UDL_ENGINE.compute(data);
  const fmt = window.fmtN, fmtI = window.fmtI, fmtP = window.fmtP;
  const se = data.salesEntry;
  const Icon = window.Icon;

  const [open, setOpen] = useStateES({ header:true, charge:true, yld:true, tests:false, cost:true, pf:true, mach:true, price:true, tool:false });
  const tg = k => setOpen({...open, [k]:!open[k]});

  function setRet(i,k,v){ const n=data.chargeReturn.slice(); n[i]={...n[i],[k]:v}; setData({...data,chargeReturn:n}); }
  function setVir(i,k,v){ const n=data.chargeVirgin.slice(); n[i]={...n[i],[k]:v}; setData({...data,chargeVirgin:n}); }
  function setPF(i,k,v){ const n=data.postFoundry.slice(); n[i]={...n[i],[k]:v}; setData({...data,postFoundry:n}); }
  function setMach(i,k,v){ const n=data.machining.slice(); n[i]={...n[i],[k]:v}; setData({...data,machining:n}); }
  const addPF=()=>setData({...data,postFoundry:[...data.postFoundry,{op:'',rate:0,ihos:'IH',cycle:'',uom:'NO'}]});
  const addMach=()=>setData({...data,machining:[...data.machining,{op:'',cycle:'',machine:'',amount:0,complexity:'',addon:0}]});

  const targetDelta = ((c.quotedWith[1] - se.targetPrice) / se.targetPrice * 100);
  const targetGood = c.quotedWith[1] <= se.targetPrice;

  return (
    <div>
      <div className="kpi-row">
        <div className="kpi feature">
          <div className="k-label">Quoted Sales Price · B 20%</div>
          <div className="k-val"><span className="unit">₹</span>{fmt(c.quotedWith[1])}</div>
          <div className="k-sub">{targetGood?<span className="k-trend up">↓ {Math.abs(targetDelta).toFixed(1)}%</span>:<span className="k-trend down">↑ {targetDelta.toFixed(1)}%</span>} vs target ₹{fmt(se.targetPrice)}</div>
        </div>
        <div className="kpi">
          <div className="k-label">Yield %</div>
          <div className="k-val">{fmtP(c.yieldPct,1)}</div>
          <div className="k-sub">mould wt {fmt(c.mouldWtMetal)} kg</div>
        </div>
        <div className="kpi">
          <div className="k-label">Charge Rate · {se.materialType}</div>
          <div className="k-val"><span className="unit">₹</span>{fmt(c.ret.rate)}</div>
          <div className="k-sub">return charge / kg</div>
        </div>
        <div className="kpi">
          <div className="k-label">Total Dev Cost</div>
          <div className="k-val"><span className="unit">₹</span>{fmtI(c.tooling.totalDevCost)}</div>
          <div className="k-sub">die + machining tooling</div>
        </div>
      </div>

      {targetGood
        ? <div className="insight ok"><Icon name="check" size={16}/><div className="body"><b>Quote within target.</b> Estimated price ₹{fmt(c.quotedWith[1])} is {Math.abs(targetDelta).toFixed(1)}% under the target ₹{fmt(se.targetPrice)} for the default scenario (B · 20% rejection · with riser credit).</div></div>
        : <div className="insight warn"><Icon name="info" size={16}/><div className="body"><b>Quote exceeds target by {targetDelta.toFixed(1)}%.</b> Consider reviewing scenario A (15% rej) or charge mix to bring down to ₹{fmt(se.targetPrice)}.</div></div>
      }

      <div className="legend">
        <span className="swatch"><span className="sw linked"/>Linked from Sales Entry</span>
        <span className="swatch"><span className="sw formula"/>Formula (auto-calculated)</span>
        <span className="swatch"><span className="sw input"/>Editable input</span>
      </div>

      <Sec title="Header — linked from Sales Entry" rows="4–17" stripe="linked" open={open.header} onTg={()=>tg('header')}>
        <div className="form-grid cols-4">
          {[['Item Code',se.itemCode],['Die Code',se.dieCode],['Plant',se.plant],['Date',se.date],
            ['Quotation',se.quotationNo],['Customer',se.customerName],['Geography',se.domExp],['Supply',se.supplyCondition],
            ['Material Type',se.materialType],['Material',se.material],['Drw No',se.drwNo],['Batch Qty',fmtI(se.batchQty)],
            ['Heat Treatment',se.heatTreatment],['Surface',se.surfaceTreatment],['Inspection',se.inspection],['UOM',se.uom]
          ].map(([l,v])=>(
            <div key={l} className="field">
              <span className="field-label">{l} <span className="pill linked">linked</span></span>
              <div className="input linked">{v ?? '—'}</div>
            </div>
          ))}
        </div>
        <h4 style={{margin:'18px 0 8px',fontSize:13,fontWeight:600}}>Composition</h4>
        <div className="table-wrap">
          <table className="dtable">
            <thead><tr><th></th>{D.dropdowns.composition.map(el=><th key={el} className="num">{el}</th>)}</tr></thead>
            <tbody>
              <tr><td className="label-cell">Min</td>{D.dropdowns.composition.map(el=><td key={el} className="linked num">{(+se.compMin[el]||0).toFixed(3)}</td>)}</tr>
              <tr><td className="label-cell">Max</td>{D.dropdowns.composition.map(el=><td key={el} className="linked num">{(+se.compMax[el]||0).toFixed(3)}</td>)}</tr>
              <tr><td className="label-cell">Avg</td>{D.dropdowns.composition.map(el=><td key={el} className="formula num">{c.compAvg[el].toFixed(3)}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </Sec>

      <Sec title="Charge Calculation" rows="18–33" stripe="input" open={open.charge} onTg={()=>tg('charge')}>
        <div className="two-col">
          <CTable title="Virgin Charge" rows={data.chargeVirgin} onChange={setVir} totals={c.virgin}/>
          <CTable title="Return Charge" rows={data.chargeReturn} onChange={setRet} totals={c.ret}/>
        </div>
        <h4 style={{margin:'18px 0 8px',fontSize:13,fontWeight:600}}>Return Calculation</h4>
        <div className="table-wrap">
          <table className="dtable">
            <thead><tr><th>Code</th><th>Return Alloy Description</th><th className="num">Ret Alloy Rate</th><th className="num">Charge Rate</th><th className="num">Rate To Be Considered</th></tr></thead>
            <tbody>
              <tr>
                <td className="input"><input value="—" readOnly/></td>
                <td className="input"><input value="—" readOnly/></td>
                <td className="input num"><input type="number" value={data.retAlloyRate||0} onChange={e=>setData({...data,retAlloyRate:+e.target.value})}/></td>
                <td className="formula num">{fmt(c.ret.rate)}</td>
                <td className="formula num" style={{fontWeight:600}}>{fmt(c.rateToConsider)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Sec>

      <Sec title="Yield & Mould Calculations" rows="45–56" stripe="formula" open={open.yld} onTg={()=>tg('yld')}>
        <div className="two-col">
          <div className="table-wrap">
            <table className="dtable">
              <thead><tr><th>Property</th><th className="num">Wax</th><th className="num">Metal</th></tr></thead>
              <tbody>
                <tr><td className="label-cell">Specific Gravity</td><td className="formula num">{fmt(c.densityWax)}</td><td className="formula num">{fmt(c.densityMetal)}</td></tr>
                <tr><td className="label-cell">Component Wt (kg)</td><td className="formula num">{fmt(c.compWtWax,4)}</td><td className="linked num">{fmt(se.compMetalWt,3)}</td></tr>
                <tr><td className="label-cell">Feed Wt (kg)</td><td className="formula num">{fmt(c.feedWtWax,4)}</td><td className="linked num">{fmt(se.compWaxWt,3)}</td></tr>
                <tr><td className="label-cell">Riser Wt — {se.riserType}</td><td className="formula num">{fmt(c.riserWaxQty,3)}</td><td className="formula num">{fmt(c.riserWtFromTable,3)}</td></tr>
                <tr><td className="label-cell">Riser Metal (manual)</td><td className="muted num">—</td><td className="input num">{fmt(se.riserMetalWtManual,2)}</td></tr>
                <tr className="total"><td className="label-cell">Mould Wt</td><td className="formula num">{fmt(c.mouldWtWax,3)}</td><td className="formula num">{fmt(c.mouldWtMetal,3)}</td></tr>
                <tr className="total"><td className="label-cell">Yield %</td><td colSpan="2" className="formula num" style={{fontSize:14,fontWeight:600}}>{fmtP(c.yieldPct,2)}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="table-wrap">
            <table className="dtable">
              <thead><tr><th>Scenario</th><th className="num">Rej %</th><th className="num">Good / Mould</th><th className="num">Moulds Required</th></tr></thead>
              <tbody>
                {c.scenarios.map(s=>(
                  <tr key={s.id}>
                    <td className="label-cell"><span className="tag">{s.id}</span></td>
                    <td className="input num">{(s.rejPct*100).toFixed(0)}%</td>
                    <td className="formula num">{fmt(s.goodPerMould,2)}</td>
                    <td className="formula num">{fmtI(s.mouldsReq)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Sec>

      <Sec title="Cost Build-Up per Mould" rows="70–87" stripe="formula" open={open.cost} onTg={()=>tg('cost')}>
        <div className="table-wrap">
          <table className="dtable">
            <thead><tr><th>Category</th><th>Item</th><th className="num">Qty</th><th className="num">Rate ₹</th><th className="num">With Riser Cr</th><th className="num">W/o Riser Cr</th></tr></thead>
            <tbody>
              <CR cat="Wax Cost" sub="Pattern Wax" qty={c.costRows.patternWax.qty} rate={c.costRows.patternWax.rate} v1={c.costRows.patternWax.value} v2={c.costRows.patternWax.value}/>
              <CR cat="" sub="Riser Wax" qty={c.costRows.riserWax.qty} rate={c.costRows.riserWax.rate} v1={c.costRows.riserWax.value} v2={c.costRows.riserWax.value}/>
              <CR cat="" sub="Water Sol Wax" qty={0} rate={c.costRows.waterSolWax.rate} v1={0} v2={0}/>
              <CR cat="" sub="Ceramic Core" qty={c.costRows.ceramicCore.qty} rate={c.costRows.ceramicCore.rate} v1={c.costRows.ceramicCore.value} v2={c.costRows.ceramicCore.value}/>
              <CR cat="Shell" sub="Shell Cost" qty={c.costRows.shell.qty} rate={c.costRows.shell.rate} v1={c.costRows.shell.value} v2={c.costRows.shell.value}/>
              <CR cat="Metal" sub="Mould Wt" qty={c.costRows.metal.qty} rate={c.costRows.metal.rate} v1={c.costRows.metal.valueWith} v2={c.costRows.metal.valueWithout}/>
              <CR cat="" sub="Return Credit" qty={c.costRows.returnCredit.qty} rate={c.costRows.returnCredit.rate} v1={-c.costRows.returnCredit.value} v2={0} note="(deducted in With RC)"/>
              <CR cat="Consumables" sub="" qty="" rate={c.costRows.consumables.rate} v1={c.costRows.consumables.value} v2={c.costRows.consumables.value}/>
              <CR cat="Heat Treatment" sub="" qty={c.costRows.ht.qty} rate={c.costRows.ht.rate} v1={c.costRows.ht.value} v2={c.costRows.ht.value}/>
              <CR cat="Power" sub="" qty="" rate={c.costRows.power.rate} v1={c.costRows.power.value} v2={c.costRows.power.value}/>
              <CR cat="Fuel" sub="" qty="" rate={c.costRows.fuel.rate} v1={c.costRows.fuel.value} v2={c.costRows.fuel.value}/>
              <CR cat="Labour" sub="" qty="" rate={c.costRows.labour.rate} v1={c.costRows.labour.value} v2={c.costRows.labour.value}/>
              <CR cat="Overhead" sub="" qty="" rate={c.costRows.overhead.rate} v1={c.costRows.overhead.value} v2={c.costRows.overhead.value}/>
              <CR cat="Leak Mould (1%)" sub="" qty="" rate="" v1={c.costRows.leakMould.withRC} v2={c.costRows.leakMould.withoutRC}/>
              <tr className="total">
                <td className="label-cell" colSpan="4">TOTAL MOULD COST</td>
                <td className="formula num" style={{fontWeight:700,fontSize:13}}>₹ {fmt(c.totalCostWithRC)}</td>
                <td className="formula num" style={{fontWeight:700,fontSize:13}}>₹ {fmt(c.totalCostWithoutRC)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Sec>

      <Sec title="Post-Foundry Operations" rows="89–110" stripe="input" open={open.pf} onTg={()=>tg('pf')}>
        <div className="table-wrap">
          <table className="dtable">
            <thead><tr><th>Operation</th><th className="num">Rate</th><th>IH/OS</th><th>UOM</th><th className="num">Per Casting</th><th></th></tr></thead>
            <tbody>
              {data.postFoundry.map((r,i)=>(
                <tr key={i}>
                  <td className="input"><select value={r.op} onChange={e=>setPF(i,'op',e.target.value)}><option value=""></option>{D.dropdowns.postFoundryOps.map(o=><option key={o}>{o}</option>)}</select></td>
                  <td className="input num"><input type="number" value={r.rate||0} onChange={e=>setPF(i,'rate',+e.target.value)}/></td>
                  <td className="input"><select value={r.ihos} onChange={e=>setPF(i,'ihos',e.target.value)}><option>IH</option><option>OS</option></select></td>
                  <td className="input"><select value={r.uom} onChange={e=>setPF(i,'uom',e.target.value)}><option>NO</option><option>MD</option><option>KG</option></select></td>
                  <td className="formula num">{fmt(c.pfRows[i]?.perCast||0)}</td>
                  <td><button className="btn ghost sm" style={{padding:'2px 6px'}}><Icon name="x" size={12}/></button></td>
                </tr>
              ))}
              <tr className="total"><td className="label-cell" colSpan="4">PF Sub-Total per casting</td><td className="formula num" style={{fontWeight:700}}>₹ {fmt(c.pfTotal)}</td><td></td></tr>
            </tbody>
          </table>
        </div>
        <button className="btn sm ghost" style={{marginTop:10}} onClick={addPF}><Icon name="plus" size={12}/> Add operation</button>

        <h4 style={{margin:'20px 0 8px',fontSize:13,fontWeight:600}}>RC Casting Cost & As Cast (per scenario)</h4>
        <div className="table-wrap">
          <table className="dtable">
            <thead>
              <tr><th></th><th colSpan="3" style={{textAlign:'center',borderLeft:'1px solid #e4e4e7'}}>WITH RISER CR</th><th colSpan="3" style={{textAlign:'center',borderLeft:'1px solid #e4e4e7'}}>WITHOUT RISER CR</th></tr>
              <tr><th></th><th className="num">A 15%</th><th className="num">B 20%</th><th className="num">C 25%</th><th className="num">A 15%</th><th className="num">B 20%</th><th className="num">C 25%</th></tr>
            </thead>
            <tbody>
              <tr><td className="label-cell">RC Casting Cost</td>{c.rcPerScenarioWith.map((v,i)=><td key={i} className="formula num">{fmt(v)}</td>)}{c.rcPerScenarioWithout.map((v,i)=><td key={i} className="formula num">{fmt(v)}</td>)}</tr>
              <tr className="total"><td className="label-cell">As Cast Cost</td>{c.asCastWith.map((v,i)=><td key={i} className="formula num">{fmt(v)}</td>)}{c.asCastWithout.map((v,i)=><td key={i} className="formula num">{fmt(v)}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </Sec>

      <Sec title="Machining Operations" rows="112–130" stripe="input" open={open.mach} onTg={()=>tg('mach')}>
        <div className="table-wrap scroll-x">
          <table className="dtable">
            <thead><tr><th>Operation</th><th className="num">Cycle (min)</th><th>Machine</th><th>Type</th><th className="num">Rate/Hr</th><th className="num">Amount</th><th className="num">Cmplx</th><th className="num">Addon ₹</th><th className="num">Total</th></tr></thead>
            <tbody>
              {data.machining.map((r,i)=>{
                const cm=c.machRows[i];
                return (
                  <tr key={i}>
                    <td className="input"><select value={r.op} onChange={e=>setMach(i,'op',e.target.value)}><option value=""></option>{D.dropdowns.machiningOps.map(o=><option key={o}>{o}</option>)}</select></td>
                    <td className="input num"><input type="number" value={r.cycle||''} onChange={e=>setMach(i,'cycle',+e.target.value)}/></td>
                    <td className="input"><select value={r.machine} onChange={e=>setMach(i,'machine',e.target.value)}><option value=""></option>{D.dropdowns.machineType.map(o=><option key={o}>{o}</option>)}</select></td>
                    <td className="formula"><span className="mono">{cm?.machineType||'—'}</span></td>
                    <td className="formula num">{fmtI(cm?.ratePerHr||0)}</td>
                    <td className="formula num">{fmt(cm?.amount||0)}</td>
                    <td className="input num"><input type="number" step="0.1" value={r.complexity||''} onChange={e=>setMach(i,'complexity',+e.target.value)}/></td>
                    <td className="input num"><input type="number" value={r.addon||0} onChange={e=>setMach(i,'addon',+e.target.value)}/></td>
                    <td className="formula num" style={{fontWeight:600}}>₹ {fmt(cm?.total||0)}</td>
                  </tr>
                );
              })}
              <tr className="total"><td className="label-cell" colSpan="8">Total Machining Cost</td><td className="formula num" style={{fontWeight:700}}>₹ {fmt(c.machTotal)}</td></tr>
            </tbody>
          </table>
        </div>
        <button className="btn sm ghost" style={{marginTop:10}} onClick={addMach}><Icon name="plus" size={12}/> Add operation</button>
      </Sec>

      <Sec title="Final Pricing — 6-column matrix" rows="131–141" stripe="formula" open={open.price} onTg={()=>tg('price')}>
        <div className="price-matrix">
          <div className="pm-row head">
            <div className="pm-label"></div>
            <div className="group">With Riser Credit</div>
            <div className="group">Without Riser Credit</div>
          </div>
          <div className="pm-row head sub">
            <div className="pm-label"></div>
            <div className="pm-cell">A · 15%</div><div className="pm-cell">B · 20%</div><div className="pm-cell">C · 25%</div>
            <div className="pm-cell">A · 15%</div><div className="pm-cell">B · 20%</div><div className="pm-cell">C · 25%</div>
          </div>
          <PR label="Machining Charges" w={c.machChargesWith} wo={c.machChargesWithout}/>
          <PR label="Finished Casting Cost" w={c.finishedWith} wo={c.finishedWithout}/>
          <PR label="Margin" w={c.marginWith} wo={c.marginWithout}/>
          <PR label="Ex Price ₹/Pc" w={c.exPriceWith} wo={c.exPriceWithout} bold/>
          <PR label={`Ex Price ${se.currency}/Pc`} w={c.exForeignWith} wo={c.exForeignWithout}/>
          <PR label="Ex Work Rate ₹/kg" w={c.perKgWith} wo={c.perKgWithout}/>
          <PR label="QUOTED SALES PRICE ₹" w={c.quotedWith} wo={c.quotedWithout} highlight focusIdx={1}/>
        </div>
        <p className="muted" style={{fontSize:11.5,marginTop:12,fontFamily:'var(--font-mono)'}}>↑ Six pricing scenarios. Highlighted column (B · 20% rej · with RC) is the default quote.</p>
      </Sec>

      <Sec title="Tooling & Development Summary" rows="148–155" stripe="linked" open={open.tool} onTg={()=>tg('tool')}>
        <div className="three-col">
          <div className="kpi"><div className="k-label">Die Total</div><div className="k-val"><span className="unit">₹</span>{fmtI(c.tooling.dieTotal)}</div><div className="k-sub">main + setting + riser + ceramic</div></div>
          <div className="kpi"><div className="k-label">Machining Tooling</div><div className="k-val"><span className="unit">₹</span>{fmtI(c.tooling.machTooling)}</div><div className="k-sub">fixture + gauges + special</div></div>
          <div className="kpi feature"><div className="k-label">Total Dev Cost</div><div className="k-val"><span className="unit">₹</span>{fmtI(c.tooling.totalDevCost)}</div></div>
        </div>
      </Sec>

      <div style={{display:'flex',gap:8,marginTop:24,paddingTop:20,borderTop:'1px solid #e4e4e7'}}>
        <button className="btn ghost"><Icon name="copy" size={14}/> Clone</button>
        <button className="btn ghost"><Icon name="history" size={14}/> History</button>
        <span className="spacer"/>
        <button className="btn"><Icon name="pdf" size={14}/> PDF Quote</button>
        <button className="btn"><Icon name="sheet" size={14}/> Excel</button>
        <button className="btn brand"><Icon name="check" size={14}/> Submit Quotation</button>
      </div>
    </div>
  );
};

function Sec({ title, rows, stripe, open, onTg, children }) {
  return (
    <div className={`card ${open?'':'collapsed'}`}>
      <div className="card-head collapsible" onClick={onTg}>
        <span className={`cell-stripe ${stripe||''}`}/>
        <h3>{title}</h3>
        <span className="section-row-num">rows {rows}</span>
        <window.Icon name={open?'chevron-down':'chevron-right'} size={14}/>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function CTable({ title, rows, onChange, totals }) {
  const fmt = window.fmtN;
  return (
    <div>
      <h4 style={{margin:'0 0 8px',fontSize:13,fontWeight:600}}>{title}</h4>
      <div className="table-wrap">
        <table className="dtable">
          <thead><tr><th style={{width:32}}>#</th><th>Code</th><th>Metal</th><th className="num">Rate</th><th className="num">Qty</th><th className="num">Value</th></tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td className="muted mono" style={{fontSize:11}}>{i+1}</td>
                <td className="input"><input value={r.code||''} onChange={e=>onChange(i,'code',e.target.value)}/></td>
                <td className="input"><input value={r.metal||''} onChange={e=>onChange(i,'metal',e.target.value)}/></td>
                <td className="input num"><input type="number" value={r.rate||0} onChange={e=>onChange(i,'rate',+e.target.value)}/></td>
                <td className="input num"><input type="number" step="0.01" value={r.qty||0} onChange={e=>onChange(i,'qty',+e.target.value)}/></td>
                <td className="formula num">{fmt((+r.rate||0)*(+r.qty||0))}</td>
              </tr>
            ))}
            <tr className="total">
              <td colSpan="3" className="label-cell">Charge Rate</td>
              <td className="formula num" style={{fontWeight:700}}>{fmt(totals.rate)}</td>
              <td className="formula num">{fmt(totals.sumQty)}</td>
              <td className="formula num">{fmt(totals.sumVal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CR({ cat, sub, qty, rate, v1, v2, note }) {
  const fmt = window.fmtN;
  return (
    <tr>
      <td className="label-cell" style={{color:cat?'#18181b':'transparent'}}>{cat||'·'}</td>
      <td>{sub}{note && <span className="muted" style={{fontSize:10.5,marginLeft:6,fontFamily:'var(--font-mono)'}}>{note}</span>}</td>
      <td className="formula num">{qty===''?'':fmt(qty,3)}</td>
      <td className="formula num">{rate===''?'':fmt(rate,2)}</td>
      <td className="formula num">{v1<0?'(':''}{fmt(Math.abs(v1))}{v1<0?')':''}</td>
      <td className="formula num">{fmt(v2)}</td>
    </tr>
  );
}

function PR({ label, w, wo, bold, highlight, focusIdx }) {
  const fmt = window.fmtN;
  return (
    <div className={`pm-row ${bold?'bold':''} ${highlight?'highlight':''}`}>
      <div className="pm-label">{label}</div>
      {w.map((v,i)=><div key={'w'+i} className={`pm-cell ${highlight && focusIdx===i?'focus':''}`}>{fmt(v)}</div>)}
      {wo.map((v,i)=><div key={'o'+i} className="pm-cell">{fmt(v)}</div>)}
    </div>
  );
}
