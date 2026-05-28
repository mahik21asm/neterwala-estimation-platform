// ===== UDL Hi-Fi · Master Data + Tooling/Tests/Export pages =====

const { useState: useStateMD } = React;

window.HiFiMasterData = function HiFiMasterData() {
  const D = window.UDL_DATA;
  const Icon = window.Icon;
  const fmt = window.fmtN, fmtI = window.fmtI;
  const [tab, setTab] = useStateMD('plant');
  const [plant, setPlant] = useStateMD('Nasik');
  const m = D.master[plant];

  return (
    <div>
      <div className="kpi-row" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi"><div className="k-label">Active Plants</div><div className="k-val">2</div><div className="k-sub">Nasik · Mn</div></div>
        <div className="kpi"><div className="k-label">Material Densities</div><div className="k-val">{Object.keys(D.density).length}</div><div className="k-sub">MS, SS, Al, Cu, Wax</div></div>
        <div className="kpi"><div className="k-label">Riser Types</div><div className="k-val">{Object.keys(D.riserWeights).length}</div><div className="k-sub">Star, V5, 5T spl…</div></div>
        <div className="kpi"><div className="k-label">Machines on file</div><div className="k-val">{Object.keys(D.machineNameToType).length}</div><div className="k-sub">across 6 categories</div></div>
      </div>

      <div className="tabbar" style={{margin:'4px 0 18px'}}>
        {[
          ['plant','Plant Overheads','factory'],
          ['mat','Material Density','flask'],
          ['risers','Riser Library','sigma'],
          ['machines','Machines & Rates','settings'],
          ['fx','Exchange Rates','sheet'],
          ['drop','Dropdowns','list'],
        ].map(([k,l,ic])=>(
          <button key={k} className={`tab ${tab===k?'active':''}`} onClick={()=>setTab(k)}>
            <Icon name={ic} size={13}/> {l}
          </button>
        ))}
      </div>

      {tab==='plant' && (
        <>
          <div className="card">
            <div className="card-head">
              <span className="cell-stripe linked"/>
              <h3>Plant overheads — drives every cost row</h3>
              <span className="section-row-num">Master sheet</span>
              <div style={{marginLeft:'auto',display:'flex',gap:6}}>
                {['Nasik','Mn'].map(p=>(
                  <button key={p} className={`tab ${plant===p?'active':''}`} style={{padding:'6px 14px'}} onClick={()=>setPlant(p)}>{p}</button>
                ))}
              </div>
            </div>
            <div className="card-body">
              <div className="form-grid cols-3">
                <Mfield label="Avg Std Mould Wt" suffix="kg" value={m.avgStdMldWt}/>
                <Mfield label="Melting Loss" suffix="%" value={(m.meltingLoss*100).toFixed(1)}/>
                <Mfield label="Margin" suffix="%" value={m.margin}/>
                <Mfield label="Power" suffix="₹/kg" value={m.power}/>
                <Mfield label="Fuel" suffix="₹/mould" value={m.fuel}/>
                <Mfield label="Labour" suffix="₹/mould" value={m.labour}/>
                <Mfield label="Pattern Wax" suffix="₹/kg" value={m.patternWax}/>
                <Mfield label="Riser Wax" suffix="₹/kg" value={m.riserWax}/>
                <Mfield label="Water-Sol Wax" suffix="₹/kg" value={m.waterSolWax}/>
                <Mfield label="Ceramic Core" suffix="₹/kg" value={m.ceramicCore}/>
              </div>
              <h4 style={{margin:'20px 0 8px',fontSize:13,fontWeight:600}}>Material-dependent rates</h4>
              <div className="table-wrap">
                <table className="dtable">
                  <thead><tr><th>Rate</th><th className="num">MS</th><th className="num">SS</th><th>Notes</th></tr></thead>
                  <tbody>
                    <tr><td className="label-cell">Overhead ₹/mould</td><td className="formula num">{fmt(m.overhead.MS)}</td><td className="formula num">{fmt(m.overhead.SS)}</td><td className="muted">cascades into every cost build-up</td></tr>
                    <tr><td className="label-cell">Consumables ₹/mould</td><td className="formula num">{fmt(m.consumables.MS)}</td><td className="formula num">{fmt(m.consumables.SS)}</td><td className="muted">flux + de-ox + crucibles</td></tr>
                    <tr><td className="label-cell">Shell Rate ₹/kg-shell</td><td className="formula num">{fmt(m.shellRate.MS)}</td><td className="formula num">{fmt(m.shellRate.SS)}</td><td className="muted">slurry + stucco</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="insight">
            <Icon name="info" size={16}/>
            <div className="body"><b>Plant cascade:</b> changing any of the {plant} rates above instantly re-runs every active estimation that targets {plant}. Use the <b>Tweaks</b> panel to switch the open estimation to the other plant and see the cost differential live.</div>
          </div>
        </>
      )}

      {tab==='mat' && (
        <div className="card">
          <div className="card-head"><span className="cell-stripe formula"/><h3>Material density</h3><span className="section-row-num">Drop Downs A:B</span></div>
          <div className="card-body">
            <div className="table-wrap" style={{maxWidth:520}}>
              <table className="dtable">
                <thead><tr><th>Material</th><th className="num">Specific Gravity</th><th>Used in</th></tr></thead>
                <tbody>
                  {Object.entries(D.density).map(([k,v])=>(
                    <tr key={k}><td className="label-cell">{k}</td><td className="formula num">{fmt(v,2)}</td><td className="muted">{k==='Wax'?'pattern + riser volume':'metal mould wt'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab==='risers' && (
        <div className="card">
          <div className="card-head"><span className="cell-stripe input"/><h3>Riser library — geometry weights</h3><span className="section-row-num">Drop Downs J:K</span></div>
          <div className="card-body">
            <div className="riser-grid">
              {Object.entries(D.riserWeights).map(([k,v])=>(
                <div key={k} className="riser-card">
                  <div className="riser-glyph">
                    <svg viewBox="0 0 40 40" width="36" height="36" fill="none" stroke="#71717a" strokeWidth="1.4">
                      <ellipse cx="20" cy="10" rx="12" ry="3"/>
                      <path d="M8 10 L14 32 L26 32 L32 10"/>
                      <line x1="14" y1="32" x2="26" y2="32" strokeWidth="2.2" stroke="#c2410c"/>
                    </svg>
                  </div>
                  <div className="riser-name">{k}</div>
                  <div className="riser-wt">{fmt(v,3)} <span className="muted">kg</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='machines' && (
        <>
          <div className="card">
            <div className="card-head"><span className="cell-stripe formula"/><h3>Machine-type rates</h3><span className="section-row-num">Master A37:B45</span></div>
            <div className="card-body">
              <div className="table-wrap" style={{maxWidth:480}}>
                <table className="dtable">
                  <thead><tr><th>Type</th><th className="num">Rate ₹/hr</th><th className="num">Machines</th></tr></thead>
                  <tbody>
                    {Object.entries(D.machineRates).map(([t,r])=>{
                      const cnt = Object.values(D.machineNameToType).filter(v=>v===t).length;
                      return <tr key={t}><td className="label-cell mono">{t}</td><td className="formula num">{fmtI(r)}</td><td className="num">{cnt}</td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><span className="cell-stripe linked"/><h3>Machines → type mapping</h3></div>
            <div className="card-body">
              <div className="machine-grid">
                {Object.entries(D.machineNameToType).map(([m,t])=>(
                  <div key={m} className="mach-chip"><span className="mach-name mono">{m}</span><span className={`mach-type t-${t.replace(/\s+/g,'')}`}>{t}</span></div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab==='fx' && (
        <div className="card">
          <div className="card-head"><span className="cell-stripe formula"/><h3>Exchange rates</h3><span className="section-row-num">Master sheet</span></div>
          <div className="card-body">
            <div className="fx-grid">
              {Object.entries(D.exchange).map(([cur,r])=>(
                <div key={cur} className="fx-card">
                  <div className="fx-cur">{cur}</div>
                  <div className="fx-rate">{cur==='INR'?'1.00':fmt(r,2)}</div>
                  <div className="fx-sub muted">₹ per 1 {cur}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='drop' && (
        <div className="card">
          <div className="card-head"><span className="cell-stripe input"/><h3>Dropdown lists</h3><span className="section-row-num">Drop Downs sheet</span></div>
          <div className="card-body">
            <div className="drop-grid">
              {Object.entries(D.dropdowns).map(([k,arr])=>(
                <div key={k} className="drop-card">
                  <div className="drop-head"><span>{k}</span><span className="muted">{arr.length}</span></div>
                  <div className="drop-list">
                    {arr.map(v=><span key={v} className="drop-pill">{v}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Mfield({label, value, suffix}) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="input" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontWeight:600}}>{value}</span>
        <span className="muted" style={{fontSize:11,fontFamily:'var(--font-mono)'}}>{suffix}</span>
      </div>
    </div>
  );
}

// ===== EXPORT / QUOTE PREVIEW page =====
window.HiFiExport = function HiFiExport({ data }) {
  const Icon = window.Icon;
  const c = window.UDL_ENGINE.compute(data);
  const fmt = window.fmtN, fmtI = window.fmtI;
  const se = data.salesEntry;

  return (
    <div>
      <div className="insight">
        <Icon name="info" size={16}/>
        <div className="body">Preview the customer-facing PDF or download an editable Excel that mirrors the original template — with the same cell colors, formulas and section structure preserved.</div>
      </div>

      <div className="export-grid">
        <button className="export-card">
          <div className="ec-icon"><Icon name="pdf" size={26}/></div>
          <div className="ec-title">Customer Quote PDF</div>
          <div className="ec-sub">1-page summary · header, price matrix, T&Cs · UDL letterhead</div>
          <span className="ec-go">Generate <Icon name="arrow-right" size={12}/></span>
        </button>
        <button className="export-card">
          <div className="ec-icon"><Icon name="sheet" size={26}/></div>
          <div className="ec-title">Estimation Workbook</div>
          <div className="ec-sub">Full Excel with all 155 rows · color-coded cells preserved</div>
          <span className="ec-go">Download .xlsx <Icon name="arrow-right" size={12}/></span>
        </button>
        <button className="export-card">
          <div className="ec-icon"><Icon name="database" size={26}/></div>
          <div className="ec-title">ERP Hand-off (JSON)</div>
          <div className="ec-sub">Structured payload for SAP / Oracle integration</div>
          <span className="ec-go">Send <Icon name="arrow-right" size={12}/></span>
        </button>
      </div>

      <div className="card" style={{marginTop:24}}>
        <div className="card-head"><span className="cell-stripe formula"/><h3>Quote preview</h3></div>
        <div className="card-body">
          <div className="quote-paper">
            <div className="quote-letterhead">
              <div>
                <div className="quote-logo">UDL</div>
                <div className="muted" style={{fontSize:10.5,fontFamily:'var(--font-mono)',marginTop:4}}>UDL CASTINGS PVT. LTD. · {se.plant.toUpperCase()} WORKS</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:600,fontSize:14}}>QUOTATION</div>
                <div className="muted" style={{fontSize:11,fontFamily:'var(--font-mono)'}}>{se.quotationNo} · {se.date}</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginTop:24}}>
              <div>
                <div className="quote-section-label">Customer</div>
                <div style={{fontSize:14,fontWeight:600}}>{se.customerName}</div>
                <div className="muted" style={{fontSize:12}}>{se.domExp} · {se.supplyCondition}</div>
              </div>
              <div>
                <div className="quote-section-label">Item</div>
                <div style={{fontSize:14,fontWeight:600}}>{se.itemCode} — {se.partDescription}</div>
                <div className="muted" style={{fontSize:12}}>Drw {se.drwNo} · {se.material}</div>
              </div>
            </div>
            <table className="quote-table">
              <thead><tr><th></th><th className="num">A · 15% rej</th><th className="num">B · 20% rej</th><th className="num">C · 25% rej</th></tr></thead>
              <tbody>
                <tr><td>Ex-works ₹/pc</td>{c.exPriceWith.map((v,i)=><td key={i} className="num">{fmt(v)}</td>)}</tr>
                <tr><td>Per kg ₹</td>{c.perKgWith.map((v,i)=><td key={i} className="num">{fmt(v)}</td>)}</tr>
                <tr className="hl"><td><b>Quoted ₹/pc (with riser credit)</b></td>{c.quotedWith.map((v,i)=><td key={i} className="num"><b>{fmt(v)}</b></td>)}</tr>
              </tbody>
            </table>
            <div style={{marginTop:18,display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
              <div>
                <div className="quote-section-label">Tooling (one-time)</div>
                <div style={{fontSize:14,fontWeight:600}}>₹ {fmtI(c.tooling.totalDevCost)}</div>
              </div>
              <div>
                <div className="quote-section-label">Batch · MOQ</div>
                <div style={{fontSize:14,fontWeight:600}}>{fmtI(se.batchQty)} pcs / yr</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
