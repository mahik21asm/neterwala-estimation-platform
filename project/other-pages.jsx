// ===== UDL — secondary pages: History, Master Data, Export, Charts =====

window.HistoryPage = function HistoryPage({ onOpen }) {
  const D = window.UDL_DATA;
  return (
    <div>
      <div className="toolbar">
        <input className="" placeholder="🔍 Search by item, customer, drw no…" style={{padding:'6px 10px',border:'1.5px solid var(--ink)',borderRadius:6,fontFamily:'var(--font-hand)',width:320,background:'var(--paper-2)'}}/>
        <select style={{padding:'6px 10px',border:'1.5px solid var(--ink)',borderRadius:6,fontFamily:'var(--font-hand)'}}><option>All plants</option><option>Nasik</option><option>Mn</option></select>
        <select style={{padding:'6px 10px',border:'1.5px solid var(--ink)',borderRadius:6,fontFamily:'var(--font-hand)'}}><option>All status</option><option>Draft</option><option>Submitted</option><option>Approved</option><option>Lost</option></select>
        <span className="spacer"/>
        <button className="btn">⎘ Clone</button>
        <button className="btn">⇄ Compare</button>
        <button className="btn primary" onClick={()=>onOpen('new')}>+ New Estimation</button>
      </div>
      <table className="xtable">
        <thead><tr><th>Estimation ID</th><th>Item</th><th>Customer</th><th>Plant</th><th>Material</th><th>Date</th><th className="num">Qty</th><th className="num">Target ₹</th><th className="num">Quoted ₹</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {D.history.map(h=>(
            <tr key={h.id}>
              <td className="label">{h.id}</td>
              <td>{h.itemCode}</td>
              <td>{h.customer}</td>
              <td>{h.plant}</td>
              <td>{h.mat}</td>
              <td>{h.date}</td>
              <td className="num">{h.qty.toLocaleString('en-IN')}</td>
              <td className="num">{h.target.toFixed(2)}</td>
              <td className="num">{h.quoted.toFixed(2)}</td>
              <td><span className={`status-pill ${h.status}`}>{h.status}</span></td>
              <td><button className="btn sm" onClick={()=>onOpen('open')}>Open</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="sketch-note" style={{marginTop:14}}>↑ Click any row to open. Use Compare to lay 2-3 estimations side-by-side.</div>
    </div>
  );
};

window.MasterDataPage = function MasterDataPage() {
  const M = window.UDL_DATA.master;
  const [tab, setTab] = React.useState('overheads');
  const tabs = [['overheads','Plant Overheads'],['machines','Machine Rates'],['waxshell','Wax & Shell'],['exchange','Exchange Rates'],['dropdowns','Dropdowns'],['ledger','SAP Ledger Import']];
  return (
    <div>
      <div className="toolbar">
        <span className="sketch-note">⚠ Admin only · all changes audit-logged · last sync from SAP: 02.05.2026</span>
        <span className="spacer"/>
        <button className="btn">↑ Import CSV</button>
        <button className="btn">⏮ Version History</button>
      </div>
      <div className="module-tabs">
        {tabs.map(([k,l])=><div key={k} className={`module-tab ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</div>)}
      </div>
      {tab==='overheads' && (
        <div className="card"><div className="card-head"><h3>Plant Overheads</h3><span className="row-meta">per mould unless noted · updated quarterly</span></div><div className="card-body">
          <table className="xtable">
            <thead><tr><th>Cost Element</th><th className="num">Nasik · MS</th><th className="num">Nasik · SS</th><th className="num">Mn (all)</th><th>UOM</th></tr></thead>
            <tbody>
              <tr><td className="label">Overhead</td><td className="yellow num">{M.Nasik.overhead.MS}</td><td className="yellow num">{M.Nasik.overhead.SS}</td><td className="yellow num">{M.Mn.overhead.MS}</td><td>Per Mould</td></tr>
              <tr><td className="label">Labour</td><td className="yellow num">{M.Nasik.labour}</td><td className="yellow num">{M.Nasik.labour}</td><td className="yellow num">{M.Mn.labour}</td><td>Per Mould</td></tr>
              <tr><td className="label">Consumables</td><td className="yellow num">{M.Nasik.consumables.MS}</td><td className="yellow num">{M.Nasik.consumables.SS}</td><td className="yellow num">{M.Mn.consumables.MS}</td><td>Per Mould</td></tr>
              <tr><td className="label">Power</td><td className="yellow num">{M.Nasik.power}</td><td className="yellow num">{M.Nasik.power}</td><td className="yellow num">{M.Mn.power}</td><td>Per Kg</td></tr>
              <tr><td className="label">Fuel</td><td className="yellow num">{M.Nasik.fuel}</td><td className="yellow num">{M.Nasik.fuel}</td><td className="yellow num">{M.Mn.fuel}</td><td>Per Mould</td></tr>
              <tr><td className="label">Melting Loss</td><td className="yellow num">{(M.Nasik.meltingLoss*100).toFixed(0)}%</td><td className="yellow num">{(M.Nasik.meltingLoss*100).toFixed(0)}%</td><td className="yellow num">{(M.Mn.meltingLoss*100).toFixed(0)}%</td><td>%</td></tr>
              <tr><td className="label">Margin %</td><td className="yellow num">0%</td><td className="yellow num">0%</td><td className="yellow num">0%</td><td>%</td></tr>
              <tr><td className="label">Avg Std Mould Wt</td><td className="yellow num">{M.Nasik.avgStdMldWt}</td><td className="yellow num">{M.Nasik.avgStdMldWt}</td><td className="yellow num">{M.Mn.avgStdMldWt}</td><td>kg</td></tr>
            </tbody>
          </table>
        </div></div>
      )}
      {tab==='machines' && (
        <div className="card"><div className="card-head"><h3>Machine Type Rates (₹/hr)</h3></div><div className="card-body">
          <table className="xtable">
            <thead><tr><th>Machine Type</th><th className="num">Rate / Hr</th><th>Linked Machines</th></tr></thead>
            <tbody>
              {Object.entries(window.UDL_DATA.machineRates).map(([t,r])=>(
                <tr key={t}><td className="label">{t}</td><td className="yellow num">{r}</td><td>{Object.entries(window.UDL_DATA.machineNameToType).filter(([_,v])=>v===t).map(([k])=>k).join(', ')}</td></tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}
      {tab==='waxshell' && (
        <div className="card"><div className="card-head"><h3>Wax & Shell Rates (₹/kg)</h3></div><div className="card-body">
          <table className="xtable">
            <thead><tr><th>Item</th><th className="num">Nasik · MS</th><th className="num">Nasik · SS</th><th className="num">Mn</th></tr></thead>
            <tbody>
              <tr><td className="label">Pattern Wax</td><td className="yellow num">{M.Nasik.patternWax}</td><td className="yellow num">{M.Nasik.patternWax}</td><td className="yellow num">{M.Mn.patternWax}</td></tr>
              <tr><td className="label">Riser Wax</td><td className="yellow num">{M.Nasik.riserWax}</td><td className="yellow num">{M.Nasik.riserWax}</td><td className="yellow num">{M.Mn.riserWax}</td></tr>
              <tr><td className="label">Water Soluble Wax</td><td className="yellow num">{M.Nasik.waterSolWax}</td><td className="yellow num">{M.Nasik.waterSolWax}</td><td className="yellow num">{M.Mn.waterSolWax}</td></tr>
              <tr><td className="label">Ceramic Core</td><td className="yellow num">{M.Nasik.ceramicCore}</td><td className="yellow num">{M.Nasik.ceramicCore}</td><td className="yellow num">{M.Mn.ceramicCore}</td></tr>
              <tr><td className="label">Shell Cost</td><td className="yellow num">{M.Nasik.shellRate.MS}</td><td className="yellow num">{M.Nasik.shellRate.SS}</td><td className="yellow num">{M.Mn.shellRate.MS}</td></tr>
            </tbody>
          </table>
        </div></div>
      )}
      {tab==='exchange' && (
        <div className="card"><div className="card-head"><h3>Currency Exchange Rates</h3><span className="row-meta">updated monthly</span></div><div className="card-body">
          <table className="xtable" style={{maxWidth:300}}>
            <thead><tr><th>Currency</th><th className="num">₹ per unit</th></tr></thead>
            <tbody>{Object.entries(window.UDL_DATA.exchange).map(([c,r])=>(<tr key={c}><td className="label">{c}</td><td className="yellow num">{r}</td></tr>))}</tbody>
          </table>
        </div></div>
      )}
      {tab==='dropdowns' && (
        <div className="card"><div className="card-head"><h3>Dropdown Lists</h3></div><div className="card-body">
          <div className="form-grid">
            {Object.entries(window.UDL_DATA.dropdowns).slice(0,9).map(([k,arr])=>(
              <div key={k} className="field"><label>{k} <span className="hint">({arr.length})</span></label>
                <div style={{padding:6,border:'1.5px dashed #999',borderRadius:6,fontSize:13,maxHeight:80,overflow:'auto'}}>{arr.join(' · ')}</div></div>
            ))}
          </div>
        </div></div>
      )}
      {tab==='ledger' && (
        <div className="card"><div className="card-head"><h3>SAP Material Ledger Import</h3></div><div className="card-body">
          <div className="two-col">
            <div className="kpi"><div className="k-label">Nasik Ledger</div><div className="k-val">2,481 items</div><div className="k-sub">last sync 02.05.2026 · 14:22</div></div>
            <div className="kpi"><div className="k-label">Mn Ledger</div><div className="k-val">1,365 items</div><div className="k-sub">last sync 02.05.2026 · 14:18</div></div>
          </div>
          <div style={{marginTop:14,padding:14,border:'2px dashed var(--ink)',borderRadius:8,textAlign:'center',background:'var(--paper-2)'}}>
            <div style={{fontFamily:'var(--font-hand-bold)',fontSize:20}}>📂 Drop SAP export here (.xlsx / .csv)</div>
            <div className="hint" style={{marginTop:6}}>Validates → shows diff → requires admin confirm</div>
          </div>
        </div></div>
      )}
    </div>
  );
};

window.ExportPage = function ExportPage() {
  return (
    <div>
      <div className="toolbar">
        <span className="sketch-note">Pick format · choose what to include · download</span>
      </div>
      <div className="two-col">
        <div className="card"><div className="card-head"><h3>📄 PDF Quotation</h3><span className="row-meta">customer-facing</span></div><div className="card-body">
          <div className="field"><label>Rejection scenario</label><select><option>B · 20% (default)</option><option>A · 15%</option><option>C · 25%</option></select></div>
          <div className="field" style={{marginTop:8}}><label>Riser credit</label><select><option>With Riser Cr</option><option>Without Riser Cr</option></select></div>
          <div className="field" style={{marginTop:8}}><label>Currency</label><select><option>INR</option><option>USD</option><option>GBP</option><option>EUR</option></select></div>
          <button className="btn primary" style={{marginTop:14}}>↓ Generate PDF</button>
        </div></div>
        <div className="card"><div className="card-head"><h3>📊 Excel Workbook</h3><span className="row-meta">all 6 columns + colors preserved</span></div><div className="card-body">
          <ul style={{margin:'4px 0 14px 18px',padding:0}}>
            <li>Sheet 1 — Sales Entry</li>
            <li>Sheet 2 — Estimation (color-coded)</li>
            <li>Sheet 3 — Summary + Tooling</li>
          </ul>
          <button className="btn primary">↓ Download .xlsx</button>
        </div></div>
      </div>
    </div>
  );
};

window.DashboardPage = function DashboardPage() {
  const computed = window.UDL_ENGINE.compute({
    salesEntry: window.UDL_DATA.sample.salesEntry,
    chargeReturn: window.UDL_DATA.sample.chargeReturn,
    chargeVirgin: window.UDL_DATA.sample.chargeVirgin,
    postFoundry: window.UDL_DATA.sample.postFoundry,
    machining: window.UDL_DATA.sample.machining,
    tests: window.UDL_DATA.sample.testApplicability,
  });
  const fmt = window.UDL_ENGINE.fmt;
  const c = computed.costRows;
  const total = computed.totalCostWithRC;
  const slices = [
    ['Metal (net)',  c.metal.valueWith,'#ef9a9a'],
    ['Shell',        c.shell.value,    '#fff59d'],
    ['Overhead',     c.overhead.value, '#bbdefb'],
    ['Consumables',  c.consumables.value,'#c8e6c9'],
    ['Labour',       c.labour.value,   '#ce93d8'],
    ['Power',        c.power.value,    '#ffcc80'],
    ['Wax+Ceramic',  c.patternWax.value+c.riserWax.value+c.ceramicCore.value,'#a5d6a7'],
    ['HT',           c.ht.value,       '#90caf9'],
    ['Other',        c.leakMould.withRC,'#bcaaa4'],
  ];
  let acc = 0;
  return (
    <div>
      <div className="kpi-row">
        <div className="kpi info"><div className="k-label">Estimations YTD</div><div className="k-val">218</div><div className="k-sub">+12% vs last quarter</div></div>
        <div className="kpi ok"><div className="k-label">Approved value</div><div className="k-val">₹ 4.2 Cr</div><div className="k-sub">63 quotations</div></div>
        <div className="kpi"><div className="k-label">Avg cycle</div><div className="k-val">3.4 days</div><div className="k-sub">draft → submit</div></div>
        <div className="kpi accent"><div className="k-label">Win rate</div><div className="k-val">41%</div><div className="k-sub">approved / submitted</div></div>
      </div>
      <div className="two-col">
        <div className="card"><div className="card-head"><h3>Cost breakdown · Item 30D</h3></div><div className="card-body">
          <svg viewBox="0 0 220 220" width="220" height="220" style={{display:'block',margin:'0 auto'}}>
            {slices.map(([label,val,color],i)=>{
              const a0 = (acc/total)*Math.PI*2 - Math.PI/2;
              acc += val;
              const a1 = (acc/total)*Math.PI*2 - Math.PI/2;
              const large = (a1-a0) > Math.PI ? 1 : 0;
              const x0 = 110+90*Math.cos(a0), y0 = 110+90*Math.sin(a0);
              const x1 = 110+90*Math.cos(a1), y1 = 110+90*Math.sin(a1);
              return <path key={i} d={`M110,110 L${x0},${y0} A90,90 0 ${large} 1 ${x1},${y1} Z`} fill={color} stroke="#1a1a1a" strokeWidth="1.5"/>;
            })}
          </svg>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 10px',marginTop:10,fontSize:13}}>
            {slices.map(([l,v,c],i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:12,height:12,background:c,border:'1px solid #1a1a1a'}}></span>{l} · ₹{fmt(v)}</div>))}
          </div>
        </div></div>
        <div className="card"><div className="card-head"><h3>Price vs target — last 5</h3></div><div className="card-body">
          <svg viewBox="0 0 400 200" width="100%" height="200">
            {window.UDL_DATA.history.map((h,i)=>{
              const x = 30+i*70;
              const max = 3500;
              const ht = (h.target/max)*150, hq = (h.quoted/max)*150;
              return (<g key={h.id}>
                <rect x={x} y={170-ht} width="22" height={ht} fill="#bbdefb" stroke="#1a1a1a" strokeWidth="1.5"/>
                <rect x={x+24} y={170-hq} width="22" height={hq} fill="#fff59d" stroke="#1a1a1a" strokeWidth="1.5"/>
                <text x={x+22} y="185" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">{h.itemCode}</text>
              </g>);
            })}
            <text x="20" y="15" fontSize="11" fontFamily="JetBrains Mono">₹</text>
            <line x1="20" y1="170" x2="380" y2="170" stroke="#1a1a1a" strokeWidth="1.5"/>
          </svg>
          <div style={{display:'flex',gap:14,fontSize:12,marginTop:6,fontFamily:'var(--font-mono)'}}>
            <span><span style={{display:'inline-block',width:12,height:12,background:'#bbdefb',border:'1px solid #000',marginRight:4,verticalAlign:'middle'}}></span>Target</span>
            <span><span style={{display:'inline-block',width:12,height:12,background:'#fff59d',border:'1px solid #000',marginRight:4,verticalAlign:'middle'}}></span>Quoted</span>
          </div>
        </div></div>
      </div>
    </div>
  );
};
