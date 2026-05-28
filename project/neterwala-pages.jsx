// ===== Neterwala Group Product Estimation Platform — new pages =====
// Plant Comparison, Workflow, Scenarios, Versions, Analytics, SAP,
// Governance, Architecture, Data Model, Configuration, Group Dashboard
// Sketchy wireframe vibe — same primitives as styles.css

const { useState: useS } = React;

/* -------- helpers -------- */
function StageBadge({ stage }) {
  const map = {
    rfq:['RFQ','#fff59d'], est:['EST','#bbdefb'], bom:['BOM','#c8e6c9'],
    fin:['FIN','#ce93d8'], apv:['APV','#ffcc80'], qte:['QTE','#a5d6a7'],
  };
  const [l,c] = map[stage] || ['—','#eee'];
  return <span style={{background:c,border:'1px solid #1a1a1a',padding:'1px 8px',borderRadius:10,fontFamily:'var(--font-mono)',fontSize:11,fontWeight:600}}>{l}</span>;
}

function CompanyTag({ code }) {
  const co = window.NW_DATA.companies.find(c=>c.code===code);
  if (!co) return null;
  return <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'1px 8px',border:'1.5px solid var(--ink)',borderRadius:10,fontFamily:'var(--font-mono)',fontSize:11,fontWeight:600,background:co.color+'33'}}>
    <span style={{width:8,height:8,borderRadius:'50%',background:co.color,border:'1px solid #1a1a1a'}}/>{code}
  </span>;
}

/* ====================================================================
   GROUP DASHBOARD — multi-company overview
==================================================================== */
window.NW_GroupDashboard = function() {
  const N = window.NW_DATA;
  return (
    <div>
      <div className="kpi-row" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
        {N.groupKpis.map((k,i)=>(
          <div key={i} className={`kpi ${i===0?'info':i===1?'ok':i===4?'accent':''}`}>
            <div className="k-label">{k.label}</div>
            <div className="k-val">{k.val}</div>
            <div className="k-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head"><h3>Estimations by company</h3><span className="row-meta">MTD · all plants</span></div>
          <div className="card-body">
            <svg viewBox="0 0 420 200" width="100%" height="200">
              {N.companies.map((c,i)=>{
                const vals = [42,28,31,18,13];
                const x = 30 + i*78;
                const h = vals[i] * 3.5;
                return (<g key={c.code}>
                  <rect x={x} y={170-h} width="48" height={h} fill={c.color} stroke="#1a1a1a" strokeWidth="1.5"/>
                  <text x={x+24} y={165-h} fontSize="13" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="600">{vals[i]}</text>
                  <text x={x+24} y="186" fontSize="12" textAnchor="middle" fontFamily="JetBrains Mono">{c.code}</text>
                </g>);
              })}
              <line x1="20" y1="170" x2="410" y2="170" stroke="#1a1a1a" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Pipeline — by stage</h3><span className="row-meta">live</span></div>
          <div className="card-body">
            <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6}}>
              {N.workflowStages.map(s=>{
                const c = N.pipeline.filter(p=>p.stage===s.k).length;
                return <div key={s.k} style={{border:'1.5px dashed var(--ink)',borderRadius:6,padding:8,textAlign:'center',background:'var(--paper-2)'}}>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:1}}>{s.title.toUpperCase()}</div>
                  <div style={{fontFamily:'var(--font-hand-bold)',fontSize:28,fontWeight:700}}>{c}</div>
                  <div style={{fontSize:11,color:'var(--ink-faint)',fontFamily:'var(--font-mono)'}}>SLA {s.sla}</div>
                </div>;
              })}
            </div>
            <div className="sketch-note" style={{marginTop:14}}>↑ Click any tile to filter Workflow page. RFQs older than SLA highlight red.</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Top movers — last 7 days</h3></div>
        <div className="card-body" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
          <div><div style={{fontFamily:'var(--font-hand-bold)',fontSize:18}}>↑ Nickel +4.2%</div><div className="hint" style={{fontFamily:'var(--font-mono)'}}>Affects 23 open RFQs · ₹ 2.1 Cr exposure</div></div>
          <div><div style={{fontFamily:'var(--font-hand-bold)',fontSize:18}}>↓ Power tariff –₹0.30/kWh (Mah.)</div><div className="hint" style={{fontFamily:'var(--font-mono)'}}>Nasik · Aurangabad · Solapur</div></div>
          <div><div style={{fontFamily:'var(--font-hand-bold)',fontSize:18}}>↑ Pune yield 76 → 78%</div><div className="hint" style={{fontFamily:'var(--font-mono)'}}>MES-fed · last shift</div></div>
        </div>
      </div>
    </div>
  );
};

/* ====================================================================
   WORKFLOW — RFQ → Estimate → Validate → Approve → Quote (Kanban)
==================================================================== */
window.NW_Workflow = function() {
  const N = window.NW_DATA;
  return (
    <div>
      <div className="toolbar">
        <span className="sketch-note">RFQ pipeline · drag cards between columns · SLA breaches flagged ▲</span>
        <span className="spacer"/>
        <select style={{padding:'6px 10px',border:'1.5px solid var(--ink)',borderRadius:6,fontFamily:'var(--font-hand)'}}><option>All companies</option>{N.companies.map(c=><option key={c.code}>{c.code}</option>)}</select>
        <select style={{padding:'6px 10px',border:'1.5px solid var(--ink)',borderRadius:6,fontFamily:'var(--font-hand)'}}><option>All plants</option>{Object.keys(N.plants).map(p=><option key={p}>{p}</option>)}</select>
        <button className="btn primary">+ New RFQ</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,alignItems:'start'}}>
        {N.workflowStages.map(s=>(
          <div key={s.k} style={{border:'2px solid var(--rule)',borderRadius:8,background:'var(--paper)',minHeight:380,boxShadow:'3px 3px 0 var(--rule)'}}>
            <div style={{padding:'8px 10px',borderBottom:'1.5px solid var(--rule)',background:'var(--paper-2)',borderRadius:'6px 6px 0 0'}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{width:22,height:22,border:'1.5px solid var(--ink)',borderRadius:4,display:'grid',placeItems:'center',fontSize:12,background:'var(--paper)'}}>{s.icon}</span>
                <div style={{fontFamily:'var(--font-hand-bold)',fontSize:16,fontWeight:700}}>{s.title}</div>
              </div>
              <div className="hint" style={{fontFamily:'var(--font-mono)',marginTop:2}}>owner: {s.owner} · SLA {s.sla}</div>
            </div>
            <div style={{padding:8,display:'flex',flexDirection:'column',gap:8}}>
              {N.pipeline.filter(p=>p.stage===s.k).map(p=>{
                const breach = (s.k!=='qte') && p.age.includes('d') && parseInt(p.age) > parseInt(s.sla);
                return (
                  <div key={p.id} style={{border:'1.5px solid var(--ink)',borderRadius:6,padding:8,background:breach?'#ffcdd2':'var(--paper)',cursor:'grab'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,fontFamily:'var(--font-mono)',fontSize:11}}>
                      <CompanyTag code={p.co}/>
                      <span style={{marginLeft:'auto'}}>{p.age}{breach && ' ▲'}</span>
                    </div>
                    <div style={{fontFamily:'var(--font-hand-bold)',fontSize:15,marginTop:4}}>{p.item}</div>
                    <div style={{fontSize:12,color:'var(--ink-soft)'}}>{p.customer} · {p.plant}</div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontFamily:'var(--font-mono)',fontSize:11}}>
                      <span>{p.id}</span><b>{p.amt}</b>
                    </div>
                  </div>
                );
              })}
              {N.pipeline.filter(p=>p.stage===s.k).length===0 && <div className="hint" style={{textAlign:'center',padding:14,fontFamily:'var(--font-mono)'}}>empty</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ====================================================================
   PLANT COMPARISON — same product, multiple plants side-by-side
==================================================================== */
window.NW_PlantComparison = function() {
  const N = window.NW_DATA;
  const plantsToCompare = ['Nasik','Aurangabad','Pune','Coventry'];
  // Mock per-plant cost for "30D Impeller" 1.84 kg
  const baseUnit = 1.84;
  const rows = N.costStructure;
  // synthesize amounts per plant using plant rates
  function amounts(p) {
    const r = N.plants[p];
    return {
      rm:   r.ccy==='GBP' ? 12.4 : 980,
      bo:   r.ccy==='GBP' ? 0    : 0,
      lab:  r.lab*0.4,
      mc:   r.mc*0.35,
      en:   r.pwr*baseUnit*1.6 + r.fuel*0.2,
      cons: r.ccy==='GBP' ? 5.2 : 220,
      ovhF: r.ovh*0.6,
      ovhV: r.ovh*0.35,
      scr:  (r.ccy==='GBP'?22:380)*r.scr,
      rw:   r.ccy==='GBP'?2.1:48,
      log:  r.ccy==='GBP'?6:120,
    };
  }
  const totals = {};
  plantsToCompare.forEach(p=>{
    const a = amounts(p);
    totals[p] = Object.values(a).reduce((s,v)=>s+v,0);
  });
  const minTot = Math.min(...plantsToCompare.map(p=>totals[p] * (N.plants[p].ccy==='GBP'?105:1)));

  return (
    <div>
      <div className="toolbar">
        <span className="sketch-note">Same product → costs different per plant · process · currency</span>
        <span className="spacer"/>
        <button className="btn">+ Add plant column</button>
        <button className="btn primary">Pick lowest viable plant</button>
      </div>

      <div className="card">
        <div className="card-head"><h3>30D Impeller · SS · 1.84 kg net · Qty 250</h3><span className="row-meta">amounts per unit · local currency unless noted</span></div>
        <div className="card-body" style={{overflowX:'auto'}}>
          <table className="xtable">
            <thead>
              <tr>
                <th style={{minWidth:220}}>Cost element</th>
                {plantsToCompare.map(p=>{
                  const r = N.plants[p];
                  return <th key={p} className="num" style={{minWidth:140}}>
                    <div><CompanyTag code={r.co}/></div>
                    <div>{p}</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:400,color:'var(--ink-soft)'}}>{r.currency} · yld {(r.yld*100).toFixed(0)}%</div>
                  </th>;
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map(row=>(
                <tr key={row.k}>
                  <td className="label">{row.label}</td>
                  {plantsToCompare.map(p=>{
                    const a = amounts(p);
                    const r = N.plants[p];
                    return <td key={p} className="yellow num">{r.currency} {a[row.k].toFixed(0)}</td>;
                  })}
                </tr>
              ))}
              <tr className="total">
                <td>Total / unit</td>
                {plantsToCompare.map(p=>{
                  const r = N.plants[p];
                  const inr = totals[p] * (r.ccy==='GBP'?105:1);
                  const isMin = Math.abs(inr-minTot) < 1;
                  return <td key={p} className="num" style={{background:isMin?'#c8e6c9':'#ede7d8'}}>{r.currency} {totals[p].toFixed(0)} {isMin && <span style={{color:'#1b5e20',fontFamily:'var(--font-hand-bold)'}}>★ best</span>}</td>;
                })}
              </tr>
              <tr>
                <td className="label">In INR (₹ @ £=105)</td>
                {plantsToCompare.map(p=>{
                  const r = N.plants[p];
                  const inr = totals[p] * (r.ccy==='GBP'?105:1);
                  return <td key={p} className="blue num">₹ {inr.toFixed(0)}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="three-col">
        <div className="card"><div className="card-head"><h3>Process fit</h3></div><div className="card-body" style={{fontSize:14}}>
          <div>Nasik · <b>Investment Cast</b> ✓ design as-drawn</div>
          <div>Aurangabad · <b>Investment Cast</b> ✓ capacity tight</div>
          <div>Pune · <b>Forge</b> — needs <i>redesign</i> ✎</div>
          <div>Coventry · <b>Investment Cast</b> ✓ + UK lead time</div>
        </div></div>
        <div className="card"><div className="card-head"><h3>Lead time</h3></div><div className="card-body">
          <svg viewBox="0 0 320 130" width="100%" height="130">
            {plantsToCompare.map((p,i)=>{
              const lt = [28,24,18,42][i];
              return (<g key={p}>
                <rect x="80" y={10+i*28} width={lt*5} height="18" fill="#bbdefb" stroke="#1a1a1a" strokeWidth="1.5"/>
                <text x="6" y={24+i*28} fontSize="12" fontFamily="JetBrains Mono">{p}</text>
                <text x={86+lt*5} y={24+i*28} fontSize="12" fontFamily="JetBrains Mono">{lt}d</text>
              </g>);
            })}
          </svg>
        </div></div>
        <div className="card"><div className="card-head"><h3>Capacity utilisation</h3></div><div className="card-body">
          {plantsToCompare.map((p,i)=>{
            const u = [82,68,91,55][i];
            return <div key={p} style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',fontFamily:'var(--font-mono)',fontSize:12}}><span>{p}</span><span>{u}%</span></div>
              <div style={{height:10,border:'1.5px solid var(--ink)',borderRadius:4,background:'var(--paper-2)',overflow:'hidden'}}>
                <div style={{height:'100%',width:u+'%',background:u>85?'#ffcdd2':u>70?'#fff59d':'#c8e6c9'}}/>
              </div>
            </div>;
          })}
        </div></div>
      </div>
    </div>
  );
};

/* ====================================================================
   SCENARIOS & VERSIONS — what-if simulator + version history
==================================================================== */
window.NW_Scenarios = function() {
  const N = window.NW_DATA;
  const [active, setActive] = useS('baseline');
  const a = N.scenarios.find(s=>s.id===active);

  return (
    <div>
      <div className="toolbar">
        <span className="sketch-note">Simulate price · yield · plant moves · then save as new version</span>
        <span className="spacer"/>
        <button className="btn">⎘ Clone</button>
        <button className="btn primary">↗ Save as version</button>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head"><h3>What-if scenarios</h3><span className="row-meta">pick one to preview</span></div>
          <div className="card-body" style={{display:'flex',flexDirection:'column',gap:8}}>
            {N.scenarios.map(s=>(
              <div key={s.id} onClick={()=>setActive(s.id)} style={{border:'1.5px solid var(--ink)',borderStyle:active===s.id?'solid':'dashed',background:active===s.id?'var(--xl-yellow)':'var(--paper)',borderRadius:6,padding:'8px 10px',cursor:'pointer'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:11,padding:'1px 6px',border:'1px solid var(--ink)',borderRadius:8,background:'var(--paper-2)'}}>{s.id}</span>
                  <b style={{fontFamily:'var(--font-hand-bold)',fontSize:17}}>{s.label}</b>
                  <span className="hint" style={{marginLeft:'auto',fontFamily:'var(--font-mono)'}}>{s.vars}</span>
                </div>
                <div style={{display:'flex',gap:14,marginTop:4,fontSize:13,fontFamily:'var(--font-mono)'}}>
                  <span style={{color:s.dP>0?'#c62828':s.dP<0?'#2e7d32':'var(--ink-soft)'}}>ΔPrice {s.dP>0?'+':''}{s.dP}%</span>
                  <span style={{color:s.dM>0?'#c62828':s.dM<0?'#2e7d32':'var(--ink-soft)'}}>ΔMat {s.dM>0?'+':''}{s.dM}%</span>
                  <span style={{color:s.dY>0?'#2e7d32':'var(--ink-soft)'}}>ΔYld {s.dY>0?'+':''}{s.dY}pp</span>
                </div>
                <div style={{fontSize:12,color:'var(--ink-soft)',marginTop:2}}>{s.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Preview · {a.label}</h3></div>
          <div className="card-body">
            <div className="kpi-row" style={{gridTemplateColumns:'1fr 1fr'}}>
              <div className="kpi info"><div className="k-label">Price / unit</div><div className="k-val">₹ {(2675*(1+a.dP/100)).toFixed(0)}</div><div className="k-sub">vs ₹ 2,675 baseline</div></div>
              <div className="kpi ok"><div className="k-label">Yield</div><div className="k-val">{(62+a.dY)}%</div><div className="k-sub">vs 62% baseline</div></div>
            </div>
            <hr className="dashed"/>
            <div style={{fontFamily:'var(--font-hand-bold)',fontSize:18,marginBottom:6}}>Cost cascade</div>
            <svg viewBox="0 0 400 120" width="100%" height="120">
              {['Mat','Lab','Mac','En','Cons','Ovh','Scr'].map((l,i)=>{
                const bases = [820,180,310,140,210,560,180];
                const mods = [1+a.dM/100,1,1,1,1,1,1+(a.dY*-0.01)];
                const v = bases[i]*mods[i];
                const h = v/10;
                return (<g key={l}>
                  <rect x={20+i*50} y={100-h} width="38" height={h} fill="#bbdefb" stroke="#1a1a1a" strokeWidth="1.5"/>
                  <text x={39+i*50} y="113" fontSize="11" textAnchor="middle" fontFamily="JetBrains Mono">{l}</text>
                  <text x={39+i*50} y={97-h} fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">{v.toFixed(0)}</text>
                </g>);
              })}
              <line x1="20" y1="100" x2="380" y2="100" stroke="#1a1a1a" strokeWidth="1.5"/>
            </svg>
            <div className="sketch-note" style={{marginTop:10}}>Tweak inputs, click <b>Save as version</b> to lock.</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Version history · 30D Impeller</h3><span className="row-meta">no overwrite · full audit</span></div>
        <div className="card-body">
          <table className="xtable">
            <thead><tr><th>Ver</th><th>Label</th><th>Date</th><th>By</th><th className="num">Price ₹</th><th>Status</th><th>Note</th><th></th></tr></thead>
            <tbody>
              {N.versions.map(v=>(
                <tr key={v.id}>
                  <td className="label">{v.id}</td>
                  <td>{v.label}</td>
                  <td>{v.date}</td>
                  <td>{v.by}</td>
                  <td className="num">{v.price.toFixed(0)}</td>
                  <td><span className={`status-pill ${v.status}`}>{v.status}</span></td>
                  <td style={{fontSize:13}}>{v.note}</td>
                  <td><button className="btn sm">Open</button> <button className="btn sm ghost">Diff</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ====================================================================
   ANALYTICS — group-level dashboards
==================================================================== */
window.NW_Analytics = function() {
  const N = window.NW_DATA;
  const breakdown = [['Material',38,'#ef9a9a'],['Labour',12,'#ce93d8'],['Machine',16,'#bbdefb'],['Energy',9,'#ffcc80'],['Overhead',18,'#fff59d'],['Other',7,'#a5d6a7']];
  return (
    <div>
      <div className="kpi-row">
        <div className="kpi info"><div className="k-label">Avg material share</div><div className="k-val">38%</div><div className="k-sub">group · last quarter</div></div>
        <div className="kpi"><div className="k-label">Avg labour share</div><div className="k-val">12%</div><div className="k-sub">target ≤ 14%</div></div>
        <div className="kpi accent"><div className="k-label">Top cost driver</div><div className="k-val">Nickel</div><div className="k-sub">+4.2% w/w</div></div>
        <div className="kpi ok"><div className="k-label">Cost variance</div><div className="k-val">±3.1%</div><div className="k-sub">est vs actual</div></div>
      </div>

      <div className="two-col">
        <div className="card"><div className="card-head"><h3>Group cost breakdown %</h3></div><div className="card-body">
          <svg viewBox="0 0 220 220" width="220" height="220" style={{display:'block',margin:'0 auto'}}>
            {(()=>{let acc=0;const tot=breakdown.reduce((s,b)=>s+b[1],0);return breakdown.map(([l,v,c],i)=>{
              const a0=(acc/tot)*Math.PI*2-Math.PI/2;acc+=v;const a1=(acc/tot)*Math.PI*2-Math.PI/2;
              const lg=(a1-a0)>Math.PI?1:0;
              const x0=110+90*Math.cos(a0),y0=110+90*Math.sin(a0);
              const x1=110+90*Math.cos(a1),y1=110+90*Math.sin(a1);
              return <path key={i} d={`M110,110 L${x0},${y0} A90,90 0 ${lg} 1 ${x1},${y1} Z`} fill={c} stroke="#1a1a1a" strokeWidth="1.5"/>;
            });})()}
          </svg>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:10,fontSize:13}}>
            {breakdown.map(([l,v,c],i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:12,height:12,background:c,border:'1px solid #1a1a1a'}}/>{l} · {v}%</div>))}
          </div>
        </div></div>

        <div className="card"><div className="card-head"><h3>Material vs Labour by company</h3></div><div className="card-body">
          <svg viewBox="0 0 420 200" width="100%" height="200">
            {N.companies.map((c,i)=>{
              const mat=[44,29,40,52,38][i], lab=[11,18,14,9,12][i];
              const x=30+i*78;
              return (<g key={c.code}>
                <rect x={x}    y={170-mat*2.5} width="22" height={mat*2.5} fill="#ef9a9a" stroke="#1a1a1a" strokeWidth="1.5"/>
                <rect x={x+24} y={170-lab*2.5} width="22" height={lab*2.5} fill="#ce93d8" stroke="#1a1a1a" strokeWidth="1.5"/>
                <text x={x+22} y="186" fontSize="12" textAnchor="middle" fontFamily="JetBrains Mono">{c.code}</text>
              </g>);
            })}
            <line x1="20" y1="170" x2="410" y2="170" stroke="#1a1a1a" strokeWidth="1.5"/>
          </svg>
          <div style={{display:'flex',gap:14,fontSize:12,marginTop:4,fontFamily:'var(--font-mono)'}}>
            <span><span style={{display:'inline-block',width:12,height:12,background:'#ef9a9a',border:'1px solid #000',marginRight:4,verticalAlign:'middle'}}/>Material %</span>
            <span><span style={{display:'inline-block',width:12,height:12,background:'#ce93d8',border:'1px solid #000',marginRight:4,verticalAlign:'middle'}}/>Labour %</span>
          </div>
        </div></div>
      </div>

      <div className="card"><div className="card-head"><h3>Plant cost comparison · same product index</h3><span className="row-meta">100 = group average</span></div><div className="card-body">
        <svg viewBox="0 0 600 180" width="100%" height="180">
          {Object.keys(N.plants).map((p,i)=>{
            const idx=[94,89,103,112,128][i];
            const x=40+i*110;
            const h=idx*0.9;
            const col = idx<100?'#c8e6c9':idx<110?'#fff59d':'#ffcdd2';
            return (<g key={p}>
              <rect x={x} y={150-h} width="70" height={h} fill={col} stroke="#1a1a1a" strokeWidth="1.5"/>
              <text x={x+35} y={145-h} fontSize="13" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="600">{idx}</text>
              <text x={x+35} y="166" fontSize="12" textAnchor="middle" fontFamily="JetBrains Mono">{p}</text>
            </g>);
          })}
          <line x1="20" y1="150" x2="580" y2="150" stroke="#1a1a1a" strokeWidth="1.5"/>
          <line x1="20" y1="60"  x2="580" y2="60"  stroke="#1a1a1a" strokeWidth="1" strokeDasharray="4 4"/>
          <text x="22" y="56" fontSize="11" fontFamily="JetBrains Mono">avg=100</text>
        </svg>
      </div></div>
    </div>
  );
};

/* ====================================================================
   SAP INTEGRATION — touchpoints + sync status
==================================================================== */
window.NW_Sap = function() {
  const S = window.NW_DATA.sap;
  return (
    <div>
      <div className="toolbar">
        <span className="sketch-note">Bi-directional · master data IN · cost estimate OUT (CK11N equiv.)</span>
      </div>

      <div className="card"><div className="card-head"><h3>Integration map</h3></div><div className="card-body">
        <svg viewBox="0 0 900 280" width="100%" height="280">
          {/* Boxes: Platform · SAP · MES · Databricks */}
          <g fontFamily="Kalam, sans-serif" fontSize="14">
            <rect x="350" y="100" width="200" height="80" fill="#fff59d" stroke="#1a1a1a" strokeWidth="2"/>
            <text x="450" y="135" textAnchor="middle" fontFamily="Caveat" fontSize="22" fontWeight="700">Neterwala Platform</text>
            <text x="450" y="158" textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono">estimation engine</text>

            <rect x="40" y="100" width="180" height="80" fill="#bbdefb" stroke="#1a1a1a" strokeWidth="2"/>
            <text x="130" y="135" textAnchor="middle" fontFamily="Caveat" fontSize="22" fontWeight="700">SAP S/4HANA</text>
            <text x="130" y="158" textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono">live</text>

            <rect x="680" y="30" width="180" height="60" fill="#c8e6c9" stroke="#1a1a1a" strokeWidth="2" strokeDasharray="6 4"/>
            <text x="770" y="55" textAnchor="middle" fontFamily="Caveat" fontSize="20" fontWeight="700">Databricks</text>
            <text x="770" y="75" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono">planned</text>

            <rect x="680" y="110" width="180" height="60" fill="#c8e6c9" stroke="#1a1a1a" strokeWidth="2" strokeDasharray="6 4"/>
            <text x="770" y="135" textAnchor="middle" fontFamily="Caveat" fontSize="20" fontWeight="700">MES (plants)</text>
            <text x="770" y="155" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono">actual vs estimate</text>

            <rect x="680" y="190" width="180" height="60" fill="#ce93d8" stroke="#1a1a1a" strokeWidth="2" strokeDasharray="6 4"/>
            <text x="770" y="215" textAnchor="middle" fontFamily="Caveat" fontSize="20" fontWeight="700">Agentic RFQ</text>
            <text x="770" y="235" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono">pilot</text>

            {/* Arrows SAP <-> Platform */}
            <path d="M220 130 L350 130" stroke="#1a1a1a" strokeWidth="2" fill="none" markerEnd="url(#arrow)"/>
            <text x="285" y="124" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono">MM · BOM · Routing · KP26</text>
            <path d="M350 155 L220 155" stroke="#1a1a1a" strokeWidth="2" fill="none" markerEnd="url(#arrow)" strokeDasharray="6 4"/>
            <text x="285" y="172" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono">Cost estimate (CK11N)</text>

            {/* Platform -> Databricks/MES/AgenticRFQ */}
            <path d="M550 130 L680 60"  stroke="#1a1a1a" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" strokeDasharray="4 4"/>
            <path d="M550 140 L680 140" stroke="#1a1a1a" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" strokeDasharray="4 4"/>
            <path d="M550 160 L680 220" stroke="#1a1a1a" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" strokeDasharray="4 4"/>

            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="#1a1a1a"/>
              </marker>
            </defs>
          </g>
        </svg>
      </div></div>

      <div className="two-col">
        <div className="card"><div className="card-head"><h3>Inputs from SAP</h3><span className="row-meta">read · scheduled refresh</span></div><div className="card-body">
          <table className="xtable">
            <thead><tr><th>Object</th><th>Last sync</th><th>Rows</th><th>Owner</th></tr></thead>
            <tbody>
              {S.inbound.map((o,i)=>(<tr key={o}><td className="label">{o}</td><td className="green">02.05.2026 14:{20+i}</td><td className="num">{[2481,5712,3140,612,820,21][i]}</td><td>{['Plant','Eng','Eng','Fin','Fin','Fin'][i]}</td></tr>))}
            </tbody>
          </table>
        </div></div>

        <div className="card"><div className="card-head"><h3>Outputs to SAP</h3><span className="row-meta">write · per approved version</span></div><div className="card-body">
          <table className="xtable">
            <thead><tr><th>Object</th><th>Trigger</th><th>Status</th></tr></thead>
            <tbody>
              {S.outbound.map((o,i)=>(<tr key={o}><td className="label">{o}</td><td>{['On V3 approval','On V3 approval','On Quote send'][i]}</td><td><span className="status-pill approved">live</span></td></tr>))}
            </tbody>
          </table>
          <div className="sketch-note" style={{marginTop:10}}>↗ Outbound runs idempotent; failed posts go to retry queue with audit.</div>
        </div></div>
      </div>
    </div>
  );
};

/* ====================================================================
   GOVERNANCE — Roles, Approvals, Audit
==================================================================== */
window.NW_Governance = function() {
  const N = window.NW_DATA;
  return (
    <div>
      <div className="card"><div className="card-head"><h3>Roles & responsibilities</h3></div><div className="card-body">
        <table className="xtable">
          <thead><tr><th>Role</th><th>Owner (sample)</th><th>Responsibility</th><th>Permissions</th></tr></thead>
          <tbody>
            {N.roles.map(r=>(<tr key={r.role}><td className="label" style={{background:r.color}}>{r.role}</td><td>{r.who}</td><td>{r.resp}</td><td style={{fontSize:13,fontFamily:'var(--font-mono)'}}>{r.perms}</td></tr>))}
          </tbody>
        </table>
      </div></div>

      <div className="two-col">
        <div className="card"><div className="card-head"><h3>Approval workflow</h3></div><div className="card-body">
          <svg viewBox="0 0 600 110" width="100%" height="110">
            {N.workflowStages.map((s,i)=>{
              const x = 10+i*98;
              return (<g key={s.k}>
                <rect x={x} y="30" width="90" height="48" fill="var(--paper-2)" stroke="#1a1a1a" strokeWidth="1.5" rx="6"/>
                <text x={x+45} y="50" textAnchor="middle" fontFamily="Caveat" fontSize="18" fontWeight="700">{s.title}</text>
                <text x={x+45} y="68" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono">{s.owner}</text>
                {i<N.workflowStages.length-1 && <text x={x+96} y="58" fontSize="20" fontFamily="Caveat">→</text>}
              </g>);
            })}
          </svg>
          <div className="sketch-note" style={{marginTop:6}}>Each stage gate: no skip · explicit approver · timestamped.</div>
        </div></div>

        <div className="card"><div className="card-head"><h3>Controls</h3></div><div className="card-body" style={{fontSize:15}}>
          <div style={{display:'flex',gap:8,alignItems:'baseline',marginBottom:8}}><span className="tag green">✓</span><b>Approval workflow</b> — stage gates above</div>
          <div style={{display:'flex',gap:8,alignItems:'baseline',marginBottom:8}}><span className="tag green">✓</span><b>Version control</b> — no overwrite, append-only</div>
          <div style={{display:'flex',gap:8,alignItems:'baseline',marginBottom:8}}><span className="tag green">✓</span><b>Audit trail</b> — every state change logged</div>
          <div style={{display:'flex',gap:8,alignItems:'baseline',marginBottom:8}}><span className="tag green">✓</span><b>Rate master ownership</b> — Plant role only</div>
          <div style={{display:'flex',gap:8,alignItems:'baseline',marginBottom:8}}><span className="tag blue">i</span><b>Segregation of duties</b> — Sales cannot Approve</div>
          <div style={{display:'flex',gap:8,alignItems:'baseline'}}><span className="tag blue">i</span><b>Single-sign-on</b> — group AAD; roles synced</div>
        </div></div>
      </div>

      <div className="card"><div className="card-head"><h3>Audit log · recent</h3><span className="row-meta">immutable · 7-yr retention</span></div><div className="card-body">
        <table className="xtable">
          <thead><tr><th style={{width:170}}>Timestamp</th><th>Actor</th><th>Action</th><th>Object</th></tr></thead>
          <tbody>{N.auditLog.map((l,i)=>(<tr key={i}><td className="label">{l.ts}</td><td>{l.actor}</td><td>{l.action}</td><td>{l.item}</td></tr>))}</tbody>
        </table>
      </div></div>
    </div>
  );
};

/* ====================================================================
   ARCHITECTURE & DATA MODEL & CONFIGURATION
==================================================================== */
window.NW_Architecture = function() {
  return (
    <div>
      <div className="card"><div className="card-head"><h3>System architecture</h3><span className="row-meta">Frontend · Backend · SAP integration</span></div><div className="card-body">
        <svg viewBox="0 0 900 420" width="100%" height="420" fontFamily="Kalam, sans-serif" fontSize="13">
          <defs>
            <marker id="arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#1a1a1a"/></marker>
          </defs>

          {/* Frontend tier */}
          <rect x="30" y="20" width="840" height="100" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="6 4" rx="8"/>
          <text x="50" y="40" fontFamily="JetBrains Mono" fontSize="11">FRONTEND · web app · role-based UI</text>
          {['Sales workspace','Eng workspace','Finance workspace','Plant master','Admin / PMO'].map((t,i)=>(
            <g key={t}><rect x={50+i*160} y={55} width="140" height="55" fill="#fff59d" stroke="#1a1a1a" strokeWidth="1.5" rx="6"/>
              <text x={120+i*160} y={88} textAnchor="middle" fontFamily="Caveat" fontSize="17" fontWeight="700">{t}</text></g>
          ))}

          {/* Backend tier */}
          <rect x="30" y="140" width="840" height="160" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="6 4" rx="8"/>
          <text x="50" y="160" fontFamily="JetBrains Mono" fontSize="11">BACKEND · APIs + estimation engine</text>
          {[
            ['Costing Engine','plant-aware\nmulti-process'],
            ['Rate Master Svc','per-plant rates'],
            ['Versioning Svc','no-overwrite'],
            ['Workflow Engine','stage gates'],
            ['Analytics Svc','warehouse feed'],
          ].map((t,i)=>(<g key={t[0]}>
            <rect x={50+i*160} y={175} width="140" height="100" fill="#bbdefb" stroke="#1a1a1a" strokeWidth="1.5" rx="6"/>
            <text x={120+i*160} y={210} textAnchor="middle" fontFamily="Caveat" fontSize="17" fontWeight="700">{t[0]}</text>
            <text x={120+i*160} y={232} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono">{t[1].split('\n')[0]}</text>
            <text x={120+i*160} y={248} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono">{t[1].split('\n')[1]||''}</text>
          </g>))}

          {/* Integration tier */}
          <rect x="30" y="320" width="840" height="90" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="6 4" rx="8"/>
          <text x="50" y="340" fontFamily="JetBrains Mono" fontSize="11">INTEGRATION · SAP + future</text>
          {[
            ['SAP S/4HANA','live'],
            ['MES (plants)','planned'],
            ['Databricks','planned'],
            ['AAD / SSO','live'],
            ['Agentic RFQ','pilot'],
          ].map((t,i)=>(<g key={t[0]}>
            <rect x={50+i*160} y={350} width="140" height="50" fill={t[1]==='live'?'#c8e6c9':t[1]==='pilot'?'#ce93d8':'#f3f1e8'} stroke="#1a1a1a" strokeWidth="1.5" rx="6"/>
            <text x={120+i*160} y={376} textAnchor="middle" fontFamily="Caveat" fontSize="17" fontWeight="700">{t[0]}</text>
            <text x={120+i*160} y={392} textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono">{t[1]}</text>
          </g>))}

          {/* vertical connectors */}
          {[0,1,2,3,4].map(i=><line key={i} x1={120+i*160} y1={110} x2={120+i*160} y2={175} stroke="#1a1a1a" strokeWidth="1.5" markerEnd="url(#arrow2)"/>)}
          {[0,1,2,3,4].map(i=><line key={'b'+i} x1={120+i*160} y1={275} x2={120+i*160} y2={350} stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow2)"/>)}
        </svg>
      </div></div>
    </div>
  );
};

window.NW_DataModel = function() {
  const entities = [
    { x:30,  y:30,  w:200, h:140, name:'Company', fields:['code (PK)','name','process','color'], color:'#fff59d' },
    { x:30,  y:200, w:200, h:160, name:'Plant',   fields:['code (PK)','company_id (FK)','currency','timezone'], color:'#bbdefb' },
    { x:280, y:30,  w:200, h:160, name:'Product (MM)', fields:['matnr (PK)','desc','alloy','grade','net_wt'], color:'#c8e6c9' },
    { x:280, y:220, w:200, h:170, name:'BOM',     fields:['bom_id (PK)','matnr (FK)','version','components[]'], color:'#c8e6c9' },
    { x:530, y:30,  w:200, h:170, name:'Routing', fields:['route_id (PK)','matnr (FK)','plant (FK)','operations[]'], color:'#c8e6c9' },
    { x:530, y:220, w:200, h:170, name:'Rate Master', fields:['plant (FK)','element','rate','currency','valid_from'], color:'#ffcc80' },
    { x:780, y:30,  w:200, h:170, name:'Estimation', fields:['est_id (PK)','matnr','plant','company','status'], color:'#ce93d8' },
    { x:780, y:220, w:200, h:200, name:'Version', fields:['ver_id (PK)','est_id (FK)','label (RFQ/Neg/Final)','price','approver','timestamp'], color:'#ce93d8' },
  ];
  const arrows = [
    [130,170,130,200],   // Company -> Plant
    [380,190,380,220],   // Product -> BOM
    [480,90,530,90],     // Product -> Routing
    [230,90,280,90],     // Company -> Product
    [630,200,630,220],   // Routing -> Rate Master? -- no, but illustrate
    [730,90,780,90],     // Routing -> Estimation
    [780,310,730,310],   // Version -> Rate Master
    [880,200,880,220],   // Estimation -> Version
  ];
  return (
    <div>
      <div className="card"><div className="card-head"><h3>Logical data model</h3><span className="row-meta">core entities · group-wide</span></div><div className="card-body" style={{overflowX:'auto'}}>
        <svg viewBox="0 0 1020 440" width="100%" height="440" fontFamily="Kalam, sans-serif">
          <defs><marker id="arrow3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#1a1a1a"/></marker></defs>
          {entities.map(e=>(<g key={e.name}>
            <rect x={e.x} y={e.y} width={e.w} height={e.h} fill={e.color} stroke="#1a1a1a" strokeWidth="2" rx="6"/>
            <text x={e.x+e.w/2} y={e.y+24} textAnchor="middle" fontFamily="Caveat" fontSize="22" fontWeight="700">{e.name}</text>
            <line x1={e.x+10} y1={e.y+32} x2={e.x+e.w-10} y2={e.y+32} stroke="#1a1a1a" strokeWidth="1"/>
            {e.fields.map((f,i)=>(<text key={f} x={e.x+14} y={e.y+50+i*18} fontSize="13" fontFamily="JetBrains Mono">{f}</text>))}
          </g>))}
          {arrows.map((a,i)=><line key={i} x1={a[0]} y1={a[1]} x2={a[2]} y2={a[3]} stroke="#1a1a1a" strokeWidth="1.5" markerEnd="url(#arrow3)"/>)}
        </svg>
      </div></div>

      <div className="sketch-note">Note: <b>(plant, product, version)</b> is the cost record's natural key — drives plant-wise costing requirement.</div>
    </div>
  );
};

window.NW_Configuration = function() {
  const [tab,setTab] = useS('plants');
  const tabs = [['plants','Plants'],['processes','Processes'],['logic','Costing logic'],['rates','Rate masters']];
  const N = window.NW_DATA;
  return (
    <div>
      <div className="toolbar"><span className="sketch-note">⚙ No-code config · changes audit-logged · effective dated</span></div>
      <div className="module-tabs">{tabs.map(([k,l])=><div key={k} className={`module-tab ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</div>)}</div>

      {tab==='plants' && (
        <div className="card"><div className="card-head"><h3>Plants</h3><span className="row-meta">add new plants without redeploy</span></div><div className="card-body">
          <table className="xtable">
            <thead><tr><th>Plant</th><th>Company</th><th>Currency</th><th className="num">Yield %</th><th className="num">Scrap %</th><th className="num">Power ₹/kWh</th><th></th></tr></thead>
            <tbody>{Object.entries(N.plants).map(([p,r])=>(<tr key={p}><td className="label">{p}</td><td><CompanyTag code={r.co}/></td><td>{r.ccy}</td><td className="yellow num">{(r.yld*100).toFixed(0)}</td><td className="yellow num">{(r.scr*100).toFixed(0)}</td><td className="yellow num">{r.pwr}</td><td><button className="btn sm">Edit</button></td></tr>))}</tbody>
          </table>
          <button className="btn primary" style={{marginTop:10}}>+ Add plant</button>
        </div></div>
      )}
      {tab==='processes' && (
        <div className="card"><div className="card-head"><h3>Process catalog</h3><span className="row-meta">stages per process · drag to reorder</span></div><div className="card-body">
          {N.processes.map(p=>(<div key={p.code} style={{marginBottom:12,border:'1.5px dashed var(--ink)',borderRadius:6,padding:10}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}><b style={{fontFamily:'var(--font-hand-bold)',fontSize:18}}>{p.name}</b><span className="tag">{p.code}</span><button className="btn sm" style={{marginLeft:'auto'}}>Edit</button></div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>{p.stages.map((s,i)=>(<span key={i} style={{padding:'3px 10px',border:'1.5px solid var(--ink)',borderRadius:14,background:'var(--paper-2)',fontSize:13}}>{i+1}. {s}</span>))}</div>
          </div>))}
          <button className="btn primary">+ Add process</button>
        </div></div>
      )}
      {tab==='logic' && (
        <div className="card"><div className="card-head"><h3>Costing logic editor</h3><span className="row-meta">formula library · no code</span></div><div className="card-body">
          <table className="xtable">
            <thead><tr><th>Line</th><th>Formula</th><th>Inputs</th></tr></thead>
            <tbody>
              <tr><td className="label">Raw material</td><td className="blue">net_wt / yield × alloy_price + melting_loss_value</td><td>net_wt · yield · alloy_price</td></tr>
              <tr><td className="label">Labour</td><td className="blue">labour_rate × cycle_min / 60</td><td>plant.labour_rate · routing.cycle</td></tr>
              <tr><td className="label">Machine</td><td className="blue">Σ(machine_rate × cycle) for each op</td><td>plant.machine_rates · routing.ops</td></tr>
              <tr><td className="label">Energy</td><td className="blue">power_rate × kWh + fuel_rate</td><td>plant.power · plant.fuel</td></tr>
              <tr><td className="label">Scrap</td><td className="blue">(cost_so_far) × scrap_pct / (1 − scrap_pct)</td><td>plant.scrap_pct</td></tr>
            </tbody>
          </table>
          <div className="sketch-note" style={{marginTop:10}}>Each line maintainable by Finance · versioned · effective-dated.</div>
        </div></div>
      )}
      {tab==='rates' && (
        <div className="card"><div className="card-head"><h3>Rate master ownership</h3></div><div className="card-body">
          <table className="xtable">
            <thead><tr><th>Master</th><th>Owner (role)</th><th>Update freq</th><th>Source</th></tr></thead>
            <tbody>
              <tr><td className="label">Alloy prices</td><td>Finance</td><td>Weekly</td><td>SAP MM</td></tr>
              <tr><td className="label">Power tariff</td><td>Plant</td><td>Monthly</td><td>Manual</td></tr>
              <tr><td className="label">Labour rate</td><td>Plant</td><td>Yearly</td><td>HR</td></tr>
              <tr><td className="label">Machine rate</td><td>Plant</td><td>Half-yearly</td><td>SAP KP26</td></tr>
              <tr><td className="label">Exchange rate</td><td>Finance</td><td>Daily</td><td>RBI feed</td></tr>
            </tbody>
          </table>
        </div></div>
      )}
    </div>
  );
};
